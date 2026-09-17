import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Pencil,
  Activity,
  Layers,
  Calendar,
  Share2,
  Eye,
  AlertCircle,
  HelpCircle,
  Dices,
  Smile,
  Coffee,
  Trash2,
  Cake,
  DollarSign,
  User,
  Users,
  Filter
} from 'lucide-react';
import { DAILY_GAMES_LIST } from '../data/gamesConfig';
import { TelemetryLog, DailyGameConfig, UserProfile } from '../types';
import ThumbSaverGame from './ThumbSaverGame';
import QuestionPollGame from './QuestionPollGame';
import RouletteWheelGame from './RouletteWheelGame';
import GuessJokesGame from './GuessJokesGame';
import AdminStatsManager from './AdminStatsManager';

interface AdminDashboardProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
  logs: TelemetryLog[];
  onClearLogs: () => void;
  onSwitchToUserMode: (dayNumber?: number, locked?: boolean, user?: string) => void;
  onLogCapture: (action: string, payload: any, metadata?: any) => void;
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onSaveProfile: (profile: UserProfile) => void;
  onCreateProfile: (profile: Omit<UserProfile, 'id'>) => void;
  onDeleteProfile: (id: string) => void;
}

export default function AdminDashboard({
  selectedDay,
  onSelectDay,
  logs,
  onClearLogs,
  onSwitchToUserMode,
  onLogCapture,
  profiles,
  activeProfileId,
  onSelectProfile,
  onSaveProfile,
  onCreateProfile,
  onDeleteProfile
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'links' | 'stats' | 'edit' | 'responses'>('links');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedMessageKey, setCopiedMessageKey] = useState<string | null>(null);
  const [logUserFilter, setLogUserFilter] = useState<string>('all');

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Generate unique URL for each profile & day combination
  const getDayUserLink = (dayNumber: number, username: string = activeProfile?.username || 'Carolina'): string => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?user=${encodeURIComponent(username)}&day=${dayNumber}&mode=play&guest=true`;
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyLink = async (dayNumber: number, username: string) => {
    const link = getDayUserLink(dayNumber, username);
    const key = `${username}_${dayNumber}`;
    const success = await copyToClipboard(link);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const getWhatsAppMessage = (game: DailyGameConfig, username: string): string => {
    const link = getDayUserLink(game.dayNumber, username);
    switch (game.dayNumber) {
      case 1:
        return `¡Hola ${username}! Sé que odias escribir párrafos en el celular, así que te programé un botón interactivo para responder en 1 solo toque:\n${link}`;
      case 2:
        return `¡Hola ${username}! Tengo una pregunta rápida para ti hoy: Si pudieras tener un superpoder por un día, ¿cuál escogerías? Escoge tu opción aquí:\n${link}`;
      case 3:
        return `¡Hola ${username}! Te armé una ruleta de premios hoy: gírala y el antojo que te toque te lo invito este fin de semana:\n${link}`;
      case 4:
        return `¡Hola ${username}! Tengo un chiste corto y adivinanza para sacarte una sonrisa hoy. Lee la pregunta y toca para ver la respuesta:\n${link}`;
      default:
        return `Hola ${username}! Mira la actividad especial de hoy: ${link}`;
    }
  };

  const handleCopyWhatsAppMessage = async (game: DailyGameConfig, username: string) => {
    const message = getWhatsAppMessage(game, username);
    const key = `${username}_${game.dayNumber}`;
    const success = await copyToClipboard(message);
    if (success) {
      setCopiedMessageKey(key);
      setTimeout(() => setCopiedMessageKey(null), 2500);
    }
  };

  const activeConfig = DAILY_GAMES_LIST.find((g) => g.dayNumber === selectedDay) || DAILY_GAMES_LIST[0];

  const getDayIcon = (dayNumber: number) => {
    switch (dayNumber) {
      case 1:
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 2:
        return <HelpCircle className="w-4 h-4 text-sky-600" />;
      case 3:
        return <Dices className="w-4 h-4 text-amber-600" />;
      case 4:
        return <Smile className="w-4 h-4 text-sky-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (logUserFilter === 'all') return true;
    return (log.username || 'Carolina').toLowerCase() === logUserFilter.toLowerCase();
  });

  return (
    <div className="space-y-4">
      {/* Top Admin Navigation Tabs */}
      <div className="bg-white border border-sky-200/90 rounded-2xl p-1.5 shadow-xs flex flex-wrap items-center justify-between gap-1 text-xs font-mono">
        <div className="flex items-center gap-1 flex-1 flex-wrap">
          <button
            type="button"
            id="admin-tab-links"
            onClick={() => setActiveTab('links')}
            className={`cursor-pointer flex-1 min-w-[120px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-semibold transition-all ${
              activeTab === 'links'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-sky-50 hover:text-slate-950'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-sky-300" />
            <span>1. Enlaces por Perfil</span>
          </button>

          <button
            type="button"
            id="admin-tab-stats"
            onClick={() => setActiveTab('stats')}
            className={`cursor-pointer flex-1 min-w-[140px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-semibold transition-all ${
              activeTab === 'stats'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-sky-50 hover:text-slate-950'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span>2. Perfiles & Cuentas</span>
          </button>

          <button
            type="button"
            id="admin-tab-edit"
            onClick={() => setActiveTab('edit')}
            className={`cursor-pointer flex-1 min-w-[130px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-semibold transition-all ${
              activeTab === 'edit'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-sky-50 hover:text-slate-950'
            }`}
          >
            <Pencil className="w-3.5 h-3.5 text-amber-300" />
            <span>3. Modificar Juegos</span>
          </button>

          <button
            type="button"
            id="admin-tab-responses"
            onClick={() => setActiveTab('responses')}
            className={`cursor-pointer flex-1 min-w-[120px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-semibold transition-all ${
              activeTab === 'responses'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-sky-50 hover:text-slate-950'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>4. Respuestas ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ENLACES POR PERFIL & DÍA */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          {/* Active Profile Selector Bar for Links */}
          <div className="bg-white border border-sky-200/90 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-900 uppercase">
                Perfil Seleccionado para generar enlaces:
              </span>
            </div>

            <div className="flex items-center gap-2">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProfile(p.id)}
                  className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                    p.id === activeProfileId
                      ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                      : 'bg-sky-50 hover:bg-sky-100 text-slate-700 border-sky-200'
                  }`}
                >
                  {p.username}
                </button>
              ))}
            </div>
          </div>

          {/* Informational Guidance Banner */}
          <div className="p-4 bg-sky-50/90 border border-sky-200/90 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-sky-200 text-sky-700 flex items-center justify-center shrink-0 shadow-xs">
              <Link2 className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 font-mono">
                  Enlaces personalizados para: <span className="text-sky-700 underline">{activeProfile?.username}</span>
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
                  ?user={activeProfile?.username}&guest=true
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Cada enlace incluye los parámetros <strong>&user={activeProfile?.username}&guest=true</strong>. Cuando {activeProfile?.username} abra el enlace en su celular, entrará en modo usuario con su propio cumpleaños y saldo bancario. Si alguien entra sin usuario o con un usuario no existente, verá la pantalla 404 sin información personal.
              </p>
            </div>
          </div>

          {/* Cards for each day's link */}
          <div className="grid grid-cols-1 gap-3.5">
            {DAILY_GAMES_LIST.map((game) => {
              const currentUsername = activeProfile?.username || 'Carolina';
              const userLink = getDayUserLink(game.dayNumber, currentUsername);
              const key = `${currentUsername}_${game.dayNumber}`;
              const isCopied = copiedKey === key;
              const isMsgCopied = copiedMessageKey === key;

              return (
                <div
                  key={game.dayNumber}
                  className="bg-white border border-sky-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-sky-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                        {getDayIcon(game.dayNumber)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-sky-700 uppercase">
                            Evento {game.dayNumber}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200">
                            {game.badge}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold">
                            Para: {currentUsername}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {game.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSwitchToUserMode(game.dayNumber, false, currentUsername)}
                        className="cursor-pointer text-[10px] font-mono text-slate-600 hover:text-slate-950 flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-50/60 border border-sky-200 hover:bg-sky-100 transition-colors"
                        title="Probar vista como usuario (con opción de admin)"
                      >
                        <Eye className="w-3 h-3 text-sky-600" />
                        <span className="hidden sm:inline">Vista previa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSwitchToUserMode(game.dayNumber, true, currentUsername)}
                        className="cursor-pointer text-[10px] font-mono text-slate-900 hover:text-black font-semibold flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 border border-amber-300 hover:bg-amber-200 transition-colors"
                        title="Probar experiencia real del usuario (bloqueada)"
                      >
                        <span>🔒 Probar bloq.</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-snug">
                    {game.subtitle}
                  </p>

                  {/* Link display & quick copy */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Enlace exclusivo para {currentUsername}:</span>
                      <span className="text-amber-800 font-semibold flex items-center gap-1">
                        ✓ Incluye ?user={currentUsername} y ?day={game.dayNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-700 truncate select-all">
                        {userLink}
                      </div>

                      <button
                        type="button"
                        id={`btn-copy-link-day-${game.dayNumber}`}
                        onClick={() => handleCopyLink(game.dayNumber, currentUsername)}
                        className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white border border-sky-300'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-amber-300" />
                            <span>Copiar Enlace</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Ready-to-send message button */}
                  <div className="pt-2 border-t border-sky-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      Mensaje WhatsApp sugerido para {currentUsername}
                    </span>
                    <button
                      type="button"
                      id={`btn-copy-msg-day-${game.dayNumber}`}
                      onClick={() => handleCopyWhatsAppMessage(game, currentUsername)}
                      className={`cursor-pointer text-[11px] font-mono flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                        isMsgCopied
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-white border-sky-200 text-slate-700 hover:border-sky-300 hover:text-slate-950'
                      }`}
                    >
                      <MessageSquare className="w-3 h-3 text-sky-600" />
                      <span>{isMsgCopied ? '¡Mensaje Copiado!' : 'Copiar Texto para WhatsApp'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PERFILES, CUMPLEAÑOS & BANCO */}
      {activeTab === 'stats' && (
        <AdminStatsManager
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={onSelectProfile}
          onSaveProfile={onSaveProfile}
          onCreateProfile={onCreateProfile}
          onDeleteProfile={onDeleteProfile}
        />
      )}

      {/* TAB 3: MODIFICAR ACTIVIDADES */}
      {activeTab === 'edit' && (
        <div className="space-y-4">
          <div className="bg-white border border-sky-200/90 rounded-2xl p-2.5 shadow-xs space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">
                Selecciona la actividad a modificar:
              </span>
              <span className="text-[10px] font-mono text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-200 font-semibold">
                MODO EDITOR ACTIVO
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {DAILY_GAMES_LIST.map((game) => {
                const isActive = game.dayNumber === selectedDay;
                return (
                  <button
                    key={game.dayNumber}
                    type="button"
                    onClick={() => onSelectDay(game.dayNumber)}
                    className={`cursor-pointer p-2 rounded-xl text-left border transition-all ${
                      isActive
                        ? 'border-sky-400 bg-sky-50 text-slate-950 font-bold shadow-xs'
                        : 'border-sky-100 bg-white hover:bg-sky-50/50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                      <span className="text-sky-700 font-bold">DÍA {game.dayNumber}</span>
                      {getDayIcon(game.dayNumber)}
                    </div>
                    <div className="text-xs truncate font-medium">
                      {game.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
                {getDayIcon(selectedDay)}
              </div>
              <div>
                <div className="font-bold text-slate-900 font-mono">
                  Evento {activeConfig.dayNumber}: {activeConfig.title}
                </div>
                <div className="text-[11px] text-slate-500">
                  Toca "Personalizar" en el panel para modificar la configuración global del juego.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSwitchToUserMode(selectedDay, false, activeProfile?.username)}
              className="cursor-pointer text-xs font-mono text-slate-800 hover:text-slate-950 bg-white border border-sky-200 px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Eye className="w-3.5 h-3.5 text-sky-600" />
              <span>Ver como usuario</span>
            </button>
          </div>

          <div className="border border-sky-200/80 bg-white/90 p-5 sm:p-6 rounded-2xl shadow-sm relative overflow-hidden">
            {activeConfig.id === 'thumb_saver' && (
              <ThumbSaverGame onSuccess={onLogCapture} isAdmin={true} />
            )}
            {activeConfig.id === 'custom_wordle' && (
              <QuestionPollGame onSuccess={onLogCapture} isAdmin={true} />
            )}
            {activeConfig.id === 'terminal_adventure' && (
              <RouletteWheelGame onSuccess={onLogCapture} isAdmin={true} />
            )}
            {activeConfig.id === 'recommendation_engine' && (
              <GuessJokesGame onSuccess={onLogCapture} isAdmin={true} />
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RESPUESTAS RECIBIDAS (FILTERABLE BY PROFILE) */}
      {activeTab === 'responses' && (
        <div className="space-y-4">
          <div className="bg-white border border-sky-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold font-mono text-slate-900 uppercase">
                Buzón de Respuestas e Interacciones
              </h4>
              <p className="text-[11px] text-slate-500">
                Ver respuestas filtradas por usuario o en conjunto.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs font-mono text-slate-500">
                <Filter className="w-3.5 h-3.5 text-sky-600" />
                <span>Filtrar:</span>
              </div>
              <select
                value={logUserFilter}
                onChange={(e) => setLogUserFilter(e.target.value)}
                className="text-xs font-mono p-1.5 rounded-xl border border-sky-200 bg-sky-50 text-slate-800 font-bold"
              >
                <option value="all">Todos los usuarios ({logs.length})</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.username}>
                    {p.username}
                  </option>
                ))}
              </select>

              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={onClearLogs}
                  className="cursor-pointer text-xs font-mono text-amber-900 hover:text-black flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Limpiar</span>
                </button>
              )}
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-8 bg-white border border-sky-200/90 rounded-2xl text-center space-y-2">
              <Activity className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs font-mono font-bold text-slate-600">
                No hay respuestas para este filtro
              </div>
              <div className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Cuando el usuario haga click o interactúe con su enlace, las respuestas aparecerán aquí con su nombre.
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white border border-sky-200/90 rounded-xl p-3.5 shadow-xs space-y-1.5 text-xs text-left"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono border-b border-sky-100 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sky-700 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {log.gameTitle}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        Usuario: {log.username || 'Carolina'}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
                  </div>

                  <div className="text-slate-800 font-medium">
                    {typeof log.payload === 'string' ? log.payload : JSON.stringify(log.payload)}
                  </div>

                  {log.metadata && (
                    <div className="text-[10px] font-mono text-slate-500 bg-sky-50/50 p-2 rounded-lg space-y-0.5 border border-sky-100">
                      {log.metadata.dodgeAttempts !== undefined && (
                        <div>Intentos evasivos: {log.metadata.dodgeAttempts}</div>
                      )}
                      {log.metadata.pollAnswer && (
                        <div>
                          <strong>Pregunta:</strong> {log.metadata.pollAnswer.question}
                          <br />
                          <strong>Opción escogida:</strong> {log.metadata.pollAnswer.selectedOption}
                          {log.metadata.pollAnswer.customText && (
                            <div><strong>Texto personalizado:</strong> {log.metadata.pollAnswer.customText}</div>
                          )}
                        </div>
                      )}
                      {log.metadata.roulettePrize && (
                        <div>
                          <strong>Premio ganado en la ruleta:</strong> {log.metadata.roulettePrize.emoji} {log.metadata.roulettePrize.prize}
                        </div>
                      )}
                      {log.metadata.jokeReaction && (
                        <div>
                          <strong>Reacción a chiste:</strong> {log.metadata.jokeReaction.reaction} ({log.metadata.jokeReaction.question})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
