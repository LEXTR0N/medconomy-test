import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Audit, OperationType } from './audit.entity';
import { AuditRepository } from './audit.repository';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(Audit)
    private readonly auditRepository: AuditRepository,
    private readonly em: EntityManager
  ) {}

  async logActivity(
    entityType: string,
    entityId: string,
    operationType: OperationType,
    oldData: Record<string, any>,
    userId?: string
  ): Promise<Audit> {
    const audit = this.auditRepository.create({
      entityType,
      entityId,
      operationType,
      oldData,
      userId: userId || null,
    });

    await this.em.persistAndFlush(audit);
    return audit;
  }

  async getAuditLogsForEntity(entityType: string, entityId: string): Promise<Audit[]> {
    return this.auditRepository.find(
      { entityType, entityId },
      { orderBy: { timestamp: 'DESC' } }
    );
  }

  async getAllAuditLogs(): Promise<Audit[]> {
    return this.auditRepository.findAll({ orderBy: { timestamp: 'DESC' } });
  }
}