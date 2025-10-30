import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { places: true, blogs: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        places: {
          where: { status: 'published' },
          take: 10,
        },
        blogs: {
          where: { status: 'published' },
          take: 10,
        },
      },
    });
  }
}
