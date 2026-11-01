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
 * 1. MAIN BOY (Hero, Full Detail)
 * - Casual outfit (varsity jacket, white tee, cuffed denim jeans), sneakers, spiky layered hairstyle.
 * - Sunglasses accessory toggle (`sunglasses?: boolean`) for the next-day scene.
 * - Expressions: happy, nervous, terrified, determined, shocked, guilty.
 * - Animations: walk, hand-holding-walk, sprint, point, salute, dance, freeze, mouth-drop (jaw hits floor).
 */
export const MainBoyRig = memo(function MainBoyRig({
  pose = 'walk',
  secondaryPose,
  poseBlend = 0,
  expression = 'happy',
  facing = 'right',
  scale = 1,
  outfit = 'casual',
  seed = 'main-boy-hero',
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

  const faceState = evaluateExpressionFaceState(expression, pose, frame - startFrame, seed, fps);
  const skin = SKIN_TONE_PALETTES.warmPeach;
  const pal = CHARACTER_OUTFIT_PALETTES.mainBoy;
  const jacket = outfit === 'stealth' ? CHARACTER_OUTFIT_PALETTES.hackerFriend.hoodie : pal.jacket;
  const flipX = facing === 'left' ? -1 : 1;

  return (
    <svg
      viewBox="0 0 200 280"
      width={200 * scale}
      height={280 * scale}
      className={className}
      style={{ overflow: 'visible', transform: `translate(${x}px, ${y}px)` }}
      data-character="main-boy"
      data-pose={pose}
      data-expression={expression}
    >
      <SharedCharacterSvgDefs />

      {/* Ground contact shadow */}
      <ellipse
        cx={100 + joints.rootX}
        cy={262}
        rx={34}
        ry={7}
        fill="#090D16"
        opacity={0.28}
      />

      <g
        transform={`translate(100, 140) scale(${flipX}, 1) translate(-100, -140) translate(${joints.rootX.toFixed(
          2
        )}, ${joints.rootY.toFixed(2)})`}
      >
        {/* ================= BACK ARM (LEFT) ================= */}
        <g
          data-part="upper-arm-l"
          transform={pivotTransform(76, 122, joints.shoulderL)}
        >
          <path
            d="M 68 118 Q 65 140 68 156 L 82 156 Q 85 140 82 118 Z"
            fill={jacket.shadow}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.2}
            strokeLinejoin="round"
          />
          {/* Sleeve stripe */}
          <line x1="68" y1="132" x2="82" y2="132" stroke="#F8FAFC" strokeWidth={3} />

          <g
            data-part="lower-arm-l"
            transform={pivotTransform(75, 154, joints.elbowL)}
          >
            <rect
              x={68}
              y={150}
              width={13}
              height={30}
              rx={6.5}
              fill={jacket.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.2}
            />
            {/* Ribbed cuff */}
            <rect
              x={68}
              y={173}
              width={13}
              height={6}
              rx={2}
              fill="#F8FAFC"
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={2.2}
            />
            <g
              data-part="hand-l"
              transform={pivotTransform(74.5, 182, joints.wristL)}
            >
              <circle
                cx={74.5}
                cy={185}
                r={7.5}
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
          transform={pivotTransform(88, 182, joints.hipL)}
        >
          <rect
            x={80}
            y={178}
            width={16}
            height={40}
            rx={7}
            fill={pal.jeans.shadow}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.2}
          />
          <g
            data-part="lower-leg-l"
            transform={pivotTransform(88, 216, joints.kneeL)}
          >
            <rect
              x={81}
              y={212}
              width={14}
              height={36}
              rx={6}
              fill={pal.jeans.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.2}
            />
            {/* Denim cuff */}
            <rect
              x={79.5}
              y={241}
              width={17}
              height={6}
              rx={2}
              fill="#93C5FD"
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={2.4}
            />
            <g
              data-part="foot-l"
              transform={pivotTransform(88, 250, joints.ankleL)}
            >
              <path
                d="M 80 247 L 103 247 Q 109 248 109 256 L 78 256 Q 77 251 80 247 Z"
                fill={pal.shoes.shadow}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={3}
              />
              <rect x={78} y={253.5} width={31} height={4} rx={1.5} fill="#FFFFFF" stroke={SHARED_INK_OUTLINE} strokeWidth={2} />
            </g>
          </g>
        </g>

        {/* ================= FRONT LEG (RIGHT) ================= */}
        <g
          data-part="upper-leg-r"
          transform={pivotTransform(110, 182, joints.hipR)}
        >
          <rect
            x={102}
            y={178}
            width={16}
            height={40}
            rx={7}
            fill={pal.jeans.base}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.2}
          />
          <path d="M 105 182 L 105 212" stroke={pal.jeans.highlight} strokeWidth={2.5} strokeLinecap="round" />

          <g
            data-part="lower-leg-r"
            transform={pivotTransform(110, 216, joints.kneeR)}
          >
            <rect
              x={103}
              y={212}
              width={14}
              height={36}
              rx={6}
              fill={pal.jeans.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.2}
            />
            <rect
              x={101.5}
              y={241}
              width={17}
              height={6}
              rx={2}
              fill="#93C5FD"
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={2.4}
            />
            <g
              data-part="foot-r"
              transform={pivotTransform(110, 250, joints.ankleR)}
            >
              <path
                d="M 101 247 L 126 247 Q 132 248 132 256 L 99 256 Q 98 251 101 247 Z"
                fill={pal.shoes.base}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={3}
              />
              <path d="M 108 248 L 116 253" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
              <rect x={99} y={253.5} width={33} height={4} rx={1.5} fill="#FFFFFF" stroke={SHARED_INK_OUTLINE} strokeWidth={2} />
            </g>
          </g>
        </g>

        {/* ================= TORSO ================= */}
        <g
          data-part="torso"
          transform={pivotTransform(100, 178, joints.torsoRotate, 0, 0, 1, joints.torsoSquashY)}
        >
          {/* Jacket body */}
          <path
            d={`M 73 114 Q 100 108 127 114 L ${123 + joints.clothSway * 0.25} 182 Q 100 187 ${
              77 + joints.clothSway * 0.25
            } 182 Z`}
            fill={jacket.base}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.4}
            strokeLinejoin="round"
          />
          {/* Cel shadow side */}
          <path
            d="M 74 116 L 86 115 L 86 181 L 78 181 Z"
            fill={jacket.shadow}
          />
          {/* Inner graphic tee center panel */}
          <path
            d="M 90 114 L 110 114 L 108 181 L 92 181 Z"
            fill={pal.shirt.base}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={2.8}
          />
          {/* Star graphic on tee */}
          <circle cx={100} cy={140} r={6.5} fill="#FACC15" stroke={SHARED_INK_OUTLINE} strokeWidth={2} />
          {/* Varsity jacket collar & buttons */}
          <path
            d="M 85 113 Q 100 124 115 113"
            fill="none"
            stroke="#F8FAFC"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <circle cx={86} cy={132} r={2} fill="#F8FAFC" />
          <circle cx={86} cy={148} r={2} fill="#F8FAFC" />
          <circle cx={86} cy={164} r={2} fill="#F8FAFC" />

          {/* ================= HEAD, HAIR, FACE & ACCESSORIES ================= */}
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
              x={93}
              y={98}
              width={14}
              height={18}
              rx={5}
              fill={skin.shadow}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3}
            />

            {/* Back Hair spikes */}
            <g
              data-part="hair-back"
              transform={pivotTransform(100, 62, joints.hairSwing * 0.5)}
            >
              <path
                d="M 62 72 Q 52 54 68 46 Q 62 32 82 34 Q 100 22 118 34 Q 136 32 130 50 Q 144 60 132 74 Z"
                fill={pal.hair.shadow}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={3.4}
                strokeLinejoin="round"
              />
            </g>

            {/* Ears */}
            <circle
              cx={67}
              cy={78}
              r={7.5}
              fill={skin.shadow}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3}
            />
            <circle
              cx={133}
              cy={78}
              r={7.5}
              fill={skin.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3}
            />

            {/* Head silhouette (appealing big cartoon proportions) */}
            <rect
              x={68}
              y={44}
              width={64}
              height={62}
              rx={28}
              fill={skin.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.5}
            />
            {/* Cel-shaded cheek shadow + forehead highlight */}
            <path
              d="M 70 62 Q 70 98 92 104 Q 76 96 76 62 Z"
              fill={skin.shadow}
            />
            <ellipse cx={116} cy={56} rx={8} ry={4} fill={skin.highlight} opacity={0.65} />

            {/* Shared Face System (Eyes, Brows, Mouth, Jaw-Drop, Sunglasses) */}
            <FaceSystem
              faceState={faceState}
              skin={skin}
              headCenterX={100}
              headCenterY={76}
              sunglasses={sunglasses}
              jawDropOverridePx={joints.jawDropPx}
            />

            {/* Front Hair Spikes with secondary follow-through */}
            <g
              data-part="hair"
              transform={pivotTransform(100, 48, joints.hairSwing)}
            >
              <path
                d="M 65 62 Q 66 36 90 36 L 84 25 Q 104 26 115 36 L 126 26 Q 134 40 136 58 Q 122 48 112 55 Q 100 43 88 56 Q 76 47 65 62 Z"
                fill={pal.hair.base}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={3.4}
                strokeLinejoin="round"
              />
              {/* Hair specular ribbon */}
              <path
                d="M 78 44 Q 98 36 120 44"
                fill="none"
                stroke={pal.hair.highlight}
                strokeWidth={3.5}
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>

        {/* ================= FRONT ARM (RIGHT) ================= */}
        <g
          data-part="upper-arm-r"
          transform={pivotTransform(124, 122, joints.shoulderR)}
        >
          <path
            d="M 118 118 Q 115 140 118 156 L 132 156 Q 135 140 132 118 Z"
            fill={jacket.base}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.2}
            strokeLinejoin="round"
          />
          <line x1="118" y1="132" x2="132" y2="132" stroke="#F8FAFC" strokeWidth={3} />

          <g
            data-part="lower-arm-r"
            transform={pivotTransform(125, 154, joints.elbowR)}
          >
            <rect
              x={118.5}
              y={150}
              width={13}
              height={30}
              rx={6.5}
              fill={jacket.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.2}
            />
            <rect
              x={118.5}
              y={173}
              width={13}
              height={6}
              rx={2}
              fill="#F8FAFC"
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={2.2}
            />
            <g
              data-part="hand-r"
              transform={pivotTransform(125, 182, joints.wristR)}
            >
              <circle
                cx={125}
                cy={185}
                r={7.8}
                fill={skin.base}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={2.8}
              />
              {/* Pointing finger extension when pointing or saluting */}
              {(pose === 'point' || pose === 'salute') && (
                <rect
                  x={123}
                  y={189}
                  width={5.5}
                  height={11}
                  rx={2.5}
                  fill={skin.base}
                  stroke={SHARED_INK_OUTLINE}
                  strokeWidth={2.4}
                />
              )}
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
});
