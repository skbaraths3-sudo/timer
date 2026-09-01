import React, { useState, useEffect } from 'react';
import { Clock, Plus, Minus } from 'lucide-react';
import { PRESET_DURATIONS } from '../utils/time';

interface DurationPickerProps {
  currentOriginalSeconds: number;
  onSelectDuration: (seconds: number) => void;
  disabled?: boolean;
}

export const DurationPicker: React.FC<DurationPickerProps> = ({
  currentOriginalSeconds,
  onSelectDuration,
  disabled = false,
}) => {
  const [hours, setHours] = useState(Math.floor(currentOriginalSeconds / 3600));
  const [minutes, setMinutes] = useState(Math.floor((currentOriginalSeconds % 3600) / 60));
  const [seconds, setSeconds] = useState(currentOriginalSeconds % 60);

  useEffect(() => {
    setHours(Math.floor(currentOriginalSeconds / 3600));
    setMinutes(Math.floor((currentOriginalSeconds % 3600) / 60));
    setSeconds(currentOriginalSeconds % 60);
  }, [currentOriginalSeconds]);

  const handleUpdate = (h: number, m: number, s: number) => {
    const safeH = Math.max(0, Math.min(23, h));
    const safeM = Math.max(0, Math.min(59, m));
    const safeS = Math.max(0, Math.min(59, s));
    const total = safeH * 3600 + safeM * 60 + safeS;
    if (total > 0) {
      setHours(safeH);
      setMinutes(safeM);
      setSeconds(safeS);
      onSelectDuration(total);
    }
  };

  return (
    <div id="duration-picker-panel" className="w-full bg-neutral-800/60 border border-neutral-700/60 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Select Timer Duration</span>
        </div>
        <span className="text-xs text-neutral-400">Sets Original Duration</span>
      </div>

      {/* Quick Presets Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {PRESET_DURATIONS.map((preset) => {
          const isSelected = currentOriginalSeconds === preset.seconds;
          return (
            <button
              key={preset.label}
              id={`preset-btn-${preset.seconds}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDuration(preset.seconds)}
              className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all text-center flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            >
              <span className="font-mono">{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Duration Stepper */}
      <div className="pt-2 border-t border-neutral-700/50 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs text-neutral-400">Custom Duration:</span>
        <div className="flex items-center gap-3">
          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden">
              <button
                type="button"
                disabled={disabled || hours <= 0}
                onClick={() => handleUpdate(hours - 1, minutes, seconds)}
                className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-40"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-sm px-2 text-white font-medium min-w-[28px] text-center">
                {hours.toString().padStart(2, '0')}
              </span>
              <button
                type="button"
                disabled={disabled || hours >= 23}
                onClick={() => handleUpdate(hours + 1, minutes, seconds)}
                className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[10px] text-neutral-400 mt-1">HR</span>
          </div>

          <span className="text-neutral-500 font-bold mb-3">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden">
              <button
                type="button"
                disabled={disabled || (minutes <= 0 && hours <= 0 && seconds <= 1)}
                onClick={() => handleUpdate(hours, minutes - 1, seconds)}
                className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-40"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-sm px-2 text-white font-medium min-w-[28px] text-center">
                {minutes.toString().padStart(2, '0')}
              </span>
              <button
                type="button"
                disabled={disabled || minutes >= 59}
                onClick={() => handleUpdate(hours, minutes + 1, seconds)}
                className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[10px] text-neutral-400 mt-1">MIN</span>
          </div>

          <span className="text-neutral-500 font-bold mb-3">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden">
              <button
                type="button"
                disabled={disabled || (seconds <= 0 && hours <= 0 && minutes <= 0)}
                onClick={() => handleUpdate(hours, minutes, seconds - 5 < 0 ? 0 : seconds - 5)}
                className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-40"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-sm px-2 text-white font-medium min-w-[28px] text-center">
                {seconds.toString().padStart(2, '0')}
              </span>
              <button
                type="button"
                disabled={disabled || seconds >= 59}
                onClick={() => handleUpdate(hours, minutes, seconds + 5 > 59 ? 59 : seconds + 5)}
                className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[10px] text-neutral-400 mt-1">SEC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
