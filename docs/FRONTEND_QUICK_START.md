# Frontend Quick Start Guide

Quick copy-paste code snippets for common tourism website features.

## Setup

### Install Dependencies

```bash
# React + Leaflet (for maps)
npm install leaflet react-leaflet

# Optional: TanStack Query (React Query) for data fetching
npm install @tanstack/react-query

# Optional: Axios for API calls
npm install axios
```

### API Configuration

Create `src/config/api.js`:

```javascript
export const API_BASE_URL = 'http://localhost:3000/api/v1';

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
```

---

## 1. Authentication

### Login Component

```jsx
import { useState } from 'react';
import { API_BASE_URL } from '../config/api';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const { access_token, user } = await response.json();

      // Store token and user
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      {error && <div className="error">{error}</div>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">Login</button>

      <p>Default: admin@tourism.local / admin123</p>
    </form>
  );
}

export default LoginForm;
```

### Protected Route Component

```jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredPermission }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredPermission && !user.permissions.includes(requiredPermission)) {
    return <div>Access Denied - Insufficient Permissions</div>;
  }

  return children;
}

// Usage:
// <ProtectedRoute requiredPermission="blogs.create">
//   <CreateBlogPage />
// </ProtectedRoute>
```

---

## 2. Places List with Filters

```jsx
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

function PlacesList() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    categoryId: '',
    minRating: '',
  });

  useEffect(() => {
    fetchPlaces();
  }, [page, filters]);

  async function fetchPlaces() {
    setLoading(true);

    const params = new URLSearchParams({
      page,
      limit: 20,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      ),
    });

    try {
      const response = await fetch(`${API_BASE_URL}/places?${params}`);
      const { data, meta } = await response.json();

      setPlaces(data);
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        <input
          type="text"
          placeholder="City"
          value={filters.city}
          onChange={(e) => handleFilterChange('city', e.target.value)}
        />

        <select
          value={filters.minRating}
          onChange={(e) => handleFilterChange('minRating', e.target.value)}
        >
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
        </select>
      </div>

      {/* Places Grid */}
      <div className="places-grid">
        {places.map(place => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>

      {/* Pagination */}
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

function PlaceCard({ place }) {
  return (
    <div className="place-card">
      {place.featuredImage && (
        <img
          src={place.featuredImage.mediumUrl}
          alt={place.name}
          loading="lazy"
        />
      )}

      <h3>{place.name}</h3>
      <p>{place.shortDescription}</p>

      <div className="place-meta">
        <span>⭐ {place.rating}</span>
        <span>📍 {place.city}</span>
        {place.category && <span>🏷️ {place.category.name}</span>}
      </div>

      <a href={`/places/${place.slug}`}>View Details</a>
    </div>
  );
}

export default PlacesList;
```

---

## 3. Interactive Map with Places

```jsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { API_BASE_URL } from '../config/api';

// Fix Leaflet default marker icons
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function TourismMap() {
  const [places, setPlaces] = useState([]);

  function MapBoundsHandler() {
    const map = useMap();

    useEffect(() => {
      async function fetchPlacesInBounds() {
        const bounds = map.getBounds();
        const params = new URLSearchParams({
          swLat: bounds.getSouth(),
          swLng: bounds.getWest(),
          neLat: bounds.getNorth(),
          neLng: bounds.getEast(),
        });

        const response = await fetch(`${API_BASE_URL}/places/in-bounds?${params}`);
        const { data } = await response.json();
        setPlaces(data);
      }

      map.on('moveend', fetchPlacesInBounds);
      fetchPlacesInBounds(); // Initial load

      return () => map.off('moveend', fetchPlacesInBounds);
    }, [map]);

    return null;
  }

  return (
    <MapContainer
      center={[37.7749, -122.4194]}
      zoom={12}
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <MapBoundsHandler />

      {places.map(place => (
        <Marker key={place.id} position={[place.latitude, place.longitude]}>
          <Popup>
            <div style={{ minWidth: '200px' }}>
              {place.featuredImage && (
                <img
                  src={place.featuredImage.thumbnailUrl}
                  alt={place.name}
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              )}
              <h3>{place.name}</h3>
              <p>{place.shortDescription}</p>
              <div>
                <span>⭐ {place.rating}</span>
                <span> • </span>
                <span>{place.reviewCount} reviews</span>
              </div>
              <a href={`/places/${place.slug}`}>View Details</a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default TourismMap;
```

---

## 4. Nearby Places (Geolocation)

