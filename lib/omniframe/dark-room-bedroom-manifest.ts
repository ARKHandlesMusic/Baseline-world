export type DarkRoomCameraPresetId =
  | 'dark-room-choreographed-tour'
  | 'phone-glow-hero-closeup'
  | 'desk-setup-closeup'
  | 'bed-window-posters-overview'
  | 'sofa-news-tv-window-closeup'
  | 'rigged-bedroom-door-closeup'
  | 'dark-room-wide-overview';

export type DarkRoomLightModeId =
  | 'full-bedroom-lit'
  | 'cozy-lamp-and-phone'
  | 'midnight-neon-and-phone';

export type PhoneGlowColorModeId =
  | 'auto-ui-sync'
  | 'electric-cyan'
  | 'neon-magenta'
  | 'emerald-matrix';

export type BedroomDoorControlMode =
  | 'timeline-auto'
  | 'manual-open'
  | 'manual-closed'
  | 'turn-handle-only';

export interface DarkRoomAssetRow {
  id: string;
  assetName: string;
  requestedQuantity: string;
  builtQuantity: number;
  category:
    | 'architecture'
    | 'furniture'
    | 'hero-phone-glow'
    | 'tech-desk'
    | 'props'
    | 'decor-lighting'
    | 'atmosphere';
  description: string;
}

/**
 * Bedroom Asset Manifest (with full room lighting & zero chip packets).
 */
