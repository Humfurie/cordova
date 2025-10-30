# Quick Reference Guide

## 🚀 Start the Backend

```bash
cd ~/Desktop/Projects/Cordova/backend

# Start Docker services
docker-compose up -d

# Start backend server
npm run start:dev
```

**Backend:** http://localhost:3000/api/v1
**Swagger Docs:** http://localhost:3000/api/docs
**MinIO Console:** http://localhost:9001

---

## 👥 Test Accounts (After Seeding)

| Role | Email | Password | Can Do |
|------|-------|----------|--------|
| **Super Admin** | admin@tourism.local | admin123 | Everything ♾️ |
| **Admin** | admin.user@tourism.local | admin123 | Manage all content |
| **Author** | author@tourism.local | author123 | Create/edit blogs |
| **Author** | jane.writer@tourism.local | writer123 | Create/edit blogs |
| **User** | user@tourism.local | user123 | View & comment |

---

## 📌 Most Common API Endpoints

### Authentication
```
POST /api/v1/auth/login
POST /api/v1/auth/register
```

### Places
```
GET  /api/v1/places                              # List all
GET  /api/v1/places/nearby?lat=37.7&lng=-122&radiusKm=10
GET  /api/v1/places/in-bounds?swLat=...&swLng=...&neLat=...&neLng=...
GET  /api/v1/places/:id
GET  /api/v1/places/slug/:slug
POST /api/v1/places                              # 🔒 Admin/Author
```

### Blogs
```
GET  /api/v1/blogs                               # List all
GET  /api/v1/blogs/:id
GET  /api/v1/blogs/slug/:slug
POST /api/v1/blogs                               # 🔒 Admin/Author
```

### Comments
```
POST /api/v1/comments/blog/:blogId               # Anyone
GET  /api/v1/comments/blog/:blogId               # Approved only
GET  /api/v1/comments/pending                    # 🔒 Admin
PATCH /api/v1/comments/:id/approve               # 🔒 Admin
```

### Media
```
POST /api/v1/media/upload                        # 🔒 Admin/Author
POST /api/v1/media/upload-multiple
GET  /api/v1/media
```

### Search
```
GET /api/v1/search?q=san+francisco
GET /api/v1/search/trending
```

---

## 🗺️ Map Integration (Frontend)

### Install Leaflet
```bash
npm install leaflet react-leaflet
```

### Fetch Places in Map Bounds
```javascript
const bounds = map.getBounds();
const response = await fetch(
  `/api/v1/places/in-bounds?` +
  `swLat=${bounds.getSouth()}&swLng=${bounds.getWest()}&` +
  `neLat=${bounds.getNorth()}&neLng=${bounds.getEast()}`
);
const { data } = await response.json();
```

### Find Nearby Places
```javascript
const response = await fetch(
  `/api/v1/places/nearby?latitude=37.7749&longitude=-122.4194&radiusKm=10`
);
const { data } = await response.json();
// data includes distanceKm for each place
```

---

## 🖼️ Image Upload

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/v1/media/upload', {
  method: 'POST',
  body: formData,
});

const media = await response.json();
console.log(media.thumbnailUrl);  // Use in place cards
console.log(media.mediumUrl);     // Use in place detail
console.log(media.largeUrl);      // Use in hero images
```

---

## 🔐 Authentication Flow

### 1. Login
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
localStorage.setItem('user', JSON.stringify(user));
```

### 2. Make Authenticated Request
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/v1/places', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ name: 'New Place', ... }),
});
```

### 3. Check Permissions
```javascript
const user = JSON.parse(localStorage.getItem('user'));

if (user.permissions.includes('blogs.create')) {
  // Show create blog button
}

if (user.id === 1) {
  // Super admin - show everything
}
```

---

## 📝 Create Blog with Places

```javascript
const response = await fetch('http://localhost:3000/api/v1/blogs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: 'Best Places in Paris',
    content: '<h1>Travel Guide</h1><p>...</p>',
    relatedPlaceIds: [1, 2, 3],  // Link to places
    featuredImageId: 10,
    status: 'published',
  }),
});
```

When you fetch this blog, it includes the related places:
```javascript
{
  "id": 1,
  "title": "Best Places in Paris",
  "blogPlaces": [
    {
      "place": {
        "id": 1,
        "name": "Eiffel Tower",
        "latitude": 48.8584,
        "longitude": 2.2945,
        // ... full place details
      }
    }
  ]
}
```

---

## 💬 Comments with Approval

### User Submits Comment
```javascript
const response = await fetch('/api/v1/comments/blog/1', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Great post!',
    authorName: 'John Doe',
    authorEmail: 'john@example.com',
  }),
});
// Comment created with status: "pending"
```

### Admin Approves
```javascript
const response = await fetch('/api/v1/comments/5/approve', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
  },
});
// Comment status changed to "approved"
```

### Get Approved Comments
```javascript
const response = await fetch('/api/v1/comments/blog/1');
const comments = await response.json();
// Only returns approved comments
```

---

## 🛠️ Useful Commands

```bash
# Start Docker services
docker-compose up -d

# Stop Docker services
docker-compose down

# View Docker logs
docker-compose logs -f

# Database migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# View database (opens in browser)
npm run prisma:studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Start backend
npm run start:dev

# Build for production
npm run build

# Run production
npm run start:prod
```

---

## 🐛 Common Issues

### Docker services not starting
```bash
# Check if ports are in use
lsof -i :5432  # PostgreSQL
lsof -i :9000  # MinIO

# Restart services
docker-compose restart
```

### Can't login
- Check credentials are correct (case-sensitive)
- Run seeder: `npm run prisma:seed`
- Check backend is running: http://localhost:3000/api/docs

### Images not loading
- Check MinIO is running: `docker-compose ps minio`
- Visit MinIO console: http://localhost:9001
- Check CORS settings in .env

### Permission denied
- Super admin (user ID 1) bypasses all checks
- Check user has required permission
- View in Prisma Studio: `npm run prisma:studio`

---

## 📚 Full Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - All endpoints
- **[Frontend Quick Start](./FRONTEND_QUICK_START.md)** - Code examples
- **[Backend README](../backend/README.md)** - Backend details
- **[RBAC Guide](../backend/RBAC.md)** - Roles & permissions
- **[Seeded Users](../backend/SEEDED_USERS.md)** - Test accounts

---

## 🔗 Quick Links

- Swagger API Docs: http://localhost:3000/api/docs
- MinIO Console: http://localhost:9001
- PgAdmin: http://localhost:5050
- Prisma Studio: `npm run prisma:studio` (opens http://localhost:5555)

---

**Happy Coding! 🚀**