```jsx
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

function NearbyPlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        fetchNearbyPlaces(latitude, longitude);
      },
      (error) => {
        setError('Unable to get your location');
        setLoading(false);
      }
    );
  }

  async function fetchNearbyPlaces(latitude, longitude, radiusKm = 10) {
    try {
      const params = new URLSearchParams({
        latitude,
        longitude,
        radiusKm,
      });

      const response = await fetch(`${API_BASE_URL}/places/nearby?${params}`);
      const { data } = await response.json();

      setPlaces(data);
    } catch (err) {
      setError('Error fetching nearby places');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Getting your location...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Places Near You</h2>
      <p>Showing places within 10km of your location</p>

      <div className="places-list">
        {places.map(place => (
          <div key={place.id} className="place-item">
            <h3>{place.name}</h3>
            <p>{place.shortDescription}</p>
            <p><strong>{place.distanceKm.toFixed(2)} km away</strong></p>
            <p>⭐ {place.rating}</p>
            <a href={`/places/${place.slug}`}>View Details</a>
          </div>
        ))}
      </div>

      {places.length === 0 && (
        <p>No places found near you. Try expanding your search radius.</p>
      )}
    </div>
  );
}

export default NearbyPlaces;
```

---

## 5. Blog with Related Places

```jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  async function fetchBlog() {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/slug/${slug}`);
      const data = await response.json();
      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!blog) return <div>Blog not found</div>;

  return (
    <article className="blog-detail">
      {/* Header */}
      <header>
        {blog.featuredImage && (
          <img
            src={blog.featuredImage.largeUrl}
            alt={blog.title}
            className="featured-image"
          />
        )}

        <h1>{blog.title}</h1>

        <div className="blog-meta">
          <span>By {blog.authorName}</span>
          <span>•</span>
          <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{blog.readTime} min read</span>
          <span>•</span>
          <span>{blog.viewCount} views</span>
        </div>

        {blog.tags && (
          <div className="tags">
            {blog.tags.map(tag => (
              <span key={tag.id} className="tag">{tag.name}</span>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Related Places (shown on map and list) */}
      {blog.blogPlaces && blog.blogPlaces.length > 0 && (
        <section className="related-places">
          <h2>Places Mentioned in This Article</h2>

          <div className="places-grid">
            {blog.blogPlaces.map(({ place }) => (
              <div key={place.id} className="place-card">
                {place.featuredImage && (
                  <img src={place.featuredImage.mediumUrl} alt={place.name} />
                )}
                <h3>{place.name}</h3>
                <p>{place.city}, {place.country}</p>
                <p>⭐ {place.rating}</p>
                <a href={`/places/${place.slug}`}>View Details</a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comments */}
      <CommentsSection blogId={blog.id} />
    </article>
  );
}

export default BlogDetailPage;
```

---

## 6. Comments Section

```jsx
import { useState, useEffect } from 'react';
import { API_BASE_URL, getAuthHeader } from '../config/api';

function CommentsSection({ blogId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  async function fetchComments() {
    const response = await fetch(`${API_BASE_URL}/comments/blog/${blogId}`);
    const data = await response.json();
    setComments(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/comments/blog/${blogId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          content: newComment,
          authorName,
          authorEmail,
        }),
      });

      if (response.ok) {
        setNewComment('');
        setAuthorName('');
        setAuthorEmail('');
        alert('Comment submitted! It will appear after admin approval.');
      }
    } catch (error) {
      alert('Error submitting comment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="comments-section">
      <h2>Comments ({comments.length})</h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="comment-form">
        <h3>Leave a Comment</h3>

        <textarea
          placeholder="Your comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Your Name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Your Email"
          value={authorEmail}
          onChange={(e) => setAuthorEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment">
            <div className="comment-header">
              <strong>{comment.authorName || comment.user?.name}</strong>
              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
            <p>{comment.content}</p>
          </div>
        ))}

        {comments.length === 0 && (
          <p>No comments yet. Be the first to comment!</p>
        )}
      </div>
    </section>
  );
}

export default CommentsSection;
```

---

## 7. Image Upload

```jsx
import { useState } from 'react';
import { API_BASE_URL } from '../config/api';

function ImageUploader({ onUploadComplete }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload
    await uploadImage(file);
  }

  async function uploadImage(file) {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const media = JSON.parse(xhr.responseText);
          onUploadComplete(media);
          alert('Image uploaded successfully!');
        } else {
          alert('Upload failed');
        }
        setUploading(false);
      });

      xhr.open('POST', `${API_BASE_URL}/media/upload`);
      xhr.send(formData);
    } catch (error) {
      alert('Error uploading image');
      setUploading(false);
    }
  }

  return (
    <div className="image-uploader">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>{progress.toFixed(0)}% uploaded</p>
        </div>
      )}

      {preview && !uploading && (
        <div className="preview">
          <img src={preview} alt="Preview" style={{ maxWidth: '300px' }} />
        </div>
      )}
    </div>
  );
}

// Usage:
// <ImageUploader
//   onUploadComplete={(media) => {
//     console.log('Uploaded:', media);
//     // Use media.id when creating place/blog
//   }}
// />

