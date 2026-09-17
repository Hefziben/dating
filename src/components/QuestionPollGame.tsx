import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  HelpCircle,
  Settings2,
  CheckCircle2,
  Send,
  Plus,
  Trash2,
  RotateCcw,
  MessageSquareHeart,
  Save,
  Pencil,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuestionPollGameProps {
  onSuccess: (action: string, payload: any, metadata?: any) => void;
  isAdmin?: boolean;
}

interface PollOption {
  id: string;
  letter: string;
  text: string;
}

interface QuestionConfig {
  question: string;
  options: PollOption[];
  freeTextOption: {
    id: string;
    letter: string;
    label: string;
    placeholder: string;
  };
}

const DEFAULT_SUPERPOWER_CONFIG: QuestionConfig = {
  question: 'Si pudieras tener un superpoder por un día, ¿cuál escogerías?',
  options: [
    {
      id: 'opt_a',
      letter: 'A',
      text: 'Leer la mente (para saber qué piensa cierta persona... 👀).'
    },
    {
      id: 'opt_b',
      letter: 'B',
      text: 'Teletransportación (para viajar gratis a donde sea en un segundo).'
    },
    {
      id: 'opt_c',
      letter: 'C',
      text: 'Invisibilidad (para enterarme de chismes sin que me vean).'
    },
    {
      id: 'opt_d',
      letter: 'D',
      text: 'Detener el tiempo (para poder dormir un par de horas más por las mañanas).'
    }
  ],
  freeTextOption: {
    id: 'opt_free',
    letter: 'E',
    label: 'Otro... detalla:',
    placeholder: 'Escribe tu superpoder personalizado o detalle aquí...'
  }
};

const PRESET_QUESTIONS: { label: string; config: QuestionConfig }[] = [
  {
    label: '⚡ Superpoder (Por defecto)',
    config: DEFAULT_SUPERPOWER_CONFIG
  },
  {
    label: '🍕 Cita Ideal de Fin de Semana',
    config: {
      question: 'Si nos escapamos este fin de semana, ¿cuál sería tu plan ideal?',
      options: [
        {
          id: 'opt_a',
          letter: 'A',
          text: 'Pizza artesanal en un lugar escondido y con luz tenue.'
        },
        {
          id: 'opt_b',
          letter: 'B',
          text: 'Caminar sin prisa con un café o boba en mano hablando de todo.'
        },
        {
          id: 'opt_c',
          letter: 'C',
          text: 'Una tarde de películas o series con botanas ilimitadas.'
        }
      ],
      freeTextOption: {
        id: 'opt_free',
        letter: 'D',
        label: 'Otro... detalla:',
        placeholder: 'Cuéntame tu plan ideal exacto...'
      }
    }
  },
  {
    label: '🍜 Comida que cura el alma',
    config: {
      question: '¿Qué comida es capaz de arreglar cualquier día pesado?',
      options: [
        {
          id: 'opt_a',
          letter: 'A',
          text: 'Tacos recién hechos con mucha salsa y limón.'
        },
        {
          id: 'opt_b',
          letter: 'B',
          text: 'Una buena hamburguesa jugosa con papas fritas.'
        },
        {
          id: 'opt_c',
          letter: 'C',
          text: 'Sushi fresco o ramen caliente reconfortante.'
        },
        {
          id: 'opt_d',
          letter: 'D',
          text: 'Helado o postre de chocolate gigante.'
        }
      ],
      freeTextOption: {
        id: 'opt_free',
        letter: 'E',
        label: 'Otro... detalla:',
        placeholder: '¿Cuál es ese platillo infalible para ti?...'
      }
    }
  }
];

const LOCAL_STORAGE_KEY = 'user_custom_poll_config';

