import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService, private readonly jwt: JwtService) {}

  async signup(email: string, password: string) {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const user = await this.users.create(email, passwordHash);
    return { user: { id: user.id, email: user.email, created_at: user.createdAt }, ...(await this.issueTokens(user.id, user.email)) };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException({ error: 'INVALID_CREDENTIALS' });
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException({ error: 'INVALID_CREDENTIALS' });
    return { user: { id: user.id, email: user.email, created_at: user.createdAt }, ...(await this.issueTokens(user.id, user.email)) };
  }

  async refresh(refreshToken: string) {
    const refreshJwt = new JwtService({ secret: process.env.JWT_REFRESH_SECRET! });
    const payload = await refreshJwt.verifyAsync<{ sub: string; email: string }>(refreshToken);
    return this.issueTokens(payload.sub, payload.email);
  }

  private async issueTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const access_token = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET!,
      expiresIn: ACCESS_EXPIRES,
    });
    const refreshJwt = new JwtService({ secret: process.env.JWT_REFRESH_SECRET! });
    const refresh_token = await refreshJwt.signAsync(payload, { expiresIn: REFRESH_EXPIRES });
    return { access_token, refresh_token, token_type: 'Bearer', expires_in: ACCESS_EXPIRES };
  }
}
