import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsEnum, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PlaceStatus, PlaceType } from './create-place.dto';

export class QueryPlacesDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'Golden Gate' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ enum: PlaceType })
  @IsOptional()
  @IsEnum(PlaceType)
  placeType?: PlaceType;

  @ApiPropertyOptional({ enum: PlaceStatus, default: PlaceStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(PlaceStatus)
  status?: PlaceStatus = PlaceStatus.PUBLISHED;

  @ApiPropertyOptional({ example: 'San Francisco' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'United States' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  tagIds?: number[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 4.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRating?: number;

  // Geospatial filters
  @ApiPropertyOptional({ example: 37.7749, description: 'Latitude for nearby search' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -122.4194, description: 'Longitude for nearby search' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 10, description: 'Radius in kilometers for nearby search' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(1000)
  radiusKm?: number;

  // Bounding box for map view
  @ApiPropertyOptional({ example: 37.7, description: 'Southwest latitude' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  swLat?: number;

  @ApiPropertyOptional({ example: -122.5, description: 'Southwest longitude' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  swLng?: number;

  @ApiPropertyOptional({ example: 37.8, description: 'Northeast latitude' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  neLat?: number;

  @ApiPropertyOptional({ example: -122.3, description: 'Northeast longitude' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  neLng?: number;

  @ApiPropertyOptional({ enum: ['rating', 'name', 'createdAt', 'visitCount'] })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
