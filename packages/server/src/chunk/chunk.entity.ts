import getCurrentTime from 'src/util/sqlDb/currentTime';
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

  @Column({ length: 50 })
  dataset_id: string;

  @Column({ length: 50 })
  embededByProviderId: string;

  @Column('text')
  content: string;

  @CreateDateColumn({
    type: 'datetime',
    default: () => getCurrentTime(),
  })
  createdAt: Date;

  @Column({ length: 10 })
  indexStatus: string;
}
