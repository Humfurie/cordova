# Tourism Website - Complete Documentation

Welcome to the Tourism Website project! This documentation will help you understand and build the complete tourism platform with a powerful backend and modern frontend.

## Project Structure

```
~/Desktop/Projects/Cordova/
├── backend/          # NestJS API server
├── frontend/         # Your frontend application
└── docs/             # This documentation folder
```

## Quick Links

📖 **Documentation Files:**
1. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference for frontend integration
2. **[FRONTEND_QUICK_START.md](./FRONTEND_QUICK_START.md)** - Ready-to-use frontend code snippets
3. **[../backend/README.md](../backend/README.md)** - Backend setup and features
4. **[../backend/SETUP.md](../backend/SETUP.md)** - Quick setup guide
5. **[../backend/RBAC.md](../backend/RBAC.md)** - Role-based access control system

🔗 **Live Resources:**
- **API Swagger Docs**: http://localhost:3000/api/docs
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **PgAdmin**: http://localhost:5050 (admin@tourism.local/admin)
- **Prisma Studio**: Run `npm run prisma:studio` in backend folder

---

## What's Built

### Backend Features ✅

#### 1. Places/Destinations Management
- Full CRUD operations
- **Geospatial Queries**:
  - Find places nearby (radius search with PostGIS)
  - Find places in map bounds (viewport search)
  - Distance calculations
- Categories and tags
- Ratings and reviews
- Visit tracking
- Featured places
- SEO fields (meta title, description, keywords)

#### 2. Blog/Articles System
- Full CRUD operations
- **Blog-to-Place relationships** (attach multiple places to a blog)
- Rich content support (HTML)
- Categories and tags
- View count tracking
- Featured blogs
- Author management

#### 3. Comments System
- Anyone can comment on blogs
- **Admin approval workflow** (pending → approved/rejected)
- Users can delete their own comments
- Admin can delete any comment

#### 4. Image Management
- Upload to **MinIO** (S3-compatible standalone container)
- **Automatic image processing**:
  - Creates 4 sizes: thumbnail, small, medium, large
  - Converts to WebP for optimization
  - Maintains original
- Multiple image upload
- Image gallery for places

#### 5. Authentication & Authorization
- **JWT-based authentication**
- **Role-Based Access Control (RBAC)**:
  - Roles: super_admin, admin, author, user
  - Permissions: granular (places.create, blogs.delete, etc.)
  - **User ID 1 is super admin** with full access
- Protected routes
- Registration and login

#### 6. Search & Filtering
- Global search across places and blogs
- Full-text search with PostgreSQL
- Filter by:
  - Category, tags
  - City, country
  - Rating, featured status
  - Geolocation (nearby, bounds)
- Sorting options
- Pagination

#### 7. Maps Integration
- **OpenStreetMap ready** (free, no API keys)
- PostGIS for geospatial queries
- Latitude/longitude storage
- Accurate distance calculations
- Map marker data

---

## Tech Stack

### Backend
- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL with PostGIS extension
- **ORM**: Prisma
- **Authentication**: JWT + Passport.js
- **Image Storage**: MinIO (S3-compatible)
- **Image Processing**: Sharp
- **Documentation**: Swagger/OpenAPI
- **Maps**: PostGIS for backend, OpenStreetMap for frontend

### Frontend (Your Choice)
- **Suggested**: React + Leaflet (for maps)
- **API Client**: Fetch API or Axios
- **State Management**: React Query (optional)
- **Routing**: React Router

---

## Getting Started

### 1. Backend Setup

```bash
cd ~/Desktop/Projects/Cordova/backend

# Install dependencies
npm install

# Start Docker services (PostgreSQL + MinIO)
docker-compose up -d

# Setup environment
cp .env.example .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database (creates admin user, roles, permissions)
npm run prisma:seed

# Start development server
npm run start:dev
```

**Backend will be running at**: http://localhost:3000

**Super Admin Login:**
- Email: `admin@tourism.local`
- Password: `admin123`

### 2. Frontend Setup

```bash
cd ~/Desktop/Projects/Cordova/frontend

# Install dependencies (if using React)
npm install

# Install Leaflet for maps
npm install leaflet react-leaflet

# Start development server
npm run dev
```

**Frontend will be running at**: http://localhost:5173 (Vite default)

---

## API Usage Examples

### 1. Login and Get Token

```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@tourism.local',
    password: 'admin123',
  }),
});

const { access_token, user } = await response.json();
localStorage.setItem('token', access_token);
```

### 2. Get All Places

```javascript
const response = await fetch('http://localhost:3000/api/v1/places?page=1&limit=20');
const { data, meta } = await response.json();
```

### 3. Find Nearby Places

