import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { QueryPlacesDto } from './dto/query-places.dto';

@ApiTags('places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new place' })
  @ApiResponse({ status: 201, description: 'Place created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  // @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
  // @ApiBearerAuth()
  create(@Body() createPlaceDto: CreatePlaceDto) {
    return this.placesService.create(createPlaceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all places with filters' })
  @ApiResponse({ status: 200, description: 'Places retrieved successfully' })
  findAll(@Query() query: QueryPlacesDto) {
    return this.placesService.findAll(query);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find places near a location' })
  @ApiResponse({ status: 200, description: 'Nearby places retrieved successfully' })
  findNearby(@Query() query: QueryPlacesDto) {
    const { latitude, longitude, radiusKm = 10 } = query;

    if (!latitude || !longitude) {
      return {
        data: [],
        meta: {
          message: 'Latitude and longitude are required for nearby search',
        },
      };
    }

    return this.placesService.findNearby(latitude, longitude, radiusKm);
  }

  @Get('in-bounds')
  @ApiOperation({ summary: 'Find places within map bounds' })
  @ApiResponse({ status: 200, description: 'Places in bounds retrieved successfully' })
  findInBounds(@Query() query: QueryPlacesDto) {
    const { swLat, swLng, neLat, neLng } = query;

    if (!swLat || !swLng || !neLat || !neLng) {
      return {
        data: [],
        meta: {
          message: 'All bounding box coordinates are required',
        },
      };
    }

    return this.placesService.findInBounds(swLat, swLng, neLat, neLng);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a place by slug' })
  @ApiParam({ name: 'slug', example: 'golden-gate-bridge' })
  @ApiResponse({ status: 200, description: 'Place retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Place not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.placesService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a place by ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Place retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Place not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.placesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a place' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Place updated successfully' })
  @ApiResponse({ status: 404, description: 'Place not found' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePlaceDto: UpdatePlaceDto) {
    return this.placesService.update(id, updatePlaceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a place' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Place deleted successfully' })
  @ApiResponse({ status: 404, description: 'Place not found' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.placesService.remove(id);
  }
}
