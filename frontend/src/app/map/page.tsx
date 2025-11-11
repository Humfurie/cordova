'use client';

import CordovaMap3DFree from '@/components/Map/CordovaMap3DFree';
import { Box, Typography, Container, Chip } from '@mui/material';
import { Public } from '@mui/icons-material';

export default function MapPage() {
  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 2,
          px: 3,
          boxShadow: 2,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Cordova, Cebu - 3D Map
            </Typography>
            <Chip
              icon={<Public />}
              label="FREE & UNLIMITED"
              color="success"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
            Interactive 3D map locked to Cordova area - Zoom in to explore, cannot zoom out beyond city limits
          </Typography>
          <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.8, display: 'block' }}>
            Powered by MapLibre GL + OpenStreetMap • No API key required • Truly free forever
          </Typography>
        </Container>
      </Box>

      {/* Map Container */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <CordovaMap3DFree height="100%" />
      </Box>

      {/* Instructions Overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 80,
          right: 20,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          p: 2,
          borderRadius: 2,
          boxShadow: 3,
          maxWidth: 300,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Map Controls:
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
          • Drag to pan
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
          • Scroll to zoom in/out
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
          • Right-click + drag to rotate
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
          • Ctrl + drag to change pitch
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Note: Cannot zoom out beyond Cordova city limits
        </Typography>
      </Box>
    </Box>
  );
}
