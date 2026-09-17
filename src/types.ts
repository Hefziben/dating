export type GameId = 
  | 'thumb_saver'
  | 'custom_wordle'
  | 'terminal_adventure'
  | 'recommendation_engine';

export interface TelemetryLog {
  id: string;
  gameId: GameId;
  gameTitle: string;
  action: string;
  payload: string | Record<string, any>;
  timestamp: string;
  metadata?: {
    dodgeAttempts?: number;
    wordleAttempts?: number;
    pollAnswer?: { question: string; selectedOption: string; optionText?: string; customText?: string };
    roulettePrize?: { prize: string; emoji: string; description?: string };
    jokeReaction?: { jokeId: string; question: string; answer: string; reaction?: string };
    quizChoices?: Record<string, string>;
    adventurePath?: string;
  };
}

export interface DailyGameConfig {
  dayNumber: number;
  id: GameId;
  moduleCode: string;
  title: string;
  subtitle: string;
  suggestedText: string;
  badge: string;
}

export interface UserStats {
  birthdayDaysLeft: number;
  savingsDollars: number;
  birthdayDate?: string; // Optional target date (YYYY-MM-DD) for automatic countdown calculation
}

