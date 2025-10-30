'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Rating,
  Chip,
  Button,
  IconButton,
  Divider,
  Card,
  CardContent,
  ImageList,
  ImageListItem,
  CircularProgress,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Phone,
  Language,
  Email,
  AccessTime,
  AttachMoney,
  Star,
  Share,
  Favorite,
  Map as MapIcon,
  Visibility,
} from '@mui/icons-material';
import { placesApi } from '@/lib/api';
import { Place } from '@/types';
import Link from 'next/link';

const InteractiveMap = dynamic(
  () => import('@/components/Map/InteractiveMap'),
  { ssr: false }
);

export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPlace();
    }
  }, [slug]);

  const fetchPlace = async () => {
    setLoading(true);
    try {
      const data = await placesApi.getBySlug(slug);
      setPlace(data);
    } catch (error) {
      console.error('Error fetching place:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (place && navigator.share) {
      navigator.share({
        title: place.name,
        text: place.shortDescription || place.description,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!place) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Place not found
        </Typography>
        <Button variant="contained" component={Link} href="/">
          Go Back Home
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      {/* App Bar */}
      <AppBar position="sticky" elevation={1} color="default" sx={{ bgcolor: 'white' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Breadcrumbs sx={{ flexGrow: 1 }}>
            <MuiLink component={Link} href="/" color="inherit" underline="hover">
              Home
            </MuiLink>
            <MuiLink component={Link} href="/" color="inherit" underline="hover">
              Places
            </MuiLink>
            <Typography color="text.primary">{place.name}</Typography>
          </Breadcrumbs>
          <IconButton onClick={handleShare}>
            <Share />
          </IconButton>
          <IconButton>
            <Favorite />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Hero Image */}
      <Box
        sx={{
          height: { xs: 300, md: 500 },
          backgroundImage: `url(${place.featuredImage?.largeUrl || place.featuredImage?.url || '/placeholder.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 4,
            color: 'white',
            zIndex: 1,
          }}
        >
          <Container maxWidth="lg">
            {place.isFeatured && (
              <Chip icon={<Star />} label="Featured" color="warning" sx={{ mb: 2 }} />
            )}
            <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              {place.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={place.rating} precision={0.1} readOnly />
                <Typography variant="h6">
                  {place.rating.toFixed(1)} ({place.reviewCount} reviews)
                </Typography>
              </Box>
              {place.city && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn />
                  <Typography variant="h6">
                    {place.city}, {place.country}
                  </Typography>
                </Box>
              )}
            </Box>
          </Container>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Quick Info */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {place.category && (
                  <Chip
                    icon={place.category.icon ? <span>{place.category.icon}</span> : undefined}
                    label={place.category.name}
                    color="primary"
                  />
                )}
                {place.placeType && (
                  <Chip label={place.placeType.replace('_', ' ').toUpperCase()} variant="outlined" />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Visibility fontSize="small" />
                  <Typography variant="body2">{place.visitCount.toLocaleString()} visits</Typography>
                </Box>
              </Box>
            </Paper>

            {/* Description */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                About
              </Typography>
              <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                {place.description || place.shortDescription}
              </Typography>

              {place.tags && place.tags.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {place.tags.map((tag) => (
                    <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
                  ))}
                </Box>
              )}
            </Paper>

            {/* Gallery */}
            {place.media && place.media.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Gallery
                </Typography>
                <ImageList cols={3} gap={8}>
                  {place.media.map((item) => (
                    <ImageListItem key={item.id}>
                      <img
                        src={item.media.mediumUrl || item.media.url}
                        alt={place.name}
                        loading="lazy"
                        style={{ borderRadius: 8 }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Paper>
            )}

            {/* Reviews */}
            {place.reviews && place.reviews.length > 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Reviews
                </Typography>
                {place.reviews.map((review) => (
                  <Box key={review.id} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {review.authorName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Rating value={review.rating} size="small" readOnly sx={{ mb: 1 }} />
                    {review.title && (
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {review.title}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {review.content}
                    </Typography>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Paper>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Contact Information */}
            {place.contactInfo && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Contact Information
                </Typography>
                {place.contactInfo.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Phone fontSize="small" color="primary" />
                    <Typography variant="body2">{place.contactInfo.phone}</Typography>
                  </Box>
                )}
                {place.contactInfo.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Email fontSize="small" color="primary" />
                    <Typography variant="body2">{place.contactInfo.email}</Typography>
                  </Box>
                )}
                {place.contactInfo.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Language fontSize="small" color="primary" />
                    <MuiLink href={place.contactInfo.website} target="_blank" rel="noopener">
                      <Typography variant="body2">Visit Website</Typography>
                    </MuiLink>
                  </Box>
                )}
              </Paper>
            )}

            {/* Opening Hours */}
            {place.openingHours && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  <AccessTime fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Opening Hours
                </Typography>
                {Object.entries(place.openingHours).map(([day, hours]) => (
                  <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {day}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hours as string}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}

            {/* Admission Fee */}
            {place.admissionFee && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  <AttachMoney fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Admission Fee
                </Typography>
                {Object.entries(place.admissionFee)
                  .filter(([key]) => key !== 'currency')
                  .map(([type, price]) => (
                    <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {type}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {place.admissionFee.currency} {price as number}
                      </Typography>
                    </Box>
                  ))}
              </Paper>
            )}

            {/* Location Map */}
            {place.latitude && place.longitude && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  <MapIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Location
                </Typography>
                <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                  <InteractiveMap selectedPlace={place} height="300px" />
                </Box>
                {place.address && (
                  <Typography variant="body2" color="text.secondary">
                    {place.address}
                  </Typography>
                )}
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
