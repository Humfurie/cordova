import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a comment on a blog
   */
  async create(blogId: number, createCommentDto: CreateCommentDto, userId?: number) {
    // Check if blog exists
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    }

    const comment = await this.prisma.comment.create({
      data: {
        blogId,
        userId,
        authorName: createCommentDto.authorName,
        authorEmail: createCommentDto.authorEmail,
        content: createCommentDto.content,
        status: 'pending', // Comments need approval
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return comment;
  }

  /**
   * Get all comments for a blog (only approved)
   */
  async findAllForBlog(blogId: number) {
    return this.prisma.comment.findMany({
      where: {
        blogId,
        status: 'approved',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get all pending comments (admin only)
   */
  async findPending() {
    return this.prisma.comment.findMany({
      where: {
        status: 'pending',
      },
      include: {
        blog: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Approve a comment (admin only)
   */
  async approve(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return this.prisma.comment.update({
      where: { id },
      data: { status: 'approved' },
    });
  }

  /**
   * Reject a comment (admin only)
   */
  async reject(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return this.prisma.comment.update({
      where: { id },
      data: { status: 'rejected' },
    });
  }

  /**
   * Delete a comment (admin or comment author only)
   */
  async remove(id: number, userId?: number, userRole?: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Only admin or comment author can delete
    if (userRole !== 'admin' && comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    return { message: 'Comment deleted successfully' };
  }
}
