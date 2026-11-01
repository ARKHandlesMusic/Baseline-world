'use client';

import React, { memo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import {
  CHARACTER_OUTFIT_PALETTES,
  SHARED_INK_OUTLINE,
  SKIN_TONE_PALETTES,
} from '../../../lib/omniframe/characters/palette';
import {
  evaluateExpressionFaceState,
  evaluatePoseJointAngles,
  pivotTransform,
  type CharacterRigProps,
  type CountdownSignValue,
} from '../../../lib/omniframe/characters/rig-utils';
import { FaceSystem, SharedCharacterSvgDefs } from './FaceSystem';

const COUNTDOWN_SEQUENCE: readonly CountdownSignValue[] = [
  '10',
  '9',
  '8',
  '7',
  '6',
  '5',
  '4',
  '3',
  '2',
  '1',
  'BOOM!',
];

/**
 * 3. HACKER FRIEND
 * - Distinctive outfit (oversized cyber-hoodie silhouette, baggy cargo joggers), snack bag, glowing OLED phone.
 * - Expressions: unbothered, confused, deadpan.
 * - Animations: eating, tapping-phone, shrugging, throwing-snack.
 */
export const HackerFriendRig = memo(function HackerFriendRig({
  pose = 'tapping-phone',
  expression = 'unbothered',
  facing = 'right',
  scale = 1,
  seed = 'hacker-friend',
  startFrame = 0,
  speed = 1,
  frameOverride,
  fpsOverride,
  x = 0,
  y = 0,
  className,
}: CharacterRigProps) {
  const remotionFrame = useCurrentFrame();
  const remotionConfig = useVideoConfig();
  const frame = frameOverride ?? remotionFrame;
  const fps = fpsOverride ?? remotionConfig.fps ?? 30;

  const joints = evaluatePoseJointAngles(pose, frame, { fps, startFrame, speed, seed });
  const faceState = evaluateExpressionFaceState(expression, pose, frame - startFrame, seed, fps);
  const skin = SKIN_TONE_PALETTES.oliveTan;
  const pal = CHARACTER_OUTFIT_PALETTES.hackerFriend;
  const flipX = facing === 'left' ? -1 : 1;

  return (
    <svg
      viewBox="0 0 200 280"
      width={200 * scale}
      height={280 * scale}
      className={className}
      style={{ overflow: 'visible', transform: `translate(${x}px, ${y}px)` }}
      data-character="hacker-friend"
      data-pose={pose}
      data-expression={expression}
    >
      <SharedCharacterSvgDefs />
      <ellipse cx={100 + joints.rootX} cy={262} rx={36} ry={7} fill="#090D16" opacity={0.3} />

      <g
        transform={`translate(100, 140) scale(${flipX}, 1) translate(-100, -140) translate(${joints.rootX.toFixed(
          2
        )}, ${joints.rootY.toFixed(2)})`}
      >
        {/* Back Arm (Left) holding Snack Bag or Phone */}
        <g data-part="upper-arm-l" transform={pivotTransform(72, 124, joints.shoulderL)}>
          <rect x={63} y={118} width={17} height={36} rx={8} fill={pal.hoodie.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-arm-l" transform={pivotTransform(71.5, 152, joints.elbowL)}>
            <rect x={64} y={148} width={15} height={30} rx={7} fill={pal.hoodie.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <g data-part="hand-l" transform={pivotTransform(71.5, 180, joints.wristL)}>
              <circle cx={71.5} cy={183} r={7.5} fill={skin.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
              {/* Snack bag in left hand */}
              {(pose === 'eating' || pose === 'throwing-snack') && (
                <g data-part="accessory-snack-bag" transform="translate(56, 168) rotate(-14)">
                  <rect x={0} y={0} width={24} height={30} rx={3} fill={pal.snackBag.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.6} />
                  <rect x={0} y={0} width={24} height={5} fill="#FACC15" stroke={SHARED_INK_OUTLINE} strokeWidth={2} />
                  <circle cx={12} cy={16} r={6} fill="#FACC15" />
                </g>
              )}
              {/* Glowing Smartphone in left hand */}
              {pose !== 'eating' && (
                <g data-part="accessory-phone" transform="translate(62, 174) rotate(-25)">
                  <rect x={0} y={0} width={14} height={24} rx={3} fill="#0F172A" stroke={SHARED_INK_OUTLINE} strokeWidth={2.5} />
                  <rect x={2} y={2} width={10} height={19} rx={1.5} fill={pal.phoneGlow.base} filter="url(#omniframe-oled-glow)" />
                </g>
              )}
            </g>
          </g>
        </g>

        {/* Legs */}
        <g data-part="upper-leg-l" transform={pivotTransform(87, 186, joints.hipL)}>
          <rect x={78} y={182} width={18} height={38} rx={8} fill={pal.pants.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-leg-l" transform={pivotTransform(87, 218, joints.kneeL)}>
            <rect x={80} y={214} width={15} height={34} rx={6} fill={pal.pants.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <g data-part="foot-l" transform={pivotTransform(87, 250, joints.ankleL)}>
              <rect x={77} y={246} width={28} height={10} rx={5} fill="#334155" stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        <g data-part="upper-leg-r" transform={pivotTransform(112, 186, joints.hipR)}>
          <rect x={103} y={182} width={18} height={38} rx={8} fill={pal.pants.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-leg-r" transform={pivotTransform(112, 218, joints.kneeR)}>
            <rect x={105} y={214} width={15} height={34} rx={6} fill={pal.pants.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <g data-part="foot-r" transform={pivotTransform(112, 250, joints.ankleR)}>
              <rect x={101} y={246} width={29} height={10} rx={5} fill="#475569" stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        {/* Distinctive Slouched Oversized Hoodie Torso Silhouette */}
        <g data-part="torso" transform={pivotTransform(100, 182, joints.torsoRotate, 0, 0, 1, joints.torsoSquashY)}>
          {/* Hood cowl behind head */}
          <ellipse cx={96} cy={104} rx={36} ry={22} fill={pal.hoodie.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3.4} />
          {/* Baggy hoodie silhouette */}
          <path
            d="M 66 114 Q 100 104 134 114 L 132 186 Q 100 194 68 186 Z"
            fill={pal.hoodie.base}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.5}
            strokeLinejoin="round"
          />
          {/* Kangaroo pocket */}
          <path d="M 78 156 L 122 156 L 126 180 L 74 180 Z" fill={pal.hoodie.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
          {/* Cyber binary motif */}
          <circle cx={100} cy={138} r={9} fill={pal.accent.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.4} />
          {/* Hoodie drawstrings with secondary swing */}
          <g transform={pivotTransform(92, 114, joints.clothSway)}>
            <line x1={92} y1={114} x2={90} y2={140} stroke="#F8FAFC" strokeWidth={2.8} strokeLinecap="round" />
            <line x1={108} y1={114} x2={110} y2={140} stroke="#F8FAFC" strokeWidth={2.8} strokeLinecap="round" />
          </g>

          {/* Head */}
          <g data-part="head" transform={pivotTransform(100, 108, joints.headRotate, joints.headOffsetX, joints.headOffsetY)}>
            <rect x={93} y={98} width={14} height={16} rx={5} fill={skin.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3} />
            <rect x={69} y={44} width={62} height={60} rx={27} fill={skin.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.4} />
            <FaceSystem faceState={faceState} skin={skin} headCenterX={100} headCenterY={76} jawDropOverridePx={joints.jawDropPx} />
            {/* Shaggy hacker bangs + headset */}
            <g data-part="hair" transform={pivotTransform(100, 48, joints.hairSwing)}>
              <path
                d="M 66 64 Q 68 34 102 35 Q 134 36 134 66 Q 118 52 106 62 Q 92 50 78 64 Z"
                fill="#0F172A"
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={3.2}
              />
            </g>
            {/* Headphone cups */}
            <g data-part="accessories">
              <rect x={61} y={64} width={10} height={22} rx={5} fill={pal.accent.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
              <rect x={129} y={64} width={10} height={22} rx={5} fill={pal.accent.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        {/* Front Arm (Right) + Flying Thrown Snack */}
        <g data-part="upper-arm-r" transform={pivotTransform(128, 124, joints.shoulderR)}>
          <rect x={120} y={118} width={17} height={36} rx={8} fill={pal.hoodie.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-arm-r" transform={pivotTransform(128.5, 152, joints.elbowR)}>
            <rect x={121} y={148} width={15} height={30} rx={7} fill={pal.hoodie.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <g data-part="hand-r" transform={pivotTransform(128.5, 180, joints.wristR)}>
              <circle cx={128.5} cy={183} r={7.5} fill={skin.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
              {pose === 'eating' && (
                <circle cx={128.5} cy={190} r={4.5} fill="#FACC15" stroke={SHARED_INK_OUTLINE} strokeWidth={2} />
              )}
            </g>
          </g>
        </g>

        {/* Thrown snack projectile when pose === 'throwing-snack' */}
        {pose === 'throwing-snack' && (
          <g
            data-part="thrown-snack-prop"
            transform={`translate(${(135 + joints.propOffsetX).toFixed(1)}, ${(135 + joints.propOffsetY).toFixed(
              1
            )}) rotate(${joints.propRotate.toFixed(1)})`}
          >
            <polygon
              points="0,-9 9,7 -9,7"
              fill="#FACC15"
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={2.4}
            />
          </g>
        )}
      </g>
    </svg>
  );
});

/**
 * 4. HYPE MAN
 * - Cardboard countdown sign (swappable numbers 10 to 1 and "BOOM!").
 * - Animations: countdown-gestures, jumping, cheering, dancing.
 */
export const HypeManRig = memo(function HypeManRig({
  pose = 'countdown-gestures',
  expression = 'excited',
  facing = 'right',
  scale = 1,
  seed = 'hype-man',
  startFrame = 0,
  speed = 1,
  frameOverride,
  fpsOverride,
  countdownValue,
  x = 0,
  y = 0,
  className,
}: CharacterRigProps) {
  const remotionFrame = useCurrentFrame();
  const remotionConfig = useVideoConfig();
  const frame = frameOverride ?? remotionFrame;
  const fps = fpsOverride ?? remotionConfig.fps ?? 30;

  const joints = evaluatePoseJointAngles(pose, frame, { fps, startFrame, speed, seed });
  const faceState = evaluateExpressionFaceState(expression, pose, frame - startFrame, seed, fps);
  const skin = SKIN_TONE_PALETTES.deepUmber;
  const pal = CHARACTER_OUTFIT_PALETTES.hypeMan;
  const flipX = facing === 'left' ? -1 : 1;

  // Automatically cycle 10..1..BOOM! if countdownValue isn't explicitly locked
  const autoIndex = Math.floor(Math.max(0, frame - startFrame) / 18) % COUNTDOWN_SEQUENCE.length;
  const activeSignText: CountdownSignValue = countdownValue ?? COUNTDOWN_SEQUENCE[autoIndex];
  const isBoom = activeSignText === 'BOOM!';

  return (
    <svg
      viewBox="0 0 200 280"
      width={200 * scale}
      height={280 * scale}
      className={className}
      style={{ overflow: 'visible', transform: `translate(${x}px, ${y}px)` }}
      data-character="hype-man"
      data-pose={pose}
      data-countdown={activeSignText}
    >
      <SharedCharacterSvgDefs />
      <ellipse cx={100 + joints.rootX} cy={262} rx={34} ry={7} fill="#090D16" opacity={0.28} />

      <g
        transform={`translate(100, 140) scale(${flipX}, 1) translate(-100, -140) translate(${joints.rootX.toFixed(
          2
        )}, ${joints.rootY.toFixed(2)})`}
      >
        {/* Back Arm (Left) */}
        <g data-part="upper-arm-l" transform={pivotTransform(76, 122, joints.shoulderL)}>
          <rect x={69} y={118} width={14} height={34} rx={7} fill={pal.tracksuit.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-arm-l" transform={pivotTransform(76, 150, joints.elbowL)}>
            <rect x={70} y={146} width={13} height={30} rx={6.5} fill={pal.tracksuit.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <g data-part="hand-l" transform={pivotTransform(76, 178, joints.wristL)}>
              <circle cx={76} cy={181} r={7.5} fill={skin.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        {/* Legs */}
        <g data-part="upper-leg-l" transform={pivotTransform(88, 182, joints.hipL)}>
          <rect x={80} y={178} width={16} height={38} rx={7} fill={pal.pants.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-leg-l" transform={pivotTransform(88, 214, joints.kneeL)}>
            <rect x={81} y={210} width={14} height={36} rx={6} fill={pal.pants.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <g data-part="foot-l" transform={pivotTransform(88, 248, joints.ankleL)}>
              <rect x={79} y={245} width={28} height={11} rx={5} fill="#FACC15" stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        <g data-part="upper-leg-r" transform={pivotTransform(110, 182, joints.hipR)}>
          <rect x={102} y={178} width={16} height={38} rx={7} fill={pal.pants.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-leg-r" transform={pivotTransform(110, 214, joints.kneeR)}>
            <rect x={103} y={210} width={14} height={36} rx={6} fill={pal.pants.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <g data-part="foot-r" transform={pivotTransform(110, 248, joints.ankleR)}>
              <rect x={101} y={245} width={29} height={11} rx={5} fill="#FACC15" stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        {/* Torso */}
        <g data-part="torso" transform={pivotTransform(100, 178, joints.torsoRotate, 0, 0, 1, joints.torsoSquashY)}>
          <path
            d="M 74 114 Q 100 108 126 114 L 122 182 L 78 182 Z"
            fill={pal.tracksuit.base}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.4}
          />
          {/* Gold hype chain */}
          <path d="M 86 116 Q 100 142 114 116" fill="none" stroke="#FEF08A" strokeWidth={4} />
          <circle cx={100} cy={135} r={5.5} fill="#FACC15" stroke={SHARED_INK_OUTLINE} strokeWidth={2} />

          {/* Head */}
          <g data-part="head" transform={pivotTransform(100, 108, joints.headRotate, joints.headOffsetX, joints.headOffsetY)}>
            <rect x={93} y={98} width={14} height={16} rx={5} fill={skin.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3} />
            <rect x={69} y={46} width={62} height={58} rx={27} fill={skin.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.4} />
            <FaceSystem faceState={faceState} skin={skin} headCenterX={100} headCenterY={76} jawDropOverridePx={joints.jawDropPx} />
            {/* Red backwards hype cap */}
            <g data-part="hair">
              <path d="M 68 58 Q 100 32 132 58 Z" fill={pal.visorCap.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
              <rect x={54} y={52} width={22} height={7} rx={3.5} fill={pal.visorCap.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.6} />
            </g>
          </g>

          {/* Swappable Cardboard Countdown Sign (10..1 and "BOOM!") */}
          <g
            data-part="accessories"
            transform={pivotTransform(
              100,
              22,
              joints.propRotate,
              joints.propOffsetX,
              joints.propOffsetY
            )}
          >
            {/* Wooden stick handle */}
            <rect x={96} y={24} width={8} height={32} fill="#92400E" stroke={SHARED_INK_OUTLINE} strokeWidth={2.5} />
            {/* Corrugated cardboard placard */}
            <rect
              x={44}
              y={-26}
              width={112}
              height={54}
              rx={5}
              fill={isBoom ? '#EF4444' : pal.cardboard.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.5}
            />
            {/* Masking tape corners */}
            <rect x={48} y={-22} width={16} height={7} transform="rotate(-18 48 -22)" fill="#FEF08A" opacity={0.85} />
            <rect x={136} y={-22} width={16} height={7} transform="rotate(18 136 -22)" fill="#FEF08A" opacity={0.85} />
            <text
              x={100}
              y={10}
              transform={`translate(100, 0) scale(${flipX}, 1) translate(-100, 0)`}
              textAnchor="middle"
              fill={isBoom ? '#FEF08A' : '#18181B'}
              fontSize={isBoom ? 26 : 34}
              fontWeight={900}
              fontFamily="system-ui, sans-serif"
            >
              {activeSignText}
            </text>
          </g>
        </g>

        {/* Front Arm (Right) */}
        <g data-part="upper-arm-r" transform={pivotTransform(124, 122, joints.shoulderR)}>
          <rect x={117} y={118} width={14} height={34} rx={7} fill={pal.tracksuit.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-arm-r" transform={pivotTransform(124, 150, joints.elbowR)}>
            <rect x={118} y={146} width={13} height={30} rx={6.5} fill={pal.tracksuit.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <g data-part="hand-r" transform={pivotTransform(124, 178, joints.wristR)}>
              <circle cx={124} cy={181} r={7.5} fill={skin.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
});

/**
 * 5. SQUAD MEMBER A (Reusable)
 * - Tactical olive field vest, cargo pants, beret cap.
 * - Animations: salute, point, cheer, high-five, dance.
 */
export const SquadMemberARig = memo(function SquadMemberARig({
  pose = 'salute',
  expression = 'determined',
  facing = 'right',
  scale = 1,
  seed = 'squad-member-a',
  startFrame = 0,
  speed = 1,
  frameOverride,
  fpsOverride,
  x = 0,
  y = 0,
  className,
}: CharacterRigProps) {
  const remotionFrame = useCurrentFrame();
  const remotionConfig = useVideoConfig();
  const frame = frameOverride ?? remotionFrame;
  const fps = fpsOverride ?? remotionConfig.fps ?? 30;

  const joints = evaluatePoseJointAngles(pose, frame, { fps, startFrame, speed, seed });
  const faceState = evaluateExpressionFaceState(expression, pose, frame - startFrame, seed, fps);
  const skin = SKIN_TONE_PALETTES.warmPeach;
  const pal = CHARACTER_OUTFIT_PALETTES.squadMemberA;
  const flipX = facing === 'left' ? -1 : 1;

  return (
    <svg
      viewBox="0 0 200 280"
      width={200 * scale}
      height={280 * scale}
      className={className}
      style={{ overflow: 'visible', transform: `translate(${x}px, ${y}px)` }}
      data-character="squad-member-a"
      data-pose={pose}
    >
      <SharedCharacterSvgDefs />
      <ellipse cx={100 + joints.rootX} cy={262} rx={33} ry={6.5} fill="#090D16" opacity={0.28} />

      <g
        transform={`translate(100, 140) scale(${flipX}, 1) translate(-100, -140) translate(${joints.rootX.toFixed(
          2
        )}, ${joints.rootY.toFixed(2)})`}
      >
        <g data-part="upper-arm-l" transform={pivotTransform(76, 122, joints.shoulderL)}>
          <rect x={69} y={118} width={14} height={34} rx={7} fill={pal.shirt.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-arm-l" transform={pivotTransform(76, 150, joints.elbowL)}>
            <rect x={70} y={146} width={13} height={30} rx={6} fill={skin.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3} />
            <g data-part="hand-l" transform={pivotTransform(76, 178, joints.wristL)}>
              <circle cx={76} cy={181} r={7.5} fill={skin.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        <g data-part="upper-leg-l" transform={pivotTransform(88, 182, joints.hipL)}>
          <rect x={80} y={178} width={16} height={38} rx={7} fill={pal.cargo.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-leg-l" transform={pivotTransform(88, 214, joints.kneeL)}>
            <rect x={81} y={210} width={14} height={36} rx={6} fill={pal.cargo.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <g data-part="foot-l" transform={pivotTransform(88, 248, joints.ankleL)}>
              <rect x={79} y={244} width={27} height={12} rx={4} fill="#1C1917" stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        <g data-part="upper-leg-r" transform={pivotTransform(110, 182, joints.hipR)}>
          <rect x={102} y={178} width={16} height={38} rx={7} fill={pal.cargo.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-leg-r" transform={pivotTransform(110, 214, joints.kneeR)}>
            <rect x={103} y={210} width={14} height={36} rx={6} fill={pal.cargo.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <g data-part="foot-r" transform={pivotTransform(110, 248, joints.ankleR)}>
              <rect x={101} y={244} width={28} height={12} rx={4} fill="#1C1917" stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        <g data-part="torso" transform={pivotTransform(100, 178, joints.torsoRotate, 0, 0, 1, joints.torsoSquashY)}>
          <path d="M 75 114 L 125 114 L 121 182 L 79 182 Z" fill={pal.vest.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.4} />
          {/* Tactical utility pouches */}
          <rect x={81} y={148} width={14} height={18} rx={2} fill={pal.vest.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.4} />
          <rect x={105} y={148} width={14} height={18} rx={2} fill={pal.vest.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.4} />

          <g data-part="head" transform={pivotTransform(100, 108, joints.headRotate, joints.headOffsetX, joints.headOffsetY)}>
            <rect x={93} y={98} width={14} height={16} rx={5} fill={skin.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3} />
            <rect x={70} y={46} width={60} height={58} rx={26} fill={skin.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.4} />
            <FaceSystem faceState={faceState} skin={skin} headCenterX={100} headCenterY={76} jawDropOverridePx={joints.jawDropPx} />
            {/* Tactical Beret */}
            <g data-part="hair" transform={pivotTransform(100, 44, joints.hairSwing * 0.4)}>
              <path
                d="M 64 54 Q 72 28 118 34 Q 140 38 134 54 Z"
                fill={pal.beret.base}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={3.2}
              />
              <circle cx={96} cy={44} r={4} fill="#FACC15" stroke={SHARED_INK_OUTLINE} strokeWidth={1.8} />
            </g>
          </g>
        </g>

        <g data-part="upper-arm-r" transform={pivotTransform(124, 122, joints.shoulderR)}>
          <rect x={117} y={118} width={14} height={34} rx={7} fill={pal.shirt.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-arm-r" transform={pivotTransform(124, 150, joints.elbowR)}>
            <rect x={118} y={146} width={13} height={30} rx={6} fill={skin.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3} />
            <g data-part="hand-r" transform={pivotTransform(124, 178, joints.wristR)}>
              <circle cx={124} cy={181} r={7.5} fill={skin.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
});

/**
 * 6. SQUAD MEMBER B (Reusable, Visibly Different Clothes & Hairstyle)
 * - Purple quilted puffer jacket, amber pom-pom beanie, curly side-swept hair, high-top kicks.
 * - Animations: salute, cheer, dance, shocked-reaction.
 */
export const SquadMemberBRig = memo(function SquadMemberBRig({
  pose = 'cheer',
  expression = 'happy',
  facing = 'right',
  scale = 1,
  seed = 'squad-member-b',
  startFrame = 0,
  speed = 1,
  frameOverride,
  fpsOverride,
  x = 0,
  y = 0,
  className,
}: CharacterRigProps) {
  const remotionFrame = useCurrentFrame();
  const remotionConfig = useVideoConfig();
  const frame = frameOverride ?? remotionFrame;
  const fps = fpsOverride ?? remotionConfig.fps ?? 30;

  const joints = evaluatePoseJointAngles(pose, frame, { fps, startFrame, speed, seed });
  const faceState = evaluateExpressionFaceState(expression, pose, frame - startFrame, seed, fps);
  const skin = SKIN_TONE_PALETTES.goldenBronze;
  const pal = CHARACTER_OUTFIT_PALETTES.squadMemberB;
  const flipX = facing === 'left' ? -1 : 1;

  return (
    <svg
      viewBox="0 0 200 280"
      width={200 * scale}
      height={280 * scale}
      className={className}
      style={{ overflow: 'visible', transform: `translate(${x}px, ${y}px)` }}
      data-character="squad-member-b"
      data-pose={pose}
    >
      <SharedCharacterSvgDefs />
      <ellipse cx={100 + joints.rootX} cy={262} rx={35} ry={7} fill="#090D16" opacity={0.28} />

      <g
        transform={`translate(100, 140) scale(${flipX}, 1) translate(-100, -140) translate(${joints.rootX.toFixed(
          2
        )}, ${joints.rootY.toFixed(2)})`}
      >
        <g data-part="upper-arm-l" transform={pivotTransform(72, 122, joints.shoulderL)}>
          <rect x={63} y={116} width={18} height={36} rx={9} fill={pal.puffer.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-arm-l" transform={pivotTransform(72, 150, joints.elbowL)}>
            <rect x={64} y={146} width={16} height={30} rx={8} fill={pal.puffer.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <g data-part="hand-l" transform={pivotTransform(72, 178, joints.wristL)}>
              <circle cx={72} cy={181} r={7.5} fill={skin.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        <g data-part="upper-leg-l" transform={pivotTransform(88, 182, joints.hipL)}>
          <rect x={80} y={178} width={16} height={38} rx={7} fill={pal.trackPants.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-leg-l" transform={pivotTransform(88, 214, joints.kneeL)}>
            <rect x={81} y={210} width={14} height={36} rx={6} fill={pal.trackPants.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <g data-part="foot-l" transform={pivotTransform(88, 248, joints.ankleL)}>
              <rect x={79} y={242} width={28} height={14} rx={4} fill={pal.kicks.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        <g data-part="upper-leg-r" transform={pivotTransform(110, 182, joints.hipR)}>
          <rect x={102} y={178} width={16} height={38} rx={7} fill={pal.trackPants.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-leg-r" transform={pivotTransform(110, 214, joints.kneeR)}>
            <rect x={103} y={210} width={14} height={36} rx={6} fill={pal.trackPants.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <g data-part="foot-r" transform={pivotTransform(110, 248, joints.ankleR)}>
              <rect x={101} y={242} width={29} height={14} rx={4} fill={pal.kicks.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>

        {/* Quilted Puffer Jacket Torso */}
        <g data-part="torso" transform={pivotTransform(100, 178, joints.torsoRotate, 0, 0, 1, joints.torsoSquashY)}>
          <rect x={68} y={112} width={64} height={72} rx={18} fill={pal.puffer.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.5} />
          <line x1={70} y1={134} x2={130} y2={134} stroke={SHARED_INK_OUTLINE} strokeWidth={2.6} />
          <line x1={70} y1={158} x2={130} y2={158} stroke={SHARED_INK_OUTLINE} strokeWidth={2.6} />
          <line x1={100} y1={112} x2={100} y2={184} stroke="#FACC15" strokeWidth={3} />

          <g data-part="head" transform={pivotTransform(100, 108, joints.headRotate, joints.headOffsetX, joints.headOffsetY)}>
            <rect x={93} y={98} width={14} height={16} rx={5} fill={skin.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3} />
            <rect x={69} y={46} width={62} height={58} rx={27} fill={skin.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.4} />
            <FaceSystem faceState={faceState} skin={skin} headCenterX={100} headCenterY={76} jawDropOverridePx={joints.jawDropPx} />
            {/* Visibly distinct curly hair & pom-pom beanie */}
            <g data-part="hair" transform={pivotTransform(100, 44, joints.hairSwing)}>
              <circle cx={72} cy={58} r={9} fill="#1E1B4B" stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
              <circle cx={128} cy={58} r={9} fill="#1E1B4B" stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
              <path d="M 68 54 Q 100 22 132 54 Z" fill={pal.beanie.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
              <rect x={66} y={48} width={68} height={10} rx={5} fill={pal.beanie.highlight} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
              {/* Secondary-motion Pom-Pom */}
              <circle
                cx={100 + joints.hatTasselSwing * 0.4}
                cy={26}
                r={9.5}
                fill={pal.beanie.highlight}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={2.8}
              />
            </g>
          </g>
        </g>

        <g data-part="upper-arm-r" transform={pivotTransform(128, 122, joints.shoulderR)}>
          <rect x={119} y={116} width={18} height={36} rx={9} fill={pal.puffer.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <g data-part="lower-arm-r" transform={pivotTransform(128, 150, joints.elbowR)}>
            <rect x={120} y={146} width={16} height={30} rx={8} fill={pal.puffer.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <g data-part="hand-r" transform={pivotTransform(128, 178, joints.wristR)}>
              <circle cx={128} cy={181} r={7.5} fill={skin.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
});
