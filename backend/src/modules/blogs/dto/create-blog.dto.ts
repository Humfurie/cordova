import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsBoolean, IsEnum } from 'class-validator';

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class CreateBlogDto {
  @ApiProperty({ example: '10 Best Places to Visit in San Francisco' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Discover the most amazing tourist attractions...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'A guide to San Francisco top destinations' })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  authorId?: number;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  authorName?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  featuredImageId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @IsOptional()
  readTime?: number;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsArray()
  @IsOptional()
  tagIds?: number[];

  @ApiPropertyOptional({ example: [1, 2] })
  @IsArray()
  @IsOptional()
  relatedPlaceIds?: number[];

  @ApiPropertyOptional({ example: '10 Best Places | San Francisco Travel Guide' })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Explore the best tourist destinations...' })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ example: ['san francisco', 'travel', 'tourism'] })
  @IsArray()
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ enum: BlogStatus, default: BlogStatus.DRAFT })
  @IsEnum(BlogStatus)
  @IsOptional()
  status?: BlogStatus;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
