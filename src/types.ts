export type GameId = 
  | 'thumb_saver'
  | 'custom_wordle'
  | 'terminal_adventure'
  | 'recommendation_engine';

export interface BankTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'note';
  amount: number;
  description: string;
  date: string;
}

export interface UserProfile {
  id: string;
  username: string;
  birthdayDaysLeft: number;
  savingsDollars: number;
  birthdayDate?: string;
  bankName?: string;
  accountNumber?: string;
  bankNotes?: string;
  transactions?: BankTransaction[];
  createdAt?: string;
  updatedAt?: string;
}

export type UserStats = UserProfile;

export interface TelemetryLog {
  id: string;
  gameId: GameId;
  gameTitle: string;
  action: string;
  payload: string | Record<string, any>;
  timestamp: string;
  username?: string;
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
