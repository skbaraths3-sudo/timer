import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, RotateCcw, Square, Sparkles, Volume2 } from 'lucide-react';
import { formatTime, formatTimeVerbose } from '../utils/time';

interface CompletionModalProps {
  isOpen: boolean;
  originalDurationSeconds: number;
  cycleCount: number;
  onStop: () => void;
  onRepeat: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  originalDurationSeconds,
  cycleCount,
  onStop,
  onRepeat,
}) => {
  // Listen for keyboard shortcuts when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        onStop();
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'Enter') {
        e.preventDefault();
        onRepeat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onStop, onRepeat]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="timer-completion-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        >
          <motion.div
            id="timer-completion-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-lg bg-neutral-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/20 text-neutral-100 flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Ambient background glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Pulsing Alarm Icon */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, -8, 8, -8, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-5 shadow-lg shadow-amber-500/10"
            >
              <BellRing className="w-10 h-10 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
              </span>
            </motion.div>

            {/* Completion Title */}
            <h2 id="completion-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              Time&apos;s Up!
            </h2>

            <div className="flex items-center gap-2 text-amber-400/90 text-sm font-medium mb-4 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>Alarm sounding • Manual choice required</span>
            </div>

            {/* Cycle and duration details */}
            <div className="w-full bg-neutral-800/80 rounded-2xl p-4 border border-neutral-700/60 mb-6 space-y-2">
              <div className="flex justify-between items-center text-sm text-neutral-300">
                <span>Original Timer Duration</span>
                <span className="font-mono font-bold text-white text-base">
                  {formatTime(originalDurationSeconds)} ({formatTimeVerbose(originalDurationSeconds)})
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-neutral-400 border-t border-neutral-700/50 pt-2">
                <span>Cycle Number</span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  Cycle #{cycleCount}
                </span>
              </div>
            </div>

            <p className="text-neutral-300 text-sm mb-6 max-w-sm">
              The timer will <strong className="text-white">not</strong> automatically restart. Choose whether to stop or repeat another cycle.
            </p>

            {/* Exactly TWO Main Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {/* STOP BUTTON */}
              <button
                id="btn-stop-completion"
                type="button"
                onClick={onStop}
                className="group flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-800/90 text-neutral-200 hover:text-white font-bold text-lg border border-neutral-700 hover:border-neutral-600 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-400"
              >
                <Square className="w-5 h-5 fill-neutral-400 group-hover:fill-white text-transparent transition-colors" />
                <span>STOP</span>
              </button>

              {/* REPEAT BUTTON */}
              <button
                id="btn-repeat-completion"
                type="button"
                onClick={onRepeat}
                className="group flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-extrabold text-lg transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <RotateCcw className="w-5 h-5 group-hover:-rotate-45 transition-transform" />
                <span>REPEAT</span>
              </button>
            </div>

            {/* Subtle keyboard hint */}
            <div className="flex items-center justify-center gap-4 text-xs text-neutral-500 mt-5">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-400">Esc</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-400">S</kbd> to Stop</span>
              <span>•</span>
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-400">R</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-400">Enter</kbd> to Repeat</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
