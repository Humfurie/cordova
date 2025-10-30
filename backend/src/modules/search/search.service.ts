import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  /**
   * Global search across places and blogs
   */
  async search(query: string, options: any = {}) {
    const { limit = 20, type } = options;

    if (!query || query.trim() === '') {
      return {
        places: [],
        blogs: [],
        total: 0,
      };
    }

    const searchQuery = query.trim();

    // Search places
    const places =
      !type || type === 'places'
        ? await this.prisma.place.findMany({
            where: {
              status: 'published',
              OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
                { city: { contains: searchQuery, mode: 'insensitive' } },
                { country: { contains: searchQuery, mode: 'insensitive' } },
              ],
            },
            take: limit,
            include: {
              category: true,
              featuredImage: true,
            },
            orderBy: [{ rating: 'desc' }, { visitCount: 'desc' }],
          })
        : [];

    // Search blogs
    const blogs =
      !type || type === 'blogs'
        ? await this.prisma.blog.findMany({
            where: {
              status: 'published',
              OR: [
                { title: { contains: searchQuery, mode: 'insensitive' } },
                { content: { contains: searchQuery, mode: 'insensitive' } },
                { excerpt: { contains: searchQuery, mode: 'insensitive' } },
              ],
            },
            take: limit,
            include: {
              category: true,
              featuredImage: true,
            },
            orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
          })
        : [];

    return {
      query: searchQuery,
      places,
      blogs,
      total: places.length + blogs.length,
    };
  }

  /**
   * Get popular/trending searches (can be enhanced with search_logs table)
   */
  async getTrending() {
    // Get most viewed places and blogs
    const [places, blogs] = await Promise.all([
      this.prisma.place.findMany({
        where: { status: 'published' },
        take: 10,
        orderBy: { visitCount: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          visitCount: true,
        },
      }),
      this.prisma.blog.findMany({
        where: { status: 'published' },
        take: 10,
        orderBy: { viewCount: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
        },
      }),
    ]);

    return {
      trendingPlaces: places,
      trendingBlogs: blogs,
    };
  }
}
