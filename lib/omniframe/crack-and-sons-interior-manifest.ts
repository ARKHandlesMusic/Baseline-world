export type InteriorCameraPresetId =
  | 'interior-choreographed-tour'
  | 'hero-nutcracker-closeup'
  | 'counter-and-register-closeup'
  | 'tv-commercial-showcase'
  | 'shelves-and-ornaments-closeup'
  | 'entrance-doorbell-chime'
  | 'rigged-door-handle-closeup'
  | 'interior-wide-overview';

export type InteriorLightMoodId =
  | 'warm-boutique'
  | 'festive-golden'
  | 'closing-twilight';

export type ShopDoorControlMode =
  | 'timeline-auto'
  | 'manual-open'
  | 'manual-closed'
  | 'turn-handle-only';

export interface InteriorAssetRequirementRow {
  id: string;
  assetName: string;
  requestedQuantity: string;
  builtQuantity: number;
  category:
    | 'architecture'
    | 'furniture'
    | 'nutcrackers'
    | 'gifts-wrapping'
    | 'holiday-decor'
    | 'lighting-fx'
    | 'signage-media';
  description: string;
}

export const CRACK_AND_SONS_INTERIOR_ASSET_TABLE: InteriorAssetRequirementRow[] =
  [
    {
      id: 'INT-SHELL-01',
      assetName: 'Interior room shell',
      requestedQuantity: '1',
      builtQuantity: 1,
      category: 'architecture',
      description:
        'Complete 8.8m × 6.8m × 4.2m Victorian-anime timber & brick shop shell with wainscoted walls, bay window alcove, and rigged entrance doorway opening onto Main Street',
    },
    {
      id: 'INT-FLOOR-01',
      assetName: 'Wooden floor',
      requestedQuantity: '1',
      builtQuantity: 1,
      category: 'architecture',
      description:
        'Aged walnut & oak herringbone/plank parquet wooden floor with hand-drawn comic ink seams, knot grain, and brass threshold strip',
    },
    {
      id: 'INT-WALL-01',
      assetName: 'Interior wall sections',
      requestedQuantity: '3–4',
      builtQuantity: 4,
      category: 'architecture',
      description:
        '4 detailed wall sections: West Display Wall, North Back Counter Heritage Wall, East TV & Gallery Wall, South Bay Window & Rigged Entrance Door Wall',
    },
    {
      id: 'INT-CEIL-01',
      assetName: 'Ceiling',
      requestedQuantity: '1',
      builtQuantity: 1,
      category: 'architecture',
      description:
        'Coffered dark mahogany timber beam ceiling with plaster bays, crown molding, and brass pendant medallions',
    },
    {
      id: 'INT-SHELF-01',
      assetName: 'Display shelves',
      requestedQuantity: '3–5',
      builtQuantity: 5,
      category: 'furniture',
      description:
        '5 tall 3.48m carved mahogany multi-tier display cupboards with 4 high-clearance velvet-lined shelves, brass brackets, and zero toy clipping',
    },
    {
      id: 'INT-COUNTER-01',
      assetName: 'Wooden counter',
      requestedQuantity: '1',
      builtQuantity: 1,
      category: 'furniture',
      description:
        'Full decorated wooden checkout & gift-wrapping counter with carved corbels, glass curio vitrine, brass foot-rail, and 3 promotional menu/price boards',
    },
    {
      id: 'INT-REGISTER-01',
      assetName: 'Cash register',
      requestedQuantity: '1',
      builtQuantity: 1,
      category: 'furniture',
      description:
        'Ornate vintage brass & crimson mechanical cash register with "$19.99" pop-up flags, 24 metallic keys, side crank handle, drawer, and receipt roll',
    },
    {
      id: 'INT-DOLL-DISP',
      assetName: 'Nutcracker display dolls',
      requestedQuantity: '8–15',
      builtQuantity: 14,
      category: 'nutcrackers',
      description:
        '14 distinct painted wooden Nutcracker soldiers across cupboard tiers and bay window risers with varied hats, tunics, beards, levers, and articulated jaws',
    },
    {
      id: 'INT-DOLL-HERO',
      assetName: 'Hero nutcracker doll',
      requestedQuantity: '1',
      builtQuantity: 1,
      category: 'nutcrackers',
      description:
        'Ultra-detailed 42-part Royal Hussar Hero Nutcracker on illuminated velvet pedestal with articulated clacking jaw, individual teeth, saber, crown, fringed epaulettes, and walnut lever',
    },
    {
      id: 'INT-GIFTBOX-01',
      assetName: 'Gift boxes',
      requestedQuantity: '6–10',
      builtQuantity: 10,
      category: 'gifts-wrapping',
      description:
        '10 decorative patterned cardboard & wooden gift boxes with fitted lids and gold foil trim seated flush on shelf liners and display cart',
    },
    {
      id: 'INT-PRESENT-01',
      assetName: 'Wrapped presents',
      requestedQuantity: '4–8',
      builtQuantity: 8,
      category: 'gifts-wrapping',
      description:
        '8 festive wrapped presents with striped/polka-dot paper, crossed satin ribbons, and sculpted 3D multi-loop bows',
    },
    {
      id: 'INT-ORNAMENT-01',
      assetName: 'Christmas ornaments',
      requestedQuantity: '6–12',
      builtQuantity: 12,
      category: 'holiday-decor',
      description:
        '12 sparkling cel-shaded metallic baubles, finials, and star ornaments on tree boughs, counter garland, and top-shelf brass display stands',
    },
    {
      id: 'INT-TREE-01',
      assetName: 'Small Christmas tree',
      requestedQuantity: '1',
      builtQuantity: 1,
      category: 'holiday-decor',
      description:
        'Lush multi-tier festive pine tree in a brass-hooped oak barrel planter with glowing star topper, mini fairy lights, tinsel, and baubles',
    },
    {
      id: 'INT-GARLAND-01',
      assetName: 'Garland',
      requestedQuantity: '2–3 runs',
      builtQuantity: 3,
      category: 'holiday-decor',
      description:
        '3 draped evergreen garland runs along the counter front, back wall cornice, and ceiling rafters with red velvet bows, gold berries, and warm lights',
    },
    {
      id: 'INT-WREATH-01',
      assetName: 'Decorative wreath',
      requestedQuantity: '1',
      builtQuantity: 1,
      category: 'holiday-decor',
      description:
        'Lush evergreen wreath with pinecones, twin golden bells, holly berries, and crimson velvet ribbon bow mounted on the hinged shop door',
    },
    {
      id: 'INT-HANGLIGHT-01',
      assetName: 'Hanging shop lights',
      requestedQuantity: '3–5',
      builtQuantity: 5,
      category: 'lighting-fx',
      description:
        '5 vintage brass & stained/amber glass pendant shop lights suspended from ceiling beams with warm volumetric light cones',
    },
    {
      id: 'INT-WALLLAMP-01',
      assetName: 'Wall lamps',
      requestedQuantity: '2',
      builtQuantity: 2,
      category: 'lighting-fx',
      description:
        '2 ornate wrought-iron bracket wall sconces with glowing warm amber lantern globes',
    },
    {
      id: 'INT-RUG-01',
      assetName: 'Rug',
      requestedQuantity: '1',
      builtQuantity: 1,
      category: 'furniture',
      description:
        'Ornate crimson, gold, and midnight-navy woven Victorian medallion runner rug with knotted fringe edges',
    },
    {
      id: 'INT-BASKET-01',
      assetName: 'Shopping basket',
      requestedQuantity: '1–2',
      builtQuantity: 2,
      category: 'gifts-wrapping',
      description:
        '2 vintage woven wicker & wire-mesh shopping baskets with dual handles and tissue/gift contents',
    },
    {
      id: 'INT-GIFTBAG-01',
      assetName: 'Gift bags',
      requestedQuantity: '3–5',
      builtQuantity: 5,
      category: 'gifts-wrapping',
      description:
        '5 boutique paper gift bags with twisted cord handles, tissue paper tufts, and "CRACK & SONS" crest',
    },
    {
      id: 'INT-WRAPROLL-01',
      assetName: 'Wrapping paper rolls',
      requestedQuantity: '2–3',
      builtQuantity: 3,
      category: 'gifts-wrapping',
      description:
        '3 festive patterned wrapping paper rolls mounted on a brass & wood cutter rack',
    },
    {
      id: 'INT-RIBBON-01',
      assetName: 'Ribbon spools',
      requestedQuantity: '2–4',
      builtQuantity: 4,
      category: 'gifts-wrapping',
      description:
        '4 turned wooden spools wound with crimson, gold, emerald, and candy-stripe satin ribbons',
    },
    {
      id: 'INT-PRICETAG-01',
      assetName: 'Price tags',
      requestedQuantity: '5–10',
      builtQuantity: 10,
      category: 'signage-media',
      description:
        '10 readable hanging & shelf-edge price tags ("$49.99", "$99.00", "SALE", "1887 EDITION", "NO REFUNDS") with brass hooks',
    },
    {
      id: 'INT-BELL-01',
      assetName: 'Small bell/chime',
      requestedQuantity: '1',
      builtQuantity: 1,
      category: 'furniture',
      description:
        'Polished brass counter service bell with plunger button + hanging brass nutcracker chime',
    },
    {
      id: 'INT-DOORBELL-01',
      assetName: 'Doorbell mechanism',
      requestedQuantity: '1',
      builtQuantity: 1,
      category: 'architecture',
      description:
        'Mechanical coiled leaf-spring & brass gong striker doorbell mechanism coupled to the rigged shop entrance door & turning brass lever handle',
    },
    {
      id: 'INT-DUST-01',
      assetName: 'Dust particles in light',
      requestedQuantity: '1 reusable effect',
      builtQuantity: 1,
      category: 'lighting-fx',
      description:
        'Reusable deterministic volumetric dust mote & 4-point sparkle particle system floating inside warm window and pendant light shafts',
    },
  ];

