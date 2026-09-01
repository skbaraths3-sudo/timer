import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Bell, Sliders } from 'lucide-react';
import { AlarmTone } from '../types';
import { alarmEngine } from '../utils/audio';

interface SoundSettingsProps {
  currentTone: AlarmTone;
  onSelectTone: (tone: AlarmTone) => void;
}

export const SoundSettings: React.FC<SoundSettingsProps> = ({
  currentTone,
  onSelectTone,
}) => {
  const [volume, setVolumeState] = useState(0.8);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const tones: { id: AlarmTone; label: string; desc: string }[] = [
    { id: 'chime', label: 'Gentle Chime', desc: 'Harmonious chord melody' },
    { id: 'digital', label: 'Classic Digital', desc: 'Electronic alarm pulse' },
    { id: 'bell', label: 'Resonant Bell', desc: 'Deep acoustic bell' },
    { id: 'marimba', label: 'Warm Marimba', desc: 'Percussive wooden sequence' },
  ];

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolumeState(val);
    alarmEngine.setVolume(val);
  };

  const handleTestSound = (toneToTest: AlarmTone = currentTone) => {
    alarmEngine.setVolume(volume);
    alarmEngine.playToneOnce(toneToTest);
    setIsPlayingPreview(true);
    setTimeout(() => setIsPlayingPreview(false), 1200);
  };

  return (
    <div id="sound-settings-panel" className="w-full bg-neutral-800/60 border border-neutral-700/60 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
          <Bell className="w-4 h-4 text-amber-500" />
          <span>Alarm Sound Settings</span>
        </div>
        <button
          type="button"
          id="btn-test-sound"
          onClick={() => handleTestSound(currentTone)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
            isPlayingPreview
              ? 'bg-amber-500 text-neutral-950 border-amber-400'
              : 'bg-neutral-800 hover:bg-neutral-700 text-amber-400 border-amber-500/30'
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isPlayingPreview ? 'Playing...' : 'Test Sound'}</span>
        </button>
      </div>

      {/* Tone Picker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {tones.map((t) => {
          const isSelected = currentTone === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onSelectTone(t.id);
                handleTestSound(t.id);
              }}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-neutral-800 border-amber-500/80 ring-1 ring-amber-500 text-white'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <div className="text-xs font-bold flex items-center justify-between">
                <span>{t.label}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400" />}
              </div>
              <p className="text-[10px] text-neutral-400 mt-0.5 leading-tight">{t.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Volume Slider */}
      <div className="flex items-center gap-3 pt-2 border-t border-neutral-700/50">
        <button
          type="button"
          onClick={() => {
            const newVol = volume > 0 ? 0 : 0.8;
            setVolumeState(newVol);
            alarmEngine.setVolume(newVol);
          }}
          className="text-neutral-400 hover:text-white"
        >
          {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>

        <input
          id="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />

        <span className="font-mono text-xs text-neutral-300 w-9 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
};
