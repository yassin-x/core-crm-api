import { Injectable, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private jwt: JwtService) {}

  generateAccessToken(payload: { userId: number; accessState: string }) {
    return this.jwt.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });
  }

  generateRefreshToken(payload: { userId: number }) {
    return this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
  }

  verifyAccessToken(token: string, accessState: string) {
    return this.jwt.verify(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
  }

  verifyRefreshToken(token: string) {
    return this.jwt.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }
}