```javascript
const response = await fetch(
  'http://localhost:3000/api/v1/places/nearby?' +
  'latitude=37.7749&longitude=-122.4194&radiusKm=10'
);
const { data } = await response.json();
// data includes distanceKm field
```

### 4. Upload Image

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/v1/media/upload', {
  method: 'POST',
  body: formData,
});

const media = await response.json();
// Returns: { id, url, thumbnailUrl, mediumUrl, largeUrl }
```

### 5. Create Place with Image

```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/v1/places', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    name: 'Golden Gate Bridge',
    description: 'Iconic suspension bridge...',
    latitude: 37.8199,
    longitude: -122.4783,
    city: 'San Francisco',
    country: 'United States',
    featuredImageId: 1,  // From upload
    status: 'published',
  }),
});
```

### 6. Create Blog with Related Places

```javascript
const response = await fetch('http://localhost:3000/api/v1/blogs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: 'Best Places in San Francisco',
    content: '<h1>Travel Guide</h1><p>...</p>',
    relatedPlaceIds: [1, 2, 3],  // Links to places
    status: 'published',
  }),
});
```

---

## Key Features Implementation

### Displaying Map with Places

See **[FRONTEND_QUICK_START.md](./FRONTEND_QUICK_START.md)** Section 3

Key points:
- Use Leaflet.js for maps
- Fetch places in viewport: `GET /places/in-bounds`
- Update markers when map moves
- Show popups with place details

### Blog with Related Places

When creating/updating a blog:
```javascript
{
  "title": "Ultimate Paris Guide",
  "content": "...",
  "relatedPlaceIds": [5, 7, 9]  // Place IDs to attach
}
```

When fetching a blog:
```javascript
GET /blogs/:id

// Returns blog with blogPlaces array
{
  "id": 1,
  "title": "...",
  "blogPlaces": [
    {
      "place": {
        "id": 5,
        "name": "Eiffel Tower",
        "latitude": 48.8584,
        "longitude": 2.2945,
        // ... full place details
      }
    }
  ]
}
```

Display related places on a map and as a list!

### Comments with Admin Approval

1. **User submits comment** (no auth required):
```javascript
POST /comments/blog/1
{ "content": "Great post!", "authorName": "John", "authorEmail": "..." }
```

2. **Comment created with status: "pending"**

3. **Admin views pending comments**:
```javascript
GET /comments/pending  // Requires admin auth
```

4. **Admin approves**:
```javascript
PATCH /comments/:id/approve  // Requires admin auth
```

5. **Comment appears publicly**:
```javascript
GET /comments/blog/1  // Only returns approved comments
```

---

## Role-Based Access Control

### Roles

1. **Super Admin** (User ID 1)
   - Has access to EVERYTHING
   - Bypasses all permission checks
   - Default: admin@tourism.local / admin123

2. **Admin**
   - All permissions except super admin privileges
   - Can manage all content
   - Can approve/reject comments

3. **Author**
   - Can create/update blogs
   - Can upload media
   - Cannot delete blogs (admin only)

4. **User**
   - Can view content
   - Can comment (pending approval)
   - Limited permissions

### Protecting Routes

**Admin/Author Only:**
```javascript
// Blog create/update requires admin or author role
POST /blogs    // Admin or Author
PATCH /blogs/:id  // Admin or Author
DELETE /blogs/:id  // Admin only
```

**Checking Permissions in Frontend:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));

// Check if user can create blogs
if (user.permissions.includes('blogs.create')) {
  // Show create blog button
}

// Check if user is super admin
if (user.id === 1) {
  // Show all admin features
}
```

---

## Database Overview

### Main Tables

- **users** - User accounts
- **roles** - User roles (super_admin, admin, author, user)
- **permissions** - Granular permissions (places.create, etc.)
- **role_permissions** - Maps permissions to roles
- **places** - Tourist destinations
- **blogs** - Travel articles
- **blog_places** - Links blogs to places
- **comments** - User comments on blogs
- **categories** - Organize places and blogs
- **tags** - Flexible tagging
- **media** - Uploaded images
- **reviews** - Place reviews
- **tours** - Itineraries (bonus feature)

### Geospatial Features (PostGIS)

The database uses PostGIS extension for advanced geospatial queries:

- **Find places within radius**: Uses `ST_Distance` and `ST_DWithin`
- **Find places in bounds**: Uses `ST_MakeEnvelope`
- **Accurate distance calculations**: Uses `geography` type for Earth's curvature

---

## MinIO (Image Storage)

MinIO runs in a Docker container and stores all uploaded images.

### Access MinIO Console
- URL: http://localhost:9001
- Login: `minioadmin` / `minioadmin`

