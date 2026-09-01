/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, ShieldCheck, CheckCircle2, Flame } from 'lucide-react';
import { TimerStatus, AlarmTone } from './types';
import { formatTime, formatTimeVerbose } from './utils/time';
import { alarmEngine } from './utils/audio';
import { TimerDisplay } from './components/TimerDisplay';
import { DurationPicker } from './components/DurationPicker';
import { SoundSettings } from './components/SoundSettings';
import { CompletionModal } from './components/CompletionModal';

export default function App() {
  // 1. ORIGINAL TIMER DURATION (Preserved independently)
  const [originalDurationSeconds, setOriginalDurationSeconds] = useState<number>(300); // 5 minutes default

  // 2. CURRENT REMAINING TIME
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300);

  // 3. TIMER STATUS: 'idle' | 'running' | 'paused' | 'completed'
  const [status, setStatus] = useState<TimerStatus>('idle');

  // 4. CYCLE TRACKING
  const [cycleCount, setCycleCount] = useState<number>(0);

  // 5. SOUND CONFIG
  const [alarmTone, setAlarmTone] = useState<AlarmTone>('chime');

  // References for precise countdown interval without drift
  const intervalRef = useRef<number | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef<number>(300);

  // Stop the interval loop cleanly
  const clearIntervalTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Trigger completion sequence when timer hits 00:00
  const handleTimerFinished = useCallback(() => {
    clearIntervalTimer();
    setRemainingSeconds(0);
    setStatus('completed');
    setCycleCount((prev) => prev + 1);

    // 1. Immediately play alarm/completion sound
    alarmEngine.startAlarm(alarmTone);
  }, [alarmTone, clearIntervalTimer]);

  // Start or resume countdown
  const startTimerWithDuration = useCallback((secondsToRun: number) => {
    clearIntervalTimer();
    alarmEngine.stopAlarm();

    const now = Date.now();
    targetEndTimeRef.current = now + secondsToRun * 1000;
    setStatus('running');

    intervalRef.current = window.setInterval(() => {
      if (!targetEndTimeRef.current) return;
      const msLeft = targetEndTimeRef.current - Date.now();
      const secsLeft = Math.ceil(msLeft / 1000);

      if (secsLeft <= 0) {
        handleTimerFinished();
      } else {
        setRemainingSeconds(secsLeft);
        pausedRemainingRef.current = secsLeft;
      }
    }, 200);
  }, [clearIntervalTimer, handleTimerFinished]);

  // START / RESUME button handler
  const handleStart = () => {
    if (status === 'paused') {
      startTimerWithDuration(remainingSeconds);
    } else {
      // Start from current remaining or reset if at 0
      const durationToStart = remainingSeconds > 0 ? remainingSeconds : originalDurationSeconds;
      setRemainingSeconds(durationToStart);
      startTimerWithDuration(durationToStart);
    }
  };

  // PAUSE button handler
  const handlePause = () => {
    clearIntervalTimer();
    pausedRemainingRef.current = remainingSeconds;
    setStatus('paused');
  };

  // RESET button handler
  const handleReset = () => {
    clearIntervalTimer();
    alarmEngine.stopAlarm();
    setRemainingSeconds(originalDurationSeconds);
    pausedRemainingRef.current = originalDurationSeconds;
    setStatus('idle');
  };

  // User changes duration (e.g. 5 minutes, 10s, 25m)
  const handleSelectDuration = (newSeconds: number) => {
    clearIntervalTimer();
    alarmEngine.stopAlarm();
    setOriginalDurationSeconds(newSeconds);
    setRemainingSeconds(newSeconds);
    pausedRemainingRef.current = newSeconds;
    setStatus('idle');
  };

  /**
   * ### STOP BUTTON LOGIC
   * When user clicks STOP:
   * 1. Stop the alarm sound.
   * 2. Close the completion state.
   * 3. Keep the timer at 00:00.
   * 4. Do not restart the timer.
   * 5. The user can create/set a new timer if desired.
   */
  const handleStop = () => {
    alarmEngine.stopAlarm();
    clearIntervalTimer();
    setRemainingSeconds(0);
    setStatus('idle');
  };

  /**
   * ### REPEAT BUTTON LOGIC
   * When user clicks REPEAT:
   * 1. Stop the current alarm sound.
   * 2. Reset the timer to the ORIGINAL TIMER DURATION (e.g. 5:00).
   * 3. Immediately start counting down again.
   * (NOT automatic, user-controlled restart)
   */
  const handleRepeat = () => {
    alarmEngine.stopAlarm();
    // Reset to the exact original timer duration
    setRemainingSeconds(originalDurationSeconds);
    pausedRemainingRef.current = originalDurationSeconds;
    // Immediately start counting down
    startTimerWithDuration(originalDurationSeconds);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearIntervalTimer();
      alarmEngine.stopAlarm();
    };
  }, [clearIntervalTimer]);

  // Keyboard shortcut listener (Space to start/pause, R to reset when not in modal)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is interacting with an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (status === 'completed') return; // Handled in modal

      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'running') {
          handlePause();
        } else {
          handleStart();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [status, remainingSeconds, originalDurationSeconds]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 selection:bg-amber-500/20">
      {/* Top Header */}
      <header className="w-full max-w-2xl flex items-center justify-between py-2 mb-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">Timer</h1>
            <p className="text-xs text-neutral-400">Precision Countdown with Stop &amp; Repeat Logic</p>
          </div>
        </div>

        {/* Active status or cycle pill */}
        <div className="flex items-center gap-2">
          {cycleCount > 0 && (
            <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{cycleCount} Completed</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
        {/* Central Timer Display */}
        <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-xl relative overflow-hidden">
          <TimerDisplay
            remainingSeconds={remainingSeconds}
            originalDurationSeconds={originalDurationSeconds}
            status={status}
            cycleCount={cycleCount}
          />

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 w-full max-w-md">
            {status === 'running' ? (
              <button
                id="btn-pause-timer"
                type="button"
                onClick={handlePause}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-neutral-950 font-bold text-base transition-all shadow-lg shadow-yellow-500/20"
              >
                <Pause className="w-5 h-5 fill-current" />
                <span>PAUSE</span>
              </button>
            ) : (
              <button
                id="btn-start-timer"
                type="button"
                onClick={handleStart}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-bold text-base transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{status === 'paused' ? 'RESUME' : 'START'}</span>
              </button>
            )}

            {/* Reset to Original Duration Button */}
            <button
              id="btn-reset-timer"
              type="button"
              onClick={handleReset}
              disabled={status === 'idle' && remainingSeconds === originalDurationSeconds}
              className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-800 text-neutral-200 hover:text-white font-semibold text-base border border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Reset to Original Duration"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Prompt quick action hint when timer is at 00:00 in idle */}
          {remainingSeconds === 0 && status === 'idle' && (
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleRepeat}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Restart original {formatTime(originalDurationSeconds)} timer
              </button>
            </div>
          )}
        </div>

        {/* Duration Selection (Presets & Stepper) */}
        <DurationPicker
          currentOriginalSeconds={originalDurationSeconds}
          onSelectDuration={handleSelectDuration}
          disabled={status === 'running'}
        />

        {/* Alarm Sound Settings */}
        <SoundSettings
          currentTone={alarmTone}
          onSelectTone={setAlarmTone}
        />

        {/* Specification Explainer Banner */}
        <div className="w-full bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 text-xs text-neutral-400 space-y-2">
          <div className="flex items-center gap-2 text-neutral-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Logic &amp; Behavior Guarantee</span>
          </div>
          <p className="leading-relaxed">
            When the timer hits <span className="font-mono text-neutral-200">00:00</span>, the alarm plays immediately and prompts with <strong className="text-neutral-200">STOP</strong> and <strong className="text-neutral-200">REPEAT</strong>.
          </p>
          <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-1">
            <li>
              <strong className="text-neutral-300">STOP:</strong> Silences alarm, keeps timer at 00:00 without restarting.
            </li>
            <li>
              <strong className="text-neutral-300">REPEAT:</strong> Silences alarm, resets time to original <strong className="text-neutral-200 font-mono">{formatTime(originalDurationSeconds)}</strong>, and restarts countdown immediately.
            </li>
          </ul>
        </div>
      </div>

      {/* Completion Modal with STOP and REPEAT buttons */}
      <CompletionModal
        isOpen={status === 'completed'}
        originalDurationSeconds={originalDurationSeconds}
        cycleCount={cycleCount}
        onStop={handleStop}
        onRepeat={handleRepeat}
      />
    </main>
  );
}
