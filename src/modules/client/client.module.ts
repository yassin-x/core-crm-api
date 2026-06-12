import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { TokenService } from '../auth/stratgies/token.service';

@Module({
  controllers: [ClientController],
  providers: [ClientService, TokenService],
})
export class ClientModule {}
