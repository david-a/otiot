export interface Word {
  /** Stable id derived from filename/slug */
  id: string;
  /** Word without nikud – for display in some contexts */
  word: string;
  /** Fully pointed word (with nikud) used in the game */
  nikud: string;
  /** Public URL to an image under /static or a remote URL */
  imageUrl: string;
  /** Optional URL to a recorded word pronunciation */
  soundUrl?: string | null;
  /** Difficulty level (1–4 as in the original spec) */
  level: number;
}

export interface Progress {
  playerId: string;
  playerName: string;
  currentLevel: number;
  completedWordIds: string[];
  totalScore: number;
  lastPlayedAt: string;
  currentWordId?: string;
}


