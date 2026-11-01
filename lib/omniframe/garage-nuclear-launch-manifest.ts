export type GarageCameraPresetId =
  | 'garage-choreographed-tour'
  | 'nuke-and-trolley-hero-closeup'
  | 'garage-door-and-tracks-closeup'
  | 'clutter-shelves-tools-closeup'
  | 'countdown-signs-and-fx-closeup'
  | 'garage-wide-master-overview';

export type GarageDoorModeId =
  | 'timeline-animated'
  | 'manual-open'
  | 'manual-half-open'
  | 'manual-closed';

export type GarageLaunchModeId =
  | 'timeline-cycle'
  | 'concealed-underground'
  | 'ground-opening-emergence'
  | 'full-ignition-blast'
  | 'countdown-standby';

export type GarageLightRevealModeId =
  | 'dramatic-3-bulb-reveal'
  | 'all-lamps-full-bright'
  | 'moody-bunker-amber';

export interface GarageNuclearAssetRow {
  id: string;
  assetName: string;
  requestedQuantity: string;
  builtQuantity: number;
  notes: string;
  category:
    | 'architecture-door'
    | 'lighting'
    | 'hero-nuke-trolley'
    | 'launch-vfx'
    | 'gag-signage'
    | 'garage-clutter'
    | 'textures';
  description: string;
}

/**
 * Authoritative 24-Category Asset Manifest for the Garage & Nuclear Launch Setup.
 * Matches every row, quantity, and note from the user specification.
 */
