import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { TokenService } from './stratgies/token.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private tokenService: TokenService,
    private mailService: MailService,
    private prisma: PrismaService,
  ) {}

  async register(registerAuthDto: RegisterAuthDto, reply: FastifyReply) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const emailAlreadyExists = await this.prisma.user.findUnique({
      where: { email: registerAuthDto.email },
    });

    if (emailAlreadyExists) {
      return { message: 'Email already exists' };
    }

    await this.mailService.sendMail(
      registerAuthDto.email,
      'Verify your email',
      `Your OTP code is: ${otpCode}`,
    );

    const passwordHash = await bcrypt.hash(registerAuthDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerAuthDto.email,
        password: passwordHash,
        phone: registerAuthDto.phone,
        otpCode: otpCode,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
        company: {
          create: {
            name: registerAuthDto.companyName,
          },
        },
      },
    });

    const access_token = await this.tokenService.generateAccessToken({
      userId: user.id,
      accessState: 'pending',
    });
    const refresh_token = this.tokenService.generateRefreshToken({
      userId: user.id,
    });
    reply.setCookie('refresh_token', refresh_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return {
      message: 'Registration successful, please verify your email',
      data: {
        user: user,
        tokens: {
          access_token,
        },
      },
    };
  }

  async login(loginAuthDto: LoginAuthDto, reply: FastifyReply) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await this.prisma.user.findUnique({
      where: { email: loginAuthDto.email },
    });

    if (!user) {
      return { message: 'User not found' };
    }

    const isPasswordValid = await bcrypt.compare(
      loginAuthDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      return { message: 'Password is incorrect' };
    }

    const access_token = await this.tokenService.generateAccessToken({
      userId: user.id,
      accessState: 'pending',
    });
    const refresh_token = this.tokenService.generateRefreshToken({
      userId: user.id,
    });
    reply.setCookie('refresh_token', refresh_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    await this.mailService.sendMail(
      loginAuthDto.email,
      'Verify your email',
      `Your OTP code is: ${otpCode}`,
    );

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otpCode,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
      },
    });

    return {
      message: 'This action adds a new auth',
      data: {
        user: updatedUser,
        tokens: {
          access_token,
        },
      },
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: verifyEmailDto.email },
    });

    if (!user) {
      return { message: 'User not found' };
    }

    if (user.otpCode !== verifyEmailDto.otpCode) {
      return { message: 'Invalid OTP code' };
    }
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return { message: 'OTP code has expired' };
    }

    const access_token = await this.tokenService.generateAccessToken({
      userId: user.id,
      accessState: 'verified',
    });

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiry: null,
        otpVerified: true,
      },
    });

    return {
      message: 'Email verified successfully',
      data: {
        user: updatedUser,
        tokens: {
          access_token,
        },
      },
    };
  }

  async signOut(reply: FastifyReply) {
    const refresh_token = reply.request.cookies['refresh_token'];

    if (!refresh_token) {
      return { message: 'No refresh token provided' };
    }

    const payload = await this.tokenService.verifyRefreshToken(refresh_token);
    await this.prisma.user.update({
      where: { id: payload.userId },
      data: {
        otpVerified: false,
        tokenVersion: {
          increment: 1,
        },
      },
    });

    reply.clearCookie('refresh_token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return {
      message: 'Successfully signed out',
    };
  }

  async refreshToken(reply: FastifyReply) {
    const refreshToken = reply.request.cookies['refresh_token'];

    if (!refreshToken) {
      return { message: 'No refresh token provided' };
    }

    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);
      if (!payload) {
        throw new UnauthorizedException('unauthorized');
      }

      const access_token = await this.tokenService.generateAccessToken({
        userId: payload.userId,
        accessState: 'verified',
      });

      return {
        message: 'This action refreshes the access token',
        data: {
          tokens: {
            access_token,
          },
        },
      };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('refresh_token_expired');
      }

      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('invalid_token');
      }

      throw new UnauthorizedException('unauthorized');
    }
  }

  async meProfile(req: FastifyRequest) {
    const request = req.user;

    const user = await this.prisma.user.findUnique({
      where: { id: request?.userId },
    });

    return {
      message: 'Get user successfully',
      data: user,
    };
  }
}
