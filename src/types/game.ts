export interface Challenge {
  id: string;
  game_id: string;
  title: string;
  description: string;
  position: number;
  is_free_space: boolean;
  isCompleted?: boolean; // Derived from team_progress
}

export interface Team {
  id: string;
  game_id: string;
  name: string;
  score: number; // Derived from count of team_progress
}

export interface Game {
  id: string;
  name: string;
  duration_seconds: number;
  created_at: string;
}

export interface TeamProgress {
  id: string;
  team_id: string;
  challenge_id: string;
  completed_at: string;
}
