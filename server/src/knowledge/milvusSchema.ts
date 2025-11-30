import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

const dim = 128;
const schema = [
  {
    name: 'vector',
    description: 'Vector field',
    data_type: DataType.FloatVector,
    dim,
  },
  { name: 'knowledge_id', description: 'int64 field', data_type: DataType.Int64 },
  { name: 'dataset_id', description: 'int64 field', data_type: DataType.Int64 },
];

export default schema;