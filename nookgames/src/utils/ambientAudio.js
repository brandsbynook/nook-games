/**
 * ambientAudio.js — Procedural Brownian Noise Synthesizer (Web Audio API)
 *
 * Generates continuous Brownian (red) noise entirely in code with zero external
 * audio asset files. Brownian noise features a -6 dB/octave power dropoff, producing
 * a deep, velvety, warm sanctuary soundscape optimal for quiet focus.
 */

let audioCtx = null;
let brownBuffer = null;
let sourceNode = null;
let gainNode = null;
let filterNode = null;
let currentVolume = 0.5;
let isPlaying = false;
let fadeTimeout = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

/**
 * Procedurally generates a 5-second seamless stereo Brownian noise buffer.
 */
function createBrownianBuffer(ctx) {
  const sampleRate = ctx.sampleRate || 44100;
  const duration = 5; // 5 seconds
  const bufferSize = sampleRate * duration;
  const buffer = ctx.createBuffer(2, bufferSize, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let lastOut = 0.0;

    // Generate integrated white noise (Brownian walk)
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5; // Gain scaling
    }

    // Seamless loop smoothing: crossfade end to beginning over 200ms
    const fadeSamples = Math.floor(sampleRate * 0.2);
    for (let i = 0; i < fadeSamples; i++) {
      const progress = i / fadeSamples;
      const endSample = data[bufferSize - fadeSamples + i];
      data[i] = data[i] * progress + endSample * (1 - progress);
    }
  }

  return buffer;
}

/**
 * Starts procedural Brownian noise synthesis.
 */
export function startBrownNoise() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Clear any pending fade out
  if (fadeTimeout) {
    clearTimeout(fadeTimeout);
    fadeTimeout = null;
  }

  if (isPlaying && sourceNode) {
    // If already playing, just ensure volume is up
    setAmbientVolume(currentVolume);
    return;
  }

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  try {
    if (!brownBuffer) {
      brownBuffer = createBrownianBuffer(ctx);
    }

    // Create and configure audio nodes
    sourceNode = ctx.createBufferSource();
    sourceNode.buffer = brownBuffer;
    sourceNode.loop = true;

    // Gentle low-pass filter to sculpt soothing velvet warmth
    if (!filterNode) {
      filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(650, ctx.currentTime);
      filterNode.Q.setValueAtTime(0.5, ctx.currentTime);
    }

    if (!gainNode) {
      gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
    }

    // Connect graph: source -> filter -> gain -> destination
    sourceNode.connect(filterNode);
    filterNode.disconnect();
    filterNode.connect(gainNode);

    // Smooth fade in
    const targetGain = Math.max(0, Math.min(1, currentVolume)) * 0.35;
    gainNode.gain.cancelScheduledValues(ctx.currentTime);
    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(targetGain, 0.0001), ctx.currentTime + 0.3);

    sourceNode.start(0);
    isPlaying = true;
  } catch (err) {
    console.warn('Unable to start brown noise:', err);
  }
}

/**
 * Stops procedural Brownian noise with a smooth fade-out.
 */
export function stopBrownNoise() {
  if (!isPlaying || !sourceNode || !gainNode || !audioCtx) return;

  isPlaying = false;
  const ctx = audioCtx;

  try {
    const currentGain = gainNode.gain.value;
    gainNode.gain.cancelScheduledValues(ctx.currentTime);
    gainNode.gain.setValueAtTime(Math.max(currentGain, 0.0001), ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

    const oldSource = sourceNode;
    sourceNode = null;

    fadeTimeout = setTimeout(() => {
      try {
        oldSource.stop();
        oldSource.disconnect();
      } catch {}
      fadeTimeout = null;
    }, 300);
  } catch {
    if (sourceNode) {
      try { sourceNode.stop(); } catch {}
      sourceNode = null;
    }
  }
}

/**
 * Updates ambient noise volume level (0.0 to 1.0).
 * @param {number} level - Floating-point volume between 0.0 and 1.0
 */
export function setAmbientVolume(level) {
  const clamped = Math.max(0, Math.min(1, Number(level) || 0));
  currentVolume = clamped;

  if (gainNode && audioCtx && isPlaying) {
    const targetGain = clamped * 0.35;
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.05);
  }
}

/**
 * Returns current ambient playback state.
 */
export function isBrownNoisePlaying() {
  return isPlaying;
}
