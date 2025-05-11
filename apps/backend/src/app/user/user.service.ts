import { InjectRepository } from '@mikro-orm/nestjs';
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
    private readonly auditService: AuditService
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll({ populate: ['company'] });
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne(id, { populate: ['company', 'relatedCoworkers'] });
  }

  async create(userData: Partial<User> & { companyId?: string }): Promise<User> {
    const { companyId, ...userDataWithoutCompany } = userData;
    
    const user = this.userRepository.create(userDataWithoutCompany);
    
    if (companyId) {
      const company = await this.companyService.findOne(companyId);
      if (company) {
        user.company = company;
      }
    }
    
    await this.userRepository.persistAndFlush(user);
    await this.auditService.logActivity('User', user.id, 'CREATE', {});
    
    return user;
  }

  async update(id: string, userData: Partial<User> & { companyId?: string }): Promise<User | null> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      return null;
    }

    const { companyId, ...userDataWithoutCompany } = userData;
    const oldData = { ...user };
    
    this.userRepository.assign(user, userDataWithoutCompany);
    
    if (companyId) {
      const company = await this.companyService.findOne(companyId);
      if (company) {
        user.company = company;
      }
    }
    
    await this.userRepository.flush();
    await this.auditService.logActivity('User', user.id, 'UPDATE', oldData);
    
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      return false;
    }

    const oldData = { ...user };
    await this.userRepository.removeAndFlush(user);
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
    await this.userRepository.flush();
    
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
      await this.userRepository.flush();
    }
    
    return user;
  }
}