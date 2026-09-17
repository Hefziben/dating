import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  CheckCircle2,
  Image as ImageIcon,
  ShieldAlert,
  Sparkles,
  Eye,
  Wrench,
  UserCheck
} from 'lucide-react';
import { DAILY_GAMES_LIST, getDailyGameByDay, calculateScheduledDay } from './data/gamesConfig';
import { TelemetryLog, UserStats } from './types';
import { supabase } from './lib/supabase';
import AdminDashboard from './components/AdminDashboard';
import UserView from './components/UserView';
import TelemetryDrawer from './components/TelemetryDrawer';
import UIExampleModal from './components/UIExampleModal';

export default function App() {
  const [scheduledDay, setScheduledDay] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [mode, setMode] = useState<'admin' | 'play'>('admin');
  const [isGuestLocked, setIsGuestLocked] = useState(false);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isUIModalOpen, setIsUIModalOpen] = useState(false);
  const [lastDispatchedBanner, setLastDispatchedBanner] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('user_stats');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to parse user stats:', err);
    }
    return {
      birthdayDaysLeft: 100,
      savingsDollars: 10
    };
  });

  useEffect(() => {
    // 1. Calculate calendar-scheduled day
    const autoDay = calculateScheduledDay();
    setScheduledDay(autoDay);

    // 2. Check for URL parameters (?day=2&mode=play&guest=true)
    const urlParams = new URLSearchParams(window.location.search);
    const dayParam = urlParams.get('day');
    const modeParam = urlParams.get('mode');
    const guestParam = urlParams.get('guest');
    const lockParam = urlParams.get('lock');
    const userOnlyParam = urlParams.get('userOnly');
    const viewParam = urlParams.get('view');

    const guestLocked =
      guestParam === 'true' ||
      guestParam === '1' ||
      lockParam === 'true' ||
      userOnlyParam === 'true' ||
      viewParam === 'guest';

    setIsGuestLocked(guestLocked);

    let activeDay = autoDay;
    if (dayParam) {
      const parsed = parseInt(dayParam, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 4) {
        activeDay = parsed;
      }
    }
    setSelectedDay(activeDay);

    // 3. Determine view mode: If locked by guest parameter, STRICTLY force user view ('play')
    if (guestLocked) {
      setMode('play');
    } else if (modeParam === 'play' || modeParam === 'user') {
      setMode('play');
    } else {
      // Default to admin so creator can view links & customize immediately
      setMode('admin');
    }

    // 4. Load initial stats and telemetry logs from Supabase & localStorage
    fetchSupabaseData();

    // 5. Subscribe to real-time changes on user_stats and telemetry_logs
    const statsChannel = supabase
      .channel('public:user_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_stats' }, (payload) => {
        if (payload.new && typeof payload.new === 'object') {
          const newData = payload.new as Record<string, any>;
          const newStats: UserStats = {
            birthdayDaysLeft: newData.birthday_days_left ?? 100,
            savingsDollars: Number(newData.savings_dollars ?? 10),
            birthdayDate: newData.birthday_date || undefined
          };
          setStats(newStats);
          localStorage.setItem('user_stats', JSON.stringify(newStats));
        }
      })
      .subscribe();

    const logsChannel = supabase
      .channel('public:telemetry_logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'telemetry_logs' }, (payload) => {
        if (payload.new && typeof payload.new === 'object') {
          const newData = payload.new as Record<string, any>;
          const inserted: TelemetryLog = {
            id: newData.id,
            gameId: newData.game_id,
            gameTitle: newData.game_title,
            action: newData.action,
            payload: newData.payload,
            timestamp: newData.timestamp,
            metadata: newData.metadata
          };
          setLogs((prev) => {
            if (prev.some((l) => l.id === inserted.id)) return prev;
            const updated = [inserted, ...prev];
            localStorage.setItem('app_metrics', JSON.stringify(updated));
            return updated;
          });
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'telemetry_logs' }, () => {
        setLogs([]);
        localStorage.removeItem('app_metrics');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(statsChannel);
      supabase.removeChannel(logsChannel);
    };
  }, []);

  const fetchSupabaseData = async () => {
    // Fetch stats
    try {
      const { data, error } = await supabase.from('user_stats').select('*').eq('id', 'default_user').single();
      if (!error && data) {
        const fetchedStats: UserStats = {
          birthdayDaysLeft: data.birthday_days_left ?? 100,
          savingsDollars: Number(data.savings_dollars ?? 10),
          birthdayDate: data.birthday_date || undefined
        };
        setStats(fetchedStats);
        localStorage.setItem('user_stats', JSON.stringify(fetchedStats));
      }
    } catch (err) {
      console.warn('Supabase fetch user_stats failed, using local state:', err);
    }

    // Fetch telemetry logs
    try {
      const { data, error } = await supabase.from('telemetry_logs').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const fetchedLogs: TelemetryLog[] = data.map((item) => ({
          id: item.id,
          gameId: item.game_id,
          gameTitle: item.game_title,
          action: item.action,
          payload: item.payload,
          timestamp: item.timestamp,
          metadata: item.metadata
        }));
        setLogs(fetchedLogs);
        localStorage.setItem('app_metrics', JSON.stringify(fetchedLogs));
      } else {
        loadLocalLogs();
      }
    } catch (err) {
      console.warn('Supabase fetch telemetry_logs failed, using local state:', err);
      loadLocalLogs();
    }
  };

  const loadLocalLogs = () => {
    try {
      const saved = localStorage.getItem('app_metrics');
      if (saved) {
        setLogs(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to parse telemetry logs:', err);
    }
  };

  const handleSwitchMode = (newMode: 'admin' | 'play', targetDay?: number, lockState?: boolean) => {
    // If URL strictly locks to guest mode, deny switching to admin
    if (isGuestLocked && newMode === 'admin') {
      return;
    }

    const shouldLock = lockState !== undefined ? lockState : isGuestLocked;
    setIsGuestLocked(shouldLock);
    setMode(shouldLock ? 'play' : newMode);

    const dayToUse = targetDay !== undefined ? targetDay : selectedDay;
    if (targetDay !== undefined) {
      setSelectedDay(targetDay);
    }

    // Update URL query parameters cleanly
    try {
      const currentUrl = new URL(window.location.href);
      if (shouldLock) {
        currentUrl.searchParams.set('guest', 'true');
        currentUrl.searchParams.set('mode', 'play');
      } else {
        currentUrl.searchParams.delete('guest');
        currentUrl.searchParams.set('mode', newMode);
      }
      currentUrl.searchParams.set('day', dayToUse.toString());
      window.history.pushState({}, '', currentUrl.toString());
    } catch {
      // Ignore in non-standard environments
    }
  };

  const handleLogCapture = async (action: string, payload: any, metadata?: any) => {
    const activeConfig = getDailyGameByDay(selectedDay);
    const newLog: TelemetryLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      gameId: activeConfig.id,
      gameTitle: activeConfig.title,
      action,
      payload,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      metadata
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    try {
      localStorage.setItem('app_metrics', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }

    setLastDispatchedBanner(`Registrado: "${action}" para ${activeConfig.title}`);

    // Persist to Supabase
    try {
      await supabase.from('telemetry_logs').insert([
        {
          id: newLog.id,
          game_id: newLog.gameId,
          game_title: newLog.gameTitle,
          action: newLog.action,
          payload: newLog.payload,
          timestamp: newLog.timestamp,
          metadata: newLog.metadata || {}
        }
      ]);
    } catch (err) {
      console.warn('Could not sync log to Supabase:', err);
    }
  };

  const handleClearLogs = async () => {
    localStorage.removeItem('app_metrics');
    setLogs([]);
    try {
      await supabase.from('telemetry_logs').delete().neq('id', '');
    } catch (err) {
      console.warn('Could not clear logs in Supabase:', err);
    }
  };

  const handleUpdateStats = async (newStats: UserStats) => {
    setStats(newStats);
    try {
      localStorage.setItem('user_stats', JSON.stringify(newStats));
    } catch (err) {
      console.error('Failed to save user stats:', err);
    }

    // Persist to Supabase
    try {
      await supabase.from('user_stats').upsert({
        id: 'default_user',
        birthday_days_left: newStats.birthdayDaysLeft,
        savings_dollars: newStats.savingsDollars,
        birthday_date: newStats.birthdayDate || null,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Could not sync stats to Supabase:', err);
    }
  };

  const activeConfig = getDailyGameByDay(selectedDay);

  return (
    <div className="min-h-screen bg-[#F0F7FA] text-slate-900 font-sans flex flex-col justify-between p-4 sm:p-6 antialiased selection:bg-sky-200 selection:text-slate-950">
      {/* Top Header & Mode Switcher Bar */}
      {!isGuestLocked ? (
        <header className="w-full max-w-xl mx-auto pb-3 mb-3 flex flex-wrap gap-2 justify-between items-center text-xs border-b border-sky-200/70 font-mono">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span className="text-[11px] font-bold text-slate-900">
              {mode === 'admin' ? 'PANEL DE CONTROL // CREADOR' : `ACTIVIDAD DEL DÍA // DÍA ${selectedDay}`}
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5">
            <div className="bg-sky-100/70 p-0.5 rounded-lg border border-sky-200 flex items-center">
              <button
                type="button"
                id="switch-btn-admin"
                onClick={() => handleSwitchMode('admin')}
                className={`cursor-pointer px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                  mode === 'admin'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3 h-3 text-amber-300" />
                <span>Modo Admin</span>
              </button>

              <button
                type="button"
                id="switch-btn-user"
                onClick={() => handleSwitchMode('play')}
                className={`cursor-pointer px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                  mode === 'play'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3 h-3 text-sky-300" />
                <span>Vista Usuario</span>
              </button>
            </div>

            {/* Admin Tools: UI Mockup & Logs */}
            {mode === 'admin' && (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  type="button"
                  onClick={() => setIsUIModalOpen(true)}
                  className="cursor-pointer text-[10px] text-slate-700 hover:text-slate-950 px-2 py-1 rounded-lg bg-white hover:bg-sky-50 border border-sky-200 shadow-xs flex items-center gap-1 transition-all"
                  title="Inspect UI Design Mockup & Aesthetics"
                >
                  <ImageIcon className="w-3 h-3 text-sky-600" />
                  <span className="hidden sm:inline">Mockup</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTelemetryOpen(true)}
                  className="cursor-pointer text-[10px] text-slate-700 hover:text-slate-950 px-2 py-1 rounded-lg bg-white hover:bg-sky-50 border border-sky-200 shadow-xs flex items-center gap-1 transition-all"
                  title="Ver registro de respuestas"
                >
                  <Activity className="w-3 h-3 text-amber-500" />
                  <span className="font-semibold">{logs.length}</span>
                </button>
              </div>
            )}
          </div>
        </header>
      ) : (
        <header className="w-full max-w-xl mx-auto pb-2.5 mb-2.5 flex justify-between items-center text-xs border-b border-sky-200/70 font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span className="text-[11px] font-bold text-slate-900 tracking-tight">
              ACTIVIDAD INTERACTIVA // EVENTO {selectedDay}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-sky-800 bg-sky-100/90 px-2 py-0.5 rounded border border-sky-200 uppercase">
            1 SOLO TOQUE
          </span>
        </header>
      )}

      {/* Global Notification Banner */}
      <div className="w-full max-w-xl mx-auto">
        <AnimatePresence>
          {lastDispatchedBanner && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-2.5 mb-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-mono flex items-center justify-between text-amber-950 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{lastDispatchedBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setLastDispatchedBanner(null)}
                className="cursor-pointer text-[10px] text-amber-800 hover:text-amber-950 underline ml-2 font-medium"
              >
                cerrar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary Main Content View */}
      <main className="w-full max-w-xl mx-auto my-auto space-y-4">
        {mode === 'admin' && !isGuestLocked ? (
          <AdminDashboard
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            logs={logs}
            onClearLogs={handleClearLogs}
            onSwitchToUserMode={(day, locked) => handleSwitchMode('play', day, locked)}
            onLogCapture={handleLogCapture}
            stats={stats}
            onUpdateStats={handleUpdateStats}
          />
        ) : (
          <UserView
            selectedDay={selectedDay}
            activeConfig={activeConfig}
            onLogCapture={handleLogCapture}
            onSwitchToAdmin={() => handleSwitchMode('admin')}
            isGuestLocked={isGuestLocked}
            stats={stats}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl mx-auto pt-6 text-center text-xs font-mono text-slate-400 space-y-1">
        <div>Una app pensada para conocernos de manera descomplicada</div>
        {!isGuestLocked && (
          <div className="text-[10px] text-slate-500">
            Modo actual: <span className="text-slate-800 font-semibold">{mode === 'admin' ? 'Administrador (Editor y Enlaces)' : 'Usuario (Solo interacción y lectura)'}</span>
          </div>
        )}
      </footer>

      {/* Modals & Drawers */}
      <TelemetryDrawer
        isOpen={isTelemetryOpen}
        logs={logs}
        onClose={() => setIsTelemetryOpen(false)}
        onClear={handleClearLogs}
      />

      <UIExampleModal
        isOpen={isUIModalOpen}
        onClose={() => setIsUIModalOpen(false)}
      />
    </div>
  );
}
