/**
 * PHASE 1: SHARED WORLD & CHARACTER COLOR PALETTE
 * Matches the existing Main Street Cel-Shaded & 2D Comic Ink World (`#0A0812` outlines,
 * 3-tone Base / Shadow / Highlight cel-shading bands) so all 10 character types and the
 * 3D city scenes look like one cohesive animation-studio production.
 */

export interface CelShadedToneTriplet {
  base: string;
  shadow: string;
  highlight: string;
}

export type CelColorTriplet = CelShadedToneTriplet;

export interface SkinTonePalette extends CelShadedToneTriplet {
  id: string;
  blush: string;
  lipTint: string;
}

export const SHARED_INK_OUTLINE = '#0A0812' as const;

export const SKIN_TONE_PALETTES = {
  warmPeach: {
    id: 'warmPeach',
    base: '#FCD5B5',
    shadow: '#E5A97C',
    highlight: '#FFF1E6',
    blush: '#FB7185',
    lipTint: '#E11D48',
  },
  lightIvory: {
    id: 'lightIvory',
    base: '#FFE4D6',
    shadow: '#F0B89E',
    highlight: '#FFF5F0',
    blush: '#FB7185',
    lipTint: '#E11D48',
  },
  oliveTan: {
    id: 'oliveTan',
    base: '#D9A17C',
    shadow: '#B37850',
    highlight: '#F2C9AC',
    blush: '#E11D48',
    lipTint: '#9F1239',
  },
  goldenBronze: {
    id: 'goldenBronze',
    base: '#C68B59',
    shadow: '#9A6334',
    highlight: '#E8B48A',
    blush: '#E11D48',
    lipTint: '#881337',
  },
  deepUmber: {
    id: 'deepUmber',
    base: '#7C4D34',
    shadow: '#54301D',
    highlight: '#9E6B4F',
    blush: '#BE123C',
    lipTint: '#4C0519',
  },
  goldenTan: {
    id: 'goldenTan',
    base: '#E8B48A',
    shadow: '#C68B59',
    highlight: '#F9DEC9',
    blush: '#F43F5E',
    lipTint: '#BE123C',
  },
  oliveWarm: {
    id: 'oliveWarm',
    base: '#D9A17C',
    shadow: '#B37850',
    highlight: '#F2C9AC',
    blush: '#E11D48',
    lipTint: '#9F1239',
  },
  richAmber: {
    id: 'richAmber',
    base: '#B87A52',
    shadow: '#8C5332',
    highlight: '#D69E78',
    blush: '#E11D48',
    lipTint: '#881337',
  },
  deepEspresso: {
    id: 'deepEspresso',
    base: '#7C4D34',
    shadow: '#54301D',
    highlight: '#9E6B4F',
    blush: '#BE123C',
    lipTint: '#4C0519',
  },
  carvedHardwood: {
    id: 'carvedHardwood',
    base: '#FDBA74',
    shadow: '#D97706',
    highlight: '#FEF3C7',
    blush: '#EF4444',
    lipTint: '#991B1B',
  },
} as const satisfies Record<string, SkinTonePalette>;

export type SkinToneId = keyof typeof SKIN_TONE_PALETTES;

export const SKIN_TONE_KEYS = Object.keys(SKIN_TONE_PALETTES) as SkinToneId[];

/**
 * Curated Outfit Palettes for all 10 Character Types + Crowd/Pedestrian variations.
 */
