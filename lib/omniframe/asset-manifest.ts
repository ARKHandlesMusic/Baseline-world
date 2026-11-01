export type StyleMoodId =
  | 'lofi-night'
  | 'golden-hour'
  | 'neutral-anime'
  | 'pop-halftone';

export type TimeOfDayMode = 'day' | 'night' | 'auto-cycle';

export type CameraPresetId =
  | 'remotion-choreographed'
  | 'drone-city-flyover'
  | 'establishing-wide'
  | 'low-hero-street'
  | 'isometric-blueprint'
  | 'overhead-marking-check'
  | 'curb-drainage-closeup'
  | 'storefront-hero-closeup'
  | 'car-hero-showcase'
  | 'street-lamp-showcase';

export interface SubPartSpec {
  id: string;
  index: number;
  name: string;
  silhouetteScale: 'Primary Silhouette' | 'Secondary Read' | 'Accent Detail';
  geometryType: string;
  dimensionsMeters: [number, number, number]; // [width X, height Y, length Z]
  baseElevationY: number; // Strictly offset >= 0.02m on coplanar horizontal layers
  explodedOffsetY: number;
  roughness: number;
  metalness: number;
  celBands: 3 | 4;
  inkOutlineWidth: number;
  description: string;
}

export interface StylePalette {
  id: StyleMoodId;
  label: string;
  subtitle: string;
  skyTop: string;
  skyHorizon: string;
  fogColor: string;
  asphaltBase: string;
  asphaltWear: string;
  subbaseConcrete: string;
  curbStone: string;
  sidewalkSlab: string;
  sidewalkJoint: string;
  laneMarkingWhite: string;
  laneMarkingYellow: string;
  tactileYellow: string;
  drainIron: string;
  puddleTint: string;
  inkOutlineColor: string;
  keyLightColor: string;
  keyLightIntensity: number;
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
  rimLightColor: string;
  halftonePrimary: string;
  halftoneSecondary: string;
  burstSpikeColor: string;
  defaultHalftoneIntensity: number;
}

export interface ShotManifestEntry {
  shotId: string;
  title: string;
  startFrame: number;
  endFrame: number;
  musicalAnchor: string;
  narrativePurpose: string;
  cameraStartPos: [number, number, number];
  cameraEndPos: [number, number, number];
  targetStart: [number, number, number];
  targetEnd: [number, number, number];
  fov: number;
  halftonePulseBoost: number;
}

export interface ProductionAssetManifest {
  assetId: string;
  assetNumber: number;
  name: string;
  category: 'Environment / Primary Ground Plane';
  styleSystem: string;
  compositionId: string;
  fps: number;
  durationInFrames: number;
  bpm: number;
  worldDimensionsMeters: {
    widthX: number;
    heightY: number;
    lengthZ: number;
    carriagewayWidthX: number;
    sidewalkWidthX: number;
  };
  coordinateConventions: {
    upAxis: '+Y';
    forwardAxis: '-Z';
    rightAxis: '+X';
    groundPlaneY: 0;
    pivotLocation: 'Bottom-Center (0, 0, 0)';
  };
  subParts: SubPartSpec[];
}

