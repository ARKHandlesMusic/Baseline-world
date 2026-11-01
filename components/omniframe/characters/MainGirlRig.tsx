'use client';

import React, { memo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import {
  CHARACTER_OUTFIT_PALETTES,
  SHARED_INK_OUTLINE,
  SKIN_TONE_PALETTES,
} from '../../../lib/omniframe/characters/palette';
import {
  blendJointAngles,
  evaluateExpressionFaceState,
  evaluatePoseJointAngles,
  pivotTransform,
  type CharacterRigProps,
} from '../../../lib/omniframe/characters/rig-utils';
import { FaceSystem, SharedCharacterSvgDefs } from './FaceSystem';

/**
 * 2. MAIN GIRL (Hero, Full Detail)
 * - Casual outfit (coral cropped jacket, cream top, teal pleated skirt, boots), expressive hair with bangs & ribbon.
 * - Expressions: happy, confused, neutral, soot-covered (blackened face, messy hair).
 * - Animations & Poses: walk, point-at-shop, shrug, browse-shelves, walk-out-of-rubble, hand-holding, holding-christmas-doll.
 */
export const MainGirlRig = memo(function MainGirlRig({
  pose = 'walk',
  secondaryPose,
  poseBlend = 0,
  expression = 'happy',
  facing = 'right',
  scale = 1,
  outfit = 'casual',
  seed = 'main-girl-hero',
  startFrame = 0,
  speed = 1,
  frameOverride,
  fpsOverride,
  sunglasses = false,
  x = 0,
  y = 0,
  className,
}: CharacterRigProps) {
  const remotionFrame = useCurrentFrame();
  const remotionConfig = useVideoConfig();
  const frame = frameOverride ?? remotionFrame;
  const fps = fpsOverride ?? remotionConfig.fps ?? 30;

  const primaryAngles = evaluatePoseJointAngles(pose, frame, {
    fps,
    startFrame,
    speed,
    seed,
  });
  const joints =
    secondaryPose && poseBlend > 0
      ? blendJointAngles(
          primaryAngles,
          evaluatePoseJointAngles(secondaryPose, frame, { fps, startFrame, speed, seed }),
          poseBlend
        )
      : primaryAngles;

  const isRubbleOrSoot = expression === 'soot-covered' || pose === 'walk-out-of-rubble';
  const effectiveExpression = isRubbleOrSoot ? 'soot-covered' : expression;
  const faceState = evaluateExpressionFaceState(
    effectiveExpression,
    pose,
    frame - startFrame,
    seed,
    fps
  );

  const skin = SKIN_TONE_PALETTES.lightIvory;
  const pal = CHARACTER_OUTFIT_PALETTES.mainGirl;
  const jacket = outfit === 'winter' ? CHARACTER_OUTFIT_PALETTES.squadMemberB.puffer : pal.jacket;
  const flipX = facing === 'left' ? -1 : 1;

  return (
    <svg
      viewBox="0 0 200 280"
      width={200 * scale}
      height={280 * scale}
      className={className}
      style={{ overflow: 'visible', transform: `translate(${x}px, ${y}px)` }}
      data-character="main-girl"
      data-pose={pose}
      data-expression={effectiveExpression}
    >
      <SharedCharacterSvgDefs />

      {/* Ground contact shadow */}
      <ellipse
        cx={100 + joints.rootX}
        cy={262}
        rx={32}
        ry={6.5}
        fill="#090D16"
        opacity={0.28}
      />

      <g
        transform={`translate(100, 140) scale(${flipX}, 1) translate(-100, -140) translate(${joints.rootX.toFixed(
          2
        )}, ${joints.rootY.toFixed(2)})`}
      >
        {/* ================= BACK HAIR PONIES / FLOW ================= */}
        <g
          data-part="hair-back"
          transform={pivotTransform(100, 82, joints.hairSwing * 1.15)}
        >
          <path
            d="M 60 66 Q 48 96 58 132 Q 74 138 82 118 L 118 118 Q 126 138 142 132 Q 152 96 140 66 Z"
            fill={pal.hair.shadow}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.2}
            strokeLinejoin="round"
          />
          {/* Messy frazzled hair spikes when soot-covered / walking out of rubble */}
          {isRubbleOrSoot && (
            <path
              d="M 52 78 L 38 72 L 50 92 L 36 104 L 56 112 M 148 78 L 162 70 L 150 92 L 164 106 L 146 114"
              fill={pal.hair.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3}
              strokeLinejoin="round"
            />
          )}
        </g>

        {/* ================= BACK ARM (LEFT) ================= */}
        <g
          data-part="upper-arm-l"
          transform={pivotTransform(78, 122, joints.shoulderL)}
        >
          <rect
            x={70}
            y={118}
            width={13}
            height={34}
            rx={6.5}
            fill={jacket.shadow}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.1}
          />
          <g
            data-part="lower-arm-l"
            transform={pivotTransform(76.5, 150, joints.elbowL)}
          >
            <rect
              x={70.5}
              y={146}
              width={12}
              height={30}
              rx={6}
              fill={jacket.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.1}
            />
            <g
              data-part="hand-l"
              transform={pivotTransform(76.5, 178, joints.wristL)}
            >
              <circle
                cx={76.5}
                cy={181}
                r={7}
                fill={skin.shadow}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={2.8}
              />
            </g>
          </g>
        </g>

        {/* ================= BACK LEG (LEFT) ================= */}
        <g
          data-part="upper-leg-l"
          transform={pivotTransform(90, 184, joints.hipL)}
        >
          <rect
            x={83}
            y={180}
            width={13}
            height={36}
            rx={6}
            fill={skin.shadow}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3}
          />
          <g
            data-part="lower-leg-l"
            transform={pivotTransform(89.5, 214, joints.kneeL)}
          >
            {/* Leg & sock */}
            <rect
              x={83.5}
              y={210}
              width={12}
              height={34}
              rx={5.5}
              fill={skin.shadow}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3}
            />
            <rect
              x={83}
              y={228}
              width={13}
              height={16}
              rx={3}
              fill="#F8FAFC"
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={2.5}
            />
            <g
              data-part="foot-l"
              transform={pivotTransform(89.5, 248, joints.ankleL)}
            >
              <path
                d="M 81 240 L 101 240 L 106 256 L 79 256 Z"
                fill={pal.boots.shadow}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={3}
                strokeLinejoin="round"
              />
            </g>
          </g>
        </g>

        {/* ================= FRONT LEG (RIGHT) ================= */}
        <g
          data-part="upper-leg-r"
          transform={pivotTransform(109, 184, joints.hipR)}
        >
          <rect
            x={102.5}
            y={180}
            width={13}
            height={36}
            rx={6}
            fill={skin.base}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3}
          />
          <g
            data-part="lower-leg-r"
            transform={pivotTransform(109, 214, joints.kneeR)}
          >
            <rect
              x={103}
              y={210}
              width={12}
              height={34}
              rx={5.5}
              fill={skin.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3}
            />
            <rect
              x={102.5}
              y={228}
              width={13}
              height={16}
              rx={3}
              fill="#F8FAFC"
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={2.5}
            />
            <g
              data-part="foot-r"
              transform={pivotTransform(109, 248, joints.ankleR)}
            >
              <path
                d="M 100 240 L 120 240 L 126 256 L 98 256 Z"
                fill={pal.boots.base}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={3}
                strokeLinejoin="round"
              />
              {/* Boot buckle */}
              <rect x={105} y={244} width={9} height={4} rx={1} fill="#FACC15" stroke={SHARED_INK_OUTLINE} strokeWidth={1.8} />
            </g>
          </g>
        </g>

        {/* ================= TORSO & PLEATED SKIRT ================= */}
        <g
          data-part="torso"
          transform={pivotTransform(100, 178, joints.torsoRotate, 0, 0, 1, joints.torsoSquashY)}
        >
          {/* Pleated skirt with secondary sway */}
          <g transform={pivotTransform(100, 164, joints.clothSway * 0.45)}>
            <path
              d="M 79 162 L 121 162 L 130 192 L 70 192 Z"
              fill={pal.skirt.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.2}
              strokeLinejoin="round"
            />
            {/* Skirt pleats */}
            <line x1={86} y1={164} x2={82} y2={191} stroke={SHARED_INK_OUTLINE} strokeWidth={2.4} />
            <line x1={100} y1={164} x2={100} y2={191} stroke={SHARED_INK_OUTLINE} strokeWidth={2.4} />
            <line x1={114} y1={164} x2={118} y2={191} stroke={SHARED_INK_OUTLINE} strokeWidth={2.4} />
          </g>

          {/* Cropped jacket & inner cream top */}
          <path
            d="M 76 114 Q 100 110 124 114 L 120 166 L 80 166 Z"
            fill={jacket.base}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.3}
            strokeLinejoin="round"
          />
          <path d="M 90 114 L 110 114 L 108 166 L 92 166 Z" fill={pal.top.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.6} />

          {/* Soot blast marks on outfit when soot-covered */}
          {isRubbleOrSoot && (
            <g opacity={0.65}>
              <ellipse cx={86} cy={142} rx={7} ry={9} fill="#18181B" />
              <ellipse cx={112} cy={176} rx={9} ry={6} fill="#18181B" />
            </g>
          )}

          {/* ================= HEAD, HAIR & FACE ================= */}
          <g
            data-part="head"
            transform={pivotTransform(
              100,
              108,
              joints.headRotate,
              joints.headOffsetX,
              joints.headOffsetY
            )}
          >
            {/* Neck */}
            <rect
              x={94}
              y={98}
              width={12}
              height={17}
              rx={5}
              fill={skin.shadow}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3}
            />

            {/* Ears */}
            <circle cx={68} cy={78} r={7} fill={skin.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            <circle cx={132} cy={78} r={7} fill={skin.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />

            {/* Head base */}
            <rect
              x={69}
              y={45}
              width={62}
              height={60}
              rx={28}
              fill={skin.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.4}
            />

            {/* Eyelashes */}
            <path d="M 80 71 L 76 68 M 120 71 L 124 68" stroke={SHARED_INK_OUTLINE} strokeWidth={2.6} strokeLinecap="round" />

            {/* Shared Face System */}
            <FaceSystem
              faceState={faceState}
              skin={skin}
              headCenterX={100}
              headCenterY={76}
              sunglasses={sunglasses}
              jawDropOverridePx={joints.jawDropPx}
            />

            {/* Front Hair Bangs & Hairband */}
            <g
              data-part="hair"
              transform={pivotTransform(100, 48, joints.hairSwing)}
            >
              <path
                d="M 66 70 Q 65 36 100 35 Q 135 36 134 70 Q 124 54 114 60 Q 100 46 86 60 Q 76 54 66 70 Z"
                fill={pal.hair.base}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={3.3}
                strokeLinejoin="round"
              />
              {/* Teal hair ribbon bow */}
              <path
                d="M 74 42 Q 100 32 126 42"
                fill="none"
                stroke="#2DD4BF"
                strokeWidth={5}
                strokeLinecap="round"
              />
              <path
                d="M 80 42 Q 100 35 120 42"
                fill="none"
                stroke={pal.hair.highlight}
                strokeWidth={3}
                strokeLinecap="round"
              />
            </g>
          </g>

          {/* ================= CHRISTMAS DOLL PROP (when pose === 'holding-christmas-doll') ================= */}
          {pose === 'holding-christmas-doll' && (
            <g
              data-part="accessories"
              transform={pivotTransform(
                114,
                148,
                joints.propRotate,
                joints.propOffsetX,
                joints.propOffsetY
              )}
            >
              {/* Mini ornate Nutcracker Christmas doll held in arms */}
              <rect x={104} y={134} width={20} height={26} rx={4} fill="#DC2626" stroke={SHARED_INK_OUTLINE} strokeWidth={2.5} />
              <line x1={106} y1={142} x2={122} y2={142} stroke="#FACC15" strokeWidth={2.5} />
              <line x1={106} y1={150} x2={122} y2={150} stroke="#FACC15" strokeWidth={2.5} />
              <circle cx={114} cy={125} r={9} fill="#FDBA74" stroke={SHARED_INK_OUTLINE} strokeWidth={2.5} />
              <rect x={105} y={108} width={18} height={12} rx={2} fill="#18181B" stroke={SHARED_INK_OUTLINE} strokeWidth={2.5} />
              <circle cx={114} cy={113} r={2.5} fill="#FACC15" />
            </g>
          )}
        </g>

        {/* ================= FRONT ARM (RIGHT) ================= */}
        <g
          data-part="upper-arm-r"
          transform={pivotTransform(122, 122, joints.shoulderR)}
        >
          <rect
            x={116}
            y={118}
            width={13}
            height={34}
            rx={6.5}
            fill={jacket.base}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.1}
          />
          <g
            data-part="lower-arm-r"
            transform={pivotTransform(122.5, 150, joints.elbowR)}
          >
            <rect
              x={116.5}
              y={146}
              width={12}
              height={30}
              rx={6}
              fill={jacket.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.1}
            />
            <g
              data-part="hand-r"
              transform={pivotTransform(122.5, 178, joints.wristR)}
            >
              <circle
                cx={122.5}
                cy={181}
                r={7.2}
                fill={skin.base}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={2.8}
              />
              {pose === 'point-at-shop' && (
                <rect
                  x={120.5}
                  y={185}
                  width={5}
                  height={10}
                  rx={2.5}
                  fill={skin.base}
                  stroke={SHARED_INK_OUTLINE}
                  strokeWidth={2.2}
                />
              )}
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
});
