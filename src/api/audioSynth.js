/**
 * ReconX Audio Synthesizer
 * Uses the Web Audio API to synthetically generate retro high-tech sound effects
 * in real-time. No external audio file downloads needed.
 */

let audioCtx = null;
let enabled = true;

// Initialize Audio Context on first user interaction
export function initAudio() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setAudioEnabled(state) {
  enabled = state;
  if (state) {
    initAudio();
  }
}

export function isAudioEnabled() {
  return enabled;
}

// Low-level helper to play a synthesized sound wave
function playTone({
  frequency = 440,
  type = 'sine',
  duration = 0.1,
  startVolume = 0.1,
  endVolume = 0.001,
  frequencyCurve = null,
  frequencyEnd = null,
}) {
  if (!enabled) return;
  const ctx = initAudio();
  if (!ctx || ctx.state === 'suspended') return;

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    
    if (frequencyCurve) {
      osc.frequency.setValueCurveAtTime(new Float32Array(frequencyCurve), ctx.currentTime, duration);
    } else if (frequencyEnd) {
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequencyEnd, ctx.currentTime + duration);
    } else {
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    }

    gainNode.gain.setValueAtTime(startVolume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(endVolume, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn('Audio synthesis failed:', err);
  }
}

// 1. Mechanical keyboard keypress sound (short, high-frequency pop)
export function playKeypress() {
  // A tiny sine-drop click
  playTone({
    frequency: 1800,
    frequencyEnd: 150,
    type: 'sine',
    duration: 0.03,
    startVolume: 0.05,
  });
}

// 2. Button hover / Tab click (soft double click or quick high beep)
export function playClick() {
  playTone({
    frequency: 800,
    frequencyEnd: 1200,
    type: 'sine',
    duration: 0.06,
    startVolume: 0.08,
  });
}

// 3. Scan module Sweep sound (radar frequency sweep)
export function playSweep() {
  if (!enabled) return;
  const ctx = initAudio();
  if (!ctx || ctx.state === 'suspended') return;

  try {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    // Exponential sweep up to 450Hz over 0.6 seconds
    osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.6);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.6);

    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (err) {
    console.warn('Audio sweep synthesis failed:', err);
  }
}

// 4. Scan successful resolved sound (happy arcade/high-tech chime)
export function playChime() {
  if (!enabled) return;
  const ctx = initAudio();
  if (!ctx || ctx.state === 'suspended') return;

  try {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Ascending arpeggio)
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);

      gainNode.gain.setValueAtTime(0.08, now + i * 0.07);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.25);
    });
  } catch (err) {
    console.warn('Audio chime synthesis failed:', err);
  }
}

// 5. Warning / Error / Halted sound (scary low sawtooth warning)
export function playError() {
  playTone({
    frequency: 180,
    frequencyEnd: 70,
    type: 'sawtooth',
    duration: 0.35,
    startVolume: 0.12,
  });
}
