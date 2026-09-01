import React from 'react';
import { motion } from 'motion/react';
import { TimerStatus } from '../types';
import { formatTime, formatTimeVerbose } from '../utils/time';
import { Bookmark, Sparkles } from 'lucide-react';

interface TimerDisplayProps {
  remainingSeconds: number;
  originalDurationSeconds: number;
  status: TimerStatus;
  cycleCount: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  remainingSeconds,
  originalDurationSeconds,
  status,
  cycleCount,
}) => {
  const percentage = originalDurationSeconds > 0
    ? Math.max(0, Math.min(100, (remainingSeconds / originalDurationSeconds) * 100))
    : 0;

  // SVG circular dimensions
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isCompleted = status === 'completed';
  const isRunning = status === 'running';
  const isPaused = status === 'paused';

  return (
    <div id="timer-display-card" className="relative flex flex-col items-center justify-center">
      {/* Outer Glow container */}
      <div className="relative w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] flex items-center justify-center">
        {/* SVG Circular Progress Ring */}
        <svg
          className="w-full h-full -rotate-90 transform drop-shadow-md"
          viewBox="0 0 320 320"
        >
          {/* Background circle */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            className="stroke-neutral-800/80"
            strokeWidth="12"
            fill="transparent"
          />

          {/* Animated Progress Bar */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            className={`transition-all duration-300 ${
              isCompleted
                ? 'stroke-amber-400'
                : isRunning
                ? 'stroke-amber-500'
                : isPaused
                ? 'stroke-amber-600/70'
                : 'stroke-neutral-600'
            }`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          {/* Status Badge */}
          <div className="mb-2">
            <span
              id="timer-status-badge"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
                isRunning
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                  : isPaused
                  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                  : isCompleted
                  ? 'bg-red-500/15 text-red-400 border-red-500/30'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                isRunning
                  ? 'bg-amber-400'
                  : isPaused
                  ? 'bg-yellow-400'
                  : isCompleted
                  ? 'bg-red-400'
                  : 'bg-neutral-500'
              }`} />
              {status}
            </span>
          </div>

          {/* Time Digits */}
          <motion.div
            key={remainingSeconds}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            className="font-mono text-5xl sm:text-6xl font-bold tracking-tighter text-white select-none"
            id="timer-time-display"
          >
            {formatTime(remainingSeconds)}
          </motion.div>

          {/* Preserved Original Duration Indicator */}
          <div
            id="original-duration-tag"
            className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-800/90 px-3 py-1 rounded-lg border border-neutral-700/60"
            title="The original duration preserved for repeat cycles"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Original: <strong className="text-neutral-200 font-mono">{formatTime(originalDurationSeconds)}</strong>
            </span>
          </div>

          {/* Cycle Counter */}
          {cycleCount > 0 && (
            <div className="mt-2 text-xs font-medium text-amber-400/90 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{cycleCount} cycle{cycleCount > 1 ? 's' : ''} completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Helper text under circle */}
      <div className="mt-2 text-center text-xs text-neutral-400">
        Duration: <span className="text-neutral-200 font-medium">{formatTimeVerbose(originalDurationSeconds)}</span>
      </div>
    </div>
  );
};
