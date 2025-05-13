import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { CompanyService } from '../company/company.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    private readonly companyService: CompanyService,
    private readonly auditService: AuditService,
    private readonly em: EntityManager
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll({ populate: ['company'] });
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne(id, { populate: ['company', 'relatedCoworkers'] });
  }

  async create(userData: Partial<User> & { companyId?: string }): Promise<User> {
    console.log('Processing user data in service:', JSON.stringify(userData, null, 2));
    
    const { companyId, ...userDataWithoutCompany } = userData;
    console.log('User data without company:', JSON.stringify(userDataWithoutCompany, null, 2));
    console.log('Company ID:', companyId);
    
    const user = this.userRepository.create(userDataWithoutCompany);
    
    if (companyId) {
      console.log('Looking up company with ID:', companyId);
      const company = await this.companyService.findOne(companyId);
      console.log('Found company:', company ? JSON.stringify(company, null, 2) : 'null');
      if (company) {
        user.company = company;
      }
    }
    
    try {
      console.log('Attempting to persist user:', JSON.stringify(user, null, 2));
      await this.em.persistAndFlush(user);
      console.log('User successfully persisted with ID:', user.id);
      await this.auditService.logActivity('User', user.id, 'CREATE', {});
      return user;
    } catch (error) {
      console.error('Error persisting user:', error);
      throw error;
    }
  }

  async update(id: string, userData: Partial<User> & { companyId?: string }): Promise<User | null> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      return null;
    }

    const { companyId, ...userDataWithoutCompany } = userData;
    const oldData = { ...user };
    
    this.em.assign(user, userDataWithoutCompany);
    
    if (companyId) {
      const company = await this.companyService.findOne(companyId);
      if (company) {
        user.company = company;
      }
    }
    
    await this.em.flush();
    await this.auditService.logActivity('User', user.id, 'UPDATE', oldData);
    
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      return false;
    }

    const oldData = { ...user };
    await this.em.removeAndFlush(user);
    await this.auditService.logActivity('User', id, 'DELETE', oldData);
    
    return true;
  }

  async addRelatedCoworker(userId: string, coworkerId: string): Promise<User | null> {
    const user = await this.userRepository.findOne(userId, { populate: ['relatedCoworkers'] });
    const coworker = await this.userRepository.findOne(coworkerId);
    
    if (!user || !coworker) {
      return null;
    }
    
    user.relatedCoworkers.add(coworker);
    await this.em.flush();
    
    return user;
  }

  async removeRelatedCoworker(userId: string, coworkerId: string): Promise<User | null> {
    const user = await this.userRepository.findOne(userId, { populate: ['relatedCoworkers'] });
    
    if (!user) {
      return null;
    }
    
    const coworker = user.relatedCoworkers.getItems().find(c => c.id === coworkerId);
    
    if (coworker) {
      user.relatedCoworkers.remove(coworker);
      await this.em.flush();
    }
    
    return user;
  }
}