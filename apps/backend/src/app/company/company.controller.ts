import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { Company } from './company.entity';
import { CompanyService } from './company.service';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async findAll(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Company> {
    const company = await this.companyService.findOne(id);
    if (!company) {
      throw new NotFoundException(`Company with ID '${id}' not found`);
    }
    return company;
  }

  @Post()
  async create(@Body() companyData: Partial<Company>): Promise<Company> {
    return this.companyService.create(companyData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() companyData: Partial<Company>): Promise<Company> {
    const company = await this.companyService.update(id, companyData);
    if (!company) {
      throw new NotFoundException(`Company with ID '${id}' not found`);
    }
    return company;
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.companyService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Company with ID '${id}' not found`);
    }
  }
}