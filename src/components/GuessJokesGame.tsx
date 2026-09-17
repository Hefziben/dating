import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Plus,
  Trash2,
  Settings2,
  Pencil,
  Save,
  Smile,
  Heart,
  Laugh,
  CheckCircle2,
  MessageCircleQuestion
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GuessJokesGameProps {
  onSuccess: (action: string, payload: any, metadata?: any) => void;
  isAdmin?: boolean;
}

export interface JokeItem {
  id: string;
  category: string;
  emoji: string;
  question: string;
  answer: string;
  hint?: string;
}

const DEFAULT_JOKES: JokeItem[] = [
  {
    id: 'joke_1',
    category: 'Juego de Palabras',
    emoji: '🐆',
    question: '¿Qué le dice un jaguar a otro jaguar?',
    answer: '¡Jaguar you! 😄',
    hint: 'Pista: Saludo en inglés...'
  },
  {
    id: 'joke_2',
    category: 'Tecnología & Animales',
    emoji: '🐦',
    question: '¿Por qué los pájaros no usan Facebook?',
    answer: '¡Porque ya tienen Twitter! 🐤'
  },
  {
    id: 'joke_3',
    category: 'Fitness & Naturaleza',
    emoji: '🐝',
    question: '¿Qué hace una abeja en el gimnasio?',
    answer: '¡Zumba! 💃🐝'
  },
  {
    id: 'joke_4',
    category: 'Cafetería & Tierno',
    emoji: '☕',
    question: '¿Qué le dice una taza a otra taza?',
    answer: '¡¿Qué taza-ciendo?! ☕👀'
  },
  {
    id: 'joke_5',
    category: 'Misterio Marino',
    emoji: '🌊',
    question: '¿Cómo se llama el campeón de buceo japonés?',
    answer: 'Tokofondo. ¿Y el subcampeón? Kasitoko. 🏊‍♂️'
  },
  {
    id: 'joke_6',
    category: 'Romántico & Bobo',
    emoji: '🏠',
    question: '¿Qué le dice un techo a otro techo?',
    answer: 'Techo de menos. ❤️🏠'
  },
  {
    id: 'joke_7',
    category: 'Peligro con Cafeína',
    emoji: '🚔',
    question: '¿Cuál es el café más peligroso del mundo?',
    answer: 'El ex-preso. ☕🚔'
  }
];

const PRESET_PACKS: { label: string; items: JokeItem[] }[] = [
  {
    label: '✨ Clásicos Tiernos & Bobos',
    items: DEFAULT_JOKES
  },
  {
    label: '❤️ Especial Cita & Coqueteo',
    items: [
      {
        id: 'r1',
        category: 'Dulce',
        emoji: '🍫',
        question: '¿Qué le dice un bombón a otro?',
        answer: '¡La vida contigo es tan dulce que me derrito!'
      },
      {
        id: 'r2',
        category: 'Geometría',
        emoji: '📐',
        question: '¿Sabes por qué me gusta tu sonrisa?',
        answer: 'Porque tiene el ángulo perfecto para alegrarme el día.'
      },
      {
        id: 'r3',
        category: 'Espacio',
        emoji: '🚀',
        question: '¿Qué le dice la Luna a la Tierra?',
        answer: 'Tan grande y todavía das tantas vueltas a mi alrededor.'
      },
      {
        id: 'r4',
        category: 'Tiempo',
        emoji: '⏰',
        question: '¿Qué hora es cuando un reloj marca una cita?',
        answer: '¡Hora de pasarla increíble juntos!'
      }
    ]
  },
  {
    label: '🍕 Antojos & Comida',
    items: [
      {
        id: 'f1',
        category: 'Pizzería',
        emoji: '🍕',
        question: '¿Qué hace una porción de pizza en un museo?',
        answer: '¡Admirar el arte culinario!'
      },
      {
        id: 'f2',
        category: 'Postres',
        emoji: '🍨',
        question: '¿Por qué el helado siempre está tan tranquilo?',
        answer: '¡Porque sabe mantener la sangre fría!'
      },
      {
        id: 'f3',
        category: 'Frutas',
        emoji: '🍓',
        question: '¿Qué hace una fresa frente a un espejo?',
        answer: '¡Admirando lo dulce y roja que está!'
      }
    ]
  }
];

const LOCAL_STORAGE_KEY = 'user_custom_guess_jokes';