export const GARAGE_NUCLEAR_LAUNCH_ASSET_TABLE: GarageNuclearAssetRow[] = [
  {
    id: 'garage-asset-01',
    assetName: 'Garage shell',
    requestedQuantity: '1',
    builtQuantity: 1,
    notes: 'Walls, floor and ceiling',
    category: 'architecture-door',
    description:
      '8.6m × 7.2m × 3.8m painted cinderblock garage shell with concrete slab floor, exposed ceiling rafters & wall outlet.',
  },
  {
    id: 'garage-asset-02',
    assetName: 'Garage door',
    requestedQuantity: '1',
    builtQuantity: 1,
    notes: 'Animated opening',
    category: 'architecture-door',
    description:
      '4-section articulated steel overhead garage door with frosted upper windows that rolls smoothly up along the ceiling tracks.',
  },
  {
    id: 'garage-asset-03',
    assetName: 'Door tracks',
    requestedQuantity: '2',
    builtQuantity: 2,
    notes: 'Optional visible mechanism',
    category: 'architecture-door',
    description:
      '2 heavy-duty galvanized steel J-curve vertical & horizontal overhead tracks with ceiling hangers, torsion spring bar & guide rollers.',
  },
  {
    id: 'garage-asset-04',
    assetName: 'Light bulb/overhead lamp',
    requestedQuantity: '2–3',
    builtQuantity: 3,
    notes: 'Dramatic reveal',
    category: 'lighting',
    description:
      '3 industrial green-enamel pendant lamps with warm glowing filament bulbs & volumetric light cones for dramatic sequential reveal.',
  },
  {
    id: 'garage-asset-05',
    assetName: 'Rusty trolley',
    requestedQuantity: '1',
    builtQuantity: 1,
    notes: 'Holds the cartoon nuke',
    category: 'hero-nuke-trolley',
    description:
      'Weathered oxidized-steel flatbed utility trolley with 4 heavy caster wheels, timber V-cradle chocks & tubular push handle.',
  },
  {
    id: 'garage-asset-06',
    assetName: 'Bicycle',
    requestedQuantity: '1',
    builtQuantity: 1,
    notes: 'Sits next to the trolley',
    category: 'hero-nuke-trolley',
    description:
      'Full diamond-frame street bicycle next to the trolley with 2 spoked wheels, tires, handlebars, saddle seat, pedals, chainring & kickstand.',
  },
  {
    id: 'garage-asset-07',
    assetName: 'Cartoon nuke',
    requestedQuantity: '1',
    builtQuantity: 1,
    notes: 'Main oversized gag prop',
    category: 'hero-nuke-trolley',
    description:
      'Oversized 2.85m retro-cartoon thermonuclear gag missile assembly cradled on the rusty trolley aimed toward the garage door.',
  },
  {
    id: 'garage-asset-08',
    assetName: 'Nuke fins',
    requestedQuantity: '3–4',
    builtQuantity: 4,
    notes: 'Can be part of the model',
    category: 'hero-nuke-trolley',
    description:
      '4 swept delta tail stabilizer fins in crimson & white checker pattern bolted around the rear thruster shroud.',
  },
  {
    id: 'garage-asset-09',
    assetName: 'Nuke nose cone',
    requestedQuantity: '1',
    builtQuantity: 1,
    notes: 'Separate model section',
    category: 'hero-nuke-trolley',
    description:
      'Separate detachable crimson-and-hazard-yellow parabolic warhead nose cone section with riveted collar & brass contact fuse spinner.',
  },
  {
    id: 'garage-asset-10',
    assetName: 'Nuke body',
    requestedQuantity: '1',
    builtQuantity: 1,
    notes: 'Main mesh',
    category: 'hero-nuke-trolley',
    description:
      'Bulbous riveted gunmetal-and-olive fuselage main mesh with reinforced steel bands, lifting lugs & rear rocket bell nozzle.',
  },
  {
    id: 'garage-asset-11',
    assetName: 'Nuke warning markings',
    requestedQuantity: '1 texture set',
    builtQuantity: 1,
    notes: 'Fictional, stylized markings',
    category: 'textures',
    description:
      'Stylized fictional decal texture set: radiation trefoils, shark-mouth nose art, "ACME-9000 DOOM-O-MATIC" & yellow/black hazard chevrons.',
  },
  {
    id: 'garage-asset-12',
    assetName: 'Launch smoke',
    requestedQuantity: '1 reusable effect',
    builtQuantity: 1,
    notes: 'Reuse and scale',
    category: 'launch-vfx',
    description:
      'Reusable 28-puff volumetric launch smoke plume system billowing out from the nuke thruster nozzle and rolling toward the door.',
  },
  {
    id: 'garage-asset-13',
    assetName: 'Launch fire',
    requestedQuantity: '1 reusable effect',
    builtQuantity: 1,
    notes: 'Animated sprite/particles',
    category: 'launch-vfx',
    description:
      'Reusable 60fps animated thruster fire cone, white-hot plasma core & 32 high-velocity ignition ember particles.',
  },
  {
    id: 'garage-asset-14',
    assetName: 'Ground dust',
    requestedQuantity: '1 reusable effect',
    builtQuantity: 1,
    notes: 'Launch and sprint gags',
    category: 'launch-vfx',
    description:
      'Reusable radial shockwave floor dust ring + scurrying sprint-gag dust clouds kicking up along the stained concrete floor.',
  },
  {
    id: 'garage-asset-15',
    assetName: 'Cardboard countdown sign',
    requestedQuantity: '1',
    builtQuantity: 1,
    notes: 'Hype Man',
    category: 'gag-signage',
    description:
      'Hype Man corrugated cardboard placard on a wooden post flipping live through "3... 2... 1... 0! BLAST OFF!" in thick marker.',
  },
  {
    id: 'garage-asset-16',
    assetName: 'Cardboard “NUKE LAUNCH” sign',
    requestedQuantity: '1',
    builtQuantity: 1,
    notes: 'Separate prop or sign variant',
    category: 'gag-signage',
    description:
      'Separate corrugated cardboard A-frame & wall banner with duct-taped corners reading "NUKE LAUNCH TODAY!! -> NO PARKING".',
  },
  {
    id: 'garage-asset-17',
    assetName: 'Tool cabinet',
    requestedQuantity: '1',
    builtQuantity: 1,
    notes: 'Garage clutter',
    category: 'garage-clutter',
    description:
      'Tall cherry-red mechanic rolling 7-drawer tool chest with brushed-chrome drawer pulls, side push bar & 4 casters.',
  },
  {
    id: 'garage-asset-18',
    assetName: 'Toolbox',
    requestedQuantity: '1',
    builtQuantity: 1,
    notes: 'Garage clutter',
    category: 'garage-clutter',
    description:
      'Portable red steel hip-roof hand toolbox with chrome latches, top handle & protruding wrench/screwdriver tools.',
  },
  {
    id: 'garage-asset-19',
    assetName: 'Spare tire',
    requestedQuantity: '1',
    builtQuantity: 1,
    notes: 'Optional detail',
    category: 'garage-clutter',
    description:
      'Heavy treaded rubber automotive spare tire with 5-spoke alloy rim & lug nuts leaning against the tool cabinet.',
  },
  {
    id: 'garage-asset-20',
    assetName: 'Shelving',
    requestedQuantity: '1–2',
    builtQuantity: 2,
    notes: 'Background',
    category: 'garage-clutter',
    description:
      '2 heavy-duty 4-tier industrial steel storage shelving racks along the back and left walls holding paint cans & boxes.',
  },
  {
    id: 'garage-asset-21',
    assetName: 'Paint cans',
    requestedQuantity: '3–5',
    builtQuantity: 5,
    notes: 'Small clutter',
    category: 'garage-clutter',
    description:
      '5 cylindrical metal gallon paint cans with wire bail handles & colorful hazard-yellow, red, cyan & lime paint drips.',
  },
  {
    id: 'garage-asset-22',
    assetName: 'Cardboard boxes',
    requestedQuantity: '3–6',
    builtQuantity: 5,
    notes: 'Background dressing',
    category: 'garage-clutter',
    description:
      '5 corrugated cardboard storage boxes with packing tape, shipping labels & "ACME ROCKET PARTS - FRAGILE" stencils.',
  },
  {
    id: 'garage-asset-23',
    assetName: 'Extension cable',
    requestedQuantity: '1',
    builtQuantity: 1,
    notes: 'Optional floor prop',
    category: 'garage-clutter',
    description:
      'High-visibility safety-orange heavy-duty extension cord snaking from the wall power outlet to the trolley igniter junction box.',
  },
  {
    id: 'garage-asset-24',
    assetName: 'Floor stains and cracks',
    requestedQuantity: '1 texture set',
    builtQuantity: 1,
    notes: 'Adds age to the garage',
    category: 'textures',
    description:
      'Procedural aged concrete slab texture set with dark motor-oil puddles, rubber tire skid marks, expansion joints & branching cracks.',
  },
];

export interface GarageFloorPropPlacement {
  id: string;
  label: string;
  position: [number, number, number];
  /** [halfWidthX, heightY, halfDepthZ] */
  bounds: [number, number, number];
}