export interface InteriorShelfUnitSpec {
  id: string;
  label: string;
  position: [number, number, number];
  rotationY: number;
  width: number;
  height: number;
  depth: number;
  tierHeights: [number, number, number, number];
}

/**
 * 5 Tall Carved Mahogany Display Cupboards with 4 high-clearance tiers:
 * Tier 0 plank = 0.28m (velvet top = 0.32m, clearance up to 1.0925m = 0.7725m)
 * Tier 1 plank = 1.12m (velvet top = 1.16m, clearance up to 1.9525m = 0.7925m)
 * Tier 2 plank = 1.98m (velvet top = 2.02m, clearance up to 2.8125m = 0.7925m)
 * Tier 3 plank = 2.84m (velvet top = 2.88m, clearance up to 3.4600m = 0.5800m)
 */
export const INTERIOR_SHELF_SPECS: InteriorShelfUnitSpec[] = [
  {
    id: 'shelf-unit-01',
    label: 'West Front Mahogany Display Cupboard #1 (Dragoon & Rifleman Regiment)',
    position: [-3.92, 0, 0.55],
    rotationY: Math.PI / 2,
    width: 1.88,
    height: 3.48,
    depth: 0.58,
    tierHeights: [0.28, 1.12, 1.98, 2.84],
  },
  {
    id: 'shelf-unit-02',
    label: 'West Back Mahogany Display Cupboard #2 (Royal Bavarian Collection)',
    position: [-3.92, 0, -1.55],
    rotationY: Math.PI / 2,
    width: 1.88,
    height: 3.48,
    depth: 0.58,
    tierHeights: [0.28, 1.12, 1.98, 2.84],
  },
  {
    id: 'shelf-unit-03',
    label: 'North Back Wall Left Apothecary Cupboard #3',
    position: [-1.55, 0, -2.98],
    rotationY: 0,
    width: 1.68,
    height: 3.48,
    depth: 0.54,
    tierHeights: [0.28, 1.12, 1.98, 2.84],
  },
  {
    id: 'shelf-unit-04',
    label: 'North Back Wall Right Apothecary Cupboard #4',
    position: [1.55, 0, -2.98],
    rotationY: 0,
    width: 1.68,
    height: 3.48,
    depth: 0.54,
    tierHeights: [0.28, 1.12, 1.98, 2.84],
  },
  {
    id: 'shelf-unit-05',
    label: 'East Gallery Showcase Cupboard #5 (Hussars & Holiday Gift Sets)',
    position: [3.92, 0, 0.05],
    rotationY: -Math.PI / 2,
    width: 1.96,
    height: 3.48,
    depth: 0.58,
    tierHeights: [0.28, 1.12, 1.98, 2.84],
  },
];

export type NutcrackerHatStyle =
  | 'royal-crown'
  | 'tall-shako'
  | 'bearskin-busby'
  | 'admiral-tricorn'
  | 'gilded-helmet';

export interface NutcrackerDollSpec {
  id: string;
  name: string;
  isHero: boolean;
  shelfUnitId?: string;
  shelfTierIndex?: number;
  position: [number, number, number];
  rotationY: number;
  scale: number;
  tunicColor: string;
  trouserColor: string;
  trimGoldColor: string;
  hatStyle: NutcrackerHatStyle;
  hatColor: string;
  plumeColor: string;
  beardStyle: 'long-white' | 'curled-silver' | 'imperial-goatee';
  eyeColor: string;
  hasSaber: boolean;
  hasHalberd: boolean;
  priceLabel: string;
  jawPhaseOffset: number;
}

/**
 * Returns the exact unscaled top height (in meters) of a Nutcracker doll
 * based on its hat geometry and vertical halberd tip.
 */
export function getUnscaledNutcrackerHeightMeters(
  spec: Pick<NutcrackerDollSpec, 'hatStyle' | 'hasHalberd'>,
): number {
  let hatTopY = 1.4235; // tall-shako / admiral-tricorn / gilded-helmet plume tip
  if (spec.hatStyle === 'royal-crown') {
    hatTopY = 1.228;
  } else if (spec.hatStyle === 'bearskin-busby') {
    hatTopY = 1.366;
  }
  const halberdTopY = spec.hasHalberd ? 1.31 : 0;
  return Math.max(hatTopY, halberdTopY);
}

export const HERO_NUTCRACKER_SPEC: NutcrackerDollSpec = {
  id: 'hero-nutcracker-01',
  name: 'The Grand Royal Hussar Nutcracker (1887 Masterpiece Edition)',
  isHero: true,
  position: [1.35, 0.92, -0.35],
  rotationY: -0.42,
  scale: 1.48,
  tunicColor: '#B91C1C',
  trouserColor: '#1E3A8A',
  trimGoldColor: '#FACC15',
  hatStyle: 'royal-crown',
  hatColor: '#111827',
  plumeColor: '#EF4444',
  beardStyle: 'long-white',
  eyeColor: '#38BDF8',
  hasSaber: true,
  hasHalberd: true,
  priceLabel: '$199.99',
  jawPhaseOffset: 0,
};

/**
 * 14 Display Nutcracker Dolls:
 * Every shelf-mounted doll sits flush on the velvet liner (y = 1.16m on Tier 1, y = 2.02m on Tier 2)
 * with scale 0.50–0.54 so its highest plume/crown/halberd tip has >= 5.5cm vertical clearance
 * below the upper cupboard plank and >= 12cm horizontal clearance from backboards and side pillars.
 */
