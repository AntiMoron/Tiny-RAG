import { FieldType, DataType } from '@zilliz/milvus2-sdk-node';

const dim = 128;
const schema: FieldType[] = [
  {
    name: 'chunk_id',
    description: 'int64 field',
    data_type: DataType.VarChar,
    is_primary_key: true,
    type_params: { max_length: 50 },
  },
  {
    name: 'vector',
    description: 'Vector field',
    data_type: DataType.FloatVector,
    dim,
  },
  {
    name: 'knowledge_id',
    description: 'int64 field',
    data_type: DataType.VarChar,
    type_params: { max_length: 50 },
  },
  {
    name: 'dataset_id',
    description: 'int64 field',
    data_type: DataType.VarChar,
    type_params: { max_length: 50 },
  },
];

export default schema;
