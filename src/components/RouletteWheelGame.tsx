import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Gift,
  RotateCcw,
  Plus,
  Trash2,
  Settings2,
  CheckCircle2,
  Trophy,
  Save,
  Pencil,
  Volume2,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RouletteWheelGameProps {
  onSuccess: (action: string, payload: any, metadata?: any) => void;
  isAdmin?: boolean;
}

export interface RoulettePrizeItem {
  id: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

const DEFAULT_PRIZES: RoulettePrizeItem[] = [
  {
    id: 'pizza',
    label: 'Pizza',
    emoji: '🍕',
    color: '#F43F5E', // Rose
    description: 'Una pizza artesanal caliente y crujiente en tu pizzería favorita.'
  },
  {
    id: 'soda',
    label: 'Soda',
    emoji: '🥤',
    color: '#0EA5E9', // Sky blue
    description: 'Tu refresco o bebida favorita bien fría con mucho hielo.'
  },
  {
    id: 'pasta',
    label: 'Pasta',
    emoji: '🍝',
    color: '#F59E0B', // Amber
    description: 'Un delicioso plato de pasta cremosa o fettuccine al dente.'
  },
  {
    id: 'juice',
    label: 'Jugo',
    emoji: '🧃',
    color: '#10B981', // Emerald
    description: 'Un jugo de frutas naturales recién exprimido o smoothie refrescante.'
  },
  {
    id: 'lollipop',
    label: 'Paleta',
    emoji: '🍭',
    color: '#EC4899', // Pink
    description: 'Un dulce, paleta artesanal o golosina especial para el antojo.'
  },
  {
    id: 'dessert',
    label: 'Postre',
    emoji: '🧁',
    color: '#8B5CF6', // Purple
    description: 'Un helado, cupcake o postre sorpresa para cerrar con broche de oro.'
  }
];

const PRESET_ROULETTES: { label: string; items: RoulettePrizeItem[] }[] = [
  {
    label: '🍕 Antojos Clásicos (Por defecto)',
    items: DEFAULT_PRIZES
  },
  {
    label: '☕ Cafetería & Dulces',
    items: [
      { id: 'p1', label: 'Café Latte', emoji: '☕', color: '#B45309', description: 'Un café latte o cappuccino caliente con arte latte.' },
      { id: 'p2', label: 'Boba Tea', emoji: '🧋', color: '#D97706', description: 'Té con leche y perlas de tapioca con azúcar morena.' },
      { id: 'p3', label: 'Helado', emoji: '🍦', color: '#EC4899', description: 'Dos bolas de helado artesanal cono o tarrina.' },
      { id: 'p4', label: 'Malteada', emoji: '🥤', color: '#8B5CF6', description: 'Una malteada espesa de chocolate, vainilla o fresa.' },
      { id: 'p5', label: 'Crepas', emoji: '🥞', color: '#F59E0B', description: 'Crepa dulce con fresas y crema de avellana.' },
      { id: 'p6', label: 'Paleta', emoji: '🍭', color: '#F43F5E', description: 'Paleta dulce para alegrar la tarde.' }
    ]
  },
  {
    label: '🎬 Planes de Cita',
    items: [
      { id: 'c1', label: 'Cine & Popcorn', emoji: '🍿', color: '#F43F5E', description: 'Boletos de cine con palomitas grandes y nachos.' },
      { id: 'c2', label: 'Cena de Pizza', emoji: '🍕', color: '#EA580C', description: 'Cena relajada con pizza y charla larga.' },
      { id: 'c3', label: 'Paseo & Café', emoji: '☕', color: '#059669', description: 'Caminata por la tarde con café en mano.' },
      { id: 'c4', label: 'Comida Callejera', emoji: '🌮', color: '#D97706', description: 'Tour de tacos o comida rápida deliciosa.' },
      { id: 'c5', label: 'Heladería', emoji: '🍨', color: '#8B5CF6', description: 'Visita a una heladería artesanal.' },
      { id: 'c6', label: 'Parque & Jugos', emoji: '🧃', color: '#0284C7', description: 'Tarde al aire libre con jugos naturales.' }
    ]
  }
];

const LOCAL_STORAGE_KEY = 'user_custom_roulette_prizes';

export default function RouletteWheelGame({ onSuccess, isAdmin = false }: RouletteWheelGameProps) {
  const [prizes, setPrizes] = useState<RoulettePrizeItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return DEFAULT_PRIZES;
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningPrize, setWinningPrize] = useState<RoulettePrizeItem | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const [pointerBounce, setPointerBounce] = useState(false);

  // Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editPrizes, setEditPrizes] = useState<RoulettePrizeItem[]>(prizes);
  const [editorNotice, setEditorNotice] = useState<string | null>(null);

  // Sync editor with prizes
  useEffect(() => {
    setEditPrizes(prizes);
  }, [prizes]);

  const numSlices = prizes.length;
  const sliceAngle = 360 / numSlices;

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinningPrize(null);

    // Pick a random target slice index
    const targetIndex = Math.floor(Math.random() * numSlices);
    const targetPrize = prizes[targetIndex];

    // Mathematical alignment:
    // Top pointer is at 270 degrees.
    // The center of slice K is (K * sliceAngle + sliceAngle / 2).
    // To make slice K land at 270 deg:
    // rotation = 270 - (K * sliceAngle + sliceAngle / 2) + 360 * extraSpins
    const sliceCenter = targetIndex * sliceAngle + sliceAngle / 2;
    // Add 5 to 8 full rotations (1800 to 2880 deg) + slight random offset inside the slice
    const extraFullSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const randomJitter = (Math.random() - 0.5) * (sliceAngle * 0.6); // within slice bounds

    const currentBase = rotation % 360;
    const targetAngleRelative = 270 - sliceCenter + randomJitter;
    // Normalize target angle to be strictly ahead of currentBase
    let delta = (targetAngleRelative - currentBase) % 360;
    if (delta <= 0) delta += 360;

    const finalTargetRotation = rotation + extraFullSpins + delta;

    setRotation(finalTargetRotation);

    // Start ticker animation
    const interval = setInterval(() => {
      setPointerBounce(prev => !prev);
    }, 180);

    // Spin duration 3.8s
    setTimeout(() => {
      clearInterval(interval);
      setIsSpinning(false);
      setWinningPrize(targetPrize);
      setSpinCount(prev => prev + 1);

      // Trigger Confetti
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
        colors: [targetPrize.color, '#F43F5E', '#F59E0B', '#10B981', '#FFFFFF', '#EC4899']
      });

