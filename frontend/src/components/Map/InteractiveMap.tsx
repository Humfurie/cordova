'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Place } from '@/types';
import { placesApi } from '@/lib/api';
import { Box, Card, CardMedia, CardContent, Typography, Rating, Chip, IconButton } from '@mui/material';
import { LocationOn, Visibility } from '@mui/icons-material';

// Fix Leaflet default marker icons
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Coordinates for Cordova, Cebu, Philippines
const CORDOVA_CENTER = {
  lat: 10.2533,
  lng: 123.9447,
};

interface MapBoundsHandlerProps {
  onPlacesUpdate: (places: Place[]) => void;
}

function MapBoundsHandler({ onPlacesUpdate }: MapBoundsHandlerProps) {
  const map = useMap();

  useEffect(() => {
    const fetchPlacesInBounds = async () => {
      try {
        const bounds = map.getBounds();
        const { data } = await placesApi.getInBounds(
          bounds.getSouth(),
          bounds.getWest(),
          bounds.getNorth(),
          bounds.getEast()
        );
        onPlacesUpdate(data);
      } catch (error) {
        console.error('Error fetching places:', error);
      }
    };

    map.on('moveend', fetchPlacesInBounds);
    fetchPlacesInBounds();

    return () => {
      map.off('moveend', fetchPlacesInBounds);
    };
  }, [map, onPlacesUpdate]);

  return null;
}

interface InteractiveMapProps {
  selectedPlace?: Place | null;
  onPlaceSelect?: (place: Place) => void;
  height?: string;
}

export default function InteractiveMap({
  selectedPlace,
  onPlaceSelect,
  height = '600px',
}: InteractiveMapProps) {
  const [places, setPlaces] = useState<Place[]>([]);

  return (
    <Box sx={{ height, width: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
      <MapContainer
        center={[CORDOVA_CENTER.lat, CORDOVA_CENTER.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsHandler onPlacesUpdate={setPlaces} />

        {places.map((place) => (
          place.latitude && place.longitude && (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  if (onPlaceSelect) {
                    onPlaceSelect(place);
                  }
                },
              }}
            >
              <Popup maxWidth={300}>
                <Card sx={{ border: 'none', boxShadow: 'none' }}>
                  {place.featuredImage && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={place.featuredImage.mediumUrl || place.featuredImage.url}
                      alt={place.name}
                      sx={{ borderRadius: 1 }}
                    />
                  )}
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {place.name}
                    </Typography>

                    {place.shortDescription && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {place.shortDescription.substring(0, 100)}
                        {place.shortDescription.length > 100 && '...'}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating value={place.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2" color="text.secondary">
                        ({place.reviewCount})
                      </Typography>
                    </Box>

                    {place.category && (
                      <Chip
                        icon={<LocationOn fontSize="small" />}
                        label={place.category.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    )}

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Visibility fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {place.visitCount.toLocaleString()} visits
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      component="a"
                      href={`/places/${place.slug}`}
                      sx={{
                        display: 'block',
                        mt: 1,
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontWeight: 'medium',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      View Details →
                    </Typography>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </Box>
  );
}
