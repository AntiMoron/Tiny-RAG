import getCurrentTime from 'src/util/sqlDb/currentTime';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Database entity for AI providers
@Entity('ai_providers')
export class AIProviderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 30, default: 'completion' })
  type: string;

  // store provider config as JSON
  @Column({ type: 'text' })
  config: string;

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

  @Column({ length: 30, nullable: true })
  lastTestStatus: string;

  @Column({ type: 'int', nullable: true })
  dim?: number;
}
