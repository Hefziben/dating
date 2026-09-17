import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cake,
  DollarSign,
  Save,
  Check,
  Calendar,
  RotateCcw,
  User,
  Plus,
  Trash2,
  Building2,
  CreditCard,
  FileText,
  History,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  UserPlus,
  ChevronDown
} from 'lucide-react';
import { UserProfile, BankTransaction } from '../types';

interface AdminStatsManagerProps {
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onSaveProfile: (profile: UserProfile) => void;
  onCreateProfile: (profile: Omit<UserProfile, 'id'>) => void;
  onDeleteProfile: (id: string) => void;
}

export default function AdminStatsManager({
  profiles,
  activeProfileId,
  onSelectProfile,
  onSaveProfile,
  onCreateProfile,
  onDeleteProfile
}: AdminStatsManagerProps) {
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const [username, setUsername] = useState<string>(activeProfile?.username || 'Carolina');
  const [daysLeft, setDaysLeft] = useState<number>(activeProfile?.birthdayDaysLeft ?? 100);
  const [savings, setSavings] = useState<number>(activeProfile?.savingsDollars ?? 10);
  const [birthdayDate, setBirthdayDate] = useState<string>(activeProfile?.birthdayDate || '');
  const [bankName, setBankName] = useState<string>(activeProfile?.bankName || 'Banco Principal');
  const [accountNumber, setAccountNumber] = useState<string>(activeProfile?.accountNumber || '**** **** 4821');
  const [bankNotes, setBankNotes] = useState<string>(activeProfile?.bankNotes || 'Cuenta de Ahorros Personal');
  const [transactions, setTransactions] = useState<BankTransaction[]>(activeProfile?.transactions || []);

  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDaysLeft, setNewDaysLeft] = useState(100);
  const [newSavings, setNewSavings] = useState(10);

  // New transaction state
  const [txType, setTxType] = useState<'deposit' | 'withdrawal' | 'note'>('deposit');
  const [txAmount, setTxAmount] = useState<number>(50);
  const [txDesc, setTxDesc] = useState<string>('');

  const [isSaved, setIsSaved] = useState(false);

  // Sync state when active profile changes
  React.useEffect(() => {
    if (activeProfile) {
      setUsername(activeProfile.username);
      setDaysLeft(activeProfile.birthdayDaysLeft ?? 100);
      setSavings(activeProfile.savingsDollars ?? 10);
      setBirthdayDate(activeProfile.birthdayDate || '');
      setBankName(activeProfile.bankName || 'Banco Principal');
      setAccountNumber(activeProfile.accountNumber || '**** **** 4821');
      setBankNotes(activeProfile.bankNotes || 'Cuenta de Ahorros Personal');
      setTransactions(activeProfile.transactions || []);
    }
  }, [activeProfileId, activeProfile]);

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

    if (nextBirthday.getTime() < today.getTime()) {
      nextBirthday = new Date(today.getFullYear() + 1, month, day);
      nextBirthday.setHours(0, 0, 0, 0);
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysLeft(diffDays);
    setBirthdayDate(dateString);
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeProfile) return;

    const safeDays = isNaN(daysLeft) || daysLeft < 0 ? 0 : Math.round(daysLeft);
    const safeSavings = isNaN(savings) || savings < 0 ? 0 : savings;

    const updated: UserProfile = {
      ...activeProfile,
      username: username.trim() || 'Usuario',
      birthdayDaysLeft: safeDays,
      savingsDollars: safeSavings,
      birthdayDate: birthdayDate || undefined,
      bankName: bankName.trim() || 'Banco',
      accountNumber: accountNumber.trim() || '**** **** 0000',
      bankNotes: bankNotes.trim(),
      transactions: transactions,
      updatedAt: new Date().toISOString()
    };

    onSaveProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddTransaction = () => {
    if (isNaN(txAmount) || txAmount <= 0) return;
    const newTx: BankTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: txType,
      amount: txType === 'note' ? 0 : txAmount,
      description: txDesc.trim() || (txType === 'deposit' ? 'Depósito en cuenta' : txType === 'withdrawal' ? 'Retiro de cuenta' : 'Nota de cuenta'),
      date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    let updatedSavings = savings;
    if (txType === 'deposit') {
      updatedSavings += txAmount;
    } else if (txType === 'withdrawal') {
      updatedSavings = Math.max(0, updatedSavings - txAmount);
    }

    const updatedTxList = [newTx, ...transactions];
    setSavings(updatedSavings);
    setTransactions(updatedTxList);
    setTxDesc('');

    if (activeProfile) {
      onSaveProfile({
        ...activeProfile,
        savingsDollars: updatedSavings,
        transactions: updatedTxList
      });
    }
  };

  const handleCreateNewProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    onCreateProfile({
      username: newUsername.trim(),
      birthdayDaysLeft: newDaysLeft,
      savingsDollars: newSavings,
      bankName: 'Banco Principal',
      accountNumber: '**** **** 1234',
      bankNotes: `Perfil creado para ${newUsername.trim()}`,
      transactions: [
        {
          id: `tx_init_${Date.now()}`,
          type: 'deposit',
          amount: newSavings,
          description: 'Depósito Inicial',
          date: new Date().toLocaleDateString('es-ES')
        }
      ]
    });

    setNewUsername('');
    setIsNewProfileModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Profile Switcher Bar */}
      <div className="bg-white border border-sky-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 pb-3">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-2">
              <User className="w-4 h-4 text-sky-600" />
              <span>Gestión de Perfiles y Cuentas Bancarias</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Selecciona o crea perfiles para enviar enlaces personalizados. Cada perfil tiene su propio cumpleaños, cuenta bancaria e historial.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsNewProfileModalOpen(true)}
            className="cursor-pointer text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl border border-sky-300 flex items-center gap-1.5 transition-all shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-300" />
            <span>Crear Nuevo Perfil</span>
          </button>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {profiles.map((p) => {
            const isSelected = p.id === activeProfileId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProfile(p.id)}
                className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-sky-500 text-white border-sky-600 shadow-xs font-bold'
                    : 'bg-sky-50/60 hover:bg-sky-100 text-slate-700 border-sky-200'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-amber-300' : 'bg-sky-400'
                  }`}
                />
                <span>{p.username}</span>
                <span className="text-[10px] opacity-80">(${p.savingsDollars})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form for Editing Selected Profile */}
      {activeProfile && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="bg-white border border-sky-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            {/* Header with name and delete button */}
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-900 uppercase">
                  Editando Perfil:
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-sm font-mono font-bold text-sky-900 px-2 py-1 bg-sky-50 border border-sky-200 rounded-lg focus:outline-none focus:border-sky-500"
                  placeholder="Nombre de usuario"
                  required
                />
                {username.toLowerCase() === 'carolina' && (
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-semibold">
                    Perfil Principal Migrado
                  </span>
                )}
              </div>

              {profiles.length > 1 && (
                <button
                  type="button"
                  onClick={() => onDeleteProfile(activeProfile.id)}
                  className="cursor-pointer text-xs font-mono text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Eliminar Perfil</span>
                </button>
              )}
            </div>

            {/* Grid for Birthday & Bank Account Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Birthday Countdown Settings */}
              <div className="p-4 bg-sky-50/40 border border-sky-200/80 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-mono text-xs font-bold">
                  <div className="w-6 h-6 rounded-md bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                    <Cake className="w-3.5 h-3.5" />
                  </div>
                  <span>Cumpleaños de {username}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">
                    Días faltantes para su cumpleaños:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="366"
                      value={isNaN(daysLeft) ? '' : daysLeft}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setDaysLeft(isNaN(val) ? 0 : val);
                      }}
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
                    <span>O selecciona fecha exacta para calcular:</span>
                  </label>
                  <input
                    type="date"
                    value={birthdayDate}
                    onChange={(e) => calculateDaysFromDate(e.target.value)}
                    className="w-full text-xs font-mono p-1.5 rounded-md border border-sky-200 bg-white text-slate-700 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Bank Account Details Settings */}
              <div className="p-4 bg-sky-50/40 border border-sky-200/80 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-mono text-xs font-bold">
                  <div className="w-6 h-6 rounded-md bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Información Bancaria de {username}</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-0.5">
                      Banco u Entidad:
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full text-xs font-mono p-2 rounded-lg border border-sky-200 bg-white text-slate-800 focus:outline-none focus:border-sky-500"
                      placeholder="Ej: Banco Principal / Nequi / Nu"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-0.5">
                      Número / Referencia de Cuenta:
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full text-xs font-mono p-2 rounded-lg border border-sky-200 bg-white text-slate-800 focus:outline-none focus:border-sky-500"
                      placeholder="Ej: **** **** 4821"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-0.5">
                      Notas / Detalle de la Cuenta:
                    </label>
                    <input
                      type="text"
                      value={bankNotes}
                      onChange={(e) => setBankNotes(e.target.value)}
                      className="w-full text-xs font-mono p-2 rounded-lg border border-sky-200 bg-white text-slate-800 focus:outline-none focus:border-sky-500"
                      placeholder="Ej: Cuenta de Ahorros Cumpleaños"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Balance & Bank Transaction History Section */}
            <div className="p-4 bg-sky-50/50 border border-sky-200/90 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900 uppercase">
                    Saldo y Movimientos de Cuenta de {username}
                  </span>
                </div>

                <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Saldo Actual: ${savings.toLocaleString()} USD
                </div>
              </div>

              {/* Add transaction form */}
              <div className="bg-white p-3 rounded-lg border border-sky-200/80 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                  Registrar Nuevo Movimiento Bancario:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="text-xs font-mono p-1.5 rounded-lg border border-sky-200 bg-white text-slate-800"
                  >
                    <option value="deposit">➕ Depósito (+)</option>
                    <option value="withdrawal">➖ Retiro (-)</option>
                    <option value="note">📝 Nota sin monto</option>
                  </select>

                  {txType !== 'note' && (
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                        $
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={isNaN(txAmount) ? '' : txAmount}
                        onChange={(e) => setTxAmount(parseFloat(e.target.value))}
                        className="w-full text-xs font-mono p-1.5 pl-5 rounded-lg border border-sky-200 bg-white text-slate-800"
                        placeholder="Monto"
                      />
                    </div>
                  )}

                  <input
                    type="text"
                    value={txDesc}
                    onChange={(e) => setTxDesc(e.target.value)}
                    className="flex-1 min-w-[150px] text-xs font-mono p-1.5 rounded-lg border border-sky-200 bg-white text-slate-800"
                    placeholder="Descripción (ej: Regalo de Cumpleaños)"
                  />

                  <button
                    type="button"
                    onClick={handleAddTransaction}
                    className="cursor-pointer text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>

              {/* Transaction History List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center gap-1">
                  <History className="w-3 h-3 text-sky-600" />
                  <span>Historial de Movimientos Bancarios ({transactions.length}):</span>
                </span>

                {transactions.length === 0 ? (
                  <p className="text-[11px] font-mono text-slate-400 italic bg-white/60 p-2 rounded-lg border border-sky-100">
                    No hay movimientos registrados aún.
                  </p>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-white/90 p-2 rounded-lg border border-sky-100 text-xs font-mono flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {tx.type === 'deposit' ? (
                          <div className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <ArrowUpRight className="w-3 h-3" />
                          </div>
                        ) : tx.type === 'withdrawal' ? (
                          <div className="w-5 h-5 rounded bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                            <ArrowDownRight className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                            <FileText className="w-3 h-3" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-800">{tx.description}</div>
                          <div className="text-[10px] text-slate-400">{tx.date}</div>
                        </div>
                      </div>

                      <div className="font-bold">
                        {tx.type === 'deposit' && (
                          <span className="text-emerald-600">+${tx.amount} USD</span>
                        )}
                        {tx.type === 'withdrawal' && (
                          <span className="text-rose-600">-${tx.amount} USD</span>
                        )}
                        {tx.type === 'note' && (
                          <span className="text-slate-400">Nota</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Header Text Preview & Save Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-sky-100">
              <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  Texto en Banner:
                </span>
                <span className="text-slate-800 text-[11px]">
                  Faltan <strong>{daysLeft} días</strong> para tu cumpleaños • Tienes <strong>${savings} USD</strong> en {bankName}
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
                    <span>¡Perfil Guardado!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-amber-300" />
                    <span>Guardar Cambios de Perfil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Modal for Creating New Profile */}
      <AnimatePresence>
        {isNewProfileModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-sky-200 rounded-2xl p-5 max-w-md w-full shadow-xl space-y-4 font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <h3 className="font-bold text-slate-900 uppercase flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-sky-600" />
                  <span>Crear Nuevo Perfil de Usuario</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewProfileModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateNewProfileSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Nombre del Usuario (para el enlace ?user=Nombre):
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full text-xs font-mono p-2 rounded-lg border border-sky-200 bg-sky-50 text-slate-900 focus:outline-none focus:border-sky-500"
                    placeholder="Ej: Sofia / Alex / Carlos"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase mb-1">
                      Días para cumpleaños:
                    </label>
                    <input
                      type="number"
                      value={newDaysLeft}
                      onChange={(e) => setNewDaysLeft(parseInt(e.target.value, 10) || 0)}
                      className="w-full text-xs font-mono p-2 rounded-lg border border-sky-200 bg-sky-50 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase mb-1">
                      Saldo Inicial ($ USD):
                    </label>
                    <input
                      type="number"
                      value={newSavings}
                      onChange={(e) => setNewSavings(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono p-2 rounded-lg border border-sky-200 bg-sky-50 text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewProfileModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-sky-200 text-slate-600 hover:bg-sky-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold"
                  >
                    Crear Perfil
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
