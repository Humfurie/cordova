'use client';

import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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

interface CordovaMap3DFreeProps {
  height?: string;
}

export default function CordovaMap3DFree({
  height = '100vh',
}: CordovaMap3DFreeProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map with FREE OpenStreetMap tiles
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          },
          'terrain': {
            type: 'raster-dem',
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            encoding: 'terrarium',
            tileSize: 256,
            maxzoom: 15
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 22
          }
        ],
        terrain: {
          source: 'terrain',
          exaggeration: 1.5
        }
      },
      center: CORDOVA_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 60, // Tilt angle for 3D view
      bearing: 0,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: CORDOVA_BOUNDS, // Restrict map to Cordova bounds
    });

    // Add navigation controls
    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add scale control
    map.current.addControl(
      new maplibregl.ScaleControl({
        maxWidth: 100,
        unit: 'metric',
      }),
      'bottom-left'
    );

    // Handle map load event
    map.current.on('load', () => {
      if (!map.current) return;

      // Add 3D buildings using OSM data
      map.current.addSource('osm-buildings', {
        type: 'vector',
        tiles: ['https://tiles.openfreemap.org/planet/building/{z}/{x}/{y}.pbf'],
        minzoom: 14,
        maxzoom: 14
      });

      map.current.addLayer({
        id: '3d-buildings',
        type: 'fill-extrusion',
        source: 'osm-buildings',
        'source-layer': 'building',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'case',
            ['has', 'render_height'],
            ['get', 'render_height'],
            5 // Default height in meters
          ],
          'fill-extrusion-base': [
            'case',
            ['has', 'render_min_height'],
            ['get', 'render_min_height'],
            0
          ],
          'fill-extrusion-opacity': 0.6,
        },
      });

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
  }, []);

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
      {/* Free & Open Source Badge */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(76, 175, 80, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1000,
        }}
      >
        🌍 FREE & UNLIMITED
      </div>
    </div>
  );
}