export const DISPLAY_NUTCRACKER_SPECS: NutcrackerDollSpec[] = [
  // West Cupboard 1 (shelf-unit-01, centerZ = 0.55, usable Z = [-0.29, +1.39]) - 3 dolls
  {
    id: 'nutcracker-disp-01',
    name: 'Prussian Dragoon Captain #01',
    isHero: false,
    shelfUnitId: 'shelf-unit-01',
    shelfTierIndex: 1,
    position: [-3.88, 1.16, 0.98],
    rotationY: Math.PI / 2,
    scale: 0.51,
    tunicColor: '#1D4ED8',
    trouserColor: '#F8FAFC',
    trimGoldColor: '#FACC15',
    hatStyle: 'tall-shako',
    hatColor: '#0F172A',
    plumeColor: '#FDE047',
    beardStyle: 'long-white',
    eyeColor: '#60A5FA',
    hasSaber: true,
    hasHalberd: false,
    priceLabel: '$49.99',
    jawPhaseOffset: 0.4,
  },
  {
    id: 'nutcracker-disp-02',
    name: 'Emerald Forest Rifleman #02',
    isHero: false,
    shelfUnitId: 'shelf-unit-01',
    shelfTierIndex: 1,
    position: [-3.88, 1.16, 0.12],
    rotationY: Math.PI / 2,
    scale: 0.52,
    tunicColor: '#047857',
    trouserColor: '#1F2937',
    trimGoldColor: '#F59E0B',
    hatStyle: 'bearskin-busby',
    hatColor: '#1C1917',
    plumeColor: '#10B981',
    beardStyle: 'curled-silver',
    eyeColor: '#34D399',
    hasSaber: false,
    hasHalberd: true,
    priceLabel: '$54.00',
    jawPhaseOffset: 1.1,
  },
  {
    id: 'nutcracker-disp-03',
    name: 'Crimson Guard Drummer #03',
    isHero: false,
    shelfUnitId: 'shelf-unit-01',
    shelfTierIndex: 2,
    position: [-3.88, 2.02, 0.55],
    rotationY: Math.PI / 2,
    scale: 0.54,
    tunicColor: '#DC2626',
    trouserColor: '#1E293B',
    trimGoldColor: '#FDE047',
    hatStyle: 'royal-crown',
    hatColor: '#B45309',
    plumeColor: '#F8FAFC',
    beardStyle: 'long-white',
    eyeColor: '#F59E0B',
    hasSaber: true,
    hasHalberd: false,
    priceLabel: '$62.50',
    jawPhaseOffset: 1.8,
  },
  // West Cupboard 2 (shelf-unit-02, centerZ = -1.55, usable Z = [-2.39, -0.71]) - 3 dolls
  {
    id: 'nutcracker-disp-04',
    name: 'Imperial Admiral Tricorn #04',
    isHero: false,
    shelfUnitId: 'shelf-unit-02',
    shelfTierIndex: 1,
    position: [-3.88, 1.16, -1.55],
    rotationY: Math.PI / 2,
    scale: 0.51,
    tunicColor: '#312E81',
    trouserColor: '#F1F5F9',
    trimGoldColor: '#FACC15',
    hatStyle: 'admiral-tricorn',
    hatColor: '#0F172A',
    plumeColor: '#38BDF8',
    beardStyle: 'imperial-goatee',
    eyeColor: '#818CF8',
    hasSaber: true,
    hasHalberd: false,
    priceLabel: '$59.99',
    jawPhaseOffset: 2.3,
  },
  {
    id: 'nutcracker-disp-05',
    name: 'Golden Palace Sentinel #05',
    isHero: false,
    shelfUnitId: 'shelf-unit-02',
    shelfTierIndex: 2,
    position: [-3.88, 2.02, -1.12],
    rotationY: Math.PI / 2,
    scale: 0.51,
    tunicColor: '#991B1B',
    trouserColor: '#0F172A',
    trimGoldColor: '#FDE047',
    hatStyle: 'gilded-helmet',
    hatColor: '#D97706',
    plumeColor: '#EF4444',
    beardStyle: 'long-white',
    eyeColor: '#FBBF24',
    hasSaber: false,
    hasHalberd: true,
    priceLabel: '$68.00',
    jawPhaseOffset: 2.9,
  },
  {
    id: 'nutcracker-disp-06',
    name: 'Bavarian King Wilhelm #06',
    isHero: false,
    shelfUnitId: 'shelf-unit-02',
    shelfTierIndex: 2,
    position: [-3.88, 2.02, -1.98],
    rotationY: Math.PI / 2,
    scale: 0.54,
    tunicColor: '#6D28D9',
    trouserColor: '#F8FAFC',
    trimGoldColor: '#FACC15',
    hatStyle: 'royal-crown',
    hatColor: '#F59E0B',
    plumeColor: '#A855F7',
    beardStyle: 'long-white',
    eyeColor: '#C084FC',
    hasSaber: true,
    hasHalberd: true,
    priceLabel: '$79.99',
    jawPhaseOffset: 3.4,
  },
  // North Back Wall Left & Right Apothecary Cupboards (shelf-unit-03 & shelf-unit-04) - 2 dolls
  {
    id: 'nutcracker-disp-07',
    name: 'Master Walnut Crusher #07',
    isHero: false,
    shelfUnitId: 'shelf-unit-03',
    shelfTierIndex: 2,
    position: [-1.55, 2.02, -2.94],
    rotationY: 0,
    scale: 0.52,
    tunicColor: '#B91C1C',
    trouserColor: '#1E293B',
    trimGoldColor: '#FACC15',
    hatStyle: 'bearskin-busby',
    hatColor: '#090D16',
    plumeColor: '#FDE047',
    beardStyle: 'long-white',
    eyeColor: '#F87171',
    hasSaber: true,
    hasHalberd: false,
    priceLabel: '$85.00',
    jawPhaseOffset: 4.0,
  },
  {
    id: 'nutcracker-disp-08',
    name: 'Duke of Nuremberg #08',
    isHero: false,
    shelfUnitId: 'shelf-unit-04',
    shelfTierIndex: 2,
    position: [1.55, 2.02, -2.94],
    rotationY: 0,
    scale: 0.51,
    tunicColor: '#0F766E',
    trouserColor: '#F8FAFC',
    trimGoldColor: '#FACC15',
    hatStyle: 'tall-shako',
    hatColor: '#111827',
    plumeColor: '#2DD4BF',
    beardStyle: 'curled-silver',
    eyeColor: '#5EEAD4',
    hasSaber: true,
    hasHalberd: true,
    priceLabel: '$89.00',
    jawPhaseOffset: 4.5,
  },
  // East Cupboard 5 (shelf-unit-05, centerZ = 0.05, usable Z = [-0.83, +0.93]) - 3 dolls
  {
    id: 'nutcracker-disp-09',
    name: 'Scarlet Grenadier #09',
    isHero: false,
    shelfUnitId: 'shelf-unit-05',
    shelfTierIndex: 1,
    position: [3.88, 1.16, -0.38],
    rotationY: -Math.PI / 2,
    scale: 0.52,
    tunicColor: '#DC2626',
    trouserColor: '#F8FAFC',
    trimGoldColor: '#FACC15',
    hatStyle: 'bearskin-busby',
    hatColor: '#111827',
    plumeColor: '#EF4444',
    beardStyle: 'long-white',
    eyeColor: '#38BDF8',
    hasSaber: true,
    hasHalberd: false,
    priceLabel: '$49.99',
    jawPhaseOffset: 5.1,
  },
  {
    id: 'nutcracker-disp-10',
    name: 'Cobalt Hussar Major #10',
    isHero: false,
    shelfUnitId: 'shelf-unit-05',
    shelfTierIndex: 1,
    position: [3.88, 1.16, 0.48],
    rotationY: -Math.PI / 2,
    scale: 0.51,
    tunicColor: '#1E40AF',
    trouserColor: '#0F172A',
    trimGoldColor: '#FDE047',
    hatStyle: 'tall-shako',
    hatColor: '#1E293B',
    plumeColor: '#60A5FA',
    beardStyle: 'imperial-goatee',
    eyeColor: '#93C5FD',
    hasSaber: false,
    hasHalberd: true,
    priceLabel: '$55.00',
    jawPhaseOffset: 5.6,
  },
  {
    id: 'nutcracker-disp-11',
    name: 'Gilded Crown Prince #11',
    isHero: false,
    shelfUnitId: 'shelf-unit-05',
    shelfTierIndex: 2,
    position: [3.88, 2.02, 0.05],
    rotationY: -Math.PI / 2,
    scale: 0.54,
    tunicColor: '#7C2D12',
    trouserColor: '#FEF3C7',
    trimGoldColor: '#FACC15',
    hatStyle: 'royal-crown',
    hatColor: '#D97706',
    plumeColor: '#FDE047',
    beardStyle: 'long-white',
    eyeColor: '#FBBF24',
    hasSaber: true,
    hasHalberd: false,
    priceLabel: '$74.50',
    jawPhaseOffset: 0.9,
  },
  // South Front Bay Window Display Tier (Staring Window Army on Velvet Riser y = 0.87m & Center Podium y = 1.02m) - 3 dolls
  {
    id: 'nutcracker-disp-12',
    name: 'Window Sentry Left #12',
    isHero: false,
    position: [-2.15, 0.87, 2.75],
    rotationY: 0,
    scale: 0.78,
    tunicColor: '#DC2626',
    trouserColor: '#1E3A8A',
    trimGoldColor: '#FACC15',
    hatStyle: 'tall-shako',
    hatColor: '#0F172A',
    plumeColor: '#EF4444',
    beardStyle: 'long-white',
    eyeColor: '#FACC15',
    hasSaber: true,
    hasHalberd: false,
    priceLabel: '$45.00',
    jawPhaseOffset: 1.5,
  },
  {
    id: 'nutcracker-disp-13',
    name: 'Window Commander Center #13',
    isHero: false,
    position: [-1.45, 1.02, 2.75],
    rotationY: 0,
    scale: 0.84,
    tunicColor: '#991B1B',
    trouserColor: '#0F172A',
    trimGoldColor: '#FDE047',
    hatStyle: 'royal-crown',
    hatColor: '#F59E0B',
    plumeColor: '#F8FAFC',
    beardStyle: 'long-white',
    eyeColor: '#EF4444',
    hasSaber: true,
    hasHalberd: true,
    priceLabel: '$65.00',
    jawPhaseOffset: 2.2,
  },
  {
    id: 'nutcracker-disp-14',
    name: 'Window Sentry Right #14',
    isHero: false,
    position: [-0.75, 0.87, 2.75],
    rotationY: 0,
    scale: 0.78,
    tunicColor: '#1D4ED8',
    trouserColor: '#F8FAFC',
    trimGoldColor: '#FACC15',
    hatStyle: 'bearskin-busby',
    hatColor: '#0F172A',
    plumeColor: '#38BDF8',
    beardStyle: 'curled-silver',
    eyeColor: '#38BDF8',
    hasSaber: false,
    hasHalberd: true,
    priceLabel: '$45.00',
    jawPhaseOffset: 3.1,
  },
];

