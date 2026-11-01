export interface AABB2D {
  id: string;
  category:
    | 'hero-building'
    | 'mid-building'
    | 'far-building'
    | 'street-lamp'
    | 'fire-hydrant'
    | 'dustbin'
    | 'bench'
    | 'mailbox'
    | 'tree'
    | 'car';
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface ShopBrandSpec {
  shopTitle: string;
  shopSubtitle: string;
  awningPrimaryHex: string;
  awningSecondaryHex: string;
  signBgHex: string;
  signTextHex: string;
  signAccentHex: string;
  bannerText: string;
  posterTitle: string;
}

export interface BillboardSpec {
  title: string;
  subtitle: string;
  bgHex: string;
  textHex: string;
  accentHex: string;
}

export interface HeroShopSpec {
  id: string;
  shopTitle: string;
  shopSubtitle: string;
  warningTitle?: string;
  warningSubtitle?: string;
  side: 'west' | 'east';
  centerZ: number;
  widthZ: number;
  depthX: number;
  groundFloorHeightY: number;
  upperFloorsCount: number;
  upperFloorHeightY: number;
  brickBaseHex: string;
  brickAccentHex: string;
  upperWallHex: string;
  trimHex: string;
  awningPrimaryHex: string;
  awningSecondaryHex: string;
  signBgHex: string;
  signTextHex: string;
  signAccentHex: string;
  windowDisplayType:
    | 'nutcrackers'
    | 'mannequin'
    | 'cafe'
    | 'books'
    | 'hardware'
    | 'pastries'
    | 'ramen';
  hasRoofWaterTank: boolean;
  bannerText: string;
  posterTitle: string;
  rooftopBillboard?: BillboardSpec;
}

export interface SidewalkPropPlacement {
  id: string;
  type:
    | 'street-lamp'
    | 'fire-hydrant'
    | 'dustbin'
    | 'bench'
    | 'mailbox'
    | 'tree'
    | 'traffic-light'
    | 'signpost';
  x: number;
  y: number;
  z: number;
  rotationY: number;
  variant: number;
}

export type AlleyPropType =
  | 'garbage-bag-cluster'
  | 'cardboard-stack'
  | 'wooden-pallet'
  | 'oil-drum'
  | 'milk-crate-stack'
  | 'ac-condenser'
  | 'recycling-bin';

export interface AlleyPropSpec {
  id: string;
  type: AlleyPropType;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  scale: number;
  variant: number;
  colorHex: string;
  secondaryColorHex: string;
}

export interface DetailedTreeSpec {
  id: string;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotationY: number;
  species: 'zelkova-elm' | 'sakura-cherry' | 'ginkgo-gold' | 'urban-maple';
  trunkColorHex: string;
  canopyPrimaryHex: string;
  canopySecondaryHex: string;
  canopyHighlightHex: string;
  branchCount: number;
  foliageClusters: {
    dx: number;
    dy: number;
    dz: number;
    radius: number;
    scaleY: number;
  }[];
  hasRootFlare: boolean;
  hasFallenLeaves: boolean;
}

export interface AlleySpec {
  id: string;
  side: 'west' | 'east';
  x: number;
  z: number;
  centerZ: number;
  widthZ: number;
  depthX: number;
  dumpsterCount: number;
  garbageBagClusters: number;
  dumpsterColorHex: string;
  nettingColorHex: string;
  tarpColorHex: string;
  hasOverheadTarp: boolean;
  hasClothesline: boolean;
  hasLaundryLine: boolean;
  hasFireEscape: boolean;
  graffitiText: string;
}

export type CityAlleySpec = AlleySpec;

export interface MidCityBuildingSpec {
  id: string;
  lodTier: 1 | 2;
  x: number;
  z: number;
  widthX: number;
  depthZ: number;
  heightY: number;
  floors: number;
  hasBalconies: boolean;
  detailedFacade: boolean;
  wallColorHex: string;
  brickAccentHex: string;
  upperWallHex: string;
  roofColorHex: string;
  trimColorHex: string;
  shopBrand?: ShopBrandSpec;
  rooftopBillboard?: BillboardSpec;
  windowDisplayType: HeroShopSpec['windowDisplayType'];
  hasWaterTank: boolean;
  hasRoofWaterTank: boolean;
  bannerText?: string;
  posterTitle?: string;
  facingRotationY: number;
}

export interface CityRoadSegmentSpec {
  id: string;
  name: string;
  axis: 'north-south' | 'east-west';
  centerX: number;
  centerZ: number;
  lengthMeters: number;
  carriagewayWidthMeters: number;
  sidewalkWidthMeters: number;
  hasCenterMedian: boolean;
  curbSegmentStepMeters: number;
  manholeSpacingMeters: number;
}

export interface CityIntersectionSpec {
  id: string;
  name: string;
  x: number;
  z: number;
  widthX: number;
  depthZ: number;
  intersectionType: '4-way' | '3-way';
  hasCrosswalks: boolean;
  hasLeftTurnArrows: boolean;
  hasRightTurnArrows: boolean;
  hasTactileCorners: boolean;
}

export interface UtilityPoleSpec {
  id: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  heightY: number;
  crossarmWidth: number;
  upperCrossarmY: number;
  lowerCrossarmY: number;
  hasTransformerCan: boolean;
  corridorId: string;
}

export interface UtilityCableSpanSpec {
  id: string;
  fromPoleId: string;
  toPoleId: string;
  attachmentType: 'pole-to-pole';
  startPos: [number, number, number];
  endPos: [number, number, number];
  sagMeters: number;
  wireCount: number;
  wireLateralOffsets: number[];
}

export type VehicleRouteType =
  | 'parked'
  | 'straight-ns'
  | 'straight-ew'
  | 'turn-left'
  | 'turn-right';

export interface CityVehicleSpec {
  id: string;
  plateCode: string;
  bodyColorHex: string;
  accentColorHex: string;
  routeType: VehicleRouteType;
  streetCorridor: string;
  phaseOffset01: number;
  speedLoopsPerCycle: number;
  waypoints: Array<[number, number, number]>;
  parkedRotationY?: number;
}

export interface MountainPeakSpec {
  id: string;
  ring: 'foothill' | 'alpine';
  angleRad: number;
  distance: number;
  x: number;
  z: number;
  baseRadius: number;
  heightY: number;
  ridgeRotationY: number;
  colorHex: string;
  shadowColorHex: string;
  snowCapRatio: number;
  subPeakLeftScale: number;
  subPeakRightScale: number;
}

/**
 * Deterministic PRNG (Mulberry32) so procedural city blocks and mountains are 100% frame-reproducible.
 */
export function createSeededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 30 Distinct Famous-Style & Local Shop Brands Used Across the Entire City
 */
export const CITY_SHOP_CATALOG: readonly ShopBrandSpec[] = [
  {
    shopTitle: 'STARBEAN COFFEE',
    shopSubtitle: 'COLD BREW & ARTISAN ESPRESSO',
    awningPrimaryHex: '#065F46',
    awningSecondaryHex: '#ECFDF5',
    signBgHex: '#064E3B',
    signTextHex: '#FFFFFF',
    signAccentHex: '#FBBF24',
    bannerText: 'ESPRESSO',
    posterTitle: '2x1 ICED LATTE',
  },
  {
    shopTitle: 'CROWN BURGER CO.',
    shopSubtitle: 'FLAME GRILLED DOUBLE SMASH',
    awningPrimaryHex: '#B91C1C',
    awningSecondaryHex: '#FEF3C7',
    signBgHex: '#7F1D1D',
    signTextHex: '#FDE047',
    signAccentHex: '#F97316',
    bannerText: 'BURGERS',
    posterTitle: 'COMBO $6.99',
  },
  {
    shopTitle: 'MEDIPLUS RX 24H',
    shopSubtitle: 'CHEMIST • WELLNESS • CLINIC',
    awningPrimaryHex: '#0284C7',
    awningSecondaryHex: '#F0F9FF',
    signBgHex: '#0C4A6E',
    signTextHex: '#FFFFFF',
    signAccentHex: '#34D399',
    bannerText: 'PHARMACY',
    posterTitle: '24H CHEMIST',
  },
  {
    shopTitle: 'METRO TRUST BANK',
    shopSubtitle: 'SAVINGS • VAULT • 24H ATM',
    awningPrimaryHex: '#1E3A8A',
    awningSecondaryHex: '#EFF6FF',
    signBgHex: '#172554',
    signTextHex: '#F8FAFC',
    signAccentHex: '#38BDF8',
    bannerText: 'ATM 24H',
    posterTitle: '4.8% APY VAULT',
  },
  {
    shopTitle: 'FRESH-MART HYPER',
    shopSubtitle: 'ORGANIC PRODUCE & GROCERY',
    awningPrimaryHex: '#15803D',
    awningSecondaryHex: '#F0FDF4',
    signBgHex: '#14532D',
    signTextHex: '#FEF08A',
    signAccentHex: '#FB923C',
    bannerText: 'GROCERY',
    posterTitle: 'FARM FRESH SALE',
  },
  {
    shopTitle: 'VOLTGRID TECH',
    shopSubtitle: 'LAPTOPS • AUDIO • GAMING RIGS',
    awningPrimaryHex: '#0F172A',
    awningSecondaryHex: '#E0F2FE',
    signBgHex: '#090D16',
    signTextHex: '#38BDF8',
    signAccentHex: '#22D3EE',
    bannerText: 'ELECTRONICS',
    posterTitle: '8K OLED SALE',
  },
  {
    shopTitle: 'CHAPTER & VERSE',
    shopSubtitle: 'RARE BOOKS • PRINTS • VINYL',
    awningPrimaryHex: '#4C1D95',
    awningSecondaryHex: '#F5F3FF',
    signBgHex: '#2E1065',
    signTextHex: '#FDE68A',
    signAccentHex: '#F472B6',
    bannerText: 'BOOKSHOP',
    posterTitle: 'NEW GRAPHIC NOVELS',
  },
  {
    shopTitle: 'NAPOLI WOODFIRED',
    shopSubtitle: 'BRICK OVEN PIZZA & CALZONES',
    awningPrimaryHex: '#991B1B',
    awningSecondaryHex: '#FFF7ED',
    signBgHex: '#450A0A',
    signTextHex: '#FFFFFF',
    signAccentHex: '#22C55E',
    bannerText: 'HOT PIZZA',
    posterTitle: 'JUMBO SLICE $3',
  },
  {
    shopTitle: 'LA BELLE BRIOCHE',
    shopSubtitle: 'PATISSERIE • SOURDOUGH • TARTS',
    awningPrimaryHex: '#92400E',
    awningSecondaryHex: '#FFFBEB',
    signBgHex: '#451A03',
    signTextHex: '#FEF3C7',
    signAccentHex: '#F43F5E',
    bannerText: 'BAKERY',
    posterTitle: 'WARM CROISSANTS',
  },
  {
    shopTitle: 'ATELIER VOGUE',
    shopSubtitle: 'URBAN COUTURE & DENIM STUDIO',
    awningPrimaryHex: '#18181B',
    awningSecondaryHex: '#FDF2F8',
    signBgHex: '#09090B',
    signTextHex: '#F472B6',
    signAccentHex: '#38BDF8',
    bannerText: 'FASHION',
    posterTitle: 'AUTUMN RUNWAY 50%',
  },
  {
    shopTitle: 'OMNIPLEX GRAND 8',
    shopSubtitle: 'NOW SHOWING: MIDNIGHT NUTCRACKER',
    awningPrimaryHex: '#581C87',
    awningSecondaryHex: '#FAF5FF',
    signBgHex: '#3B0764',
    signTextHex: '#FEF08A',
    signAccentHex: '#F43F5E',
    bannerText: 'CINEMA',
    posterTitle: 'PREMIERE TONIGHT',
  },
  {
    shopTitle: 'THE GRAND ASTORIA',
    shopSubtitle: 'BOUTIQUE SUITES & SKY LOUNGE',
    awningPrimaryHex: '#115E59',
    awningSecondaryHex: '#F0FDFA',
    signBgHex: '#042F2E',
    signTextHex: '#FDE68A',
    signAccentHex: '#F59E0B',
    bannerText: 'HOTEL',
    posterTitle: 'ROOFTOP LOUNGE',
  },
  {
    shopTitle: 'TITAN IRON GYM',
    shopSubtitle: '24/7 WEIGHTS • BOXING • CARDIO',
    awningPrimaryHex: '#1F2937',
    awningSecondaryHex: '#F3F4F6',
    signBgHex: '#111827',
    signTextHex: '#F87171',
    signAccentHex: '#FACC15',
    bannerText: 'FITNESS',
    posterTitle: 'ZERO JOIN FEE',
  },
  {
    shopTitle: 'PULSETEL 5G HUB',
    shopSubtitle: 'SMARTPHONES • SIMS • ULTRA FIBER',
    awningPrimaryHex: '#4338CA',
    awningSecondaryHex: '#EEF2FF',
    signBgHex: '#1E1B4B',
    signTextHex: '#FFFFFF',
    signAccentHex: '#22D3EE',
    bannerText: '5G MOBILE',
    posterTitle: 'FREE PHONE UPGRADE',
  },
  {
    shopTitle: 'CLOUD NINE GELATO',
    shopSubtitle: '32 ARTISAN SCOOPS & WAFFLES',
    awningPrimaryHex: '#BE185D',
    awningSecondaryHex: '#FDF2F8',
    signBgHex: '#500724',
    signTextHex: '#FCE7F3',
    signAccentHex: '#38BDF8',
    bannerText: 'ICE CREAM',
    posterTitle: 'PISTACHIO SWIRL',
  },
  {
    shopTitle: '8-TWENTY FOUR MART',
    shopSubtitle: 'SNACKS • SLUSHIES • ATM • LOTTO',
    awningPrimaryHex: '#047857',
    awningSecondaryHex: '#ECFDF5',
    signBgHex: '#064E3B',
    signTextHex: '#FFFFFF',
    signAccentHex: '#FB923C',
    bannerText: 'OPEN 24/7',
    posterTitle: 'HOT COFFEE $1',
  },
  {
    shopTitle: 'OCTANE EXPRESS EV',
    shopSubtitle: 'SUPERCHARGE & AUTO CARE BAY',
    awningPrimaryHex: '#B45309',
    awningSecondaryHex: '#FFFBEB',
    signBgHex: '#451A03',
    signTextHex: '#FEF08A',
    signAccentHex: '#3B82F6',
    bannerText: 'EV CHARGE',
    posterTitle: '350KW FAST CHARGE',
  },
  {
    shopTitle: 'LUMIÈRE HAIR SPA',
    shopSubtitle: 'STYLING • COLOR BAR • BARBERS',
    awningPrimaryHex: '#701A75',
    awningSecondaryHex: '#FDF4FF',
    signBgHex: '#4A044E',
    signTextHex: '#F5D0FE',
    signAccentHex: '#F472B6',
    bannerText: 'SALON',
    posterTitle: 'WALK-INS WELCOME',
  },
  {
    shopTitle: 'GOLDEN LANTERN',
    shopSubtitle: 'RAMEN • DIM SUM • TEPPANYAKI',
    awningPrimaryHex: '#7F1D1D',
    awningSecondaryHex: '#FEF2F2',
    signBgHex: '#450A0A',
    signTextHex: '#FDE047',
    signAccentHex: '#FB923C',
    bannerText: 'RAMEN BAR',
    posterTitle: 'SPICY MISO BOWL',
  },
  {
    shopTitle: 'AURA DIAMONDS',
    shopSubtitle: '24K GOLD • CHRONOGRAPHS • GEMS',
    awningPrimaryHex: '#0F172A',
    awningSecondaryHex: '#F8FAFC',
    signBgHex: '#020617',
    signTextHex: '#FDE68A',
    signAccentHex: '#F59E0B',
    bannerText: 'JEWELLERY',
    posterTitle: 'BRIDAL COLLECTION',
  },
  {
    shopTitle: 'RAJU MASALA CHAI',
    shopSubtitle: 'HOT CUTTING TEA • SAMOSA • BUN',
    awningPrimaryHex: '#9A3412',
    awningSecondaryHex: '#FFEDD5',
    signBgHex: '#431407',
    signTextHex: '#FEF08A',
    signAccentHex: '#F97316',
    bannerText: 'HOT CHAI',
    posterTitle: 'GINGER CHAI 50¢',
  },
  {
    shopTitle: 'OLD SOLE COBBLER',
    shopSubtitle: 'HEELS • LEATHER STITCH • POLISH',
    awningPrimaryHex: '#451A03',
    awningSecondaryHex: '#FEF3C7',
    signBgHex: '#271206',
    signTextHex: '#FDE68A',
    signAccentHex: '#D97706',
    bannerText: 'SHOE FIX',
    posterTitle: 'BOOTS RESOLED',
  },
  {
    shopTitle: 'QUICK LOCK & KEY',
    shopSubtitle: 'KEYS IN 2 MINS • SAFE LOCKS',
    awningPrimaryHex: '#1E40AF',
    awningSecondaryHex: '#DBEAFE',
    signBgHex: '#172554',
    signTextHex: '#FEF08A',
    signAccentHex: '#38BDF8',
    bannerText: 'KEY MAKER',
    posterTitle: 'CAR KEYS CODED',
  },
  {
    shopTitle: 'SNOWWHITE LAUNDRY',
    shopSubtitle: 'DRY CLEAN • STEAM PRESS • WASH',
    awningPrimaryHex: '#0E7490',
    awningSecondaryHex: '#CFFAFE',
    signBgHex: '#164E63',
    signTextHex: '#FFFFFF',
    signAccentHex: '#F43F5E',
    bannerText: 'LAUNDRY',
    posterTitle: 'SAME DAY EXPRESS',
  },
  {
    shopTitle: 'MOMO & NOODLE HUT',
    shopSubtitle: 'STEAMED DUMPLINGS • CHILI OIL',
    awningPrimaryHex: '#991B1B',
    awningSecondaryHex: '#FEF2F2',
    signBgHex: '#450A0A',
    signTextHex: '#FDE047',
    signAccentHex: '#22C55E',
    bannerText: 'DUMPLINGS',
    posterTitle: '8PCS MOMO $4.50',
  },
  {
    shopTitle: 'METRO VINYL & TAPE',
    shopSubtitle: 'HI-FI TURNTABLES • CASSETTES',
    awningPrimaryHex: '#312E81',
    awningSecondaryHex: '#E0E7FF',
    signBgHex: '#1E1B4B',
    signTextHex: '#38BDF8',
    signAccentHex: '#F472B6',
    bannerText: 'VINYL SHOP',
    posterTitle: 'RARE JAZZ PRESS',
  },
  {
    shopTitle: 'GREEN LEAF FLORIST',
    shopSubtitle: 'BOUQUETS • BONSAI • TERRARIUMS',
    awningPrimaryHex: '#065F46',
    awningSecondaryHex: '#D1FAE5',
    signBgHex: '#022C22',
    signTextHex: '#FEF08A',
    signAccentHex: '#FB7185',
    bannerText: 'FLORIST',
    posterTitle: 'FRESH ROSES DAILY',
  },
  {
    shopTitle: 'PIXEL ARCADE HALL',
    shopSubtitle: 'RETRO CABINETS • PINBALL • SODA',
    awningPrimaryHex: '#6B21A8',
    awningSecondaryHex: '#F3E8FF',
    signBgHex: '#3B0764',
    signTextHex: '#22D3EE',
    signAccentHex: '#FACC15',
    bannerText: 'ARCADE',
    posterTitle: 'HIGH SCORE NIGHT',
  },
  {
    shopTitle: 'HARBOR FISH & CHIPS',
    shopSubtitle: 'CRISPY COD • TARTAR • MALT',
    awningPrimaryHex: '#0369A1',
    awningSecondaryHex: '#E0F2FE',
    signBgHex: '#082F49',
    signTextHex: '#FFFFFF',
    signAccentHex: '#FBBF24',
    bannerText: 'SEAFOOD',
    posterTitle: 'CATCH OF THE DAY',
  },
  {
    shopTitle: 'ARTISAN PAPER CO.',
    shopSubtitle: 'FOUNTAIN PENS • SKETCHBOOKS • INK',
    awningPrimaryHex: '#78350F',
    awningSecondaryHex: '#FEF3C7',
    signBgHex: '#451A03',
    signTextHex: '#FDE68A',
    signAccentHex: '#38BDF8',
    bannerText: 'STATIONERY',
    posterTitle: 'MANGA INK SETS',
  },
];

export const ROOFTOP_BILLBOARD_CATALOG: readonly BillboardSpec[] = [
  {
    title: 'OMNIFRAME 104.9 FM',
    subtitle: '24/7 LO-FI BEATS ACROSS THE CITY',
    bgHex: '#1E1B4B',
    textHex: '#FEF08A',
    accentHex: '#F43F5E',
  },
  {
    title: 'DRINK VOLT COLA',
    subtitle: 'ELECTRIC CITRUS SPARK • ICE COLD',
    bgHex: '#7F1D1D',
    textHex: '#FFFFFF',
    accentHex: '#FACC15',
  },
  {
    title: 'APEX AIR SNEAKERS',
    subtitle: 'DEFY GRAVITY • STREET EDITION',
    bgHex: '#064E3B',
    textHex: '#A7F3D0',
    accentHex: '#FB923C',
  },
  {
    title: 'CYBER OPTICS 8K',
    subtitle: 'NEXT-GEN CAMERAS & LENSES',
    bgHex: '#0F172A',
    textHex: '#38BDF8',
    accentHex: '#F472B6',
  },
  {
    title: 'METRO EXPRESS LINE',
    subtitle: 'DOWNTOWN TO HARBOR IN 8 MINS',
    bgHex: '#1E3A8A',
    textHex: '#FFFFFF',
    accentHex: '#34D399',
  },
  {
    title: 'GOLDEN RAMEN FEST',
    subtitle: 'NIGHT MARKET OPEN TILL 4 AM',
    bgHex: '#4C0519',
    textHex: '#FDE047',
    accentHex: '#FB7185',
  },
  {
    title: 'STUDIO ARGON 4K',
    subtitle: 'ANIME & CEL-SHADING PRODUCTION',
    bgHex: '#172554',
    textHex: '#F8FAFC',
    accentHex: '#38BDF8',
  },
  {
    title: 'SAKURA TEA HOUSE',
    subtitle: 'MATCHA • BOBA • ROOFTOP GARDEN',
    bgHex: '#065F46',
    textHex: '#FEF08A',
    accentHex: '#F472B6',
  },
];

/**
 * 6 Hero Block Buildings (Storefronts + Multi-Story Upper Apartments with Rich Balconies, Banners & Billboards)
 */
export const HERO_BLOCK_SHOPS: HeroShopSpec[] = [
  {
    id: 'shop-west-center-crack-and-sons',
    shopTitle: 'CRACK & SONS',
    shopSubtitle: 'NUTCRACKERS SINCE 1887',
    warningTitle: 'GENTLEMEN:',
    warningSubtitle: 'ENTER AT YOUR OWN RISK',
    side: 'west',
    centerZ: 0.0,
    widthZ: 11.2,
    depthX: 6.2,
    groundFloorHeightY: 5.6,
    upperFloorsCount: 3,
    upperFloorHeightY: 3.1,
    brickBaseHex: '#7C3A2D',
    brickAccentHex: '#5C281E',
    upperWallHex: '#8E4839',
    trimHex: '#D6CFC2',
    awningPrimaryHex: '#9F1239',
    awningSecondaryHex: '#F8FAFC',
    signBgHex: '#1E1633',
    signTextHex: '#FDE047',
    signAccentHex: '#F43F5E',
    windowDisplayType: 'nutcrackers',
    hasRoofWaterTank: true,
    bannerText: 'NUTCRACKERS',
    posterTitle: 'HANDCRAFTED 1887',
    rooftopBillboard: ROOFTOP_BILLBOARD_CATALOG[0],
  },
  {
    id: 'shop-west-north-tailor-mannequin',
    shopTitle: 'LE PETIT TAILOR',
    shopSubtitle: 'BESPOKE SUITS & GENTLEMEN WEAR',
    side: 'west',
    centerZ: -13.2,
    widthZ: 10.8,
    depthX: 5.8,
    groundFloorHeightY: 5.4,
    upperFloorsCount: 2,
    upperFloorHeightY: 3.0,
    brickBaseHex: '#B46E35',
    brickAccentHex: '#8F5322',
    upperWallHex: '#C78246',
    trimHex: '#E5DEC9',
    awningPrimaryHex: '#0284C7',
    awningSecondaryHex: '#F8FAFC',
    signBgHex: '#0F172A',
    signTextHex: '#38BDF8',
    signAccentHex: '#FDE047',
    windowDisplayType: 'mannequin',
    hasRoofWaterTank: false,
    bannerText: 'TAILOR SHOP',
    posterTitle: 'BESPOKE SUITS',
    rooftopBillboard: ROOFTOP_BILLBOARD_CATALOG[1],
  },
  {
    id: 'shop-west-south-hardware',
    shopTitle: 'ARCADE HARDWARE',
    shopSubtitle: 'TOOLS • BRASS • TIMBER • IRONWORK',
    side: 'west',
    centerZ: 13.2,
    widthZ: 10.8,
    depthX: 6.0,
    groundFloorHeightY: 5.4,
    upperFloorsCount: 2,
    upperFloorHeightY: 3.0,
    brickBaseHex: '#5B677D',
    brickAccentHex: '#434D5E',
    upperWallHex: '#69768E',
    trimHex: '#CBD5E1',
    awningPrimaryHex: '#D97706',
    awningSecondaryHex: '#FEF3C7',
    signBgHex: '#1C1917',
    signTextHex: '#FBBF24',
    signAccentHex: '#34D399',
    windowDisplayType: 'hardware',
    hasRoofWaterTank: true,
    bannerText: 'HARDWARE',
    posterTitle: 'POWER TOOLS SALE',
  },
  {
    id: 'shop-east-center-lofi-cafe',
    shopTitle: 'VELVET BEAN CAFÉ',
    shopSubtitle: 'ESPRESSO • VINYL RECORDS • PASTRY',
    side: 'east',
    centerZ: 0.0,
    widthZ: 11.2,
    depthX: 6.2,
    groundFloorHeightY: 5.6,
    upperFloorsCount: 3,
    upperFloorHeightY: 3.1,
    brickBaseHex: '#4A6E68',
    brickAccentHex: '#35524D',
    upperWallHex: '#59827B',
    trimHex: '#E2E8F0',
    awningPrimaryHex: '#059669',
    awningSecondaryHex: '#ECFDF5',
    signBgHex: '#064E3B',
    signTextHex: '#A7F3D0',
    signAccentHex: '#FBBF24',
    windowDisplayType: 'cafe',
    hasRoofWaterTank: true,
    bannerText: 'LO-FI CAFÉ',
    posterTitle: 'LIVE JAZZ 8PM',
    rooftopBillboard: ROOFTOP_BILLBOARD_CATALOG[2],
  },
  {
    id: 'shop-east-north-books',
    shopTitle: 'STARLIGHT BOOKS',
    shopSubtitle: 'RARE PRINTS • COMICS • MAPS',
    side: 'east',
    centerZ: -13.2,
    widthZ: 10.8,
    depthX: 5.8,
    groundFloorHeightY: 5.4,
    upperFloorsCount: 3,
    upperFloorHeightY: 3.0,
    brickBaseHex: '#6D547D',
    brickAccentHex: '#523D5E',
    upperWallHex: '#7E6390',
    trimHex: '#F3E8FF',
    awningPrimaryHex: '#7C3AED',
    awningSecondaryHex: '#F5F3FF',
    signBgHex: '#2E1065',
    signTextHex: '#DDD6FE',
    signAccentHex: '#F472B6',
    windowDisplayType: 'books',
    hasRoofWaterTank: false,
    bannerText: 'RARE BOOKS',
    posterTitle: 'MANGA & VINYL',
    rooftopBillboard: ROOFTOP_BILLBOARD_CATALOG[3],
  },
  {
    id: 'shop-east-south-market',
    shopTitle: 'SUNSET GROCERY',
    shopSubtitle: 'FRESH FRUIT • FLOWERS • NIGHT MARKET',
    side: 'east',
    centerZ: 13.2,
    widthZ: 10.8,
    depthX: 5.8,
    groundFloorHeightY: 5.4,
    upperFloorsCount: 2,
    upperFloorHeightY: 3.0,
    brickBaseHex: '#9A4850',
    brickAccentHex: '#7A343B',
    upperWallHex: '#B05861',
    trimHex: '#F1F5F9',
    awningPrimaryHex: '#E11D48',
    awningSecondaryHex: '#FFF1F2',
    signBgHex: '#4C0519',
    signTextHex: '#FECDD3',
    signAccentHex: '#FDE047',
    windowDisplayType: 'cafe',
    hasRoofWaterTank: false,
    bannerText: 'NIGHT MARKET',
    posterTitle: 'ORGANIC FRUIT',
  },
];

/**
 * Curated Sidewalk Props Table on the Hero Block (8 Street Lamps, 4 American Fire Hydrants,
 * 4 Dustbins, 4 Park Benches, 2 Blue Mailboxes, 6 Street Trees in Iron Grates).
 * Every prop is verified collision-free via `validateCitySpatialClearance()`.
 */
export const HERO_SIDEWALK_PROPS: SidewalkPropPlacement[] = [
  // 8 Vintage Double-Lantern Street Lamps (4 West, 4 East) aligned with outer building piers
  {id: 'lamp-w-1', type: 'street-lamp', x: -7.85, y: 0.545, z: -17.4, rotationY: 0, variant: 0},
  {id: 'lamp-w-2', type: 'street-lamp', x: -7.85, y: 0.545, z: -4.4, rotationY: 0, variant: 0},
  {id: 'lamp-w-3', type: 'street-lamp', x: -7.85, y: 0.545, z: 4.4, rotationY: 0, variant: 0},
  {id: 'lamp-w-4', type: 'street-lamp', x: -7.85, y: 0.545, z: 17.4, rotationY: 0, variant: 0},
  {id: 'lamp-e-1', type: 'street-lamp', x: 7.85, y: 0.545, z: -17.4, rotationY: Math.PI, variant: 0},
  {id: 'lamp-e-2', type: 'street-lamp', x: 7.85, y: 0.545, z: -4.4, rotationY: Math.PI, variant: 0},
  {id: 'lamp-e-3', type: 'street-lamp', x: 7.85, y: 0.545, z: 4.4, rotationY: Math.PI, variant: 0},
  {id: 'lamp-e-4', type: 'street-lamp', x: 7.85, y: 0.545, z: 17.4, rotationY: Math.PI, variant: 0},

  // 4 Iconic American Cast-Iron Fire Hydrants (Crimson Red + Silver Nozzles) near crosswalk corners
  {id: 'hydrant-w-n', type: 'fire-hydrant', x: -7.85, y: 0.545, z: -8.6, rotationY: Math.PI / 2, variant: 0},
  {id: 'hydrant-w-s', type: 'fire-hydrant', x: -7.85, y: 0.545, z: 8.6, rotationY: Math.PI / 2, variant: 1},
  {id: 'hydrant-e-n', type: 'fire-hydrant', x: 7.85, y: 0.545, z: -8.6, rotationY: -Math.PI / 2, variant: 0},
  {id: 'hydrant-e-s', type: 'fire-hydrant', x: 7.85, y: 0.545, z: 8.6, rotationY: -Math.PI / 2, variant: 1},

  // 4 Ribbed Steel Municipal Dustbins + Alleyway Trash Bags tucked beside building piers
  {id: 'dustbin-w-1', type: 'dustbin', x: -8.25, y: 0.545, z: -5.6, rotationY: 0.3, variant: 0},
  {id: 'dustbin-w-2', type: 'dustbin', x: -8.25, y: 0.545, z: 5.6, rotationY: -0.2, variant: 1},
  {id: 'dustbin-e-1', type: 'dustbin', x: 8.25, y: 0.545, z: -5.6, rotationY: Math.PI - 0.3, variant: 0},
  {id: 'dustbin-e-2', type: 'dustbin', x: 8.25, y: 0.545, z: 5.6, rotationY: Math.PI + 0.2, variant: 1},

  // 4 Sidewalk Park Benches
  {id: 'bench-w-1', type: 'bench', x: -8.35, y: 0.545, z: -14.8, rotationY: Math.PI / 2, variant: 0},
  {id: 'bench-w-2', type: 'bench', x: -8.35, y: 0.545, z: 14.8, rotationY: Math.PI / 2, variant: 0},
  {id: 'bench-e-1', type: 'bench', x: 8.35, y: 0.545, z: -14.8, rotationY: -Math.PI / 2, variant: 0},
  {id: 'bench-e-2', type: 'bench', x: 8.35, y: 0.545, z: 14.8, rotationY: -Math.PI / 2, variant: 0},

  // 2 American Blue Arched Mailboxes
  {id: 'mailbox-w-1', type: 'mailbox', x: -8.05, y: 0.545, z: 12.2, rotationY: Math.PI / 2, variant: 0},
  {id: 'mailbox-e-1', type: 'mailbox', x: 8.05, y: 0.545, z: -12.2, rotationY: -Math.PI / 2, variant: 0},

  // 6 Street Trees in Iron Grates positioned at alleyway gaps (Z = ±6.8m, ±19.2m)
  {id: 'tree-w-1', type: 'tree', x: -8.1, y: 0.545, z: -19.2, rotationY: 0.4, variant: 0},
  {id: 'tree-w-2', type: 'tree', x: -8.1, y: 0.545, z: -6.8, rotationY: 1.1, variant: 1},
  {id: 'tree-w-3', type: 'tree', x: -8.1, y: 0.545, z: 19.2, rotationY: 2.3, variant: 2},
  {id: 'tree-e-1', type: 'tree', x: 8.1, y: 0.545, z: -19.2, rotationY: 0.8, variant: 1},
  {id: 'tree-e-2', type: 'tree', x: 8.1, y: 0.545, z: 6.8, rotationY: 1.9, variant: 2},
  {id: 'tree-e-3', type: 'tree', x: 8.1, y: 0.545, z: 19.2, rotationY: 2.7, variant: 0},
];

/**
 * Generate Interconnected 2D City Map Road Network & 4-Way Intersections with Left and Right Turns
 */
export function generateCityRoadNetwork(): {
  segments: CityRoadSegmentSpec[];
  intersections: CityIntersectionSpec[];
} {
  const segments: CityRoadSegmentSpec[] = [
    // 3 Parallel North-South Avenues
    {
      id: 'road-ave-central-north',
      name: 'Central Main Avenue (North Corridor)',
      axis: 'north-south',
      centerX: 0,
      centerZ: -140,
      lengthMeters: 240,
      carriagewayWidthMeters: 14,
      sidewalkWidthMeters: 4.4,
      hasCenterMedian: true,
      curbSegmentStepMeters: 5.0,
      manholeSpacingMeters: 18.0,
    },
    {
      id: 'road-ave-central-south',
      name: 'Central Main Avenue (South Corridor)',
      axis: 'north-south',
      centerX: 0,
      centerZ: 120,
      lengthMeters: 200,
      carriagewayWidthMeters: 14,
      sidewalkWidthMeters: 4.4,
      hasCenterMedian: true,
      curbSegmentStepMeters: 5.0,
      manholeSpacingMeters: 18.0,
    },
    {
      id: 'road-ave-west',
      name: 'West Grand Boulevard (North-South)',
      axis: 'north-south',
      centerX: -56,
      centerZ: -10,
      lengthMeters: 360,
      carriagewayWidthMeters: 14,
      sidewalkWidthMeters: 4.2,
      hasCenterMedian: false,
      curbSegmentStepMeters: 5.0,
      manholeSpacingMeters: 20.0,
    },
    {
      id: 'road-ave-east',
      name: 'East Grand Boulevard (North-South)',
      axis: 'north-south',
      centerX: 56,
      centerZ: -10,
      lengthMeters: 360,
      carriagewayWidthMeters: 14,
      sidewalkWidthMeters: 4.2,
      hasCenterMedian: false,
      curbSegmentStepMeters: 5.0,
      manholeSpacingMeters: 20.0,
    },
    // 4 East-West Cross-Streets connecting Central, West & East Avenues
    {
      id: 'road-cross-north-inner',
      name: '2nd Street North (East-West Cross-Street)',
      axis: 'east-west',
      centerX: 0,
      centerZ: -24.5,
      lengthMeters: 380,
      carriagewayWidthMeters: 12.5,
      sidewalkWidthMeters: 3.6,
      hasCenterMedian: false,
      curbSegmentStepMeters: 5.0,
      manholeSpacingMeters: 18.0,
    },
    {
      id: 'road-cross-south-inner',
      name: '2nd Street South (East-West Cross-Street)',
      axis: 'east-west',
      centerX: 0,
      centerZ: 24.5,
      lengthMeters: 380,
      carriagewayWidthMeters: 12.5,
      sidewalkWidthMeters: 3.6,
      hasCenterMedian: false,
      curbSegmentStepMeters: 5.0,
      manholeSpacingMeters: 18.0,
    },
    {
      id: 'road-cross-north-outer',
      name: '5th Street North (East-West Cross-Street)',
      axis: 'east-west',
      centerX: 0,
      centerZ: -75,
      lengthMeters: 380,
      carriagewayWidthMeters: 12.5,
      sidewalkWidthMeters: 3.6,
      hasCenterMedian: false,
      curbSegmentStepMeters: 5.0,
      manholeSpacingMeters: 20.0,
    },
    {
      id: 'road-cross-south-outer',
      name: '5th Street South (East-West Cross-Street)',
      axis: 'east-west',
      centerX: 0,
      centerZ: 75,
      lengthMeters: 380,
      carriagewayWidthMeters: 12.5,
      sidewalkWidthMeters: 3.6,
      hasCenterMedian: false,
      curbSegmentStepMeters: 5.0,
      manholeSpacingMeters: 20.0,
    },
  ];

  const intersections: CityIntersectionSpec[] = [];
  const avenueXs = [-56, 0, 56];
  const crossZs = [-75, -24.5, 24.5, 75];

  for (const ix of avenueXs) {
    for (const iz of crossZs) {
      const aveLabel = ix === 0 ? 'Central Ave' : ix < 0 ? 'West Blvd' : 'East Blvd';
      const crossLabel =
        iz === -24.5
          ? '2nd St N'
          : iz === 24.5
            ? '2nd St S'
            : iz === -75
              ? '5th St N'
              : '5th St S';
      intersections.push({
        id: `intersection-${ix}-${iz}`,
        name: `${aveLabel} & ${crossLabel} 4-Way Intersection`,
        x: ix,
        z: iz,
        widthX: 14.0,
        depthZ: 12.5,
        intersectionType: '4-way',
        hasCrosswalks: true,
        hasLeftTurnArrows: true,
        hasRightTurnArrows: true,
        hasTactileCorners: true,
      });
    }
  }

  return {segments, intersections};
}

/**
 * Generate Utility Power/Telecom Poles & Strict Pole-to-Pole Catenary Cable Spans Across the City
 * (Zero house-to-house cables; every cable connects from a street utility pole to the next street utility pole!)
 */
export function generateUtilityPolesAndCables(): {
  poles: UtilityPoleSpec[];
  cables: UtilityCableSpanSpec[];
} {
  const poles: UtilityPoleSpec[] = [];
  const cables: UtilityCableSpanSpec[] = [];

  // 1. Central Avenue West & East Sidewalk Utility Poles (X = ±7.95m)
  const centralPoleZs = [-122, -96, -62, -38, -16.2, 0.0, 16.2, 38, 62, 96];
  for (const side of ['west', 'east'] as const) {
    const px = side === 'west' ? -7.95 : 7.95;
    const rotY = side === 'west' ? 0 : Math.PI;
    const corridorId = `central-ave-${side}`;
    const linePoles: UtilityPoleSpec[] = [];

    centralPoleZs.forEach((pz, idx) => {
      const pole: UtilityPoleSpec = {
        id: `utility-pole-central-${side}-${idx}`,
        x: px,
        y: 0.545,
        z: pz,
        rotationY: rotY,
        heightY: 7.8,
        crossarmWidth: 1.85,
        upperCrossarmY: 7.15,
        lowerCrossarmY: 6.35,
        hasTransformerCan: idx % 3 === 1,
        corridorId,
      };
      poles.push(pole);
      linePoles.push(pole);
    });

    for (let i = 0; i < linePoles.length - 1; i++) {
      const pA = linePoles[i];
      const pB = linePoles[i + 1];
      cables.push({
        id: `cable-span-central-${side}-${i}`,
        fromPoleId: pA.id,
        toPoleId: pB.id,
        attachmentType: 'pole-to-pole',
        startPos: [pA.x, pA.upperCrossarmY, pA.z],
        endPos: [pB.x, pB.upperCrossarmY, pB.z],
        sagMeters: 0.68,
        wireCount: 3,
        wireLateralOffsets: [-0.62, 0, 0.62],
      });
    }
  }

  // 2. East-West Cross-Street Utility Poles (along Z = -24.5m & Z = +24.5m curbs, grouped per block so cables never cross over N-S Avenues)
  const crossPoleBlocks: number[][] = [
    [-96, -72],
    [-42, -18],
    [18, 42],
    [72, 96],
  ];
  for (const cz of [-24.5, 24.5]) {
    const zCurb = cz < 0 ? cz + 7.2 : cz - 7.2;
    const corridorId = `cross-street-${cz}`;
    let pIdx = 0;

    for (const blockXs of crossPoleBlocks) {
      const blockPoles: UtilityPoleSpec[] = [];
      for (const px of blockXs) {
        const pole: UtilityPoleSpec = {
          id: `utility-pole-cross-${cz}-${pIdx}`,
          x: px,
          y: 0.545,
          z: zCurb,
          rotationY: Math.PI / 2,
          heightY: 7.8,
          crossarmWidth: 1.85,
          upperCrossarmY: 7.15,
          lowerCrossarmY: 6.35,
          hasTransformerCan: pIdx % 3 === 0,
          corridorId,
        };
        poles.push(pole);
        blockPoles.push(pole);
        pIdx++;
      }

      for (let i = 0; i < blockPoles.length - 1; i++) {
        const pA = blockPoles[i];
        const pB = blockPoles[i + 1];
        cables.push({
          id: `cable-span-cross-${cz}-${pA.id}-${pB.id}`,
          fromPoleId: pA.id,
          toPoleId: pB.id,
          attachmentType: 'pole-to-pole',
          startPos: [pA.x, pA.upperCrossarmY, pA.z],
          endPos: [pB.x, pB.upperCrossarmY, pB.z],
          sagMeters: 0.65,
          wireCount: 3,
          wireLateralOffsets: [-0.62, 0, 0.62],
        });
      }
    }
  }

  // 3. West & East Boulevard Utility Poles (along X = -48.05m and X = +48.05m)
  const blvdPoleZs = [-96, -62, -38, -12, 12, 38, 62, 96];
  for (const bSide of ['west-blvd', 'east-blvd'] as const) {
    const px = bSide === 'west-blvd' ? -48.05 : 48.05;
    const rotY = bSide === 'west-blvd' ? Math.PI : 0;
    const linePoles: UtilityPoleSpec[] = [];

    blvdPoleZs.forEach((pz, idx) => {
      const pole: UtilityPoleSpec = {
        id: `utility-pole-${bSide}-${idx}`,
        x: px,
        y: 0.545,
        z: pz,
        rotationY: rotY,
        heightY: 7.8,
        crossarmWidth: 1.85,
        upperCrossarmY: 7.15,
        lowerCrossarmY: 6.35,
        hasTransformerCan: idx % 2 === 1,
        corridorId: bSide,
      };
      poles.push(pole);
      linePoles.push(pole);
    });

    for (let i = 0; i < linePoles.length - 1; i++) {
      const pA = linePoles[i];
      const pB = linePoles[i + 1];
      cables.push({
        id: `cable-span-${bSide}-${i}`,
        fromPoleId: pA.id,
        toPoleId: pB.id,
        attachmentType: 'pole-to-pole',
        startPos: [pA.x, pA.upperCrossarmY, pA.z],
        endPos: [pB.x, pB.upperCrossarmY, pB.z],
        sagMeters: 0.7,
        wireCount: 3,
        wireLateralOffsets: [-0.62, 0, 0.62],
      });
    }
  }

  // 4. Outer Cross-Street (5th St N/S at Z = -75m & Z = +75m) Block-Local Pole-to-Pole Corridors
  for (const cz of [-75, 75]) {
    const zCurb = cz < 0 ? cz + 7.2 : cz - 7.2;
    const corridorId = `cross-street-outer-${cz}`;
    let pIdx = 0;

    for (const blockXs of crossPoleBlocks) {
      const blockPoles: UtilityPoleSpec[] = [];
      for (const px of blockXs) {
        const pole: UtilityPoleSpec = {
          id: `utility-pole-cross-outer-${cz}-${pIdx}`,
          x: px,
          y: 0.545,
          z: zCurb,
          rotationY: Math.PI / 2,
          heightY: 7.8,
          crossarmWidth: 1.85,
          upperCrossarmY: 7.15,
          lowerCrossarmY: 6.35,
          hasTransformerCan: pIdx % 2 === 0,
          corridorId,
        };
        poles.push(pole);
        blockPoles.push(pole);
        pIdx++;
      }

      for (let i = 0; i < blockPoles.length - 1; i++) {
        const pA = blockPoles[i];
        const pB = blockPoles[i + 1];
        cables.push({
          id: `cable-span-cross-outer-${cz}-${pA.id}-${pB.id}`,
          fromPoleId: pA.id,
          toPoleId: pB.id,
          attachmentType: 'pole-to-pole',
          startPos: [pA.x, pA.upperCrossarmY, pA.z],
          endPos: [pB.x, pB.upperCrossarmY, pB.z],
          sagMeters: 0.65,
          wireCount: 3,
          wireLateralOffsets: [-0.62, 0, 0.62],
        });
      }
    }
  }

  return {poles, cables};
}

export interface CityShrubPlanterSpec {
  id: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  flowerColorHex: string;
  planterVariant: number;
}

/**
 * Generate Landscaped Sidewalk Shrub & Blossom Planters Across All Avenues, Boulevards & Cross-Streets
 */
export function generateCityShrubPlanters(): CityShrubPlanterSpec[] {
  const planters: CityShrubPlanterSpec[] = [];
  const flowerPalette = ['#F43F5E', '#FACC15', '#EC4899', '#38BDF8', '#A855F7', '#FB923C'];
  let idx = 0;

  // 1. Central Avenue Extended North & South Footpath Shrub Planters
  for (const pz of [-135, -108, -88, -58, -42, 42, 58, 88, 108, 135]) {
    for (const sideSign of [-1, 1]) {
      planters.push({
        id: `shrub-planter-central-${sideSign > 0 ? 'e' : 'w'}-${pz}`,
        x: sideSign * 9.85,
        y: 0.28,
        z: pz,
        rotationY: sideSign > 0 ? -Math.PI / 2 : Math.PI / 2,
        flowerColorHex: flowerPalette[idx % flowerPalette.length],
        planterVariant: idx % 3,
      });
      idx++;
    }
  }

  // 2. West & East Grand Boulevard Footpath Shrub Planters
  for (const blvdX of [-56, 56]) {
    for (const pz of [-92, -52, -10, 10, 52, 92]) {
      for (const sideSign of [-1, 1]) {
        planters.push({
          id: `shrub-planter-blvd-${blvdX}-${sideSign > 0 ? 'e' : 'w'}-${pz}`,
          x: blvdX + sideSign * 9.85,
          y: 0.28,
          z: pz,
          rotationY: sideSign > 0 ? -Math.PI / 2 : Math.PI / 2,
          flowerColorHex: flowerPalette[idx % flowerPalette.length],
          planterVariant: idx % 3,
        });
        idx++;
      }
    }
  }

  // 3. East-West Cross-Street (2nd St N/S & 5th St N/S) Footpath Shrub Planters
  for (const cz of [-75, -24.5, 24.5, 75]) {
    for (const px of [-82, -36, -20, 20, 36, 82]) {
      const sideSign = cz < 0 ? -1 : 1;
      planters.push({
        id: `shrub-planter-cross-${cz}-${px}`,
        x: px,
        y: 0.28,
        z: cz + sideSign * 8.65,
        rotationY: 0,
        flowerColorHex: flowerPalette[idx % flowerPalette.length],
        planterVariant: idx % 3,
      });
      idx++;
    }
  }

  return planters;
}

/**
 * Generate City-Wide Distributed Vehicle Fleet (32 Cars across Central Avenue, West/East Boulevards,
 * East-West Cross-Streets, Parked Curbside Bays, and Left/Right Turning Intersection Routes!)
 */
export function generateCityVehicleFleet(): CityVehicleSpec[] {
  return [
    // --- A. HERO MAIN STREET & CENTRAL AVENUE CARS ---
    {
      id: 'car-hero-nut-1887',
      plateCode: 'NUT-1887',
      bodyColorHex: '#4F46E5',
      accentColorHex: '#38BDF8',
      routeType: 'parked',
      streetCorridor: 'central-avenue',
      phaseOffset01: 0,
      speedLoopsPerCycle: 0,
      waypoints: [[-4.85, 0.04, 3.2]],
      parkedRotationY: 0,
    },
    {
      id: 'car-hero-omni-01',
      plateCode: 'OMNI-01',
      bodyColorHex: '#E11D48',
      accentColorHex: '#FBBF24',
      routeType: 'straight-ns',
      streetCorridor: 'central-avenue',
      phaseOffset01: 0.0,
      speedLoopsPerCycle: 1,
      waypoints: [
        [1.75, 0.05, 18.0],
        [1.75, 0.05, -20.0],
      ],
    },
    {
      id: 'car-hero-crk-03',
      plateCode: 'CRK-03',
      bodyColorHex: '#0D9488',
      accentColorHex: '#F1ECF9',
      routeType: 'parked',
      streetCorridor: 'central-avenue',
      phaseOffset01: 0,
      speedLoopsPerCycle: 0,
      waypoints: [[5.05, 0.04, -5.8]],
      parkedRotationY: Math.PI,
    },
    {
      id: 'car-hero-lofi-88',
      plateCode: 'LOFI-88',
      bodyColorHex: '#D97706',
      accentColorHex: '#FEF08A',
      routeType: 'parked',
      streetCorridor: 'central-avenue',
      phaseOffset01: 0,
      speedLoopsPerCycle: 0,
      waypoints: [[-1.75, 0.05, -15.2]],
      parkedRotationY: 0,
    },
    {
      id: 'car-ave-city-42',
      plateCode: 'CITY-42',
      bodyColorHex: '#2563EB',
      accentColorHex: '#93C5FD',
      routeType: 'straight-ns',
      streetCorridor: 'central-avenue',
      phaseOffset01: 0.15,
      speedLoopsPerCycle: 1,
      waypoints: [
        [-1.75, 0.05, -95.0],
        [-1.75, 0.05, -30.0],
      ],
    },
    {
      id: 'car-ave-north-cruiser-1',
      plateCode: 'BEAT-77',
      bodyColorHex: '#7C3AED',
      accentColorHex: '#F472B6',
      routeType: 'straight-ns',
      streetCorridor: 'central-avenue',
      phaseOffset01: 0.42,
      speedLoopsPerCycle: 1,
      waypoints: [
        [1.75, 0.05, -32.0],
        [1.75, 0.05, -115.0],
      ],
    },
    {
      id: 'car-ave-south-cruiser-1',
      plateCode: 'PULSE-09',
      bodyColorHex: '#059669',
      accentColorHex: '#A7F3D0',
      routeType: 'straight-ns',
      streetCorridor: 'central-avenue',
      phaseOffset01: 0.25,
      speedLoopsPerCycle: 1,
      waypoints: [
        [-1.75, 0.05, 32.0],
        [-1.75, 0.05, 92.0],
      ],
    },
    {
      id: 'car-ave-parked-north-w',
      plateCode: 'KNG-204',
      bodyColorHex: '#B91C1C',
      accentColorHex: '#FDE047',
      routeType: 'parked',
      streetCorridor: 'central-avenue',
      phaseOffset01: 0,
      speedLoopsPerCycle: 0,
      waypoints: [[-4.95, 0.05, -46.0]],
      parkedRotationY: 0,
    },
    {
      id: 'car-ave-parked-north-e',
      plateCode: 'VIBE-12',
      bodyColorHex: '#0284C7',
      accentColorHex: '#E0F2FE',
      routeType: 'parked',
      streetCorridor: 'central-avenue',
      phaseOffset01: 0,
      speedLoopsPerCycle: 0,
      waypoints: [[4.95, 0.05, -62.0]],
      parkedRotationY: Math.PI,
    },
    {
      id: 'car-ave-parked-south-e',
      plateCode: 'CAFE-55',
      bodyColorHex: '#D97706',
      accentColorHex: '#FEF3C7',
      routeType: 'parked',
      streetCorridor: 'central-avenue',
      phaseOffset01: 0,
      speedLoopsPerCycle: 0,
      waypoints: [[4.95, 0.05, 44.0]],
      parkedRotationY: Math.PI,
    },

    // --- B. LEFT-TURN & RIGHT-TURN INTERSECTION CARS (Dynamic 90° Curved Turns!) ---
    {
      id: 'car-turn-right-north-jct',
      plateCode: 'TURN-R1',
      bodyColorHex: '#F43F5E',
      accentColorHex: '#FEF08A',
      routeType: 'turn-right',
      streetCorridor: 'intersection-0--24.5',
      phaseOffset01: 0.0,
      speedLoopsPerCycle: 1,
      // Northbound in East lane (X = +3.4) turning RIGHT (Eastbound) onto 2nd St North (Z = -22.8)
      waypoints: [
        [3.4, 0.05, -9.5],
        [3.4, 0.05, -18.5],
        [9.5, 0.05, -22.8],
        [34.0, 0.05, -22.8],
      ],
    },
    {
      id: 'car-turn-left-north-jct',
      plateCode: 'TURN-L1',
      bodyColorHex: '#0EA5E9',
      accentColorHex: '#FDE047',
      routeType: 'turn-left',
      streetCorridor: 'intersection-0--24.5',
      phaseOffset01: 0.2,
      speedLoopsPerCycle: 1,
      // Eastbound on 2nd St North (Z = -22.8) turning LEFT (Northbound) onto Central Ave (X = +1.75)
      waypoints: [
        [-32.0, 0.05, -22.8],
        [-7.5, 0.05, -22.8],
        [1.75, 0.05, -31.0],
        [1.75, 0.05, -56.0],
      ],
    },
    {
      id: 'car-turn-left-south-jct',
      plateCode: 'TURN-L2',
      bodyColorHex: '#10B981',
      accentColorHex: '#ECFDF5',
      routeType: 'turn-left',
      streetCorridor: 'intersection-0-24.5',
      phaseOffset01: 0.1,
      speedLoopsPerCycle: 1,
      // Southbound on Central Ave (X = -1.75) turning LEFT (Eastbound) onto 2nd St South (Z = +26.2)
      waypoints: [
        [-1.75, 0.05, 9.5],
        [-1.75, 0.05, 19.5],
        [8.5, 0.05, 26.2],
        [36.0, 0.05, 26.2],
      ],
    },
    {
      id: 'car-turn-right-south-jct',
      plateCode: 'TURN-R2',
      bodyColorHex: '#8B5CF6',
      accentColorHex: '#DDD6FE',
      routeType: 'turn-right',
      streetCorridor: 'intersection-0-24.5',
      phaseOffset01: 0.35,
      speedLoopsPerCycle: 1,
      // Westbound on 2nd St South (Z = +22.8) turning RIGHT (Northbound) onto Central Ave (X = +3.4)
      waypoints: [
        [34.0, 0.05, 22.8],
        [9.5, 0.05, 22.8],
        [3.4, 0.05, 15.5],
        [3.4, 0.05, -4.0],
      ],
    },
    {
      id: 'car-turn-right-west-blvd-n',
      plateCode: 'WBLV-R3',
      bodyColorHex: '#F59E0B',
      accentColorHex: '#FFFBEB',
      routeType: 'turn-right',
      streetCorridor: 'intersection--56--24.5',
      phaseOffset01: 0.15,
      speedLoopsPerCycle: 1,
      // Northbound on West Blvd (X = -52.6) turning RIGHT (Eastbound) onto 2nd St North (Z = -22.8)
      waypoints: [
        [-52.6, 0.05, -4.0],
        [-52.6, 0.05, -18.5],
        [-46.0, 0.05, -22.8],
        [-20.0, 0.05, -22.8],
      ],
    },
    {
      id: 'car-turn-left-east-blvd-n',
      plateCode: 'EBLV-L3',
      bodyColorHex: '#EC4899',
      accentColorHex: '#FCE7F3',
      routeType: 'turn-left',
      streetCorridor: 'intersection-56--24.5',
      phaseOffset01: 0.4,
      speedLoopsPerCycle: 1,
      // Southbound on East Blvd (X = +54.25) turning LEFT (Eastbound) onto 2nd St North (Z = -22.8)
      waypoints: [
        [54.25, 0.05, -48.0],
        [54.25, 0.05, -30.0],
        [64.0, 0.05, -22.8],
        [88.0, 0.05, -22.8],
      ],
    },
    {
      id: 'car-turn-right-outer-north',
      plateCode: '5TH-R4',
      bodyColorHex: '#14B8A6',
      accentColorHex: '#F0FDFA',
      routeType: 'turn-right',
      streetCorridor: 'intersection-0--75',
      phaseOffset01: 0.25,
      speedLoopsPerCycle: 1,
      waypoints: [
        [3.4, 0.05, -52.0],
        [3.4, 0.05, -69.0],
        [10.0, 0.05, -73.2],
        [38.0, 0.05, -73.2],
      ],
    },
    {
      id: 'car-turn-left-outer-south',
      plateCode: '5TH-L4',
      bodyColorHex: '#6366F1',
      accentColorHex: '#E0E7FF',
      routeType: 'turn-left',
      streetCorridor: 'intersection-0-75',
      phaseOffset01: 0.5,
      speedLoopsPerCycle: 1,
      waypoints: [
        [-38.0, 0.05, 76.8],
        [-8.0, 0.05, 76.8],
        [1.75, 0.05, 67.0],
        [1.75, 0.05, 42.0],
      ],
    },

    // --- C. EAST-WEST CROSS-STREETS (2nd St N/S & 5th St N/S) MOVING & PARKED CARS ---
    {
      id: 'car-cross-2n-westbound-1',
      plateCode: 'CRS-101',
      bodyColorHex: '#DC2626',
      accentColorHex: '#FEF08A',
      routeType: 'straight-ew',
      streetCorridor: 'cross-north-inner',
      phaseOffset01: 0.08,
      speedLoopsPerCycle: 1,
      waypoints: [
        [88.0, 0.05, -26.2],
        [14.0, 0.05, -26.2],
      ],
    },
    {
      id: 'car-cross-2n-eastbound-2',
      plateCode: 'CRS-102',
      bodyColorHex: '#2563EB',
      accentColorHex: '#BAE6FD',
      routeType: 'straight-ew',
      streetCorridor: 'cross-north-inner',
      phaseOffset01: 0.33,
      speedLoopsPerCycle: 1,
      waypoints: [
        [-92.0, 0.05, -22.8],
        [-16.0, 0.05, -22.8],
      ],
    },
    {
      id: 'car-cross-2n-parked-w',
      plateCode: 'PRK-201',
      bodyColorHex: '#047857',
      accentColorHex: '#D1FAE5',
      routeType: 'parked',
      streetCorridor: 'cross-north-inner',
      phaseOffset01: 0,
      speedLoopsPerCycle: 0,
      waypoints: [[-28.0, 0.05, -28.8]],
      parkedRotationY: -Math.PI / 2,
    },
    {
      id: 'car-cross-2n-parked-e',
      plateCode: 'PRK-202',
      bodyColorHex: '#B45309',
      accentColorHex: '#FEF3C7',
      routeType: 'parked',
      streetCorridor: 'cross-north-inner',
      phaseOffset01: 0,
      speedLoopsPerCycle: 0,
      waypoints: [[28.0, 0.05, -20.2]],
      parkedRotationY: Math.PI / 2,
    },
    {
      id: 'car-cross-2s-eastbound-1',
      plateCode: 'CRS-301',
      bodyColorHex: '#9333EA',
      accentColorHex: '#F3E8FF',
      routeType: 'straight-ew',
      streetCorridor: 'cross-south-inner',
      phaseOffset01: 0.18,
      speedLoopsPerCycle: 1,
      waypoints: [
        [-84.0, 0.05, 26.2],
        [-14.0, 0.05, 26.2],
      ],
    },
    {
      id: 'car-cross-2s-westbound-2',
      plateCode: 'CRS-302',
      bodyColorHex: '#0284C7',
      accentColorHex: '#38BDF8',
      routeType: 'straight-ew',
      streetCorridor: 'cross-south-inner',
      phaseOffset01: 0.52,
      speedLoopsPerCycle: 1,
      waypoints: [
        [86.0, 0.05, 22.8],
        [15.0, 0.05, 22.8],
      ],
    },
    {
      id: 'car-cross-5n-eastbound-1',
      plateCode: 'CRS-501',
      bodyColorHex: '#E11D48',
      accentColorHex: '#FECDD3',
      routeType: 'straight-ew',
      streetCorridor: 'cross-north-outer',
      phaseOffset01: 0.22,
      speedLoopsPerCycle: 1,
      waypoints: [
        [-78.0, 0.05, -73.2],
        [44.0, 0.05, -73.2],
      ],
    },
    {
      id: 'car-cross-5s-westbound-1',
      plateCode: 'CRS-502',
      bodyColorHex: '#0D9488',
      accentColorHex: '#99F6E4',
      routeType: 'straight-ew',
      streetCorridor: 'cross-south-outer',
      phaseOffset01: 0.44,
      speedLoopsPerCycle: 1,
      waypoints: [
        [78.0, 0.05, 73.2],
        [-44.0, 0.05, 73.2],
      ],
    },

    // --- D. WEST BOULEVARD (X = -56m) & EAST BOULEVARD (X = +56m) MOVING & PARKED CARS ---
    {
      id: 'car-west-blvd-nb-1',
      plateCode: 'WST-401',
      bodyColorHex: '#4F46E5',
      accentColorHex: '#C7D2FE',
      routeType: 'straight-ns',
      streetCorridor: 'west-boulevard',
      phaseOffset01: 0.12,
      speedLoopsPerCycle: 1,
      waypoints: [
        [-54.25, 0.05, 62.0],
        [-54.25, 0.05, -62.0],
      ],
    },
    {
      id: 'car-west-blvd-sb-2',
      plateCode: 'WST-402',
      bodyColorHex: '#EA580C',
      accentColorHex: '#FFEDD5',
      routeType: 'straight-ns',
      streetCorridor: 'west-boulevard',
      phaseOffset01: 0.58,
      speedLoopsPerCycle: 1,
      waypoints: [
        [-57.75, 0.05, -68.0],
        [-57.75, 0.05, 58.0],
      ],
    },
    {
      id: 'car-west-blvd-parked-1',
      plateCode: 'WST-403',
      bodyColorHex: '#15803D',
      accentColorHex: '#BBF7D0',
      routeType: 'parked',
      streetCorridor: 'west-boulevard',
      phaseOffset01: 0,
      speedLoopsPerCycle: 0,
      waypoints: [[-60.8, 0.05, -6.0]],
      parkedRotationY: 0,
    },
    {
      id: 'car-east-blvd-nb-1',
      plateCode: 'EST-601',
      bodyColorHex: '#0369A1',
      accentColorHex: '#BAE6FD',
      routeType: 'straight-ns',
      streetCorridor: 'east-boulevard',
      phaseOffset01: 0.31,
      speedLoopsPerCycle: 1,
      waypoints: [
        [57.75, 0.05, 64.0],
        [57.75, 0.05, -64.0],
      ],
    },
    {
      id: 'car-east-blvd-sb-2',
      plateCode: 'EST-602',
      bodyColorHex: '#BE123C',
      accentColorHex: '#FFE4E6',
      routeType: 'straight-ns',
      streetCorridor: 'east-boulevard',
      phaseOffset01: 0.67,
      speedLoopsPerCycle: 1,
      waypoints: [
        [54.25, 0.05, -66.0],
        [54.25, 0.05, 60.0],
      ],
    },
    {
      id: 'car-east-blvd-parked-1',
      plateCode: 'EST-603',
      bodyColorHex: '#6D28D9',
      accentColorHex: '#EDE9FE',
      routeType: 'parked',
      streetCorridor: 'east-boulevard',
      phaseOffset01: 0,
      speedLoopsPerCycle: 0,
      waypoints: [[60.8, 0.05, 6.0]],
      parkedRotationY: Math.PI,
    },
  ];
}

/**
 * Deterministically evaluate any City Vehicle's 3D position and heading rotationY at frame `n`.
 * Supports parked cars, straight avenue/cross-street traffic, and smooth 90° Bézier Left & Right turns!
 */
export function evaluateCityVehicleAtFrame(
  vehicle: CityVehicleSpec,
  frame: number,
  totalFrames: number,
): {
  position: [number, number, number];
  rotationY: number;
} {
  if (vehicle.routeType === 'parked' || vehicle.waypoints.length === 1) {
    const wp = vehicle.waypoints[0];
    return {
      position: [wp[0], wp[1], wp[2]],
      rotationY: vehicle.parkedRotationY ?? 0,
    };
  }

  const rawT =
    ((frame / Math.max(1, totalFrames)) * Math.max(1, vehicle.speedLoopsPerCycle) +
      vehicle.phaseOffset01) %
    1.0;
  const t = rawT < 0 ? rawT + 1.0 : rawT;

  if (vehicle.waypoints.length === 2) {
    const [p0, p1] = vehicle.waypoints;
    const x = p0[0] + (p1[0] - p0[0]) * t;
    const y = p0[1] + (p1[1] - p0[1]) * t;
    const z = p0[2] + (p1[2] - p0[2]) * t;
    const dx = p1[0] - p0[0];
    const dz = p1[2] - p0[2];
    const rotationY = Math.atan2(dx, dz);
    return {position: [x, y, z], rotationY};
  }

  // 4-point turning trajectory (Approach -> Turn Entry -> Turn Exit -> Departure)
  // Segment 1 (0..0.32): straight approach from p0 to p1
  // Segment 2 (0.32..0.68): smooth quadratic Bézier turn arc from p1 to p2 using corner control point
  // Segment 3 (0.68..1.0): straight departure from p2 to p3
  const [p0, p1, p2, p3] = vehicle.waypoints;
  if (t < 0.32) {
    const u = t / 0.32;
    const x = p0[0] + (p1[0] - p0[0]) * u;
    const y = p0[1];
    const z = p0[2] + (p1[2] - p0[2]) * u;
    const rotationY = Math.atan2(p1[0] - p0[0], p1[2] - p0[2]);
    return {position: [x, y, z], rotationY};
  } else if (t <= 0.68) {
    const u = (t - 0.32) / 0.36;
    // Determine corner control point where approach tangent and exit tangent intersect
    const dx0 = Math.abs(p1[0] - p0[0]);
    const ctrlX = dx0 > 0.5 ? p2[0] : p1[0];
    const ctrlZ = dx0 > 0.5 ? p1[2] : p2[2];
    const inv = 1 - u;
    const x = inv * inv * p1[0] + 2 * inv * u * ctrlX + u * u * p2[0];
    const y = p1[1];
    const z = inv * inv * p1[2] + 2 * inv * u * ctrlZ + u * u * p2[2];
    const tx = 2 * inv * (ctrlX - p1[0]) + 2 * u * (p2[0] - ctrlX);
    const tz = 2 * inv * (ctrlZ - p1[2]) + 2 * u * (p2[2] - ctrlZ);
    const rotationY = Math.atan2(tx, tz);
    return {position: [x, y, z], rotationY};
  } else {
    const u = (t - 0.68) / 0.32;
    const x = p2[0] + (p3[0] - p2[0]) * u;
    const y = p2[1];
    const z = p2[2] + (p3[2] - p2[2]) * u;
    const rotationY = Math.atan2(p3[0] - p2[0], p3[2] - p2[2]);
    return {position: [x, y, z], rotationY};
  }
}

/**
 * Generate Detailed Alleys with Huge Industrial Dumpsters, Overhead Netting, Hanging Laundry,
 * Fire-Escape Ladders, and Graffiti across both the Hero Block AND the Extended City Avenues!
 */
export const HERO_ALLEY_PROPS: AlleyPropSpec[] = [
  {id: 'alley-w-n-bags-1', type: 'garbage-bag-cluster', x: -12.6, y: 0.24, z: -6.3, rotationY: 0.4, scale: 1.0, variant: 0, colorHex: '#1E293B', secondaryColorHex: '#DC2626'},
  {id: 'alley-w-n-bags-2', type: 'garbage-bag-cluster', x: -14.8, y: 0.24, z: -7.1, rotationY: 1.2, scale: 1.15, variant: 1, colorHex: '#0F172A', secondaryColorHex: '#F59E0B'},
  {id: 'alley-w-n-boxes-1', type: 'cardboard-stack', x: -13.4, y: 0.24, z: -7.2, rotationY: 0.25, scale: 1.0, variant: 0, colorHex: '#B45309', secondaryColorHex: '#D97706'},
  {id: 'alley-w-n-pallet-1', type: 'wooden-pallet', x: -15.4, y: 0.24, z: -6.4, rotationY: -0.3, scale: 1.0, variant: 0, colorHex: '#92400E', secondaryColorHex: '#78350F'},
  {id: 'alley-w-n-drum-1', type: 'oil-drum', x: -16.1, y: 0.24, z: -7.0, rotationY: 0.8, scale: 1.0, variant: 0, colorHex: '#1D4ED8', secondaryColorHex: '#FACC15'},
  {id: 'alley-w-s-bags-1', type: 'garbage-bag-cluster', x: -12.5, y: 0.24, z: 6.3, rotationY: 0.9, scale: 1.08, variant: 2, colorHex: '#111827', secondaryColorHex: '#22C55E'},
  {id: 'alley-w-s-crates-1', type: 'milk-crate-stack', x: -13.9, y: 0.24, z: 7.1, rotationY: 0.35, scale: 1.0, variant: 1, colorHex: '#0284C7', secondaryColorHex: '#E11D48'},
  {id: 'alley-w-s-boxes-1', type: 'cardboard-stack', x: -15.1, y: 0.24, z: 6.4, rotationY: -0.45, scale: 1.05, variant: 1, colorHex: '#A16207', secondaryColorHex: '#CA8A04'},
  {id: 'alley-e-n-bags-1', type: 'garbage-bag-cluster', x: 12.6, y: 0.24, z: -6.3, rotationY: -0.5, scale: 1.05, variant: 0, colorHex: '#1E293B', secondaryColorHex: '#EF4444'},
  {id: 'alley-e-n-bags-2', type: 'garbage-bag-cluster', x: 14.8, y: 0.24, z: -7.1, rotationY: 2.1, scale: 1.12, variant: 1, colorHex: '#0F172A', secondaryColorHex: '#38BDF8'},
  {id: 'alley-e-n-boxes-1', type: 'cardboard-stack', x: 13.5, y: 0.24, z: -7.2, rotationY: -0.2, scale: 1.0, variant: 0, colorHex: '#B45309', secondaryColorHex: '#F59E0B'},
  {id: 'alley-e-n-crates-1', type: 'milk-crate-stack', x: 15.3, y: 0.24, z: -6.3, rotationY: 0.5, scale: 1.0, variant: 0, colorHex: '#DC2626', secondaryColorHex: '#2563EB'},
  {id: 'alley-e-s-bags-1', type: 'garbage-bag-cluster', x: 12.5, y: 0.24, z: 6.3, rotationY: 1.5, scale: 1.1, variant: 2, colorHex: '#1E293B', secondaryColorHex: '#FACC15'},
  {id: 'alley-e-s-pallet-1', type: 'wooden-pallet', x: 13.8, y: 0.24, z: 7.1, rotationY: 0.15, scale: 1.0, variant: 1, colorHex: '#92400E', secondaryColorHex: '#78350F'},
  {id: 'alley-e-s-drum-1', type: 'oil-drum', x: 15.2, y: 0.24, z: 6.4, rotationY: -0.7, scale: 1.0, variant: 1, colorHex: '#B91C1C', secondaryColorHex: '#FDE047'},
  {id: 'alley-e-s-boxes-2', type: 'cardboard-stack', x: 16.0, y: 0.24, z: 7.0, rotationY: 0.4, scale: 0.95, variant: 2, colorHex: '#B45309', secondaryColorHex: '#D97706'},
];

export function generateCityAlleys(): CityAlleySpec[] {
  const alleys: CityAlleySpec[] = [];
  const dumpsterColors = ['#15803D', '#1D4ED8', '#B45309', '#374151', '#0F766E'];
  const nettingColors = ['#1E3A8A', '#065F46', '#7C2D12', '#334155'];
  const graffitiTags = [
    'MAKE IT RIGHT!',
    'OMNIFRAME 99',
    'LO-FI DREAMS',
    'METRO SOUL',
    'NIGHT OWL',
    'KING STREET',
  ];

  const alleyZPositions = [-6.7, 6.7, -41.0, -56.0, -90.0, -108.0, 41.0, 56.0, 90.0, 108.0, -126.0];
  let idx = 0;
  for (const az of alleyZPositions) {
    for (const side of ['west', 'east'] as const) {
      const sign = side === 'west' ? -1 : 1;
      const netColor = nettingColors[idx % nettingColors.length];
      const hasLaundry = idx % 2 === 0;
      alleys.push({
        id: `city-alley-${side}-${az}`,
        side,
        x: sign * 13.8,
        z: az,
        centerZ: az,
        widthZ: Math.abs(az) < 10 ? 2.2 : 3.2,
        depthX: 5.6,
        dumpsterCount: Math.abs(az) < 10 ? 1 : 2,
        garbageBagClusters: 3 + (idx % 3),
        dumpsterColorHex: dumpsterColors[idx % dumpsterColors.length],
        nettingColorHex: netColor,
        tarpColorHex: netColor,
        hasOverheadTarp: idx % 3 !== 1,
        hasClothesline: hasLaundry,
        hasLaundryLine: hasLaundry,
        hasFireEscape: idx % 3 !== 2,
        graffitiText: graffitiTags[idx % graffitiTags.length],
      });
      idx++;
    }
  }
  return alleys;
}

export function generateExtendedAlleyProps(alleys: CityAlleySpec[]): AlleyPropSpec[] {
  const rand = createSeededRandom(55192);
  const props: AlleyPropSpec[] = [];
  const types: AlleyPropType[] = [
    'garbage-bag-cluster',
    'cardboard-stack',
    'wooden-pallet',
    'oil-drum',
    'milk-crate-stack',
  ];

  alleys.forEach((alley, aIdx) => {
    const sign = alley.side === 'west' ? -1 : 1;
    for (let i = 0; i < 4; i++) {
      const propType = types[(aIdx + i) % types.length];
      props.push({
        id: `${alley.id}-prop-${i}`,
        type: propType,
        x: sign * (12.2 + i * 1.15),
        y: 0.24,
        z: alley.centerZ + (i % 2 === 0 ? -0.55 : 0.55),
        rotationY: rand() * Math.PI * 2,
        scale: 0.9 + rand() * 0.25,
        variant: (aIdx + i) % 3,
        colorHex: i % 2 === 0 ? '#1E293B' : '#B45309',
        secondaryColorHex: i % 2 === 0 ? '#EF4444' : '#FACC15',
      });
    }
  });

  return props;
}

export function generateDetailedTreeSpecs(): DetailedTreeSpec[] {
  const rand = createSeededRandom(33481);
  const allProps = [...HERO_SIDEWALK_PROPS, ...generateExtendedCityProps()];
  const treeProps = allProps.filter((p) => p.type === 'tree');
  const speciesList: DetailedTreeSpec['species'][] = [
    'zelkova-elm',
    'sakura-cherry',
    'ginkgo-gold',
    'urban-maple',
  ];
  const palettes: Record<
    DetailedTreeSpec['species'],
    {trunk: string; primary: string; secondary: string; highlight: string}
  > = {
    'zelkova-elm': {
      trunk: '#5C3A21',
      primary: '#15803D',
      secondary: '#166534',
      highlight: '#4ADE80',
    },
    'sakura-cherry': {
      trunk: '#4A2E2B',
      primary: '#F472B6',
      secondary: '#DB2777',
      highlight: '#FBCFE8',
    },
    'ginkgo-gold': {
      trunk: '#6B4423',
      primary: '#EAB308',
      secondary: '#CA8A04',
      highlight: '#FEF08A',
    },
    'urban-maple': {
      trunk: '#52341E',
      primary: '#0F766E',
      secondary: '#115E59',
      highlight: '#2DD4BF',
    },
  };

  return treeProps.map((tp, idx) => {
    const species = speciesList[(tp.variant + idx) % speciesList.length];
    const pal = palettes[species];
    return {
      id: `detailed-${tp.id}`,
      x: tp.x,
      y: tp.y,
      z: tp.z,
      scale: 0.95 + (idx % 3) * 0.08,
      rotationY: tp.rotationY,
      species,
      trunkColorHex: pal.trunk,
      canopyPrimaryHex: pal.primary,
      canopySecondaryHex: pal.secondary,
      canopyHighlightHex: pal.highlight,
      branchCount: 4 + (idx % 2),
      foliageClusters: [
        {dx: 0, dy: 3.55, dz: 0, radius: 1.15, scaleY: 0.82},
        {dx: -0.72, dy: 3.05, dz: 0.42, radius: 0.86, scaleY: 0.78},
        {dx: 0.74, dy: 3.12, dz: -0.38, radius: 0.88, scaleY: 0.8},
        {dx: 0.42, dy: 3.25, dz: 0.68, radius: 0.78, scaleY: 0.76},
        {dx: -0.48, dy: 3.2, dz: -0.65, radius: 0.8, scaleY: 0.76},
        {dx: 0.18, dy: 4.15, dz: 0.12, radius: 0.76, scaleY: 0.75},
        {dx: -0.25, dy: 3.92, dz: -0.22, radius: 0.72, scaleY: 0.74},
      ],
      hasRootFlare: true,
      hasFallenLeaves: rand() > 0.2,
    };
  });
}

/**
 * Generate Extended City Street Furniture across the ENTIRE Multi-Block City Grid
 * (Central Avenue X=0, West Boulevard X=-56, East Boulevard X=+56, and 4 East-West Cross-Streets)
 */
export function generateExtendedCityProps(): SidewalkPropPlacement[] {
  const rand = createSeededRandom(772026);
  const props: SidewalkPropPlacement[] = [];

  // 1. North & South Central Avenue Footpath Props
  const avenueZStops = [
    -174, -162, -150, -138, -126, -114, -102, -90, -64, -52, -40, -33,
    33, 40, 52, 64, 90, 102, 114, 126, 138,
  ];

  let idx = 0;
  for (const z of avenueZStops) {
    for (const side of [-1, 1]) {
      const xBase = side * 8.15;
      const rot = side < 0 ? 0 : Math.PI;
      const mod = idx % 6;

      if (mod === 0) {
        props.push({
          id: `ext-lamp-${idx}`,
          type: 'street-lamp',
          x: side * 7.85,
          y: 0.545,
          z,
          rotationY: rot,
          variant: 0,
        });
        props.push({
          id: `ext-dustbin-${idx}`,
          type: 'dustbin',
          x: side * 8.3,
          y: 0.545,
          z: z + 1.8,
          rotationY: rot,
          variant: idx % 2,
        });
      } else if (mod === 1) {
        props.push({
          id: `ext-tree-${idx}`,
          type: 'tree',
          x: xBase,
          y: 0.545,
          z,
          rotationY: rand() * Math.PI * 2,
          variant: idx % 3,
        });
      } else if (mod === 2) {
        props.push({
          id: `ext-hydrant-${idx}`,
          type: 'fire-hydrant',
          x: side * 7.85,
          y: 0.545,
          z,
          rotationY: side < 0 ? Math.PI / 2 : -Math.PI / 2,
          variant: idx % 2,
        });
      } else if (mod === 3) {
        props.push({
          id: `ext-bench-${idx}`,
          type: 'bench',
          x: side * 8.4,
          y: 0.545,
          z,
          rotationY: side < 0 ? Math.PI / 2 : -Math.PI / 2,
          variant: idx % 2,
        });
      } else if (mod === 4) {
        props.push({
          id: `ext-tree-b-${idx}`,
          type: 'tree',
          x: xBase,
          y: 0.545,
          z,
          rotationY: rand() * Math.PI * 2,
          variant: (idx + 1) % 3,
        });
        props.push({
          id: `ext-mailbox-${idx}`,
          type: 'mailbox',
          x: side * 8.05,
          y: 0.545,
          z: z - 2.1,
          rotationY: side < 0 ? Math.PI / 2 : -Math.PI / 2,
          variant: 0,
        });
      } else {
        props.push({
          id: `ext-lamp-b-${idx}`,
          type: 'street-lamp',
          x: side * 7.85,
          y: 0.545,
          z,
          rotationY: rot,
          variant: 0,
        });
        props.push({
          id: `ext-signpost-${idx}`,
          type: 'signpost',
          x: side * 7.95,
          y: 0.545,
          z: z + 2.0,
          rotationY: rot,
          variant: idx % 3,
        });
      }
      idx++;
    }
  }

  // 2. Traffic Signal Poles at All 12 Major 4-Way Intersections (X ∈ {-56, 0, +56}, Z ∈ {-75, -24.5, +24.5, +75})
  for (const ax of [-56, 0, 56]) {
    for (const iz of [-75, -24.5, 24.5, 75]) {
      for (const cornerSignX of [-1, 1]) {
        const cornerSignZ = cornerSignX > 0 ? 1 : -1;
        props.push({
          id: `traffic-signal-${ax}-${iz}-${cornerSignX}`,
          type: 'traffic-light',
          x: ax + cornerSignX * 8.2,
          y: 0.545,
          z: iz + cornerSignZ * 7.2,
          rotationY: cornerSignX < 0 ? 0 : Math.PI,
          variant: Math.abs(iz) > 50 ? 1 : 0,
        });
      }
    }
  }

  // 3. East-West Cross-Street Footpath Props (along Z = ±24.5m and Z = ±75m, avoiding avenue intersections at X = 0, ±56m)
  const crossStreetXStops = [-96, -80, -38, -22, 22, 38, 80, 96];
  for (const cx of crossStreetXStops) {
    for (const czCenter of [-75, -24.5, 24.5, 75]) {
      for (const zSide of [-1, 1]) {
        const pz = czCenter + zSide * 7.1;
        const pMod = Math.abs(cx + Math.round(czCenter)) % 5;
        if (pMod === 0) {
          props.push({
            id: `cross-tree-${cx}-${pz}`,
            type: 'tree',
            x: cx,
            y: 0.545,
            z: pz,
            rotationY: rand() * Math.PI,
            variant: idx % 4,
          });
        } else if (pMod === 1) {
          props.push({
            id: `cross-hydrant-${cx}-${pz}`,
            type: 'fire-hydrant',
            x: cx,
            y: 0.545,
            z: pz,
            rotationY: zSide < 0 ? 0 : Math.PI,
            variant: 0,
          });
        } else if (pMod === 2) {
          props.push({
            id: `cross-dustbin-${cx}-${pz}`,
            type: 'dustbin',
            x: cx,
            y: 0.545,
            z: pz,
            rotationY: 0,
            variant: 1,
          });
        } else if (pMod === 3) {
          props.push({
            id: `cross-bench-${cx}-${pz}`,
            type: 'bench',
            x: cx,
            y: 0.545,
            z: pz,
            rotationY: 0,
            variant: 0,
          });
        } else {
          props.push({
            id: `cross-lamp-${cx}-${pz}`,
            type: 'street-lamp',
            x: cx,
            y: 0.545,
            z: pz,
            rotationY: Math.PI / 2,
            variant: 0,
          });
        }
        idx++;
      }
    }
  }

  // 4. West Boulevard (X = -56m) & East Boulevard (X = +56m) Footpath Props
  const blvdZStops = [-58, -42, -10, 10, 42, 58];
  for (const bCenterX of [-56, 56]) {
    for (const bz of blvdZStops) {
      for (const side of [-1, 1]) {
        const px = bCenterX + side * 7.85;
        const pMod = (idx + Math.abs(bz)) % 4;
        if (pMod === 0) {
          props.push({
            id: `blvd-lamp-${bCenterX}-${bz}-${side}`,
            type: 'street-lamp',
            x: px,
            y: 0.545,
            z: bz,
            rotationY: side < 0 ? 0 : Math.PI,
            variant: 0,
          });
        } else if (pMod === 1) {
          props.push({
            id: `blvd-tree-${bCenterX}-${bz}-${side}`,
            type: 'tree',
            x: px,
            y: 0.545,
            z: bz,
            rotationY: rand() * Math.PI * 2,
            variant: idx % 4,
          });
        } else if (pMod === 2) {
          props.push({
            id: `blvd-hydrant-${bCenterX}-${bz}-${side}`,
            type: 'fire-hydrant',
            x: px,
            y: 0.545,
            z: bz,
            rotationY: side < 0 ? Math.PI / 2 : -Math.PI / 2,
            variant: 0,
          });
        } else {
          props.push({
            id: `blvd-bench-${bCenterX}-${bz}-${side}`,
            type: 'bench',
            x: px,
            y: 0.545,
            z: bz,
            rotationY: side < 0 ? Math.PI / 2 : -Math.PI / 2,
            variant: 0,
          });
        }
        idx++;
      }
    }
  }

  return props;
}

/**
 * Generate Multi-Block City Buildings with Full Main-Street Detail Parity!
 * Includes:
 * 1. Central Avenue North & South Blocks (X = ±14.2m)
 * 2. East-West Cross-Street Blocks fronting 2nd St N/S (Z = ±24.5m) & 5th St N/S (Z = ±75m)
 * 3. West Boulevard (X = -56m) & East Boulevard (X = +56m) Corner & Corridor Blocks
 * 4. Outer Town Blocks receding toward the 360° Mountain Ring
 */
export function generateExtendedCityBuildings(): MidCityBuildingSpec[] {
  const rand = createSeededRandom(188701);
  const buildings: MidCityBuildingSpec[] = [];

  const wallPalette = [
    {base: '#7C3A2D', accent: '#5C281E', upper: '#8E4839'},
    {base: '#B46E35', accent: '#8F5322', upper: '#C78246'},
    {base: '#5B677D', accent: '#434D5E', upper: '#69768E'},
    {base: '#4A6E68', accent: '#35524D', upper: '#59827B'},
    {base: '#6D547D', accent: '#523D5E', upper: '#7E6390'},
    {base: '#9A4850', accent: '#7A343B', upper: '#B05861'},
    {base: '#4E5D6C', accent: '#37434F', upper: '#627385'},
    {base: '#8A5A36', accent: '#694226', upper: '#9F6B43'},
  ];
  const roofPalette = ['#2D3748', '#4A2C2A', '#334155', '#1E293B', '#3E2723'];
  const trimPalette = ['#E2E8F0', '#F1F5F9', '#D6CFC2', '#CBD5E1'];
  const displayTypes: HeroShopSpec['windowDisplayType'][] = [
    'cafe',
    'books',
    'hardware',
    'mannequin',
    'pastries',
    'ramen',
    'nutcrackers',
  ];

  let shopCursor = 0;
  let billboardCursor = 0;

  // 1. Central Avenue North & South Blocks (Z = -172m to -35m, and Z = +35m to +120m)
  const zBlocks = [
    -172, -154, -136, -118, -98, -61, -48, -35, 35, 48, 61, 98, 116,
  ];
  for (const bz of zBlocks) {
    for (const side of [-1, 1]) {
      const dist = Math.abs(bz);
      const lodTier: 1 | 2 = dist < 135 ? 1 : 2;
      const floors =
        lodTier === 1
          ? Math.max(3, Math.floor(4 - (dist / 160) * 1.5 + rand() * 1.8))
          : Math.max(2, Math.floor(2 + rand() * 2));
      const widthX = 6.2;
      const depthZ = 10.8;
      const heightY = 5.4 + (floors - 1) * 3.0;
      const centerX = side * 14.3;

      const pal = wallPalette[(shopCursor + Math.floor(rand() * 3)) % wallPalette.length];
      const shopBrand = CITY_SHOP_CATALOG[shopCursor++ % CITY_SHOP_CATALOG.length];
      const rooftopBillboard =
        lodTier === 1 && shopCursor % 2 === 0
          ? ROOFTOP_BILLBOARD_CATALOG[
              billboardCursor++ % ROOFTOP_BILLBOARD_CATALOG.length
            ]
          : undefined;
      const hasTank = shopCursor % 3 === 0;

      buildings.push({
        id: `ave-bld-${side < 0 ? 'w' : 'e'}-${bz}`,
        lodTier,
        x: centerX,
        z: bz,
        widthX,
        depthZ,
        heightY,
        floors,
        hasBalconies: true,
        detailedFacade: true,
        wallColorHex: pal.base,
        brickAccentHex: pal.accent,
        upperWallHex: pal.upper,
        roofColorHex: roofPalette[Math.floor(rand() * roofPalette.length)],
        trimColorHex: trimPalette[Math.floor(rand() * trimPalette.length)],
        shopBrand,
        rooftopBillboard,
        windowDisplayType: displayTypes[shopCursor % displayTypes.length],
        hasWaterTank: hasTank,
        hasRoofWaterTank: hasTank,
        bannerText: shopBrand.bannerText,
        posterTitle: shopBrand.posterTitle,
        facingRotationY: side < 0 ? Math.PI / 2 : -Math.PI / 2,
      });
    }
  }

  // 2. East-West Cross-Street Frontage Buildings (facing 2nd St N/S at Z = ±24.5m and 5th St N/S at Z = ±75m)
  const crossStreetXPositions = [-92, -78, -38, -25, 25, 38, 78, 92];
  const crossStreetConfigs: Array<{streetZ: number; offsetZ: number; facingRotY: number}> = [
    {streetZ: -24.5, offsetZ: -12.9, facingRotY: 0}, // North side of 2nd St N, facing South (+Z)
    {streetZ: -24.5, offsetZ: 12.9, facingRotY: Math.PI}, // South side of 2nd St N, facing North (-Z)
    {streetZ: 24.5, offsetZ: -12.9, facingRotY: 0}, // North side of 2nd St S, facing South (+Z)
    {streetZ: 24.5, offsetZ: 12.9, facingRotY: Math.PI}, // South side of 2nd St S, facing North (-Z)
    {streetZ: -75.0, offsetZ: -12.9, facingRotY: 0}, // North side of 5th St N, facing South (+Z)
    {streetZ: 75.0, offsetZ: 12.9, facingRotY: Math.PI}, // South side of 5th St S, facing North (-Z)
  ];

  for (const bx of crossStreetXPositions) {
    for (const cfg of crossStreetConfigs) {
      const bz = cfg.streetZ + cfg.offsetZ;
      const radialDist = Math.hypot(bx, bz);
      const lodTier: 1 | 2 = radialDist < 125 ? 1 : 2;
      const floors = lodTier === 1 ? 3 + (shopCursor % 2) : 2;
      const widthX = 10.8;
      const depthZ = 6.0;
      const heightY = 5.4 + (floors - 1) * 3.0;

      const pal = wallPalette[shopCursor % wallPalette.length];
      const shopBrand = CITY_SHOP_CATALOG[shopCursor++ % CITY_SHOP_CATALOG.length];
      const rooftopBillboard =
        lodTier === 1 && shopCursor % 3 === 0
          ? ROOFTOP_BILLBOARD_CATALOG[
              billboardCursor++ % ROOFTOP_BILLBOARD_CATALOG.length
            ]
          : undefined;
      const hasTank = shopCursor % 2 === 0;

      buildings.push({
        id: `cross-bld-${bx}-${bz.toFixed(1)}`,
        lodTier,
        x: bx,
        z: bz,
        widthX,
        depthZ,
        heightY,
        floors,
        hasBalconies: true,
        detailedFacade: true,
        wallColorHex: pal.base,
        brickAccentHex: pal.accent,
        upperWallHex: pal.upper,
        roofColorHex: roofPalette[shopCursor % roofPalette.length],
        trimColorHex: trimPalette[shopCursor % trimPalette.length],
        shopBrand,
        rooftopBillboard,
        windowDisplayType: displayTypes[shopCursor % displayTypes.length],
        hasWaterTank: hasTank,
        hasRoofWaterTank: hasTank,
        bannerText: shopBrand.bannerText,
        posterTitle: shopBrand.posterTitle,
        facingRotationY: cfg.facingRotY,
      });
    }
  }

  // 3. West Boulevard (X = -56m) & East Boulevard (X = +56m) Avenue Buildings
  const blvdZPositions = [-55, -41, 0, 41, 55];
  for (const blvdX of [-56, 56]) {
    for (const bz of blvdZPositions) {
      for (const side of [-1, 1]) {
        const bx = blvdX + side * 14.2;
        const floors = 3 + (shopCursor % 2);
        const widthX = 6.0;
        const depthZ = 10.6;
        const heightY = 5.4 + (floors - 1) * 3.0;
        const pal = wallPalette[shopCursor % wallPalette.length];
        const shopBrand = CITY_SHOP_CATALOG[shopCursor++ % CITY_SHOP_CATALOG.length];
        const hasTank = shopCursor % 2 === 1;

        buildings.push({
          id: `blvd-bld-${blvdX}-${side < 0 ? 'w' : 'e'}-${bz}`,
          lodTier: 1,
          x: bx,
          z: bz,
          widthX,
          depthZ,
          heightY,
          floors,
          hasBalconies: true,
          detailedFacade: true,
          wallColorHex: pal.base,
          brickAccentHex: pal.accent,
          upperWallHex: pal.upper,
          roofColorHex: roofPalette[shopCursor % roofPalette.length],
          trimColorHex: trimPalette[shopCursor % trimPalette.length],
          shopBrand,
          rooftopBillboard:
            shopCursor % 4 === 0
              ? ROOFTOP_BILLBOARD_CATALOG[
                  billboardCursor++ % ROOFTOP_BILLBOARD_CATALOG.length
                ]
              : undefined,
          windowDisplayType: displayTypes[shopCursor % displayTypes.length],
          hasWaterTank: hasTank,
          hasRoofWaterTank: hasTank,
          bannerText: shopBrand.bannerText,
          posterTitle: shopBrand.posterTitle,
          facingRotationY: side < 0 ? Math.PI / 2 : -Math.PI / 2,
        });
      }
    }
  }

  // 4. Outer City Grid & Town Outskirts (LOD Tier 2: Radius 130m–280m)
  const outerXBlocks = [-225, -188, -148, -118, 118, 148, 188, 225];
  const outerZRows = [-160, -115, -50, 0, 50, 115];

  for (const bx of outerXBlocks) {
    for (const rz of outerZRows) {
      const radialDist = Math.hypot(bx, rz);
      if (radialDist > 290) continue;
      const lodTier: 1 | 2 = radialDist < 130 ? 1 : 2;
      const floors = lodTier === 1 ? 3 : 2;
      const widthX = 11.2;
      const depthZ = 9.6;
      const heightY = floors * 3.1 + 1.2;
      const pal = wallPalette[shopCursor % wallPalette.length];
      const shopBrand = CITY_SHOP_CATALOG[shopCursor++ % CITY_SHOP_CATALOG.length];

      buildings.push({
        id: `city-grid-${bx}-${rz}`,
        lodTier,
        x: bx,
        z: rz,
        widthX,
        depthZ,
        heightY,
        floors,
        hasBalconies: true,
        detailedFacade: lodTier === 1,
        wallColorHex: pal.base,
        brickAccentHex: pal.accent,
        upperWallHex: pal.upper,
        roofColorHex: roofPalette[shopCursor % roofPalette.length],
        trimColorHex: trimPalette[shopCursor % trimPalette.length],
        shopBrand,
        windowDisplayType: displayTypes[shopCursor % displayTypes.length],
        hasWaterTank: false,
        hasRoofWaterTank: false,
        bannerText: shopBrand.bannerText,
        posterTitle: shopBrand.posterTitle,
        facingRotationY: rz <= 0 ? 0 : Math.PI,
      });
    }
  }

  return buildings;
}

/**
 * Generate a 360° Horizon-Closing Multi-Ridge Mountain Range (32 Foothills + 36 Towering Craggy Alpine Massifs)
 */
export function generateSurroundingMountainRange(): MountainPeakSpec[] {
  const rand = createSeededRandom(99421);
  const peaks: MountainPeakSpec[] = [];

  // Ring A: 32 Rolling Multi-Ridge Foothills (Radius 350m – 480m)
  const foothillCount = 32;
  const foothillColors = ['#4A6B82', '#3F5E75', '#52738A', '#47677D'];
  const foothillShadows = ['#324B5E', '#2A4152', '#385266', '#2E4657'];
  for (let i = 0; i < foothillCount; i++) {
    const angleRad = (i / foothillCount) * Math.PI * 2 + (rand() - 0.5) * 0.06;
    const distance = 365 + rand() * 85;
    const axisDip = Math.abs(Math.sin(angleRad)) > 0.92 ? 0.65 : 1.0;
    const baseRadius = 58 + rand() * 34;
    const heightY = (42 + rand() * 34) * axisDip;

    peaks.push({
      id: `foothill-${i}`,
      ring: 'foothill',
      angleRad,
      distance,
      x: Math.cos(angleRad) * distance,
      z: Math.sin(angleRad) * distance,
      baseRadius,
      heightY,
      ridgeRotationY: rand() * Math.PI,
      colorHex: foothillColors[i % foothillColors.length],
      shadowColorHex: foothillShadows[i % foothillShadows.length],
      snowCapRatio: 0,
      subPeakLeftScale: 0.62 + rand() * 0.18,
      subPeakRightScale: 0.55 + rand() * 0.22,
    });
  }

  // Ring B: 36 Towering Craggy Alpine Massifs (Radius 520m – 760m)
  const alpineCount = 36;
  const alpineColors = ['#3B5978', '#324E6B', '#436485', '#2C4663'];
  const alpineShadows = ['#23384F', '#1E3145', '#294059', '#192A3D'];
  for (let i = 0; i < alpineCount; i++) {
    const angleRad = (i / alpineCount) * Math.PI * 2 + 0.04;
    const distance = 540 + rand() * 160;
    const baseRadius = 96 + rand() * 56;
    const heightY = 98 + rand() * 92;

    peaks.push({
      id: `alpine-peak-${i}`,
      ring: 'alpine',
      angleRad,
      distance,
      x: Math.cos(angleRad) * distance,
      z: Math.sin(angleRad) * distance,
      baseRadius,
      heightY,
      ridgeRotationY: rand() * Math.PI,
      colorHex: alpineColors[i % alpineColors.length],
      shadowColorHex: alpineShadows[i % alpineShadows.length],
      snowCapRatio: heightY > 125 ? 0.36 : 0.24,
      subPeakLeftScale: 0.68 + rand() * 0.16,
      subPeakRightScale: 0.6 + rand() * 0.2,
    });
  }

  return peaks;
}

/**
 * Compute 2D Bounding Boxes for all Hero Buildings and Sidewalk Props and verify ZERO phasing/collisions.
 */
export function computeHeroSceneAABBs(): AABB2D[] {
  const boxes: AABB2D[] = [];

  for (const shop of HERO_BLOCK_SHOPS) {
    const minX = shop.side === 'west' ? -11.2 - shop.depthX : 11.2;
    const maxX = shop.side === 'west' ? -11.2 : 11.2 + shop.depthX;
    boxes.push({
      id: shop.id,
      category: 'hero-building',
      minX,
      maxX,
      minZ: shop.centerZ - shop.widthZ * 0.5,
      maxZ: shop.centerZ + shop.widthZ * 0.5,
    });
  }

  const radiusByProp: Record<SidewalkPropPlacement['type'], [number, number]> = {
    'street-lamp': [0.42, 0.42],
    'fire-hydrant': [0.35, 0.35],
    dustbin: [0.45, 0.45],
    bench: [0.45, 0.95],
    mailbox: [0.36, 0.36],
    tree: [0.65, 0.65],
    'traffic-light': [0.42, 0.42],
    signpost: [0.3, 0.3],
  };

  for (const prop of HERO_SIDEWALK_PROPS) {
    const [rx, rz] = radiusByProp[prop.type];
    boxes.push({
      id: prop.id,
      category:
        prop.type === 'traffic-light' || prop.type === 'signpost'
          ? 'street-lamp'
          : prop.type,
      minX: prop.x - rx,
      maxX: prop.x + rx,
      minZ: prop.z - rz,
      maxZ: prop.z + rz,
    });
  }

  return boxes;
}

export function validateCitySpatialClearance(): {
  valid: boolean;
  collisions: Array<[string, string]>;
} {
  const boxes = computeHeroSceneAABBs();
  const collisions: Array<[string, string]> = [];

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const overlapX = a.minX < b.maxX && a.maxX > b.minX;
      const overlapZ = a.minZ < b.maxZ && a.maxZ > b.minZ;
      if (overlapX && overlapZ) {
        collisions.push([a.id, b.id]);
      }
    }
  }

  return {
    valid: collisions.length === 0,
    collisions,
  };
}
