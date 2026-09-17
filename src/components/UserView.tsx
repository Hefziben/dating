import { motion } from 'motion/react';
import { Sparkles, Heart, ShieldCheck, Lock, Building2, CreditCard, History, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { DailyGameConfig, UserProfile } from '../types';
import HeaderStatsBanner from './HeaderStatsBanner';
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
  profile: UserProfile;
}

export default function UserView({
  selectedDay,
  activeConfig,
  onLogCapture,
  onSwitchToAdmin,
  isGuestLocked = false,
  profile
}: UserViewProps) {
  return (
    <div className="w-full max-w-xl mx-auto space-y-4 my-auto">
      {/* Header Stats Banner showing birthday & savings */}
      <HeaderStatsBanner stats={profile} />

      {/* Top Header for Guest / User View */}
      <div className="border border-sky-200/80 bg-white/90 p-5 sm:p-6 rounded-2xl shadow-sm relative overflow-hidden backdrop-blur space-y-4">
        {/* Guest View Header Badge & Title */}
        <div className="space-y-1.5 border-b border-sky-100 pb-4 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-700 font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span>INVITACIÓN ESPECIAL PARA {profile.username.toUpperCase()} // Evento {selectedDay}</span>
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

        {/* Bank Account Info & Recent Transaction History */}
        {profile.bankName && (
          <div className="pt-4 border-t border-sky-100 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-700 font-bold">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Detalle de Cuenta: {profile.bankName}</span>
              </div>
              <span className="text-[11px] text-slate-500">{profile.accountNumber}</span>
            </div>

            {profile.bankNotes && (
              <p className="text-[11px] text-slate-500 bg-sky-50/50 p-2 rounded-lg border border-sky-100">
                📌 {profile.bankNotes}
              </p>
            )}

            {profile.transactions && profile.transactions.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <History className="w-3 h-3 text-sky-500" />
                  <span>Historial Reciente de Movimientos Bancarios</span>
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {profile.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2 bg-sky-50/30 border border-sky-100 rounded-lg flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        {tx.type === 'deposit' ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : tx.type === 'withdrawal' ? (
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        )}
                        <div>
                          <span className="font-semibold text-slate-800">{tx.description}</span>
                          <span className="text-[9px] text-slate-400 ml-1.5">{tx.date}</span>
                        </div>
                      </div>
                      <span
                        className={`font-bold ${
                          tx.type === 'deposit'
                            ? 'text-emerald-600'
                            : tx.type === 'withdrawal'
                            ? 'text-rose-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {tx.type === 'deposit' && `+$${tx.amount}`}
                        {tx.type === 'withdrawal' && `-$${tx.amount}`}
                        {tx.type === 'note' && `Nota`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guest View Footer with discreet creator link ONLY when not guest-locked */}
      <div className="flex items-center justify-between px-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Diseñado exclusivamente para {profile.username}</span>
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