export interface InteriorBoxItemSpec {
  id: string;
  shelfUnitId?: string;
  shelfTierIndex?: number;
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
  secondaryColor: string;
}

/**
 * 10 Gift Boxes seated flush on Cart Trays (y = 0.31m, 0.81m) and Cupboard Tier 0 (y = 0.32m).
 */
export const INTERIOR_GIFT_BOX_SPECS: InteriorBoxItemSpec[] = [
  {
    id: 'gift-box-01',
    pos: [-1.85, 0.81, -0.52],
    size: [0.28, 0.18, 0.24],
    color: '#B91C1C',
    secondaryColor: '#FACC15',
  },
  {
    id: 'gift-box-02',
    pos: [-1.48, 0.81, -0.38],
    size: [0.26, 0.22, 0.22],
    color: '#1E3A8A',
    secondaryColor: '#F8FAFC',
  },
  {
    id: 'gift-box-03',
    pos: [-1.65, 0.31, -0.45],
    size: [0.34, 0.22, 0.28],
    color: '#047857',
    secondaryColor: '#FACC15',
  },
  {
    id: 'gift-box-04',
    shelfUnitId: 'shelf-unit-01',
    shelfTierIndex: 0,
    pos: [-3.88, 0.32, 0.92],
    size: [0.26, 0.2, 0.28],
    color: '#7C3AED',
    secondaryColor: '#FDE047',
  },
  {
    id: 'gift-box-05',
    shelfUnitId: 'shelf-unit-01',
    shelfTierIndex: 0,
    pos: [-3.88, 0.32, 0.18],
    size: [0.26, 0.18, 0.26],
    color: '#DC2626',
    secondaryColor: '#F8FAFC',
  },
  {
    id: 'gift-box-06',
    shelfUnitId: 'shelf-unit-02',
    shelfTierIndex: 0,
    pos: [-3.88, 0.32, -1.55],
    size: [0.28, 0.2, 0.28],
    color: '#B45309',
    secondaryColor: '#FEF3C7',
  },
  {
    id: 'gift-box-07',
    shelfUnitId: 'shelf-unit-03',
    shelfTierIndex: 0,
    pos: [-1.55, 0.32, -2.94],
    size: [0.32, 0.22, 0.26],
    color: '#991B1B',
    secondaryColor: '#FACC15',
  },
  {
    id: 'gift-box-08',
    shelfUnitId: 'shelf-unit-04',
    shelfTierIndex: 0,
    pos: [1.55, 0.32, -2.94],
    size: [0.32, 0.22, 0.26],
    color: '#1D4ED8',
    secondaryColor: '#FACC15',
  },
  {
    id: 'gift-box-09',
    shelfUnitId: 'shelf-unit-05',
    shelfTierIndex: 0,
    pos: [3.88, 0.32, -0.32],
    size: [0.26, 0.2, 0.26],
    color: '#065F46',
    secondaryColor: '#FDE047',
  },
  {
    id: 'gift-box-10',
    shelfUnitId: 'shelf-unit-05',
    shelfTierIndex: 0,
    pos: [3.88, 0.32, 0.38],
    size: [0.26, 0.18, 0.25],
    color: '#BE123C',
    secondaryColor: '#F8FAFC',
  },
];

/**
 * 8 Wrapped Presents seated flush on Floor/Rug, Countertop (y = 1.032m), and North Cupboard Tier 1 (y = 1.16m).
 */
export const INTERIOR_WRAPPED_PRESENT_SPECS: InteriorBoxItemSpec[] = [
  {
    id: 'wrapped-present-01',
    pos: [-2.05, 0.01, 1.45],
    size: [0.36, 0.28, 0.34],
    color: '#DC2626',
    secondaryColor: '#FACC15',
  },
  {
    id: 'wrapped-present-02',
    pos: [-2.75, 0.01, 1.95],
    size: [0.32, 0.24, 0.32],
    color: '#16A34A',
    secondaryColor: '#EF4444',
  },
  {
    id: 'wrapped-present-03',
    pos: [-2.28, 0.01, 2.12],
    size: [0.28, 0.22, 0.28],
    color: '#2563EB',
    secondaryColor: '#FDE047',
  },
  {
    id: 'wrapped-present-04',
    pos: [0.38, 1.032, -1.78],
    size: [0.28, 0.2, 0.24],
    color: '#9333EA',
    secondaryColor: '#FACC15',
  },
  {
    id: 'wrapped-present-05',
    pos: [1.85, 0.01, -0.82],
    size: [0.34, 0.26, 0.32],
    color: '#E11D48',
    secondaryColor: '#F8FAFC',
  },
  {
    id: 'wrapped-present-06',
    pos: [0.92, 0.01, -0.88],
    size: [0.3, 0.24, 0.28],
    color: '#0284C7',
    secondaryColor: '#FACC15',
  },
  {
    id: 'wrapped-present-07',
    shelfUnitId: 'shelf-unit-03',
    shelfTierIndex: 1,
    pos: [-1.55, 1.16, -2.94],
    size: [0.28, 0.22, 0.26],
    color: '#D97706',
    secondaryColor: '#DC2626',
  },
  {
    id: 'wrapped-present-08',
    shelfUnitId: 'shelf-unit-04',
    shelfTierIndex: 1,
    pos: [1.55, 1.16, -2.94],
    size: [0.28, 0.22, 0.26],
    color: '#059669',
    secondaryColor: '#FACC15',
  },
];

export interface InteriorGiftBagSpec {
  id: string;
  shelfUnitId?: string;
  shelfTierIndex?: number;
  pos: [number, number, number];
  rotationY: number;
  color: string;
}

/**
 * 5 Boutique Gift Bags seated flush on Countertop (y = 1.032m) and Cupboard Tier 3 (y = 2.88m).
 */