export const STYLE_PALETTES: Record<StyleMoodId, StylePalette> = {
  'lofi-night': {
    id: 'lofi-night',
    label: 'IRL Blue Sky & Daylight Sun (Default)',
    subtitle: 'Photorealistic Rayleigh/Mie blue sky & sun with cel-shaded anime city & ink outlines',
    skyTop: '#1452B4',
    skyHorizon: '#B8E0FC',
    fogColor: '#93C5FD',
    asphaltBase: '#3E465E',
    asphaltWear: '#32394E',
    subbaseConcrete: '#475569',
    curbStone: '#94A3B8',
    sidewalkSlab: '#CBD5E1',
    sidewalkJoint: '#1E293B',
    laneMarkingWhite: '#F8FAFC',
    laneMarkingYellow: '#FACC15',
    tactileYellow: '#EAB308',
    drainIron: '#334155',
    puddleTint: '#38BDF8',
    inkOutlineColor: '#0A0D18',
    keyLightColor: '#FFFBEB',
    keyLightIntensity: 2.85,
    hemiSkyColor: '#93C5FD',
    hemiGroundColor: '#475569',
    hemiIntensity: 1.45,
    rimLightColor: '#FDE68A',
    halftonePrimary: '#38BDF8',
    halftoneSecondary: '#818CF8',
    burstSpikeColor: '#FBBF24',
    defaultHalftoneIntensity: 0.0,
  },
  'golden-hour': {
    id: 'golden-hour',
    label: 'Golden Hour Cozy',
    subtitle: 'Warm sunset amber lighting with long cel-shaded violet shadows',
    skyTop: '#1E40AF',
    skyHorizon: '#FDBA74',
    fogColor: '#FED7AA',
    asphaltBase: '#3A3142',
    asphaltWear: '#2D2535',
    subbaseConcrete: '#443850',
    curbStone: '#8B7385',
    sidewalkSlab: '#9E8596',
    sidewalkJoint: '#2C212E',
    laneMarkingWhite: '#FDE6C4',
    laneMarkingYellow: '#FBBF24',
    tactileYellow: '#F59E0B',
    drainIron: '#2B222C',
    puddleTint: '#FB923C',
    inkOutlineColor: '#160D1A',
    keyLightColor: '#FDBA74',
    keyLightIntensity: 2.7,
    hemiSkyColor: '#FDBA74',
    hemiGroundColor: '#3B2838',
    hemiIntensity: 1.35,
    rimLightColor: '#FDE047',
    halftonePrimary: '#FB923C',
    halftoneSecondary: '#F43F5E',
    burstSpikeColor: '#FDE047',
    defaultHalftoneIntensity: 0.0,
  },
  'neutral-anime': {
    id: 'neutral-anime',
    label: 'Neutral Anime Day',
    subtitle: 'Clean daytime anime background painting with crisp ink outlines',
    skyTop: '#1D4ED8',
    skyHorizon: '#BAE6FD',
    fogColor: '#93C5FD',
    asphaltBase: '#4B5263',
    asphaltWear: '#3E4454',
    subbaseConcrete: '#475569',
    curbStone: '#94A3B8',
    sidewalkSlab: '#CBD5E1',
    sidewalkJoint: '#334155',
    laneMarkingWhite: '#F8FAFC',
    laneMarkingYellow: '#FACC15',
    tactileYellow: '#EAB308',
    drainIron: '#2D323E',
    puddleTint: '#60A5FA',
    inkOutlineColor: '#0F172A',
    keyLightColor: '#FFFBEB',
    keyLightIntensity: 2.75,
    hemiSkyColor: '#93C5FD',
    hemiGroundColor: '#475569',
    hemiIntensity: 1.4,
    rimLightColor: '#BAE6FD',
    halftonePrimary: '#38BDF8',
    halftoneSecondary: '#818CF8',
    burstSpikeColor: '#F97316',
    defaultHalftoneIntensity: 0.0,
  },
  'pop-halftone': {
    id: 'pop-halftone',
    label: 'Make It Right! Burst',
    subtitle: 'Comic book halftone dot screen & radiating manga speed-line spikes',
    skyTop: '#1D4ED8',
    skyHorizon: '#93C5FD',
    fogColor: '#93C5FD',
    asphaltBase: '#333B52',
    asphaltWear: '#262D40',
    subbaseConcrete: '#334155',
    curbStone: '#64748B',
    sidewalkSlab: '#94A3B8',
    sidewalkJoint: '#0F172A',
    laneMarkingWhite: '#FAF5FF',
    laneMarkingYellow: '#FDE047',
    tactileYellow: '#FACC15',
    drainIron: '#1E293B',
    puddleTint: '#38BDF8',
    inkOutlineColor: '#07050C',
    keyLightColor: '#FFFBEB',
    keyLightIntensity: 2.75,
    hemiSkyColor: '#93C5FD',
    hemiGroundColor: '#334155',
    hemiIntensity: 1.4,
    rimLightColor: '#22D3EE',
    halftonePrimary: '#EC4899',
    halftoneSecondary: '#22D3EE',
    burstSpikeColor: '#FDE047',
    defaultHalftoneIntensity: 0.85,
  },
};

