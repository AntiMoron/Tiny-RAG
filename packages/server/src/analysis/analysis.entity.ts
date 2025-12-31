import getCurrentTime from 'src/util/sqlDb/currentTime';
import { getDateType } from 'src/util/sqlDb/getDateType';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('analysis')
export class LogEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  input_token_count: number;

  @Column({ length: 50, nullable: true, default: 'unknown' })
  model: string;

  @Column({ length: 50, nullable: true, default: 'unknown' })
  reason: string;

  @Column()
  output_token_count: number;

  @Column({ length: 50 })
  providerId: string;

  @CreateDateColumn({
    type: getDateType(),
    default: () => getCurrentTime(),
  })
  createdAt: Date;

  @Column({
    nullable: true,
    default: 0,
  })
  response_time: number;
}
