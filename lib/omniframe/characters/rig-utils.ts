import { interpolate, random, spring } from 'remotion';
import {
  CROWD_COLOR_SWATCHES,
  CROWD_HAIR_SWATCHES,
  SKIN_TONE_PALETTES,
  type SkinToneId,
} from './palette';

export type CharacterId =
  | 'main-boy'
  | 'main-girl'
  | 'hacker-friend'
  | 'hype-man'
  | 'squad-member-a'
  | 'squad-member-b'
  | 'pedestrian'
  | 'nutcracker-doll'
  | 'male-dog'
  | 'pigeon';

export type CharacterFacing = 'left' | 'right';

export type MainBoyExpression =
  | 'happy'
  | 'nervous'
  | 'terrified'
  | 'determined'
  | 'shocked'
  | 'guilty';

export type MainBoyAnimation =
  | 'walk'
  | 'hand-holding-walk'
  | 'sprint'
  | 'point'
  | 'salute'
  | 'dance'
  | 'freeze'
  | 'mouth-drop';

export type MainGirlExpression =
  | 'happy'
  | 'confused'
  | 'neutral'
  | 'soot-covered';

export type MainGirlAnimation =
  | 'walk'
  | 'point-at-shop'
  | 'shrug'
  | 'browse-shelves'
  | 'walk-out-of-rubble'
  | 'hand-holding'
  | 'holding-christmas-doll';

export type HackerFriendExpression =
  | 'unbothered'
  | 'confused'
  | 'deadpan';

export type HackerFriendAnimation =
  | 'eating'
  | 'tapping-phone'
  | 'shrugging'
  | 'throwing-snack';

export type CountdownSignValue =
  | '10'
  | '9'
  | '8'
  | '7'
  | '6'
  | '5'
  | '4'
  | '3'
  | '2'
  | '1'
  | 'BOOM!';

export type HypeManAnimation =
  | 'countdown-gestures'
  | 'jumping'
  | 'cheering'
  | 'dancing';

export type SquadMemberAAnimation =
  | 'salute'
  | 'point'
  | 'cheer'
  | 'high-five'
  | 'dance';

export type SquadMemberBAnimation =
  | 'salute'
  | 'cheer'
  | 'dance'
  | 'shocked-reaction';

export type PedestrianArchetypeVariant =
  | 'business-commuter'
  | 'jogger-hoodie'
  | 'elder-coat'
  | 'casual-shopper'
  | 'shop-cashier';

export type PedestrianAnimation =
  | 'walk'
  | 'wince'
  | 'cross-legs'
  | 'hurry-away';

export type NutcrackerDollVariant = 'hero' | 'shop-window';

export type NutcrackerDollAnimation =
  | 'head-rotation'
  | 'eye-movement'
  | 'gulp'
  | 'trembling'
  | 'detachable-head';

export type MaleDogAnimation =
  | 'idle'
  | 'tail-tuck'
  | 'startled-expression'
  | 'bolt-away-run';

export type PigeonAnimation =
  | 'perch'
  | 'head-turn'
  | 'wing-flap'
  | 'takeoff';

export type CharacterExpressionId =
  | MainBoyExpression
  | MainGirlExpression
  | HackerFriendExpression
  | 'excited'
  | 'wince'
  | 'startled'
  | 'stoic';

export type CharacterPoseId =
  | MainBoyAnimation
  | MainGirlAnimation
  | HackerFriendAnimation
  | HypeManAnimation
  | SquadMemberAAnimation
  | SquadMemberBAnimation
  | PedestrianAnimation
  | NutcrackerDollAnimation
  | MaleDogAnimation
  | PigeonAnimation
  | 'idle';

export type EyeStateId = 'open' | 'squint' | 'wide' | 'blink' | 'half-lid';
export type BrowStateId = 'neutral' | 'raised' | 'furrowed' | 'worried' | 'asymmetric' | 'shocked-high';
export type MouthShapeId =
  | 'smile'
  | 'frown'
  | 'o-mouth'
  | 'gritted-teeth'
  | 'gulp'
  | 'flat-line'
  | 'jaw-drop';

export interface CharacterRigProps {
  pose?: CharacterPoseId;
  secondaryPose?: CharacterPoseId;
  poseBlend?: number;
  expression?: CharacterExpressionId;
  facing?: CharacterFacing;
  scale?: number;
  outfit?: string;
  seed?: string | number;
  startFrame?: number;
  speed?: number;
  frameOverride?: number;
  fpsOverride?: number;
  sunglasses?: boolean;
  countdownValue?: CountdownSignValue;
  pedestrianArchetype?: PedestrianArchetypeVariant;
  nutcrackerVariant?: NutcrackerDollVariant;
  x?: number;
  y?: number;
  className?: string;
}

export interface JointAngles {
  rootX: number;
  rootY: number;
  rootRotate: number;
  pelvisRotate: number;
  torsoRotate: number;
  torsoSquashY: number;
  headRotate: number;
  headOffsetX: number;
  headOffsetY: number;
  jawDropPx: number;
  throatGulpScale: number;
  shoulderL: number;
  elbowL: number;
  wristL: number;
  shoulderR: number;
  elbowR: number;
  wristR: number;
  hipL: number;
  kneeL: number;
  ankleL: number;
  hipR: number;
  kneeR: number;
  ankleR: number;
  hairSwing: number;
  clothSway: number;
  hatTasselSwing: number;
  propOffsetX: number;
  propOffsetY: number;
  propRotate: number;
  headDetachX: number;
  headDetachY: number;
  headDetachRotate: number;
  tailWag: number;
  earFlop: number;
  wingFlapDeg: number;
}

export interface FaceStateEvaluation {
  eyeState: EyeStateId;
  browState: BrowStateId;
  mouthShape: MouthShapeId;
  pupilOffsetX: number;
  pupilOffsetY: number;
  pupilScale: number;
  isBlinking: boolean;
  blinkAmount01: number;
  jawDropExtraPx: number;
  throatGulp01: number;
  sweatDrops: boolean;
  blush: boolean;
  sootCovered: boolean;
}

