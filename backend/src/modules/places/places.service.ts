import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { QueryPlacesDto } from './dto/query-places.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlacesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new place
   */
  async create(createPlaceDto: CreatePlaceDto) {
    const { tagIds, ...placeData } = createPlaceDto;

    // Generate slug from name
    const slug = this.generateSlug(createPlaceDto.name);

    const data: Prisma.PlaceCreateInput = {
      ...placeData,
      slug,
      publishedAt: createPlaceDto.status === 'published' ? new Date() : null,
    };

    // Connect tags if provided
    if (tagIds && tagIds.length > 0) {
      data.tags = {
        connect: tagIds.map((id) => ({ id })),
      };
    }

    // Connect category if provided
    if (createPlaceDto.categoryId) {
      data.category = {
        connect: { id: createPlaceDto.categoryId },
      };
    }

    // Connect featured image if provided
    if (createPlaceDto.featuredImageId) {
      data.featuredImage = {
        connect: { id: createPlaceDto.featuredImageId },
      };
    }

    return this.prisma.place.create({
      data,
      include: {
        category: true,
        tags: true,
        featuredImage: true,
      },
    });
  }

  /**
   * Find all places with filters and pagination
   */
  async findAll(query: QueryPlacesDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      placeType,
      status,
      city,
      country,
      tagIds,
      isFeatured,
      minRating,
      latitude,
      longitude,
      radiusKm,
      swLat,
      swLng,
      neLat,
      neLng,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PlaceWhereInput = {
      status,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(placeType && { placeType }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(country && { country: { contains: country, mode: 'insensitive' } }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(minRating && { rating: { gte: minRating } }),
      ...(tagIds &&
        tagIds.length > 0 && {
          tags: {
            some: {
              id: { in: tagIds },
            },
          },
        }),
    };

    // If geospatial query (nearby places)
    if (latitude && longitude && radiusKm) {
      return this.findNearby(latitude, longitude, radiusKm, where, skip, limit);
    }

    // If bounding box query (map viewport)
    if (swLat && swLng && neLat && neLng) {
      return this.findInBounds(swLat, swLng, neLat, neLng, where, skip, limit);
    }

    // Regular query
    const [places, total] = await Promise.all([
      this.prisma.place.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          tags: true,
          featuredImage: true,
          _count: {
            select: { reviews: true },
          },
        },
      }),
      this.prisma.place.count({ where }),
    ]);

    return {
      data: places,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find places within a radius (km) from a point
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    additionalFilters: Prisma.PlaceWhereInput = {},
    skip: number = 0,
    take: number = 20,
  ) {
    // Convert radius from km to meters
    const radiusMeters = radiusKm * 1000;

    // Raw SQL query for geospatial search using PostGIS
    const places = await this.prisma.$queryRaw<any[]>`
      SELECT
        p.*,
        ST_Distance(
          ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) / 1000 AS "distanceKm"
      FROM places p
      WHERE
        p.latitude IS NOT NULL
        AND p.longitude IS NOT NULL
        AND p.status = ${additionalFilters.status || 'published'}
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radiusMeters}
        )
      ORDER BY "distanceKm" ASC
      LIMIT ${take}
      OFFSET ${skip}
    `;

    // Get total count
    const totalResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::int as count
      FROM places p
      WHERE
        p.latitude IS NOT NULL
        AND p.longitude IS NOT NULL
        AND p.status = ${additionalFilters.status || 'published'}
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radiusMeters}
        )
    `;

    const total = Number(totalResult[0].count);

    // Fetch full place data with relations
    const placeIds = places.map((p) => p.id);
    const fullPlaces = await this.prisma.place.findMany({
      where: { id: { in: placeIds } },
      include: {
        category: true,
        tags: true,
        featuredImage: true,
      },
    });

    // Merge distance data
    const placesWithDistance = fullPlaces.map((place) => {
      const distanceData = places.find((p) => p.id === place.id);
      return {
        ...place,
        distanceKm: distanceData?.distanceKm || 0,
      };
    });

    return {
      data: placesWithDistance,
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
        centerPoint: { latitude, longitude },
        radiusKm,
      },
    };
  }

  /**
   * Find places within a bounding box (map viewport)
   */
  async findInBounds(
    swLat: number,
    swLng: number,
    neLat: number,
    neLng: number,
    additionalFilters: Prisma.PlaceWhereInput = {},
    skip: number = 0,
    take: number = 100,
  ) {
    const places = await this.prisma.$queryRaw<any[]>`
      SELECT p.*
      FROM places p
      WHERE
        p.latitude IS NOT NULL
        AND p.longitude IS NOT NULL
        AND p.status = ${additionalFilters.status || 'published'}
        AND p.latitude BETWEEN ${swLat} AND ${neLat}
        AND p.longitude BETWEEN ${swLng} AND ${neLng}
      ORDER BY p.rating DESC, p.visit_count DESC
      LIMIT ${take}
      OFFSET ${skip}
    `;

    const totalResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::int as count
      FROM places p
      WHERE
        p.latitude IS NOT NULL
        AND p.longitude IS NOT NULL
        AND p.status = ${additionalFilters.status || 'published'}
        AND p.latitude BETWEEN ${swLat} AND ${neLat}
        AND p.longitude BETWEEN ${swLng} AND ${neLng}
    `;

    const total = Number(totalResult[0].count);

    // Fetch full data with relations
    const placeIds = places.map((p) => p.id);
    const fullPlaces = await this.prisma.place.findMany({
      where: { id: { in: placeIds } },
      include: {
        category: true,
        tags: true,
        featuredImage: true,
      },
    });

    return {
      data: fullPlaces,
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
        bounds: {
          southwest: { lat: swLat, lng: swLng },
          northeast: { lat: neLat, lng: neLng },
        },
      },
    };
  }

  /**
   * Find a single place by ID
   */
  async findOne(id: number) {
    const place = await this.prisma.place.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
        featuredImage: true,
        media: {
          include: {
            media: true,
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
        reviews: {
          where: { status: 'approved' },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }

    // Increment visit count
    await this.prisma.place.update({
      where: { id },
      data: { visitCount: { increment: 1 } },
    });

    return place;
  }

  /**
   * Find a place by slug
   */
  async findBySlug(slug: string) {
    const place = await this.prisma.place.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: true,
        featuredImage: true,
        media: {
          include: {
            media: true,
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
        reviews: {
          where: { status: 'approved' },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!place) {
      throw new NotFoundException(`Place with slug "${slug}" not found`);
    }

    // Increment visit count
    await this.prisma.place.update({
      where: { id: place.id },
      data: { visitCount: { increment: 1 } },
    });

    return place;
  }

  /**
   * Update a place
   */
  async update(id: number, updatePlaceDto: UpdatePlaceDto) {
    const { tagIds, ...placeData } = updatePlaceDto;

    // Check if place exists
    await this.findOne(id);

    const data: Prisma.PlaceUpdateInput = {
      ...placeData,
    };

    // Update slug if name changed
    if (updatePlaceDto.name) {
      data.slug = this.generateSlug(updatePlaceDto.name);
    }

    // Update publishedAt if status changed to published
    if (updatePlaceDto.status === 'published') {
      data.publishedAt = new Date();
    }

    // Update tags if provided
    if (tagIds !== undefined) {
      data.tags = {
        set: tagIds.map((id) => ({ id })),
      };
    }

    // Update category if provided
    if (updatePlaceDto.categoryId) {
      data.category = {
        connect: { id: updatePlaceDto.categoryId },
      };
    }

    // Update featured image if provided
    if (updatePlaceDto.featuredImageId) {
      data.featuredImage = {
        connect: { id: updatePlaceDto.featuredImageId },
      };
    }

    return this.prisma.place.update({
      where: { id },
      data,
      include: {
        category: true,
        tags: true,
        featuredImage: true,
      },
    });
  }

  /**
   * Delete a place
   */
  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.place.delete({ where: { id } });
    return { message: 'Place deleted successfully' };
  }

  /**
   * Generate URL-friendly slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .concat('-', Date.now().toString().slice(-6));
  }
}
