import getCurrentTime from 'src/util/sqlDb/currentTime';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Database entity for AI providers
@Entity('knowledge')
export class KnowledgeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  // store provider config as JSON
  @Column({ length: 50 })
  dataset_id: string;

  @CreateDateColumn({
    type: 'datetime',
    default: () => getCurrentTime(),
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
    default: () => getCurrentTime(),
    onUpdate: getCurrentTime(),
  })
  updatedAt: Date;

  @Column({ length: 50, nullable: true })
  externalId: string;

  @Column({ length: 10, nullable: true })
  indexStatus: string;
}
