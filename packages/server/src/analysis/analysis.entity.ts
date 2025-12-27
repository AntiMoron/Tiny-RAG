import getCurrentTime from 'src/util/sqlDb/currentTime';
import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('analysis')
export class LogEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  input_token_count: number;

  @Column()
  output_token_count: number;

  @Column({ length: 50 })
  providerId: string;

  @CreateDateColumn({
    type: 'datetime',
    default: () => getCurrentTime(),
  })
  createdAt: Date;
}
