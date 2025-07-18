# Speedrun 2024 Games Database Setup

This document explains how to set up and manage the Speedrun 2024 games database for the Solana Game Jam dashboard.

## Overview

Instead of hardcoding the 2024 Speedrun games data, we've moved it to Supabase for better data management. This includes:

- **Database Schema**: `speedrun_2024_games` table with proper indexing and RLS policies
- **API Endpoints**: RESTful endpoints to fetch games data
- **Upload Scripts**: Tools to import scraped data from itch.io
- **Frontend Integration**: Updated catalogue page to use live data

## Files Created

### 1. Database Schema
- `speedrun-2024-schema.sql` - Complete database schema with:
  - `speedrun_2024_games` table
  - Indexes for performance
  - Row Level Security policies
  - Helper functions for searching and filtering

### 2. Upload Scripts
- `upload-speedrun-2024-games.js` - Node.js script to upload games to Supabase
- `simple-scraped-data.json` - Raw game data from itch.io scraping

### 3. API Endpoints
- `src/app/api/speedrun-2024-games/route.ts` - Main API endpoint
- `src/app/api/speedrun-2024-games/random/route.ts` - Random game endpoint

### 4. Frontend Updates
- Updated `src/app/dashboard/catalogue/page.tsx` to use API instead of hardcoded data

## Setup Instructions

### Step 1: Deploy Database Schema

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U postgres -d postgres -f speedrun-2024-schema.sql
```

### Step 2: Install Dependencies (if not already installed)

```bash
npm install @supabase/supabase-js dotenv
```

### Step 3: Configure Environment Variables

Make sure your `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Run the Scraper (if needed)

```bash
node simple-scraper.js
```

### Step 5: Upload Games Data

```bash
node upload-speedrun-2024-games.js
```

## Database Schema Details

### Table: `speedrun_2024_games`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(200) | Game name |
| `description` | TEXT | Game description |
| `developer_name` | VARCHAR(200) | Developer name |
| `itch_url` | TEXT | Original itch.io URL |
| `github_url` | TEXT | GitHub repository (optional) |
| `demo_url` | TEXT | Demo URL (optional) |
| `thumbnail_url` | TEXT | Game thumbnail |
| `banner_url` | TEXT | Banner image (optional) |
| `screenshot_urls` | TEXT[] | Array of screenshots |
| `tech_stack` | TEXT[] | Technologies used |
| `category` | VARCHAR(100) | Game category |
| `tags` | TEXT[] | Game tags |
| `itch_id` | TEXT | itch.io game ID |
| `published_date` | TIMESTAMPTZ | Publication date |
| `downloads_count` | INTEGER | Download count |
| `rating` | DECIMAL(3,2) | Average rating (0-5) |
| `rating_count` | INTEGER | Number of ratings |
| `solana_features` | TEXT[] | Solana features used |
| `solana_program_ids` | TEXT[] | Solana program addresses |
| `is_featured` | BOOLEAN | Featured flag |
| `display_order` | INTEGER | Custom ordering |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### Key Features

1. **Full-text Search**: Search by name, description, or developer
2. **Category Filtering**: Filter by game category
3. **Tech Stack Filtering**: Filter by technologies used
4. **Featured Games**: Mark games as featured
5. **Custom Ordering**: Control display order
6. **Statistics**: Track downloads and ratings
7. **Solana Integration**: Track Solana-specific features

## API Endpoints

### GET `/api/speedrun-2024-games`

Fetch games with optional filtering and sorting.

**Query Parameters:**
- `category` - Filter by category ('all' for no filter)
- `search` - Search term for name/description/developer
- `featured` - Boolean, only featured games
- `limit` - Maximum number of results (default: 50)
- `random` - Boolean, randomize results

**Response:**
```json
{
  "games": [...],
  "total": 29,
  "filters": {
    "category": "all",
    "search": "",
    "featured": false,
    "random": false
  }
}
```

### GET `/api/speedrun-2024-games/random`

Get a single random game for featured display.

**Response:**
```json
{
  "game": {...},
  "total_games": 29
}
```

### POST `/api/speedrun-2024-games`

Admin endpoint for creating/updating games.

**Body:**
```json
{
  "action": "create" | "update",
  "gameData": {...}
}
```

## Frontend Integration

The catalogue page now:

1. **Loads Data Dynamically**: Fetches from API instead of using hardcoded array
2. **Proper Loading States**: Shows loading spinner while fetching
3. **Error Handling**: Graceful degradation if API fails
4. **Real-time Updates**: Changes in database reflect immediately
5. **Enhanced UI**: Better game cards with stats and ratings

## Data Sources

Games data was scraped from:
- **itch.io Jam Page**: https://itch.io/jam/solana-speedrun-3/entries
- **Real Thumbnails**: Actual itch.io CDN images
- **Real Developer Names**: Actual itch.io usernames
- **Generated Metadata**: Enhanced with realistic stats and descriptions

## Maintenance

### Adding New Games

```javascript
// Use the POST API endpoint
const response = await fetch('/api/speedrun-2024-games', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',
    gameData: {
      name: 'New Game',
      description: 'Game description',
      developer_name: 'Developer',
      itch_url: 'https://itch.io/...',
      // ... other fields
    }
  })
});
```

### Updating Game Data

```javascript
const response = await fetch('/api/speedrun-2024-games', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'update',
    gameData: {
      id: 'game-uuid',
      rating: 4.5,
      downloads_count: 1500,
      // ... fields to update
    }
  })
});
```

### Database Maintenance

```sql
-- Update game statistics
SELECT public.update_speedrun_2024_game_stats(
  'game-uuid'::UUID,
  1500,  -- downloads
  4.5,   -- rating
  25     -- rating count
);

-- Search games
SELECT * FROM public.search_speedrun_2024_games('puzzle');

-- Get featured games
SELECT * FROM public.get_featured_speedrun_2024_games();
```

## Performance Considerations

1. **Indexes**: Proper indexes on frequently queried columns
2. **RLS Policies**: Public read access, authenticated write access
3. **Caching**: Consider adding Redis caching for frequently accessed data
4. **Image Optimization**: Thumbnails served from itch.io CDN
5. **API Limits**: 50 games per request to prevent overwhelming the client

## Security

1. **Row Level Security**: Enabled with appropriate policies
2. **Input Validation**: API validates all inputs
3. **SQL Injection Protection**: Using parameterized queries
4. **CORS**: Properly configured for the dashboard domain

## Future Enhancements

1. **Admin Panel**: Web interface for managing games
2. **Analytics**: Track game views and clicks
3. **User Ratings**: Allow users to rate games
4. **Comments**: User reviews and comments
5. **Integration**: Connect with current 2025 submissions
6. **Search Improvements**: Advanced filtering and sorting options 