export const MAIN_STREET_SECTION_1_MANIFEST: ProductionAssetManifest = {
  assetId: 'main-street-road-section-1',
  assetNumber: 1,
  name: 'Main Street City & Surrounding Mountain World — 4K 60fps',
  category: 'Environment / Primary Ground Plane',
  styleSystem:
    'IRL Rayleigh/Mie Blue Sky & Sun + Cel-Shaded Multi-Block City (LOD Tiers 0–3) + Dark Ink Outlines',
  compositionId: 'OmniframeMainStreetAsset01',
  fps: 60,
  durationInFrames: 480, // 8.0 seconds @ 60fps (16 beats @ 120 BPM)
  bpm: 120,
  worldDimensionsMeters: {
    widthX: 1600,
    heightY: 220,
    lengthZ: 1600,
    carriagewayWidthX: 14,
    sidewalkWidthX: 5,
  },
  coordinateConventions: {
    upAxis: '+Y',
    forwardAxis: '-Z',
    rightAxis: '+X',
    groundPlaneY: 0,
    pivotLocation: 'Bottom-Center (0, 0, 0)',
  },
  subParts: [
    {
      id: 'roadbed-subbase',
      index: 1,
      name: 'Primary Structural Roadbed Slab',
      silhouetteScale: 'Primary Silhouette',
      geometryType: 'ExtrudeGeometry (Beveled Foundation Apron)',
      dimensionsMeters: [24.0, 0.28, 40.0],
      baseElevationY: 0.0,
      explodedOffsetY: 0.0,
      roughness: 0.85,
      metalness: 0.05,
      celBands: 3,
      inkOutlineWidth: 0.04,
      description:
        'Heavy chamfered concrete roadbed foundation anchoring the hero 24m × 40m section at world Y = 0.00m.',
    },
    {
      id: 'asphalt-carriageway',
      index: 2,
      name: 'Crown-Cambered 4-Lane Asphalt Deck',
      silhouetteScale: 'Primary Silhouette',
      geometryType: 'ExtrudeGeometry + Tonal Lane Bands',
      dimensionsMeters: [14.0, 0.08, 40.0],
      baseElevationY: 0.28,
      explodedOffsetY: 0.55,
      roughness: 0.78,
      metalness: 0.08,
      celBands: 3,
      inkOutlineWidth: 0.035,
      description:
        'Primary 14m-wide asphalt roadway surface with flat lo-fi tonal tire tracks and cel-shaded step gradients.',
    },
    {
      id: 'curb-gutter-system',
      index: 3,
      name: 'Beveled Granite Curbstones & Gutter Troughs',
      silhouetteScale: 'Secondary Read',
      geometryType: 'ExtrudeGeometry (L-Profile Curb + Segmented Joints)',
      dimensionsMeters: [1.1, 0.22, 40.0],
      baseElevationY: 0.34,
      explodedOffsetY: 1.15,
      roughness: 0.52,
      metalness: 0.12,
      celBands: 3,
      inkOutlineWidth: 0.03,
      description:
        'East and West granite curb blocks with drainage gutter apron, pedestrian drop-curbs, and 2.5m ink joint lines.',
    },
    {
      id: 'sidewalk-promenade',
      index: 4,
      name: 'Raised Sidewalk Promenades & Paving Grid',
      silhouetteScale: 'Primary Silhouette',
      geometryType: 'BoxGeometry + Scored LineSegments Grid',
      dimensionsMeters: [9.2, 0.18, 40.0],
      baseElevationY: 0.365,
      explodedOffsetY: 1.75,
      roughness: 0.65,
      metalness: 0.06,
      celBands: 3,
      inkOutlineWidth: 0.035,
      description:
        'Dual raised pedestrian walkways flanking the roadbed with comic-ink expansion grid lines.',
    },
    {
      id: 'lane-markings',
      index: 5,
      name: 'Thermoplastic Center Divider & Lane Markings',
      silhouetteScale: 'Secondary Read',
      geometryType: 'PlaneGeometry / BoxGeometry (Disjoint Y +0.025m)',
      dimensionsMeters: [12.0, 0.015, 38.0],
      baseElevationY: 0.39,
      explodedOffsetY: 2.35,
      roughness: 0.4,
      metalness: 0.1,
      celBands: 3,
      inkOutlineWidth: 0.02,
      description:
        'Double amber centerlines, dashed white lane dividers, and stop bars elevated at Y = 0.390m to prevent Z-fighting.',
    },
    {
      id: 'zebra-crosswalk',
      index: 6,
      name: 'High-Contrast Anime Zebra Crosswalk Stripes',
      silhouetteScale: 'Secondary Read',
      geometryType: 'InstancedMesh (18 Beveled Crosswalk Bars)',
      dimensionsMeters: [12.6, 0.02, 8.0],
      baseElevationY: 0.415,
      explodedOffsetY: 2.95,
      roughness: 0.38,
      metalness: 0.08,
      celBands: 3,
      inkOutlineWidth: 0.025,
      description:
        'North and South pedestrian crosswalks with crisp dark ink outlines and flat shading.',
    },
    {
      id: 'tactile-paving',
      index: 7,
      name: 'Tactile Hazard Blister Paving Strips',
      silhouetteScale: 'Accent Detail',
      geometryType: 'InstancedMesh (80 Tactile Domes + Backing Plates)',
      dimensionsMeters: [9.6, 0.025, 3.2],
      baseElevationY: 0.585,
      explodedOffsetY: 3.55,
      roughness: 0.32,
      metalness: 0.15,
      celBands: 4,
      inkOutlineWidth: 0.02,
      description:
        'Iconic anime street intersection yellow tactile warning tiles placed at sidewalk crosswalk approaches.',
    },
    {
      id: 'drainage-utility-covers',
      index: 8,
      name: 'Cast-Iron Storm Grates & Manhole Covers',
      silhouetteScale: 'Accent Detail',
      geometryType: 'CylinderGeometry + Instanced Grate Bars',
      dimensionsMeters: [13.4, 0.03, 32.0],
      baseElevationY: 0.44,
      explodedOffsetY: 4.15,
      roughness: 0.28,
      metalness: 0.65,
      celBands: 4,
      inkOutlineWidth: 0.025,
      description:
        'Recessed gutter storm drain grates and central utility manhole lids with concentric comic ink line work.',
    },
    {
      id: 'center-median-island',
      index: 9,
      name: 'Sculpted Traffic Island, Reflector Studs & Bollards',
      silhouetteScale: 'Secondary Read',
      geometryType: 'ExtrudeGeometry Island + LatheGeometry Bollards',
      dimensionsMeters: [1.4, 0.95, 10.0],
      baseElevationY: 0.465,
      explodedOffsetY: 4.75,
      roughness: 0.48,
      metalness: 0.22,
      celBands: 4,
      inkOutlineWidth: 0.03,
      description:
        'Central pedestrian refuge island with amber cat-eye road studs and striped cel-shaded traffic bollards.',
    },
    {
      id: 'surface-weathering-puddles',
      index: 10,
      name: 'Comic Ink Asphalt Cracks & Sky-Reflective Puddles',
      silhouetteScale: 'Accent Detail',
      geometryType: 'ShapeGeometry Puddles + LineSegments Ink Cracks',
      dimensionsMeters: [13.0, 0.01, 36.0],
      baseElevationY: 0.49,
      explodedOffsetY: 5.35,
      roughness: 0.12,
      metalness: 0.35,
      celBands: 3,
      inkOutlineWidth: 0.02,
      description:
        'Stylized blue-sky reflections in roadside puddles paired with hand-drawn-style ink crack vectors.',
    },
    {
      id: 'roadside-utility-strip',
      index: 11,
      name: 'Extended Multi-Block City, Cross-Streets & 360° Distant Mountains',
      silhouetteScale: 'Primary Silhouette',
      geometryType: 'LOD Tier 1/2 City Blocks + Cross-Streets + 68 Mountain Peaks',
      dimensionsMeters: [1600.0, 180.0, 1600.0],
      baseElevationY: 0.615,
      explodedOffsetY: 5.95,
      roughness: 0.55,
      metalness: 0.15,
      celBands: 3,
      inkOutlineWidth: 0.025,
      description:
        'Surrounding multi-block city with cross-streets, mid-ground buildings with balconies (Tier 1), receding town outskirts (Tier 2), and 360° encircling foothills and snow-capped mountains (Tier 3).',
    },
    {
      id: 'halftone-burst-rig',
      index: 12,
      name: 'IRL Photorealistic Blue Sky, Sun Disc, Corona & Volumetric Clouds Dome',
      silhouetteScale: 'Primary Silhouette',
      geometryType: '360° Rayleigh/Mie Atmospheric Sky Dome Shader (Radius 920m)',
      dimensionsMeters: [1840.0, 920.0, 1840.0],
      baseElevationY: -0.04,
      explodedOffsetY: 6.55,
      roughness: 1.0,
      metalness: 0.0,
      celBands: 3,
      inkOutlineWidth: 0.0,
      description:
        '360° physically-inspired IRL blue sky dome with Rayleigh/Mie atmospheric scattering, blazing solar disc & corona, drifting cumulus clouds, and optional halftone burst overlay.',
    },
    {
      id: 'storefront-crack-and-sons',
      index: 13,
      name: '6 Hero Block Storefronts, Upper Apartment Facades & Wrought-Iron Balconies',
      silhouetteScale: 'Primary Silhouette',
      geometryType: 'Multi-Story Masonry, Balconies, Awnings, Signs & Rooftops',
      dimensionsMeters: [34.0, 16.5, 38.0],
      baseElevationY: 0.55,
      explodedOffsetY: 7.15,
      roughness: 0.62,
      metalness: 0.14,
      celBands: 3,
      inkOutlineWidth: 0.035,
      description:
        '6 complete multi-story hero buildings ("CRACK & SONS", "LE PETIT TAILOR" with mannequin, "ARCADE HARDWARE", "VELVET BEAN CAFÉ", "STARLIGHT BOOKS", "SUNSET GROCERY") with 2–3 upper apartment stories, cantilevered wrought-iron balconies, and rooftop water tanks.',
    },
    {
      id: 'anime-lofi-cars',
      index: 14,
      name: 'Cel-Shaded Anime / Lo-Fi Street Cars (Parked & Passing Fleet)',
      silhouetteScale: 'Primary Silhouette',
      geometryType: '11-Part Sculpted Coupe Chassis, Greenhouse, Tires & Plates',
      dimensionsMeters: [1.96, 1.42, 4.65],
      baseElevationY: 0.31,
      explodedOffsetY: 7.75,
      roughness: 0.36,
      metalness: 0.25,
      celBands: 3,
      inkOutlineWidth: 0.04,
      description:
        'Stylized anime street cars with dark comic ink outlines, flat two-tone bodywork, diagonal windshield reflection slashes, alloy wheels, headlights, and custom license plates.',
    },
    {
      id: 'anime-street-lamps',
      index: 15,
      name: 'Street Lamps, American Fire Hydrants, Dustbins, Benches, Mailboxes & Trees',
      silhouetteScale: 'Secondary Read',
      geometryType: '8 Street Lamps + 4 Fire Hydrants + 4 Dustbins + 4 Benches + 6 Trees',
      dimensionsMeters: [22.0, 4.85, 38.0],
      baseElevationY: 0.52,
      explodedOffsetY: 8.35,
      roughness: 0.42,
      metalness: 0.55,
      celBands: 4,
      inkOutlineWidth: 0.05,
      description:
        'Collision-free sidewalk furniture strip featuring 8 vintage double-lantern street lamps, 4 crimson American cast-iron fire hydrants, 4 ribbed municipal steel dustbins with trash bags, 4 park benches, 2 blue US mailboxes, and 6 urban trees in iron grates.',
    },
  ],
};

