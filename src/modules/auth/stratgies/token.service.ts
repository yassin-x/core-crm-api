import { Injectable, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TokenService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async generateAccessToken(payload: { userId: string; accessState: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });
    return this.jwt.sign(
      { ...payload, tokenVersion: user?.tokenVersion },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      },
    );
  }

   generateRefreshToken(payload: { userId: string }) {
    return  this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
  }

  async verifyAccessToken(token: string) {
    return await this.jwt.verify(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
  }

  async verifyRefreshToken(token: string) {
    return await this.jwt.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }
}
