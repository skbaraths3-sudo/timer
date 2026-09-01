export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export type AlarmTone = 'chime' | 'digital' | 'bell' | 'marimba';

export interface TimerState {
  originalDurationSeconds: number; // The preserved original duration
  remainingSeconds: number;        // The countdown remaining time
  status: TimerStatus;             // idle, running, paused, completed
  cycleCount: number;              // Number of completed cycles in current session
}

export interface PresetDuration {
  label: string;
  seconds: number;
  description?: string;
}
