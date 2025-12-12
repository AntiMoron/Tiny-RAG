import MilvusVectorDB from './impl/milvus';
import VectorDBInterface from './interface';

type VectorDBConstructor = {
  new (): VectorDBInterface;
  type: string;
};

const types: VectorDBConstructor[] = [MilvusVectorDB];

export default function createVectorDbClient(type: string): VectorDBInterface {
  const VectorDBClass = types.find((cls) => cls.type === type);
  if (!VectorDBClass) {
    throw new Error(`Unsupported vector DB type: ${type}`);
  }
  return new VectorDBClass();
}
