import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('chunk')
export class ChunkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  knowledge_id: string;

  @Column()
  dataset_id: string;

  @Column({ length: 50 })
  embededByProviderId: string;

  @Column('text')
  content: string;

  @CreateDateColumn({
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createdAt: Date;

  @Column({ length: 10 })
  indexStatus: string;
}