/**
 * Authoritative floor footprint placements inside the 8.6m × 7.2m Garage
 * (X in [-4.3, +4.3], Z in [-3.6, +3.6], floor at Y = 0.0m).
 */
export const GARAGE_FLOOR_PROP_PLACEMENTS: GarageFloorPropPlacement[] = [
  {
    id: 'rusty-trolley-and-cartoon-nuke',
    label: 'Rusty Trolley (1) Holding Oversized Cartoon Nuke (Body + Nose Cone + 4 Fins)',
    position: [0.0, 0.0, -0.35],
    bounds: [0.78, 1.85, 1.48],
  },
  {
    id: 'bicycle-next-to-trolley',
    label: 'Street Bicycle (1) Parked Next to the Rusty Trolley',
    position: [-1.45, 0.0, 0.15],
    bounds: [0.34, 1.05, 0.88],
  },
  {
    id: 'cardboard-countdown-sign-hype',
    label: 'Hype Man Cardboard Countdown Sign (1) on Wooden Post',
    position: [1.88, 0.0, 0.55],
    bounds: [0.38, 1.52, 0.28],
  },
  {
    id: 'cardboard-nuke-launch-sign',
    label: 'Cardboard "NUKE LAUNCH" A-Frame Banner Sign (1)',
    position: [-1.85, 0.0, 1.65],
    bounds: [0.46, 1.12, 0.34],
  },
  {
    id: 'tool-cabinet-and-toolbox',
    label: 'Red Rolling Mechanic Tool Cabinet (1) + Portable Steel Toolbox (1)',
    position: [3.35, 0.0, -1.25],
    bounds: [0.48, 1.45, 0.65],
  },
  {
    id: 'spare-tire-01',
    label: 'Heavy Treaded Automotive Spare Tire (1)',
    position: [3.38, 0.0, -0.15],
    bounds: [0.32, 0.68, 0.34],
  },
  {
    id: 'industrial-shelving-back-01',
    label: 'Heavy-Duty Steel Shelving Unit #1 (Back Wall)',
    position: [-1.85, 0.0, -3.05],
    bounds: [0.95, 2.15, 0.38],
  },
  {
    id: 'industrial-shelving-back-02',
    label: 'Heavy-Duty Steel Shelving Unit #2 (Back-Right Wall)',
    position: [1.65, 0.0, -3.05],
    bounds: [0.95, 2.15, 0.38],
  },
  {
    id: 'floor-cardboard-boxes-cluster',
    label: 'Stacked Corrugated Cardboard Boxes & Paint Cans Cluster',
    position: [-3.35, 0.0, -1.55],
    bounds: [0.58, 1.15, 0.72],
  },
];

/**
 * Validates that all major floor props sit inside the 8.6m × 7.2m garage shell
 * at or above Y = 0 and have zero horizontal AABB collisions.
 */
