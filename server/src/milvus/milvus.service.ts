import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import knowledgeIndexSchema from './schemas/knowledgeSchema';

@Injectable()
export class MilvusService {
  private ready = false;
  private milvusClient: MilvusClient;

  constructor(private readonly configService: ConfigService) {
    const COLLECTION_NAME =
      this.configService.get<string>('COLLECTION_NAME') || 'knowledges';
    const COLLECTION_ADDR =
      this.configService.get<string>('MILVUS_ADDR') || 'localhost:19530';
    const COLLECTION_USER_NAME =
      this.configService.get<string>('MILVUS_COLLECTION_USER_NAME') || '';
    const COLLECTION_PASSWORD =
      this.configService.get<string>('MILVUS_COLLECTION_PASSWORD') || '';

    // build client
    this.milvusClient = new MilvusClient({
      address: COLLECTION_ADDR,
      username: COLLECTION_USER_NAME,
      password: COLLECTION_PASSWORD,
    });

    const init = async () => {
      await this.milvusClient.connectPromise;
      const { value: hasCreated } = await this.milvusClient.hasCollection({
        collection_name: COLLECTION_NAME,
      });
      if (!hasCreated) {
        // load collection
        await this.milvusClient
          .createCollection({
            collection_name: COLLECTION_NAME,
            fields: knowledgeIndexSchema,
          })
          .then((create) => {
            console.log('Create collection is finished.', create);
          });
        await this.milvusClient.loadCollectionSync({
          collection_name: COLLECTION_NAME,
        });
      }
      this.ready = true;
      console.log('Node client is initialized.');
    };
    init();
  }

  get client(): MilvusClient | undefined {
    if (this.ready) {
      return this.milvusClient;
    }
    return undefined;
  }
}