export const DARK_ROOM_ASSET_TABLE: DarkRoomAssetRow[] = [
  {
    id: 'dark-room-asset-01',
    assetName: 'Bedroom shell',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'architecture',
    description:
      'Enclosed 7.2m × 5.8m × 3.2m bedroom architectural shell with baseboards, crown molding, ceiling ring light & 4 recessed downlights.',
  },
  {
    id: 'dark-room-asset-02',
    assetName: 'Floor and walls',
    requestedQuantity: '1 set',
    builtQuantity: 1,
    category: 'architecture',
    description:
      '1 complete set: warm smoked-walnut hardwood plank floor + 4 architectural bedroom walls with wainscoting.',
  },
  {
    id: 'dark-room-asset-03',
    assetName: 'Bed',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'furniture',
    description:
      'Low-profile walnut & matte-black platform bed frame with upholstered headboard panels, footboard, side rails & bedside sconce.',
  },
  {
    id: 'dark-room-asset-04',
    assetName: 'Blanket and pillow',
    requestedQuantity: '1 set',
    builtQuantity: 1,
    category: 'furniture',
    description:
      '1 complete bedding set: fitted mattress sheet, sculpted quilted duvet blanket with natural folds & 3 plush pillows.',
  },
  {
    id: 'dark-room-asset-05',
    assetName: 'Desk',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'furniture',
    description:
      '1.86m × 0.82m × 0.76m dark oak creator desk with brushed-steel legs, 3-drawer side cabinet & stitched desk mat.',
  },
  {
    id: 'dark-room-asset-06',
    assetName: 'Chair',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'furniture',
    description:
      'Ergonomic studio swivel chair with 5-star caster wheel base, hydraulic cylinder, contoured bucket seat, armrests & lumbar pillow.',
  },
  {
    id: 'dark-room-asset-07',
    assetName: 'Smartphone',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'hero-phone-glow',
    description:
      'Precision chamfered titanium-black smartphone on the desk with triple-lens camera module, side buttons & USB-C port.',
  },
  {
    id: 'dark-room-asset-08',
    assetName: 'Phone screen/UI',
    requestedQuantity: '1 interface',
    builtQuantity: 1,
    category: 'hero-phone-glow',
    description:
      '60fps animated OLED UI screen + accent lighting rig: casts real-time cyan/magenta key light & subtle screen glow.',
  },
  {
    id: 'dark-room-asset-09',
    assetName: 'Computer monitor',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'tech-desk',
    description:
      '27-inch widescreen studio monitor on an adjustable V-stand displaying a live DAW audio timeline & emitting screen light.',
  },
  {
    id: 'dark-room-asset-10',
    assetName: 'Keyboard',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'tech-desk',
    description:
      'Tenkeyless mechanical keyboard with individual sculpted keycap rows, spacebar, wrist rest & subtle RGB edge underglow.',
  },
  {
    id: 'dark-room-asset-11',
    assetName: 'Mouse',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'tech-desk',
    description:
      'Ergonomic wireless gaming mouse with illuminated scroll wheel & thumb buttons resting cleanly on the desk mat.',
  },
  {
    id: 'dark-room-asset-12',
    assetName: 'Water bottle',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'props',
    description:
      'Translucent sapphire-tinted hydration bottle with screw cap, carry loop & visible internal water column.',
  },
  {
    id: 'dark-room-asset-13',
    assetName: 'Desk lamp',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'decor-lighting',
    description:
      'Articulated twin-arm architect desk lamp with weighted base, spring joints, conical shade & active warm task illumination.',
  },
  {
    id: 'dark-room-asset-14',
    assetName: 'Window',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'architecture',
    description:
      'Recessed casement bedroom window on the West wall overlooking the glowing night-city skyline & casting moonlight into the room.',
  },
  {
    id: 'dark-room-asset-15',
    assetName: 'Curtains/blinds',
    requestedQuantity: '1 set',
    builtQuantity: 1,
    category: 'decor-lighting',
    description:
      '1 complete window treatment set: slatted Venetian blinds with tilt wand + twin velvet side curtains on a steel rod.',
  },
  {
    id: 'dark-room-asset-16',
    assetName: 'Wall posters',
    requestedQuantity: '2–3',
    builtQuantity: 3,
    category: 'decor-lighting',
    description:
      '3 custom-illustrated framed bedroom wall posters ("OMNIFRAME CYBER TOUR", "CRACK & SONS MIDNIGHT", "LO-FI DRIFT").',
  },
  {
    id: 'dark-room-asset-17',
    assetName: 'Sunglasses',
    requestedQuantity: '1 pair',
    builtQuantity: 1,
    category: 'props',
    description:
      '1 pair of dark-tinted aviator sunglasses with gold bridge, nose pads & open temples resting beside the smartphone.',
  },
  {
    id: 'dark-room-asset-18',
    assetName: 'Room door',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'architecture',
    description:
      'Rigged 6-panel bedroom door with rotatable lever handle, retracting mortise latch bolt, 3 hinges & warm hallway light spill.',
  },
  {
    id: 'dark-room-asset-19',
    assetName: 'Ambient dust',
    requestedQuantity: '1 reusable effect',
    builtQuantity: 1,
    category: 'atmosphere',
    description:
      'Reusable 120-mote volumetric dust system floating through the room lights, desk lamp beam & smartphone glow.',
  },
  {
    id: 'dark-room-asset-20',
    assetName: 'Sofa',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'furniture',
    description:
      'Plush 3-seater modern lounge sofa with tufted cushions, armrests, throw pillows & tapered walnut legs facing the News TV.',
  },
  {
    id: 'dark-room-asset-21',
    assetName: 'TV playing the news',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'tech-desk',
    description:
      '55-inch widescreen smart TV on a media console playing a live 60fps breaking-news anchor broadcast with scrolling news ticker.',
  },
  {
    id: 'dark-room-asset-22',
    assetName: 'Lounge window',
    requestedQuantity: '1',
    builtQuantity: 1,
    category: 'architecture',
    description:
      'Framed picture window adjacent to the sofa and News TV with glass panes & exterior twilight view port (ready for future scene).',
  },
];

export interface DeskSurfacePropPlacement {
  id: string;
  label: string;
  category:
    | 'smartphone'
    | 'monitor'
    | 'keyboard'
    | 'mouse'
    | 'water-bottle'
    | 'desk-lamp'
    | 'sunglasses';
  /** World X, Y (bottom resting surface), Z */
  position: [number, number, number];
  /** Bounding footprint [halfWidthX, heightY, halfDepthZ] in meters */
  bounds: [number, number, number];
  rotationY: number;
}

/**
 * Authoritative Desk Geometry Constants:
 * Desk top surface is at y = 0.76m (centerX = -0.35, centerZ = -2.18, width = 1.86m, depth = 0.82m).
 */
export const DARK_ROOM_DESK_SPEC = {
  centerX: -0.35,
  centerZ: -2.18,
  topSurfaceY: 0.76,
  deskMatTopY: 0.765,
  width: 1.86,
  depth: 0.82,
  thickness: 0.045,
};

/**
 * Authoritative placement table for all desktop props (with chips packets & snack pieces removed).
 */
