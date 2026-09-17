import { motion } from 'motion/react';
import { Cake, DollarSign, Sparkles } from 'lucide-react';
import { UserStats } from '../types';

interface HeaderStatsBannerProps {
  stats: UserStats;
  className?: string;
  isCompact?: boolean;
}

export default function HeaderStatsBanner({ stats, className = '', isCompact = false }: HeaderStatsBannerProps) {
  const daysLeft = stats?.birthdayDaysLeft ?? 100;
  const savings = stats?.savingsDollars ?? 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full bg-white/95 border border-sky-200/90 rounded-2xl shadow-xs px-3.5 py-2.5 backdrop-blur flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono ${className}`}
    >
      {/* Birthday Countdown Item */}
      <div className="flex items-center gap-2 text-slate-800 w-full sm:w-auto justify-start">
        <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-900 shadow-2xs">
          <Cake className="w-3.5 h-3.5 text-amber-700" />
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500">Faltan</span>
          <span className="font-bold text-slate-900 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-950">
            {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
          </span>
          <span className="text-[11px] text-slate-700">para tu cumpleaños 🎂</span>
        </div>
      </div>

      {/* Subtle Divider for mobile/desktop */}
      <div className="hidden sm:block w-px h-4 bg-sky-200/80" />

      {/* Savings Account Item */}
      <div className="flex items-center gap-2 text-slate-800 w-full sm:w-auto justify-start sm:justify-end">
        <div className="w-6 h-6 rounded-lg bg-sky-100 border border-sky-300 flex items-center justify-center shrink-0 text-sky-800 shadow-2xs">
          <DollarSign className="w-3.5 h-3.5 text-sky-700" />
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500">Tienes</span>
          <span className="font-bold text-slate-900 px-1.5 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-950">
            ${savings.toLocaleString('es-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} dólares
          </span>
          <span className="text-[11px] text-slate-700">en tu cuenta de ahorros 💰</span>
        </div>
      </div>
    </motion.div>
  );
}