export function validateGarageSpatialClearance(): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  const minX = -4.15;
  const maxX = 4.15;
  const minZ = -3.48;
  const maxZ = 3.48;

  for (const prop of GARAGE_FLOOR_PROP_PLACEMENTS) {
    const [x, y, z] = prop.position;
    const [hx, , hz] = prop.bounds;
    if (y < -0.001) {
      violations.push(`${prop.id} base y=${y} phases below garage floor (y=0)`);
    }
    if (x - hx < minX || x + hx > maxX || z - hz < minZ || z + hz > maxZ) {
      violations.push(
        `${prop.id} extends outside garage shell bounds: x=${x}, z=${z}`,
      );
    }
  }

  for (let i = 0; i < GARAGE_FLOOR_PROP_PLACEMENTS.length; i++) {
    for (let j = i + 1; j < GARAGE_FLOOR_PROP_PLACEMENTS.length; j++) {
      const a = GARAGE_FLOOR_PROP_PLACEMENTS[i];
      const b = GARAGE_FLOOR_PROP_PLACEMENTS[j];
      const overlapX =
        Math.abs(a.position[0] - b.position[0]) <
        a.bounds[0] + b.bounds[0] - 0.02;
      const overlapZ =
        Math.abs(a.position[2] - b.position[2]) <
        a.bounds[2] + b.bounds[2] - 0.02;
      if (overlapX && overlapZ) {
        violations.push(`Garage floor prop overlap between ${a.id} and ${b.id}`);
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

function smoothstep01(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
}

export interface GarageDoorPanelPose {
  panelIndex: number;
  y: number;
  z: number;
  rotationX: number;
}

export interface GarageUltraDetailSpec {
  id: string;
  name: string;
  zone:
    | 'sub-floor-silo-pit'
    | 'west-workbench-pegboard'
    | 'ceiling-trusses-gantry-hvac'
    | 'east-welding-electrical'
    | 'automotive-floor-tools';
  subPartCount: number;
  description: string;
}

/**
 * 1000x Ultra-Detail Workshop, Sub-Floor Silo & Architectural Sub-Assemblies
 * added across the Garage while preserving all 24 core asset categories.
 */
export const GARAGE_ULTRA_DETAIL_WORKSHOP_MANIFEST: GarageUltraDetailSpec[] = [
  {
    id: 'ultra-01-subfloor-silo-hatch',
    name: 'Sub-Floor Nuclear Silo Pit, Twin Diamond-Plate Hatch Doors & Hydraulic Scissor-Lift',
    zone: 'sub-floor-silo-pit',
    subPartCount: 48,
    description:
      'Recessed 2.35m deep concrete & steel silo pit, twin animated diamond-plate ground hatch doors that part & tilt open, 4-arm hydraulic scissor-lift elevator, 2 chrome ram cylinders, 4 rotary warning beacons & 16 pressurized steam vents.',
  },
  {
    id: 'ultra-02-workbench-vise-grinder',
    name: 'Heavy-Duty Hardwood Mechanic Workbench, Cast-Iron Bench Vise & Dual-Wheel Grinder',
    zone: 'west-workbench-pegboard',
    subPartCount: 42,
    description:
      'Butcher-block oak workbench with steel legs, drawers, cast-iron machinist vise with leadscrew & anvil, dual-wheel electric bench grinder with spark shields, soldering station & scattered hardware fasteners.',
  },
  {
    id: 'ultra-03-pegboard-hand-tools',
    name: 'Illuminated Pegboard Tool Wall with 26 Individual 3D Hand Tools',
    zone: 'west-workbench-pegboard',
    subPartCount: 54,
    description:
      'Perforated pegboard panel with painted white tool silhouettes, 6 graduated combination wrenches, claw hammer, rubber mallet, hacksaw, 4 fluted screwdrivers, needle-nose & locking pliers, try-square, saw blade & coiled air hose.',
  },
  {
    id: 'ultra-04-air-compressor-system',
    name: '60-Gallon Vertical Red Air Compressor, Twin Brass Gauges & Piping',
    zone: 'west-workbench-pegboard',
    subPartCount: 24,
    description:
      'Vertical welded steel air tank on rubber feet, cast-iron V-twin compressor head, flywheel belt guard, electric motor, twin pressure gauges, brass regulator & copper/rubber airline.',
  },
  {
    id: 'ultra-05-oxy-acetylene-welder',
    name: 'Oxy-Acetylene Welding Cart, Twin Gas Cylinders, Regulators, Hose & Welding Helmet',
    zone: 'east-welding-electrical',
    subPartCount: 28,
    description:
      'Rolling steel cylinder cart with green Oxygen & maroon Acetylene tanks, safety chain, dual brass pressure gauges, twin red/green hoses, brass cutting torch & flip-visor welding mask.',
  },
  {
    id: 'ultra-06-ceiling-gantry-hvac-opener',
    name: 'Overhead I-Beam Gantry Chain Hoist, Galvanized HVAC Ductwork & Ceiling Door Opener Motor',
    zone: 'ceiling-trusses-gantry-hvac',
    subPartCount: 62,
    description:
      'Webbed steel roof truss bracing, yellow I-beam gantry crane rail with rolling chain hoist & forged hook, galvanized sheet-metal HVAC ducting with louvers & exhaust fan, and electric chain-drive garage door opener motor with emergency release cord.',
  },
  {
    id: 'ultra-07-electrical-conduits-posters',
    name: 'High-Voltage Breaker Cabinet, 16 Switches, EMT Conduit Network, Fire Extinguisher & Blueprints',
    zone: 'east-welding-electrical',
    subPartCount: 46,
    description:
      'Industrial steel breaker box with 16 toggle switches, main cutout lever, rotary kWh meter, 5 galvanized conduit runs, wall-mounted CO2 fire extinguisher, first-aid box & 3 procedural blueprints/posters ("SUB-FLOOR SILO MK-IV").',
  },
  {
    id: 'ultra-08-silo-console-jack-automotive',
    name: 'Silo Launch Control Pedestal, Hydraulic Floor Jack, Jack Stands, Jerry Cans, Oil Pan & Battery',
    zone: 'automotive-floor-tools',
    subPartCount: 44,
    description:
      'Illuminated Silo Control Lectern with animated throttle lever & big red OPEN SILO button, low-profile racing hydraulic floor jack, 2 ratcheting jack stands, oil drain pan, 2 fuel jerry cans & 12V car battery with jumper cables.',
  },
];

export interface GarageLaunchState {
  doorOpenProgress01: number;
  doorPanelPoses: GarageDoorPanelPose[];
  lampIntensities: [number, number, number];
  /** 0 = ground hatch closed flush; 1 = ground hatch opened up a little bit (parted & tilted) */
  siloGroundOpenProgress01: number;
  /** 0 = nuke completely hidden underground (Y = -2.35m); 1 = emerged at garage floor level (Y = 0.0m) */
  nukeElevatorRiseProgress01: number;
  /** World Y coordinate of the Rusty Trolley + Cartoon Nuke platform (-2.35m to 0.0m) */
  nukeWorldY: number;
  /** True when the nuke is concealed below the closed ground hatch */
  nukeConcealedUnderground: boolean;
  /** 0..1 intensity of pressurized subterranean steam venting from the opening ground hatch */
  siloSteamVentIntensity01: number;
  /** 0..1 flashing strobe state of the 4 perimeter silo warning beacons */
  siloWarningBeaconFlash01: number;
  countdownDigitText: string;
  countdownSubtext: string;
  countdownColorHex: string;
  countdownBoardTiltRad: number;
  nukeVibrationOffset: [number, number, number];
  trolleyForwardSurgeMeters: number;
  wheelRotationRad: number;
  launchFireIntensity01: number;
  launchSmokeScale01: number;
  groundDustRingRadius01: number;
  phaseHeadline: string;
}

/**
 * Deterministic 60fps evaluator for:
 * - Sub-Floor Silo Ground Hatch Opening ("ground opens up a little bit") & Hydraulic Nuke Emergence ("and it comes out!")
 * - Concealed Underground state (Nuke hidden when ground hatch is closed)
 * - Animated 4-panel Garage Door rolling along the 2 J-curve ceiling tracks
 * - 3 Overhead Lamps dramatic reveal
 * - Cardboard Countdown Sign ("SILO SEALED" -> "HATCH OPENING" -> "RISING!" -> "3... 2... 1... BLAST OFF!")
 * - Cartoon Nuke & Rusty Trolley vibration + forward launch roll
 * - Launch Fire, Launch Smoke & Ground Dust reusable effects
 */
export function evaluateGarageLaunchStateAtFrame(params: {
  frame: number;
  fps?: number;
  doorMode?: GarageDoorModeId;
  launchMode?: GarageLaunchModeId;
  lightRevealMode?: GarageLightRevealModeId;
}): GarageLaunchState {
  const safeFrame = Math.max(0, params.frame);
  const fps = Math.max(1, params.fps ?? 60);
  const doorMode = params.doorMode ?? 'timeline-animated';
  const launchMode = params.launchMode ?? 'timeline-cycle';
  const lightRevealMode = params.lightRevealMode ?? 'dramatic-3-bulb-reveal';
  const t = safeFrame / fps;

  // 1. Garage Door Open Progress (0 = closed, 1 = rolled up along overhead tracks)
  let doorOpenProgress01 = 0.78;
  if (doorMode === 'manual-open') {
    doorOpenProgress01 = 1.0;
  } else if (doorMode === 'manual-half-open') {
    doorOpenProgress01 = 0.55;
  } else if (doorMode === 'manual-closed') {
    doorOpenProgress01 = 0.0;
  } else {
    const cycleFrame = safeFrame % 480;
    if (cycleFrame < 120) {
      doorOpenProgress01 = 0.68 + 0.32 * smoothstep01(cycleFrame / 120);
    } else if (cycleFrame < 400) {
      doorOpenProgress01 = 1.0;
    } else {
      doorOpenProgress01 =
        1.0 - 0.32 * smoothstep01((cycleFrame - 400) / 80);
    }
  }

  // Compute 4 articulated panel poses along the vertical-to-horizontal J-track
  const travelDistance = doorOpenProgress01 * 2.45;
  const doorPanelPoses: GarageDoorPanelPose[] = [0, 1, 2, 3].map((idx) => {
    const baseCenterY = 0.33 + idx * 0.66;
    const s = baseCenterY + travelDistance;
    const turnStart = 2.55;
    const turnEnd = 3.05;
    if (s <= turnStart) {
      return {
        panelIndex: idx,
        y: s,
        z: 3.38,
        rotationX: 0,
      };
    } else if (s < turnEnd) {
      const u = (s - turnStart) / (turnEnd - turnStart);
      const angle = u * (Math.PI / 2);
      return {
        panelIndex: idx,
        y: turnStart + Math.sin(angle) * 0.43,
        z: 3.38 - (1 - Math.cos(angle)) * 0.43,
        rotationX: angle,
      };
    } else {
      const horizDist = s - turnEnd;
      return {
        panelIndex: idx,
        y: 2.98,
        z: 2.95 - horizDist,
        rotationX: Math.PI / 2,
      };
    }
  });

  // 2. Dramatic 3-Bulb Overhead Lamp Reveal
  let lampIntensities: [number, number, number] = [6.8, 6.8, 6.2];
  if (lightRevealMode === 'all-lamps-full-bright') {
    lampIntensities = [7.6, 7.6, 7.2];
  } else if (lightRevealMode === 'moody-bunker-amber') {
    lampIntensities = [4.5, 5.2, 3.8];
  } else {
    const pulse1 = 0.92 + 0.08 * Math.sin(t * 6.0);
    const pulse2 = 0.92 + 0.08 * Math.sin(t * 6.0 + 1.2);
    const pulse3 = 0.92 + 0.08 * Math.sin(t * 6.0 + 2.4);
    lampIntensities = [7.0 * pulse1, 7.2 * pulse2, 6.4 * pulse3];
  }

  // 3. Sub-Floor Silo Ground Opening, Nuke Hydraulic Emergence & Countdown Sequence
  let siloGroundOpenProgress01 = 0.0;
  let nukeElevatorRiseProgress01 = 0.0;
  let siloSteamVentIntensity01 = 0.0;
  let countdownDigitText = 'SILO LOCKED';
  let countdownSubtext = 'NUKE CONCEALED';
  let countdownColorHex = '#38BDF8';
  let launchFireIntensity01 = 0.0;
  let launchSmokeScale01 = 0.0;
  let groundDustRingRadius01 = 0.0;
  let trolleyForwardSurgeMeters = 0;
  let phaseHeadline =
    'PHASE 1: SUB-FLOOR HATCH SEALED • NUKE HIDDEN UNDERGROUND';

  if (launchMode === 'concealed-underground') {
    siloGroundOpenProgress01 = 0.0;
    nukeElevatorRiseProgress01 = 0.0;
    siloSteamVentIntensity01 = 0.0;
    countdownDigitText = 'SILO SEALED';
    countdownSubtext = 'HIDDEN BELOW FLOOR';
    countdownColorHex = '#38BDF8';
    launchFireIntensity01 = 0.0;
    launchSmokeScale01 = 0.0;
    groundDustRingRadius01 = 0.0;
    trolleyForwardSurgeMeters = 0;
    phaseHeadline =
      'CONCEALED MODE • SUB-FLOOR HATCH CLOSED & NUKE HIDDEN UNDERGROUND';
  } else if (launchMode === 'ground-opening-emergence') {
    // Dedicated mode showing the ground opening up a little bit & the nuke emerging out of the pit!
    // At frame 0, defaults to mid-emergence (ground opened 78%, nuke rising at 62% out of the floor)
    // and across frames cycles smoothly from closed -> opening -> rising -> emerged!
    const eCycle = safeFrame % 180;
    if (safeFrame === 0) {
      siloGroundOpenProgress01 = 0.78;
      nukeElevatorRiseProgress01 = 0.62;
    } else if (eCycle < 30) {
      siloGroundOpenProgress01 = smoothstep01(eCycle / 30) * 0.85;
      nukeElevatorRiseProgress01 = 0.0;
    } else if (eCycle < 130) {
      siloGroundOpenProgress01 =
        0.85 + 0.15 * smoothstep01((eCycle - 30) / 40);
      nukeElevatorRiseProgress01 = smoothstep01((eCycle - 30) / 100);
    } else {
      siloGroundOpenProgress01 = 1.0;
      nukeElevatorRiseProgress01 = 1.0;
    }
    siloSteamVentIntensity01 =
      siloGroundOpenProgress01 > 0.05 ? 0.85 : 0.0;
    countdownDigitText =
      nukeElevatorRiseProgress01 < 0.15
        ? 'HATCH OPEN'
        : nukeElevatorRiseProgress01 < 0.95
          ? `RISE ${Math.round(nukeElevatorRiseProgress01 * 100)}%`
          : 'DEPLOYED!';
    countdownSubtext = 'GROUND SILO ACTIVE!';
    countdownColorHex = '#FACC15';
    launchFireIntensity01 =
      nukeElevatorRiseProgress01 > 0.85 ? 0.35 : 0.0;
    launchSmokeScale01 =
      siloGroundOpenProgress01 > 0.1 ? 0.55 * siloGroundOpenProgress01 : 0.0;
    groundDustRingRadius01 = siloGroundOpenProgress01 * 0.65;
    trolleyForwardSurgeMeters = 0;
    phaseHeadline =
      'GROUND OPENS UP A LITTLE BIT & CARTOON NUKE EMERGES ON HYDRAULIC LIFT!';
  } else if (launchMode === 'countdown-standby') {
    siloGroundOpenProgress01 = 1.0;
    nukeElevatorRiseProgress01 = 1.0;
    siloSteamVentIntensity01 = 0.35;
    countdownDigitText = 'T-00:03';
    countdownSubtext = 'HYPE MAN READY!';
    countdownColorHex = '#FACC15';
    launchFireIntensity01 = 0.32 + 0.12 * Math.sin(t * 14);
    launchSmokeScale01 = 0.45;
    groundDustRingRadius01 = 0.3;
    trolleyForwardSurgeMeters = 0;
    phaseHeadline = 'COUNTDOWN STANDBY • PILOT FLAME ACTIVE';
  } else if (launchMode === 'full-ignition-blast') {
    siloGroundOpenProgress01 = 1.0;
    nukeElevatorRiseProgress01 = 1.0;
    siloSteamVentIntensity01 = 0.75;
    countdownDigitText = '0! LAUNCH!';
    countdownSubtext = 'MAX THRUST!!';
    countdownColorHex = '#EF4444';
    launchFireIntensity01 = 1.0;
    launchSmokeScale01 = 1.0;
    groundDustRingRadius01 = (t * 0.85) % 1;
    trolleyForwardSurgeMeters = 0.25 + 0.08 * Math.sin(t * 8);
    phaseHeadline = 'FULL NUCLEAR GAG IGNITION • MAX FIRE, SMOKE & FLOOR DUST!';
  } else {
    // 'timeline-cycle' (240-frame complete narrative cycle):
    // 0..35: Ground hatch is CLOSED, Nuke is HIDDEN underground ("do not shoow the nuke")
    // 35..80: Ground opens up a little bit with pressurized steam & flashing strobes
    // 80..145: Nuke rises up out of the opened ground hatch on the hydraulic scissor lift!
    // 145..195: Hype Man Countdown 3 -> 2 -> 1
    // 195..240: 0! LAUNCH! Full thruster ignition blast!
    const cFrame = safeFrame % 240;
    if (cFrame < 35) {
      siloGroundOpenProgress01 = 0.0;
      nukeElevatorRiseProgress01 = 0.0;
      siloSteamVentIntensity01 = cFrame > 20 ? (cFrame - 20) / 15 * 0.4 : 0.0;
      countdownDigitText = 'SILO LOCKED';
      countdownSubtext = 'FLOOR HATCH SEALED';
      countdownColorHex = '#38BDF8';
      launchFireIntensity01 = 0.0;
      launchSmokeScale01 = 0.0;
      groundDustRingRadius01 = 0.0;
      trolleyForwardSurgeMeters = 0.0;
      phaseHeadline =
        'PHASE 1: SUB-FLOOR SILO SEALED • NUKE CONCEALED UNDERGROUND';
    } else if (cFrame < 80) {
      const u = smoothstep01((cFrame - 35) / 45);
      siloGroundOpenProgress01 = u;
      // Nuke begins peeking up as the ground opens up a little bit
      nukeElevatorRiseProgress01 = smoothstep01(Math.max(0, (cFrame - 50) / 30)) * 0.28;
      siloSteamVentIntensity01 = 0.55 + 0.45 * Math.sin(u * Math.PI);
      countdownDigitText = 'CAUTION!!';
      countdownSubtext = 'GROUND OPENING!';
      countdownColorHex = '#FACC15';
      launchFireIntensity01 = 0.0;
      launchSmokeScale01 = 0.35 * u;
      groundDustRingRadius01 = 0.35 * u;
      trolleyForwardSurgeMeters = 0.0;
      phaseHeadline =
        'PHASE 2: GROUND OPENS UP A LITTLE BIT • HYDRAULIC SILO HATCH PARTING';
    } else if (cFrame < 145) {
      const u = smoothstep01((cFrame - 80) / 65);
      siloGroundOpenProgress01 = 1.0;
      nukeElevatorRiseProgress01 = 0.28 + 0.72 * u;
      siloSteamVentIntensity01 = 0.9 * (1 - u * 0.45);
      countdownDigitText = `RISE ${Math.round(nukeElevatorRiseProgress01 * 100)}%`;
      countdownSubtext = 'NUKE EMERGING!!';
      countdownColorHex = '#F97316';
      launchFireIntensity01 = u > 0.75 ? (u - 0.75) * 1.6 : 0.0;
      launchSmokeScale01 = 0.35 + 0.35 * u;
      groundDustRingRadius01 = 0.35 + 0.45 * u;
      trolleyForwardSurgeMeters = 0.0;
      phaseHeadline =
        'PHASE 3: NUKE COMES OUT OF THE GROUND • HYDRAULIC SCISSOR-LIFT ELEVATING';
    } else if (cFrame < 195) {
      const u = (cFrame - 145) / 50;
      siloGroundOpenProgress01 = 1.0;
      nukeElevatorRiseProgress01 = 1.0;
      siloSteamVentIntensity01 = 0.4;
      const countNum = u < 0.34 ? 3 : u < 0.67 ? 2 : 1;
      countdownDigitText = `COUNT: ${countNum}`;
      countdownSubtext =
        countNum === 3
          ? 'LOCKED ON FLOOR!'
          : countNum === 2
            ? 'TURBINE SPOOLING!'
            : 'HOLD YOUR EARS!!';
      countdownColorHex = countNum === 3 ? '#FACC15' : '#F97316';
      launchFireIntensity01 = 0.45 + 0.45 * u;
      launchSmokeScale01 = 0.65 + 0.25 * u;
      groundDustRingRadius01 = u;
      trolleyForwardSurgeMeters = 0.04 + 0.08 * u;
      phaseHeadline = `PHASE 4: HYPE MAN COUNTDOWN ${countNum} • NUKE EMERGED & ARMED`;
    } else {
      siloGroundOpenProgress01 = 1.0;
      nukeElevatorRiseProgress01 = 1.0;
      siloSteamVentIntensity01 = 0.85;
      countdownDigitText = '0! LAUNCH!';
      countdownSubtext = 'MAXIMUM GAG THRUST!';
      countdownColorHex = '#EF4444';
      launchFireIntensity01 = 1.0;
      launchSmokeScale01 = 1.0;
      groundDustRingRadius01 = (cFrame - 195) / 45;
      trolleyForwardSurgeMeters = 0.26;
      phaseHeadline =
        'PHASE 5: 0! BLAST OFF! • FULL LAUNCH FIRE, SMOKE & SPRINT DUST';
    }
  }

  // Deep underground rest Y = -2.35m; fully elevated floor Y = 0.0m
  const rawNukeWorldY = -2.35 * (1 - nukeElevatorRiseProgress01);
  const nukeWorldY = Object.is(rawNukeWorldY, -0) ? 0 : rawNukeWorldY;
  const nukeConcealedUnderground =
    siloGroundOpenProgress01 <= 0.02 && nukeElevatorRiseProgress01 <= 0.02;
  const siloWarningBeaconFlash01 =
    siloGroundOpenProgress01 > 0.01 || siloSteamVentIntensity01 > 0.01
      ? 0.5 + 0.5 * Math.sin(t * 18.0)
      : 0.15;

  const vibAmp = 0.008 * launchFireIntensity01;
  const nukeVibrationOffset: [number, number, number] = [
    Math.sin(t * 58) * vibAmp,
    Math.cos(t * 64) * vibAmp,
    Math.sin(t * 42) * vibAmp * 0.5,
  ];
  const countdownBoardTiltRad = Math.sin(t * 5.5) * 0.08;
  const wheelRotationRad = trolleyForwardSurgeMeters / 0.14;

  return {
    doorOpenProgress01,
    doorPanelPoses,
    lampIntensities,
    siloGroundOpenProgress01,
    nukeElevatorRiseProgress01,
    nukeWorldY,
    nukeConcealedUnderground,
    siloSteamVentIntensity01,
    siloWarningBeaconFlash01,
    countdownDigitText,
    countdownSubtext,
    countdownColorHex,
    countdownBoardTiltRad,
    nukeVibrationOffset,
    trolleyForwardSurgeMeters,
    wheelRotationRad,
    launchFireIntensity01,
    launchSmokeScale01,
    groundDustRingRadius01,
    phaseHeadline,
  };
}

export interface GarageCameraTransform {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  shotLabel: string;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Deterministic 60fps camera choreography inside the 8.6m × 7.2m × 3.8m Garage.
 */
export function computeGarageCameraTransformAtFrame(
  frame: number,
  preset: GarageCameraPresetId,
): GarageCameraTransform {
  const safeFrame = Math.max(0, frame);
  const t = (safeFrame % 480) / 480;

  if (preset === 'nuke-and-trolley-hero-closeup') {
    return {
      position: [1.85 + Math.sin(t * Math.PI * 2) * 0.25, 1.42, 1.45],
      target: [-0.15, 0.95, -0.35],
      fov: 44,
      shotLabel:
        'Cartoon Nuke (Body, Nose Cone, 4 Fins & Markings) on Rusty Trolley + Bicycle & Launch VFX',
    };
  }

  if (preset === 'garage-door-and-tracks-closeup') {
    return {
      position: [-1.75 + Math.cos(t * Math.PI * 2) * 0.25, 1.72, -0.55],
      target: [0.0, 1.95, 2.85],
      fov: 48,
      shotLabel:
        'Animated Sectional Garage Door (1) & 2 Overhead Galvanized Steel J-Tracks + 3 Pendant Lamps',
    };
  }

  if (preset === 'clutter-shelves-tools-closeup') {
    return {
      position: [-0.85 + Math.sin(t * Math.PI * 2) * 0.3, 1.62, 1.25],
      target: [1.55, 1.05, -2.15],
      fov: 48,
      shotLabel:
        'Tool Cabinet (1), Toolbox (1), Spare Tire (1), 2 Shelving Racks, 5 Paint Cans & 5 Cardboard Boxes',
    };
  }

  if (preset === 'countdown-signs-and-fx-closeup') {
    return {
      position: [0.15 + Math.sin(t * Math.PI * 2) * 0.22, 1.38, 2.35],
      target: [0.05, 0.88, -0.45],
      fov: 48,
      shotLabel:
        'Cardboard Countdown Sign, "NUKE LAUNCH" Sign, Thruster Fire, Launch Smoke & Ground Dust',
    };
  }

  if (preset === 'garage-wide-master-overview') {
    return {
      position: [2.15 + Math.sin(t * Math.PI * 2) * 0.35, 2.05, 2.45],
      target: [-0.15, 1.02, -0.55],
      fov: 52,
      shotLabel:
        'Garage & Nuclear Launch Master Wide Overview — All 24 Asset Categories',
    };
  }

  // Default: 'garage-choreographed-tour'
  // Starts at Frame 0 with a dramatic hero three-quarter angle showing:
  // Cartoon Nuke (Nose Cone, Body, 4 Fins, Warning Markings) on Rusty Trolley, Bicycle,
  // Launch Fire & Smoke, Ground Dust, Cardboard Countdown & "NUKE LAUNCH" Signs,
  // Tool Cabinet, Spare Tire, 2 Shelving Units, Extension Cable, 3 Overhead Lamps & Door Tracks!
  if (safeFrame < 160) {
    const u = smoothstep01(safeFrame / 160);
    return {
      position: [
        lerp(-2.25, 1.65, u),
        lerp(1.92, 1.42, u),
        lerp(2.48, 1.65, u),
      ],
      target: [
        lerp(0.15, -0.1, u),
        lerp(0.95, 0.92, u),
        lerp(-0.45, -0.35, u),
      ],
      fov: 52,
      shotLabel:
        'Shot 1: Dramatic 3-Bulb Reveal — Cartoon Nuke on Rusty Trolley, Bicycle, Countdown Signs, Tool Cabinet & Launch Fire',
    };
  }

  if (safeFrame < 320) {
    const u = smoothstep01((safeFrame - 160) / 160);
    return {
      position: [
        lerp(1.45, -1.95, u),
        lerp(1.38, 1.65, u),
        lerp(1.55, 1.85, u),
      ],
      target: [
        lerp(-0.1, 0.35, u),
        lerp(0.92, 1.05, u),
        lerp(-0.35, -0.95, u),
      ],
      fov: 48,
      shotLabel:
        'Shot 2: Orbit Past Bicycle, "NUKE LAUNCH" Sign, Thruster Plume, Tool Cabinet, Spare Tire & Shelving',
    };
  }

  const u = smoothstep01((safeFrame - 320) / 160);
  return {
    position: [
      lerp(-1.95, 1.95, u),
      lerp(1.65, 1.85, u),
      lerp(1.85, -1.85, u),
    ],
    target: [
      lerp(0.35, 0.0, u),
      lerp(1.05, 1.45, u),
      lerp(-0.95, 1.85, u),
    ],
    fov: 50,
    shotLabel:
      'Shot 3: Reverse Launch View — Cartoon Nuke Aimed at Rolling Garage Door & 2 Overhead Ceiling Tracks',
  };
}
