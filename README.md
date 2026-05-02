# City Bingo

City Bingo is a real-world scavenger hunt application designed for groups and teams to explore their environment in a fun, interactive way. Teams compete to complete a 5x5 grid of challenges (like "Find a Blue Door" or "Statue Selfie") within a set time limit. The progress is tracked in real-time across all teams, creating an engaging and competitive urban adventure.

## Features
- **Real-time Leaderboard**: See other teams' progress as they complete challenges.
- **Dynamic Bingo Grid**: Interactive flip-cards for each challenge.
- **Configurable Games**: Support for multiple games with unique sets of challenges.
- **Responsive Design**: Optimized for both mobile (on-the-go) and desktop.

## Supabase Integration & Setup

This project uses Supabase as its backend to manage games, teams, and real-time progress.

### 1. Create a Supabase Project
- Sign up or log in to [Supabase](https://supabase.com/).
- Create a new project.

### 2. Database Setup
- Open the **SQL Editor** in your Supabase dashboard.
- Copy and paste the contents of `supabase_setup.sql` (found in this repository) into the SQL editor and run it.
- This will create the necessary tables (`games`, `challenges`, `teams`, `team_progress`) and populate a sample game called "Downtown Explorer".

### 3. Enable Real-time
To see the leaderboard updates instantly, you must enable real-time for the `team_progress` and `teams` tables:
- Go to **Database** -> **Replication**.
- Click on **'18 tables'** (or similar) under the `supabase_realtime` publication.
- Toggle the switches to **ON** for `team_progress` and `teams`.

### 4. Environment Variables
- Create a `.env.local` file in the root directory.
- Copy the contents from `.env.example` and replace the values with your Supabase credentials:
  - `VITE_SUPABASE_URL`: Found in **Project Settings** -> **API**. Use the **Project URL** (e.g., `https://xyz.supabase.co`), NOT the API URL with `/rest/v1`.
  - `VITE_SUPABASE_ANON_KEY`: Found in **Project Settings** -> **API** -> `anon` `public`.

## Getting Started

### Prerequisites
- Node.js (Version 20.19+ or 22.12+)
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

The app will be available at `http://localhost:5173`. By default, it loads the sample game "Downtown Explorer" included in the SQL setup.