export const INTERIOR_GIFT_BAG_SPECS: InteriorGiftBagSpec[] = [
  {
    id: 'gift-bag-01',
    pos: [-0.45, 1.032, -1.62],
    rotationY: 0,
    color: '#B91C1C',
  },
  {
    id: 'gift-bag-02',
    pos: [0.62, 1.032, -1.65],
    rotationY: 0,
    color: '#1E3A8A',
  },
  {
    id: 'gift-bag-03',
    shelfUnitId: 'shelf-unit-01',
    shelfTierIndex: 3,
    pos: [-3.88, 2.88, 0.55],
    rotationY: Math.PI / 2,
    color: '#047857',
  },
  {
    id: 'gift-bag-04',
    shelfUnitId: 'shelf-unit-02',
    shelfTierIndex: 3,
    pos: [-3.88, 2.88, -1.55],
    rotationY: Math.PI / 2,
    color: '#7C3AED',
  },
  {
    id: 'gift-bag-05',
    shelfUnitId: 'shelf-unit-05',
    shelfTierIndex: 3,
    pos: [3.88, 2.88, 0.05],
    rotationY: -Math.PI / 2,
    color: '#D97706',
  },
];

export interface InteriorOrnamentSpec {
  id: string;
  shelfUnitId?: string;
  shelfTierIndex?: number;
  pos: [number, number, number];
  color: string;
  hasBrassStand: boolean;
}

/**
 * 12 Sparkling Christmas Ornaments (6 on Christmas Tree, 2 on Counter Garland, 4 on Cupboard Tier 3 Brass Display Stands at y = 2.88m).
 */
export const INTERIOR_ORNAMENT_SPECS: InteriorOrnamentSpec[] = [
  {
    id: 'ornament-01',
    pos: [-2.15, 0.85, 1.85],
    color: '#EF4444',
    hasBrassStand: false,
  },
  {
    id: 'ornament-02',
    pos: [-2.72, 0.92, 1.82],
    color: '#FACC15',
    hasBrassStand: false,
  },
  {
    id: 'ornament-03',
    pos: [-2.35, 1.25, 1.98],
    color: '#38BDF8',
    hasBrassStand: false,
  },
  {
    id: 'ornament-04',
    pos: [-2.62, 1.38, 1.42],
    color: '#10B981',
    hasBrassStand: false,
  },
  {
    id: 'ornament-05',
    pos: [-2.25, 1.65, 1.78],
    color: '#A855F7',
    hasBrassStand: false,
  },
  {
    id: 'ornament-06',
    pos: [-2.55, 1.88, 1.72],
    color: '#F43F5E',
    hasBrassStand: false,
  },
  {
    id: 'ornament-07',
    pos: [-0.95, 0.92, -1.35],
    color: '#EF4444',
    hasBrassStand: false,
  },
  {
    id: 'ornament-08',
    pos: [0.95, 0.92, -1.35],
    color: '#FACC15',
    hasBrassStand: false,
  },
  {
    id: 'ornament-09',
    shelfUnitId: 'shelf-unit-01',
    shelfTierIndex: 3,
    pos: [-3.88, 2.88, 1.02],
    color: '#38BDF8',
    hasBrassStand: true,
  },
  {
    id: 'ornament-10',
    shelfUnitId: 'shelf-unit-02',
    shelfTierIndex: 3,
    pos: [-3.88, 2.88, -1.08],
    color: '#10B981',
    hasBrassStand: true,
  },
  {
    id: 'ornament-11',
    shelfUnitId: 'shelf-unit-05',
    shelfTierIndex: 3,
    pos: [3.88, 2.88, -0.45],
    color: '#A855F7',
    hasBrassStand: true,
  },
  {
    id: 'ornament-12',
    shelfUnitId: 'shelf-unit-05',
    shelfTierIndex: 3,
    pos: [3.88, 2.88, 0.55],
    color: '#F43F5E',
    hasBrassStand: true,
  },
];

export interface PriceTagSpec {
  id: string;
  priceText: string;
  subtitleText: string;
  position: [number, number, number];
  rotationY: number;
  accentColor: string;
}

/**
 * 10 Readable Swing Price Tags positioned cleanly in front of shelf lips & pedestals (zero shelf/doll clipping).
 */
export const INTERIOR_PRICE_TAG_SPECS: PriceTagSpec[] = [
  {
    id: 'price-tag-01',
    priceText: '$199.99',
    subtitleText: 'HERO 1887 EDITION',
    position: [1.68, 1.38, -0.18],
    rotationY: -0.35,
    accentColor: '#DC2626',
  },
  {
    id: 'price-tag-02',
    priceText: '$49.99',
    subtitleText: 'DRAGOON CAPTAIN',
    position: [-3.58, 1.05, 0.98],
    rotationY: Math.PI / 2,
    accentColor: '#D97706',
  },
  {
    id: 'price-tag-03',
    priceText: '$62.50',
    subtitleText: 'ROYAL DRUMMER',
    position: [-3.58, 1.91, 0.55],
    rotationY: Math.PI / 2,
    accentColor: '#DC2626',
  },
  {
    id: 'price-tag-04',
    priceText: '$79.99',
    subtitleText: 'BAVARIAN KING',
    position: [-3.58, 1.91, -1.98],
    rotationY: Math.PI / 2,
    accentColor: '#7C3AED',
  },
  {
    id: 'price-tag-05',
    priceText: '$85.00',
    subtitleText: 'WALNUT CRUSHER',
    position: [-1.55, 1.91, -2.66],
    rotationY: 0.0,
    accentColor: '#DC2626',
  },
  {
    id: 'price-tag-06',
    priceText: '$89.00',
    subtitleText: 'NUREMBERG DUKE',
    position: [1.55, 1.91, -2.66],
    rotationY: 0.0,
    accentColor: '#059669',
  },
  {
    id: 'price-tag-07',
    priceText: '$55.00',
    subtitleText: 'HUSSAR MAJOR',
    position: [3.58, 1.05, 0.48],
    rotationY: -Math.PI / 2,
    accentColor: '#2563EB',
  },
  {
    id: 'price-tag-08',
    priceText: 'SALE 20%',
    subtitleText: 'HOLIDAY BUNDLES',
    position: [-1.72, 1.18, -0.58],
    rotationY: 0.4,
    accentColor: '#E11D48',
  },
  {
    id: 'price-tag-09',
    priceText: '$19.99',
    subtitleText: 'ORNAMENT SET (12)',
    position: [-0.85, 1.16, -1.32],
    rotationY: 0.0,
    accentColor: '#16A34A',
  },
  {
    id: 'price-tag-10',
    priceText: 'NO REFUNDS',
    subtitleText: 'GENTLEMEN BEWARE!',
    position: [0.65, 1.24, -1.32],
    rotationY: -0.15,
    accentColor: '#DC2626',
  },
];

/**
 * Pure-logic spatial validation verifying that ALL toys (14 Nutcracker display dolls,
 * 10 gift boxes, 8 wrapped presents, 5 gift bags, 12 ornaments) have ZERO phasing/clipping
 * against the 5 carved mahogany cupboards (shelf planks, velvet liners, side pillars,
 * backboards, and top crown headers).
 */
