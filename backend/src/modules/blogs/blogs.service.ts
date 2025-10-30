import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async create(createBlogDto: CreateBlogDto) {
    const { tagIds, relatedPlaceIds, ...blogData } = createBlogDto;

    const slug = this.generateSlug(createBlogDto.title);

    const data: Prisma.BlogCreateInput = {
      ...blogData,
      slug,
      publishedAt: createBlogDto.status === 'published' ? new Date() : null,
    };

    if (tagIds && tagIds.length > 0) {
      data.tags = {
        connect: tagIds.map((id) => ({ id })),
      };
    }

    if (createBlogDto.categoryId) {
      data.category = {
        connect: { id: createBlogDto.categoryId },
      };
    }

    if (createBlogDto.featuredImageId) {
      data.featuredImage = {
        connect: { id: createBlogDto.featuredImageId },
      };
    }

    const blog = await this.prisma.blog.create({
      data,
      include: {
        category: true,
        tags: true,
        featuredImage: true,
      },
    });

    // Create blog-place relationships
    if (relatedPlaceIds && relatedPlaceIds.length > 0) {
      await this.prisma.blogPlace.createMany({
        data: relatedPlaceIds.map((placeId) => ({
          blogId: blog.id,
          placeId,
        })),
      });
    }

    return blog;
  }

  async findAll(query: any = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      status = 'published',
      isFeatured,
      tagIds,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.BlogWhereInput = {
      status,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(tagIds &&
        tagIds.length > 0 && {
          tags: {
            some: {
              id: { in: tagIds },
            },
          },
        }),
    };

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          tags: true,
          featuredImage: true,
        },
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      data: blogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
        featuredImage: true,
        blogPlaces: {
          include: {
            place: {
              include: {
                featuredImage: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    // Increment view count
    await this.prisma.blog.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return blog;
  }

  async findBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: true,
        featuredImage: true,
        blogPlaces: {
          include: {
            place: {
              include: {
                featuredImage: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with slug "${slug}" not found`);
    }

    await this.prisma.blog.update({
      where: { id: blog.id },
      data: { viewCount: { increment: 1 } },
    });

    return blog;
  }

  async update(id: number, updateBlogDto: UpdateBlogDto) {
    const { tagIds, relatedPlaceIds, ...blogData } = updateBlogDto;

    await this.findOne(id);

    const data: Prisma.BlogUpdateInput = {
      ...blogData,
    };

    if (updateBlogDto.title) {
      data.slug = this.generateSlug(updateBlogDto.title);
    }

    if (updateBlogDto.status === 'published') {
      data.publishedAt = new Date();
    }

    if (tagIds !== undefined) {
      data.tags = {
        set: tagIds.map((id) => ({ id })),
      };
    }

    // Update related places
    if (relatedPlaceIds !== undefined) {
      await this.prisma.blogPlace.deleteMany({
        where: { blogId: id },
      });

      if (relatedPlaceIds.length > 0) {
        await this.prisma.blogPlace.createMany({
          data: relatedPlaceIds.map((placeId) => ({
            blogId: id,
            placeId,
          })),
        });
      }
    }

    return this.prisma.blog.update({
      where: { id },
      data,
      include: {
        category: true,
        tags: true,
        featuredImage: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.blog.delete({ where: { id } });
    return { message: 'Blog deleted successfully' };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .concat('-', Date.now().toString().slice(-6));
  }
}
