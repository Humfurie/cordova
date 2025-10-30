import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across places and blogs' })
  @ApiQuery({ name: 'q', required: true, example: 'san francisco' })
  @ApiQuery({ name: 'type', required: false, enum: ['places', 'blogs'] })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  search(@Query('q') query: string, @Query() options: any) {
    return this.searchService.search(query, options);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending/popular content' })
  @ApiResponse({ status: 200, description: 'Trending content retrieved successfully' })
  getTrending() {
    return this.searchService.getTrending();
  }
}
