import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({}) // секреты передаём на месте при signAsync
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