export default function QuestionPollGame({ onSuccess, isAdmin = false }: QuestionPollGameProps) {
  // Load question configuration
  const [config, setConfig] = useState<QuestionConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse error
    }
    return DEFAULT_SUPERPOWER_CONFIG;
  });

  // Active answer state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [freeTextAnswer, setFreeTextAnswer] = useState('');
  const [extraNote, setExtraNote] = useState('');
  const [showExtraNote, setShowExtraNote] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState<{
    selectedOption: string;
    optionLetter: string;
    customText?: string;
    extraNote?: string;
    timestamp: string;
  } | null>(null);

  // Question Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState(config.question);
  const [editOptions, setEditOptions] = useState<PollOption[]>(config.options);
  const [editFreeTextLabel, setEditFreeTextLabel] = useState(config.freeTextOption.label);
  const [editFreeTextPlaceholder, setEditFreeTextPlaceholder] = useState(config.freeTextOption.placeholder);
  const [editorNotice, setEditorNotice] = useState<string | null>(null);

  // Sync editor when config changes
  useEffect(() => {
    setEditQuestion(config.question);
    setEditOptions(config.options);
    setEditFreeTextLabel(config.freeTextOption.label);
    setEditFreeTextPlaceholder(config.freeTextOption.placeholder);
  }, [config]);

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
  };

  const isFreeTextSelected = selectedOptionId === config.freeTextOption.id;

  const canSubmit =
    selectedOptionId !== null &&
    (!isFreeTextSelected || freeTextAnswer.trim().length > 0);

  const handleSubmitAnswer = () => {
    if (!canSubmit || !selectedOptionId) return;

    let chosenText = '';
    let letter = '';

    if (isFreeTextSelected) {
      letter = config.freeTextOption.letter;
      chosenText = `${config.freeTextOption.label} "${freeTextAnswer.trim()}"`;
    } else {
      const opt = config.options.find(o => o.id === selectedOptionId);
      if (opt) {
        letter = opt.letter;
        chosenText = `${opt.letter}) ${opt.text}`;
      }
    }

    const payload = {
      question: config.question,
      selectedOption: chosenText,
      optionLetter: letter,
      customText: isFreeTextSelected ? freeTextAnswer.trim() : undefined,
      extraNote: extraNote.trim() ? extraNote.trim() : undefined,
      timestamp: new Date().toLocaleTimeString()
    };

    setSubmittedAnswer(payload);

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#F43F5E', '#EC4899', '#FDA4AF', '#FBBF24', '#A78BFA']
    });

    onSuccess('POLL_ANSWER_SUBMITTED', `Escogió: [${letter}] ${chosenText}`, {
      pollAnswer: {
        question: config.question,
        selectedOption: chosenText,
        customText: isFreeTextSelected ? freeTextAnswer.trim() : (extraNote.trim() || undefined)
      }
    });
  };

  // Editor Actions
  const handleAddOption = () => {
    const nextCharCode = 65 + editOptions.length; // A, B, C, D...
    const letter = String.fromCharCode(nextCharCode);
    const newOpt: PollOption = {
      id: `opt_${Date.now()}`,
      letter,
      text: ''
    };
    setEditOptions([...editOptions, newOpt]);
  };

  const handleRemoveOption = (id: string) => {
    if (editOptions.length <= 3) {
      setEditorNotice('Se requieren al menos 3 opciones.');
      setTimeout(() => setEditorNotice(null), 3000);
      return;
    }
    const filtered = editOptions.filter(o => o.id !== id);
    // Re-assign letters A, B, C...
    const reindexed = filtered.map((opt, idx) => ({
      ...opt,
      letter: String.fromCharCode(65 + idx)
    }));
    setEditOptions(reindexed);
  };

  const handleSaveEditor = () => {
    if (!editQuestion.trim()) {
      setEditorNotice('Por favor escribe una pregunta.');
      return;
    }
    if (editOptions.length < 3) {
      setEditorNotice('Debes incluir al menos 3 opciones.');
      return;
    }
    const hasEmpty = editOptions.some(o => !o.text.trim());
    if (hasEmpty) {
      setEditorNotice('Todas las opciones deben tener texto.');
      return;
    }

    const freeTextLetter = String.fromCharCode(65 + editOptions.length);

    const newConfig: QuestionConfig = {
      question: editQuestion.trim(),
      options: editOptions.map((o, idx) => ({
        ...o,
        letter: String.fromCharCode(65 + idx),
        text: o.text.trim()
      })),
      freeTextOption: {
        id: 'opt_free',
        letter: freeTextLetter,
        label: editFreeTextLabel.trim() || 'Otro... detalla:',
        placeholder: editFreeTextPlaceholder.trim() || 'Escribe tu respuesta personalizada aquí...'
      }
    };

    setConfig(newConfig);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
    } catch {
      // Ignore
    }

    setIsEditorOpen(false);
    setSelectedOptionId(null);
    setFreeTextAnswer('');
    setExtraNote('');
    setSubmittedAnswer(null);
    setEditorNotice(null);
  };

  const handleApplyPreset = (presetConfig: QuestionConfig) => {
    setEditQuestion(presetConfig.question);
    setEditOptions(presetConfig.options);
    setEditFreeTextLabel(presetConfig.freeTextOption.label);
    setEditFreeTextPlaceholder(presetConfig.freeTextOption.placeholder);
    setEditorNotice(null);
  };

  const handleResetToDefault = () => {
    setConfig(DEFAULT_SUPERPOWER_CONFIG);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setIsEditorOpen(false);
    setSelectedOptionId(null);
    setFreeTextAnswer('');
    setExtraNote('');
    setSubmittedAnswer(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Controls: Info & Customize Question button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
          <MessageSquareHeart className="w-3.5 h-3.5 text-sky-500" />
          <span>DILEMA & PREGUNTA DEL DÍA</span>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            className="cursor-pointer text-[11px] font-mono text-sky-700 hover:text-sky-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-sky-300 bg-sky-50 hover:bg-sky-100 transition-colors shadow-xs"
          >
            <Settings2 className="w-3.5 h-3.5 text-sky-600" />
            <span>{isEditorOpen ? 'Cerrar Editor' : 'Personalizar Pregunta'}</span>
          </button>
        )}
      </div>

      {/* QUESTION EDITOR DRAWER / CARD (ADMIN ONLY) */}
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
                  Editor de Pregunta y Opciones
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                (Mínimo 3 opciones + texto libre)
              </span>
            </div>

            {/* Presets Quick Select */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Cargar plantilla predefinida:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_QUESTIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset.config)}
                    className="cursor-pointer text-[11px] font-mono px-2.5 py-1 rounded-lg border border-sky-200 bg-sky-50/50 hover:border-sky-300 hover:bg-sky-100/60 text-slate-700 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono text-slate-600 font-semibold">
                Pregunta principal:
              </label>
              <textarea
                value={editQuestion}
                onChange={e => setEditQuestion(e.target.value)}
                rows={2}
                className="w-full text-xs font-sans p-2.5 rounded-xl border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-900 transition-colors resize-none"
                placeholder="Escribe tu pregunta aquí..."
              />
            </div>

            {/* Options List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-mono text-slate-600 font-semibold">
                  Opciones con inciso (Mínimo 3):
                </label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="cursor-pointer text-[10px] font-mono text-sky-600 hover:text-sky-800 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Añadir opción</span>
                </button>
              </div>

              <div className="space-y-2">
                {editOptions.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-sky-50 border border-sky-200 text-sky-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={e => {
                        const next = [...editOptions];
                        next[idx].text = e.target.value;
                        setEditOptions(next);
                      }}
                      placeholder={`Texto para opción ${String.fromCharCode(65 + idx)}...`}
                      className="flex-1 text-xs font-sans p-2 rounded-lg border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(opt.id)}
                      disabled={editOptions.length <= 3}
                      title="Eliminar opción"
                      className="cursor-pointer p-1.5 rounded text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Free Text Option Configuration */}
            <div className="p-3 bg-sky-50/40 border border-sky-200 rounded-xl space-y-2">
              <div className="text-[11px] font-mono text-slate-700 font-semibold flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-sky-200 text-sky-800 font-mono text-[10px] flex items-center justify-center">
                  {String.fromCharCode(65 + editOptions.length)}
                </span>
                <span>Opción de texto libre personalizado:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">
                    Etiqueta visible:
                  </label>
                  <input
                    type="text"
                    value={editFreeTextLabel}
                    onChange={e => setEditFreeTextLabel(e.target.value)}
                    className="w-full text-xs font-sans p-2 rounded-lg border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-900"
                    placeholder="Otro... detalla:"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">
                    Texto sugerido (placeholder):
                  </label>
                  <input
                    type="text"
                    value={editFreeTextPlaceholder}
                    onChange={e => setEditFreeTextPlaceholder(e.target.value)}
                    className="w-full text-xs font-sans p-2 rounded-lg border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-900"
                    placeholder="Escribe tu superpoder o detalle..."
                  />
                </div>
              </div>
            </div>

            {editorNotice && (
              <div className="text-[11px] font-mono text-amber-900 bg-amber-100 p-2 rounded-lg border border-amber-300 text-center">
                {editorNotice}
              </div>
            )}

            {/* Save / Reset Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="cursor-pointer text-[11px] font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer por defecto</span>
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
                  <span>Guardar Pregunta</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUESTION DISPLAY CARD */}
      <div className="p-4 sm:p-5 bg-white border border-sky-200/80 rounded-2xl space-y-2 shadow-xs">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-sky-700 font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>Pregunta Abierta del Día</span>
        </div>
        <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 leading-snug">
          {config.question}
        </h3>
        <p className="text-[11px] text-slate-500">
          Selecciona una de las opciones o elige la opción {config.freeTextOption.letter} para escribir tu respuesta personalizada.
        </p>
      </div>

      {/* ANSWER FORM / CONFIRMATION */}
      {!submittedAnswer ? (
        <div className="space-y-3">
          {/* Options List */}
          <div className="space-y-2.5">
            {config.options.map(option => {
              const isSelected = selectedOptionId === option.id;
              return (
                <motion.div
                  key={option.id}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectOption(option.id)}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-start gap-3 select-none ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-400 text-slate-900 shadow-sm ring-1 ring-sky-300'
                      : 'bg-white border-sky-200 hover:border-sky-300 hover:bg-sky-50/30 text-slate-700'
                  }`}
                >
                  {/* Letter badge */}
                  <div
                    className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-amber-300 shadow-xs'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {option.letter}
                  </div>

                  {/* Text */}
                  <div className="flex-1 pt-0.5">
                    <span className="text-xs sm:text-sm font-medium leading-relaxed">
                      {option.text}
                    </span>
                  </div>

                  {/* Radio Indicator */}
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500'
                        : 'border-sky-200 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </motion.div>
              );
            })}

            {/* OPTION E: FREE TEXT OPTION ("Otro... detalla:") */}
            <motion.div
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelectOption(config.freeTextOption.id)}
              className={`cursor-pointer p-3.5 rounded-xl border transition-all space-y-2 select-none ${
                isFreeTextSelected
                  ? 'bg-sky-50/80 border-sky-400 text-slate-900 shadow-sm ring-1 ring-sky-300'
                  : 'bg-white border-sky-200 hover:border-sky-300 hover:bg-sky-50/30 text-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                    isFreeTextSelected
                      ? 'bg-slate-900 text-amber-300 shadow-xs'
                      : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {config.freeTextOption.letter}
                </div>

                <div className="flex-1 pt-0.5">
                  <span className="text-xs sm:text-sm font-semibold leading-relaxed">
                    {config.freeTextOption.label}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Respuesta libre y personalizada
                  </span>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                    isFreeTextSelected
                      ? 'border-sky-500 bg-sky-500'
                      : 'border-sky-200 bg-white'
                  }`}
                >
                  {isFreeTextSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              {/* Expandable Text Input for Option E */}
              <AnimatePresence>
                {isFreeTextSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2"
                    onClick={e => e.stopPropagation()}
                  >
                    <textarea
                      autoFocus
                      rows={3}
                      value={freeTextAnswer}
                      onChange={e => setFreeTextAnswer(e.target.value)}
                      placeholder={config.freeTextOption.placeholder}
                      className="w-full text-xs font-sans p-3 rounded-xl border border-sky-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 text-slate-800 placeholder:text-slate-400 resize-none shadow-xs"
                    />
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                      <span>Tu respuesta personalizada</span>
                      <span>{freeTextAnswer.length} caracteres</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Optional Extra Comment for Standard Options (A, B, C, D) */}
          {!isFreeTextSelected && selectedOptionId && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowExtraNote(!showExtraNote)}
                className="cursor-pointer text-[11px] font-mono text-slate-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showExtraNote ? 'rotate-180' : ''}`}
                />
                <span>{showExtraNote ? 'Ocultar comentario extra' : '+ Añadir comentario o por qué escogiste esta opción (opcional)'}</span>
              </button>

              {showExtraNote && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-2"
                >
                  <input
                    type="text"
                    value={extraNote}
                    onChange={e => setExtraNote(e.target.value)}
                    placeholder="Ejemplo: ¡Porque necesito dormir más tiempo sin culpa!"
                    className="w-full text-xs font-sans p-2.5 rounded-lg border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-800"
                  />
                </motion.div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-3">
            <motion.button
              type="button"
              whileHover={canSubmit ? { scale: 1.02 } : {}}
              whileTap={canSubmit ? { scale: 0.98 } : {}}
              disabled={!canSubmit}
              onClick={handleSubmitAnswer}
              className={`w-full py-3.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                canSubmit
                  ? 'cursor-pointer bg-slate-900 hover:bg-slate-800 text-white shadow-md border border-sky-300'
                  : 'cursor-not-allowed bg-slate-100 text-slate-400 opacity-70 border border-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>Enviar Respuesta al Chat</span>
            </motion.button>
            <div className="text-center text-[10px] font-mono text-slate-400 mt-2">
              Tu selección se despachará al registro privado en tiempo real.
            </div>
          </div>
        </div>
      ) : (
        /* CONFIRMATION / RESPONSE CAPTURED VIEW */
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-sky-50/70 border border-sky-200 rounded-2xl text-center space-y-4 shadow-xs"
        >
          <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900">
              ¡Respuesta Recibida con Éxito!
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Tu elección quedó registrada en la bitácora privada del chat.
            </p>
          </div>

          {/* Captured Choice Card */}
          <div className="p-4 bg-white border border-sky-200 rounded-xl text-left space-y-2 max-w-md mx-auto shadow-xs">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-sky-100 pb-1.5">
              <span>OPCIÓN SELECCIONADA</span>
              <span className="text-sky-700 font-semibold">{submittedAnswer.timestamp}</span>
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <span className="w-6 h-6 rounded bg-slate-900 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                {submittedAnswer.optionLetter}
              </span>
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-800">
                  {submittedAnswer.selectedOption}
                </div>
                {submittedAnswer.customText && (
                  <div className="text-xs text-slate-800 bg-sky-50 p-2 rounded-lg border border-sky-200 mt-2 font-medium">
                    "{submittedAnswer.customText}"
                  </div>
                )}
                {submittedAnswer.extraNote && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1.5">
                    <span className="font-semibold text-slate-800">Nota extra:</span> "{submittedAnswer.extraNote}"
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setSubmittedAnswer(null)}
              className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-sky-200 bg-white transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cambiar o enviar otra respuesta</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
