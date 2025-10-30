# Tourism Website Backend

A comprehensive NestJS backend for a tourism website with geospatial features, blog management, and image storage.

## Features

- **Places/Destinations Management**: Full CRUD with geospatial queries
  - Find places nearby (radius search)
  - Find places in map bounds (viewport)
  - Categories and tags
  - Ratings and reviews
  - Visit tracking

- **Blog/Articles System**: Travel blogs with rich content
  - Link blogs to places
  - Categories and tags
  - View tracking
  - Featured images

- **Image Management**: Upload and automatic processing
  - Multiple sizes (thumbnail, small, medium, large)
  - WebP conversion for optimization
  - MinIO (S3-compatible) storage
  - Sharp image processing

- **Search & Filtering**: Full-text search across places and blogs
  - Search by name, description, location
  - Filter by category, tags, rating
  - Geospatial filtering

- **Authentication**: JWT-based auth with Passport
  - User registration and login
  - Role-based access (admin, author, user)
  - Protected routes

- **Maps Integration**: OpenStreetMap ready
  - Geospatial queries with PostGIS
  - Latitude/longitude storage
  - Distance calculations

## Tech Stack

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL with PostGIS extension
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Image Storage**: MinIO (S3-compatible)
- **Image Processing**: Sharp
- **Maps**: OpenStreetMap (frontend) + PostGIS (backend)
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js 18+ LTS
- Docker and Docker Compose (for PostgreSQL and MinIO)
- npm or yarn

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Start Docker Services

```bash
# Start PostgreSQL and MinIO
docker-compose up -d

# Check services are running
docker-compose ps
```

**Services will be available at:**
- PostgreSQL: `localhost:5432`
- MinIO API: `localhost:9000`
- MinIO Console: `http://localhost:9001` (login: minioadmin/minioadmin)
- PgAdmin: `http://localhost:5050` (login: admin@tourism.local/admin)

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
```

**Default .env configuration:**
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tourism_db?schema=public"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRATION="7d"

# MinIO (matches docker-compose)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_NAME="tourism-images"

# Server
PORT=3000
NODE_ENV=development

# CORS (add your frontend URL)
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
```

### 4. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view/edit data
npm run prisma:studio
```

### 5. Start Development Server

```bash
# Development mode with hot reload
npm run start:dev

# The API will be available at:
# http://localhost:3000/api/v1
# Swagger docs: http://localhost:3000/api/docs
```

## Project Structure

```
src/
├── modules/
│   ├── places/           # Places/destinations management
│   │   ├── dto/          # Data transfer objects
│   │   ├── places.controller.ts
│   │   ├── places.service.ts
│   │   └── places.module.ts
│   ├── blogs/            # Blog/articles management
│   ├── media/            # Image upload & processing
│   │   ├── minio.service.ts    # MinIO integration
│   │   ├── media.service.ts     # Image processing
│   │   └── media.controller.ts
│   ├── categories/       # Categories & tags
│   ├── search/           # Search functionality
│   └── auth/             # Authentication
│       ├── strategies/   # Passport strategies
│       └── guards/       # Auth guards
├── prisma/               # Prisma service
├── common/               # Shared utilities
├── app.module.ts         # Root module
└── main.ts               # Application entry point

prisma/
└── schema.prisma         # Database schema

docker-compose.yml        # Docker services
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs-json

## Key API Endpoints

### Places
- `GET /api/v1/places` - Get all places (with filters)
- `GET /api/v1/places/nearby?latitude=37.7749&longitude=-122.4194&radiusKm=10` - Find nearby places
- `GET /api/v1/places/in-bounds?swLat=37.7&swLng=-122.5&neLat=37.8&neLng=-122.3` - Find places in map bounds
- `GET /api/v1/places/:id` - Get place by ID
- `GET /api/v1/places/slug/:slug` - Get place by slug
- `POST /api/v1/places` - Create place
- `PATCH /api/v1/places/:id` - Update place
- `DELETE /api/v1/places/:id` - Delete place

### Blogs
- `GET /api/v1/blogs` - Get all blogs
- `GET /api/v1/blogs/:id` - Get blog by ID
- `GET /api/v1/blogs/slug/:slug` - Get blog by slug
- `POST /api/v1/blogs` - Create blog
- `PATCH /api/v1/blogs/:id` - Update blog
- `DELETE /api/v1/blogs/:id` - Delete blog

### Media
- `POST /api/v1/media/upload` - Upload single image
- `POST /api/v1/media/upload-multiple` - Upload multiple images
- `GET /api/v1/media` - Get all media
- `GET /api/v1/media/:id` - Get media by ID
- `DELETE /api/v1/media/:id` - Delete media

### Search
- `GET /api/v1/search?q=san+francisco` - Global search
- `GET /api/v1/search/trending` - Get trending content

### Auth
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login

## Geospatial Features

The backend uses **PostgreSQL with PostGIS** for powerful geospatial queries:

### Find Places Nearby
```typescript
GET /api/v1/places/nearby?latitude=37.7749&longitude=-122.4194&radiusKm=10
```

Returns places within 10km of San Francisco, sorted by distance.

### Find Places in Map Bounds
```typescript
GET /api/v1/places/in-bounds?swLat=37.7&swLng=-122.5&neLat=37.8&neLng=-122.3
```

