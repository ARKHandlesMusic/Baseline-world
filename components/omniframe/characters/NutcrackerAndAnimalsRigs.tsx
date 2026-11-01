'use client';

import React, { memo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import {
  CHARACTER_OUTFIT_PALETTES,
  SHARED_INK_OUTLINE,
} from '../../../lib/omniframe/characters/palette';
import {
  evaluateExpressionFaceState,
  evaluatePoseJointAngles,
  pivotTransform,
  type CharacterRigProps,
  type NutcrackerDollVariant,
} from '../../../lib/omniframe/characters/rig-utils';
import { SharedCharacterSvgDefs } from './FaceSystem';

/**
 * 8. NUTCRACKER DOLL (Hero Model with Extra Detail + Simplified Shop-Window Variant)
 * - Ornate scarlet royal uniform, tall Hussar shako hat, white beard & curled mustache, gold trim, chunky wooden jaw.
 * - Separate named articulated parts: `head`, `jaw`, `hat`, `body` (plus arms & boots).
 * - Animations: `head-rotation`, `eye-movement`, `gulp`, `trembling`, `detachable-head` (pops off with a Remotion spring arc!).
 * - Also includes a simplified variant (`nutcrackerVariant="shop-window"`) for 3 to 6 shop-window copies.
 */
export const NutcrackerDollRig = memo(function NutcrackerDollRig({
  pose = 'head-rotation',
  expression = 'stoic',
  facing = 'right',
  scale = 1,
  seed = 'nutcracker-hero',
  startFrame = 0,
  speed = 1,
  frameOverride,
  fpsOverride,
  nutcrackerVariant = 'hero',
  x = 0,
  y = 0,
  className,
}: CharacterRigProps & { variant?: NutcrackerDollVariant }) {
  const remotionFrame = useCurrentFrame();
  const remotionConfig = useVideoConfig();
  const frame = frameOverride ?? remotionFrame;
  const fps = fpsOverride ?? remotionConfig.fps ?? 30;

  const isHero = nutcrackerVariant !== 'shop-window';
  const joints = evaluatePoseJointAngles(pose, frame, { fps, startFrame, speed, seed });
  const faceState = evaluateExpressionFaceState(expression, pose, frame - startFrame, seed, fps);
  const pal = CHARACTER_OUTFIT_PALETTES.nutcracker;
  const flipX = facing === 'left' ? -1 : 1;

  return (
    <svg
      viewBox="0 0 200 280"
      width={200 * scale}
      height={280 * scale}
      className={className}
      style={{ overflow: 'visible', transform: `translate(${x}px, ${y}px)` }}
      data-character="nutcracker-doll"
      data-variant={nutcrackerVariant}
      data-pose={pose}
    >
      <SharedCharacterSvgDefs />

      {/* Ornate wooden pedestal base */}
      <ellipse cx={100 + joints.rootX} cy={264} rx={40} ry={8} fill="#78350F" stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
      <ellipse cx={100 + joints.rootX} cy={261} rx={36} ry={6} fill="#B45309" stroke={SHARED_INK_OUTLINE} strokeWidth={2.5} />

      <g
        transform={`translate(100, 140) scale(${flipX}, 1) translate(-100, -140) translate(${joints.rootX.toFixed(
          2
        )}, ${joints.rootY.toFixed(2)})`}
      >
        {/* ================= SEPARATE PART: BODY ================= */}
        <g
          data-part="body"
          transform={pivotTransform(100, 185, joints.torsoRotate, 0, 0, 1, joints.torsoSquashY)}
        >
          {/* White formal breeches & tall black Hessian boots */}
          <rect x={82} y={182} width={15} height={34} fill="#F8FAFC" stroke={SHARED_INK_OUTLINE} strokeWidth={3} />
          <rect x={103} y={182} width={15} height={34} fill="#F8FAFC" stroke={SHARED_INK_OUTLINE} strokeWidth={3} />
          <rect x={80} y={214} width={18} height={46} rx={3} fill={pal.boots.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          <rect x={102} y={214} width={18} height={46} rx={3} fill={pal.boots.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
          {isHero && (
            <g>
              {/* Gold boot tassels */}
              <circle cx={89} cy={220} r={3.5} fill={pal.goldTrim.base} stroke={SHARED_INK_OUTLINE} strokeWidth={1.8} />
              <circle cx={111} cy={220} r={3.5} fill={pal.goldTrim.base} stroke={SHARED_INK_OUTLINE} strokeWidth={1.8} />
            </g>
          )}

          {/* Back White Beard / Lever */}
          <path d="M 88 118 L 112 118 L 108 164 L 92 164 Z" fill={pal.beard.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />

          {/* Ornate Scarlet Hussar Tunic */}
          <rect
            x={72}
            y={114}
            width={56}
            height={72}
            rx={6}
            fill={pal.uniformRed.base}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.5}
          />
          {/* Cel shadow side */}
          <rect x={74} y={116} width={14} height={68} fill={pal.uniformRed.shadow} />

          {/* Gold Hussar Cross-Braiding & Buttons (Extra Hero Detail) */}
          <line x1={82} y1={126} x2={118} y2={126} stroke={pal.goldTrim.base} strokeWidth={4} strokeLinecap="round" />
          <line x1={82} y1={140} x2={118} y2={140} stroke={pal.goldTrim.base} strokeWidth={4} strokeLinecap="round" />
          <line x1={82} y1={154} x2={118} y2={154} stroke={pal.goldTrim.base} strokeWidth={4} strokeLinecap="round" />
          {isHero && (
            <g>
              <line x1={100} y1={116} x2={100} y2={176} stroke={pal.goldTrim.base} strokeWidth={3} />
              <circle cx={82} cy={126} r={3.5} fill={pal.goldTrim.highlight} stroke={SHARED_INK_OUTLINE} strokeWidth={1.8} />
              <circle cx={118} cy={126} r={3.5} fill={pal.goldTrim.highlight} stroke={SHARED_INK_OUTLINE} strokeWidth={1.8} />
              <circle cx={82} cy={140} r={3.5} fill={pal.goldTrim.highlight} stroke={SHARED_INK_OUTLINE} strokeWidth={1.8} />
              <circle cx={118} cy={140} r={3.5} fill={pal.goldTrim.highlight} stroke={SHARED_INK_OUTLINE} strokeWidth={1.8} />
              <circle cx={82} cy={154} r={3.5} fill={pal.goldTrim.highlight} stroke={SHARED_INK_OUTLINE} strokeWidth={1.8} />
              <circle cx={118} cy={154} r={3.5} fill={pal.goldTrim.highlight} stroke={SHARED_INK_OUTLINE} strokeWidth={1.8} />
              {/* Gold Shoulder Epaulets with fringe */}
              <ellipse cx={70} cy={116} rx={12} ry={6} fill={pal.goldTrim.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
              <ellipse cx={130} cy={116} rx={12} ry={6} fill={pal.goldTrim.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>
          )}

          {/* Belt & Gold Buckle */}
          <rect x={71} y={166} width={58} height={10} fill="#18181B" stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
          <rect x={92} y={164} width={16} height={14} rx={2} fill={pal.goldTrim.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.6} />

          {/* Articulated Wooden Arms */}
          <g data-part="upper-arm-l" transform={pivotTransform(66, 122, joints.shoulderL)}>
            <rect x={58} y={118} width={14} height={52} rx={7} fill={pal.uniformRed.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <rect x={58} y={158} width={14} height={7} fill={pal.goldTrim.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2} />
            <circle cx={65} cy={174} r={7} fill="#F8FAFC" stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
          </g>
          <g data-part="upper-arm-r" transform={pivotTransform(134, 122, joints.shoulderR)}>
            <rect x={128} y={118} width={14} height={52} rx={7} fill={pal.uniformRed.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.2} />
            <rect x={128} y={158} width={14} height={7} fill={pal.goldTrim.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2} />
            <circle cx={135} cy={174} r={7} fill="#F8FAFC" stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
          </g>

          {/* Exposed wooden neck dowel when head pops off */}
          <rect x={94} y={98} width={12} height={18} rx={3} fill={pal.woodSkin.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />

          {/* Gulp throat bulge animation */}
          {joints.throatGulpScale > 0.05 && (
            <ellipse
              cx={100}
              cy={110}
              rx={9 + joints.throatGulpScale * 8}
              ry={6 + joints.throatGulpScale * 6}
              fill={pal.woodSkin.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={2.8}
            />
          )}

          {/* ================= SEPARATE PART: HEAD (Supports Rotation + Detachable Spring Arc) ================= */}
          <g
            data-part="head"
            transform={pivotTransform(
              100,
              102,
              joints.headRotate + joints.headDetachRotate,
              joints.headOffsetX + joints.headDetachX,
              joints.headOffsetY + joints.headDetachY
            )}
          >
            {/* White Wooden Side Hair Curls */}
            <g data-part="hair">
              <circle cx={66} cy={74} r={10} fill={pal.beard.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
              <circle cx={66} cy={88} r={9} fill={pal.beard.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
              <circle cx={134} cy={74} r={10} fill={pal.beard.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
              <circle cx={134} cy={88} r={9} fill={pal.beard.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
            </g>

            {/* Cylindrical Carved Wooden Head */}
            <rect
              x={70}
              y={54}
              width={60}
              height={54}
              rx={14}
              fill={pal.woodSkin.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.5}
            />
            {/* Rosy painted wooden cheeks */}
            <circle cx={79} cy={84} r={6.5} fill="#EF4444" opacity={0.65} />
            <circle cx={121} cy={84} r={6.5} fill="#EF4444" opacity={0.65} />

            {/* Articulated Eyes */}
            <g data-part="eyes">
              <circle cx={86} cy={74} r={8} fill="#FFFFFF" stroke={SHARED_INK_OUTLINE} strokeWidth={2.6} />
              <circle cx={114} cy={74} r={8} fill="#FFFFFF" stroke={SHARED_INK_OUTLINE} strokeWidth={2.6} />
              <circle
                cx={86 + faceState.pupilOffsetX}
                cy={74 + faceState.pupilOffsetY}
                r={4.2 * faceState.pupilScale}
                fill="#090D16"
              />
              <circle
                cx={114 + faceState.pupilOffsetX}
                cy={74 + faceState.pupilOffsetY}
                r={4.2 * faceState.pupilScale}
                fill="#090D16"
              />
              <circle cx={84.5 + faceState.pupilOffsetX} cy={72 + faceState.pupilOffsetY} r={1.6} fill="#FFFFFF" />
              <circle cx={112.5 + faceState.pupilOffsetX} cy={72 + faceState.pupilOffsetY} r={1.6} fill="#FFFFFF" />
            </g>

            {/* Bold Painted Eyebrows & Carved Wooden Nose */}
            <g data-part="brows">
              <path d="M 76 62 Q 86 57 94 63" fill="none" stroke="#090D16" strokeWidth={4} strokeLinecap="round" />
              <path d="M 106 63 Q 114 57 124 62" fill="none" stroke="#090D16" strokeWidth={4} strokeLinecap="round" />
            </g>
            <polygon points="100,68 95,83 105,83" fill={pal.woodSkin.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.5} />

            {/* Curled Imperial Mustache */}
            <path
              d="M 100 87 Q 84 82 72 91 Q 84 96 100 90 Q 116 96 128 91 Q 116 82 100 87 Z"
              fill={pal.beard.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={2.6}
            />

            {/* ================= SEPARATE PART: CHUNKY ARTICULATED JAW ================= */}
            <g
              data-part="jaw"
              transform={`translate(0, ${Math.min(28, joints.jawDropPx + faceState.jawDropExtraPx * 0.4).toFixed(2)})`}
            >
              {/* Dark mouth slot behind jaw */}
              <rect x={85} y={90} width={30} height={18} fill="#450A0A" stroke={SHARED_INK_OUTLINE} strokeWidth={2.4} />
              {/* Upper & Lower Wooden Teeth */}
              <rect x={87} y={91} width={26} height={6} fill="#FFFFFF" stroke={SHARED_INK_OUTLINE} strokeWidth={2} />
              <line x1={93.5} y1={91} x2={93.5} y2={97} stroke={SHARED_INK_OUTLINE} strokeWidth={1.8} />
              <line x1={100} y1={91} x2={100} y2={97} stroke={SHARED_INK_OUTLINE} strokeWidth={1.8} />
              <line x1={106.5} y1={91} x2={106.5} y2={97} stroke={SHARED_INK_OUTLINE} strokeWidth={1.8} />

              {/* Chunky hinged chin block + long white beard */}
              <rect
                x={84}
                y={99}
                width={32}
                height={14}
                rx={3}
                fill={pal.woodSkin.base}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={3}
              />
              <rect x={87} y={97} width={26} height={5} fill="#FFFFFF" stroke={SHARED_INK_OUTLINE} strokeWidth={1.8} />
              <path
                d="M 85 111 L 115 111 L 109 144 Q 100 152 91 144 Z"
                fill={pal.beard.base}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={3}
              />
            </g>

            {/* ================= SEPARATE PART: TALL HUSSAR SHAKO HAT ================= */}
            <g
              data-part="hat"
              transform={pivotTransform(100, 54, joints.hatTasselSwing * 0.18)}
            >
              {/* Shako cylinder */}
              <path
                d="M 66 56 L 62 12 Q 100 4 138 12 L 134 56 Z"
                fill={pal.shakoHat.base}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={3.5}
                strokeLinejoin="round"
              />
              {/* Glossy visor brim */}
              <path
                d="M 64 54 Q 100 64 136 54 Q 100 48 64 54 Z"
                fill={pal.shakoHat.highlight}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={3}
              />
              {/* Gold chain & starburst badge */}
              <path d="M 66 44 Q 100 56 134 44" fill="none" stroke={pal.goldTrim.base} strokeWidth={3.5} />
              <circle cx={100} cy={32} r={9} fill={pal.goldTrim.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.6} />
              {isHero && (
                <g>
                  <circle cx={100} cy={32} r={4} fill="#EF4444" />
                  {/* Feather plume with secondary tassel swing */}
                  <g transform={pivotTransform(100, 12, joints.hatTasselSwing)}>
                    <ellipse
                      cx={100}
                      cy={-2}
                      rx={8}
                      ry={14}
                      fill="#EF4444"
                      stroke={SHARED_INK_OUTLINE}
                      strokeWidth={2.8}
                    />
                    <ellipse cx={100} cy={-4} rx={4} ry={8} fill="#FEF08A" />
                  </g>
                </g>
              )}
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
});

/**
 * Helper rendering 3 to 6 Shop-Window Nutcracker Dolls in a row
 */
export const NutcrackerShopWindowRow = memo(function NutcrackerShopWindowRow({
  count = 4,
  scale = 0.52,
}: {
  count?: number;
  scale?: number;
}) {
  const safeCount = Math.max(3, Math.min(6, count));
  const animations = ['head-rotation', 'eye-movement', 'gulp', 'trembling'] as const;
  return (
    <div
      className="flex items-end justify-center gap-3"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 12,
      }}
      data-component="nutcracker-shop-window-row"
    >
      {Array.from({ length: safeCount }).map((_, idx) => (
        <NutcrackerDollRig
          key={idx}
          nutcrackerVariant="shop-window"
          pose={animations[idx % animations.length]}
          scale={scale}
          seed={`shop-window-nutcracker-${idx}`}
          startFrame={idx * 9}
        />
      ))}
    </div>
  );
});

/**
 * 9. MALE DOG
 * - Animations: `idle`, `tail-tuck`, `startled-expression`, `bolt-away-run`.
 * - Articulated head, floppy ears, jaw, torso, 4 legs, and expressive tail.
 */
export const MaleDogRig = memo(function MaleDogRig({
  pose = 'idle',
  expression = 'happy',
  facing = 'right',
  scale = 1,
  seed = 'male-dog',
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
  const isStartled = pose === 'startled-expression' || expression === 'startled' || pose === 'bolt-away-run';
  const pal = CHARACTER_OUTFIT_PALETTES.maleDog;
  const flipX = facing === 'left' ? -1 : 1;

  return (
    <svg
      viewBox="0 0 220 200"
      width={220 * scale}
      height={200 * scale}
      className={className}
      style={{ overflow: 'visible', transform: `translate(${x}px, ${y}px)` }}
      data-character="male-dog"
      data-pose={pose}
    >
      <SharedCharacterSvgDefs />
      <ellipse cx={110 + joints.rootX} cy={182} rx={48} ry={7} fill="#090D16" opacity={0.26} />

      <g
        transform={`translate(110, 120) scale(${flipX}, 1) translate(-110, -120) translate(${joints.rootX.toFixed(
          2
        )}, ${joints.rootY.toFixed(2)})`}
      >
        <g data-part="torso" transform={pivotTransform(105, 130, joints.torsoRotate)}>
          {/* Articulated Tail (wags in idle, tucks under belly in `tail-tuck`) */}
          <g data-part="tail" transform={pivotTransform(64, 118, joints.tailWag)}>
            <path
              d="M 66 120 Q 38 96 44 78 Q 54 84 68 114 Z"
              fill={pal.coat.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.2}
              strokeLinejoin="round"
            />
          </g>

          {/* Back Legs */}
          <g data-part="upper-leg-l" transform={pivotTransform(74, 138, joints.hipL)}>
            <rect x={67} y={134} width={14} height={42} rx={7} fill={pal.coat.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3} />
            <ellipse cx={76} cy={176} rx={10} ry={5.5} fill={pal.coat.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
          </g>
          <g data-part="lower-arm-l" transform={pivotTransform(124, 138, -joints.hipL)}>
            <rect x={117} y={134} width={13} height={42} rx={6.5} fill={pal.coat.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3} />
            <ellipse cx={126} cy={176} rx={10} ry={5.5} fill={pal.coat.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
          </g>

          {/* Dog Body & Cream Belly Patch */}
          <path
            d="M 62 114 Q 102 102 140 112 Q 150 132 136 146 Q 100 150 66 144 Q 54 130 62 114 Z"
            fill={pal.coat.base}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.4}
          />
          <path d="M 78 143 Q 106 134 132 142 Q 104 148 78 143 Z" fill={pal.belly.base} />

          {/* Front Legs */}
          <g data-part="upper-leg-r" transform={pivotTransform(82, 140, joints.hipR)}>
            <rect x={75} y={136} width={14} height={42} rx={7} fill={pal.coat.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.1} />
            <ellipse cx={84} cy={178} rx={10} ry={5.5} fill={pal.belly.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
          </g>
          <g data-part="upper-arm-r" transform={pivotTransform(134, 140, -joints.hipR)}>
            <rect x={127} y={136} width={14} height={42} rx={7} fill={pal.coat.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.1} />
            <ellipse cx={136} cy={178} rx={10} ry={5.5} fill={pal.belly.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.8} />
          </g>

          {/* Red Collar & Gold Dog Tag */}
          <path d="M 126 102 L 146 118" stroke={pal.collar.base} strokeWidth={8} strokeLinecap="round" />
          <circle cx={143} cy={123} r={5.5} fill={pal.tag.base} stroke={SHARED_INK_OUTLINE} strokeWidth={2.2} />

          {/* Dog Head, Snout, Ears & Eyes */}
          <g data-part="head" transform={pivotTransform(138, 102, joints.headRotate)}>
            <circle cx={144} cy={88} r={24} fill={pal.coat.base} stroke={SHARED_INK_OUTLINE} strokeWidth={3.4} />
            {/* Snout */}
            <path
              d="M 156 80 L 186 84 Q 192 94 182 102 L 154 102 Z"
              fill={pal.belly.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3.2}
            />
            {/* Black wet nose */}
            <ellipse cx={185} cy={86} rx={6.5} ry={5} fill="#090D16" />
            <circle cx={183.5} cy={84.5} r={1.8} fill="#FFFFFF" />

            {/* Articulated Jaw / Panting Tongue */}
            <g data-part="mouth" transform={pivotTransform(158, 98, joints.jawDropPx * 1.2)}>
              <path
                d="M 156 98 L 178 100 Q 174 108 156 104 Z"
                fill={pal.coat.shadow}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={2.6}
              />
              {pose === 'idle' && (
                <path d="M 166 101 Q 170 115 162 114 Q 158 110 162 101 Z" fill="#FB7185" stroke={SHARED_INK_OUTLINE} strokeWidth={2} />
              )}
            </g>

            {/* Expressive Dog Eyes (huge wide eyes when startled!) */}
            <g data-part="eyes">
              <circle
                cx={152}
                cy={78}
                r={isStartled ? 9.5 : 6.5}
                fill="#FFFFFF"
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={2.6}
              />
              <circle cx={154} cy={78} r={isStartled ? 3.2 : 4} fill="#090D16" />
              <circle cx={152.5} cy={76.5} r={1.4} fill="#FFFFFF" />
            </g>

            {/* Articulated Floppy Ear (shoots straight up when startled!) */}
            <g data-part="ears" transform={pivotTransform(134, 72, joints.earFlop)}>
              <path
                d="M 134 70 Q 116 84 122 108 Q 134 112 138 92 Z"
                fill={pal.ears.base}
                stroke={SHARED_INK_OUTLINE}
                strokeWidth={3.2}
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
});

/**
 * 10. PIGEON
 * - Animations: `perch`, `head-turn`, `wing-flap`, `takeoff`.
 * - Iridescent neck ring, articulated wings, head, beak, and orange feet.
 */
export const PigeonRig = memo(function PigeonRig({
  pose = 'perch',
  facing = 'right',
  scale = 1,
  seed = 'city-pigeon',
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
  const pal = CHARACTER_OUTFIT_PALETTES.pigeon;
  const flipX = facing === 'left' ? -1 : 1;

  return (
    <svg
      viewBox="0 0 140 140"
      width={140 * scale}
      height={140 * scale}
      className={className}
      style={{ overflow: 'visible', transform: `translate(${x}px, ${y}px)` }}
      data-character="pigeon"
      data-pose={pose}
    >
      <SharedCharacterSvgDefs />
      <ellipse cx={70 + joints.rootX * 0.3} cy={124} rx={22} ry={4.5} fill="#090D16" opacity={0.24} />

      <g
        transform={`translate(70, 80) scale(${flipX}, 1) translate(-70, -80) translate(${joints.rootX.toFixed(
          2
        )}, ${joints.rootY.toFixed(2)})`}
      >
        <g data-part="torso" transform={pivotTransform(70, 88, joints.torsoRotate)}>
          {/* Back Wing */}
          <g data-part="upper-arm-l" transform={pivotTransform(66, 78, -joints.wingFlapDeg * 0.85)}>
            <path
              d="M 66 76 Q 38 62 34 86 Q 48 94 68 88 Z"
              fill={pal.wing.shadow}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={2.8}
            />
          </g>

          {/* Orange Pigeon Legs & Claws */}
          <g data-part="upper-leg-l">
            <line x1={64} y1={100} x2={62} y2={120} stroke={pal.beakAndFeet.base} strokeWidth={3.2} strokeLinecap="round" />
            <path d="M 56 120 L 68 120" stroke={pal.beakAndFeet.base} strokeWidth={3} strokeLinecap="round" />
          </g>
          <g data-part="upper-leg-r">
            <line x1={76} y1={100} x2={76} y2={120} stroke={pal.beakAndFeet.base} strokeWidth={3.2} strokeLinecap="round" />
            <path d="M 70 120 L 82 120" stroke={pal.beakAndFeet.base} strokeWidth={3} strokeLinecap="round" />
          </g>

          {/* Plump Pigeon Body & Tail Feathers */}
          <path
            d="M 46 92 L 26 98 L 32 106 L 54 100 Z"
            fill={pal.wing.shadow}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={2.8}
          />
          <path
            d="M 48 82 Q 66 64 88 72 Q 98 88 84 102 Q 62 106 48 94 Z"
            fill={pal.body.base}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.2}
          />
          {/* Iridescent emerald-teal neck band */}
          <path
            d="M 74 66 Q 84 72 90 66 Q 88 78 72 76 Z"
            fill={pal.iridescentNeck.base}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={2.2}
          />

          {/* Articulated Head & Beak */}
          <g
            data-part="head"
            transform={pivotTransform(82, 62, joints.headRotate, joints.headOffsetX, 0)}
          >
            <circle cx={82} cy={56} r={13} fill={pal.body.shadow} stroke={SHARED_INK_OUTLINE} strokeWidth={3} />
            {/* Golden-orange pigeon eye */}
            <circle cx={86} cy={54} r={4.5} fill="#FB923C" stroke={SHARED_INK_OUTLINE} strokeWidth={2} />
            <circle cx={86.5} cy={54} r={2} fill="#090D16" />
            <circle cx={85.8} cy={53} r={0.9} fill="#FFFFFF" />
            {/* Beak + white cere */}
            <polygon points="94,53 107,57 94,61" fill="#FACC15" stroke={SHARED_INK_OUTLINE} strokeWidth={2.4} />
            <ellipse cx={94} cy={54} rx={2.5} ry={2} fill="#F8FAFC" />
          </g>

          {/* Front Articulated Wing with double black wing-bars */}
          <g data-part="upper-arm-r" transform={pivotTransform(68, 80, joints.wingFlapDeg)}>
            <path
              d="M 72 78 Q 42 74 38 94 Q 56 100 76 90 Z"
              fill={pal.wing.base}
              stroke={SHARED_INK_OUTLINE}
              strokeWidth={3}
            />
            <line x1={52} y1={82} x2={48} y2={93} stroke="#090D16" strokeWidth={3} strokeLinecap="round" />
            <line x1={60} y1={81} x2={56} y2={93} stroke="#090D16" strokeWidth={3} strokeLinecap="round" />
          </g>
        </g>
      </g>
    </svg>
  );
});
