import getCurrentTime from 'src/util/sqlDb/currentTime';
import { type DatasetConfig } from 'tinyrag-types/dataset';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('dataset')
export class DatasetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 300, nullable: true, default: '' })
  description: string;

  @Column({ length: 20, default: 'text' })
  type: string;

  @Column({ type: 'text', nullable: true })
  config?: string;

  @Column({ length: 50 })
  embededByProviderId: string;

  @Column({ length: 50, default: '' })
  completeByProviderId: string;

  @CreateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => getCurrentTime(),
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => getCurrentTime(),
    onUpdate: getCurrentTime(),
  })
  updatedAt: Date;
}
