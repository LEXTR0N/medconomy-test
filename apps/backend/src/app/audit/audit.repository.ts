import { EntityRepository } from '@mikro-orm/postgresql';
import { Audit } from './audit.entity';

export class AuditRepository extends EntityRepository<Audit> {}