export const DARK_ROOM_DESK_PROP_PLACEMENTS: DeskSurfacePropPlacement[] = [
  {
    id: 'hero-smartphone-01',
    label: 'Hero Smartphone & 60fps Glowing OLED UI',
    category: 'smartphone',
    position: [-0.02, 0.765, -1.94],
    bounds: [0.048, 0.014, 0.092],
    rotationY: -0.22,
  },
  {
    id: 'sunglasses-pair-01',
    label: 'Dark-Tinted Cyber Aviator Sunglasses (Reflecting Phone & Lamp Glow)',
    category: 'sunglasses',
    position: [-0.22, 0.765, -1.91],
    bounds: [0.082, 0.048, 0.075],
    rotationY: 0.35,
  },
  {
    id: 'keyboard-mech-01',
    label: 'Tenkeyless Mechanical Keyboard with RGB Underglow',
    category: 'keyboard',
    position: [-0.54, 0.765, -2.02],
    bounds: [0.185, 0.036, 0.078],
    rotationY: 0.03,
  },
  {
    id: 'mouse-wireless-01',
    label: 'Wireless Gaming Mouse with Illuminated Scroll Wheel',
    category: 'mouse',
    position: [-0.21, 0.765, -2.09],
    bounds: [0.038, 0.038, 0.065],
    rotationY: -0.08,
  },
  {
    id: 'computer-monitor-01',
    label: '27-Inch Widescreen Studio Monitor on V-Stand',
    category: 'monitor',
    position: [-0.48, 0.76, -2.38],
    bounds: [0.33, 0.46, 0.12],
    rotationY: 0.05,
  },
  {
    id: 'water-bottle-01',
    label: 'Sapphire Hydrate Sports Water Bottle with Meniscus',
    category: 'water-bottle',
    position: [0.24, 0.76, -2.22],
    bounds: [0.046, 0.25, 0.046],
    rotationY: 0.5,
  },
  {
    id: 'desk-lamp-01',
    label: 'Articulated Architect Desk Lamp (Active Warm Task Light)',
    category: 'desk-lamp',
    position: [-1.06, 0.76, -2.36],
    bounds: [0.11, 0.54, 0.11],
    rotationY: 0.58,
  },
];

/**
 * Validates that all desktop props sit cleanly within the desk boundaries
 * at or above the desk surface (y >= 0.76m) and have zero horizontal AABB overlaps.
 */
