# Tourism API Documentation

Complete API documentation for frontend integration.

**Base URL**: `http://localhost:3000/api/v1`

**Swagger UI**: http://localhost:3000/api/docs

---

## Table of Contents

1. [Authentication](#authentication)
2. [Places](#places)
3. [Blogs](#blogs)
4. [Comments](#comments)
5. [Media/Images](#media-images)
6. [Categories & Tags](#categories--tags)
7. [Search](#search)
8. [Error Handling](#error-handling)
9. [Frontend Examples](#frontend-examples)

---

## Authentication

### Register New User

**POST** `/auth/register`

Creates a new user account with "user" role.

```javascript
// Request
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

// Response (201 Created)
{
  "id": 2,
  "email": "user@example.com",
  "name": "John Doe",
  "roleId": 4,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "role": {
    "id": 4,
    "name": "user"
  }
}
```

### Login

**POST** `/auth/login`

Authenticate and receive JWT token.

```javascript
// Request
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@tourism.local",
  "password": "admin123"
}

// Response (200 OK)
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@tourism.local",
    "name": "Super Admin",
    "role": "super_admin",
    "permissions": [
      "places.create",
      "places.update",
      "blogs.create",
      // ... all permissions
    ]
  }
}
```

**Store the token** for subsequent requests:
```javascript
localStorage.setItem('token', response.access_token);
```

---

## Places

### Get All Places

**GET** `/places`

Retrieve places with filters and pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `search` (string) - Search by name, description, city
- `categoryId` (number) - Filter by category
- `placeType` (string) - Filter by type: attraction, restaurant, hotel, etc.
- `status` (string, default: published) - draft, published, archived
- `city` (string) - Filter by city
- `country` (string) - Filter by country
- `tagIds` (array) - Filter by tag IDs
- `isFeatured` (boolean) - Featured places only
- `minRating` (number) - Minimum rating (0-5)
- `sortBy` (string) - rating, name, createdAt, visitCount
- `sortOrder` (string) - asc, desc

```javascript
// Request
GET /api/v1/places?page=1&limit=20&city=San%20Francisco&minRating=4

// Response (200 OK)
{
  "data": [
    {
      "id": 1,
      "name": "Golden Gate Bridge",
      "slug": "golden-gate-bridge-123456",
      "description": "Iconic suspension bridge...",
      "shortDescription": "Visit the iconic bridge...",
      "latitude": 37.8199,
      "longitude": -122.4783,
      "address": "Golden Gate Bridge, San Francisco, CA",
      "city": "San Francisco",
      "state": "California",
      "country": "United States",
      "placeType": "landmark",
      "rating": 4.8,
      "reviewCount": 1250,
      "visitCount": 15420,
      "isFeatured": true,
      "status": "published",
      "category": {
        "id": 1,
        "name": "Attractions",
        "slug": "attractions"
      },
      "tags": [
        { "id": 1, "name": "Family Friendly", "slug": "family-friendly" },
        { "id": 4, "name": "Cultural", "slug": "cultural" }
      ],
      "featuredImage": {
        "id": 10,
        "url": "http://localhost:9000/tourism-images/original/image.jpg",
        "thumbnailUrl": "http://localhost:9000/tourism-images/thumbnail/image.webp",
        "mediumUrl": "http://localhost:9000/tourism-images/medium/image.webp",
        "largeUrl": "http://localhost:9000/tourism-images/large/image.webp"
      },
      "createdAt": "2024-01-10T10:00:00.000Z",
      "publishedAt": "2024-01-10T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Find Nearby Places

**GET** `/places/nearby`

Find places within a radius from coordinates (uses PostGIS for accurate calculations).

**Query Parameters:**
- `latitude` (number, required) - Center latitude
- `longitude` (number, required) - Center longitude
- `radiusKm` (number, default: 10) - Search radius in kilometers
- `status` (string, default: published)

```javascript
// Request
GET /api/v1/places/nearby?latitude=37.7749&longitude=-122.4194&radiusKm=5

// Response (200 OK)
{
  "data": [
    {
      "id": 1,
      "name": "Golden Gate Bridge",
      "latitude": 37.8199,
      "longitude": -122.4783,
      "distanceKm": 4.52,  // Distance from search point
      // ... other place fields
    },
    {
      "id": 2,
      "name": "Fisherman's Wharf",
      "latitude": 37.8080,
      "longitude": -122.4177,
      "distanceKm": 3.85,
      // ... other place fields
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2,
    "centerPoint": {
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "radiusKm": 5
  }
}
```

### Find Places in Map Bounds

**GET** `/places/in-bounds`

Get all places visible in a map viewport (useful for map markers).

**Query Parameters:**
- `swLat` (number, required) - Southwest corner latitude
- `swLng` (number, required) - Southwest corner longitude
- `neLat` (number, required) - Northeast corner latitude
- `neLng` (number, required) - Northeast corner longitude

```javascript
// Request - Get places visible in current map view
GET /api/v1/places/in-bounds?swLat=37.7&swLng=-122.5&neLat=37.8&neLng=-122.3

// Response (200 OK)
{
  "data": [
    // Places within the bounding box
  ],
  "meta": {
    "total": 42,
    "bounds": {
      "southwest": { "lat": 37.7, "lng": -122.5 },
      "northeast": { "lat": 37.8, "lng": -122.3 }
    }
  }
}
```

### Get Place by ID

**GET** `/places/:id`

```javascript
// Request
GET /api/v1/places/1

// Response (200 OK)
{
  "id": 1,
  "name": "Golden Gate Bridge",
  // ... all place fields
  "media": [
    {
      "id": 1,
      "displayOrder": 0,
      "media": {
        "id": 10,
        "url": "http://localhost:9000/tourism-images/original/image1.jpg",
        "thumbnailUrl": "...",
        "mediumUrl": "...",
        "largeUrl": "..."
      }
    }
  ],
  "reviews": [
    {
      "id": 1,
      "authorName": "Jane Smith",
      "rating": 5,
      "title": "Amazing experience!",
      "content": "Absolutely stunning...",
      "createdAt": "2024-01-12T14:30:00.000Z"
    }
  ]
}
```

### Get Place by Slug

**GET** `/places/slug/:slug`

```javascript
// Request
GET /api/v1/places/slug/golden-gate-bridge-123456

// Response: Same as Get by ID
```

### Create Place

**POST** `/places`
🔒 **Requires Authentication** (Admin/Author only)

```javascript
// Request
POST /api/v1/places
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Alcatraz Island",
  "description": "Historic island prison and lighthouse...",
  "shortDescription": "Former federal prison on an island...",
  "latitude": 37.8267,
  "longitude": -122.4230,
  "address": "Alcatraz Island, San Francisco Bay",
  "city": "San Francisco",
  "state": "California",
  "country": "United States",
  "categoryId": 1,
  "placeType": "landmark",
  "tagIds": [1, 4, 5],
  "featuredImageId": 15,
  "openingHours": {
    "monday": "9:00 AM - 5:00 PM",
    "tuesday": "9:00 AM - 5:00 PM",
    "wednesday": "9:00 AM - 5:00 PM",
    "thursday": "9:00 AM - 5:00 PM",
    "friday": "9:00 AM - 5:00 PM",
    "saturday": "9:00 AM - 6:00 PM",
    "sunday": "9:00 AM - 6:00 PM"
  },
  "contactInfo": {
    "phone": "+1-415-981-7625",
    "website": "https://www.nps.gov/alca",
    "email": "info@alcatraz.com"
  },
  "admissionFee": {
    "adult": 39.90,
    "child": 24.40,
    "currency": "USD"
  },
  "status": "published",
  "isFeatured": true
}

// Response (201 Created)
{
  "id": 2,
  "name": "Alcatraz Island",
  "slug": "alcatraz-island-987654",
  // ... all fields
}
```

### Update Place

**PATCH** `/places/:id`
🔒 **Requires Authentication** (Admin/Author only)

```javascript
// Request
PATCH /api/v1/places/2
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "description": "Updated description...",
  "rating": 4.7
}

// Response (200 OK)
{
  "id": 2,
  // ... updated place
}
```

### Delete Place

**DELETE** `/places/:id`
🔒 **Requires Authentication** (Admin only)

```javascript
// Request
DELETE /api/v1/places/2
Authorization: Bearer YOUR_TOKEN

// Response (200 OK)
{
  "message": "Place deleted successfully"
}
```

---

## Blogs

### Get All Blogs

**GET** `/blogs`

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `search` (string) - Search by title, content
- `categoryId` (number) - Filter by category
- `status` (string, default: published)
- `isFeatured` (boolean)
- `tagIds` (array)
- `sortBy` (string) - createdAt, viewCount, title
- `sortOrder` (string) - asc, desc

```javascript
// Request
GET /api/v1/blogs?page=1&limit=10&isFeatured=true

// Response (200 OK)
{
  "data": [
    {
      "id": 1,
      "title": "10 Best Places to Visit in San Francisco",
      "slug": "best-places-san-francisco-123456",
      "content": "Full blog content in HTML or markdown...",
      "excerpt": "Short summary of the blog...",
      "authorName": "Travel Expert",
      "viewCount": 1520,
      "readTime": 5,
      "isFeatured": true,
      "status": "published",
      "category": {
        "id": 6,
        "name": "Travel Guides"
      },
      "tags": [
        { "id": 1, "name": "San Francisco" }
      ],
      "featuredImage": {
        "id": 20,
        "url": "...",
        "thumbnailUrl": "...",
        "mediumUrl": "...",
        "largeUrl": "..."
      },
      "publishedAt": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-14T15:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Get Blog by ID

**GET** `/blogs/:id`

```javascript
// Request
GET /api/v1/blogs/1

// Response (200 OK)
{
  "id": 1,
  "title": "10 Best Places to Visit in San Francisco",
  // ... all blog fields
  "blogPlaces": [
    {
      "id": 1,
      "place": {
        "id": 1,
        "name": "Golden Gate Bridge",
        "latitude": 37.8199,
        "longitude": -122.4783,
        "featuredImage": { ... },
        "category": { ... }
      }
    },
    {
      "id": 2,
      "place": {
        "id": 3,
        "name": "Alcatraz Island",
        // ...
      }
    }
  ]
}
```

### Get Blog by Slug

**GET** `/blogs/slug/:slug`

```javascript
// Request
GET /api/v1/blogs/slug/best-places-san-francisco-123456

// Response: Same as Get by ID
```

### Create Blog

**POST** `/blogs`
🔒 **Requires Authentication** (Admin/Author only)

```javascript
// Request
POST /api/v1/blogs
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Ultimate Guide to Paris",
  "content": "<h1>Paris Travel Guide</h1><p>Full HTML content...</p>",
  "excerpt": "Everything you need to know about visiting Paris",
  "authorName": "Jane Doe",
  "categoryId": 6,
  "tagIds": [1, 2, 5],
  "featuredImageId": 25,
  "readTime": 10,
  "relatedPlaceIds": [5, 7, 9],  // Links blog to places
  "status": "published",
  "isFeatured": true,
  "metaTitle": "Paris Travel Guide - Best Places to Visit",
  "metaDescription": "Comprehensive guide to visiting Paris...",
  "keywords": ["paris", "france", "travel guide", "eiffel tower"]
}

// Response (201 Created)
{
  "id": 2,
  "title": "Ultimate Guide to Paris",
  "slug": "ultimate-guide-paris-789012",
  // ... all fields
}
```

### Update Blog

**PATCH** `/blogs/:id`
🔒 **Requires Authentication** (Admin/Author only)

```javascript
// Request
PATCH /api/v1/blogs/2
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}

// Response (200 OK)
{
  "id": 2,
  // ... updated blog
}
```

### Delete Blog

**DELETE** `/blogs/:id`
🔒 **Requires Authentication** (Admin only)

```javascript
// Request
DELETE /api/v1/blogs/2
Authorization: Bearer YOUR_TOKEN

// Response (200 OK)
{
  "message": "Blog deleted successfully"
}
```

---

## Comments

### Add Comment to Blog

**POST** `/comments/blog/:blogId`

Anyone can comment (authentication optional). Comments need admin approval.

```javascript
// Request
POST /api/v1/comments/blog/1
Content-Type: application/json

{
  "content": "Great article! Very helpful for planning my trip.",
  "authorName": "John Smith",  // Optional if authenticated
  "authorEmail": "john@example.com"  // Optional if authenticated
}

// Response (201 Created)
{
  "id": 1,
  "blogId": 1,
  "content": "Great article!...",
  "authorName": "John Smith",
  "status": "pending",  // Needs approval
  "createdAt": "2024-01-15T14:30:00.000Z"
}
```

### Get Comments for Blog

**GET** `/comments/blog/:blogId`

Returns only approved comments.

```javascript
// Request
GET /api/v1/comments/blog/1

// Response (200 OK)
[
  {
    "id": 1,
    "content": "Great article!...",
    "authorName": "John Smith",
    "status": "approved",
    "createdAt": "2024-01-15T14:30:00.000Z",
    "user": {
      "id": 5,
      "name": "John Smith"
    }
  }
]
```

### Get Pending Comments

**GET** `/comments/pending`
🔒 **Requires Authentication** (Admin only)

```javascript
// Request
GET /api/v1/comments/pending
Authorization: Bearer YOUR_TOKEN

// Response (200 OK)
[
  {
    "id": 2,
    "content": "Nice post!",
    "status": "pending",
    "blog": {
      "id": 1,
      "title": "10 Best Places..."
    },
    "createdAt": "2024-01-15T15:00:00.000Z"
  }
]
```

### Approve Comment

**PATCH** `/comments/:id/approve`
🔒 **Requires Authentication** (Admin only)

```javascript
// Request
PATCH /api/v1/comments/2/approve
Authorization: Bearer YOUR_TOKEN

// Response (200 OK)
{
  "id": 2,
  "status": "approved",
  // ...
}
```

### Reject Comment

**PATCH** `/comments/:id/reject`
🔒 **Requires Authentication** (Admin only)

```javascript
// Request
PATCH /api/v1/comments/2/reject
Authorization: Bearer YOUR_TOKEN

// Response (200 OK)
{
  "id": 2,
  "status": "rejected",
  // ...
}
```

### Delete Comment

**DELETE** `/comments/:id`
🔒 **Requires Authentication** (Admin or comment author)

```javascript
// Request
DELETE /api/v1/comments/2
Authorization: Bearer YOUR_TOKEN

// Response (200 OK)
{
  "message": "Comment deleted successfully"
}
```

---

## Media (Images)

### Upload Single Image

**POST** `/media/upload`

Automatically creates multiple sizes (thumbnail, small, medium, large) in WebP format.

```javascript
// Request (using FormData)
POST /api/v1/media/upload
Content-Type: multipart/form-data

const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/v1/media/upload', {
  method: 'POST',
  body: formData
});

// Response (201 Created)
{
  "id": 30,
  "filename": "1705326000000-golden-gate.jpg",
  "originalFilename": "golden-gate.jpg",
  "mimeType": "image/jpeg",
  "size": 2548623,
  "width": 4032,
  "height": 3024,
  "url": "http://localhost:9000/tourism-images/original/1705326000000-golden-gate.jpg",
  "thumbnailUrl": "http://localhost:9000/tourism-images/thumbnail/1705326000000-golden-gate.webp",
  "mediumUrl": "http://localhost:9000/tourism-images/medium/1705326000000-golden-gate.webp",
  "largeUrl": "http://localhost:9000/tourism-images/large/1705326000000-golden-gate.webp",
  "altText": null,
  "caption": null,
  "createdAt": "2024-01-15T12:00:00.000Z"
}
```

### Upload Multiple Images

**POST** `/media/upload-multiple`

Upload up to 10 images at once.

```javascript
// Request
POST /api/v1/media/upload-multiple
Content-Type: multipart/form-data

const formData = new FormData();
for (let file of fileInput.files) {
  formData.append('files', file);
}

fetch('/api/v1/media/upload-multiple', {
  method: 'POST',
  body: formData
});

// Response (201 Created)
[
  {
    "id": 31,
    "filename": "...",
    // ... first image
  },
  {
    "id": 32,
    "filename": "...",
    // ... second image
  }
]
```

### Get All Media

**GET** `/media`

```javascript
// Request
GET /api/v1/media?page=1&limit=50

// Response (200 OK)
{
  "data": [
    {
      "id": 30,
      "filename": "...",
      "url": "...",
      "thumbnailUrl": "...",
      "mediumUrl": "...",
      "largeUrl": "...",
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "totalPages": 3
  }
}
```

### Get Media by ID

**GET** `/media/:id`

```javascript
// Request
GET /api/v1/media/30

// Response (200 OK)
{
  "id": 30,
  "filename": "...",
  // ... all media fields
}
```

### Delete Media

**DELETE** `/media/:id`
🔒 **Requires Authentication** (Admin only)

```javascript
// Request
DELETE /api/v1/media/30
Authorization: Bearer YOUR_TOKEN

// Response (200 OK)
{
  "message": "Media deleted successfully"
}
```

---

## Categories & Tags

### Get All Categories

**GET** `/categories`

```javascript
// Request
GET /api/v1/categories

// Response (200 OK)
[
  {
    "id": 1,
    "name": "Attractions",
    "slug": "attractions",
    "icon": "🎡",
    "description": null,
    "displayOrder": 0,
    "_count": {
      "places": 45,
      "blogs": 12
    }
  },
  {
    "id": 2,
    "name": "Restaurants",
    "slug": "restaurants",
    "icon": "🍴",
    "_count": {
      "places": 30,
      "blogs": 8
    }
  }
]
```

### Get Category by ID

**GET** `/categories/:id`

```javascript
// Request
GET /api/v1/categories/1

// Response (200 OK)
{
  "id": 1,
  "name": "Attractions",
  "slug": "attractions",
  "icon": "🎡",
  "places": [
    {
      "id": 1,
      "name": "Golden Gate Bridge",
      // ... place details
    }
  ],
  "blogs": [
    {
      "id": 1,
      "title": "Best Attractions...",
      // ... blog details
    }
  ]
}
```

---

## Search

### Global Search

**GET** `/search`

Search across places and blogs.

**Query Parameters:**
- `q` (string, required) - Search query
- `type` (string) - Filter by type: "places" or "blogs"
- `limit` (number, default: 20)

```javascript
// Request
GET /api/v1/search?q=san+francisco&limit=10

// Response (200 OK)
{
  "query": "san francisco",
  "places": [
    {
      "id": 1,
      "name": "Golden Gate Bridge",
      "city": "San Francisco",
      // ... place fields
    }
  ],
  "blogs": [
    {
      "id": 1,
      "title": "10 Best Places to Visit in San Francisco",
      // ... blog fields
    }
  ],
  "total": 15
}
```

### Search Places Only

```javascript
// Request
GET /api/v1/search?q=beach&type=places

// Response
{
  "query": "beach",
  "places": [ ... ],
  "blogs": [],
  "total": 8
}
```

### Get Trending Content

**GET** `/search/trending`

```javascript
// Request
GET /api/v1/search/trending

// Response (200 OK)
{
  "trendingPlaces": [
    {
      "id": 1,
      "name": "Golden Gate Bridge",
      "slug": "golden-gate-bridge-123456",
      "visitCount": 15420
    }
  ],
  "trendingBlogs": [
    {
      "id": 1,
      "title": "10 Best Places...",
      "slug": "best-places-123456",
      "viewCount": 1520
    }
  ]
}
```

---

## Error Handling

### Error Response Format

```javascript
// 400 Bad Request
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}

// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// 403 Forbidden
{
  "statusCode": 403,
  "message": "Forbidden - Admin role required"
}

// 404 Not Found
{
  "statusCode": 404,
  "message": "Place with ID 999 not found",
  "error": "Not Found"
}

// 500 Internal Server Error
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Frontend Examples

### Complete Authentication Flow

```javascript
// 1. Login
async function login(email, password) {
  const response = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const { access_token, user } = await response.json();

  // Store token and user
  localStorage.setItem('token', access_token);
  localStorage.setItem('user', JSON.stringify(user));

  return user;
}

// 2. Make authenticated request
async function createPlace(placeData) {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/api/v1/places', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(placeData),
  });

  if (!response.ok) {
    throw new Error('Failed to create place');
  }

  return await response.json();
}

// 3. Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// 4. Check if user is authenticated
function isAuthenticated() {
  return localStorage.getItem('token') !== null;
}

// 5. Get current user
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// 6. Check permissions
function hasPermission(permission) {
  const user = getCurrentUser();
  return user && user.permissions.includes(permission);
}
```

### Displaying Places on a Map (Leaflet)

```jsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useState, useEffect } from 'react';

function TourismMap() {
  const [places, setPlaces] = useState([]);
  const [bounds, setBounds] = useState(null);

  // Fetch places when map bounds change
  function MapBoundsHandler() {
    const map = useMap();

    useEffect(() => {
      const updateBounds = () => {
        const bounds = map.getBounds();
        const swLat = bounds.getSouth();
        const swLng = bounds.getWest();
        const neLat = bounds.getNorth();
        const neLng = bounds.getEast();

        // Fetch places in visible area
        fetch(
          `http://localhost:3000/api/v1/places/in-bounds?` +
          `swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}`
        )
          .then(res => res.json())
          .then(({ data }) => setPlaces(data));
      };

      map.on('moveend', updateBounds);
      updateBounds(); // Initial load

      return () => map.off('moveend', updateBounds);
    }, [map]);

    return null;
  }

  return (
    <MapContainer
      center={[37.7749, -122.4194]}
      zoom={12}
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <MapBoundsHandler />

      {places.map(place => (
        <Marker key={place.id} position={[place.latitude, place.longitude]}>
          <Popup>
            <div>
              <h3>{place.name}</h3>
              <p>{place.shortDescription}</p>
              <p>Rating: {place.rating} ⭐</p>
              <a href={`/places/${place.slug}`}>View Details</a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

### Finding Nearby Places (Location-Based)

```javascript
async function findNearbyPlaces(latitude, longitude, radiusKm = 10) {
  const response = await fetch(
    `http://localhost:3000/api/v1/places/nearby?` +
    `latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`
  );

  const { data, meta } = await response.json();

  return data.map(place => ({
    ...place,
    distance: `${place.distanceKm.toFixed(2)} km away`,
  }));
}

// Use with browser geolocation
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  const nearbyPlaces = await findNearbyPlaces(latitude, longitude, 5);
  console.log(nearbyPlaces);
});
```

### Image Upload with Preview

```jsx
function ImageUpload({ onUploadComplete }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/api/v1/media/upload', {
        method: 'POST',
        body: formData,
      });

      const media = await response.json();
      onUploadComplete(media);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {uploading && <p>Uploading...</p>}
      {preview && <img src={preview} alt="Preview" style={{ maxWidth: '200px' }} />}
    </div>
  );
}
```

### Pagination Component

```jsx
function PlacesList() {
  const [places, setPlaces] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetch(`http://localhost:3000/api/v1/places?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(({ data, meta }) => {
        setPlaces(data);
        setTotalPages(meta.totalPages);
      });
  }, [page]);

  return (
    <div>
      <div className="places-grid">
        {places.map(place => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span>Page {page} of {totalPages}</span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## Rate Limiting

The API has rate limiting enabled:
- **100 requests per minute** per IP address
- Returns `429 Too Many Requests` if exceeded

---

## CORS

The backend allows requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000`

Add your frontend URL to `.env`:
```
CORS_ORIGIN="http://localhost:5173,https://your-domain.com"
```

---

## Best Practices

1. **Always handle errors** from API calls
2. **Store JWT token securely** (localStorage or httpOnly cookie)
3. **Check token expiration** and refresh if needed
4. **Use pagination** for large datasets
5. **Optimize images** - use thumbnail for lists, large for detail pages
6. **Debounce search** to avoid too many requests
7. **Cache responses** when appropriate
8. **Show loading states** during API calls
9. **Validate user input** before sending to API
10. **Check user permissions** before showing UI elements

---

## Support

- **Swagger Documentation**: http://localhost:3000/api/docs
- **Prisma Studio** (Database GUI): `npm run prisma:studio`
- **Backend Logs**: Check terminal where backend is running

---

**Happy Coding! 🚀**
