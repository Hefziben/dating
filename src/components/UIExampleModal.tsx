import { motion, AnimatePresence } from 'motion/react';
import { Palette, Sparkles, X } from 'lucide-react';
import uiExampleImage from '../assets/images/sand_pink_ui_mockup_1789605968983.jpg';

interface UIExampleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UIExampleModal({ isOpen, onClose }: UIExampleModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-[#FAF8F5] border border-[#E2D9C8] rounded-2xl overflow-hidden shadow-2xl z-50 flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E2D9C8] bg-[#F4EFE6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-mono font-bold text-stone-900 tracking-wide uppercase">
                  UI Layout & Aesthetic Specification
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer p-1.5 rounded-lg bg-[#EAE5D9] hover:bg-[#DDD6C6] text-stone-600 hover:text-stone-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="rounded-xl overflow-hidden border border-[#E2D9C8] shadow-xs bg-[#F7F5F0]">
                <img
                  src={uiExampleImage}
                  alt="Minimalist Sand & Pink UI Mockup"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover max-h-[360px]"
                />
              </div>

              <div className="space-y-3 text-xs text-stone-700 font-mono">
                <div className="p-3.5 bg-[#F4EFE6] rounded-xl border border-[#E2D9C8] space-y-2">
                  <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Aesthetic Architecture Principles</span>
                  </div>
                  <ul className="space-y-1.5 text-stone-600 list-disc pl-4 text-[11px] leading-relaxed">
                    <li><strong className="text-stone-900">Sand Canvas (#F7F5F0 & #FAF8F5):</strong> Warm, soft editorial palette that feels organic and calming on eyes.</li>
                    <li><strong className="text-stone-900">Refined Micro-Borders (#E4DCCE / #E2D9C8):</strong> Delicate tactile framing providing clear spatial definition without visual clutter.</li>
                    <li><strong className="text-stone-900">Rose & Pink Highlights:</strong> Purposeful accent color (<code className="text-rose-600">#F43F5E</code> / <code className="text-rose-500">rose-500</code>) indicating actions, wins, and focal points.</li>
                    <li><strong className="text-stone-900">Serif + Sans + Mono Pairing:</strong> Playfair Display headings with clean modern text for a thoughtful, personalized experience.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E2D9C8] bg-[#F4EFE6] flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-mono rounded-lg transition-colors shadow-xs"
              >
                Return to Active Game
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
