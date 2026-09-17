import { DailyGameConfig, GameId } from '../types';

export const DAILY_GAMES_LIST: DailyGameConfig[] = [
  {
    dayNumber: 1,
    id: 'thumb_saver',
    moduleCode: 'MODULE_01 // THUMB_SAVER.EXE',
    title: 'The Single-Button RSVP',
    subtitle: 'Zero-friction invite designed for thumbs that refuse to type lengthy mobile essays.',
    suggestedText: 'Since you hate typing on your phone, I built an app to save your thumbs the trouble: [link]',
    badge: 'Day 1 • RSVP Protocol'
  },
  {
    dayNumber: 2,
    id: 'custom_wordle',
    moduleCode: 'MODULE_02 // DAILY_DILEMMA.EXE',
    title: 'The Daily Dilemma & Superpower Poll',
    subtitle: 'A lighthearted choice prompt with customizable options and personalized free text.',
    suggestedText: 'Pregunta rápida para ti: Si pudieras tener un superpoder por un día, ¿cuál escogerías? [link]',
    badge: 'Day 2 • Question Poll'
  },
  {
    dayNumber: 3,
    id: 'terminal_adventure',
    moduleCode: 'MODULE_03 // LUCKY_ROULETTE.EXE',
    title: 'The Lucky Date Roulette',
    subtitle: 'Gira la ruleta interactiva para ganar tu antojo o premio: pizza, pasta, soda, jugo, paleta y más.',
    suggestedText: 'Te armé una ruleta interactiva hoy: gírala y el premio que te toque te lo invito este fin de semana: [link]',
    badge: 'Day 3 • Spin & Win'
  },
  {
    dayNumber: 4,
    id: 'recommendation_engine',
    moduleCode: 'MODULE_04 // GUESS_JOKES.FUN',
    title: 'Short Guess Jokes',
    subtitle: 'Chistes y adivinanzas cortas: lee la pregunta y toca para revelar la respuesta.',
    suggestedText: 'Tengo un chiste rápido para sacarte una sonrisa hoy: lee la pregunta y toca para ver la respuesta: [link]',
    badge: 'Day 4 • Guess Jokes'
  }
];

export const getDailyGameByDay = (day: number): DailyGameConfig => {
  const normalizedDay = ((day - 1) % DAILY_GAMES_LIST.length) + 1;
  return DAILY_GAMES_LIST.find(g => g.dayNumber === normalizedDay) || DAILY_GAMES_LIST[0];
};

export const calculateScheduledDay = (): number => {
  // Cycle 1 to 4 based on date
  const date = new Date();
  const startEpochDay = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return (startEpochDay % DAILY_GAMES_LIST.length) + 1;
};