export const DEFAULT_JOINT_ANGLES: JointAngles = {
  rootX: 0,
  rootY: 0,
  rootRotate: 0,
  pelvisRotate: 0,
  torsoRotate: 0,
  torsoSquashY: 1,
  headRotate: 0,
  headOffsetX: 0,
  headOffsetY: 0,
  jawDropPx: 0,
  throatGulpScale: 0,
  shoulderL: 16,
  elbowL: 12,
  wristL: 0,
  shoulderR: -16,
  elbowR: -12,
  wristR: 0,
  hipL: 5,
  kneeL: 4,
  ankleL: 0,
  hipR: -5,
  kneeR: 4,
  ankleR: 0,
  hairSwing: 0,
  clothSway: 0,
  hatTasselSwing: 0,
  propOffsetX: 0,
  propOffsetY: 0,
  propRotate: 0,
  headDetachX: 0,
  headDetachY: 0,
  headDetachRotate: 0,
  tailWag: 0,
  earFlop: 0,
  wingFlapDeg: 0,
};

/**
 * Deterministic random number in [0, 1) using Remotion's `random(seed)`.
 * Never uses Math.random().
 */
export function seededRandom(seed: string | number): number {
  return random(String(seed));
}

export function seededRange(seed: string | number, min: number, max: number): number {
  return min + seededRandom(seed) * (max - min);
}

export function seededPick<T>(seed: string | number, items: readonly T[]): T {
  const idx = Math.floor(seededRandom(seed) * items.length) % items.length;
  return items[Math.max(0, idx)];
}

/**
 * SVG transform string that rotates and scales cleanly around a specific joint pivot `(px, py)`.
 */
export function pivotTransform(
  px: number,
  py: number,
  angleDeg: number,
  translateX = 0,
  translateY = 0,
  scaleX = 1,
  scaleY = 1
): string {
  const parts: string[] = [];
  if (translateX !== 0 || translateY !== 0) {
    parts.push(`translate(${translateX.toFixed(2)}, ${translateY.toFixed(2)})`);
  }
  if (angleDeg !== 0) {
    parts.push(`rotate(${angleDeg.toFixed(2)}, ${px}, ${py})`);
  }
  if (scaleX !== 1 || scaleY !== 1) {
    parts.push(
      `translate(${px}, ${py}) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}) translate(${-px}, ${-py})`
    );
  }
  return parts.join(' ');
}

/**
 * Linearly blends two full JointAngles structures for seamless pose blending
 * (e.g. walking while pointing or shrugging).
 */
export function blendJointAngles(a: JointAngles, b: JointAngles, weight01: number): JointAngles {
  const w = Math.max(0, Math.min(1, weight01));
  const inv = 1 - w;
  return {
    rootX: a.rootX * inv + b.rootX * w,
    rootY: a.rootY * inv + b.rootY * w,
    rootRotate: a.rootRotate * inv + b.rootRotate * w,
    pelvisRotate: a.pelvisRotate * inv + b.pelvisRotate * w,
    torsoRotate: a.torsoRotate * inv + b.torsoRotate * w,
    torsoSquashY: a.torsoSquashY * inv + b.torsoSquashY * w,
    headRotate: a.headRotate * inv + b.headRotate * w,
    headOffsetX: a.headOffsetX * inv + b.headOffsetX * w,
    headOffsetY: a.headOffsetY * inv + b.headOffsetY * w,
    jawDropPx: a.jawDropPx * inv + b.jawDropPx * w,
    throatGulpScale: a.throatGulpScale * inv + b.throatGulpScale * w,
    shoulderL: a.shoulderL * inv + b.shoulderL * w,
    elbowL: a.elbowL * inv + b.elbowL * w,
    wristL: a.wristL * inv + b.wristL * w,
    shoulderR: a.shoulderR * inv + b.shoulderR * w,
    elbowR: a.elbowR * inv + b.elbowR * w,
    wristR: a.wristR * inv + b.wristR * w,
    hipL: a.hipL * inv + b.hipL * w,
    kneeL: a.kneeL * inv + b.kneeL * w,
    ankleL: a.ankleL * inv + b.ankleL * w,
    hipR: a.hipR * inv + b.hipR * w,
    kneeR: a.kneeR * inv + b.kneeR * w,
    ankleR: a.ankleR * inv + b.ankleR * w,
    hairSwing: a.hairSwing * inv + b.hairSwing * w,
    clothSway: a.clothSway * inv + b.clothSway * w,
    hatTasselSwing: a.hatTasselSwing * inv + b.hatTasselSwing * w,
    propOffsetX: a.propOffsetX * inv + b.propOffsetX * w,
    propOffsetY: a.propOffsetY * inv + b.propOffsetY * w,
    propRotate: a.propRotate * inv + b.propRotate * w,
    headDetachX: a.headDetachX * inv + b.headDetachX * w,
    headDetachY: a.headDetachY * inv + b.headDetachY * w,
    headDetachRotate: a.headDetachRotate * inv + b.headDetachRotate * w,
    tailWag: a.tailWag * inv + b.tailWag * w,
    earFlop: a.earFlop * inv + b.earFlop * w,
    wingFlapDeg: a.wingFlapDeg * inv + b.wingFlapDeg * w,
  };
}

/**
 * Evaluates automatic seeded blinking so characters blink naturally at varied intervals.
 */