export const CHARACTER_OUTFIT_PALETTES = {
  // 1. MAIN BOY (Hero Crimson/Navy Varsity Bomber + Cream Tee + Indigo Denim + Red/White High-Tops)
  mainBoy: {
    jacket: {base: '#DC2626', shadow: '#991B1B', highlight: '#F87171'},
    shirt: {base: '#F8FAFC', shadow: '#CBD5E1', highlight: '#FFFFFF'},
    jeans: {base: '#1E3A8A', shadow: '#172554', highlight: '#3B82F6'},
    shoes: {base: '#EF4444', shadow: '#991B1B', highlight: '#F8FAFC'},
    hair: {base: '#1E1B2E', shadow: '#090D16', highlight: '#475569'},
  },

  // 2. MAIN GIRL (Hero Teal/Emerald Cozy Jacket + Cream Top + Pleated Skirt + Boots)
  mainGirl: {
    jacket: {base: '#0D9488', shadow: '#115E59', highlight: '#2DD4BF'},
    top: {base: '#FFE4E6', shadow: '#FDA4AF', highlight: '#FFF1F2'},
    skirt: {base: '#312E81', shadow: '#1E1B4B', highlight: '#6366F1'},
    boots: {base: '#F43F5E', shadow: '#9F1239', highlight: '#FB7185'},
    hair: {base: '#5C281E', shadow: '#3B1810', highlight: '#9A4838'},
  },

  // 3. HACKER FRIEND (Distinctive Oversized Cyber-Slouch Hoodie + Snack Bag + Glowing Phone)
  hackerFriend: {
    hoodie: {base: '#4C1D95', shadow: '#2E1065', highlight: '#7C3AED'},
    pants: {base: '#1E293B', shadow: '#0F172A', highlight: '#334155'},
    accent: {base: '#10B981', shadow: '#047857', highlight: '#34D399'},
    snackBag: {base: '#F97316', shadow: '#C2410C', highlight: '#FDBA74'},
    phoneGlow: {base: '#22D3EE', shadow: '#0891B2', highlight: '#A5F3FC'},
  },

  // 4. HYPE MAN (Gold Tracksuit + Backwards Cap + Cardboard Countdown Sign)
  hypeMan: {
    tracksuit: {base: '#F59E0B', shadow: '#B45309', highlight: '#FDE047'},
    pants: {base: '#111827', shadow: '#030712', highlight: '#374151'},
    visorCap: {base: '#EF4444', shadow: '#991B1B', highlight: '#F87171'},
    cardboard: {base: '#D97706', shadow: '#92400E', highlight: '#FDE68A'},
  },

  // 5. SQUAD MEMBER A (Tactical Olive Vest, Cargo Pants & Beret)
  squadMemberA: {
    vest: {base: '#15803D', shadow: '#14532D', highlight: '#4ADE80'},
    shirt: {base: '#0284C7', shadow: '#075985', highlight: '#38BDF8'},
    cargo: {base: '#334155', shadow: '#1E293B', highlight: '#64748B'},
    beret: {base: '#991B1B', shadow: '#7F1D1D', highlight: '#EF4444'},
  },

  // 6. SQUAD MEMBER B (Visibly Distinct Purple Puffer Jacket, Beanie & High-Top Kicks)
  squadMemberB: {
    puffer: {base: '#7C3AED', shadow: '#4C1D95', highlight: '#A78BFA'},
    trackPants: {base: '#1E293B', shadow: '#0F172A', highlight: '#475569'},
    beanie: {base: '#F59E0B', shadow: '#B45309', highlight: '#FDE047'},
    kicks: {base: '#EC4899', shadow: '#9D174D', highlight: '#F472B6'},
  },

  // 8. NUTCRACKER DOLL (Hero Royal Guard + Shop-Window Variants)
  nutcracker: {
    uniformRed: {base: '#DC2626', shadow: '#7F1D1D', highlight: '#F87171'},
    goldTrim: {base: '#FACC15', shadow: '#B45309', highlight: '#FEF08A'},
    shakoHat: {base: '#111827', shadow: '#030712', highlight: '#374151'},
    boots: {base: '#111827', shadow: '#030712', highlight: '#374151'},
    beard: {base: '#F8FAFC', shadow: '#CBD5E1', highlight: '#FFFFFF'},
    woodSkin: {base: '#FDBA74', shadow: '#D97706', highlight: '#FEF3C7'},
  },

  // 9. MALE DOG
  maleDog: {
    coat: {base: '#D97706', shadow: '#92400E', highlight: '#FBBF24'},
    belly: {base: '#FEF3C7', shadow: '#FDE68A', highlight: '#FFFBEB'},
    ears: {base: '#78350F', shadow: '#451A03', highlight: '#B45309'},
    collar: {base: '#DC2626', shadow: '#991B1B', highlight: '#F87171'},
    tag: {base: '#FACC15', shadow: '#CA8A04', highlight: '#FEF08A'},
  },

  // 10. PIGEON
  pigeon: {
    body: {base: '#64748B', shadow: '#334155', highlight: '#94A3B8'},
    wing: {base: '#475569', shadow: '#1E293B', highlight: '#CBD5E1'},
    iridescentNeck: {base: '#10B981', shadow: '#047857', highlight: '#6EE7B7'},
    beakAndFeet: {base: '#F97316', shadow: '#C2410C', highlight: '#FDBA74'},
  },
} as const;

export const CROWD_COLOR_SWATCHES: readonly CelShadedToneTriplet[] = [
  {base: '#2563EB', shadow: '#1E3A8A', highlight: '#60A5FA'},
  {base: '#D97706', shadow: '#92400E', highlight: '#FBBF24'},
  {base: '#059669', shadow: '#064E3B', highlight: '#34D399'},
  {base: '#7C3AED', shadow: '#4C1D95', highlight: '#A78BFA'},
  {base: '#E11D48', shadow: '#881337', highlight: '#FB7185'},
  {base: '#0891B2', shadow: '#164E63', highlight: '#22D3EE'},
  {base: '#475569', shadow: '#1E293B', highlight: '#94A3B8'},
  {base: '#B45309', shadow: '#78350F', highlight: '#F59E0B'},
];

export const CROWD_HAIR_SWATCHES: readonly CelShadedToneTriplet[] = [
  {base: '#1E1B2E', shadow: '#090D16', highlight: '#475569'},
  {base: '#5C281E', shadow: '#27130A', highlight: '#9A4838'},
  {base: '#92400E', shadow: '#451A03', highlight: '#D97706'},
  {base: '#D97706', shadow: '#92400E', highlight: '#FDE047'},
  {base: '#475569', shadow: '#1E293B', highlight: '#94A3B8'},
  {base: '#F8FAFC', shadow: '#CBD5E1', highlight: '#FFFFFF'},
];
