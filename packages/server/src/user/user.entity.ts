import getCurrentTime from 'src/util/sqlDb/currentTime';
import { getDateType } from 'src/util/sqlDb/getDateType';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  username: string;

  @Column({ length: 200 })
  encrypt_pwd: string;

  @CreateDateColumn({
    type: getDateType(),
    default: () => getCurrentTime(0),
    precision: 0,
  })
  createdAt: Date;
}
