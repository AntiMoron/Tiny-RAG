import { FieldType, DataType } from '@zilliz/milvus2-sdk-node';

const dim = 128;
const schema: FieldType[] = [
  {
    name: 'knowledge_id',
    description: 'int64 field',
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: 'vector',
    description: 'Vector field',
    data_type: DataType.FloatVector,
    dim,
  },
  { name: 'dataset_id', description: 'int64 field', data_type: DataType.Int64 },
];

export default schema;
