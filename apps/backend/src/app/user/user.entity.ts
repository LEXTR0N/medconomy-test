import { BaseEntity, Collection, Entity, ManyToMany, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { UserRepository } from './user.repository';
import { Company } from '../company/company.entity';

@Entity({ repository: () => UserRepository })
export class User extends BaseEntity {
  @PrimaryKey()
  id: string = v4();

  @Property()
  name: string;

  @Property({ nullable: true })
  position: string | null;

  @Property({ nullable: true })
  email: string | null;

  @Property({ nullable: true })
  address: string | null;

  @ManyToOne(() => Company, { nullable: true })
  company?: Company;

  @ManyToMany(() => User, 'relatedCoworkers', { owner: true })
  relatedCoworkers = new Collection<User>(this);
}