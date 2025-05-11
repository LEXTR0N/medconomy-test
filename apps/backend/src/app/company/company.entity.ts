import { BaseEntity, Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../user/user.entity';
import { CompanyRepository } from './company.repository';

@Entity({ repository: () => CompanyRepository })
export class Company extends BaseEntity {
  @PrimaryKey()
  id: string = v4();

  @Property()
  name: string;

  @Property({ nullable: true })
  industry: string | null;

  @Property({ nullable: true })
  address: string | null;

  @OneToMany(() => User, user => user.company)
  employees = new Collection<User>(this);
}