Returns all places visible in the map viewport (useful for map markers).

### Distance Calculation
Uses PostGIS `ST_Distance` for accurate geographical distance calculations.

## Image Upload & Processing

Images are automatically processed into multiple sizes:

1. **Original**: Stored as uploaded
2. **Thumbnail**: 150x150px, WebP
3. **Small**: 400x300px, WebP
4. **Medium**: 800x600px, WebP
5. **Large**: 1200x900px, WebP

**Upload Example:**
```bash
curl -X POST http://localhost:3000/api/v1/media/upload \
  -F "file=@/path/to/image.jpg"
```

**Response:**
```json
{
  "id": 1,
  "filename": "1234567890-image.jpg",
  "url": "http://localhost:9000/tourism-images/original/1234567890-image.jpg",
  "thumbnailUrl": "http://localhost:9000/tourism-images/thumbnail/1234567890-image.webp",
  "mediumUrl": "http://localhost:9000/tourism-images/medium/1234567890-image.webp",
  "largeUrl": "http://localhost:9000/tourism-images/large/1234567890-image.webp"
}
```

## MinIO Setup (Standalone Container)

MinIO is running in a Docker container and provides S3-compatible object storage:

### Access MinIO Console
1. Open http://localhost:9001
2. Login with `minioadmin` / `minioadmin`
3. You can browse uploaded images, create buckets, manage permissions

### MinIO Features
- **S3-Compatible**: Easy migration to AWS S3 later (just change env variables)
- **Web UI**: Browse and manage files visually
- **Buckets**: Images are stored in `tourism-images` bucket
- **Public Access**: Configured for public read access

### Switching to AWS S3
To use AWS S3 instead of MinIO, just update `.env`:
```env
MINIO_ENDPOINT="s3.amazonaws.com"
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY="your-aws-access-key"
MINIO_SECRET_KEY="your-aws-secret-key"
MINIO_BUCKET_NAME="your-s3-bucket"
```

## Database Schema

The database includes:
- **places**: Tourist destinations with geolocation
- **blogs**: Travel articles and guides
- **categories**: Hierarchical categories for places/blogs
- **tags**: Flexible tagging system
- **media**: Image metadata and URLs
- **reviews**: User reviews for places
- **users**: User accounts for authentication
- **tours**: Itineraries with multiple stops
- **points_of_interest**: POIs for maps

### Enable PostGIS
PostGIS extension is automatically enabled via Prisma migrations:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

## Frontend Integration

### OpenStreetMap with Leaflet
Use Leaflet.js in your frontend to display maps:

```javascript
// Example: Fetch places in map bounds
const bounds = map.getBounds();
const response = await fetch(
  `/api/v1/places/in-bounds?` +
  `swLat=${bounds.getSouth()}&swLng=${bounds.getWest()}&` +
  `neLat=${bounds.getNorth()}&neLng=${bounds.getEast()}`
);
const { data } = await response.json();

// Add markers to map
data.forEach(place => {
  L.marker([place.latitude, place.longitude])
    .bindPopup(place.name)
    .addTo(map);
});
```

### Example Place Creation
```javascript
const placeData = {
  name: "Golden Gate Bridge",
  description: "Iconic suspension bridge",
  latitude: 37.8199,
  longitude: -122.4783,
  city: "San Francisco",
  country: "United States",
  categoryId: 1,
  placeType: "landmark",
  status: "published"
};

const response = await fetch('/api/v1/places', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(placeData)
});
```

## Development

### Run Tests
```bash
npm run test
npm run test:watch
npm run test:cov
```

### Linting & Formatting
```bash
npm run lint
npm run format
```

### Database Management
```bash
# Create new migration
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in browser
npm run prisma:studio
```

### Docker Management
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Production Deployment

### Build for Production
```bash
npm run build
npm run start:prod
```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@production-host:5432/tourism_db"
JWT_SECRET="strong-random-secret-key"
MINIO_ENDPOINT="your-production-minio-or-s3"
MINIO_USE_SSL=true
```

### Deployment Checklist
- [ ] Set strong `JWT_SECRET`
- [ ] Use production database
- [ ] Configure CORS for your frontend domain
- [ ] Set up SSL/HTTPS
- [ ] Configure MinIO or AWS S3 for production
- [ ] Enable rate limiting (already configured)
- [ ] Set up monitoring and logging
- [ ] Regular database backups

## Troubleshooting

### Docker Services Not Starting
```bash
# Check if ports are already in use
lsof -i :5432  # PostgreSQL
lsof -i :9000  # MinIO

# Restart services
docker-compose restart
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection
docker-compose exec postgres psql -U postgres -d tourism_db -c "SELECT version();"
```

### MinIO Connection Issues
```bash
# Check MinIO is running
docker-compose ps minio

# Check MinIO health
curl http://localhost:9000/minio/health/live
```

### Prisma Migration Issues
```bash
# Reset and rerun migrations
npx prisma migrate reset
npm run prisma:migrate
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

ISC

## Support

For issues and questions:
- GitHub Issues: [Your Repository]
- Documentation: http://localhost:3000/api/docs

---

**Happy coding! 🚀**