### Features
- S3-compatible API
- Web UI for browsing files
- Automatic bucket creation (`tourism-images`)
- Public read access configured

### Bucket Structure
```
tourism-images/
├── original/     # Original uploaded images
├── thumbnail/    # 150x150px WebP
├── small/        # 400x300px WebP
├── medium/       # 800x600px WebP
└── large/        # 1200x900px WebP
```

### Switching to AWS S3

To use AWS S3 instead, just change `.env`:
```env
MINIO_ENDPOINT="s3.amazonaws.com"
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY="your-aws-access-key"
MINIO_SECRET_KEY="your-aws-secret-key"
MINIO_BUCKET_NAME="your-s3-bucket"
```

---

## Development Workflow

### 1. Create a New Place via API

1. Upload image first
2. Use returned image ID
3. Create place with image reference

```javascript
// 1. Upload image
const imageResponse = await uploadImage(file);
const imageId = imageResponse.id;

// 2. Create place
await createPlace({
  name: "Place Name",
  latitude: 37.8,
  longitude: -122.4,
  featuredImageId: imageId,
});
```

### 2. Create a Blog with Places

1. Create places first
2. Get place IDs
3. Create blog with place references

```javascript
await createBlog({
  title: "Travel Guide",
  content: "...",
  relatedPlaceIds: [1, 2, 3],  // References to places
});
```

### 3. View Database

```bash
# In backend folder
npm run prisma:studio
```

Opens Prisma Studio at http://localhost:5555

### 4. Reset Database

```bash
# WARNING: Deletes all data
npx prisma migrate reset

# Then re-seed
npm run prisma:seed
```

---

## Common Issues & Solutions

### "Forbidden" Error
- Check if user has required permissions
- Verify JWT token is valid
- Super admin (user ID 1) bypasses all checks

### Images Not Loading
- Check if MinIO is running: `docker-compose ps minio`
- Verify CORS settings allow your frontend domain
- Check bucket exists in MinIO console

### Map Not Showing Places
- Ensure places have latitude/longitude
- Check browser console for errors
- Verify API response has data

### Database Connection Failed
- Check Docker is running: `docker-compose ps`
- Verify DATABASE_URL in .env
- Restart PostgreSQL: `docker-compose restart postgres`

---

## Production Deployment

### Checklist

Backend:
- [ ] Set strong `JWT_SECRET` in production .env
- [ ] Use production database (not localhost)
- [ ] Configure proper CORS origins
- [ ] Set up SSL/HTTPS
- [ ] Use AWS S3 or production MinIO instance
- [ ] Enable API rate limiting (already configured)
- [ ] Set up monitoring and logging
- [ ] Configure automatic backups

Frontend:
- [ ] Update API base URL to production
- [ ] Enable production build optimizations
- [ ] Configure CDN for static assets
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Optimize images and bundle size

---

## Resources

### Documentation
- [API Documentation](./API_DOCUMENTATION.md) - All API endpoints
- [Frontend Quick Start](./FRONTEND_QUICK_START.md) - Code snippets
- [RBAC Guide](../backend/RBAC.md) - Roles and permissions
- [Swagger UI](http://localhost:3000/api/docs) - Interactive API docs

### Technologies
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Leaflet Docs](https://leafletjs.com)
- [PostGIS Docs](https://postgis.net/documentation)
- [MinIO Docs](https://min.io/docs/minio/linux/index.html)

### Tutorials
- [React Leaflet Tutorial](https://react-leaflet.js.org/docs/start-introduction/)
- [JWT Authentication](https://jwt.io/introduction)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)

---

## Project Features Summary

✅ **Places Management** with geospatial search
✅ **Blog System** with place attachments
✅ **Comments** with admin approval
✅ **Image Upload** with automatic processing
✅ **Authentication & Authorization** (RBAC)
✅ **Maps Integration** (OpenStreetMap ready)
✅ **Search & Filtering**
✅ **Categories & Tags**
✅ **Reviews & Ratings**
✅ **Admin Panel** functionality
✅ **Super Admin** (user ID 1)
✅ **Swagger Documentation**
✅ **Docker Setup** (PostgreSQL + MinIO)
✅ **Database Seeding**
✅ **Pagination**
✅ **Rate Limiting**
✅ **CORS Configuration**

---

## Support

**Issues?**
- Check Swagger docs: http://localhost:3000/api/docs
- View database: `npm run prisma:studio`
- Check logs: Terminal where backend is running
- Inspect Docker: `docker-compose logs -f`

**Questions?**
- Read the documentation files in this folder
- Check backend/README.md for more details
- Review API examples in API_DOCUMENTATION.md

---

**Built with ❤️ for Tourism Websites**

Happy Coding! 🚀🗺️
