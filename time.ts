import { PresetDuration } from '../types';

export function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatTimeVerbose(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} sec${seconds !== 1 ? 's' : ''}`);

  return parts.join(' ');
}

export const PRESET_DURATIONS: PresetDuration[] = [
  { label: '10 sec', seconds: 10, description: 'Quick Test' },
  { label: '1 min', seconds: 60, description: 'Short Break' },
  { label: '3 min', seconds: 180, description: 'Tea Timer' },
  { label: '5 min', seconds: 300, description: 'Default Example' },
  { label: '10 min', seconds: 600, description: 'Quick Focus' },
  { label: '15 min', seconds: 900, description: 'Short Session' },
  { label: '25 min', seconds: 1500, description: 'Pomodoro' },
  { label: '30 min', seconds: 1800, description: 'Deep Work' },
];
