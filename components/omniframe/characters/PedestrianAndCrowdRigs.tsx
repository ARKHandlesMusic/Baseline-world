'use client';

import React, { memo, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import {
  CROWD_COLOR_SWATCHES,
  CROWD_HAIR_SWATCHES,
  SHARED_INK_OUTLINE,
  SKIN_TONE_PALETTES,
  type CelColorTriplet,
  type SkinToneId,
} from '../../../lib/omniframe/characters/palette';
import {
  evaluateExpressionFaceState,
  evaluatePoseJointAngles,
  generateSeededCrowdSpecs,
  pivotTransform,
  seededPick,
  type CharacterRigProps,
  type PedestrianAnimation,
  type PedestrianArchetypeVariant,
} from '../../../lib/omniframe/characters/rig-utils';
import { FaceSystem, SharedCharacterSvgDefs } from './FaceSystem';

export interface PedestrianRigProps extends CharacterRigProps {
  archetype?: PedestrianArchetypeVariant;
  topColorOverride?: CelColorTriplet;
  bottomColorOverride?: CelColorTriplet;
  hairColorOverride?: CelColorTriplet;
  skinToneOverride?: SkinToneId;
}

/**
 * 7. PEDESTRIAN ARCHETYPES (3 Male Base Designs)
 * - Archetype 1: 'business-commuter' (collared suit jacket, necktie, briefcase, parted hair)
 * - Archetype 2: 'jogger-hoodie' (athletic zip track top, sweatband, runner shorts, spiky hair)
 * - Archetype 3: 'elder-coat' (long belted trenchcoat, fedora hat, mustache, spectacles)
 * - Animations: walk, wince, cross-legs, hurry-away.
 * - Recolorable outfits, scalable, variable walking speed.
 */
export const PedestrianRig = memo(function PedestrianRig({
  pose = 'walk',
  expression = 'neutral',
  facing = 'right',
  scale = 1,
  seed = 'pedestrian-1',
  startFrame = 0,
  speed = 1,
  frameOverride,
  fpsOverride,
  archetype,
  pedestrianArchetype,
  topColorOverride,
  bottomColorOverride,
  hairColorOverride,
  skinToneOverride,
  x = 0,
  y = 0,
  className,
}: PedestrianRigProps) {
  const remotionFrame = useCurrentFrame();
  const remotionConfig = useVideoConfig();
  const frame = frameOverride ?? remotionFrame;
  const fps = fpsOverride ?? remotionConfig.fps ?? 30;

  const activeArchetype: PedestrianArchetypeVariant =
    archetype ??
    pedestrianArchetype ??
    seededPick(`${seed}-arch`, ['business-commuter', 'jogger-hoodie', 'elder-coat'] as const);

  const skinKey =
    skinToneOverride ??
    seededPick(`${seed}-skin`, Object.keys(SKIN_TONE_PALETTES) as SkinToneId[]);
  const skin = SKIN_TONE_PALETTES[skinKey];
  const topColor = topColorOverride ?? seededPick(`${seed}-top`, CROWD_COLOR_SWATCHES);
  const bottomColor = bottomColorOverride ?? seededPick(`${seed}-bot`, CROWD_COLOR_SWATCHES);
  const hairColor = hairColorOverride ?? seededPick(`${seed}-hair`, CROWD_HAIR_SWATCHES);

  const joints = evaluatePoseJointAngles(pose, frame, { fps, startFrame, speed, seed });
  const faceState = evaluateExpressionFaceState(expression, pose, frame - startFrame, seed, fps);
  const flipX = facing === 'left' ? -1 : 1;

  return (
    <svg
      viewBox="0 0 200 280"
      width={200 * scale}
      height={280 * scale}
      className={className}
      style={{ overflow: 'visible', transform: `translate(${x}px, ${y}px)` }}
      data-character="pedestrian"
      data-archetype={activeArchetype}
      data-pose={pose}
    >
      <SharedCharacterSvgDefs />
      <ellipse cx={100 + joints.rootX} cy={262} rx={32} ry={6.5} fill="#090D16" opacity={0.26} />

      <g
        transform={`translate(100, 140) scale(${flipX}, 1) translate(-100, -140) translate(${joints.rootX.toFixed(
          2
        )}, ${joints.rootY.toFixed(2)})`}
      >
        {/* Back Arm (Left) */}
        <g data-part="upper-arm-l" transform={pivotTransform(76, 122, joints.shoulderL)}>
          <rect x={69} y={118} width={14} height={34} rx={7} fill={topColor.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3.1} />
          <g data-part="lower-arm-l" transform={pivotTransform(76, 150, joints.elbowL)}>
            <rect x={70} y={146} width={13} height={30} rx={6} fill={topColor.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.1} />
            <g data-part="hand-l" transform={pivotTransform(76, 178, joints.wristL)}>
              <circle cx={76} cy={181} r={7} fill={skin.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        {/* Back Leg (Left) */}
        <g data-part="upper-leg-l" transform={pivotTransform(88, 182, joints.hipL)}>
          <rect x={81} y={178} width={15} height={38} rx={7} fill={bottomColor.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3.1} />
          <g data-part="lower-leg-l" transform={pivotTransform(88, 214, joints.kneeL)}>
            <rect
              x={82}
              y={210}
              width={13}
              height={36}
              rx={6}
              fill={activeArchetype === 'jogger-hoodie' ? skin.shadow : bottomColor.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.1}
            />
            <g data-part="foot-l" transform={pivotTransform(88, 248, joints.ankleL)}>
              <rect x={79} y={245} width={26} height={11} rx={5} fill="#1E293B" stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        {/* Front Leg (Right) */}
        <g data-part="upper-leg-r" transform={pivotTransform(110, 182, joints.hipR)}>
          <rect x={103} y={178} width={15} height={38} rx={7} fill={bottomColor.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.1} />
          <g data-part="lower-leg-r" transform={pivotTransform(110, 214, joints.kneeR)}>
            <rect
              x={104}
              y={210}
              width={13}
              height={36}
              rx={6}
              fill={activeArchetype === 'jogger-hoodie' ? skin.base : bottomColor.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.1}
            />
            <g data-part="foot-r" transform={pivotTransform(110, 248, joints.ankleR)}>
              <rect x={101} y={245} width={27} height={11} rx={5} fill="#334155" stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        {/* Torso by Archetype */}
        <g data-part="torso" transform={pivotTransform(100, 178, joints.torsoRotate, 0, 0, 1, joints.torsoSquashY)}>
          {activeArchetype === 'elder-coat' ? (
            <path
              d="M 73 114 L 127 114 L 132 204 L 68 204 Z"
              fill={topColor.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.4}
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M 74 114 Q 100 108 126 114 L 122 182 L 78 182 Z"
              fill={topColor.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.4}
              strokeLinejoin="round"
            />
          )}

          {/* Business commuter shirt & red tie */}
          {activeArchetype === 'business-commuter' && (
            <g>
              <polygon points="91,114 109,114 100,136" fill="#F8FAFC" stroke={SHARED_INK_OUTLINE} strokeWidth={2.4} />
              <polygon points="98,122 102,122 104,162 100,168 96,162" fill="#EF4444" stroke={SHARED_INK_OUTLINE} strokeWidth={2.2} />
            </g>
          )}

          {/* Jogger racing stripe */}
          {activeArchetype === 'jogger-hoodie' && (
            <rect x={78} y={136} width={44} height={10} fill="#FACC15" stroke={SHARED_INK_OUTLINE} strokeWidth={2.2} />
          )}

          {/* Elder coat belt & lapels */}
          {activeArchetype === 'elder-coat' && (
            <g>
              <rect x={71} y={160} width={58} height={9} fill={topColor.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.4} />
              <rect x={95} y={158} width={10} height={13} fill="#FACC15" stroke={SHARED_INK_OUTLINE} strokeWidth={2.2} />
            </g>
          )}

          {/* Head */}
          <g data-part="head" transform={pivotTransform(100, 108, joints.headRotate, joints.headOffsetX, joints.headOffsetY)}>
            <rect x={93} y={98} width={14} height={16} rx={5} fill={skin.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3} />
            <rect x={70} y={46} width={60} height={58} rx={25} fill={skin.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.4} />
            <FaceSystem faceState={faceState} skin={skin} headCenterX={100} headCenterY={76} jawDropOverridePx={joints.jawDropPx} />

            {/* Archetype Hair / Hat */}
            <g data-part="hair" transform={pivotTransform(100, 46, joints.hairSwing)}>
              {activeArchetype === 'business-commuter' && (
                <path
                  d="M 68 62 Q 70 36 104 38 Q 132 38 131 62 Q 112 48 88 54 Z"
                  fill={hairColor.base}
                  stroke={SHARED_INK_OUTLINE}
                  strokeWidth={3.2}
                />
              )}
              {activeArchetype === 'jogger-hoodie' && (
                <g>
                  <path
                    d="M 68 58 L 78 32 L 94 42 L 106 28 L 118 42 L 130 34 L 132 58 Z"
                    fill={hairColor.base}
                    stroke={SHARED_INK_OUTLINE}
                    strokeWidth={3.1}
                  />
                  {/* Sweatband */}
                  <rect x={68} y={52} width={64} height={8} rx={3} fill="#EF4444" stroke={SHARED_INK_OUTLINE} strokeWidth={2.6} />
                </g>
              )}
              {activeArchetype === 'elder-coat' && (
                <g>
                  {/* Fedora hat */}
                  <ellipse cx={100} cy={48} rx={42} ry={7} fill={bottomColor.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3} />
                  <path d="M 74 48 Q 80 24 100 26 Q 120 24 126 48 Z" fill={bottomColor.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3} />
                  {/* Elder mustache */}
                  <path d="M 88 86 Q 100 80 112 86 Q 106 92 100 88 Q 94 92 88 86 Z" fill="#E2E8F0" stroke={SHARED_INK_OUTLINE} strokeWidth={2.2} />
                </g>
              )}
            </g>
          </g>
        </g>

        {/* Front Arm (Right) */}
        <g data-part="upper-arm-r" transform={pivotTransform(124, 122, joints.shoulderR)}>
          <rect x={117} y={118} width={14} height={34} rx={7} fill={topColor.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.1} />
          <g data-part="lower-arm-r" transform={pivotTransform(124, 150, joints.elbowR)}>
            <rect x={118} y={146} width={13} height={30} rx={6} fill={topColor.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.1} />
            <g data-part="hand-r" transform={pivotTransform(124, 178, joints.wristR)}>
              <circle cx={124} cy={181} r={7} fill={skin.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
              {/* Briefcase for business commuter */}
              {activeArchetype === 'business-commuter' && (
                <rect x={112} y={185} width={24} height={18} rx={3} fill="#78350F" stroke={SHARED_INK_OUTLINE} strokeWidth={2.6} />
              )}
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
});

export interface CrowdProps {
  count?: number;
  seed?: string | number;
  pose?: PedestrianAnimation;
  baseScale?: number;
  traverseViewport?: boolean;
  className?: string;
}

/**
 * <Crowd /> Reusability Helper
 * Spawns N background characters from the Pedestrian rigs with deterministic Remotion
 * `random(seed)` variation in clothes, hair, skin tone, height, walking speed, and phase offset,
 * so no two look identical.
 */
export const Crowd = memo(function Crowd({
  count = 8,
  seed = 'omniframe-city-crowd',
  pose = 'walk',
  baseScale = 0.58,
  traverseViewport = true,
  className = '',
}: CrowdProps) {
  const frame = useCurrentFrame();
  const specs = useMemo(
    () => generateSeededCrowdSpecs(count, seed, pose),
    [count, seed, pose]
  );

  return (
    <div
      className={`relative w-full h-full pointer-events-none select-none ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
      data-component="crowd-helper"
      data-crowd-count={count}
    >
      {specs.map((member) => {
        const directionSign = member.facing === 'right' ? 1 : -1;
        const travelPercent = traverseViewport
          ? ((member.xPercent +
              directionSign *
                ((frame + member.phaseOffsetFrames) * 0.14 * member.walkSpeed)) %
              108 +
              108) %
              108 -
            4
          : member.xPercent;

        return (
          <div
            key={member.seed}
            style={{
              position: 'absolute',
              left: `${travelPercent.toFixed(2)}%`,
              bottom: `${(14 + member.yOffsetPx).toFixed(0)}px`,
              transform: 'translateX(-50%)',
              zIndex: Math.round(50 - member.yOffsetPx),
            }}
          >
            <PedestrianRig
              archetype={member.archetype}
              pose={pose}
              expression={
                pose === 'wince'
                  ? 'wince'
                  : pose === 'hurry-away'
                  ? 'terrified'
                  : 'neutral'
              }
              facing={member.facing}
              scale={baseScale * member.heightScale}
              seed={member.seed}
              startFrame={-member.phaseOffsetFrames}
              speed={member.walkSpeed}
              skinToneOverride={member.skinTone}
              topColorOverride={member.topColor}
              bottomColorOverride={member.bottomColor}
              hairColorOverride={member.hairColor}
            />
          </div>
        );
      })}
    </div>
  );
});
