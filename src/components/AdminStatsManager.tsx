import { useState } from 'react';
import { motion } from 'motion/react';
import { Cake, DollarSign, Save, Check, Calendar, RotateCcw } from 'lucide-react';
import { UserStats } from '../types';

interface AdminStatsManagerProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

export default function AdminStatsManager({ stats, onUpdateStats }: AdminStatsManagerProps) {
  const [daysLeft, setDaysLeft] = useState<number>(stats.birthdayDaysLeft);
  const [savings, setSavings] = useState<number>(stats.savingsDollars);
  const [birthdayDate, setBirthdayDate] = useState<string>(stats.birthdayDate || '');
  const [isSaved, setIsSaved] = useState(false);

  // Calculate days remaining given a birthday date
  const calculateDaysFromDate = (dateString: string) => {
    if (!dateString) return;
    const parts = dateString.split('-');
    if (parts.length !== 3) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    let nextBirthday = new Date(today.getFullYear(), month, day);
    nextBirthday.setHours(0, 0, 0, 0);

    // If already passed this calendar year, move to next year
    if (nextBirthday.getTime() < today.getTime()) {
      nextBirthday = new Date(today.getFullYear() + 1, month, day);
      nextBirthday.setHours(0, 0, 0, 0);
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysLeft(diffDays);
    setBirthdayDate(dateString);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const safeDays = isNaN(daysLeft) || daysLeft < 0 ? 0 : Math.round(daysLeft);
    const safeSavings = isNaN(savings) || savings < 0 ? 0 : savings;

    onUpdateStats({
      birthdayDaysLeft: safeDays,
      savingsDollars: safeSavings,
      birthdayDate: birthdayDate || undefined
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetExample = () => {
    setDaysLeft(100);
    setSavings(10);
    setBirthdayDate('');
    onUpdateStats({
      birthdayDaysLeft: 100,
      savingsDollars: 10
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-white border border-sky-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-sky-100 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-900 uppercase">
              Contador de Cumpleaños & Saldo de Ahorros
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
              Visible en todos los enlaces
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Establece los valores aquí. La usuaria los verá destacados en el encabezado de todas las actividades.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetExample}
          className="cursor-pointer text-[10px] font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-sky-200 hover:bg-sky-50 transition-colors"
          title="Restablecer al ejemplo pedido: 100 días y $10"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Ejemplo original (100d / $10)</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Birthday Countdown Settings */}
          <div className="p-3.5 bg-sky-50/40 border border-sky-200/80 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-mono text-xs font-bold">
              <div className="w-6 h-6 rounded-md bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                <Cake className="w-3.5 h-3.5" />
              </div>
              <span>Días para su Cumpleaños</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-slate-500 uppercase">
                Días faltantes (Número exacto):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="366"
                  value={daysLeft}
                  onChange={e => setDaysLeft(parseInt(e.target.value, 10))}
                  className="w-full text-sm font-bold p-2 pr-12 rounded-lg border border-sky-200 bg-white text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                  placeholder="Ej: 100"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  días
                </span>
              </div>
            </div>

            {/* Optional Date Picker helper */}
            <div className="pt-1">
              <label className="block text-[10px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-sky-500" />
                <span>O selecciona su fecha para auto-calcular:</span>
              </label>
              <input
                type="date"
                value={birthdayDate}
                onChange={e => calculateDaysFromDate(e.target.value)}
                className="w-full text-xs font-mono p-1.5 rounded-md border border-sky-200 bg-white text-slate-700 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Savings Account Settings */}
          <div className="p-3.5 bg-sky-50/40 border border-sky-200/80 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-mono text-xs font-bold">
              <div className="w-6 h-6 rounded-md bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <span>Dinero en Cuenta de Ahorros</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-slate-500 uppercase">
                Monto en dólares ($ USD):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold font-mono text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={savings}
                  onChange={e => setSavings(parseFloat(e.target.value))}
                  className="w-full text-sm font-bold p-2 pl-7 pr-16 rounded-lg border border-sky-200 bg-white text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                  placeholder="Ej: 10"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  dólares
                </span>
              </div>
            </div>

            <div className="pt-2 text-[11px] font-mono text-slate-500 bg-white/80 p-2 rounded-lg border border-sky-100 leading-snug">
              💡 <strong>Texto que verá ella:</strong> "faltan {daysLeft || 0} días para tu cumpleaños. tienes ${savings || 0} dólares en tu cuenta de ahorros"
            </div>
          </div>
        </div>

        {/* Live Preview & Save Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-sky-100">
          <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
              Vista previa:
            </span>
            <span className="text-slate-800 text-[11px]">
              Faltan <strong>{daysLeft} días</strong> para tu cumpleaños • Tienes <strong>${savings} dólares</strong> ahorrados
            </span>
          </div>

          <button
            type="submit"
            className={`cursor-pointer w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white border border-sky-300'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Valores Guardados!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>Guardar y Actualizar Header</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
