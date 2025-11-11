# 3D Map Setup Guide

## Overview
This project includes a 3D interactive map of Cordova, Cebu with the following features:
- Locked to Cordova city boundaries (cannot pan outside the area)
- Can zoom IN but cannot zoom OUT beyond minimum zoom level
- 3D terrain elevation
- 3D building models
- Satellite imagery with street labels

## Setup Instructions

### 1. Get Mapbox Access Token
1. Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2. Sign up for a free account (no credit card required)
3. From your dashboard, find your "Default public token" or create a new token
4. Copy the token (starts with `pk.`)

### 2. Configure Environment Variable
1. In the `frontend` directory, create a new file named `.env.local`
2. Add your token:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_actual_token_here
   ```
3. Save the file

### 3. Run the Application
```bash
cd frontend
npm run dev
```

### 4. View the Map
Open your browser and navigate to:
```
http://localhost:3000/map
```

## Map Features

### Zoom Restrictions
- **Minimum Zoom**: Level 13 (cannot zoom out beyond this - keeps Cordova municipality in view)
- **Maximum Zoom**: Level 20 (maximum detail)
- **Initial Zoom**: Level 15 (good overview of the municipality)

### Boundary Restrictions
The map is tightly bounded to Cordova municipality (17.15 km²):
- **Southwest**: 123.9150°E, 10.2200°N (Cebu Strait, west coast)
- **Northeast**: 123.9750°E, 10.2800°N (border with Lapu-Lapu City)
- **Center**: 123.9450°E, 10.2500°N

**Cordova borders:**
- North: Lapu-Lapu City
- West: Mactan Channel
- East: Hilutangan Channel and Olango Island
- South: Cebu Strait

Users cannot pan outside the municipality boundaries.

### 3D Controls
- **Pan**: Click and drag
- **Zoom**: Scroll wheel or pinch gesture
- **Rotate**: Right-click and drag (or Ctrl+drag)
- **Tilt (Pitch)**: Ctrl+drag up/down
- **Reset bearing**: Use the compass control (top-right)

### Visual Features
- **3D Terrain**: Enabled with 1.5x exaggeration for better visibility
- **3D Buildings**: Enabled at zoom level 15 and above
- **Style**: Satellite imagery with street labels
- **Navigation Controls**: Zoom and compass in top-right corner
- **Scale**: Metric scale indicator in bottom-left corner

## Component Usage

### CordovaMap3D Component
Located at: `src/components/Map/CordovaMap3D.tsx`

Props:
```typescript
interface CordovaMap3DProps {
  mapboxAccessToken: string;      // Required: Your Mapbox token
  height?: string;                 // Optional: Height of map container (default: "100vh")
  enable3DTerrain?: boolean;       // Optional: Enable 3D terrain (default: true)
  enable3DBuildings?: boolean;     // Optional: Enable 3D buildings (default: true)
}
```

Example usage:
```tsx
import CordovaMap3D from '@/components/Map/CordovaMap3D';

export default function MyMapPage() {
  return (
    <CordovaMap3D
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
      height="600px"
      enable3DTerrain={true}
      enable3DBuildings={true}
    />
  );
}
```

## Customization

### Changing Map Bounds
Edit `src/components/Map/CordovaMap3D.tsx`:
```typescript
const CORDOVA_BOUNDS: [[number, number], [number, number]] = [
  [123.9150, 10.2200], // Southwest [longitude, latitude]
  [123.9750, 10.2800]  // Northeast [longitude, latitude]
];
```

### Changing Zoom Levels
Edit `src/components/Map/CordovaMap3D.tsx`:
```typescript
const MIN_ZOOM = 13; // Cannot zoom out beyond this
const MAX_ZOOM = 20; // Can zoom in up to this
const INITIAL_ZOOM = 15; // Starting zoom level
```

### Changing Map Style
Edit the map initialization in `CordovaMap3D.tsx`:
```typescript
style: 'mapbox://styles/mapbox/satellite-streets-v12',
// Other options:
// 'mapbox://styles/mapbox/streets-v12'
// 'mapbox://styles/mapbox/outdoors-v12'
// 'mapbox://styles/mapbox/light-v11'
// 'mapbox://styles/mapbox/dark-v11'
```

### Changing Initial Camera Angle
Edit the map initialization:
```typescript
pitch: 60,  // Tilt angle (0-85 degrees)
bearing: 0, // Rotation angle (0-360 degrees)
```

## Troubleshooting

### Map not loading
- Check that your Mapbox token is correctly set in `.env.local`
- Ensure you've restarted the dev server after adding the token
- Verify the token is valid at [https://account.mapbox.com/](https://account.mapbox.com/)

### Token not found
- Make sure the environment variable starts with `NEXT_PUBLIC_`
- Check that `.env.local` is in the `frontend` directory
- Restart the dev server

### Map is not 3D
- Zoom in to level 15+ to see 3D buildings
- Some areas may not have 3D building data available
- Terrain is visible at all zoom levels but more apparent in mountainous areas

## Free Tier Limits
Mapbox free tier includes:
- 50,000 map loads per month
- Unlimited requests for users within the first 50,000 loads
- No credit card required for signup

## Support
For Mapbox-specific issues, see: [https://docs.mapbox.com/help/](https://docs.mapbox.com/help/)
