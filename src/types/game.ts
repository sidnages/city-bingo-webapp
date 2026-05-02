export interface Challenge {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isFreeSpace?: boolean;
}

export interface Team {
  id: string;
  name: string;
  score: number;
}

export interface GameState {
  teamName: string;
  challenges: Challenge[];
  startTime: number; // timestamp
  otherTeams: Team[];
}
