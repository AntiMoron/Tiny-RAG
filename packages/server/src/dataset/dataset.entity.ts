import getCurrentTime from 'src/util/sqlDb/currentTime';
import { getDateType } from 'src/util/sqlDb/getDateType';
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
    type: getDateType(),
    precision: 0,
    default: () => getCurrentTime(0),
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: getDateType(),
    precision: 0,
    default: () => getCurrentTime(0),
    onUpdate: getCurrentTime(0),
  })
  updatedAt: Date;
}
