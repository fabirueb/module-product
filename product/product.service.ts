import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InvitationService {
  constructor(private prisma: PrismaService) {}

  // Einladung erstellen
  async createProduct(): Promise<void> {
    // Einladung in der DB speichern
    await this.prisma.product.create({
      data: {
        name: 'test',
      },
    });
  }

  async getProduct(id: number): Promise<any> {
    return await this.prisma.product.findUnique({
      where: { id: id },
    });
  }
}