export function validateInteriorCupboardAndToyClearance(): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  const shelfMap = new Map(INTERIOR_SHELF_SPECS.map((s) => [s.id, s]));

  function checkShelfContainment(params: {
    itemId: string;
    shelfUnitId: string;
    tierIndex: number;
    x: number;
    y: number;
    z: number;
    height: number;
    halfSpanAlongWidth: number;
    halfSpanAlongDepth: number;
  }): void {
    const shelf = shelfMap.get(params.shelfUnitId);
    if (!shelf) {
      violations.push(`${params.itemId}: unknown shelfUnitId ${params.shelfUnitId}`);
      return;
    }

    const tierPlankY = shelf.tierHeights[params.tierIndex];
    const expectedSurfaceY = Number((tierPlankY + 0.04).toFixed(4));
    if (Math.abs(params.y - expectedSurfaceY) > 0.008) {
      violations.push(
        `${params.itemId}: bottom Y (${params.y}) is not flush with shelf ${shelf.id} tier ${params.tierIndex} velvet surface (${expectedSurfaceY})`,
      );
    }

    const ceilingBottomY =
      params.tierIndex < shelf.tierHeights.length - 1
        ? shelf.tierHeights[params.tierIndex + 1] - 0.0275
        : shelf.height - 0.02;

    const itemTopY = params.y + params.height;
    if (itemTopY > ceilingBottomY - 0.03) {
      violations.push(
        `${params.itemId}: top Y (${itemTopY.toFixed(3)}m) phases into upper shelf/crown (${ceilingBottomY.toFixed(3)}m) on ${shelf.id}`,
      );
    }

    // Check horizontal backboard & side pillar bounds
    const isEastWestFacing = Math.abs(Math.abs(shelf.rotationY) - Math.PI / 2) < 0.1;
    const innerHalfWidth = shelf.width / 2 - 0.08 - 0.02; // pillar thickness 0.08m + 2cm margin
    const innerHalfDepth = shelf.depth / 2 - 0.06 - 0.01; // backboard thickness 0.06m + 1cm margin

    if (isEastWestFacing) {
      const dz = Math.abs(params.z - shelf.position[2]);
      const dx = Math.abs(params.x - shelf.position[0]);
      if (dz + params.halfSpanAlongWidth > innerHalfWidth) {
        violations.push(
          `${params.itemId}: lateral Z extent (${(dz + params.halfSpanAlongWidth).toFixed(3)}m) clips side pillar (${innerHalfWidth.toFixed(3)}m) on ${shelf.id}`,
        );
      }
      if (dx + params.halfSpanAlongDepth > innerHalfDepth + 0.04) {
        violations.push(
          `${params.itemId}: depth X extent (${(dx + params.halfSpanAlongDepth).toFixed(3)}m) clips backboard/front of ${shelf.id}`,
        );
      }
    } else {
      const dx = Math.abs(params.x - shelf.position[0]);
      const dz = Math.abs(params.z - shelf.position[2]);
      if (dx + params.halfSpanAlongWidth > innerHalfWidth) {
        violations.push(
          `${params.itemId}: lateral X extent (${(dx + params.halfSpanAlongWidth).toFixed(3)}m) clips side pillar (${innerHalfWidth.toFixed(3)}m) on ${shelf.id}`,
        );
      }
      if (dz + params.halfSpanAlongDepth > innerHalfDepth + 0.04) {
        violations.push(
          `${params.itemId}: depth Z extent (${(dz + params.halfSpanAlongDepth).toFixed(3)}m) clips backboard/front of ${shelf.id}`,
        );
      }
    }
  }

  for (const doll of DISPLAY_NUTCRACKER_SPECS) {
    if (doll.shelfUnitId !== undefined && doll.shelfTierIndex !== undefined) {
      const unscaledH = getUnscaledNutcrackerHeightMeters(doll);
      const dollHeight = unscaledH * doll.scale;
      checkShelfContainment({
        itemId: doll.id,
        shelfUnitId: doll.shelfUnitId,
        tierIndex: doll.shelfTierIndex,
        x: doll.position[0],
        y: doll.position[1],
        z: doll.position[2],
        height: dollHeight,
        halfSpanAlongWidth: 0.22 * doll.scale,
        halfSpanAlongDepth: 0.21 * doll.scale,
      });
    }
  }

  for (const box of INTERIOR_GIFT_BOX_SPECS) {
    if (box.shelfUnitId !== undefined && box.shelfTierIndex !== undefined) {
      checkShelfContainment({
        itemId: box.id,
        shelfUnitId: box.shelfUnitId,
        tierIndex: box.shelfTierIndex,
        x: box.pos[0],
        y: box.pos[1],
        z: box.pos[2],
        height: box.size[1] + 0.035,
        halfSpanAlongWidth: Math.max(box.size[0], box.size[2]) / 2,
        halfSpanAlongDepth: Math.min(box.size[0], box.size[2]) / 2,
      });
    }
  }

  for (const wp of INTERIOR_WRAPPED_PRESENT_SPECS) {
    if (wp.shelfUnitId !== undefined && wp.shelfTierIndex !== undefined) {
      checkShelfContainment({
        itemId: wp.id,
        shelfUnitId: wp.shelfUnitId,
        tierIndex: wp.shelfTierIndex,
        x: wp.pos[0],
        y: wp.pos[1],
        z: wp.pos[2],
        height: wp.size[1] + 0.08,
        halfSpanAlongWidth: Math.max(wp.size[0], wp.size[2]) / 2,
        halfSpanAlongDepth: Math.min(wp.size[0], wp.size[2]) / 2,
      });
    }
  }

  for (const bag of INTERIOR_GIFT_BAG_SPECS) {
    if (bag.shelfUnitId !== undefined && bag.shelfTierIndex !== undefined) {
      checkShelfContainment({
        itemId: bag.id,
        shelfUnitId: bag.shelfUnitId,
        tierIndex: bag.shelfTierIndex,
        x: bag.pos[0],
        y: bag.pos[1],
        z: bag.pos[2],
        height: 0.315,
        halfSpanAlongWidth: 0.09,
        halfSpanAlongDepth: 0.06,
      });
    }
  }

  for (const orn of INTERIOR_ORNAMENT_SPECS) {
    if (orn.shelfUnitId !== undefined && orn.shelfTierIndex !== undefined) {
      checkShelfContainment({
        itemId: orn.id,
        shelfUnitId: orn.shelfUnitId,
        tierIndex: orn.shelfTierIndex,
        x: orn.pos[0],
        y: orn.pos[1],
        z: orn.pos[2],
        height: 0.21,
        halfSpanAlongWidth: 0.075,
        halfSpanAlongDepth: 0.075,
      });
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

export interface ShopDoorRigState {
  handleTurnAngleRad: number;
  handleTurnFraction: number;
  latchRetractionMeters: number;
  doorSwingAngleRad: number;
  doorOpenFraction: number;
  doorbellRingIntensity: number;
  wreathSwayAngleRad: number;
  phaseLabel: string;
}

function smoothstep01(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
}

/**
 * Deterministic mechanical rig evaluator for the Crack & Sons Shop Entrance Door
 * and Articulated Brass Lever Handle + Mortise Latch + Overhead Doorbell Striker.
 *
 * Kinematics:
 * 1. Handle depresses downward around its spindle pivot (0 -> 0.68 rad / 39°)
 *    while retracting the beveled brass latch bolt (0 -> 0.026m) out of the strike plate.
 * 2. Once unlatched, the door leaf swings inward on its 3 brass hinge knuckles
 *    (0 -> 1.15 rad / 66°), ringing the overhead spring-loaded doorbell gong while
 *    the lever handle returns smoothly to horizontal.
 */
export function evaluateShopDoorRigState(params: {
  frame: number;
  fps?: number;
  mode?: ShopDoorControlMode;
  manualProgress01?: number;
}): ShopDoorRigState {
  const fps = Math.max(1, params.fps ?? 60);
  const mode = params.mode ?? 'timeline-auto';
  const safeFrame = Math.max(0, params.frame);
  const t = safeFrame / fps;

  const MAX_HANDLE_RAD = 0.68; // ~39 degrees downward lever rotation
  const MAX_LATCH_METERS = 0.026; // 26mm mortise latch bolt retraction
  const MAX_DOOR_SWING_RAD = 1.15; // ~66 degrees inward swing into shop

  if (mode === 'manual-closed') {
    return {
      handleTurnAngleRad: 0,
      handleTurnFraction: 0,
      latchRetractionMeters: 0,
      doorSwingAngleRad: 0,
      doorOpenFraction: 0,
      doorbellRingIntensity: 0,
      wreathSwayAngleRad: 0,
      phaseLabel: 'Door Latched Closed (Handle Horizontal 0° • Door Swing 0°)',
    };
  }

  if (mode === 'turn-handle-only') {
    const turnFrac = 0.88 + 0.12 * Math.cos(t * Math.PI * 2.0);
    return {
      handleTurnAngleRad: turnFrac * MAX_HANDLE_RAD,
      handleTurnFraction: turnFrac,
      latchRetractionMeters: turnFrac * MAX_LATCH_METERS,
      doorSwingAngleRad: 0,
      doorOpenFraction: 0,
      doorbellRingIntensity: 0,
      wreathSwayAngleRad: Math.sin(t * 6.0) * 0.02 * turnFrac,
      phaseLabel:
        'Testing Brass Handle Spindle & Mortise Latch Retraction (39° Turn)',
    };
  }

  if (mode === 'manual-open') {
    const p =
      params.manualProgress01 !== undefined
        ? Math.max(0, Math.min(1, params.manualProgress01))
        : 1.0;

    // Two-stage kinematic mapping along progress p in [0, 1]:
    // p in [0.00, 0.32]: Handle depresses 0 -> 39° and retracts latch bolt
    // p in [0.24, 1.00]: Door swings open 0 -> 66° while handle springs back after p = 0.55
    const handleDown = smoothstep01(p / 0.3);
    const handleRelease = p > 0.55 ? smoothstep01((p - 0.55) / 0.35) : 0;
    const handleTurnFraction = Math.max(0, handleDown * (1 - handleRelease * 0.72));
    const doorOpenFraction = smoothstep01((p - 0.22) / 0.78);
    const doorbellRingIntensity =
      doorOpenFraction > 0.05
        ? 0.35 + 0.65 * Math.abs(Math.sin(t * 16.0))
        : 0;

    return {
      handleTurnAngleRad: handleTurnFraction * MAX_HANDLE_RAD,
      handleTurnFraction,
      latchRetractionMeters: handleTurnFraction * MAX_LATCH_METERS,
      doorSwingAngleRad: doorOpenFraction * MAX_DOOR_SWING_RAD,
      doorOpenFraction,
      doorbellRingIntensity,
      wreathSwayAngleRad: Math.sin(t * 4.5) * 0.08 * doorOpenFraction,
      phaseLabel:
        p < 0.25
          ? 'Stage 1: Turning Brass Lever Handle Downward (39°) & Retracting Latch'
          : 'Stage 2: Handle Turned & Shop Door Swung Open (66°) • Doorbell Chiming!',
    };
  }

  // Default: 'timeline-auto' deterministic 240-frame (4-second) cycle
  const cycleFrames = 240;
  const u = (safeFrame % cycleFrames) / cycleFrames;

  let handleTurnFraction = 0;
  let doorOpenFraction = 0;
  let phaseLabel = 'Door Closed & Latched';

  if (u < 0.16) {
    // Phase 1: Depress brass handle downward & retract mortise latch bolt
    handleTurnFraction = smoothstep01(u / 0.16);
    doorOpenFraction = 0;
    phaseLabel =
      '1. Turning Brass Door Handle Downward (39°) & Retracting Latch Bolt';
  } else if (u < 0.46) {
    // Phase 2: Swing shop door open around brass hinges while handle releases
    const swingU = (u - 0.16) / 0.3;
    doorOpenFraction = smoothstep01(swingU);
    handleTurnFraction = 1 - smoothstep01(Math.max(0, (swingU - 0.35) / 0.65));
    phaseLabel =
      '2. Swinging Hinged Shop Door Open (66°) & Ringing Overhead Doorbell!';
  } else if (u < 0.72) {
    // Phase 3: Door held open welcoming customer from Main Street
    doorOpenFraction = 1;
    handleTurnFraction = 0;
    phaseLabel =
      '3. Shop Door Open onto Main Street (66° Swing) • Doorbell Resonating';
  } else if (u < 0.94) {
    // Phase 4: Door swings shut; handle dips as latch strikes jamb plate
    const closeU = (u - 0.72) / 0.22;
    doorOpenFraction = 1 - smoothstep01(closeU);
    const strikeDip =
      closeU > 0.72 ? Math.sin(((closeU - 0.72) / 0.28) * Math.PI) * 0.55 : 0;
    handleTurnFraction = strikeDip;
    phaseLabel = '4. Swinging Shop Door Closed & Engaging Brass Mortise Latch';
  } else {
    handleTurnFraction = 0;
    doorOpenFraction = 0;
    phaseLabel = '5. Shop Door Securely Latched Closed';
  }

  const bellActive = u >= 0.16 && u <= 0.85;
  const doorbellRingIntensity = bellActive
    ? (0.3 + 0.7 * Math.abs(Math.sin(t * 18.0))) *
      Math.max(0.25, doorOpenFraction)
    : 0;

  const wreathSwayAngleRad =
    Math.sin(t * 5.2) * 0.09 * Math.max(0.15 * handleTurnFraction, doorOpenFraction);

  return {
    handleTurnAngleRad: handleTurnFraction * MAX_HANDLE_RAD,
    handleTurnFraction,
    latchRetractionMeters: handleTurnFraction * MAX_LATCH_METERS,
    doorSwingAngleRad: doorOpenFraction * MAX_DOOR_SWING_RAD,
    doorOpenFraction,
    doorbellRingIntensity,
    wreathSwayAngleRad,
    phaseLabel,
  };
}

export interface DustParticleSpec {
  id: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  radius: number;
  speedY: number;
  driftAmplitudeX: number;
  driftAmplitudeZ: number;
  phase: number;
  isSparkleStar: boolean;
}

export function generateDeterministicDustParticles(
  count = 120,
): DustParticleSpec[] {
  const particles: DustParticleSpec[] = [];
  for (let i = 0; i < count; i++) {
    const s1 = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const r1 = s1 - Math.floor(s1);
    const s2 = Math.sin(i * 93.9898 + 19.133) * 29471.317;
    const r2 = s2 - Math.floor(s2);
    const s3 = Math.sin(i * 45.164 + 63.726) * 61532.911;
    const r3 = s3 - Math.floor(s3);

    particles.push({
      id: i,
      baseX: (r1 - 0.5) * 6.8,
      baseY: 0.45 + r2 * 3.1,
      baseZ: -2.4 + r3 * 4.9,
      radius: 0.014 + (i % 5) * 0.005,
      speedY: 0.08 + (i % 7) * 0.025,
      driftAmplitudeX: 0.06 + (i % 4) * 0.03,
      driftAmplitudeZ: 0.06 + ((i + 2) % 4) * 0.03,
      phase: (i * 0.73) % (Math.PI * 2),
      isSparkleStar: i % 4 === 0,
    });
  }
  return particles;
}

export function evaluateDustParticleAtFrame(
  spec: DustParticleSpec,
  frame: number,
  fps: number,
): {
  x: number;
  y: number;
  z: number;
  scale: number;
  twinkle: number;
} {
  const t = frame / Math.max(1, fps);
  const x =
    spec.baseX + Math.sin(t * 1.3 + spec.phase) * spec.driftAmplitudeX;
  const z =
    spec.baseZ + Math.cos(t * 1.1 + spec.phase * 1.4) * spec.driftAmplitudeZ;
  const rawY = spec.baseY + t * spec.speedY;
  const y = 0.4 + ((rawY - 0.4) % 3.15);
  const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(t * 3.2 + spec.phase));
  const scale = spec.isSparkleStar ? 0.8 + 0.65 * twinkle : 0.75 + 0.35 * twinkle;
  return {x, y, z, scale, twinkle};
}

export type TvAdSceneId = 'logo-chomp' | 'walnut-crush' | 'holiday-sale';

export interface StoreTvAdState {
  sceneId: TvAdSceneId;
  sceneIndex: number;
  sceneProgress: number;
  jawOpenFraction: number;
  walnutSplitFraction: number;
  starburstRotationRad: number;
  tickerOffsetPx: number;
  bannerHeadline: string;
  subHeadline: string;
  priceCallout: string;
}

/**
 * Deterministic 60fps 2D Animated Store Advertisement evaluator for the Shop TVs.
 */
export function evaluateStoreTvAdStateAtFrame(
  frame: number,
  fps = 60,
): StoreTvAdState {
  const safeFrame = Math.max(0, frame);
  const cycleFrames = 360; // 6-second loop at 60fps
  const localFrame = safeFrame % cycleFrames;
  const segmentFrames = 120; // 2 seconds per ad scene
  const sceneIndex = Math.floor(localFrame / segmentFrames);
  const sceneProgress = (localFrame % segmentFrames) / segmentFrames;
  const t = safeFrame / Math.max(1, fps);

  const jawOpenFraction = 0.5 + 0.5 * Math.sin(t * 12.0);
  const starburstRotationRad = t * 1.4;
  const tickerOffsetPx = (safeFrame * 3.5) % 1024;

  if (sceneIndex === 0) {
    return {
      sceneId: 'logo-chomp',
      sceneIndex: 0,
      sceneProgress,
      jawOpenFraction,
      walnutSplitFraction: 0,
      starburstRotationRad,
      tickerOffsetPx,
      bannerHeadline: 'CRACK & SONS • EST. 1887',
      subHeadline: 'WORLD-FAMOUS BAVARIAN HARDWOOD NUTCRACKERS!',
      priceCallout: 'AS SEEN ON MAIN STREET!',
    };
  }

  if (sceneIndex === 1) {
    const split = Math.min(1, Math.max(0, (sceneProgress - 0.32) * 2.8));
    return {
      sceneId: 'walnut-crush',
      sceneIndex: 1,
      sceneProgress,
      jawOpenFraction:
        sceneProgress < 0.35 ? 0.95 - sceneProgress * 2.4 : 0.1 + 0.15 * Math.sin(t * 18),
      walnutSplitFraction: split,
      starburstRotationRad,
      tickerOffsetPx,
      bannerHeadline: '100% TITANIUM-OAK JAW POWER!',
      subHeadline: 'CRUSHES WALNUTS, HAZELNUTS & BAD VIBES INSTANTLY!',
      priceCallout: 'CRACK!! 9,000 PSI LEVER!',
    };
  }

  return {
    sceneId: 'holiday-sale',
    sceneIndex: 2,
    sceneProgress,
    jawOpenFraction,
    walnutSplitFraction: 1,
    starburstRotationRad,
    tickerOffsetPx,
    bannerHeadline: 'GRAND HOLIDAY BOGO EXTRAVAGANZA!',
    subHeadline: 'BUY 1 ROYAL HUSSAR, GET 1 FREE GIFT WRAPPING!',
    priceCallout: 'ONLY $49.99 • NO REFUNDS!',
  };
}

export interface HeroNutcrackerPoseState {
  jawAngleRad: number;
  leverAngleRad: number;
  headTurnYawRad: number;
  eyeShiftX: number;
  saberGleamIntensity: number;
  pedestalRotationY: number;
}

/**
 * Deterministic frame animation for the Hero Nutcracker Doll & Display Army.
 */
export function evaluateHeroNutcrackerPoseAtFrame(
  frame: number,
  fps = 60,
): HeroNutcrackerPoseState {
  const t = Math.max(0, frame) / Math.max(1, fps);
  // Rhythmic wooden jaw clacking synced to 120 BPM (2 Hz)
  const beatWave = Math.max(0, Math.sin(t * Math.PI * 4));
  const jawAngleRad = beatWave * 0.38;
  const leverAngleRad = beatWave * 0.46;
  const headTurnYawRad = Math.sin(t * 1.2) * 0.14;
  const eyeShiftX = Math.sin(t * 2.4) * 0.018;
  const saberGleamIntensity = 0.5 + 0.5 * Math.sin(t * 5.0);
  const pedestalRotationY = -0.42 + Math.sin(t * 0.55) * 0.28;

  return {
    jawAngleRad,
    leverAngleRad,
    headTurnYawRad,
    eyeShiftX,
    saberGleamIntensity,
    pedestalRotationY,
  };
}

export interface InteriorCameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  activeShotLabel: string;
}