export const SHOT_MANIFEST: ShotManifestEntry[] = [
  {
    shotId: 'SHOT-01-ESTABLISHING',
    title: '01. IRL Sun, Blue Sky & Multi-Block City Horizon Glide',
    startFrame: 0,
    endFrame: 119,
    musicalAnchor: 'Bars 1–2 (Intro Chord Swell)',
    narrativePurpose:
      'Establish the IRL Blue Sky and Sun shining over the distant mountain range, receding town blocks, multi-story balconies, and Main Street Section 1.',
    cameraStartPos: [1.2, 5.2, 23.5],
    cameraEndPos: [2.4, 4.1, 15.0],
    targetStart: [0.0, 6.5, -120.0],
    targetEnd: [-1.5, 5.5, -120.0],
    fov: 46,
    halftonePulseBoost: 0.0,
  },
  {
    shotId: 'SHOT-02-LOW-HERO',
    title: '02. Storefronts, Balconies, Fire Hydrant & Dustbin Street Tracking',
    startFrame: 120,
    endFrame: 239,
    musicalAnchor: 'Bars 3–4 (Downbeat Snare & Bass Entrance)',
    narrativePurpose:
      'Track past the American fire hydrant, municipal dustbin, street lamp, "NUT-1887" car, and "CRACK & SONS" & "LE PETIT TAILOR" multi-story buildings.',
    cameraStartPos: [-3.2, 2.0, 12.5],
    cameraEndPos: [-1.2, 1.85, 5.5],
    targetStart: [-8.5, 3.8, -4.0],
    targetEnd: [-9.5, 4.2, -8.5],
    fov: 42,
    halftonePulseBoost: 0.0,
  },
  {
    shotId: 'SHOT-03-HALFTONE-DROP',
    title: '03. Avenue Canyon, Cross-Streets & Mountain Valley Vista',
    startFrame: 240,
    endFrame: 359,
    musicalAnchor: 'Bars 5–6 (Chorus Accent)',
    narrativePurpose:
      'Look straight down the multi-block city avenue as building details step down toward the town outskirts and distant snow-capped mountains under the sun.',
    cameraStartPos: [0.0, 2.8, 14.0],
    cameraEndPos: [0.0, 2.2, 6.5],
    targetStart: [0.0, 5.0, -180.0],
    targetEnd: [0.0, 6.5, -220.0],
    fov: 48,
    halftonePulseBoost: 0.35,
  },
  {
    shotId: 'SHOT-04-ISOMETRIC-RESOLVE',
    title: '04. Aerial City Drone Flyover Across 4-Way Intersections & Cross-Streets',
    startFrame: 360,
    endFrame: 479,
    musicalAnchor: 'Bars 7–8 (Outro Phrase Resolution)',
    narrativePurpose:
      'Sweep high above the rooftops, pole-to-pole utility corridors, and 4-way intersections to reveal the full interconnected 2D city grid, turning traffic, and 360° mountain horizon.',
    cameraStartPos: [-28.0, 24.0, 12.0],
    cameraEndPos: [26.0, 28.0, 22.0],
    targetStart: [0.0, 1.5, -24.5],
    targetEnd: [-8.0, 2.5, -32.0],
    fov: 46,
    halftonePulseBoost: 0.0,
  },
];

