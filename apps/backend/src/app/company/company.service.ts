import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Company } from './company.entity';
import { CompanyRepository } from './company.repository';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: CompanyRepository
  ) {}

  async findAll(): Promise<Company[]> {
    return this.companyRepository.findAll();
  }

  async findOne(id: string): Promise<Company | null> {
    return this.companyRepository.findOne(id);
  }

  async create(companyData: Partial<Company>): Promise<Company> {
    const company = this.companyRepository.create(companyData);
    await this.companyRepository.persistAndFlush(company);
    return company;
  }

  async update(id: string, companyData: Partial<Company>): Promise<Company | null> {
    const company = await this.companyRepository.findOne(id);
    if (!company) {
      return null;
    }

    this.companyRepository.assign(company, companyData);
    await this.companyRepository.flush();
    return company;
  }

  async delete(id: string): Promise<boolean> {
    const company = await this.companyRepository.findOne(id);
    if (!company) {
      return false;
    }

    await this.companyRepository.removeAndFlush(company);
    return true;
  }
}