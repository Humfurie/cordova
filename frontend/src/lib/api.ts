import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth functions
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },
};

// Places API
export const placesApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/places', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/places/${id}`);
    return response.data;
  },
  getBySlug: async (slug: string) => {
    const response = await api.get(`/places/slug/${slug}`);
    return response.data;
  },
  getNearby: async (latitude: number, longitude: number, radiusKm: number = 10) => {
    const response = await api.get('/places/nearby', {
      params: { latitude, longitude, radiusKm },
    });
    return response.data;
  },
  getInBounds: async (swLat: number, swLng: number, neLat: number, neLng: number) => {
    const response = await api.get('/places/in-bounds', {
      params: { swLat, swLng, neLat, neLng },
    });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/places', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch(`/places/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/places/${id}`);
    return response.data;
  },
};

// Blogs API
export const blogsApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/blogs', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
  },
  getBySlug: async (slug: string) => {
    const response = await api.get(`/blogs/slug/${slug}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/blogs', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch(`/blogs/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },
};

// Comments API
export const commentsApi = {
  getForBlog: async (blogId: number) => {
    const response = await api.get(`/comments/blog/${blogId}`);
    return response.data;
  },
  create: async (blogId: number, data: any) => {
    const response = await api.post(`/comments/blog/${blogId}`, data);
    return response.data;
  },
  approve: async (id: number) => {
    const response = await api.patch(`/comments/${id}/approve`);
    return response.data;
  },
  reject: async (id: number) => {
    const response = await api.patch(`/comments/${id}/reject`);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};

// Media API
export const mediaApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  uploadMultiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await api.post('/media/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getAll: async (params?: any) => {
    const response = await api.get('/media', { params });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/media/${id}`);
    return response.data;
  },
};

// Search API
export const searchApi = {
  search: async (query: string, type?: 'places' | 'blogs') => {
    const response = await api.get('/search', { params: { q: query, type } });
    return response.data;
  },
  trending: async () => {
    const response = await api.get('/search/trending');
    return response.data;
  },
};
