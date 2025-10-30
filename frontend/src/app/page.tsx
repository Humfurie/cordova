'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Container,
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Fab,
  Zoom,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList,
  Menu as MenuIcon,
  Explore,
  Restaurant,
  Hotel,
  Article,
  Map as MapIcon,
  ViewList,
} from '@mui/icons-material';
import { placesApi, categoriesApi } from '@/lib/api';
import { Place, Category } from '@/types';
import PlaceCard from '@/components/Places/PlaceCard';

// Dynamically import the map to avoid SSR issues
const InteractiveMap = dynamic(
  () => import('@/components/Map/InteractiveMap'),
  { ssr: false, loading: () => <CircularProgress /> }
);

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    fetchPlaces();
    fetchCategories();
  }, [selectedCategory, searchQuery]);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: 1,
        limit: 50,
        status: 'published',
      };

      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const { data } = await placesApi.getAll(params);
      setPlaces(data);
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleShare = (place: Place) => {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: place.shortDescription || place.description,
        url: `/places/${place.slug}`,
      });
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={() => setMobileDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <MapIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
              Discover Cordova
            </Typography>
          </Box>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" startIcon={<Explore />}>
                Places
              </Button>
              <Button color="inherit" startIcon={<Article />}>
                Blogs
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      >
        <List sx={{ width: 250 }}>
          <ListItem disablePadding>
            <ListItemButton>
              <Explore sx={{ mr: 2 }} />
              <ListItemText primary="Places" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <Article sx={{ mr: 2 }} />
              <ListItemText primary="Blogs" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '3.5rem' },
            }}
          >
            Explore Cordova, Cebu
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.95,
              fontWeight: 400,
              fontSize: { xs: '1rem', md: '1.5rem' },
            }}
          >
            Your gateway to discovering amazing places in this island paradise
          </Typography>

          {/* Search Bar */}
          <Paper
            sx={{
              p: 2,
              maxWidth: 800,
              mx: 'auto',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            <TextField
              fullWidth
              placeholder="Search places, restaurants, hotels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ minWidth: { xs: '100%', md: 200 } }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.icon && `${category.icon} `}
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={fetchPlaces}
              sx={{
                minWidth: { xs: '100%', md: 'auto' },
                bgcolor: 'secondary.main',
                '&:hover': { bgcolor: 'secondary.dark' },
              }}
            >
              Search
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* View Mode Toggle */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<MapIcon />}
              label={`${places.length} Places Found`}
              color="primary"
              variant={viewMode === 'map' ? 'filled' : 'outlined'}
            />
            {selectedCategory && (
              <Chip
                label={categories.find((c) => c.id.toString() === selectedCategory)?.name || 'Category'}
                onDelete={() => setSelectedCategory('')}
                color="secondary"
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={viewMode === 'map' ? 'contained' : 'outlined'}
              startIcon={<MapIcon />}
              onClick={() => setViewMode('map')}
              size="small"
            >
              Map
            </Button>
            <Button
              variant={viewMode === 'list' ? 'contained' : 'outlined'}
              startIcon={<ViewList />}
              onClick={() => setViewMode('list')}
              size="small"
            >
              List
            </Button>
          </Box>
        </Box>

        {/* Interactive Map View */}
        {viewMode === 'map' && (
          <Box sx={{ mb: 4 }}>
            <InteractiveMap
              selectedPlace={selectedPlace}
              onPlaceSelect={setSelectedPlace}
              height="600px"
            />
          </Box>
        )}

        {/* Places Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : places.length > 0 ? (
          <>
            <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
              {viewMode === 'map' ? 'Featured Places' : 'All Places'}
            </Typography>
            <Grid container spacing={3}>
              {places.map((place) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={place.id}>
                  <PlaceCard place={place} onShare={handleShare} />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Paper
            sx={{
              p: 8,
              textAlign: 'center',
              bgcolor: 'background.default',
            }}
          >
            <SearchIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No places found
            </Typography>
            <Typography color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Paper>
        )}
      </Container>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Zoom in={true}>
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          >
            {viewMode === 'map' ? <ViewList /> : <MapIcon />}
          </Fab>
        </Zoom>
      )}
    </Box>
  );
}
