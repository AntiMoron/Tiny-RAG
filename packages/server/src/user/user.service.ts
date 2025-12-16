import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { sha256WithSalt } from 'src/util/sha256';
import getEnvConfigValue from 'src/util/getEnvConfigValue';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    const cnt = await this.getUserCount();
    if (0 === cnt) {
      const salt = getEnvConfigValue('PASSWORD_SALT');
      const defaultName = getEnvConfigValue('ADMIN_NAME');
      const defaultRootPwd = getEnvConfigValue('ADMIN_PASSWORD');
      const pwdHash = sha256WithSalt(defaultRootPwd, salt);
      await this.insertUser({
        username: defaultName,
        encrypt_pwd: pwdHash.hash,
      });
    }
  }

  async getUserByName(name: string) {
    const user = await this.repo.findOneBy({ username: name });
    return user;
  }

  async getUserById(id: string) {
    const user = await this.repo.findOneBy({ id });
    return user;
  }

  async getUserCount() {
    const data = await this.repo.count();
    return data;
  }

  async insertUser(user: Omit<UserEntity, 'id' | 'createdAt'>) {
    const u = this.repo.create({
      ...user,
    });
    return await this.repo.save(u);
  }
}
