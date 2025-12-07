import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import knowledgeIndexSchema from './schemas/knowledgeSchema';
import getEnvConfigValue from 'src/util/getEnvConfigValue';

@Injectable()
export class MilvusService {
  private ready = false;
  private milvusClient: MilvusClient;

  constructor(private readonly configService: ConfigService) {
    const COLLECTION_NAME = getEnvConfigValue('MILVUS_CHUNK_COLLECTION_NAME');
    const COLLECTION_ADDR = getEnvConfigValue('MILVUS_ADDR');
    const COLLECTION_USER_NAME = getEnvConfigValue(
      'MILVUS_COLLECTION_USER_NAME',
    );
    const COLLECTION_PASSWORD = getEnvConfigValue('MILVUS_COLLECTION_PASSWORD');

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
