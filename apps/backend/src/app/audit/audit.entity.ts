import { BaseEntity, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { AuditRepository } from './audit.repository';

export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE';

@Entity({ repository: () => AuditRepository })
export class Audit extends BaseEntity {
  @PrimaryKey()
  id: string = v4();

  @Property()
  entityType: string;

  @Property()
  entityId: string;

  @Property()
  operationType: OperationType;

  @Property()
  timestamp: Date = new Date();

  @Property({ type: 'json' })
  oldData: Record<string, any> = {};

  @Property({ nullable: true })
  userId: string | null = null;
}