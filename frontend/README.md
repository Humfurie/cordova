# Cordova Tourism Website - Frontend

A modern, responsive tourism website for the Municipality of Cordova in Cebu City, built with Next.js 16, React 19, Material UI, and Leaflet maps.

## Features

### 🗺️ Interactive Map
- **OpenStreetMap integration** with Leaflet
- Centered on Cordova, Cebu (Coordinates: 10.2533°N, 123.9447°E)
- Real-time place markers with interactive popups
- Auto-updates markers based on map viewport
- Click markers to view place details

### 🎨 Material UI Design
- Beautiful, modern interface with Material Design principles
- Fully responsive for mobile, tablet, and desktop
- Smooth animations and transitions
- Custom theme with gradient hero section
- Card-based layouts with hover effects

### 🔍 Search & Filter
- Real-time search across all places
- Filter by category (Attractions, Restaurants, Hotels, etc.)
- Category chips with icons
- Smart search with backend integration

### 📱 View Modes
- **Map View**: Interactive map with place markers
- **List View**: Grid layout with place cards
- Toggle between views with one click
- Floating action button for mobile

### 📍 Place Features
- Detailed place information pages
- High-quality image galleries
- Ratings and reviews display
- Contact information (phone, email, website)
- Opening hours
- Admission fees
- Location map
- Tags and categories
- Social sharing functionality

## Tech Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **React**: 19.2.0
- **TypeScript**: v5
- **UI Library**: Material UI (@mui/material)
- **Icons**: Material UI Icons (@mui/icons-material)
- **Maps**: Leaflet + React Leaflet
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS v4 + Material UI theme
- **Fonts**: Geist Sans & Geist Mono

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:3000` (see backend documentation)

## Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1" > .env.local
```

## Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

The app will hot-reload when you make changes to the source code.

## Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page with map
│   │   ├── layout.tsx         # Root layout with theme
│   │   ├── globals.css        # Global styles
│   │   └── places/
│   │       └── [slug]/
│   │           └── page.tsx   # Place detail page
│   ├── components/            # React components
│   │   ├── Map/
│   │   │   └── InteractiveMap.tsx  # Leaflet map component
│   │   └── Places/
│   │       └── PlaceCard.tsx       # Place card component
│   ├── lib/
│   │   └── api.ts            # API client & functions
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   └── theme.ts              # Material UI theme
├── public/                   # Static assets
├── .env.local               # Environment variables
└── package.json             # Dependencies
```

## Key Components

### InteractiveMap Component
Located at `src/components/Map/InteractiveMap.tsx`

Features:
- Dynamically imported to avoid SSR issues
- Auto-fetches places within map bounds
- Interactive markers with popups
- Centered on Cordova, Cebu

Usage:
```tsx
<InteractiveMap
  selectedPlace={place}
  onPlaceSelect={(place) => console.log(place)}
  height="600px"
/>
```

### PlaceCard Component
Located at `src/components/Places/PlaceCard.tsx`

Features:
- Material UI card design
- Image with category overlay
- Rating display
- Tags and metadata
- Hover animations
- Share functionality

## API Integration

The app communicates with the backend API using Axios. All API functions are located in `src/lib/api.ts`.

### Available API Functions

```typescript
// Places
placesApi.getAll(params)
placesApi.getById(id)
placesApi.getBySlug(slug)
placesApi.getNearby(lat, lng, radius)
placesApi.getInBounds(swLat, swLng, neLat, neLng)

// Categories
categoriesApi.getAll()
categoriesApi.getById(id)

// Search
searchApi.search(query, type)
searchApi.trending()
```

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Customization

### Theme
Edit `src/theme.ts` to customize colors, typography, and component styles.

### Map Center
To change the map center location, edit `src/components/Map/InteractiveMap.tsx`:

```typescript
const CORDOVA_CENTER = {
  lat: 10.2533,  // Your latitude
  lng: 123.9447, // Your longitude
};
```

## Mobile Responsiveness

The app is fully responsive with:
- Mobile-first design approach
- Hamburger menu for mobile
- Floating action button for view switching
- Responsive grid layouts
- Touch-friendly interface

## Performance Optimization

- Dynamic imports for map component
- Lazy loading images
- Server-side rendering
- Code splitting
- Optimized bundle size

## Troubleshooting

### Map not displaying
1. Check that Leaflet CSS is imported in `globals.css`
2. Ensure map component is dynamically imported
3. Verify coordinates are valid

### API connection errors
1. Ensure backend is running on `http://localhost:3000`
2. Check `.env.local` has correct API URL
3. Verify CORS settings in backend

### Build errors
1. Clear `.next` folder: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run lint`

## Support

For issues and questions:
- Check backend API documentation at `http://localhost:3000/api/docs`
- Review backend README in `../backend/README.md`
- See main documentation in `../docs/README.md`

---

**Built with ❤️ for Cordova, Cebu**
