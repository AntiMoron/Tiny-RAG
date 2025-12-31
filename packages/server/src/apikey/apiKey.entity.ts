import getCurrentTime from 'src/util/sqlDb/currentTime';
import { getDateType } from 'src/util/sqlDb/getDateType';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('apikey')
export class ApiKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 300, nullable: true, default: '' })
  description: string;

  @Column({ length: 280 })
  key: string;

  @CreateDateColumn({
    type: getDateType(),
    default: () => getCurrentTime(),
  })
  createdAt: Date;
}