      // Dispatch telemetry
      onSuccess(
        'ROULETTE_PRIZE_WON',
        `Ganó: ${targetPrize.emoji} ${targetPrize.label} (${targetPrize.description})`,
        {
          roulettePrize: {
            prize: targetPrize.label,
            emoji: targetPrize.emoji,
            description: targetPrize.description
          },
          spinNumber: spinCount + 1
        }
      );
    }, 3800);
  };

  // Editor functions
  const handleAddPrize = () => {
    const defaultColors = ['#F43F5E', '#0EA5E9', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#F97316'];
    const nextColor = defaultColors[editPrizes.length % defaultColors.length];
    const newPrize: RoulettePrizeItem = {
      id: `prize_${Date.now()}`,
      label: 'Nuevo Premio',
      emoji: '🎁',
      color: nextColor,
      description: 'Premio especial para disfrutar juntos.'
    };
    setEditPrizes([...editPrizes, newPrize]);
  };

  const handleRemovePrize = (id: string) => {
    if (editPrizes.length <= 3) {
      setEditorNotice('La ruleta requiere al menos 3 premios para girar.');
      setTimeout(() => setEditorNotice(null), 3000);
      return;
    }
    setEditPrizes(editPrizes.filter(p => p.id !== id));
  };

  const handleSaveEditor = () => {
    if (editPrizes.length < 3) {
      setEditorNotice('Se necesitan al menos 3 premios.');
      return;
    }
    const hasEmpty = editPrizes.some(p => !p.label.trim());
    if (hasEmpty) {
      setEditorNotice('Todos los premios deben tener un nombre.');
      return;
    }

    setPrizes(editPrizes);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(editPrizes));
    } catch {
      // Ignore
    }

    setIsEditorOpen(false);
    setWinningPrize(null);
    setEditorNotice(null);
  };

  const handleResetPrizes = () => {
    setPrizes(DEFAULT_PRIZES);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setIsEditorOpen(false);
    setWinningPrize(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Controls: Info & Customize button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>RULETA DE LA SUERTE & PREMIOS</span>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            className="cursor-pointer text-[11px] font-mono text-sky-700 hover:text-sky-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-sky-300 bg-sky-50 hover:bg-sky-100 transition-colors shadow-xs"
          >
            <Settings2 className="w-3.5 h-3.5 text-sky-600" />
            <span>{isEditorOpen ? 'Cerrar Ajustes' : 'Personalizar Premios'}</span>
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
                  Editar Premios de la Ruleta
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                ({editPrizes.length} opciones en la ruleta)
              </span>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Cargar plantilla rápida:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ROULETTES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEditPrizes(preset.items)}
                    className="cursor-pointer text-[11px] font-mono px-2.5 py-1 rounded-lg border border-sky-200 bg-sky-50/50 hover:border-sky-300 hover:bg-sky-100/60 text-slate-700 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of prizes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-600 font-semibold">
                  Premios configurados (Mínimo 3):
                </span>
                <button
                  type="button"
                  onClick={handleAddPrize}
                  className="cursor-pointer text-[10px] font-mono text-sky-600 hover:text-sky-800 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Añadir premio</span>
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {editPrizes.map((prize, idx) => (
                  <div
                    key={prize.id}
                    className="p-2.5 bg-sky-50/30 border border-sky-200 rounded-xl flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={prize.emoji}
                      onChange={e => {
                        const next = [...editPrizes];
                        next[idx].emoji = e.target.value.slice(0, 2);
                        setEditPrizes(next);
                      }}
                      className="w-9 h-9 text-center text-lg bg-white rounded-lg border border-sky-200 focus:outline-none focus:border-sky-400 shrink-0"
                      title="Emoji del premio"
                    />

                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={prize.label}
                        onChange={e => {
                          const next = [...editPrizes];
                          next[idx].label = e.target.value;
                          setEditPrizes(next);
                        }}
                        placeholder="Nombre del premio (e.g. Pizza)"
                        className="w-full text-xs font-semibold p-1.5 rounded-md border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-900"
                      />
                      <input
                        type="text"
                        value={prize.description}
                        onChange={e => {
                          const next = [...editPrizes];
                          next[idx].description = e.target.value;
                          setEditPrizes(next);
                        }}
                        placeholder="Detalle o promesa (e.g. Una pizza caliente a tu gusto)"
                        className="w-full text-[11px] p-1.5 rounded-md border border-sky-200 bg-white focus:outline-none focus:border-sky-400 text-slate-600"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePrize(prize.id)}
                      disabled={editPrizes.length <= 3}
                      className="cursor-pointer p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Eliminar premio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                onClick={handleResetPrizes}
                className="cursor-pointer text-[11px] font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer clásicos</span>
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
                  <span>Guardar Ruleta</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THE ROULETTE WHEEL STAGE */}
      <div className="p-4 sm:p-6 bg-white border border-sky-200/80 rounded-2xl shadow-xs text-center space-y-4 relative overflow-hidden">
        {/* Intro prompt */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-700 font-bold uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5 text-sky-600" />
            <span>Gira para desbloquear tu premio</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            ¿Qué se te antoja hoy? Deja que el destino decida.
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            El premio donde se detenga la flecha queda prometido e invitado por mí.
          </p>
        </div>

        {/* Wheel Container with Top Pointer */}
        <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] mx-auto select-none my-2">
          {/* Top Ticker / Arrow Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            <motion.div
              animate={pointerBounce ? { rotate: [-10, 8, 0] } : { rotate: 0 }}
              transition={{ duration: 0.15 }}
              className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[22px] border-t-slate-900 drop-shadow-md"
            />
          </div>

          {/* Pastel Outer Rim */}
          <div className="w-full h-full rounded-full p-2.5 bg-gradient-to-tr from-sky-200 via-amber-100 to-sky-100 shadow-lg border-2 border-sky-300 relative flex items-center justify-center">
            {/* Embedded SVG Wheel */}
            <svg
              viewBox="0 0 300 300"
              className="w-full h-full rounded-full transition-transform"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: isSpinning ? '3.8s' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.12, 0.85, 0.2, 1)'
              }}
            >
              <defs>
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Draw Slices */}
              {prizes.map((prize, idx) => {
                const startAngle = idx * sliceAngle;
                const endAngle = (idx + 1) * sliceAngle;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const r = 145;
                const cx = 150;
                const cy = 150;

                const x1 = cx + r * Math.cos(startRad);
                const y1 = cy + r * Math.sin(startRad);
                const x2 = cx + r * Math.cos(endRad);
                const y2 = cy + r * Math.sin(endRad);

                const largeArc = sliceAngle > 180 ? 1 : 0;
                const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                const midAngle = startAngle + sliceAngle / 2;

                return (
                  <g key={prize.id}>
                    {/* Slice Wedge */}
                    <path
                      d={pathData}
                      fill={prize.color}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />

                    {/* Slice Text & Emoji rotated along radius */}
                    <g transform={`rotate(${midAngle}, 150, 150)`}>
                      <text
                        x="230"
                        y="150"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-white font-mono font-bold text-[11px] sm:text-xs tracking-wide drop-shadow-sm select-none"
                      >
                        {prize.label} {prize.emoji}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Outer decorative rim dots */}
              {Array.from({ length: 16 }).map((_, i) => {
                const dotAngle = (i * 360) / 16;
                const rad = (dotAngle * Math.PI) / 180;
                const dx = 150 + 140 * Math.cos(rad);
                const dy = 150 + 140 * Math.sin(rad);
                return (
                  <circle
                    key={i}
                    cx={dx}
                    cy={dy}
                    r="2"
                    fill="#FFFFFF"
                    opacity="0.8"
                  />
                );
              })}
            </svg>

            {/* Center Hub & Quick Spin Trigger */}
            <button
              type="button"
              disabled={isSpinning}
              onClick={handleSpin}
              className="cursor-pointer absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 border-4 border-white shadow-xl flex flex-col items-center justify-center text-white z-10 hover:scale-105 active:scale-95 transition-transform disabled:opacity-90 disabled:cursor-not-allowed group"
            >
              <span className="text-[9px] sm:text-[10px] font-mono font-black tracking-widest text-amber-300 group-hover:text-amber-200">
                {isSpinning ? '...' : 'GIRAR'}
              </span>
              <span className="text-xs sm:text-sm">🎲</span>
            </button>
          </div>
        </div>

        {/* Spin Action Button */}
        <div>
          <motion.button
            type="button"
            whileHover={!isSpinning ? { scale: 1.02 } : {}}
            whileTap={!isSpinning ? { scale: 0.98 } : {}}
            disabled={isSpinning}
            onClick={handleSpin}
            className={`cursor-pointer w-full max-w-xs mx-auto py-3 px-6 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isSpinning
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md border border-sky-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isSpinning ? 'Girando la ruleta...' : '¡Girar Ruleta de Premios!'}</span>
          </motion.button>
          <div className="text-[10px] font-mono text-slate-400 mt-1.5">
            Toca el botón o el centro de la ruleta para probar tu suerte.
          </div>
        </div>
      </div>

      {/* WINNER ANNOUNCEMENT CELEBRATION CARD */}
      <AnimatePresence>
        {winningPrize && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-5 sm:p-6 bg-gradient-to-b from-sky-50 to-white border-2 border-sky-300 rounded-2xl text-center space-y-3.5 shadow-md relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-3xl mx-auto flex items-center justify-center shadow-xs">
              {winningPrize.emoji}
            </div>

            <div className="space-y-1">
              <span className="inline-block text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                ¡Premio Desbloqueado!
              </span>
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                ¡Felicidades! Has ganado: {winningPrize.label} {winningPrize.emoji}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                "{winningPrize.description}"
              </p>
            </div>

            <div className="p-3 bg-white border border-sky-200 rounded-xl text-left max-w-sm mx-auto text-xs space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-sky-100 pb-1">
                <span>COMPROMISO REGISTRADO</span>
                <span className="text-sky-700 font-semibold">Tirada #{spinCount}</span>
              </div>
              <p className="text-slate-700 text-xs pt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Queda agendado para cumplirte este antojo el fin de semana.</span>
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleSpin}
                className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-lg border border-sky-200 bg-white transition-colors shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Girar otra vez</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRIZES SHOWCASE GRID */}
      <div className="p-3.5 bg-sky-50/40 border border-sky-200 rounded-2xl space-y-2">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-1">
          Premios en juego en esta ruleta:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {prizes.map(p => (
            <div
              key={p.id}
              className="p-2 bg-white border border-sky-200 rounded-xl flex items-center gap-2 shadow-2xs"
            >
              <span className="text-lg">{p.emoji}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">{p.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{p.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
