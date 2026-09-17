import { motion } from 'motion/react';
import { Sparkles, Heart, ShieldCheck, Lock } from 'lucide-react';
import { DailyGameConfig } from '../types';
import ThumbSaverGame from './ThumbSaverGame';
import QuestionPollGame from './QuestionPollGame';
import RouletteWheelGame from './RouletteWheelGame';
import GuessJokesGame from './GuessJokesGame';

interface UserViewProps {
  selectedDay: number;
  activeConfig: DailyGameConfig;
  onLogCapture: (action: string, payload: any, metadata?: any) => void;
  onSwitchToAdmin: () => void;
  isGuestLocked?: boolean;
}

export default function UserView({
  selectedDay,
  activeConfig,
  onLogCapture,
  onSwitchToAdmin,
  isGuestLocked = false
}: UserViewProps) {
  return (
    <div className="w-full max-w-xl mx-auto space-y-4 my-auto">
      {/* Top Header for Guest / User View */}
      <div className="border border-sky-200/80 bg-white/90 p-5 sm:p-6 rounded-2xl shadow-sm relative overflow-hidden backdrop-blur">
        {/* Guest View Header Badge & Title */}
        <div className="space-y-1.5 mb-5 border-b border-sky-100 pb-4 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-700 font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span>INVITACIÓN ESPECIAL // DÍA {selectedDay}</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-100/80 border border-amber-300/80 text-amber-900 font-semibold">
              {activeConfig.badge}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight pt-1">
            {activeConfig.title}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {activeConfig.subtitle}
          </p>
        </div>

        {/* Active Interactive Game in Read-Only / User Interaction Mode (isAdmin=false) */}
        <div className="mt-2">
          {activeConfig.id === 'thumb_saver' && (
            <ThumbSaverGame onSuccess={onLogCapture} isAdmin={false} />
          )}
          {activeConfig.id === 'custom_wordle' && (
            <QuestionPollGame onSuccess={onLogCapture} isAdmin={false} />
          )}
          {activeConfig.id === 'terminal_adventure' && (
            <RouletteWheelGame onSuccess={onLogCapture} isAdmin={false} />
          )}
          {activeConfig.id === 'recommendation_engine' && (
            <GuessJokesGame onSuccess={onLogCapture} isAdmin={false} />
          )}
        </div>
      </div>

      {/* Guest View Footer with discreet creator link ONLY when not guest-locked */}
      <div className="flex items-center justify-between px-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Diseñado para una respuesta sin esfuerzo</span>
        </div>

        {!isGuestLocked && (
          <button
            type="button"
            onClick={onSwitchToAdmin}
            className="cursor-pointer text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1 hover:underline text-[10px]"
            title="Cambiar al panel del creador para editar o ver enlaces"
          >
            <Lock className="w-2.5 h-2.5" />
            <span>Modo Creador / Admin</span>
          </button>
        )}
      </div>
    </div>
  );
}
