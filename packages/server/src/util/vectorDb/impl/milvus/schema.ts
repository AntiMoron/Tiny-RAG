import { FieldType, DataType } from '@zilliz/milvus2-sdk-node';

export default function getMilvusCollectionSchema(
  dim: number,
): (FieldType & { isIndex?: boolean })[] {
  const schema: (FieldType & { isIndex?: boolean })[] = [
    {
      name: 'chunk_id',
      description: 'chunk id field',
      data_type: DataType.VarChar,
      is_primary_key: true,
      type_params: { max_length: '50' },
      isIndex: true,
    },
    {
      name: 'vector',
      description: 'Vector field',
      data_type: DataType.FloatVector,
      dim,
      isIndex: true,
    },
    {
      name: 'knowledge_id',
      description: 'knowledge id field',
      data_type: DataType.VarChar,
      type_params: { max_length: '50' },
      isIndex: true,
    },
    {
      name: 'dataset_id',
      description: 'dataset id field',
      data_type: DataType.VarChar,
      is_partition_key: true,
      type_params: { max_length: '50' },
      isIndex: true,
    },
  ];
  return schema;
}
