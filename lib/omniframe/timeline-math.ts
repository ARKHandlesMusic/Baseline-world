import {
  CAMERA_PRESETS,
  CameraPresetId,
  MAIN_STREET_SECTION_1_MANIFEST,
  SHOT_MANIFEST,
  ShotManifestEntry,
  TimeOfDayMode,
} from './asset-manifest';

export interface EvaluatedCameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  activeShot: ShotManifestEntry;
  shotProgress: number;
}

export interface EvaluatedDayNightState {
  mode: TimeOfDayMode;
  nightFactor: number; // 0.0 = Full Sunny Day, 0.5 = Sunset/Dawn Twilight, 1.0 = Full Starry Night
  sunDirection: [number, number, number];
  moonDirection: [number, number, number];
  phaseLabel: string;
}

export interface EvaluatedHalftoneState {
  beatIndex: number;
  beatPhase: number;
  pulseIntensity: number;
  innerCircleScale: number;
  outerCircleFalloff: number;
  spikeRotationRad: number;
  shoutBannerActive: boolean;
}

/**
 * Clamp a numeric value to [min, max].
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Smoothstep interpolation on [0, 1].
 */
export function smoothstep01(t: number): number {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

/**
 * Linearly interpolate between two numbers.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Convert a Remotion frame index to deterministic time in seconds: t = frame / fps.
 */
export function frameToSeconds(frame: number, fps: number): number {
  if (fps <= 0) {
    throw new Error('FPS must be positive');
  }
  const safeFrame = Math.max(0, frame);
  return safeFrame / fps;
}

/**
 * Convert a Remotion frame index to musical beat position based on BPM.
 */
export function frameToBeat(frame: number, fps: number, bpm: number): number {
  const seconds = frameToSeconds(frame, fps);
  return (seconds * bpm) / 60;
}

/**
 * Format frame and fps into SMPTE-style timecode MM:SS:FF.
 */
export function formatTimecode(frame: number, fps: number): string {
  const safeFrame = Math.max(0, Math.floor(frame));
  const totalSeconds = Math.floor(safeFrame / fps);
  const ff = safeFrame % fps;
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}:${String(ff).padStart(2, '0')}`;
}

/**
 * Look up the active shot from SHOT_MANIFEST for any requested frame.
 */
export function evaluateShotForFrame(frame: number): {
  shot: ShotManifestEntry;
  localProgress: number;
} {
  const totalFrames = MAIN_STREET_SECTION_1_MANIFEST.durationInFrames;
  const wrappedFrame = clamp(Math.floor(frame), 0, totalFrames - 1);

  for (const shot of SHOT_MANIFEST) {
    if (wrappedFrame >= shot.startFrame && wrappedFrame <= shot.endFrame) {
      const span = Math.max(1, shot.endFrame - shot.startFrame);
      const rawProgress = (wrappedFrame - shot.startFrame) / span;
      return {
        shot,
        localProgress: smoothstep01(rawProgress),
      };
    }
  }

  const fallback = SHOT_MANIFEST[SHOT_MANIFEST.length - 1];
  return {
    shot: fallback,
    localProgress: 1,
  };
}

/**
 * Compute a smooth, continuous 3D Aerial Drone Flyover trajectory sweeping over the entire interconnected city grid:
 * - Sweeps down Central Main Avenue past the storefronts, wrought-iron balconies, and pole-to-pole utility cables
 * - Climbs and banks over the 4-Way Intersection at 2nd St North (Z = -24.5m)
 * - Cruises over 2nd St Cross-Street and West Grand Boulevard (X = -56m)
 * - Arcs high above the Northern city blocks and East Grand Boulevard (X = +56m)
 * - Swoops back into Central Avenue for a seamless loop
 */
export function computeDroneFlyoverAtFrame(
  frame: number,
  durationInFrames = MAIN_STREET_SECTION_1_MANIFEST.durationInFrames,
): {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
} {
  const total = Math.max(1, durationInFrames);
  const normalizedT = (((frame % total) + total) % total) / total;

  const waypoints: Array<{
    pos: [number, number, number];
    look: [number, number, number];
    fov: number;
  }> = [
    // 0.00: Launch above Southern Central Avenue looking down the canyon & North intersection
    {pos: [0.0, 14.5, 42.0], look: [0.0, 2.8, -24.5], fov: 46},
    // 0.25: Bank above the North 4-Way Intersection (Central Ave & 2nd St N) looking West along Cross-Street
    {pos: [12.0, 22.0, -8.0], look: [-24.0, 2.2, -24.5], fov: 48},
    // 0.50: High aerial sweep above West Grand Boulevard & 2nd St N looking across the city blocks
    {pos: [-42.0, 32.0, -18.0], look: [12.0, 3.0, -36.0], fov: 50},
    // 0.75: Panoramic arc over East Grand Boulevard & Northern Cross-Streets looking back toward Central Ave
    {pos: [40.0, 29.0, -14.0], look: [-8.0, 2.5, -24.5], fov: 48},
    // 1.00: Seamless loop back to Southern Central Avenue approach
    {pos: [0.0, 14.5, 42.0], look: [0.0, 2.8, -24.5], fov: 46},
  ];

  const segCount = waypoints.length - 1;
  const scaled = normalizedT * segCount;
  const segIdx = Math.min(segCount - 1, Math.floor(scaled));
  const localU = smoothstep01(scaled - segIdx);

  const w0 = waypoints[segIdx];
  const w1 = waypoints[segIdx + 1];

  return {
    position: [
      lerp(w0.pos[0], w1.pos[0], localU),
      lerp(w0.pos[1], w1.pos[1], localU),
      lerp(w0.pos[2], w1.pos[2], localU),
    ],
    target: [
      lerp(w0.look[0], w1.look[0], localU),
      lerp(w0.look[1], w1.look[1], localU),
      lerp(w0.look[2], w1.look[2], localU),
    ],
    fov: lerp(w0.fov, w1.fov, localU),
  };
}

/**
 * Deterministic Day / Night Cycle state evaluator for any frame and TimeOfDayMode ('day' | 'night' | 'auto-cycle').
 */
export function computeDayNightCycleState(
  frame: number,
  durationInFrames = MAIN_STREET_SECTION_1_MANIFEST.durationInFrames,
  mode: TimeOfDayMode = 'day',
): EvaluatedDayNightState {
  if (mode === 'day') {
    return {
      mode,
      nightFactor: 0.0,
      sunDirection: [0.04, 0.28, -0.959],
      moonDirection: [-0.18, -0.45, -0.875],
      phaseLabel: 'Sunny Day (IRL Blue Sky)',
    };
  }

  if (mode === 'night') {
    return {
      mode,
      nightFactor: 1.0,
      sunDirection: [0.04, -0.42, -0.906],
      moonDirection: [-0.14, 0.32, -0.937],
      phaseLabel: 'Starry Night (Full Moon & City Lights)',
    };
  }

  // 'auto-cycle': Smooth diurnal cycle across the composition duration:
  // 0.00..0.25 -> Bright Sunny Day (nightFactor = 0)
  // 0.25..0.45 -> Sunset Golden Hour transition (nightFactor 0 -> 1)
  // 0.45..0.78 -> Starry Lo-Fi Night with Full Moon & Glowing Windows (nightFactor = 1)
  // 0.78..1.00 -> Dawn Sunrise transition back to Day (nightFactor 1 -> 0)
  const total = Math.max(1, durationInFrames);
  const progress = (((frame % total) + total) % total) / total;

  let nightFactor = 0.0;
  let phaseLabel = 'DayCycle • Midday Sun';

  if (progress < 0.25) {
    nightFactor = 0.0;
    phaseLabel = 'Day/Night Cycle • Sunny Day';
  } else if (progress < 0.45) {
    nightFactor = smoothstep01((progress - 0.25) / 0.2);
    phaseLabel =
      nightFactor < 0.55
        ? 'Day/Night Cycle • Golden Sunset'
        : 'Day/Night Cycle • Twilight Dusk';
  } else if (progress < 0.78) {
    nightFactor = 1.0;
    phaseLabel = 'Day/Night Cycle • Starry Night';
  } else {
    nightFactor = 1.0 - smoothstep01((progress - 0.78) / 0.22);
    phaseLabel =
      nightFactor > 0.45
        ? 'Day/Night Cycle • Dawn Break'
        : 'Day/Night Cycle • Morning Sun';
  }

  // Sun elevation arcs from +0.32 (Day) down through +0.04 (Sunset/Dawn) to -0.35 (Night)
  const sunY = lerp(0.3, -0.32, nightFactor);
  const sunX = Math.sin(progress * Math.PI * 2) * 0.35;
  const sunZ = -0.92;
  const sunLen = Math.hypot(sunX, sunY, sunZ) || 1;

  // Moon rises high (+0.34) as nightFactor approaches 1.0
  const moonY = lerp(-0.3, 0.34, nightFactor);
  const moonX = -sunX * 0.65 - 0.12;
  const moonZ = -0.92;
  const moonLen = Math.hypot(moonX, moonY, moonZ) || 1;

  return {
    mode,
    nightFactor,
    sunDirection: [sunX / sunLen, sunY / sunLen, sunZ / sunLen],
    moonDirection: [moonX / moonLen, moonY / moonLen, moonZ / moonLen],
    phaseLabel,
  };
}

/**
 * Compute the deterministic 3D camera transform at a given Remotion frame and camera preset mode.
 */
export function computeCameraTransformAtFrame(
  frame: number,
  cameraPreset: CameraPresetId,
): EvaluatedCameraState {
  const {shot, localProgress} = evaluateShotForFrame(frame);

  if (cameraPreset === 'drone-city-flyover') {
    const drone = computeDroneFlyoverAtFrame(
      frame,
      MAIN_STREET_SECTION_1_MANIFEST.durationInFrames,
    );
    return {
      position: drone.position,
      target: drone.target,
      fov: drone.fov,
      activeShot: {
        ...shot,
        shotId: 'SHOT-DRONE-FLYOVER',
        title: 'Aerial City Drone Flyover (3 Avenues, 4 Cross-Streets & 12 Intersections)',
      },
      shotProgress: localProgress,
    };
  }

  if (cameraPreset !== 'remotion-choreographed') {
    const preset = CAMERA_PRESETS[cameraPreset];
    // Add a subtle, deterministic lo-fi breathing drift tied strictly to `frame`
    const breathAngle = (frame / MAIN_STREET_SECTION_1_MANIFEST.fps) * 0.6;
    const driftX = Math.sin(breathAngle) * 0.18;
    const driftY = Math.cos(breathAngle * 0.8) * 0.06;

    return {
      position: [
        preset.position[0] + driftX,
        preset.position[1] + driftY,
        preset.position[2],
      ],
      target: [...preset.target],
      fov: preset.fov,
      activeShot: shot,
      shotProgress: localProgress,
    };
  }

  const position: [number, number, number] = [
    lerp(shot.cameraStartPos[0], shot.cameraEndPos[0], localProgress),
    lerp(shot.cameraStartPos[1], shot.cameraEndPos[1], localProgress),
    lerp(shot.cameraStartPos[2], shot.cameraEndPos[2], localProgress),
  ];

  const target: [number, number, number] = [
    lerp(shot.targetStart[0], shot.targetEnd[0], localProgress),
    lerp(shot.targetStart[1], shot.targetEnd[1], localProgress),
    lerp(shot.targetStart[2], shot.targetEnd[2], localProgress),
  ];

  return {
    position,
    target,
    fov: shot.fov,
    activeShot: shot,
    shotProgress: localProgress,
  };
}

/**
 * Compute the radial halftone dot size at normalized distance `normalizedRadius` (0 = center, 1 = outer edge).
 * Matches the user's specification: "circles that get smaller as they go out and larger as it comes in!"
 */
export function computeHalftoneDotRadius(
  normalizedRadius: number,
  beatPulse: number,
  maxDotRadius = 0.46,
  minDotRadius = 0.04,
): number {
  const r = clamp(normalizedRadius, 0, 1);
  // Inward (r -> 0) is larger; outward (r -> 1) gets smaller
  const radialFalloff = Math.pow(1 - r, 1.35);
  const pulseFactor = 0.85 + 0.3 * clamp(beatPulse, 0, 1);
  return clamp(
    lerp(minDotRadius, maxDotRadius, radialFalloff) * pulseFactor,
    minDotRadius * 0.5,
    maxDotRadius * 1.25,
  );
}

/**
 * Deterministic evaluation of the Halftone Pop-Art Burst & Manga Speed-Line state for frame `n`.
 */
export function computeHalftoneBurstState(
  frame: number,
  fps: number,
  bpm: number,
  baseIntensity: number,
): EvaluatedHalftoneState {
  const beat = frameToBeat(frame, fps, bpm);
  const beatIndex = Math.floor(beat);
  const beatPhase = beat - beatIndex; // [0, 1)

  // Sharp attack on downbeat, exponential-like decay across the beat
  const beatEnvelope = Math.pow(1 - beatPhase, 2.2);
  const {shot} = evaluateShotForFrame(frame);

  const combinedIntensity = clamp(
    baseIntensity * 0.75 + shot.halftonePulseBoost * 0.45 + beatEnvelope * 0.25,
    0,
    1.25,
  );

  const innerCircleScale = computeHalftoneDotRadius(0.1, beatEnvelope);
  const outerCircleFalloff = computeHalftoneDotRadius(0.85, beatEnvelope);

  return {
    beatIndex,
    beatPhase,
    pulseIntensity: combinedIntensity,
    innerCircleScale,
    outerCircleFalloff,
    spikeRotationRad: frame * 0.008,
    shoutBannerActive: shot.shotId === 'SHOT-03-HALFTONE-DROP',
  };
}

/**
 * Compute the Y-elevation for a sub-part given the current exploded-view factor [0, 1].
 */
export function computeSubPartElevationY(
  baseElevationY: number,
  explodedOffsetY: number,
  explodeFactor: number,
): number {
  const t = smoothstep01(explodeFactor);
  return baseElevationY + explodedOffsetY * t;
}
