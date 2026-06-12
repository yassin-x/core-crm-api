import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const client = await this.prisma.client.create({
      data: {
        name: createClientDto.name,
        email: createClientDto.email,
        phone: createClientDto.phone,
        company: {
          create: {
            name: createClientDto.companyName,
          },
        },
      },
    });

    return {
      message: 'Create client successfully',
      data: client,
    };
  }

  async findAll() {
    const clients = await this.prisma.client.findMany({
      include: {
        company: true,
      },
    });
    return {
      message: 'Get all clients successfully',
      data: clients,
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: {
        id,
      },
      include: {
        company: true,
      },
    });

    return {
      message: 'Get client successfully',
      data: client,
    };
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const oldClient = await this.prisma.client.findUnique({
      where: {
        id,
      },
    });

    if (!oldClient) {
      return {
        message: 'Client not found',
      };
    }

    const client = await this.prisma.client.update({
      where: {
        id,
      },
      data: {
        name: updateClientDto.name,
        email: updateClientDto.email,
        phone: updateClientDto.phone,
      },
    });

    return {
      message: 'Update client successfully',
      data: client,
    };
  }

  async remove(id: string) {
    const oldClient = await this.prisma.client.findUnique({
      where: {
        id,
      },
    });

    if (!oldClient) {
      return {
        message: 'Client not found',
      };
    }

    await this.prisma.client.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Delete client successfully',
    };
  }
}
