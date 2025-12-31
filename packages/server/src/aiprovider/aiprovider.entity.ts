import getCurrentTime from 'src/util/sqlDb/currentTime';
import { getDateType } from 'src/util/sqlDb/getDateType';
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
    type: getDateType(),
    precision: 0,
    default: () => getCurrentTime(0),
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: getDateType(),
    default: () => getCurrentTime(0),
    onUpdate: getCurrentTime(0),
  })
  updatedAt: Date;

  @Column({ length: 30, nullable: true })
  lastTestStatus: string;

  @Column({ type: 'int', nullable: true })
  dim?: number;
}
