import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TokenService } from '../stratgies/token.service';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.tokenService.verifyAccessToken(token);
      request.user = payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('access_token_expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('invalid_token');
      }
      throw new UnauthorizedException('unauthorized');
    }

    return true;
  }
}
