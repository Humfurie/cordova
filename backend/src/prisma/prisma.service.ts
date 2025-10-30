import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Enable PostGIS extension for geospatial queries
   */
  async enablePostGIS() {
    await this.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS postgis');
  }
}
