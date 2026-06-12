import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Res,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import type { FastifyReply } from 'fastify';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() registerAuthDto: RegisterAuthDto,
  ) {
    return this.authService.register(registerAuthDto, reply);
  }

  @Post('login')
  login(
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() loginAuthDto: LoginAuthDto,
  ) {
    return this.authService.login(loginAuthDto, reply);
  }

  @UseGuards(AuthGuard)
  @Post('verify-email')
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Patch('refresh-token')
  refreshToken(@Res({ passthrough: true }) reply: FastifyReply) {
    return this.authService.refreshToken(reply);
  }

  @UseGuards(AuthGuard)
  @Delete('sign-out')
  async signOut(@Res({ passthrough: true }) reply: FastifyReply) {
    return await this.authService.signOut(reply);
  }
}
