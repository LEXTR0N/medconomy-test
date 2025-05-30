import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Company } from './company.entity';
import { CompanyRepository } from './company.repository';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: CompanyRepository,
    private readonly em: EntityManager
  ) {}

  async findAll(): Promise<Company[]> {
    return this.companyRepository.findAll();
  }

  async findOne(id: string): Promise<Company | null> {
    return this.companyRepository.findOne(id);
  }

  async create(companyData: Partial<Company>): Promise<Company> {
    const company = this.companyRepository.create(companyData);
    await this.em.persistAndFlush(company);
    return company;
  }

  async update(id: string, companyData: Partial<Company>): Promise<Company | null> {
    const company = await this.companyRepository.findOne(id);
    if (!company) {
      return null;
    }

    this.em.assign(company, companyData);
    await this.em.flush();
    return company;
  }

  async delete(id: string): Promise<boolean> {
    const company = await this.companyRepository.findOne(id);
    if (!company) {
      return false;
    }

    await this.em.removeAndFlush(company);
    return true;
  }
}