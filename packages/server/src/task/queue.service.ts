import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, QueueScheduler, Job } from 'bullmq';
import IORedis from 'ioredis';
import { TaskBody } from 'tinyrag-types/task';
import getEnvConfigValue from 'src/util/getEnvConfigValue';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private connection: IORedis | null = null;
  private queue: Queue | null = null;
  private scheduler: QueueScheduler | null = null;
  private worker: Worker | null = null;
  private queueName = process.env.TASK_QUEUE_NAME || 'tasks';

  // In-memory fallback
  private useInMemory = false;
  private inMemoryQueue: Array<{
    id: string;
    data: TaskBody;
    attempts: number;
    backoff: number;
    tries: number;
  }> = [];
  private inMemoryWorkers: Array<Promise<void>> = [];
  private inMemoryRunning = false;

  private redisUrl = '';

  constructor(private readonly configService: ConfigService) {
    this.redisUrl = getEnvConfigValue('REDIS_URL');
  }

  async init() {
    if (this.connection || this.useInMemory) return;
    const redisUrl = this.redisUrl;
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not set — using in-memory queue fallback');
      this.useInMemory = true;
      return;
    }

    const useQueueType = getEnvConfigValue('TASK_QUEUE_TYPE');
    this.logger.log(`Connecting to Redis: ${redisUrl}`);
    try {
      if (useQueueType === 'memory') {
        throw new Error('0');
      }
      this.connection = new IORedis(redisUrl);
      this.queue = new Queue(this.queueName, { connection: this.connection });
      // scheduler helps with stalled jobs / retries
      this.scheduler = new QueueScheduler(this.queueName, {
        connection: this.connection,
      });
      // waitUntilReady is the correct API on QueueScheduler
      // types guarantee this exists when using the class from bullmq
      // but keep it guarded in case of runtime differences
      await this.scheduler.waitUntilReady();
    } catch (err) {
      if ((err as Error).message === '0') {
        this.logger.warn('Use memory queue.');
      } else {
        this.logger.warn(
          'Failed to connect to Redis, falling back to in-memory queue',
          err as any,
        );
      }
      this.useInMemory = true;
      // close partial connection if any
      if (this.connection) {
        try {
          await this.connection.quit();
        } catch (_) {}
        this.connection = null;
      }
      this.queue = null;
      this.scheduler = null;
    }
  }

  async getTaskStatus() {
    if (this.useInMemory) {
      const total = this.inMemoryQueue.length;
      const waiting = this.inMemoryQueue.length;
      const active = this.inMemoryWorkers.length;
      const completed = 0; // not tracked in in-memory mode
      const failed = 0;
      return {
        total,
        waiting,
        active,
        completed,
        failed,
      };
    }

    const total = await this.queue?.getJobCounts();
    const waiting = await this.queue?.getWaitingCount();
    const active = await this.queue?.getActiveCount();
    const completed = await this.queue?.getCompletedCount();
    const failed = await this.queue?.getFailedCount();
    return {
      total,
      waiting,
      active,
      completed,
      failed,
    };
  }

  async getTaskStatusById(id: string) {
    if (this.useInMemory) {
      const job = this.inMemoryQueue.find((j) => j.id === id);
      if (!job) return null;
      return {
        id: job.id,
        data: job.data,
        attempts: job.attempts,
        tries: job.tries,
        backoff: job.backoff,
        status: job.tries >= job.attempts ? 'failed' : 'waiting',
      };
    }

    const job = await this.queue?.getJob(id);
    if (!job) return null;
    return {
      id: job.id,
      data: job.data as TaskBody,
      status: job.finishedOn
        ? 'completed'
        : job.failedReason
          ? 'failed'
          : job.processedOn
            ? 'active'
            : 'waiting',
      tries: job.attemptsMade,
    };
  }

  /**
   * Add a new task to the queue. This will return immediately and the task will
   * be processed by a worker.
   */
  // opts can include jobId, attempts, and backoff
  // jobId is used to deduplicate tasks
  // attempts is the number of retries allowed
  // backoff is the delay before retrying a failed task

  async addTask(
    data: TaskBody,
    opts?: { jobId?: string; attempts?: number; backoff?: number },
  ) {
    await this.init();
    const attempts = opts?.attempts ?? 3;
    const backoff = opts?.backoff ?? 5000;

    if (this.useInMemory) {
      // bounded in-memory queue
      const maxSize = parseInt(
        getEnvConfigValue('IN_MEMORY_MAX_QUEUE_SIZE'),
        10,
      );
      if (this.inMemoryQueue.length >= maxSize) {
        // Backpressure: reject immediately to avoid unbounded memory growth
        throw new Error('In-memory task queue full');
      }
      const id =
        opts?.jobId ||
        `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      this.inMemoryQueue.push({ id, data, attempts, backoff, tries: 0 });
      return { id };
    }

    if (!this.queue) throw new Error('Queue not initialized');
    const jobId = opts?.jobId || undefined;
    return this.queue.add(this.queueName, data as any, {
      jobId,
      attempts,
      backoff: { type: 'fixed', delay: backoff },
      removeOnComplete: 1000,
      removeOnFail: 1000,
    });
  }

  /**
   * Register a processor function. The processor receives a TaskBody and may
   * return/throw. This will create a Worker connected to Redis so multiple
   * app instances can share the work (distributed).
   */
  async registerProcessor(
    processor: (task: TaskBody, job?: Job) => Promise<any>,
    concurrency?: number,
  ) {
    await this.init();

    const confConcurrency =
      concurrency ?? parseInt(getEnvConfigValue('TASK_WORKER_CONCURRENCY'), 10);

    if (this.useInMemory) {
      // start in-memory worker loops
      if (this.inMemoryRunning) return;
      this.inMemoryRunning = true;
      const workerCount = confConcurrency;
      this.logger.log(
        `Starting in-memory workers (worker_count=${workerCount})`,
      );
      for (let i = 0; i < workerCount; i++) {
        const loop = this.startInMemoryWorker(processor, i);
        this.inMemoryWorkers.push(loop);
      }
      return;
    }

    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }

    this.worker = new Worker(
      this.queueName,
      async (job: Job) => {
        try {
          const data = job.data as TaskBody;
          return await processor(data, job);
        } catch (err) {
          this.logger.error('Job failed', err as any);
          throw err;
        }
      },
      { connection: this.connection!, concurrency: confConcurrency },
    );

    this.worker.on('error', (err) => this.logger.error('Worker error', err));
    this.worker.on('failed', (job, err) =>
      this.logger.warn(`Job ${job.id} failed: ${err}`),
    );
    this.worker.on('completed', (job) =>
      this.logger.log(`Job ${job.id} completed`),
    );

    this.logger.log(`Worker started (concurrency=${confConcurrency})`);
  }

  private async startInMemoryWorker(
    processor: (task: TaskBody, job?: Job) => Promise<any>,
    idx: number,
  ) {
    const pollInterval = parseInt(process.env.IN_MEMORY_POLL_MS || '100', 10);
    while (this.inMemoryRunning) {
      const job = this.inMemoryQueue.shift();
      if (!job) {
        // no job — sleep/poll
        await new Promise((r) => setTimeout(r, pollInterval));
        continue;
      }

      try {
        await processor(job.data as TaskBody, job as unknown as Job);
      } catch (err) {
        job.tries = (job.tries || 0) + 1;
        if (job.tries < job.attempts) {
          // simple fixed backoff requeue
          const backoff = job.backoff || 5000;
          setTimeout(() => {
            this.inMemoryQueue.push(job);
          }, backoff);
        } else {
          this.logger.warn(`In-memory job ${job.id} failed permanently`);
        }
      }
    }
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }
    if (this.queue) {
      await this.queue.close();
      this.queue = null;
    }
    if (this.scheduler) {
      await this.scheduler.close();
      this.scheduler = null;
    }
    if (this.connection) {
      await this.connection.quit();
      this.connection = null;
    }

    // stop in-memory workers
    if (this.inMemoryRunning) {
      this.inMemoryRunning = false;
      // wait for workers to finish
      try {
        await Promise.all(this.inMemoryWorkers);
      } catch (_) {}
      this.inMemoryWorkers = [];
    }
  }
}
