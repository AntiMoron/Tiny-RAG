import { promises as fs } from 'fs';
import path from 'path';
import { ChunkIndex } from 'tinyrag-types/chunk';
import { Dataset } from 'tinyrag-types/dataset';
import VectorDBBase, { VectorDBType } from '../../interface';
import getEnvConfigValue from 'src/util/getEnvConfigValue';
import { WinstonLogger } from 'nest-winston';

type LocalEntry = {
  dataset_id: string;
  knowledge_id: string;
  chunk_id: string;
  vector: number[];
};

export default class LocalVectorDB implements VectorDBBase {
  private _ready = false;
  static type = VectorDBType.LOCAL_VECTOR;

  // in-memory cache per collection name
  private cache = new Map<string, LocalEntry[]>();
  private baseDir: string;

  constructor() {
    this.baseDir =
      getEnvConfigValue('LOCAL_VECTOR_PATH') ||
      path.resolve(process.cwd(), 'data', 'local-vector');
  }

  private collectionFile(name: string) {
    return path.join(this.baseDir, `${name}.json`);
  }

  async init(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      this._ready = true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        'LocalVectorDB init failed:',
        (err as Error)?.message || err,
      );
      this._ready = false;
    }
  }

  async destroy(): Promise<void> {
    this._ready = false;
    this.cache.clear();
  }

  get ready(): boolean {
    return this._ready;
  }

  getCollectionNameForEmbeddingAIProvider(aiProviderId: string): string {
    const BASE =
      getEnvConfigValue('LOCAL_VECTOR_COLLECTION_PREFIX') || 'chunks';
    return `${BASE}_${aiProviderId.replace(/-/g, '_')}`;
  }

  private async loadCollectionIfNeeded(name: string): Promise<LocalEntry[]> {
    if (this.cache.has(name)) return this.cache.get(name)!;
    const file = this.collectionFile(name);
    try {
      const txt = await fs.readFile(file, 'utf8');
      const data = JSON.parse(txt) as LocalEntry[];
      this.cache.set(name, data);
      return data;
    } catch (err) {
      // file not found -> initialize empty
      const empty: LocalEntry[] = [];
      this.cache.set(name, empty);
      return empty;
    }
  }

  private async persistCollection(name: string): Promise<void> {
    const file = this.collectionFile(name);
    const tmp = `${file}.tmp`;
    const data = this.cache.get(name) ?? [];
    await fs.writeFile(tmp, JSON.stringify(data), 'utf8');
    await fs.rename(tmp, file);
  }

  // cosine similarity
  private scoreVec(a: number[], b: number[]) {
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < a.length; i++) {
      const va = a[i] ?? 0;
      const vb = b[i] ?? 0;
      dot += va * vb;
      na += va * va;
      nb += vb * vb;
    }
    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  async search(
    logger: WinstonLogger,
    params: { data: number[]; dataset: Dataset; limit: number },
  ): Promise<(ChunkIndex & { score: number })[]> {
    if (!this.ready) throw new Error('LocalVectorDB not ready');
    const { data: targetVector, dataset, limit } = params;
    const colName = this.getCollectionNameForEmbeddingAIProvider(
      dataset.embededByProviderId,
    );
    const items = await this.loadCollectionIfNeeded(colName);

    const filtered = items.filter((it) => it.dataset_id === dataset.id);
    const scored = filtered.map((it) => ({
      dataset_id: it.dataset_id,
      knowledge_id: it.knowledge_id,
      chunk_id: it.chunk_id,
      vector: it.vector,
      score: this.scoreVec(it.vector, targetVector),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit) as (ChunkIndex & { score: number })[];
  }

  async insert(
    logger: WinstonLogger,
    params: {
      dataset: Dataset;
      embeddingDim: number;
      fieldsData: ChunkIndex[];
    },
  ): Promise<void> {
    if (!this.ready) throw new Error('LocalVectorDB not ready');
    const { fieldsData, dataset } = params;
    const colName = this.getCollectionNameForEmbeddingAIProvider(
      dataset.embededByProviderId,
    );
    const items = await this.loadCollectionIfNeeded(colName);

    for (const f of fieldsData) {
      const entry: LocalEntry = {
        dataset_id: dataset.id,
        knowledge_id: f.knowledge_id,
        chunk_id: f.chunk_id,
        vector: f.vector,
      };
      items.push(entry);
    }

    this.cache.set(colName, items);
    await this.persistCollection(colName);
  }

  async deleteEntities(
    logger: WinstonLogger,
    filter: { dataset: Dataset; knowledgeId?: string; chunkIds?: string[] },
  ): Promise<void> {
    const { dataset, knowledgeId, chunkIds } = filter;
    if (!dataset) throw new Error('删除实体失败：dataset 参数不能为空');
    if (!knowledgeId && (!chunkIds || chunkIds.length === 0))
      throw new Error(
        '删除实体失败：必须提供 knowledgeId 或 chunkIds 作为删除条件',
      );
    if (!this.ready) throw new Error('LocalVectorDB not ready');

    const colName = this.getCollectionNameForEmbeddingAIProvider(
      dataset.embededByProviderId,
    );
    const items = await this.loadCollectionIfNeeded(colName);

    const remaining = items.filter((it) => {
      if (it.dataset_id !== dataset.id) return true; // keep different dataset
      if (knowledgeId && it.knowledge_id === knowledgeId) return false; // drop
      if (chunkIds && chunkIds.includes(it.chunk_id)) return false;
      return true;
    });

    this.cache.set(colName, remaining);
    await this.persistCollection(colName);
  }
}
