import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, Trash2, Copy, Check, Terminal, ExternalLink, ShieldCheck, Download } from 'lucide-react';
import { TelemetryLog } from '../types';

interface TelemetryDrawerProps {
  logs: TelemetryLog[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export default function TelemetryDrawer({ logs, isOpen, onClose, onClear }: TelemetryDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [webhookSimulated, setWebhookSimulated] = useState(false);

  const copyAsJson = () => {
    navigator.clipboard.writeText(JSON.stringify(logs, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateDiscordWebhook = () => {
    setWebhookSimulated(true);
    setTimeout(() => setWebhookSimulated(false), 3000);
  };

  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `telemetry_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-40"
          />

          {/* Drawer content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FAF8F5] border-l border-[#E2D9C8] text-stone-700 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#E2D9C8] flex items-center justify-between bg-[#F4EFE6]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
                <h3 className="font-mono text-xs font-bold text-stone-900 uppercase tracking-wider">
                  TELEMETRY DISPATCH CONSOLE
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer text-xs font-mono text-stone-600 hover:text-stone-900 px-2 py-1 rounded bg-[#EAE5D9] hover:bg-[#DDD6C6] transition-colors"
              >
                ESC // CLOSE
              </button>
            </div>

            {/* Subheader info bar */}
            <div className="px-4 py-2 bg-[#F7F5F0] border-b border-[#E2D9C8] flex items-center justify-between text-[11px] font-mono text-stone-600">
              <span>INBOUND RESPONSES: <strong className="text-rose-600">{logs.length}</strong></span>
              <div className="flex items-center gap-2">
                {logs.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={copyAsJson}
                      className="cursor-pointer hover:text-stone-900 flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-rose-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'JSON'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadJson}
                      className="cursor-pointer hover:text-stone-900 flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Webhook Alert Simulator Banner */}
            {webhookSimulated && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-50 border-b border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2"
              >
                <Radio className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />
                <span>
                  [DISCORD WEBHOOK SIMULATION]: Ping dispatched to your private channel with latest response payload!
                </span>
              </motion.div>
            )}

            {/* Logs List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="py-16 text-center text-stone-400 space-y-2">
                  <Terminal className="w-8 h-8 mx-auto text-stone-300" />
                  <p className="text-xs text-stone-500">No responses recorded yet.</p>
                  <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                    When she interacts with any of the daily mini-games (clicks Yes, finds crossword treats, finishes story, solves quiz), the exact payload captures here instantly.
                  </p>
                </div>
              ) : (
                logs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 bg-white border border-[#E4DCCE] rounded-lg space-y-2 hover:border-rose-300 transition-colors shadow-xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                        {log.gameTitle}
                      </span>
                      <span className="text-stone-400 text-[10px]">{log.timestamp}</span>
                    </div>

                    <div>
                      <div className="text-[10px] text-stone-400 uppercase tracking-wider">Action Trigger</div>
                      <div className="text-stone-900 font-medium text-xs mt-0.5">{log.action}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-stone-400 uppercase tracking-wider">Payload Data</div>
                      <div className="text-stone-700 text-xs bg-[#FAF8F5] p-2 rounded border border-[#E8E2D6] mt-0.5 overflow-x-auto">
                        {typeof log.payload === 'string' ? log.payload : JSON.stringify(log.payload, null, 2)}
                      </div>
                    </div>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="text-[10px] text-stone-500 bg-[#F7F5F0] p-1.5 rounded border border-[#E8E2D6]">
                        <span className="text-stone-400">Metadata:</span>{' '}
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-[#E2D9C8] bg-[#F4EFE6] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={simulateDiscordWebhook}
                className="cursor-pointer text-[11px] font-mono text-stone-700 hover:text-stone-900 px-3 py-2 rounded bg-white border border-[#E2D9C8] hover:border-rose-300 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Radio className="w-3.5 h-3.5 text-rose-500" />
                <span>Test Webhook Ping</span>
              </button>

              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={onClear}
                  className="cursor-pointer text-[11px] font-mono text-rose-600 hover:text-rose-700 px-3 py-2 rounded hover:bg-rose-50 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Logs</span>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
