import { Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { TokenService } from './strategies/token.service';
import { FastifyReply } from 'fastify';
@Injectable()
export class AuthService {
  constructor(private tokenService: TokenService) {}

  register(registerAuthDto: RegisterAuthDto, reply: FastifyReply) {
    const access_token = this.tokenService.generateAccessToken({
      userId: 1,
      accessState: 'active',
    });
    const refresh_token = this.tokenService.generateRefreshToken({ userId: 1 });
    reply.setCookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);
    return {
      message: 'This action adds a new auth',
      data: registerAuthDto,
      access_token,
    };
  }

  login(loginAuthDto: LoginAuthDto) {
    return {
      message: 'This action adds a new auth',
      data: loginAuthDto,
    };
  }

  verifyEmail(verifyEmailDto: VerifyEmailDto) {
    return {
      message: 'This action adds a new auth',
      data: verifyEmailDto,
      access_token: null,
      refresh_token: null,
    };
  }

  remove(id: number) {
    return {
      message: 'This action removes a #${id} auth',
      data: id,
    };
  }
}
