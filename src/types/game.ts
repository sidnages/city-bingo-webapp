export interface Challenge {
  id: string;
  game_id: string;
  title: string;
  description: string;
  position: number;
  is_free_space: boolean;
  isCompleted?: boolean; // Derived from team_progress
  instagramUrl?: string; // Derived from team_progress
}

export interface Team {
  id: string;
  game_id: string;
  team_code: string;
  name: string;
  score: number; // Derived from count of team_progress
  started_at?: string;
}

export interface Game {
  id: string;
  game_code: string;
  name: string;
  duration_seconds: number;
  created_at: string;
  admin_passcode?: string;
  started_at?: string;
  stopped_at?: string;
  published_at?: string;
  points_per_square: number;
  points_per_bingo: number;
  points_per_unique: number;
  require_instagram: boolean;
  game_rules?: string;
}

export interface TeamProgress {
  id: string;
  team_id: string;
  challenge_id: string;
  completed_at: string;
  instagram_url?: string;
}