export const CAMERA_PRESETS: Record<
  Exclude<CameraPresetId, 'remotion-choreographed'>,
  {
    label: string;
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  }
> = {
  'drone-city-flyover': {
    label: 'Aerial Drone City Flyover (Continuous Tour)',
    position: [0.0, 22.0, 38.0],
    target: [0.0, 2.0, -24.5],
    fov: 48,
  },
  'establishing-wide': {
    label: 'City, Sun & Mountains Wide',
    position: [1.4, 4.8, 22.5],
    target: [0.0, 6.2, -140.0],
    fov: 46,
  },
  'low-hero-street': {
    label: 'Low-Angle Street & Horizon',
    position: [-2.8, 1.65, 13.5],
    target: [0.5, 4.5, -120.0],
    fov: 42,
  },
  'isometric-blueprint': {
    label: 'High City & Mountain Crane',
    position: [16.5, 14.5, 22.5],
    target: [-1.5, 4.2, -45.0],
    fov: 42,
  },
  'overhead-marking-check': {
    label: 'Overhead City Block Plan',
    position: [0.0, 34.0, 6.0],
    target: [0.0, 0.0, -4.0],
    fov: 48,
  },
  'curb-drainage-closeup': {
    label: 'Hydrant, Dustbin & Curb Detail',
    position: [-4.4, 1.75, 12.6],
    target: [-8.2, 0.95, 7.2],
    fov: 36,
  },
  'storefront-hero-closeup': {
    label: '"CRACK & SONS" + Upper Balconies',
    position: [3.2, 4.6, 5.5],
    target: [-11.2, 5.2, -1.5],
    fov: 44,
  },
  'car-hero-showcase': {
    label: 'Anime Car, Hydrant & Shops',
    position: [-0.8, 1.85, 8.2],
    target: [-4.85, 1.1, 3.2],
    fov: 36,
  },
  'street-lamp-showcase': {
    label: 'Street Lamp, Balconies & Sky',
    position: [-1.8, 2.65, 11.8],
    target: [-7.85, 3.1, 6.8],
    fov: 42,
  },
};