/**
 * Deterministic camera choreography inside the Crack & Sons Shop Interior.
 * Keeps camera strictly inside the 8.8m × 6.8m × 4.2m room shell without clipping walls.
 */
export function computeInteriorCameraTransformAtFrame(
  frame: number,
  preset: InteriorCameraPresetId = 'interior-choreographed-tour',
): InteriorCameraState {
  const f = Math.max(0, Math.min(480, frame));

  if (preset === 'hero-nutcracker-closeup') {
    return {
      position: [-0.15, 2.05, 1.55],
      target: [1.35, 1.92, -0.35],
      fov: 42,
      activeShotLabel:
        'Shot: Hero Nutcracker 100% Detail Close-Up (Articulated Jaw, Crown, Braided Hussar Tunic & Saber)',
    };
  }

  if (preset === 'counter-and-register-closeup') {
    return {
      position: [-0.25, 1.72, 0.65],
      target: [0.0, 1.05, -1.85],
      fov: 42,
      activeShotLabel:
        'Shot: Decorated Wooden Counter, Brass Cash Register, Menu Boards, Wrapping Station & Service Bell',
    };
  }

  if (preset === 'tv-commercial-showcase') {
    return {
      position: [1.85, 2.45, -0.85],
      target: [4.08, 2.58, -2.05],
      fov: 38,
      activeShotLabel:
        'Shot: Live 2D Animated Store Commercial Playing on Shop TV Monitors + Promotional Banners',
    };
  }

  if (preset === 'shelves-and-ornaments-closeup') {
    return {
      position: [-1.15, 1.85, 0.55],
      target: [-3.88, 1.65, -0.45],
      fov: 44,
      activeShotLabel:
        'Shot: Tall Carved Mahogany Cupboards, 14 Nutcracker Dolls (Zero Phasing), Ornaments & Price Tags',
    };
  }

  if (preset === 'entrance-doorbell-chime') {
    return {
      position: [0.35, 1.85, 0.25],
      target: [-1.85, 1.35, 2.15],
      fov: 44,
      activeShotLabel:
        'Shot: Shop Entrance Door, Mechanical Doorbell Striker, Decorative Wreath, Small Christmas Tree & Window Army',
    };
  }

  if (preset === 'rigged-door-handle-closeup') {
    return {
      position: [0.55, 1.48, 1.35],
      target: [1.45, 1.28, 3.05],
      fov: 42,
      activeShotLabel:
        'Shot: Rigged Shop Entrance Door, Turning Brass Lever Handle, Retracting Latch Bolt, Hinges & Doorbell Chime',
    };
  }

  if (preset === 'interior-wide-overview') {
    return {
      position: [0.0, 2.25, 2.75],
      target: [0.0, 1.52, -1.45],
      fov: 54,
      activeShotLabel:
        'Shot: Full Crack & Sons Boutique Interior Wide Establishing View (All 26 Asset Categories)',
    };
  }

  // Default: 'interior-choreographed-tour' across 480 frames (8 seconds at 60fps)
  if (f < 120) {
    const u = f / 120;
    const s = u * u * (3 - 2 * u);
    return {
      position: [
        -0.25 + s * 0.45,
        2.18 - s * 0.18,
        2.72 - s * 0.65,
      ],
      target: [
        0.05 + s * 0.35,
        1.55 + s * 0.12,
        -1.35 - s * 0.2,
      ],
      fov: 52 - s * 6,
      activeShotLabel:
        '01. Grand Boutique Reveal — Wooden Floor, Rug, Tall Cupboards, Christmas Tree, Garland, Lights & Dust Shafts',
    };
  }

  if (f < 240) {
    const u = (f - 120) / 120;
    const s = u * u * (3 - 2 * u);
    return {
      position: [
        -0.15 + s * 0.22,
        2.02 + s * 0.08,
        1.55 - s * 0.18,
      ],
      target: [
        1.35,
        1.88 + s * 0.08,
        -0.35,
      ],
      fov: 42,
      activeShotLabel:
        '02. Hero Nutcracker Masterpiece Close-Up — Clacking Jaw, Jewel Crown, Gold Epaulettes & Sparkling Glints',
    };
  }

  if (f < 360) {
    const u = (f - 240) / 120;
    const s = u * u * (3 - 2 * u);
    return {
      position: [
        -0.55 + s * 1.1,
        1.72 + s * 0.25,
        0.65 - s * 0.15,
      ],
      target: [
        -0.25 + s * 1.65,
        1.28 + s * 0.55,
        -1.75 + s * 0.45,
      ],
      fov: 38,
      activeShotLabel:
        '03. Decorated Wooden Counter, Brass Cash Register, Wrapping Rolls, Price Tags & Animated Store Ad TVs',
    };
  }

  const u = (f - 360) / 120;
  const s = u * u * (3 - 2 * u);
  return {
    position: [
      0.55 - s * 0.55,
      1.95 + s * 0.35,
      1.85 + s * 0.75,
    ],
    target: [
      0.2 - s * 0.2,
      1.45 - s * 0.1,
      -1.15 - s * 0.25,
    ],
    fov: 40 + s * 5,
    activeShotLabel:
      '04. Full Crack & Sons Interior Finale — 15 Nutcrackers, TVs, Rigged Shop Door, Presents & Volumetric Light Dust',
  };
}
