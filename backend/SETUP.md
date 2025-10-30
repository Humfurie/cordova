# Quick Setup Guide

Follow these steps to get your tourism backend running in minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start Docker Services

```bash
# Start PostgreSQL and MinIO containers
docker-compose up -d

# Verify services are running
docker-compose ps
```

You should see:
- ✅ tourism_postgres (port 5432)
- ✅ tourism_minio (ports 9000, 9001)
- ✅ tourism_pgadmin (port 5050)

## Step 3: Configure Environment

```bash
# Copy the environment template
cp .env.example .env
```

The default configuration works out of the box! But you should change:
- `JWT_SECRET` to a strong random string for production

## Step 4: Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

This will:
1. Create all database tables
2. Enable PostGIS extension for geospatial features
3. Set up indexes for performance

## Step 5: Start the Server

```bash
# Development mode with hot reload
npm run start:dev
```

The server will start on http://localhost:3000

## Step 6: Access the Services

### API Documentation
- Swagger UI: http://localhost:3000/api/docs
- Test endpoints directly in the browser!

### MinIO Console (Image Storage)
- URL: http://localhost:9001
- Login: `minioadmin` / `minioadmin`
- View uploaded images in the `tourism-images` bucket

### PgAdmin (Database Manager)
- URL: http://localhost:5050
- Login: `admin@tourism.local` / `admin`
- Connect to database:
  - Host: `postgres`
  - Port: `5432`
  - Database: `tourism_db`
  - Username: `postgres`
  - Password: `postgres`

### Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```
- Opens at http://localhost:5555
- Visual interface to view/edit data

## Step 7: Test the API

### Create a Place

```bash
curl -X POST http://localhost:3000/api/v1/places \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Golden Gate Bridge",
    "description": "Iconic suspension bridge in San Francisco",
    "latitude": 37.8199,
    "longitude": -122.4783,
    "city": "San Francisco",
    "country": "United States",
    "placeType": "landmark",
    "status": "published"
  }'
```

### Upload an Image

```bash
curl -X POST http://localhost:3000/api/v1/media/upload \
  -F "file=@/path/to/your/image.jpg"
```

### Find Nearby Places

```bash
curl "http://localhost:3000/api/v1/places/nearby?latitude=37.7749&longitude=-122.4194&radiusKm=10"
```

### Search

```bash
curl "http://localhost:3000/api/v1/search?q=san+francisco"
```

## Common Issues

### Port Already in Use

If you get a port conflict error:

```bash
# Find what's using the port
lsof -i :5432  # or :9000, :3000

# Stop Docker services and try again
docker-compose down
docker-compose up -d
```

### Database Connection Failed

```bash
# Check if PostgreSQL container is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart if needed
docker-compose restart postgres
```

### MinIO Not Accessible

```bash
# Check if MinIO container is running
docker-compose ps minio

# Check logs
docker-compose logs minio

# Restart if needed
docker-compose restart minio
```

### Prisma Client Not Generated

```bash
# Regenerate Prisma client
npm run prisma:generate
```

## Next Steps

1. **Seed some data**: Create categories, places, and blogs via the API or Prisma Studio
2. **Test geospatial features**: Try the nearby and in-bounds endpoints
3. **Upload images**: Test the media upload endpoints
4. **Integrate with frontend**: Connect your frontend at `~/Desktop/Projects/Cordova/frontend`

## Frontend Integration Example

In your frontend (React/Vue/etc.):

```javascript
// Fetch places
const response = await fetch('http://localhost:3000/api/v1/places');
const { data, meta } = await response.json();

// Create a place
const newPlace = await fetch('http://localhost:3000/api/v1/places', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Statue of Liberty",
    latitude: 40.6892,
    longitude: -74.0445,
    status: "published"
  })
});

// Upload image
const formData = new FormData();
formData.append('file', file);

const imageResponse = await fetch('http://localhost:3000/api/v1/media/upload', {
  method: 'POST',
  body: formData
});
```

## OpenStreetMap Integration

For the map in your frontend:

```bash
# Install Leaflet
npm install leaflet react-leaflet
```

```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function TourismMap() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/v1/places')
      .then(res => res.json())
      .then(({ data }) => setPlaces(data));
  }, []);

  return (
    <MapContainer center={[37.7749, -122.4194]} zoom={10}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {places.map(place => (
        <Marker key={place.id} position={[place.latitude, place.longitude]}>
          <Popup>{place.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

## Development Workflow

```bash
# Install new package
npm install package-name

# Add to database schema
# Edit prisma/schema.prisma, then:
npm run prisma:migrate

# View database
npm run prisma:studio

# Format code
npm run format

# Lint code
npm run lint
```

## Production Deployment

See the main README.md for production deployment instructions.

---

**You're all set! 🎉**

Start building your tourism website with a powerful backend featuring:
- ✅ Geospatial place search
- ✅ Blog management
- ✅ Image upload & processing
- ✅ OpenStreetMap integration
- ✅ Full-text search
- ✅ Authentication

Happy coding!
