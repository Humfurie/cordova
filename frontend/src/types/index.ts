export interface Media {
  id: number;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  altText?: string;
  caption?: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  _count?: {
    places: number;
    blogs: number;
  };
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Place {
  id: number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  categoryId?: number;
  placeType?: string;
  rating: number;
  reviewCount: number;
  visitCount: number;
  openingHours?: any;
  contactInfo?: any;
  admissionFee?: any;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  status: string;
  isFeatured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  featuredImage?: Media;
  tags?: Tag[];
  media?: PlaceMedia[];
  reviews?: Review[];
  distanceKm?: number;
}

export interface PlaceMedia {
  id: number;
  displayOrder: number;
  media: Media;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorName?: string;
  viewCount: number;
  readTime?: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  status: string;
  isFeatured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  featuredImage?: Media;
  tags?: Tag[];
  blogPlaces?: BlogPlace[];
}

export interface BlogPlace {
  id: number;
  place: Place;
}

export interface Review {
  id: number;
  authorName: string;
  authorEmail?: string;
  rating: number;
  title?: string;
  content?: string;
  helpfulCount: number;
  status: string;
  createdAt: string;
}

export interface Comment {
  id: number;
  blogId: number;
  authorName?: string;
  authorEmail?: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  blog?: Blog;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  role?: string;
  permissions?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchResults {
  query: string;
  places: Place[];
  blogs: Blog[];
  total: number;
}

export interface TrendingContent {
  trendingPlaces: Place[];
  trendingBlogs: Blog[];
}
