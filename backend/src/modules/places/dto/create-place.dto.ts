import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  IsEnum,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PlaceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum PlaceType {
  ATTRACTION = 'attraction',
  RESTAURANT = 'restaurant',
  HOTEL = 'hotel',
  LANDMARK = 'landmark',
  MUSEUM = 'museum',
  BEACH = 'beach',
  PARK = 'park',
  OTHER = 'other',
}

export class CreatePlaceDto {
  @ApiProperty({ example: 'Golden Gate Bridge' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Iconic suspension bridge spanning the Golden Gate strait' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Visit the iconic Golden Gate Bridge in San Francisco' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Golden Gate Bridge, San Francisco, CA' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'San Francisco' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'California' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'United States' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: '94129' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ example: 37.8199 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -122.4783 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ enum: PlaceType, example: PlaceType.LANDMARK })
  @IsEnum(PlaceType)
  @IsOptional()
  placeType?: PlaceType;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  featuredImageId?: number;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsArray()
  @IsOptional()
  tagIds?: number[];

  @ApiPropertyOptional({
    example: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
    },
  })
  @IsOptional()
  openingHours?: any;

  @ApiPropertyOptional({
    example: {
      phone: '+1-415-123-4567',
      email: 'info@goldengate.com',
      website: 'https://goldengate.com',
    },
  })
  @IsOptional()
  contactInfo?: any;

  @ApiPropertyOptional({
    example: {
      adult: 25,
      child: 15,
      currency: 'USD',
    },
  })
  @IsOptional()
  admissionFee?: any;

  @ApiPropertyOptional({ example: 'Golden Gate Bridge | San Francisco Attractions' })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Visit the iconic Golden Gate Bridge...' })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ example: ['golden gate', 'san francisco', 'bridge'] })
  @IsArray()
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ enum: PlaceStatus, default: PlaceStatus.DRAFT })
  @IsEnum(PlaceStatus)
  @IsOptional()
  status?: PlaceStatus;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