export default ImageUploader;
```

---

## 8. Search Component

```jsx
import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { API_BASE_URL } from '../config/api';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500); // Wait 500ms after user stops typing

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchContent();
    } else {
      setResults(null);
    }
  }, [debouncedQuery]);

  async function searchContent() {
    setLoading(true);

    try {
      const params = new URLSearchParams({ q: debouncedQuery });
      const response = await fetch(`${API_BASE_URL}/search?${params}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="search-container">
      <input
        type="search"
        placeholder="Search places and blogs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />

      {loading && <div className="search-loading">Searching...</div>}

      {results && (
        <div className="search-results">
          {/* Places */}
          {results.places.length > 0 && (
            <div className="search-section">
              <h3>Places ({results.places.length})</h3>
              {results.places.map(place => (
                <a
                  key={place.id}
                  href={`/places/${place.slug}`}
                  className="search-result-item"
                >
                  {place.featuredImage && (
                    <img src={place.featuredImage.thumbnailUrl} alt={place.name} />
                  )}
                  <div>
                    <h4>{place.name}</h4>
                    <p>{place.city}, {place.country}</p>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Blogs */}
          {results.blogs.length > 0 && (
            <div className="search-section">
              <h3>Blogs ({results.blogs.length})</h3>
              {results.blogs.map(blog => (
                <a
                  key={blog.id}
                  href={`/blogs/${blog.slug}`}
                  className="search-result-item"
                >
                  {blog.featuredImage && (
                    <img src={blog.featuredImage.thumbnailUrl} alt={blog.title} />
                  )}
                  <div>
                    <h4>{blog.title}</h4>
                    <p>{blog.excerpt}</p>
                  </div>
                </a>
              ))}
            </div>
          )}

          {results.total === 0 && (
            <p>No results found for "{query}"</p>
          )}
        </div>
      )}
    </div>
  );
}

// Custom hook for debouncing (create in src/hooks/useDebounce.js)
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default SearchBar;
```

---

## 9. Admin Panel - Approve Comments

```jsx
import { useState, useEffect } from 'react';
import { API_BASE_URL, getAuthHeader } from '../config/api';

function AdminComments() {
  const [pendingComments, setPendingComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingComments();
  }, []);

  async function fetchPendingComments() {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/pending`, {
        headers: getAuthHeader(),
      });

      if (response.ok) {
        const data = await response.json();
        setPendingComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function approveComment(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${id}/approve`, {
        method: 'PATCH',
        headers: getAuthHeader(),
      });

      if (response.ok) {
        setPendingComments(prev => prev.filter(c => c.id !== id));
        alert('Comment approved!');
      }
    } catch (error) {
      alert('Error approving comment');
    }
  }

  async function rejectComment(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${id}/reject`, {
        method: 'PATCH',
        headers: getAuthHeader(),
      });

      if (response.ok) {
        setPendingComments(prev => prev.filter(c => c.id !== id));
        alert('Comment rejected');
      }
    } catch (error) {
      alert('Error rejecting comment');
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-comments">
      <h2>Pending Comments ({pendingComments.length})</h2>

      {pendingComments.map(comment => (
        <div key={comment.id} className="comment-card">
          <div className="comment-meta">
            <strong>{comment.authorName || comment.user?.name}</strong>
            <span>on: {comment.blog.title}</span>
            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>

          <p>{comment.content}</p>

          <div className="comment-actions">
            <button
              onClick={() => approveComment(comment.id)}
              className="btn-approve"
            >
              ✓ Approve
            </button>
            <button
              onClick={() => rejectComment(comment.id)}
              className="btn-reject"
            >
              ✗ Reject
            </button>
          </div>
        </div>
      ))}

      {pendingComments.length === 0 && (
        <p>No pending comments</p>
      )}
    </div>
  );
}

export default AdminComments;
```

---

## Tips & Best Practices

### 1. Error Handling

```javascript
async function fetchData() {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    // Show user-friendly error message
    alert('Something went wrong. Please try again.');
  }
}
```

### 2. Loading States

```jsx
{loading ? (
  <div className="loading-spinner">Loading...</div>
) : (
  <ActualContent />
)}
```

### 3. Optimistic UI Updates

```javascript
// Update UI immediately, revert if API call fails
const optimisticData = [...data, newItem];
setData(optimisticData);

try {
  await fetch('/api/...');
} catch (error) {
  // Revert on error
  setData(data);
}
```

### 4. Image Optimization

```jsx
// Use appropriate size for context
<img
  src={place.featuredImage.thumbnailUrl}  // For lists/grids
  src={place.featuredImage.mediumUrl}     // For cards
  src={place.featuredImage.largeUrl}      // For detail pages
  loading="lazy"  // Lazy load images
  alt={place.name}
/>
```

---

**Happy Coding! 🚀**
