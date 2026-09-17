import { useState, useRef, useEffect, type SyntheticEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  HeartHandshake,
  MousePointerClick,
  ShieldX,
  Coffee,
  PartyPopper,
  CalendarClock,
  Camera,
  Heart,
  CheckCircle2,
  AlertCircle,
  Settings2,
  Save,
  RotateCcw,
  Pencil
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ThumbSaverGameProps {
  onSuccess: (action: string, payload: any, metadata?: any) => void;
  isAdmin?: boolean;
}

export interface RSVPConfig {
  protocolBadge: string;
  question: string;
  subtext: string;
  yesOptionText: string;
  noOptionText: string;
  confirmTomorrowText: string;
  photoInsteadText: string;
  haveBoyfriendText: string;
  celebrationTitle: string;
  celebrationMessage: string;
}

const DEFAULT_RSVP_CONFIG: RSVPConfig = {
  protocolBadge: 'Protocolo - Cero escritura',
  question: '¿Nos tomamos un café o un trago este viernes después del trabajo?',
  subtext: 'Respuesta en 1 toque. Diseñado para ahorrarte escribir en el teclado.',
  yesOptionText: 'Opción A: ¡Sí, acepto con gusto!',
  noOptionText: 'Opción B: Declinar',
  confirmTomorrowText: '1. Te confirmo mañana.',
  photoInsteadText: '2. Te mando una foto mía en su lugar.',
  haveBoyfriendText: '3. Lo siento, tengo novio.',
  celebrationTitle: '¡Cita confirmada! Plan cerrado ☕✨',
  celebrationMessage: 'Queda agendado para este viernes. Los detalles y hora los coordinamos en breve.'
};

const LOCAL_STORAGE_KEY = 'user_custom_rsvp_config';

type ResolutionType = 'YES' | 'CONFIRM_TOMORROW' | 'PHOTO_INSTEAD' | 'HAVE_BOYFRIEND' | null;

const DODGE_MESSAGES = [
  '¡Buenos reflejos! Intenta con otro botón',
  'ERR_404: "No" esta función ya caducó bonita',
  'Evasion subroutine active.',
  'Quantum tunneling evasion initiated.',
  'Option B requires 999 APM agility.',
  'Thumbs deserve better options.'
];

export default function ThumbSaverGame({ onSuccess, isAdmin = false }: ThumbSaverGameProps) {
  const [config, setConfig] = useState<RSVPConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_RSVP_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore
    }
    return DEFAULT_RSVP_CONFIG;
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editConfig, setEditConfig] = useState<RSVPConfig>(config);

  useEffect(() => {
    setEditConfig(config);
  }, [config]);

  const [btnCoords, setBtnCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dodgeCount, setDodgeCount] = useState(0);
  const [resolution, setResolution] = useState<ResolutionType>(null);
  const [activeDodgeNote, setActiveDodgeNote] = useState<string | null>(null);
  const [uploadedPhotoPreview, setUploadedPhotoPreview] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSaveEditor = () => {
    setConfig(editConfig);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(editConfig));
    } catch {
      // Ignore
    }
    setIsEditorOpen(false);
  };

  const handleResetEditor = () => {
    setConfig(DEFAULT_RSVP_CONFIG);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setIsEditorOpen(false);
  };

  const dodgeButton = (e?: SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }

    const container = containerRef.current;
    const maxX = container ? Math.min(130, container.clientWidth / 2 - 40) : 110;
    const maxY = 70;

    // Generate random offset that moves away
    const randomAngle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 50;
    const newX = Math.max(-maxX, Math.min(maxX, Math.cos(randomAngle) * distance));
    const newY = Math.max(-maxY, Math.min(maxY, Math.sin(randomAngle) * distance));

    setBtnCoords({ x: Math.round(newX), y: Math.round(newY) });
    setDodgeCount(prev => prev + 1);

    const note = DODGE_MESSAGES[dodgeCount % DODGE_MESSAGES.length];
    setActiveDodgeNote(note);
  };

  const handleAccept = () => {
    setResolution('YES');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#F43F5E', '#EC4899', '#FDA4AF', '#F472B6', '#FFFFFF']
    });

    const choiceText = config.yesOptionText;
    const summaryMsg = `Pregunta: "${config.question}" | Respuesta escogida: "${choiceText}"`;

    onSuccess('RSVP_ACCEPTED', summaryMsg, {
      dodgeAttempts: dodgeCount,
      question: config.question,
      choice: choiceText,
      acceptedAt: new Date().toISOString()
    });
  };

  const handleAlternativeOption = (type: 'CONFIRM_TOMORROW' | 'PHOTO_INSTEAD' | 'HAVE_BOYFRIEND') => {
    setResolution(type);

    let choiceText = '';
    let actionType = '';

    if (type === 'CONFIRM_TOMORROW') {
      choiceText = config.confirmTomorrowText;
      actionType = 'RSVP_CONFIRM_TOMORROW';
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#F43F5E', '#FBBF24', '#FFFFFF']
      });
    } else if (type === 'PHOTO_INSTEAD') {
      choiceText = config.photoInsteadText;
      actionType = 'RSVP_PHOTO_INSTEAD';
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#EC4899', '#F43F5E', '#A855F7']
      });
    } else if (type === 'HAVE_BOYFRIEND') {
      choiceText = config.haveBoyfriendText;
      actionType = 'RSVP_HAVE_BOYFRIEND';
    }

    const summaryMsg = `Pregunta: "${config.question}" | Respuesta escogida: "${choiceText}"`;

    onSuccess(actionType, summaryMsg, {
      dodgeAttempts: dodgeCount,
      question: config.question,
      choice: choiceText,
      timestamp: new Date().toISOString()
    });
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setUploadedPhotoPreview(result);
        onSuccess('RSVP_PHOTO_UPLOADED', 'Photo transmitted successfully', {
          fileName: file.name,
          fileSize: file.size,
          timestamp: new Date().toISOString()
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const isResolved = resolution !== null;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Header Controls: Info & Customize button (Admin only) */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
          <Coffee className="w-3.5 h-3.5 text-sky-500" />
          <span>{config.protocolBadge}</span>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            className="cursor-pointer text-[11px] font-mono text-sky-700 hover:text-sky-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-sky-300 bg-sky-50 hover:bg-sky-100 transition-colors shadow-xs"
          >
            <Settings2 className="w-3.5 h-3.5 text-sky-600" />
            <span>{isEditorOpen ? 'Cerrar Ajustes' : 'Personalizar Invitación'}</span>
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
            className="p-4 bg-white border border-sky-200 rounded-2xl space-y-3.5 shadow-sm text-left"
          >
            <div className="flex items-center justify-between border-b border-sky-100 pb-2">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase">
                  Personalizar Invitación RSVP (Evento 1)
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-0.5">
                  Pregunta / Propuesta de invitación:
                </label>
                <input
                  type="text"
                  value={editConfig.question}
                  onChange={e => setEditConfig({ ...editConfig, question: e.target.value })}
                  className="w-full text-xs font-semibold p-2 rounded-lg border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-0.5">
                  Subtexto explicativo:
                </label>
                <input
                  type="text"
                  value={editConfig.subtext}
                  onChange={e => setEditConfig({ ...editConfig, subtext: e.target.value })}
                  className="w-full text-xs p-1.5 rounded-lg border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-0.5">
                    Texto Botón "Sí":
                  </label>
                  <input
                    type="text"
                    value={editConfig.yesOptionText}
                    onChange={e => setEditConfig({ ...editConfig, yesOptionText: e.target.value })}
                    className="w-full text-xs p-1.5 rounded-lg border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-0.5">
                    Texto Botón Evasivo ("No"):
                  </label>
                  <input
                    type="text"
                    value={editConfig.noOptionText}
                    onChange={e => setEditConfig({ ...editConfig, noOptionText: e.target.value })}
                    className="w-full text-xs p-1.5 rounded-lg border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-sky-100 pt-2">
                <label className="block text-[10px] font-mono text-slate-500 font-semibold">
                  Opciones alternativas adicionales (al esquivar 3 veces):
                </label>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-0.5">
                    Opción alternativa 1:
                  </label>
                  <input
                    type="text"
                    value={editConfig.confirmTomorrowText}
                    onChange={e => setEditConfig({ ...editConfig, confirmTomorrowText: e.target.value })}
                    className="w-full text-xs p-1.5 rounded-lg border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-0.5">
                    Opción alternativa 2:
                  </label>
                  <input
                    type="text"
                    value={editConfig.photoInsteadText}
                    onChange={e => setEditConfig({ ...editConfig, photoInsteadText: e.target.value })}
                    className="w-full text-xs p-1.5 rounded-lg border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-0.5">
                    Opción alternativa 3:
                  </label>
                  <input
                    type="text"
                    value={editConfig.haveBoyfriendText}
                    onChange={e => setEditConfig({ ...editConfig, haveBoyfriendText: e.target.value })}
                    className="w-full text-xs p-1.5 rounded-lg border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-0.5">
                  Título de confirmación / Éxito:
                </label>
                <input
                  type="text"
                  value={editConfig.celebrationTitle}
                  onChange={e => setEditConfig({ ...editConfig, celebrationTitle: e.target.value })}
                  className="w-full text-xs p-1.5 rounded-lg border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-0.5">
                  Mensaje de confirmación:
                </label>
                <input
                  type="text"
                  value={editConfig.celebrationMessage}
                  onChange={e => setEditConfig({ ...editConfig, celebrationMessage: e.target.value })}
                  className="w-full text-xs p-1.5 rounded-lg border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleResetEditor}
                className="cursor-pointer text-[11px] font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer</span>
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
                  className="cursor-pointer px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Card */}
      <div className="bg-white border border-sky-200/80 rounded-xl p-5 text-center relative overflow-hidden shadow-xs">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight leading-snug mb-2">
          "{config.question}"
        </h3>

        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {config.subtext}
        </p>

        {dodgeCount > 0 && (
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-600">
            <MousePointerClick className="w-3 h-3 text-sky-500" />
            <span>Evaded clicks: <strong className="text-sky-700">{dodgeCount}</strong></span>
            {dodgeCount >= 3 && !isResolved && (
              <span className="text-amber-900 font-bold ml-1 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                (3+ evasions: 3 fallback options unlocked below)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Button Arena */}
      <AnimatePresence mode="wait">
        {!isResolved ? (
          <div className="relative min-h-[140px] flex flex-col items-center justify-center p-5 bg-sky-50/40 border border-sky-200/70 rounded-xl">
            {/* Dodge note banner */}
            {activeDodgeNote && dodgeCount < 3 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 text-[11px] font-mono text-amber-950 font-medium flex items-center gap-1 bg-amber-100/90 px-2.5 py-1 rounded border border-amber-300"
              >
                <ShieldX className="w-3 h-3 text-amber-600" />
                <span>{activeDodgeNote}</span>
              </motion.div>
            )}

            <div className="w-full max-w-md flex flex-col items-center">
              {/* PRIMARY YES BUTTON (OPTION A) & OPTIONAL FLEEING OPTION B */}
              <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
                <motion.button
                  id="btn-rsvp-yes"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAccept}
                  className="cursor-pointer flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm border border-sky-300 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>{config.yesOptionText}</span>
                </motion.button>

                {/* FLEEING NO BUTTON (OPTION B) - HIDDEN ONCE 3 EVASIONS ARE REACHED */}
                {dodgeCount < 3 && (
                  <motion.button
                    id="btn-rsvp-no"
                    animate={{
                      x: btnCoords.x,
                      y: btnCoords.y
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                    onMouseEnter={dodgeButton}
                    onTouchStart={dodgeButton}
                    onClick={dodgeButton}
                    className="cursor-pointer text-xs font-mono text-slate-600 hover:text-slate-900 border border-sky-200 bg-white px-4 py-2.5 rounded-xl select-none transition-colors shadow-2xs"
                  >
                    {config.noOptionText}
                  </motion.button>
                )}
              </div>

              {dodgeCount < 3 && (
                <span className="text-[10px] text-slate-400 font-mono mt-3 text-center">
                  * Evade Option B {3 - dodgeCount} more time{3 - dodgeCount > 1 ? 's' : ''} to unlock alternate choices.
                </span>
              )}

              {/* PLACED RIGHT BELOW OPTION A: 3 ALTERNATIVE OPTIONS (AFTER 3 EVASIONS) */}
              {dodgeCount >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full mt-4 pt-4 border-t border-sky-200 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono px-0.5">
                    <span className="flex items-center gap-1.5 text-amber-900 font-bold">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>3 EVASIONS REACHED — CHOOSE AN OPTION:</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">Option B retired</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {/* OPTION 1: Confirm tomorrow */}
                    <button
                      type="button"
                      id="btn-opt-confirm-tomorrow"
                      onClick={() => handleAlternativeOption('CONFIRM_TOMORROW')}
                      className="cursor-pointer text-left p-3 rounded-xl border border-sky-200 bg-white hover:border-sky-400 hover:bg-sky-50/50 transition-all flex items-center justify-between group shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0">
                          <CalendarClock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-sky-900">
                            {config.confirmTomorrowText}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Respuesta alternativa sin presión.
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-sky-700 font-medium">
                        [Seleccionar]
                      </span>
                    </button>

                    {/* OPTION 2: Photo instead */}
                    <button
                      type="button"
                      id="btn-opt-photo-instead"
                      onClick={() => handleAlternativeOption('PHOTO_INSTEAD')}
                      className="cursor-pointer text-left p-3 rounded-xl border border-sky-200 bg-white hover:border-sky-400 hover:bg-sky-50/50 transition-all flex items-center justify-between group shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-sky-100 border border-sky-300 text-sky-800 flex items-center justify-center shrink-0">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-sky-900">
                            {config.photoInsteadText}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Opción ligera para compartir foto.
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-sky-700 font-medium">
                        [Seleccionar]
                      </span>
                    </button>

                    {/* OPTION 3: Have a boyfriend */}
                    <button
                      type="button"
                      id="btn-opt-have-boyfriend"
                      onClick={() => handleAlternativeOption('HAVE_BOYFRIEND')}
                      className="cursor-pointer text-left p-3 rounded-xl border border-sky-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-between group shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center shrink-0">
                          <Heart className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-slate-900">
                            {config.haveBoyfriendText}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Límite claro y comunicación directa.
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-700 font-medium">
                        [Seleccionar]
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-sky-50/70 border border-sky-200 rounded-2xl text-center space-y-4 shadow-xs"
          >
            {/* RESOLUTION 1: YES */}
            {resolution === 'YES' && (
              <>
                <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 text-amber-600 mx-auto flex items-center justify-center">
                  <PartyPopper className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-slate-900">{config.celebrationTitle}</h4>
                  <p className="text-xs text-slate-600">
                    {config.celebrationMessage}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-sky-200 rounded-lg text-[11px] font-mono text-slate-700">
                  <HeartHandshake className="w-3.5 h-3.5 text-sky-600" />
                  <span>Intentos de esquivar antes de acuerdo: {dodgeCount}</span>
                </div>
              </>
            )}

            {/* RESOLUTION 2: CONFIRM TOMORROW */}
            {resolution === 'CONFIRM_TOMORROW' && (
              <>
                <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 text-amber-700 mx-auto flex items-center justify-center">
                  <CalendarClock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-slate-900">Tomorrow Confirmation Protocol Set!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Totally fair! Sleep on it, check how your week looks, and no pressure at all. I'll follow up tomorrow.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-sky-200 rounded-lg text-[11px] font-mono text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Respuesta registrada: "{config.confirmTomorrowText}" ({dodgeCount} evasiones)</span>
                </div>
              </>
            )}

            {/* RESOLUTION 3: PHOTO INSTEAD */}
            {resolution === 'PHOTO_INSTEAD' && (
              <>
                <div className="w-12 h-12 rounded-full bg-sky-100 border border-sky-300 text-sky-700 mx-auto flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-slate-900">Photo Transmission Accepted!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Deal! A photo is a zero-effort, high-efficiency compromise. You can transmit it right here or text it over.
                  </p>
                </div>

                {/* Optional interactive photo drop/preview */}
                <div className="max-w-xs mx-auto p-3 bg-white border border-sky-200 rounded-xl space-y-2">
                  {uploadedPhotoPreview ? (
                    <div className="space-y-2">
                      <img
                        src={uploadedPhotoPreview}
                        alt="Shared preview"
                        className="w-full h-44 object-cover rounded-lg border border-sky-200"
                      />
                      <div className="text-[11px] font-mono text-sky-700 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Photo payload captured!</span>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block border-2 border-dashed border-sky-200 hover:border-sky-400 p-4 rounded-lg bg-sky-50/40 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Camera className="w-6 h-6 mx-auto text-sky-500 mb-1" />
                      <span className="text-[11px] font-mono text-slate-700 block font-medium">
                        Click to transmit selfie / photo
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        (or send directly via text / iMessage)
                      </span>
                    </label>
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-sky-200 rounded-lg text-[11px] font-mono text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Respuesta registrada: "{config.photoInsteadText}"</span>
                </div>
              </>
            )}

            {/* RESOLUTION 4: HAVE A BOYFRIEND */}
            {resolution === 'HAVE_BOYFRIEND' && (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 text-slate-700 mx-auto flex items-center justify-center">
                  <Heart className="w-6 h-6 text-slate-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-slate-900">Boundary Fully Respected!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Thank you so much for being direct and honest—genuinely appreciate you letting me know! Wishing you both the very best.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-sky-200 rounded-lg text-[11px] font-mono text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Respuesta registrada: "{config.haveBoyfriendText}"</span>
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setResolution(null);
                  setUploadedPhotoPreview(null);
                  setDodgeCount(0);
                  setBtnCoords({ x: 0, y: 0 });
                  setActiveDodgeNote(null);
                }}
                className="cursor-pointer text-[11px] font-mono text-slate-400 hover:text-slate-700 underline transition-colors"
              >
                [Reset to test other responses]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

