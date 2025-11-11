'use client';

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Cordova, Cebu coordinates (10.25°N, 123.95°E)
// Cordova is a small municipality of 17.15 km² on southern Mactan Island
const CORDOVA_CENTER: [number, number] = [123.9450, 10.2500];

// Tight boundaries for Cordova municipality
// Cordova is bordered by:
// - North: Lapu-Lapu City
// - West: Mactan Channel
// - East: Hilutangan Channel and Olango Island
// - South: Cebu Strait
// Area: only 17.15 km² (approx 4.5km x 4km)
const CORDOVA_BOUNDS: [[number, number], [number, number]] = [
  [123.9150, 10.2200], // Southwest coordinates (Cebu Strait, west coast)
  [123.9750, 10.2800]  // Northeast coordinates (border with Lapu-Lapu)
];

// Zoom levels - tighter since Cordova is small
const MIN_ZOOM = 13; // Cannot zoom out beyond this (keeps Cordova in view)
const MAX_ZOOM = 20; // Can zoom in up to this
const INITIAL_ZOOM = 15; // Start closer since it's a small area

interface CordovaMap3DProps {
  mapboxAccessToken: string;
  height?: string;
  enable3DTerrain?: boolean;
  enable3DBuildings?: boolean;
}

export default function CordovaMap3D({
  mapboxAccessToken,
  height = '100vh',
  enable3DTerrain = true,
  enable3DBuildings = true,
}: CordovaMap3DProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = mapboxAccessToken;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: CORDOVA_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 60, // Tilt angle for 3D view
      bearing: 0,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: CORDOVA_BOUNDS, // Restrict map to Cordova bounds
      antialias: true, // Create smooth 3D rendering
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add scale control
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric',
      }),
      'bottom-left'
    );

    // Handle map load event
    map.current.on('load', () => {
      if (!map.current) return;

      // Add 3D terrain
      if (enable3DTerrain) {
        map.current.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
        map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
      }

      // Add 3D buildings
      if (enable3DBuildings) {
        const layers = map.current.getStyle().layers;
        const labelLayerId = layers?.find(
          (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
        )?.id;

        map.current.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height'],
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height'],
              ],
              'fill-extrusion-opacity': 0.6,
            },
          },
          labelLayerId
        );
      }

      setMapLoaded(true);
    });

    // Strictly enforce minimum zoom - cannot zoom out beyond this level
    let isZooming = false;

    map.current.on('zoomstart', () => {
      isZooming = true;
    });

    map.current.on('zoomend', () => {
      isZooming = false;
      if (map.current && map.current.getZoom() < MIN_ZOOM) {
        map.current.setZoom(MIN_ZOOM);
      }
    });

    map.current.on('zoom', () => {
      if (map.current && !isZooming) {
        const currentZoom = map.current.getZoom();
        if (currentZoom < MIN_ZOOM) {
          map.current.setZoom(MIN_ZOOM);
        }
      }
    });

    // Intercept wheel events to prevent zoom out when at minimum
    const handleWheel = (e: WheelEvent) => {
      if (map.current) {
        const currentZoom = map.current.getZoom();
        // If trying to zoom out (positive deltaY) and already at or below min zoom
        if (e.deltaY > 0 && currentZoom <= MIN_ZOOM + 0.1) {
          e.stopPropagation();
          e.preventDefault();
          return false;
        }
      }
    };

    const container = mapContainer.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    // Cleanup on unmount
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxAccessToken, enable3DTerrain, enable3DBuildings]);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {!mapLoaded && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            zIndex: 1000,
          }}
        >
          Loading 3D Map...
        </div>
      )}
    </div>
  );
}
