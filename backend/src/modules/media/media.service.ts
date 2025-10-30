import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from './minio.service';
import * as sharp from 'sharp';

interface ImageSize {
  width: number;
  height: number;
  quality: number;
}

@Injectable()
export class MediaService {
  private readonly imageSizes: Record<string, ImageSize> = {
    thumbnail: { width: 150, height: 150, quality: 80 },
    small: { width: 400, height: 300, quality: 85 },
    medium: { width: 800, height: 600, quality: 85 },
    large: { width: 1200, height: 900, quality: 90 },
  };

  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {}

  /**
   * Upload and process image
   */
  async uploadImage(file: Express.Multer.File, uploadedBy?: number) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP are allowed');
    }

    // Get original image metadata
    const metadata = await sharp(file.buffer).metadata();

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const baseFileName = `${timestamp}-${sanitizedName}`;

    // Upload original image
    const originalFileName = `original/${baseFileName}`;
    const originalUrl = await this.minioService.uploadFile(
      originalFileName,
      file.buffer,
      file.mimetype,
    );

    // Process and upload different sizes
    const urls: Record<string, string> = {
      original: originalUrl,
    };

    for (const [sizeName, dimensions] of Object.entries(this.imageSizes)) {
      const processedBuffer = await sharp(file.buffer)
        .resize(dimensions.width, dimensions.height, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: dimensions.quality })
        .toBuffer();

      const fileName = `${sizeName}/${baseFileName.replace(/\.[^.]+$/, '.webp')}`;
      urls[sizeName] = await this.minioService.uploadFile(
        fileName,
        processedBuffer,
        'image/webp',
      );
    }

    // Save to database
    const media = await this.prisma.media.create({
      data: {
        filename: baseFileName,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        width: metadata.width || null,
        height: metadata.height || null,
        url: originalUrl,
        thumbnailUrl: urls.thumbnail,
        mediumUrl: urls.medium,
        largeUrl: urls.large,
        uploadedBy,
      },
    });

    return media;
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(files: Express.Multer.File[], uploadedBy?: number) {
    const uploadPromises = files.map((file) => this.uploadImage(file, uploadedBy));
    return Promise.all(uploadPromises);
  }

  /**
   * Get all media
   */
  async findAll(query: any = {}) {
    const { page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const [media, total] = await Promise.all([
      this.prisma.media.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.media.count(),
    ]);

    return {
      data: media,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get media by ID
   */
  async findOne(id: number) {
    return this.prisma.media.findUnique({
      where: { id },
    });
  }

  /**
   * Delete media
   */
  async remove(id: number) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new BadRequestException('Media not found');
    }

    // Delete from MinIO
    try {
      // Extract filename from URL and delete all sizes
      const baseFileName = media.filename;
      const sizes = ['original', 'thumbnail', 'small', 'medium', 'large'];

      for (const size of sizes) {
        const fileName = `${size}/${baseFileName}`;
        const exists = await this.minioService.fileExists(fileName);
        if (exists) {
          await this.minioService.deleteFile(fileName);
        }
      }
    } catch (error) {
      console.error('Error deleting from MinIO:', error);
    }

    // Delete from database
    await this.prisma.media.delete({
      where: { id },
    });

    return { message: 'Media deleted successfully' };
  }
}
