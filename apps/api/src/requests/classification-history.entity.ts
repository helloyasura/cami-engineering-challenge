import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type ClassificationHistoryCategory = 'support' | 'sales' | 'billing' | 'unknown';

@Entity({ name: 'classification_history' })
export class ClassificationHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar', length: 32 })
  category!: ClassificationHistoryCategory;

  @Column({ type: 'float' })
  confidence!: number;

  @Column({ name: 'request_id', type: 'uuid', nullable: true })
  requestId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
