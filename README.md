# 🎯 Darts Scorer

A professional darts scoring app built with Next.js 14, designed for mobile-first use at the oche.

## Features

### 🎮 Game Setup
- Add multiple players (2+) with custom names
- Different starting scores for each player (101/301/501/701/1001 or custom)
- Flexible match formats (sets and legs configuration)
- Support for handicap matches

### ⚡ Live Scoring  
- 3-dart round entry with simple number input
- Clear indication of whose turn it is
- Bust detection (score goes below 0 or hits 1)
- Checkout suggestions for finishes ≤170
- Undo last score functionality
- Automatic leg/set winner detection

### 📊 Statistics & Analytics
- Real-time match statistics
- 3-dart averages and highest scores
- 100+, 140+, and 180 score tracking
- Checkout percentage calculation
- First 9-dart average tracking

### 👤 Player Profiles
- Persistent player database (localStorage)
- All-time statistics tracking
- Head-to-head records between players
- Games played, won, best averages, highest scores

### 📜 Match History
- Complete match archive
- Detailed match breakdowns
- View statistics from any past match
- Match duration tracking

## Design

- **Dark Theme**: Navy/charcoal color scheme perfect for pub/club environments
- **Mobile-First**: Optimized for smartphone use at the oche  
- **Big Buttons**: Large, tappable score input with number pad
- **Clean Typography**: Bold, readable scores and clear game state
- **Smooth Transitions**: Polished animations between screens

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom darts theme
- **Language**: TypeScript for type safety
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: None (anonymous access)
- **PWA**: Manifest for mobile app-like experience

## Getting Started

### 1. Database Setup

This app uses Supabase as the backend. You'll need to:

1. Run the SQL migration in `supabase-migration.sql` in your Supabase project's SQL Editor
2. Create a `.env.local` file with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production  
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 3. Database Schema

The app uses the following tables (all prefixed with `darts_`):
- `darts_players` - Player profiles (just name, no auth)
- `darts_matches` - Match configurations and status
- `darts_match_players` - Links players to matches
- `darts_legs` - Individual legs within matches  
- `darts_throws` - Individual dart throws/scores

All tables allow anonymous access via Row Level Security policies.

## Deployment

This app is ready for deployment on Vercel:

1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

The app is fully static and can also be deployed on any hosting platform that supports static sites.

## Pages

- `/` - Home (new game / resume / history)
- `/setup` - Match configuration 
- `/game` - Live scoring interface
- `/stats` - Player profiles and statistics
- `/history` - Match history and archive
- `/history/[id]` - Individual match details

## Mobile PWA

The app includes a web app manifest and is optimized for:
- Add to Home Screen functionality
- Standalone display mode
- Portrait orientation lock
- Offline capability (localStorage)

Perfect for use on phones and tablets at the dartboard!

## License

MIT