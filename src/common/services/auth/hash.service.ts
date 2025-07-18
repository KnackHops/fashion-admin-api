import { compare, hash } from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HashService {
  async hashPassword(password: string) {
    const saltOrRounds = 10;

    return await hash(password, saltOrRounds);
  }

  async comparePassword(password: string, hash: string) {
    return await compare(password, hash);
  }

  async generateAndHashPassword(
    password?: string,
  ): Promise<{ hash: string; text: string }> {
    const genPassword = password ?? this.generatePassword();
    const hashPassword = await this.hashPassword(genPassword);

    return { hash: hashPassword, text: genPassword };
  }

  protected generatePassword(length: number = 8) {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let str = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      str += chars.charAt(randomIndex);
    }

    return str;
  }
}
