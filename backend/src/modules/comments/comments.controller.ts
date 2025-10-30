import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('blog/:blogId')
  @ApiOperation({ summary: 'Add a comment to a blog (anyone can comment)' })
  @ApiParam({ name: 'blogId', example: 1 })
  @ApiResponse({ status: 201, description: 'Comment created (pending approval)' })
  @ApiResponse({ status: 404, description: 'Blog not found' })
  async create(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req?: any,
  ) {
    const userId = req?.user?.userId; // Optional: if user is logged in
    return this.commentsService.create(blogId, createCommentDto, userId);
  }

  @Get('blog/:blogId')
  @ApiOperation({ summary: 'Get all approved comments for a blog' })
  @ApiParam({ name: 'blogId', example: 1 })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  findAllForBlog(@Param('blogId', ParseIntPipe) blogId: number) {
    return this.commentsService.findAllForBlog(blogId);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pending comments (Admin only)' })
  @ApiResponse({ status: 200, description: 'Pending comments retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findPending() {
    return this.commentsService.findPending();
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a comment (Admin only)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Comment approved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a comment (Admin only)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Comment rejected successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.reject(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment (Admin or comment author)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.commentsService.remove(id, req.user.userId, req.user.role);
  }
}