export function evaluateAutoBlink(
  frame: number,
  seed: string | number,
  fps = 30
): { isBlinking: boolean; blinkAmount01: number } {
  const intervalFrames = Math.round(seededRange(`${seed}-blink-int`, fps * 2.4, fps * 4.5));
  const phaseOffset = Math.round(seededRange(`${seed}-blink-off`, 0, intervalFrames));
  const localFrame = ((frame + phaseOffset) % intervalFrames + intervalFrames) % intervalFrames;
  const blinkDuration = 5;
  if (localFrame < blinkDuration) {
    const blinkAmount01 = interpolate(
      localFrame,
      [0, 2, blinkDuration],
      [0, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    return { isBlinking: blinkAmount01 > 0.45, blinkAmount01 };
  }
  return { isBlinking: false, blinkAmount01: 0 };
}

/**
 * Evaluates subtle idle breathing and secondary follow-through for any character.
 */
export function evaluateIdleBreathing(
  frame: number,
  seed: string | number,
  speed = 1
): { breathY: number; chestScaleY: number; hairLag: number } {
  const phase = seededRange(`${seed}-breath-phase`, 0, Math.PI * 2);
  const t = frame * 0.08 * speed + phase;
  const s = Math.sin(t);
  const c = Math.cos(t - 0.45);
  return {
    breathY: s * 1.6,
    chestScaleY: 1 + s * 0.018,
    hairLag: c * 3.2,
  };
}

/**
 * Evaluates the full joint angles for any character pose/animation at a given frame,
 * using Remotion `interpolate()` and `spring()` with anticipation, overshoot,
 * follow-through, and secondary motion (hair, hoodie strings, coat hem, ears, tail, tassel).
 */
export function evaluatePoseJointAngles(
  pose: CharacterPoseId,
  frame: number,
  options: {
    fps?: number;
    startFrame?: number;
    speed?: number;
    seed?: string | number;
  } = {}
): JointAngles {
  const fps = options.fps ?? 30;
  const startFrame = options.startFrame ?? 0;
  const speed = options.speed ?? 1;
  const seed = options.seed ?? 'omniframe-rig';

  const relFrame = Math.max(0, (frame - startFrame) * speed);
  const phaseOffset = seededRange(`${seed}-pose-phase`, 0, Math.PI * 2);
  const breath = evaluateIdleBreathing(relFrame, seed, 1);

  const j: JointAngles = {
    ...DEFAULT_JOINT_ANGLES,
    rootY: breath.breathY,
    torsoSquashY: breath.chestScaleY,
    hairSwing: breath.hairLag,
    clothSway: breath.hairLag * 0.75,
    hatTasselSwing: breath.hairLag * 1.25,
  };

  // Triggered spring helper with anticipation dip + overshoot
  const trigSpring = spring({
    frame: relFrame,
    fps,
    config: { damping: 11, stiffness: 150, mass: 0.75 },
  });

  switch (pose) {
    case 'walk': {
      const cycle = relFrame * 0.22 + phaseOffset;
      const sin = Math.sin(cycle);
      const cos = Math.cos(cycle);
      const doubleCos = Math.abs(cos);
      j.rootY = -doubleCos * 5.5 + breath.breathY * 0.5;
      j.torsoRotate = sin * 4.5;
      j.pelvisRotate = -sin * 4;
      j.headRotate = -sin * 2.5;
      j.shoulderL = -sin * 34;
      j.elbowL = Math.max(8, -sin * 22 + 16);
      j.shoulderR = sin * 34;
      j.elbowR = -Math.max(8, sin * 22 + 16);
      j.hipL = sin * 32;
      j.kneeL = sin < 0 ? -sin * 38 : 6;
      j.ankleL = -sin * 14;
      j.hipR = -sin * 32;
      j.kneeR = sin > 0 ? sin * 38 : 6;
      j.ankleR = sin * 14;
      // Delayed secondary motion (follow-through)
      const lag = Math.sin(cycle - 0.55);
      j.hairSwing = lag * 11;
      j.clothSway = lag * 9;
      j.hatTasselSwing = lag * 15;
      break;
    }

    case 'hand-holding-walk': {
      const cycle = relFrame * 0.2 + phaseOffset;
      const sin = Math.sin(cycle);
      const doubleCos = Math.abs(Math.cos(cycle));
      j.rootY = -doubleCos * 4.5;
      j.torsoRotate = 4 + sin * 2.5;
      j.headRotate = 5 + Math.sin(cycle * 0.5) * 3;
      // Front/partner hand held out steady with gentle swing
      j.shoulderR = -42 + sin * 6;
      j.elbowR = -18 + sin * 4;
      j.wristR = 12;
      // Outer arm swings normally
      j.shoulderL = -sin * 26;
      j.elbowL = 14 + Math.max(0, -sin * 16);
      j.hipL = sin * 26;
      j.kneeL = sin < 0 ? -sin * 30 : 5;
      j.hipR = -sin * 26;
      j.kneeR = sin > 0 ? sin * 30 : 5;
      j.hairSwing = Math.sin(cycle - 0.5) * 8;
      j.clothSway = Math.sin(cycle - 0.5) * 7;
      break;
    }

    case 'hand-holding': {
      const sway = Math.sin(relFrame * 0.1 + phaseOffset);
      j.torsoRotate = 3 + sway * 2;
      j.headRotate = 6 + sway * 3;
      j.shoulderR = -46 + sway * 4;
      j.elbowR = -16;
      j.wristR = 14;
      j.shoulderL = 18 + sway * 3;
      j.elbowL = 12;
      j.hairSwing = sway * 5;
      break;
    }

    case 'sprint': {
      const cycle = relFrame * 0.46 + phaseOffset;
      const sin = Math.sin(cycle);
      const flight = Math.abs(Math.sin(cycle));
      j.rootY = -flight * 11 + 3;
      j.torsoRotate = 22 + sin * 6;
      j.headRotate = -14 + sin * 4;
      j.shoulderL = -sin * 68;
      j.elbowL = 62;
      j.shoulderR = sin * 68;
      j.elbowR = -62;
      j.hipL = sin * 58;
      j.kneeL = sin < 0 ? 68 : 14;
      j.ankleL = -24;
      j.hipR = -sin * 58;
      j.kneeR = sin > 0 ? 68 : 14;
      j.ankleR = 24;
      j.hairSwing = -26 + Math.sin(cycle - 0.6) * 18;
      j.clothSway = -22 + Math.sin(cycle - 0.6) * 16;
      j.hatTasselSwing = -32 + Math.sin(cycle - 0.6) * 20;
      break;
    }

    case 'point':
    case 'point-at-shop': {
      // Anticipation crouch in first 5 frames then spring-extend arm
      const antic = interpolate(relFrame, [0, 4, 9], [0, -1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      const bob = Math.sin(relFrame * 0.16);
      j.rootY = antic * 4 + bob * 1.5;
      j.torsoRotate = antic * -6 + trigSpring * 9;
      j.headRotate = trigSpring * 8 + bob * 2;
      j.shoulderR = antic * 25 + trigSpring * (-88 + bob * 3);
      j.elbowR = antic * -35 + trigSpring * -6;
      j.wristR = trigSpring * -8;
      j.shoulderL = 22;
      j.elbowL = 26;
      j.hairSwing = trigSpring * -8 + bob * 4;
      break;
    }

    case 'salute': {
      const antic = interpolate(relFrame, [0, 3, 7], [0, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      j.rootY = antic * 3 - trigSpring * 2;
      j.torsoSquashY = 1 - antic * 0.04 + trigSpring * 0.03;
      j.torsoRotate = -2;
      j.headRotate = -3;
      // Right hand crisp salute to brow
      j.shoulderR = -118 * trigSpring;
      j.elbowR = -112 * trigSpring;
      j.wristR = -15 * trigSpring;
      // Left arm attention at side
      j.shoulderL = 8;
      j.elbowL = 4;
      j.hipL = 2;
      j.hipR = -2;
      j.hairSwing = (1 - trigSpring) * 10;
      break;
    }

    case 'dance':
    case 'dancing': {
      const beat = relFrame * 0.28 + phaseOffset;
      const bounce = Math.abs(Math.sin(beat * 2));
      const side = Math.sin(beat);
      j.rootX = side * 9;
      j.rootY = -bounce * 9 + 2;
      j.torsoSquashY = 1 - bounce * 0.06 + (1 - bounce) * 0.04;
      j.torsoRotate = side * 14;
      j.pelvisRotate = -side * 18;
      j.headRotate = -side * 10;
      j.headOffsetX = side * 4;
      j.shoulderL = -65 + Math.sin(beat * 2) * 45;
      j.elbowL = 48 + Math.cos(beat * 2) * 32;
      j.shoulderR = -65 - Math.sin(beat * 2) * 45;
      j.elbowR = -48 - Math.cos(beat * 2) * 32;
      j.hipL = side * 24;
      j.kneeL = bounce * 28;
      j.hipR = -side * 24;
      j.kneeR = (1 - bounce) * 28;
      j.hairSwing = Math.sin(beat * 2 - 0.5) * 18;
      j.clothSway = Math.cos(beat - 0.4) * 16;
      j.hatTasselSwing = Math.sin(beat * 2 - 0.7) * 24;
      break;
    }

    case 'freeze': {
      // Dramatic mid-motion freeze pose with microscopic nervous tremor
      const tremor = Math.sin(relFrame * 1.9) * 0.8;
      j.rootY = -4;
      j.torsoRotate = -8 + tremor * 0.3;
      j.headRotate = 6 + tremor * 0.5;
      j.shoulderL = 48 + tremor;
      j.elbowL = 55;
      j.shoulderR = -58 - tremor;
      j.elbowR = -62;
      j.hipL = 18;
      j.kneeL = 24;
      j.hipR = -22;
      j.kneeR = 18;
      j.hairSwing = -6;
      break;
    }

    case 'mouth-drop': {
      // Shocked take: head snaps up in anticipation, then jaw slams all the way to the floor!
      const dropSpring = spring({
        frame: Math.max(0, relFrame - 4),
        fps,
        config: { damping: 8, stiffness: 180, mass: 0.9 },
      });
      const headAntic = interpolate(relFrame, [0, 4, 8], [0, -10, 4], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      j.rootY = headAntic * 0.8;
      j.headOffsetY = headAntic;
      j.headRotate = -8 * dropSpring;
      // Jaw drops 78px straight down toward the floor!
      j.jawDropPx = dropSpring * 78;
      j.shoulderL = 56 * dropSpring;
      j.elbowL = 85 * dropSpring;
      j.shoulderR = -56 * dropSpring;
      j.elbowR = -85 * dropSpring;
      j.hipL = 10;
      j.hipR = -10;
      j.hairSwing = -14 * dropSpring;
      break;
    }

    case 'shrug':
    case 'shrugging': {
      const cycle = Math.sin(relFrame * 0.16);
      const lift = Math.max(0, cycle) * 0.5 + trigSpring * 0.5;
      j.headOffsetY = lift * 5;
      j.headRotate = lift * 8;
      j.torsoSquashY = 1 - lift * 0.04;
      j.shoulderL = 52 * lift + 14;
      j.elbowL = 86 * lift + 12;
      j.wristL = 22 * lift;
      j.shoulderR = -52 * lift - 14;
      j.elbowR = -86 * lift - 12;
      j.wristR = -22 * lift;
      j.hairSwing = lift * 6;
      break;
    }

    case 'browse-shelves': {
      const scan = Math.sin(relFrame * 0.12 + phaseOffset);
      const reach = Math.max(0, Math.sin(relFrame * 0.08));
      j.torsoRotate = 8 + scan * 5;
      j.headRotate = scan * 12;
      j.headOffsetY = -scan * 3;
      // One hand resting on chin, other reaching toward display shelf
      j.shoulderL = 32;
      j.elbowL = 95;
      j.shoulderR = -45 - reach * 38;
      j.elbowR = -35 + reach * 22;
      j.hipL = 6;
      j.hipR = -6;
      j.hairSwing = scan * 6;
      break;
    }

    case 'walk-out-of-rubble': {
      const cycle = relFrame * 0.12 + phaseOffset;
      const sin = Math.sin(cycle);
      const limp = Math.max(0, sin);
      j.rootY = limp * 6 + 2;
      j.torsoRotate = 14 + sin * 7;
      j.headRotate = 12 + Math.cos(cycle) * 6;
      j.shoulderL = 26 + sin * 18;
      j.elbowL = 32;
      j.shoulderR = -20 + Math.cos(cycle) * 16;
      j.elbowR = -28;
      j.hipL = sin * 20;
      j.kneeL = 18 + limp * 20;
      j.hipR = -sin * 16;
      j.kneeR = 14;
      j.hairSwing = 10 + sin * 8;
      break;
    }

    case 'holding-christmas-doll': {
      const cradle = Math.sin(relFrame * 0.12 + phaseOffset);
      j.torsoRotate = cradle * 3;
      j.headRotate = 6 + cradle * 4;
      j.shoulderL = 34 + cradle * 4;
      j.elbowL = 68;
      j.shoulderR = -38 + cradle * 4;
      j.elbowR = -64;
      j.propOffsetX = 4;
      j.propOffsetY = cradle * 2.5;
      j.propRotate = cradle * 4;
      break;
    }

    case 'eating': {
      const chewCycle = relFrame * 0.24 + phaseOffset;
      const handToMouth = Math.max(0, Math.sin(chewCycle * 0.5));
      j.headRotate = -handToMouth * 6;
      j.jawDropPx = Math.abs(Math.sin(chewCycle * 2)) * 5;
      // Left hand holds snack bag, right hand brings snack to mouth
      j.shoulderL = 28;
      j.elbowL = 56;
      j.shoulderR = -26 - handToMouth * 72;
      j.elbowR = -48 - handToMouth * 58;
      j.wristR = -handToMouth * 18;
      break;
    }

    case 'tapping-phone': {
      const tap = Math.sin(relFrame * 0.65 + phaseOffset);
      j.headRotate = 14;
      j.torsoRotate = 6;
      // Left hand holds glowing smartphone, right hand taps rapidly
      j.shoulderL = -36;
      j.elbowL = -62;
      j.shoulderR = -28 + tap * 6;
      j.elbowR = -72 + tap * 12;
      j.wristR = tap * 16;
      break;
    }

    case 'throwing-snack': {
      const throwPhase = (relFrame % 45) / 45;
      const windup = interpolate(throwPhase, [0, 0.3, 0.5, 1], [0, -1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      j.torsoRotate = windup * 16;
      j.headRotate = windup * 8;
      j.shoulderR = -45 - windup * 65;
      j.elbowR = -40 + windup * 35;
      j.propOffsetX = Math.max(0, (throwPhase - 0.35) * 140);
      j.propOffsetY = -Math.sin(Math.max(0, throwPhase - 0.35) * Math.PI) * 55;
      j.propRotate = relFrame * 14;
      break;
    }

    case 'countdown-gestures': {
      const pulse = Math.abs(Math.sin(relFrame * 0.22));
      const sway = Math.sin(relFrame * 0.14);
      j.rootY = -pulse * 6;
      j.torsoRotate = sway * 8;
      j.headRotate = -sway * 6;
      // Both arms holding the giant cardboard countdown sign high overhead
      j.shoulderL = 135 + sway * 8;
      j.elbowL = 24;
      j.shoulderR = -135 + sway * 8;
      j.elbowR = -24;
      j.propOffsetY = -pulse * 8;
      j.propRotate = sway * 6;
      break;
    }

    case 'jumping': {
      const jumpCycle = (relFrame * 0.18 + phaseOffset) % (Math.PI * 2);
      const air = Math.max(0, Math.sin(jumpCycle));
      const crouch = Math.max(0, -Math.sin(jumpCycle));
      j.rootY = -air * 34 + crouch * 8;
      j.torsoSquashY = 1 + air * 0.08 - crouch * 0.09;
      j.shoulderL = 25 + air * 115;
      j.elbowL = 18;
      j.shoulderR = -25 - air * 115;
      j.elbowR = -18;
      j.hipL = air * 22 - crouch * 26;
      j.kneeL = crouch * 45 + air * 12;
      j.hipR = -air * 22 + crouch * 26;
      j.kneeR = crouch * 45 + air * 12;
      j.hairSwing = -air * 16 + crouch * 12;
      j.clothSway = -air * 14 + crouch * 10;
      break;
    }

    case 'cheering':
    case 'cheer': {
      const pump = Math.sin(relFrame * 0.34 + phaseOffset);
      j.rootY = -Math.abs(pump) * 7;
      j.torsoRotate = pump * 6;
      j.headRotate = -6 + pump * 5;
      j.shoulderL = 138 + pump * 22;
      j.elbowL = 28 - pump * 16;
      j.shoulderR = -138 - pump * 22;
      j.elbowR = -28 + pump * 16;
      j.hipL = 12;
      j.hipR = -12;
      j.hairSwing = pump * 14;
      break;
    }

    case 'high-five': {
      const slap = spring({
        frame: relFrame % 40,
        fps,
        config: { damping: 9, stiffness: 190, mass: 0.65 },
      });
      j.rootY = -slap * 6;
      j.torsoRotate = slap * 12;
      j.headRotate = slap * 6;
      j.shoulderR = -128 * slap - 20;
      j.elbowR = -18 * (1 - slap);
      j.wristR = slap * 18;
      j.shoulderL = 28;
      j.elbowL = 34;
      break;
    }

    case 'shocked-reaction': {
      const recoil = spring({
        frame: relFrame,
        fps,
        config: { damping: 8, stiffness: 180, mass: 0.7 },
      });
      const shake = Math.sin(relFrame * 1.4) * 2.5;
      j.rootY = -recoil * 9;
      j.torsoRotate = -recoil * 14 + shake * 0.4;
      j.headRotate = -recoil * 12 + shake;
      j.jawDropPx = recoil * 22;
      j.shoulderL = 78 * recoil + shake;
      j.elbowL = 92 * recoil;
      j.shoulderR = -78 * recoil - shake;
      j.elbowR = -92 * recoil;
      j.hipL = 16 * recoil;
      j.kneeL = 18 * recoil;
      j.hipR = -16 * recoil;
      j.kneeR = 18 * recoil;
      j.hairSwing = -recoil * 18;
      break;
    }

    case 'wince': {
      const cringe = Math.sin(relFrame * 0.25) * 0.15 + 0.85 * trigSpring;
      j.rootY = cringe * 6;
      j.torsoSquashY = 1 - cringe * 0.07;
      j.torsoRotate = -cringe * 12;
      j.headOffsetY = cringe * 7;
      j.headRotate = -cringe * 16;
      j.shoulderL = 62 * cringe;
      j.elbowL = 96 * cringe;
      j.shoulderR = -58 * cringe;
      j.elbowR = -94 * cringe;
      j.hipL = 12 * cringe;
      j.kneeL = 22 * cringe;
      j.hipR = -10 * cringe;
      j.kneeR = 20 * cringe;
      break;
    }

    case 'cross-legs': {
      const fidget = Math.sin(relFrame * 0.26 + phaseOffset);
      j.rootY = Math.abs(fidget) * 3;
      j.torsoRotate = fidget * 4;
      j.shoulderL = 24;
      j.elbowL = 64;
      j.shoulderR = -24;
      j.elbowR = -64;
      // Legs tightly crossed & knees knocking
      j.hipL = -18 + fidget * 5;
      j.kneeL = 22;
      j.hipR = 18 - fidget * 5;
      j.kneeR = 24;
      break;
    }

    case 'hurry-away': {
      const cycle = relFrame * 0.38 + phaseOffset;
      const sin = Math.sin(cycle);
      j.rootY = -Math.abs(Math.cos(cycle)) * 7;
      j.torsoRotate = 18 + sin * 5;
      j.headRotate = -18 + Math.sin(cycle * 0.5) * 12; // Looking back nervously while hurrying
      j.shoulderL = -sin * 52;
      j.elbowL = 54;
      j.shoulderR = sin * 52;
      j.elbowR = -54;
      j.hipL = sin * 46;
      j.kneeL = sin < 0 ? 52 : 10;
      j.hipR = -sin * 46;
      j.kneeR = sin > 0 ? 52 : 10;
      j.hairSwing = -18 + sin * 10;
      j.clothSway = -16 + sin * 12;
      break;
    }

    // Nutcracker Doll Animations
    case 'head-rotation': {
      const turn = Math.sin(relFrame * 0.14 + phaseOffset);
      j.headRotate = turn * 28;
      j.headOffsetX = turn * 7;
      j.hatTasselSwing = Math.sin(relFrame * 0.14 + phaseOffset - 0.5) * 18;
      j.jawDropPx = Math.max(0, Math.sin(relFrame * 0.28)) * 8;
      break;
    }

    case 'eye-movement': {
      j.headRotate = Math.sin(relFrame * 0.08) * 4;
      j.hatTasselSwing = Math.sin(relFrame * 0.12) * 5;
      break;
    }

    case 'gulp': {
      const gulpCycle = (relFrame % 45) / 45;
      const swallow = interpolate(gulpCycle, [0, 0.25, 0.5, 0.75, 1], [0, 1, 0.3, 0, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      j.headOffsetY = -swallow * 5;
      j.headRotate = -swallow * 6;
      j.throatGulpScale = swallow;
      j.jawDropPx = swallow * 6;
      j.shoulderL = 12 + swallow * 8;
      j.shoulderR = -12 - swallow * 8;
      break;
    }

    case 'trembling': {
      const trembleX = Math.sin(relFrame * 2.3) * 3.5;
      const trembleRot = Math.cos(relFrame * 2.7) * 3.2;
      j.rootX = trembleX;
      j.torsoRotate = trembleRot;
      j.headRotate = -trembleRot * 1.4;
      j.jawDropPx = Math.abs(Math.sin(relFrame * 1.9)) * 7;
      j.hatTasselSwing = trembleX * 4.5;
      j.shoulderL = 18 + trembleRot * 2;
      j.shoulderR = -18 - trembleRot * 2;
      break;
    }

    case 'detachable-head': {
      // Nutcracker head pops off with a high-energy Remotion spring arc!
      const loopFrame = relFrame % 75;
      const popSpring = spring({
        frame: Math.max(0, loopFrame - 6),
        fps,
        config: { damping: 9, stiffness: 140, mass: 0.8 },
      });
      const gravityDrop = Math.max(0, (loopFrame - 24) / 35);
      j.jawDropPx = popSpring * 18;
      j.headDetachX = popSpring * 44;
      j.headDetachY = -popSpring * 68 + gravityDrop * gravityDrop * 95;
      j.headDetachRotate = popSpring * 145;
      j.torsoRotate = -popSpring * 6;
      j.hatTasselSwing = popSpring * 38;
      break;
    }

    // Male Dog Animations
    case 'tail-tuck': {
      const shiver = Math.sin(relFrame * 1.8) * 1.8;
      j.rootX = shiver;
      j.rootY = 5 * trigSpring;
      j.torsoRotate = -8 * trigSpring;
      j.headRotate = -12 * trigSpring + shiver;
      j.tailWag = -125 * trigSpring; // Tucked tightly under belly
      j.earFlop = 28 * trigSpring;
      break;
    }

    case 'startled-expression': {
      const jump = spring({
        frame: relFrame % 50,
        fps,
        config: { damping: 8, stiffness: 210, mass: 0.6 },
      });
      j.rootY = -jump * 24;
      j.torsoRotate = -jump * 14;
      j.headRotate = jump * 16;
      j.jawDropPx = jump * 14;
      j.earFlop = -jump * 42; // Ears shoot straight up!
      j.tailWag = jump * 55;
      j.hipL = jump * 28;
      j.hipR = -jump * 28;
      break;
    }

    case 'bolt-away-run': {
      const cycle = relFrame * 0.52 + phaseOffset;
      const sin = Math.sin(cycle);
      const cos = Math.cos(cycle);
      j.rootY = -Math.abs(cos) * 12;
      j.torsoRotate = sin * 14;
      j.headRotate = -sin * 8;
      j.hipL = sin * 56;
      j.kneeL = cos * 34;
      j.hipR = -sin * 56;
      j.kneeR = -cos * 34;
      j.earFlop = -36 + sin * 18;
      j.tailWag = -45 + cos * 25;
      break;
    }

    // Pigeon Animations
    case 'perch': {
      const coo = Math.sin(relFrame * 0.18 + phaseOffset);
      j.rootY = coo * 1.2;
      j.headOffsetX = Math.max(0, Math.sin(relFrame * 0.25)) * 4;
      j.headRotate = coo * 6;
      j.wingFlapDeg = 0;
      break;
    }

    case 'head-turn': {
      // Snappy avian head-jerk look
      const step = Math.floor((relFrame + phaseOffset * 10) / 14);
      const targetAngle = ((step * 17) % 3 - 1) * 26;
      j.headRotate = targetAngle;
      j.headOffsetX = targetAngle * 0.22;
      break;
    }

    case 'wing-flap': {
      const flap = Math.sin(relFrame * 0.72 + phaseOffset);
      j.rootY = -Math.abs(flap) * 6;
      j.headRotate = flap * 5;
      j.wingFlapDeg = flap * 68;
      break;
    }

    case 'takeoff': {
      const loopF = relFrame % 65;
      const launch = interpolate(loopF, [0, 8, 55], [0, -5, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      const flap = Math.sin(loopF * 0.95);
      j.rootX = Math.max(0, launch) * 64;
      j.rootY = launch < 0 ? -launch * 1.5 : -launch * 78;
      j.torsoRotate = launch > 0 ? -24 : 12;
      j.wingFlapDeg = flap * 78;
      break;
    }

    case 'idle':
    default: {
      const sway = Math.sin(relFrame * 0.09 + phaseOffset);
      j.torsoRotate = sway * 1.8;
      j.headRotate = sway * 2.4;
      j.tailWag = Math.sin(relFrame * 0.28 + phaseOffset) * 24;
      break;
    }
  }

  return j;
}

/**
 * Evaluates the shared Face System state from an expression ID, pose ID, frame, and seed.
 */
export function evaluateExpressionFaceState(
  expression: CharacterExpressionId = 'happy',
  pose: CharacterPoseId = 'idle',
  frame = 0,
  seed: string | number = 'face-seed',
  fps = 30
): FaceStateEvaluation {
  const autoBlink = evaluateAutoBlink(frame, seed, fps);
  const lookPhase = frame * 0.06 + seededRange(`${seed}-look`, 0, Math.PI * 2);

  const state: FaceStateEvaluation = {
    eyeState: 'open',
    browState: 'neutral',
    mouthShape: 'smile',
    pupilOffsetX: Math.sin(lookPhase) * 1.8,
    pupilOffsetY: Math.cos(lookPhase * 0.7) * 0.9,
    pupilScale: 1,
    isBlinking: autoBlink.isBlinking,
    blinkAmount01: autoBlink.blinkAmount01,
    jawDropExtraPx: 0,
    throatGulp01: 0,
    sweatDrops: false,
    blush: false,
    sootCovered: false,
  };

  switch (expression) {
    case 'happy':
      state.eyeState = 'open';
      state.browState = 'raised';
      state.mouthShape = 'smile';
      state.blush = true;
      break;

    case 'nervous':
      state.eyeState = 'wide';
      state.browState = 'worried';
      state.mouthShape = 'gritted-teeth';
      state.pupilScale = 0.82;
      state.pupilOffsetX = Math.sin(frame * 0.45) * 3.2;
      state.sweatDrops = true;
      break;

    case 'terrified':
      state.eyeState = 'wide';
      state.browState = 'shocked-high';
      state.mouthShape = 'jaw-drop';
      state.pupilScale = 0.58;
      state.pupilOffsetX = Math.sin(frame * 0.9) * 2.2;
      state.pupilOffsetY = Math.cos(frame * 1.1) * 2.2;
      state.jawDropExtraPx = 18;
      state.sweatDrops = true;
      break;

    case 'determined':
      state.eyeState = 'squint';
      state.browState = 'furrowed';
      state.mouthShape = 'gritted-teeth';
      state.pupilOffsetX = 2.2;
      break;

    case 'shocked':
      state.eyeState = 'wide';
      state.browState = 'shocked-high';
      state.mouthShape = 'o-mouth';
      state.pupilScale = 0.65;
      state.sweatDrops = true;
      break;

    case 'guilty':
      state.eyeState = 'squint';
      state.browState = 'worried';
      state.mouthShape = 'gulp';
      state.pupilOffsetX = -3.8;
      state.pupilOffsetY = 1.6;
      state.sweatDrops = true;
      state.blush = true;
      break;

    case 'confused':
      state.eyeState = 'open';
      state.browState = 'asymmetric';
      state.mouthShape = 'frown';
      state.pupilOffsetX = 2.6;
      state.pupilOffsetY = -1.5;
      break;

    case 'neutral':
      state.eyeState = 'open';
      state.browState = 'neutral';
      state.mouthShape = 'flat-line';
      break;

    case 'soot-covered':
      state.eyeState = 'wide';
      state.browState = 'worried';
      state.mouthShape = 'o-mouth';
      state.sootCovered = true;
      state.pupilScale = 0.85;
      break;

    case 'unbothered':
      state.eyeState = 'half-lid';
      state.browState = 'neutral';
      state.mouthShape = 'flat-line';
      state.pupilOffsetY = 1.2;
      break;

    case 'deadpan':
      state.eyeState = 'squint';
      state.browState = 'neutral';
      state.mouthShape = 'flat-line';
      state.pupilOffsetX = 0;
      state.pupilOffsetY = 0;
      break;

    case 'wince':
      state.eyeState = 'squint';
      state.browState = 'furrowed';
      state.mouthShape = 'gritted-teeth';
      state.sweatDrops = true;
      break;

    case 'startled':
      state.eyeState = 'wide';
      state.browState = 'shocked-high';
      state.mouthShape = 'jaw-drop';
      state.pupilScale = 0.6;
      state.jawDropExtraPx = 14;
      break;

    case 'excited':
      state.eyeState = 'wide';
      state.browState = 'raised';
      state.mouthShape = 'smile';
      state.blush = true;
      break;

    case 'stoic':
    default:
      state.eyeState = 'open';
      state.browState = 'furrowed';
      state.mouthShape = 'flat-line';
      break;
  }

  // Pose-specific overrides so animations like `mouth-drop`, `gulp`, `eye-movement` drive the face automatically
  if (pose === 'mouth-drop') {
    state.eyeState = 'wide';
    state.browState = 'shocked-high';
    state.mouthShape = 'jaw-drop';
    state.pupilScale = 0.52;
    state.jawDropExtraPx = 56;
    state.sweatDrops = true;
  } else if (pose === 'gulp') {
    state.eyeState = 'wide';
    state.browState = 'worried';
    state.mouthShape = 'gulp';
    state.throatGulp01 = Math.max(0, Math.sin((frame % 45) * 0.14));
    state.sweatDrops = true;
  } else if (pose === 'eye-movement') {
    state.pupilOffsetX = Math.sin(frame * 0.25) * 5.2;
    state.pupilOffsetY = Math.cos(frame * 0.18) * 2.4;
  } else if (pose === 'wince') {
    state.eyeState = 'squint';
    state.browState = 'furrowed';
    state.mouthShape = 'gritted-teeth';
  } else if (pose === 'shocked-reaction' || pose === 'startled-expression') {
    state.eyeState = 'wide';
    state.browState = 'shocked-high';
    state.mouthShape = 'jaw-drop';
    state.jawDropExtraPx = 18;
  }

  return state;
}

export interface CrowdMemberSeededSpec {
  index: number;
  seed: string;
  archetype: PedestrianArchetypeVariant;
  skinTone: SkinToneId;
  topColor: (typeof CROWD_COLOR_SWATCHES)[number];
  bottomColor: (typeof CROWD_COLOR_SWATCHES)[number];
  hairColor: (typeof CROWD_HAIR_SWATCHES)[number];
  heightScale: number;
  walkSpeed: number;
  phaseOffsetFrames: number;
  facing: CharacterFacing;
  pose: PedestrianAnimation;
  xPercent: number;
  yOffsetPx: number;
}

/**
 * Deterministically generates N unique background crowd specifications using Remotion's `random(seed)`.
 */
export function generateSeededCrowdSpecs(
  count: number,
  masterSeed: string | number = 'omniframe-crowd',
  defaultPose: PedestrianAnimation = 'walk'
): CrowdMemberSeededSpec[] {
  const archetypes: PedestrianArchetypeVariant[] = [
    'business-commuter',
    'jogger-hoodie',
    'elder-coat',
  ];
  const skinKeys = Object.keys(SKIN_TONE_PALETTES) as SkinToneId[];
  const specs: CrowdMemberSeededSpec[] = [];

  for (let i = 0; i < count; i++) {
    const memberSeed = `${masterSeed}-member-${i}`;
    const archetype = seededPick(`${memberSeed}-arch`, archetypes);
    const skinTone = seededPick(`${memberSeed}-skin`, skinKeys);
    const topColor = seededPick(`${memberSeed}-top`, CROWD_COLOR_SWATCHES);
    const bottomColor = seededPick(`${memberSeed}-bot`, CROWD_COLOR_SWATCHES);
    const hairColor = seededPick(`${memberSeed}-hair`, CROWD_HAIR_SWATCHES);
    const heightScale = Number(seededRange(`${memberSeed}-scale`, 0.84, 1.14).toFixed(3));
    const walkSpeed = Number(seededRange(`${memberSeed}-speed`, 0.72, 1.38).toFixed(3));
    const phaseOffsetFrames = Math.round(seededRange(`${memberSeed}-phase`, 0, 120));
    const facing: CharacterFacing =
      seededRandom(`${memberSeed}-facing`) > 0.45 ? 'right' : 'left';
    const xPercent = Number(
      ((i + 0.5) / Math.max(1, count) * 86 + 7 + seededRange(`${memberSeed}-jx`, -3, 3)).toFixed(2)
    );
    const yOffsetPx = Math.round(seededRange(`${memberSeed}-jy`, -12, 12));

    specs.push({
      index: i,
      seed: memberSeed,
      archetype,
      skinTone,
      topColor,
      bottomColor,
      hairColor,
      heightScale,
      walkSpeed,
      phaseOffsetFrames,
      facing,
      pose: defaultPose,
      xPercent,
      yOffsetPx,
    });
  }

  return specs;
}

export interface CharacterRequirementChecklistItem {
  characterId: CharacterId;
  characterName: string;
  phase: number;
  outfitsAndProps: string[];
  expressions: string[];
  animations: string[];
  implemented: boolean;
}

export const CHARACTER_CAST_MANIFEST: readonly CharacterRequirementChecklistItem[] = [
  {
    characterId: 'main-boy',
    characterName: '1. Main Boy (Hero, Full Detail)',
    phase: 2,
    outfitsAndProps: ['Casual varsity jacket & jeans', 'Sneakers', 'Layered spiky hairstyle', 'Sunglasses accessory toggle (next-day scene)'],
    expressions: ['happy', 'nervous', 'terrified', 'determined', 'shocked', 'guilty'],
    animations: ['walk', 'hand-holding-walk', 'sprint', 'point', 'salute', 'dance', 'freeze', 'mouth-drop'],
    implemented: true,
  },
  {
    characterId: 'main-girl',
    characterName: '2. Main Girl (Hero, Full Detail)',
    phase: 2,
    outfitsAndProps: ['Casual coral jacket & pleated skirt', 'Boots', 'Expressive hairstyle with bangs', 'Christmas Nutcracker doll prop', 'Soot & messy hair overlay'],
    expressions: ['happy', 'confused', 'neutral', 'soot-covered'],
    animations: ['walk', 'point-at-shop', 'shrug', 'browse-shelves', 'walk-out-of-rubble', 'hand-holding', 'holding-christmas-doll'],
    implemented: true,
  },
  {
    characterId: 'hacker-friend',
    characterName: '3. Hacker Friend',
    phase: 3,
    outfitsAndProps: ['Distinctive oversized cyber-hoodie silhouette', 'Crunchy-Boi snack bag prop', 'OLED smartphone prop'],
    expressions: ['unbothered', 'confused', 'deadpan'],
    animations: ['eating', 'tapping-phone', 'shrugging', 'throwing-snack'],
    implemented: true,
  },
  {
    characterId: 'hype-man',
    characterName: '4. Hype Man',
    phase: 3,
    outfitsAndProps: ['Gold tracksuit & backwards visor cap', 'Cardboard countdown sign (swappable 10 to 1 and "BOOM!")'],
    expressions: ['excited', 'happy', 'shocked'],
    animations: ['countdown-gestures', 'jumping', 'cheering', 'dancing'],
    implemented: true,
  },
  {
    characterId: 'squad-member-a',
    characterName: '5. Squad Member A (Reusable)',
    phase: 3,
    outfitsAndProps: ['Tactical olive field vest & cargo pants', 'Beret cap'],
    expressions: ['happy', 'determined', 'excited'],
    animations: ['salute', 'point', 'cheer', 'high-five', 'dance'],
    implemented: true,
  },
  {
    characterId: 'squad-member-b',
    characterName: '6. Squad Member B (Reusable, Visibly Distinct)',
    phase: 3,
    outfitsAndProps: ['Purple puffer jacket & track pants', 'Pom-pom beanie & high-top kicks'],
    expressions: ['happy', 'shocked', 'excited'],
    animations: ['salute', 'cheer', 'dance', 'shocked-reaction'],
    implemented: true,
  },
  {
    characterId: 'pedestrian',
    characterName: '7. Pedestrian Archetypes (3 Male Base Designs + <Crowd />)',
    phase: 4,
    outfitsAndProps: ['Archetype 1: Business Commuter (tie & briefcase)', 'Archetype 2: Jogger Hoodie (headband & shorts)', 'Archetype 3: Elder Coat (trenchcoat & fedora)', 'Recolorable & scalable via <Crowd />'],
    expressions: ['neutral', 'wince', 'terrified', 'shocked'],
    animations: ['walk', 'wince', 'cross-legs', 'hurry-away'],
    implemented: true,
  },
  {
    characterId: 'nutcracker-doll',
    characterName: '8. Nutcracker Doll (Hero + Shop-Window Variant)',
    phase: 5,
    outfitsAndProps: ['Ornate scarlet royal uniform with gold trim & epaulets', 'Tall Hussar shako hat with plume', 'White curled beard & mustache', 'Separate articulated head, jaw, hat, body', 'Simplified shop-window variant (3-6 copies)'],
    expressions: ['stoic', 'shocked', 'terrified'],
    animations: ['head-rotation', 'eye-movement', 'gulp', 'trembling', 'detachable-head'],
    implemented: true,
  },
  {
    characterId: 'male-dog',
    characterName: '9. Male Dog',
    phase: 6,
    outfitsAndProps: ['Tawny cartoon terrier-hound body', 'Red collar & gold tag', 'Articulated floppy ears, jaw, legs & tail'],
    expressions: ['happy', 'startled', 'terrified'],
    animations: ['idle', 'tail-tuck', 'startled-expression', 'bolt-away-run'],
    implemented: true,
  },
  {
    characterId: 'pigeon',
    characterName: '10. Pigeon',
    phase: 6,
    outfitsAndProps: ['Urban slate-blue pigeon body', 'Iridescent teal-purple neck feathers', 'Articulated wings, head, beak & orange feet'],
    expressions: ['neutral', 'startled'],
    animations: ['perch', 'head-turn', 'wing-flap', 'takeoff'],
    implemented: true,
  },
] as const;