export function validateDarkRoomSpatialClearance(): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  const deskMinX =
    DARK_ROOM_DESK_SPEC.centerX - DARK_ROOM_DESK_SPEC.width / 2 + 0.02;
  const deskMaxX =
    DARK_ROOM_DESK_SPEC.centerX + DARK_ROOM_DESK_SPEC.width / 2 - 0.02;
  const deskMinZ =
    DARK_ROOM_DESK_SPEC.centerZ - DARK_ROOM_DESK_SPEC.depth / 2 + 0.02;
  const deskMaxZ =
    DARK_ROOM_DESK_SPEC.centerZ + DARK_ROOM_DESK_SPEC.depth / 2 - 0.02;

  for (const prop of DARK_ROOM_DESK_PROP_PLACEMENTS) {
    const [x, y, z] = prop.position;
    const [hx, , hz] = prop.bounds;
    if (y < DARK_ROOM_DESK_SPEC.topSurfaceY - 0.002) {
      violations.push(
        `${prop.id} base y=${y.toFixed(3)}m phases below desk top surface (${DARK_ROOM_DESK_SPEC.topSurfaceY}m)`,
      );
    }
    if (
      x - hx < deskMinX ||
      x + hx > deskMaxX ||
      z - hz < deskMinZ ||
      z + hz > deskMaxZ
    ) {
      violations.push(
        `${prop.id} extends outside desk top bounds: x=${x.toFixed(2)}, z=${z.toFixed(2)}`,
      );
    }
  }

  for (let i = 0; i < DARK_ROOM_DESK_PROP_PLACEMENTS.length; i++) {
    for (let j = i + 1; j < DARK_ROOM_DESK_PROP_PLACEMENTS.length; j++) {
      const a = DARK_ROOM_DESK_PROP_PLACEMENTS[i];
      const b = DARK_ROOM_DESK_PROP_PLACEMENTS[j];
      const overlapX =
        Math.abs(a.position[0] - b.position[0]) <
        a.bounds[0] + b.bounds[0] - 0.01;
      const overlapZ =
        Math.abs(a.position[2] - b.position[2]) <
        a.bounds[2] + b.bounds[2] - 0.01;
      if (overlapX && overlapZ) {
        violations.push(`Desktop prop overlap between ${a.id} and ${b.id}`);
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

export type PhoneUiScreenSceneId =
  | 'incoming-call-pulse'
  | 'music-visualizer-drop'
  | 'midnight-alert-surge';

export interface PhoneScreenGlowState {
  screenSceneId: PhoneUiScreenSceneId;
  screenHeadline: string;
  screenSubtext: string;
  clockTimeText: string;
  batteryPercent: number;
  primaryColorHex: string;
  secondaryColorHex: string;
  keyLightIntensity: number;
  bounceLightIntensity: number;
  volumetricConeOpacity: number;
  surfaceHaloOpacity: number;
  equalizerBars: number[];
  notificationPulse01: number;
  ringRippleRadius01: number;
}

/**
 * Deterministic 60fps evaluator for the Smartphone Screen/UI and its Lighting Rig.
 */
export function evaluatePhoneScreenGlowAtFrame(params: {
  frame: number;
  fps?: number;
  colorMode?: PhoneGlowColorModeId;
  glowMultiplier?: number;
}): PhoneScreenGlowState {
  const safeFrame = Math.max(0, params.frame);
  const fps = Math.max(1, params.fps ?? 60);
  const colorMode = params.colorMode ?? 'auto-ui-sync';
  const glowMult = Math.max(0.2, Math.min(2.5, params.glowMultiplier ?? 1.25));
  const t = safeFrame / fps;

  const cycleFrames = 360;
  const localFrame = safeFrame % cycleFrames;
  const sceneIndex = Math.floor(localFrame / 120);
  const localProgress = (localFrame % 120) / 120;

  // 120 BPM rhythmic beat pulse (2 Hz)
  const beatPulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 4.0);
  const fastRipple = (t * 1.6) % 1;

  const equalizerBars = Array.from({length: 12}, (_, idx) => {
    const v =
      0.25 +
      0.45 * Math.abs(Math.sin(t * 7.5 + idx * 0.65)) +
      0.3 * Math.abs(Math.cos(t * 4.2 - idx * 0.4));
    return Math.min(1, v);
  });

  let screenSceneId: PhoneUiScreenSceneId = 'incoming-call-pulse';
  let screenHeadline = 'INCOMING CALL • CRACK & SONS';
  let screenSubtext = 'SWIPE TO UNLOCK THE MIDNIGHT DROP';
  let autoPrimaryHex = '#22D3EE'; // Electric Cyan
  let autoSecondaryHex = '#38BDF8';

  if (sceneIndex === 1) {
    screenSceneId = 'music-visualizer-drop';
    screenHeadline = 'NOW PLAYING: OMNIFRAME 02:14 AM';
    screenSubtext = 'BASS BOOST +12dB • HI-RES AUDIO';
    autoPrimaryHex = '#E879F9'; // Neon Magenta-Violet
    autoSecondaryHex = '#22D3EE';
  } else if (sceneIndex === 2) {
    screenSceneId = 'midnight-alert-surge';
    screenHeadline = 'NEW MESSAGE: "MEET AT MAIN ST!"';
    screenSubtext = 'SCREEN GLOW SURGE • 100% NIT PEAK';
    autoPrimaryHex = '#38BDF8';
    autoSecondaryHex = '#A855F7';
  }

  let primaryColorHex = autoPrimaryHex;
  let secondaryColorHex = autoSecondaryHex;

  if (colorMode === 'electric-cyan') {
    primaryColorHex = '#22D3EE';
    secondaryColorHex = '#38BDF8';
  } else if (colorMode === 'neon-magenta') {
    primaryColorHex = '#F472B6';
    secondaryColorHex = '#C084FC';
  } else if (colorMode === 'emerald-matrix') {
    primaryColorHex = '#34D399';
    secondaryColorHex = '#2DD4BF';
  }

  const baseKeyIntensity =
    (sceneIndex === 2 ? 4.8 : 4.2) +
    beatPulse * 1.1 +
    Math.sin(localProgress * Math.PI) * 0.45;
  const keyLightIntensity = baseKeyIntensity * glowMult;
  const bounceLightIntensity = (1.85 + beatPulse * 0.55) * glowMult;
  const volumetricConeOpacity = Math.min(
    0.18,
    (0.08 + beatPulse * 0.04) * Math.min(1.5, glowMult),
  );
  const surfaceHaloOpacity = Math.min(
    0.32,
    (0.16 + beatPulse * 0.06) * Math.min(1.5, glowMult),
  );

  return {
    screenSceneId,
    screenHeadline,
    screenSubtext,
    clockTimeText: '02:14',
    batteryPercent: 94,
    primaryColorHex,
    secondaryColorHex,
    keyLightIntensity,
    bounceLightIntensity,
    volumetricConeOpacity,
    surfaceHaloOpacity,
    equalizerBars,
    notificationPulse01: beatPulse,
    ringRippleRadius01: fastRipple,
  };
}

export interface BedroomDoorRigState {
  handleTurnAngleRad: number;
  latchRetractionMeters: number;
  doorSwingAngleRad: number;
  hallwayLightIntensity: number;
  phaseLabel: string;
}

function smoothstep01(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
}

/**
 * Deterministic mechanical rig evaluator for the Bedroom Room Door (1) + Lever Handle.
 */
export function evaluateDarkRoomDoorRigAtFrame(params: {
  frame: number;
  fps?: number;
  mode?: BedroomDoorControlMode;
}): BedroomDoorRigState {
  const safeFrame = Math.max(0, params.frame);
  const fps = Math.max(1, params.fps ?? 60);
  const mode = params.mode ?? 'timeline-auto';
  const t = safeFrame / fps;

  const MAX_HANDLE_RAD = 0.66; // ~38 degrees downward lever turn
  const MAX_LATCH_METERS = 0.024; // 24mm latch bolt retraction
  const MAX_DOOR_SWING_RAD = 1.02; // ~58 degrees inward swing

  if (mode === 'manual-closed') {
    return {
      handleTurnAngleRad: 0,
      latchRetractionMeters: 0,
      doorSwingAngleRad: 0,
      hallwayLightIntensity: 0.45,
      phaseLabel: 'Bedroom Door Closed & Latched (0°)',
    };
  }

  if (mode === 'turn-handle-only') {
    const frac = 0.88 + 0.12 * Math.cos(t * Math.PI * 2);
    return {
      handleTurnAngleRad: frac * MAX_HANDLE_RAD,
      latchRetractionMeters: frac * MAX_LATCH_METERS,
      doorSwingAngleRad: 0,
      hallwayLightIntensity: 0.6,
      phaseLabel: 'Turning Bedroom Door Handle (38°) & Retracting Latch Bolt',
    };
  }

  if (mode === 'manual-open') {
    return {
      handleTurnAngleRad: 0.22 * MAX_HANDLE_RAD,
      latchRetractionMeters: 0.22 * MAX_LATCH_METERS,
      doorSwingAngleRad: MAX_DOOR_SWING_RAD,
      hallwayLightIntensity: 2.8,
      phaseLabel: 'Bedroom Door Swung Open (58°) • Warm Hallway Spill Active',
    };
  }

  // 'timeline-auto': subtle crack open cycle so hallway rim light interacts with room
  const cycleFrames = 300;
  const u = (safeFrame % cycleFrames) / cycleFrames;
  let handleFrac = 0;
  let doorFrac = 0.22;
  let phaseLabel = 'Bedroom Door Slightly Ajar (Hallway Warm Light Spill)';

  if (u < 0.15) {
    handleFrac = smoothstep01(u / 0.15);
    doorFrac = 0.22;
    phaseLabel = '1. Turning Bedroom Door Handle (38°)';
  } else if (u < 0.45) {
    const s = (u - 0.15) / 0.3;
    doorFrac = 0.22 + 0.78 * smoothstep01(s);
    handleFrac = 1 - smoothstep01(Math.max(0, (s - 0.3) / 0.7));
    phaseLabel = '2. Swinging Bedroom Door Open (58°)';
  } else if (u < 0.7) {
    doorFrac = 1.0;
    handleFrac = 0;
    phaseLabel = '3. Bedroom Door Open (58°)';
  } else {
    const c = (u - 0.7) / 0.3;
    doorFrac = 1.0 - 0.78 * smoothstep01(c);
    handleFrac = c > 0.7 ? Math.sin(((c - 0.7) / 0.3) * Math.PI) * 0.5 : 0;
    phaseLabel = '4. Closing Bedroom Door to Night Crack';
  }

  return {
    handleTurnAngleRad: handleFrac * MAX_HANDLE_RAD,
    latchRetractionMeters: handleFrac * MAX_LATCH_METERS,
    doorSwingAngleRad: doorFrac * MAX_DOOR_SWING_RAD,
    hallwayLightIntensity: 0.65 + doorFrac * 2.15,
    phaseLabel,
  };
}

export interface DarkRoomDustMoteSpec {
  id: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  driftX: number;
  driftZ: number;
  speedY: number;
  phase: number;
  size: number;
}

export function generateDarkRoomDustMotes(count = 120): DarkRoomDustMoteSpec[] {
  const motes: DarkRoomDustMoteSpec[] = [];
  for (let i = 0; i < count; i++) {
    const seed1 = Math.sin(i * 19.73 + 0.4) * 10000;
    const r1 = seed1 - Math.floor(seed1);
    const seed2 = Math.sin(i * 47.11 + 1.9) * 10000;
    const r2 = seed2 - Math.floor(seed2);
    const seed3 = Math.sin(i * 83.29 + 3.2) * 10000;
    const r3 = seed3 - Math.floor(seed3);

    const nearPhone = i < count * 0.4;
    const baseX = nearPhone ? -0.35 + (r1 - 0.5) * 1.35 : -2.9 + r1 * 5.8;
    const baseY = nearPhone ? 0.82 + r2 * 1.45 : 0.35 + r2 * 2.55;
    const baseZ = nearPhone ? -2.05 + (r3 - 0.5) * 1.15 : -2.4 + r3 * 4.8;

    motes.push({
      id: i,
      baseX,
      baseY,
      baseZ,
      driftX: 0.05 + (i % 5) * 0.018,
      driftZ: 0.05 + (i % 4) * 0.018,
      speedY: 0.035 + (i % 6) * 0.012,
      phase: (i * 0.57) % (Math.PI * 2),
      size: nearPhone ? 0.012 + (i % 3) * 0.003 : 0.01 + (i % 4) * 0.003,
    });
  }
  return motes;
}

export function evaluateDarkRoomDustMoteAtFrame(
  mote: DarkRoomDustMoteSpec,
  frame: number,
  fps = 60,
): {
  x: number;
  y: number;
  z: number;
  scale: number;
  phoneGlowFactor: number;
} {
  const t = Math.max(0, frame) / Math.max(1, fps);
  const x = mote.baseX + Math.sin(t * 1.15 + mote.phase) * mote.driftX;
  const z = mote.baseZ + Math.cos(t * 0.95 + mote.phase * 1.3) * mote.driftZ;
  const rawY = mote.baseY + t * mote.speedY;
  const y = 0.35 + ((rawY - 0.35) % 2.45);

  const dx = x - -0.02;
  const dz = z - -1.94;
  const horizDist = Math.hypot(dx, dz);
  const coneRadiusAtY = 0.14 + Math.max(0, y - 0.76) * 0.55;
  const insidePhoneCone =
    y >= 0.76 && y <= 2.45 && horizDist <= coneRadiusAtY
      ? 1 - horizDist / coneRadiusAtY
      : 0;

  const twinkle = 0.55 + 0.45 * Math.abs(Math.sin(t * 3.0 + mote.phase));
  const scale = (0.72 + insidePhoneCone * 0.85) * twinkle;

  return {
    x,
    y,
    z,
    scale,
    phoneGlowFactor: insidePhoneCone,
  };
}

export interface DarkRoomCameraTransform {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  shotLabel: string;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Deterministic 60fps camera choreography inside the 7.2m × 5.8m × 3.2m Bedroom.
 * Starts at Frame 0 with a sweeping medium-wide establishing view of the illuminated room
 * (Bed, Desk, Chair, Monitor, Lit Desk Lamp, Glowing Smartphone, Window Blinds & Wall Posters).
 */
export function computeDarkRoomCameraTransformAtFrame(
  frame: number,
  preset: DarkRoomCameraPresetId,
): DarkRoomCameraTransform {
  const safeFrame = Math.max(0, frame);
  const t = (safeFrame % 480) / 480;

  if (preset === 'phone-glow-hero-closeup') {
    const angle = (t - 0.5) * 0.55;
    return {
      position: [
        -0.02 + Math.sin(angle) * 0.58,
        1.14 + Math.sin(t * Math.PI * 2) * 0.04,
        -1.26,
      ],
      target: [-0.14, 0.81, -1.96],
      fov: 40,
      shotLabel:
        'Hero Smartphone OLED Screen Glow, Sunglasses, Mechanical Keyboard & Water Bottle',
    };
  }

  if (preset === 'desk-setup-closeup') {
    return {
      position: [0.35 + Math.sin(t * Math.PI * 2) * 0.28, 1.38, -0.88],
      target: [-0.32, 0.92, -2.14],
      fov: 44,
      shotLabel:
        'Creator Desk Setup: Smartphone Glow, Monitor, Mechanical Keyboard, Mouse, Lit Desk Lamp & Water Bottle',
    };
  }

  if (preset === 'bed-window-posters-overview') {
    return {
      position: [-0.65 + Math.cos(t * Math.PI * 2) * 0.35, 1.72, 1.85],
      target: [0.55, 1.15, -1.05],
      fov: 48,
      shotLabel:
        'Platform Bed, Quilted Blanket & Pillows, Venetian Window Blinds, Curtains & 3 Wall Posters',
    };
  }

  if (preset === 'sofa-news-tv-window-closeup') {
    return {
      position: [0.25 + Math.sin(t * Math.PI * 2) * 0.18, 1.55, 0.35],
      target: [-1.65, 1.08, 2.15],
      fov: 46,
      shotLabel:
        'Plush Lounge Sofa (1), 55" TV Playing Live Breaking News (1) & Adjacent Lounge Window (1)',
    };
  }

  if (preset === 'rigged-bedroom-door-closeup') {
    return {
      position: [0.65, 1.38, 0.82],
      target: [1.95, 1.12, 2.65],
      fov: 42,
      shotLabel:
        'Rigged 6-Panel Bedroom Door: Articulated Handle, Latch Bolt & Warm Hallway Light Spill',
    };
  }

  if (preset === 'dark-room-wide-overview') {
    return {
      position: [-0.95 + Math.sin(t * Math.PI * 2) * 0.45, 2.02, 2.15],
      target: [0.15, 1.02, -1.25],
      fov: 52,
      shotLabel:
        'Illuminated Bedroom Master Wide Overview — All 19 Asset Categories, Room Lights & Phone Glow',
    };
  }

  // Default: 'dark-room-choreographed-tour'
  // Shot 1 (0..160): Wide-to-Medium Establishing Glide showing the Illuminated Bedroom (Bed, Desk, Chair, Lamp, Monitor, Phone Glow, Posters)
  if (safeFrame < 160) {
    const u = smoothstep01(safeFrame / 160);
    return {
      position: [
        lerp(-1.15, -0.25, u),
        lerp(1.88, 1.32, u),
        lerp(1.85, -0.78, u),
      ],
      target: [
        lerp(0.25, -0.22, u),
        lerp(1.05, 0.88, u),
        lerp(-1.25, -2.05, u),
      ],
      fov: 48,
      shotLabel:
        'Shot 1: Illuminated Bedroom Establishing Glide -> Creator Desk, Lamp & Smartphone Glow',
    };
  }

  // Shot 2 (160..320): Close-up sweep across the Smartphone OLED Screen, Sunglasses, Keyboard, Monitor & Water Bottle
  if (safeFrame < 320) {
    const u = smoothstep01((safeFrame - 160) / 160);
    return {
      position: [
        lerp(-0.25, 0.55, u),
        lerp(1.32, 1.24, u),
        lerp(-0.78, -1.05, u),
      ],
      target: [
        lerp(-0.22, -0.12, u),
        lerp(0.88, 0.84, u),
        lerp(-2.05, -1.98, u),
      ],
      fov: 42,
      shotLabel:
        'Shot 2: Smartphone Screen/UI Glow, Sunglasses, Mechanical Keyboard, Monitor & Water Bottle',
    };
  }

  // Shot 3 (320..480): Pull back across Platform Bed, Blanket & Pillows, Window Blinds & Wall Posters
  const u = smoothstep01((safeFrame - 320) / 160);
  return {
    position: [
      lerp(0.55, -1.25, u),
      lerp(1.24, 1.85, u),
      lerp(-1.05, 1.75, u),
    ],
    target: [
      lerp(-0.12, 0.45, u),
      lerp(0.84, 1.05, u),
      lerp(-1.98, -1.15, u),
    ],
    fov: 48,
    shotLabel:
      'Shot 3: Platform Bed, Blanket/Pillows, Venetian Window Blinds, Curtains & 3 Wall Posters',
  };
}
