# City Bingo

City Bingo is a real-world scavenger hunt application designed for groups and teams to explore their environment in a fun, interactive way. Teams compete to complete a 5x5 grid of challenges (like "Find a Blue Door" or "Statue Selfie") within a set time limit. The progress is tracked in real-time across all teams, creating an engaging and competitive urban adventure.

## Features
- **Authentication**: Secure login and registration using Supabase Magic Links.
- **Game IDs**: Join specific games using unique 6-character alphanumeric codes (e.g., `CITY26`).
- **Team Management**: Create new teams or join existing ones.
- **Real-time Leaderboard**: See other teams' progress as they complete challenges.
- **Dynamic Bingo Grid**: Interactive flip-cards for each challenge.
- **Responsive Design**: Optimized for both mobile (on-the-go) and desktop.

## Supabase Integration & Setup

This project uses Supabase as its backend to manage games, teams, and real-time progress.

### 1. Create a Supabase Project
- Sign up or log in to [Supabase](https://supabase.com/).
- Create a new project.

### 2. Database Setup
- Open the **SQL Editor** in your Supabase dashboard.
- Copy and paste the contents of `supabase_setup.sql` (found in this repository) into the SQL editor and run it.
- This will create the necessary tables (`games`, `challenges`, `teams`, `profiles`, `team_progress`) and populate a sample game called "Downtown Explorer" with Game ID `CITY26`.

### 3. Enable Real-time
To see the leaderboard updates instantly, you must enable real-time for the `team_progress`, `teams`, and `profiles` tables:
- Go to **Database** -> **Replication**.
- Click on the `supabase_realtime` publication.
- Toggle the switches to **ON** for `team_progress`, `teams`, and `profiles`.

### 4. Authentication Setup
In your Supabase Dashboard:
- Go to **Authentication -> Providers** and ensure **Email** is enabled with **Magic Link** support.
- Add your local and production URLs to **Authentication -> URL Configuration** (e.g. `http://localhost:5173`).

### 5. Environment Variables
- Create a `.env` file in the root directory.
- Copy the contents from `.env.example` and replace the values with your Supabase credentials:
  - `VITE_SUPABASE_URL`: Found in **Project Settings** -> **API**.
  - `VITE_SUPABASE_ANON_KEY`: Found in **Project Settings** -> **API** -> `anon` `public`.

## Getting Started

### Prerequisites
- Node.js
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

## 🕹 How to Play

1. **Register:** Open the site and click "Register your team".
2. **Game ID:** Enter the Game ID provided by the organizer (try `CITY26` for the sample game).
3. **Team:** Enter your team name and email address.
4. **Login:** Check your email for the Magic Link to access your dashboard.
5. **Hunt:** Explore the city and click squares as you find them!
