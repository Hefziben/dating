import { useState } from 'react';
import { Share2, Copy, Check, Calendar, Sparkles } from 'lucide-react';
import { DAILY_GAMES_LIST } from '../data/gamesConfig';
import { DailyGameConfig } from '../types';

interface DaySelectorBarProps {
  selectedDay: number;
  scheduledDay: number;
  onSelectDay: (day: number) => void;
  activeConfig: DailyGameConfig;
}

export default function DaySelectorBar({
  selectedDay,
  scheduledDay,
  onSelectDay,
  activeConfig
}: DaySelectorBarProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const getDirectUrl = () => {
    const origin = window.location.origin + window.location.pathname;
    return `${origin}?day=${selectedDay}`;
  };

  const getShareMessage = () => {
    const link = getDirectUrl();
    return activeConfig.suggestedText.replace('[link]', link);
  };

  const copyLinkOnly = () => {
    navigator.clipboard.writeText(getDirectUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyFullMessage = () => {
    navigator.clipboard.writeText(getShareMessage());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-3">
      {/* Day Selector Pills */}
      <div className="flex items-center justify-between gap-1.5 p-1.5 bg-[#EFECE6] border border-[#E2D9C8] rounded-xl overflow-x-auto">
        <div className="flex items-center gap-1">
          {DAILY_GAMES_LIST.map(game => {
            const isSelected = game.dayNumber === selectedDay;
            const isToday = game.dayNumber === scheduledDay;

            return (
              <button
                key={game.dayNumber}
                type="button"
                onClick={() => onSelectDay(game.dayNumber)}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-rose-500 text-white font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-[#E5E0D4]'
                }`}
              >
                <span>Day {game.dayNumber}</span>
                {isToday && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-sans uppercase font-bold ${
                      isSelected ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          className="cursor-pointer text-xs font-mono px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50/50 text-stone-700 hover:text-stone-900 border border-[#E2D9C8] shadow-xs flex items-center gap-1.5 whitespace-nowrap transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-rose-500" />
          <span className="hidden sm:inline">Dispatch Link</span>
        </button>
      </div>

      {/* Share Direct Modal / Card */}
      {showShareModal && (
        <div className="p-4 bg-white border border-[#E4DCCE] rounded-xl space-y-3 font-mono text-xs shadow-md">
          <div className="flex items-center justify-between text-stone-700 border-b border-[#EFE9DF] pb-2">
            <span className="font-semibold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              Day {selectedDay} Dispatch Package
            </span>
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="cursor-pointer text-stone-400 hover:text-stone-600"
            >
              [close]
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-stone-500 font-semibold tracking-wider">
              Recommended Text Message (Zero-Pressure):
            </label>
            <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D5] text-stone-700 leading-relaxed text-xs">
              "{getShareMessage()}"
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={copyFullMessage}
              className="cursor-pointer flex-1 py-2 px-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs shadow-xs"
            >
              {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied Full Message!' : 'Copy Text & Link'}</span>
            </button>

            <button
              type="button"
              onClick={copyLinkOnly}
              className="cursor-pointer py-2 px-3 bg-[#EFECE6] hover:bg-[#E4DFD3] text-stone-700 rounded-lg transition-colors flex items-center gap-1 text-xs border border-[#E2D9C8]"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-rose-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Link Only</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
