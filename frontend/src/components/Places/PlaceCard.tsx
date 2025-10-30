'use client';

import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Rating,
  Chip,
  Box,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LocationOn,
  Visibility,
  Star,
  Favorite,
  Share,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { Place } from '@/types';
import Link from 'next/link';

interface PlaceCardProps {
  place: Place;
  onFavorite?: (placeId: number) => void;
  onShare?: (place: Place) => void;
}

export default function PlaceCard({ place, onFavorite, onShare }: PlaceCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 6,
        },
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={place.featuredImage?.mediumUrl || place.featuredImage?.url || '/placeholder.jpg'}
          alt={place.name}
          sx={{
            objectFit: 'cover',
          }}
        />
        {place.isFeatured && (
          <Chip
            icon={<Star />}
            label="Featured"
            color="warning"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontWeight: 'bold',
            }}
          />
        )}
        {place.category && (
          <Chip
            icon={place.category.icon ? <span>{place.category.icon}</span> : <CategoryIcon />}
            label={place.category.name}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography
          gutterBottom
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '3.2em',
          }}
        >
          {place.name}
        </Typography>

        {place.shortDescription && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '2.8em',
            }}
          >
            {place.shortDescription}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Rating value={place.rating} precision={0.1} size="small" readOnly />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {place.rating.toFixed(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({place.reviewCount} reviews)
          </Typography>
        </Box>

        {(place.city || place.country) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {[place.city, place.country].filter(Boolean).join(', ')}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Visibility fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {place.visitCount.toLocaleString()} visits
          </Typography>
        </Box>

        {place.tags && place.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
            {place.tags.slice(0, 3).map((tag) => (
              <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
            ))}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          component={Link}
          href={`/places/${place.slug}`}
          variant="contained"
          size="small"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          View Details
        </Button>

        <Box>
          {onFavorite && (
            <Tooltip title="Add to favorites">
              <IconButton size="small" onClick={() => onFavorite(place.id)}>
                <Favorite fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onShare && (
            <Tooltip title="Share">
              <IconButton size="small" onClick={() => onShare(place)}>
                <Share fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardActions>
    </Card>
  );
}