export default function GuessJokesGame({ onSuccess, isAdmin = false }: GuessJokesGameProps) {
  const [jokes, setJokes] = useState<JokeItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return DEFAULT_JOKES;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const [revealedJokesCount, setRevealedJokesCount] = useState<Set<string>>(new Set());

  // Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editJokes, setEditJokes] = useState<JokeItem[]>(jokes);
  const [editorNotice, setEditorNotice] = useState<string | null>(null);

  // Sync editor when jokes change
  useEffect(() => {
    setEditJokes(jokes);
  }, [jokes]);

  const currentJoke = jokes[currentIndex] || jokes[0];

  const handleRevealAnswer = () => {
    if (isAnswerRevealed) return;

    setIsAnswerRevealed(true);
    setRevealedJokesCount(prev => new Set(prev).add(currentJoke.id));

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#F43F5E', '#FBBF24', '#34D399', '#EC4899', '#60A5FA']
    });

    onSuccess('JOKE_ANSWER_REVEALED', `Reveló chiste: "${currentJoke.question}" -> "${currentJoke.answer}"`, {
      jokeReaction: {
        jokeId: currentJoke.id,
        question: currentJoke.question,
        answer: currentJoke.answer
      }
    });
  };

  const handleNextJoke = () => {
    setIsAnswerRevealed(false);
    setCurrentIndex(prev => (prev + 1) % jokes.length);
  };

  const handlePrevJoke = () => {
    setIsAnswerRevealed(false);
    setCurrentIndex(prev => (prev - 1 + jokes.length) % jokes.length);
  };

  const handleRandomJoke = () => {
    if (jokes.length <= 1) return;
    setIsAnswerRevealed(false);
    let nextIdx = Math.floor(Math.random() * jokes.length);
    if (nextIdx === currentIndex) {
      nextIdx = (currentIndex + 1) % jokes.length;
    }
    setCurrentIndex(nextIdx);
  };

  const handleSendReaction = (reactionType: string, label: string) => {
    setUserReactions(prev => ({
      ...prev,
      [currentJoke.id]: reactionType
    }));

    onSuccess('JOKE_REACTION_DISPATCHED', `Reacción a chiste: ${label}`, {
      jokeReaction: {
        jokeId: currentJoke.id,
        question: currentJoke.question,
        answer: currentJoke.answer,
        reaction: label
      }
    });
  };

  // Editor operations
  const handleAddJoke = () => {
    const newJoke: JokeItem = {
      id: `joke_${Date.now()}`,
      category: 'Personalizado',
      emoji: '💡',
      question: '',
      answer: ''
    };
    setEditJokes([...editJokes, newJoke]);
  };

  const handleRemoveJoke = (id: string) => {
    if (editJokes.length <= 1) {
      setEditorNotice('Debes mantener al menos 1 chiste.');
      setTimeout(() => setEditorNotice(null), 3000);
      return;
    }
    setEditJokes(editJokes.filter(j => j.id !== id));
  };

  const handleSaveEditor = () => {
    const hasEmpty = editJokes.some(j => !j.question.trim() || !j.answer.trim());
    if (hasEmpty) {
      setEditorNotice('Todos los chistes deben tener tanto pregunta como respuesta.');
      return;
    }

    setJokes(editJokes);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(editJokes));
    } catch {
      // Ignore
    }

    setIsEditorOpen(false);
    setCurrentIndex(0);
    setIsAnswerRevealed(false);
    setEditorNotice(null);
  };

  const handleResetToDefault = () => {
    setJokes(DEFAULT_JOKES);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setIsEditorOpen(false);
    setCurrentIndex(0);
    setIsAnswerRevealed(false);
  };

  const activeReaction = userReactions[currentJoke.id];

  return (
    <div className="space-y-5">
      {/* Top Header Controls: Info & Customize button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
          <MessageCircleQuestion className="w-3.5 h-3.5 text-sky-500" />
          <span>CHISTES CORTOS & ADIVINANZAS</span>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            className="cursor-pointer text-[11px] font-mono text-sky-700 hover:text-sky-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-sky-300 bg-sky-50 hover:bg-sky-100 transition-colors shadow-xs"
          >
            <Settings2 className="w-3.5 h-3.5 text-sky-600" />
            <span>{isEditorOpen ? 'Cerrar Editor' : 'Añadir / Editar Chistes'}</span>
          </button>
        )}
      </div>

      {/* CUSTOMIZATION EDITOR DRAWER (ADMIN ONLY) */}
      <AnimatePresence>
        {isAdmin && isEditorOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-white border border-sky-200 rounded-2xl space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase">
                  Editor de Chistes y Adivinanzas
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                ({editJokes.length} chistes guardados)
              </span>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Cargar colección temática:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PACKS.map((pack, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEditJokes(pack.items)}
                    className="cursor-pointer text-[11px] font-mono px-2.5 py-1 rounded-lg border border-sky-200 bg-sky-50/50 hover:border-sky-300 hover:bg-sky-100/60 text-slate-700 transition-colors"
                  >
                    {pack.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Jokes List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-600 font-semibold">
                  Tus chistes (Pregunta y Remate):
                </span>
                <button
                  type="button"
                  onClick={handleAddJoke}
                  className="cursor-pointer text-[10px] font-mono text-sky-600 hover:text-sky-800 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Añadir chiste</span>
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {editJokes.map((joke, idx) => (
                  <div
                    key={joke.id}
                    className="p-3 bg-sky-50/30 border border-sky-200 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={joke.emoji}
                          onChange={e => {
                            const next = [...editJokes];
                            next[idx].emoji = e.target.value.slice(0, 2);
                            setEditJokes(next);
                          }}
                          className="w-8 h-8 text-center text-base bg-white rounded-lg border border-sky-200 focus:outline-none focus:border-sky-400"
                          title="Emoji"
                        />
                        <input
                          type="text"
                          value={joke.category}
                          onChange={e => {
                            const next = [...editJokes];
                            next[idx].category = e.target.value;
                            setEditJokes(next);
                          }}
                          placeholder="Categoría (e.g. Comida, Tierno)"
                          className="text-[11px] font-mono p-1.5 rounded-md border border-sky-200 bg-white text-slate-700 w-36"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveJoke(joke.id)}
                        disabled={editJokes.length <= 1}
                        className="cursor-pointer p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Eliminar chiste"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-0.5">
                          Pregunta / Planteamiento:
                        </label>
                        <input
                          type="text"
                          value={joke.question}
                          onChange={e => {
                            const next = [...editJokes];
                            next[idx].question = e.target.value;
                            setEditJokes(next);
                          }}
                          placeholder="Ej: ¿Qué le dice un jaguar a otro jaguar?"
                          className="w-full text-xs font-semibold p-2 rounded-lg border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-0.5">
                          Respuesta / Remate a revelar:
                        </label>
                        <input
                          type="text"
                          value={joke.answer}
                          onChange={e => {
                            const next = [...editJokes];
                            next[idx].answer = e.target.value;
                            setEditJokes(next);
                          }}
                          placeholder="Ej: ¡Jaguar you!"
                          className="w-full text-xs font-medium p-2 rounded-lg border border-sky-300 bg-white focus:outline-none focus:border-sky-500 text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {editorNotice && (
              <div className="text-[11px] font-mono text-amber-900 bg-amber-100 p-2 rounded-lg border border-amber-300 text-center">
                {editorNotice}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="cursor-pointer text-[11px] font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer chistes originales</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="cursor-pointer px-3 py-1.5 text-xs font-mono text-slate-600 hover:text-slate-900 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditor}
                  className="cursor-pointer px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>Guardar Chistes</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JOKE CARD CONTAINER */}
      <div className="p-5 sm:p-7 bg-white border border-sky-200 rounded-2xl shadow-xs text-center space-y-5 relative overflow-hidden">
        {/* Top Card Badge: Index & Category */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-sky-100 pb-2.5">
          <span className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-slate-700">
            {currentJoke.emoji} {currentJoke.category}
          </span>
          <span>
            Chiste {currentIndex + 1} de {jokes.length}
          </span>
        </div>

        {/* The Question Prompt */}
        <div className="space-y-2 py-2">
          <div className="text-[11px] font-mono text-sky-700 font-bold uppercase tracking-wider">
            ¿Te la sabes?
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 leading-snug px-2 sm:px-6">
            "{currentJoke.question}"
          </h3>
          {currentJoke.hint && !isAnswerRevealed && (
            <p className="text-[11px] font-mono text-slate-400 italic">
              💡 {currentJoke.hint}
            </p>
          )}
        </div>

        {/* REVEAL AREA / TAP TO REVEAL CARD */}
        <div className="min-h-[110px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!isAnswerRevealed ? (
              <motion.button
                key="unrevealed"
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRevealAnswer}
                className="cursor-pointer w-full max-w-sm p-4 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 hover:border-sky-400 transition-all flex flex-col items-center justify-center gap-1.5 group shadow-xs"
              >
                <div className="w-9 h-9 rounded-full bg-white text-sky-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-sky-800 uppercase tracking-wider">
                  Toca aquí para revelar la respuesta
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  (Descubre el remate del chiste)
                </span>
              </motion.button>
            ) : (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm p-5 rounded-2xl bg-gradient-to-b from-sky-50 to-white border border-sky-300 shadow-sm space-y-2.5 text-center"
              >
                <div className="inline-flex items-center gap-1 text-[10px] font-mono text-sky-700 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Respuesta / Remate</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentJoke.answer}
                </div>
                <div className="pt-1 text-[11px] font-mono text-slate-400">
                  ¿Qué te pareció el chiste? 👇
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* REACTIONS BAR (ACTIVE WHEN REVEALED) */}
        {isAnswerRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-1 space-y-2 border-t border-sky-100"
          >
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleSendReaction('laugh', '😂 Me dio mucha risa')}
                className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
                  activeReaction === 'laugh'
                    ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs font-bold'
                    : 'bg-sky-50/50 border-sky-200 hover:border-sky-300 text-slate-700'
                }`}
              >
                <span>😂</span>
                <span>Me dio risa</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendReaction('sweet', '🙄 Malísimo pero tierno')}
                className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
                  activeReaction === 'sweet'
                    ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs font-bold'
                    : 'bg-sky-50/50 border-sky-200 hover:border-sky-300 text-slate-700'
                }`}
              >
                <span>🙄</span>
                <span>Malo pero tierno</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendReaction('love', '❤️ Me encantó')}
                className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
                  activeReaction === 'love'
                    ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs font-bold'
                    : 'bg-sky-50/50 border-sky-200 hover:border-sky-300 text-slate-700'
                }`}
              >
                <span>❤️</span>
                <span>Me encantó</span>
              </button>
            </div>

            {activeReaction && (
              <div className="text-[10px] font-mono text-sky-700 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-sky-600" />
                <span>Reacción enviada al chat privado</span>
              </div>
            )}
          </motion.div>
        )}

        {/* BOTTOM NAVIGATION: PREV, NEXT, SHUFFLE */}
        <div className="flex items-center justify-between pt-2 border-t border-sky-100">
          <button
            type="button"
            onClick={handlePrevJoke}
            className="cursor-pointer px-3 py-1.5 rounded-lg border border-sky-200 bg-sky-50/50 hover:bg-white text-slate-700 hover:text-slate-900 text-xs font-mono flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          <button
            type="button"
            onClick={handleRandomJoke}
            title="Chiste al azar"
            className="cursor-pointer p-2 rounded-lg border border-sky-200 bg-sky-50/50 hover:bg-white text-slate-700 hover:text-slate-900 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleNextJoke}
            className="cursor-pointer px-3 py-1.5 rounded-lg border border-sky-300 bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold flex items-center gap-1 transition-colors shadow-xs"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>
      </div>

      {/* JOKES PROGRESS & THUMBNAILS LIST (ADMIN ONLY - HIDDEN TO USER) */}
      {isAdmin && (
        <div className="p-3.5 bg-sky-50/40 border border-sky-200 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider px-1">
            <span>Colección de chistes (Vista Admin):</span>
            <span>{revealedJokesCount.size} de {jokes.length} descubiertos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {jokes.map((j, idx) => {
              const isCurrent = idx === currentIndex;
              const isRevealed = revealedJokesCount.has(j.id);
              return (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => {
                    setIsAnswerRevealed(false);
                    setCurrentIndex(idx);
                  }}
                  className={`cursor-pointer p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    isCurrent
                      ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-200 shadow-xs'
                      : 'bg-white border-sky-200 hover:border-sky-300'
                  }`}
                >
                  <span className="text-base">{j.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {j.question}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>{j.category}</span>
                      {isRevealed ? (
                        <span className="text-sky-700 font-medium">Descubierto</span>
                      ) : (
                        <span>Oculto</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
