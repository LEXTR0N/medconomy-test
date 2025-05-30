import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import ormConfig from './config/orm.config';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(ormConfig), 
    UserModule, 
    CompanyModule, 
    AuditModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}