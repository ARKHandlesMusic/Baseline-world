'use client';

import React, { memo } from 'react';
import { SHARED_INK_OUTLINE, type CelColorTriplet } from '../../../lib/omniframe/characters/palette';
import {
  pivotTransform,
  type BrowStateId,
  type EyeStateId,
  type FaceStateEvaluation,
  type MouthShapeId,
} from '../../../lib/omniframe/characters/rig-utils';

/**
 * Shared SVG <defs> for cel-shading gradients, soot overlays, OLED glow, and crisp drop shadows.
 * Memoized for high performance across crowd instances.
 */
export const SharedCharacterSvgDefs = memo(function SharedCharacterSvgDefs() {
  return (
    <defs>
      <filter id="omniframe-char-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#090D16" floodOpacity="0.38" />
      </filter>
      <filter id="omniframe-oled-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <radialGradient id="omniframe-soot-grad" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#18181B" stopOpacity="0.82" />
        <stop offset="65%" stopColor="#27272A" stopOpacity="0.58" />
        <stop offset="100%" stopColor="#27272A" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="omniframe-sunglasses-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0F172A" />
        <stop offset="48%" stopColor="#1E293B" />
        <stop offset="52%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#090D16" />
      </linearGradient>
      <linearGradient id="omniframe-gold-trim" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#FACC15" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
    </defs>
  );
});

export interface FaceSystemProps {
  faceState: FaceStateEvaluation;
  skin: CelColorTriplet;
  headCenterX?: number;
  headCenterY?: number;
  sunglasses?: boolean;
  jawDropOverridePx?: number;
}

function renderEye(
  cx: number,
  cy: number,
  eyeState: EyeStateId,
  isBlinking: boolean,
  blinkAmount01: number,
  pupilX: number,
  pupilY: number,
  pupilScale: number,
  skin: CelColorTriplet
) {
  if (isBlinking || eyeState === 'blink' || blinkAmount01 > 0.75) {
    return (
      <g>
        <path
          d={`M ${cx - 8} ${cy} Q ${cx} ${cy + 4} ${cx + 8} ${cy}`}
          fill="none"
          stroke={SHARED_INK_OUTLINE}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>
    );
  }

  const rx = eyeState === 'wide' ? 8.5 : 7.5;
  const ry = eyeState === 'wide' ? 10 : eyeState === 'squint' ? 5.2 : 8.2;

  return (
    <g>
      {/* Sclera */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="#FFFFFF"
        stroke={SHARED_INK_OUTLINE}
        strokeWidth={2.5}
      />
      {/* Pupil + Iris */}
      <g transform={`translate(${pupilX.toFixed(2)}, ${pupilY.toFixed(2)})`}>
        <circle
          cx={cx + 1}
          cy={cy}
          r={4.1 * pupilScale}
          fill={SHARED_INK_OUTLINE}
        />
        {/* Specular highlight */}
        <circle
          cx={cx - 0.8}
          cy={cy - 2}
          r={1.6 * Math.max(0.75, pupilScale)}
          fill="#FFFFFF"
        />
        <circle
          cx={cx + 2.2}
          cy={cy + 1.8}
          r={0.85}
          fill="#FFFFFF"
        />
      </g>

      {/* Half-lid or squint eyelid mask */}
      {(eyeState === 'half-lid' || eyeState === 'squint' || blinkAmount01 > 0.1) && (
        <path
          d={`M ${cx - rx - 1} ${cy - ry - 1} L ${cx + rx + 1} ${cy - ry - 1} L ${cx + rx + 1} ${
            cy - ry + (eyeState === 'half-lid' ? ry * 0.95 : ry * 0.65 + blinkAmount01 * ry)
          } L ${cx - rx - 1} ${
            cy - ry + (eyeState === 'half-lid' ? ry * 0.95 : ry * 0.65 + blinkAmount01 * ry)
          } Z`}
          fill={skin.shadow}
          stroke={SHARED_INK_OUTLINE}
          strokeWidth={2.2}
        />
      )}

      {/* Lower squint lid */}
      {eyeState === 'squint' && (
        <path
          d={`M ${cx - rx} ${cy + ry * 0.45} Q ${cx} ${cy + ry * 0.2} ${cx + rx} ${cy + ry * 0.45}`}
          fill="none"
          stroke={SHARED_INK_OUTLINE}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

function renderBrows(cx: number, cy: number, browState: BrowStateId) {
  const leftX = cx - 12;
  const rightX = cx + 12;
  const baseY = cy - 13;

  let leftAngle = 0;
  let rightAngle = 0;
  let leftY = baseY;
  let rightY = baseY;

  switch (browState) {
    case 'raised':
      leftY -= 3.5;
      rightY -= 3.5;
      leftAngle = -8;
      rightAngle = 8;
      break;
    case 'furrowed':
      leftY += 2;
      rightY += 2;
      leftAngle = 18;
      rightAngle = -18;
      break;
    case 'worried':
      leftY -= 2;
      rightY -= 2;
      leftAngle = -18;
      rightAngle = 18;
      break;
    case 'asymmetric':
      leftY -= 5;
      rightY += 1.5;
      leftAngle = -14;
      rightAngle = -10;
      break;
    case 'shocked-high':
      leftY -= 7.5;
      rightY -= 7.5;
      leftAngle = -12;
      rightAngle = 12;
      break;
    case 'neutral':
    default:
      break;
  }

  return (
    <g>
      <path
        d={`M ${leftX - 7} ${leftY} Q ${leftX} ${leftY - 3} ${leftX + 7} ${leftY}`}
        transform={pivotTransform(leftX, leftY, leftAngle)}
        fill="none"
        stroke={SHARED_INK_OUTLINE}
        strokeWidth={3.2}
        strokeLinecap="round"
      />
      <path
        d={`M ${rightX - 7} ${rightY} Q ${rightX} ${rightY - 3} ${rightX + 7} ${rightY}`}
        transform={pivotTransform(rightX, rightY, rightAngle)}
        fill="none"
        stroke={SHARED_INK_OUTLINE}
        strokeWidth={3.2}
        strokeLinecap="round"
      />
    </g>
  );
}

function renderMouth(
  cx: number,
  cy: number,
  mouthShape: MouthShapeId,
  jawDropTotalPx: number,
  skin: CelColorTriplet
) {
  if (mouthShape === 'jaw-drop' || jawDropTotalPx > 10) {
    const drop = Math.max(18, jawDropTotalPx);
    return (
      <g>
        {/* Elongated cartoon dropped jaw extension */}
        <path
          d={`M ${cx - 12} ${cy - 2} L ${cx - 10} ${cy + drop} Q ${cx} ${cy + drop + 12} ${cx + 10} ${cy + drop} L ${cx + 12} ${cy - 2} Z`}
          fill={skin.base}
          stroke={SHARED_INK_OUTLINE}
          strokeWidth={2.8}
        />
        {/* Cavernous open mouth interior */}
        <path
          d={`M ${cx - 9} ${cy} L ${cx - 8} ${cy + drop - 2} Q ${cx} ${cy + drop + 7} ${cx + 8} ${cy + drop - 2} L ${cx + 9} ${cy} Z`}
          fill="#7F1D1D"
          stroke={SHARED_INK_OUTLINE}
          strokeWidth={2.4}
        />
        {/* Upper teeth row */}
        <rect
          x={cx - 8}
          y={cy}
          width={16}
          height={4.5}
          rx={1.5}
          fill="#FFFFFF"
          stroke={SHARED_INK_OUTLINE}
          strokeWidth={1.6}
        />
        {/* Vibrating cartoon uvula / tongue */}
        <ellipse
          cx={cx}
          cy={cy + drop - 3}
          rx={6}
          ry={4}
          fill="#F87171"
        />
      </g>
    );
  }

  switch (mouthShape) {
    case 'smile':
      return (
        <g>
          <path
            d={`M ${cx - 10} ${cy - 1} Q ${cx} ${cy + 11} ${cx + 10} ${cy - 1} Z`}
            fill="#991B1B"
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <path
            d={`M ${cx - 8} ${cy} L ${cx + 8} ${cy} L ${cx + 7} ${cy + 3.2} L ${cx - 7} ${cy + 3.2} Z`}
            fill="#FFFFFF"
          />
          <path
            d={`M ${cx - 5} ${cy + 5.5} Q ${cx} ${cy + 3.5} ${cx + 5} ${cy + 5.5}`}
            fill="#F87171"
          />
        </g>
      );

    case 'frown':
      return (
        <path
          d={`M ${cx - 9} ${cy + 5} Q ${cx} ${cy - 3} ${cx + 9} ${cy + 5}`}
          fill="none"
          stroke={SHARED_INK_OUTLINE}
          strokeWidth={2.8}
          strokeLinecap="round"
        />
      );

    case 'o-mouth':
      return (
        <g>
          <ellipse
            cx={cx}
            cy={cy + 3}
            rx={6.5}
            ry={8}
            fill="#7F1D1D"
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={2.6}
          />
          <ellipse cx={cx} cy={cy + 7} rx={4} ry={2.5} fill="#F87171" />
        </g>
      );

    case 'gritted-teeth':
      return (
        <g>
          <rect
            x={cx - 11}
            y={cy - 2}
            width={22}
            height={8.5}
            rx={4}
            fill="#FFFFFF"
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={2.5}
          />
          <line
            x1={cx - 10}
            y1={cy + 2.2}
            x2={cx + 10}
            y2={cy + 2.2}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={1.8}
          />
          <line x1={cx - 5} y1={cy - 2} x2={cx - 5} y2={cy + 6.5} stroke={SHARED_INK_OUTLINE} strokeWidth={1.6} />
          <line x1={cx} y1={cy - 2} x2={cx} y2={cy + 6.5} stroke={SHARED_INK_OUTLINE} strokeWidth={1.6} />
          <line x1={cx + 5} y1={cy - 2} x2={cx + 5} y2={cy + 6.5} stroke={SHARED_INK_OUTLINE} strokeWidth={1.6} />
        </g>
      );

    case 'gulp':
      return (
        <g>
          <path
            d={`M ${cx - 7} ${cy + 2} Q ${cx - 3.5} ${cy - 1} ${cx} ${cy + 2} T ${cx + 7} ${cy + 2}`}
            fill="none"
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          {/* Throat gulp bulge */}
          <circle
            cx={cx}
            cy={cy + 14}
            r={3.5}
            fill={skin.shadow}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={1.8}
          />
        </g>
      );

    case 'flat-line':
    default:
      return (
        <line
          x1={cx - 8}
          y1={cy + 2}
          x2={cx + 8}
          y2={cy + 2}
          stroke={SHARED_INK_OUTLINE}
          strokeWidth={2.8}
          strokeLinecap="round"
        />
      );
  }
}

/**
 * Shared Face System component used across all humanoid characters.
 * Supports independent eyes, eyebrows, mouth shapes, automatic seeded blinking,
 * soot-covered explosion aftermath, sweat drops, and toggleable sunglasses.
 */
export const FaceSystem = memo(function FaceSystem({
  faceState,
  skin,
  headCenterX = 100,
  headCenterY = 76,
  sunglasses = false,
  jawDropOverridePx = 0,
}: FaceSystemProps) {
  const totalJawDrop = Math.max(faceState.jawDropExtraPx, jawDropOverridePx);

  return (
    <g data-part="face-system">
      {/* Optional Soot-Covered blast smudge overlay */}
      {faceState.sootCovered && (
        <g data-part="soot-overlay">
          <ellipse
            cx={headCenterX}
            cy={headCenterY + 2}
            rx={26}
            ry={24}
            fill="url(#omniframe-soot-grad)"
          />
          <path
            d={`M ${headCenterX - 18} ${headCenterY - 12} Q ${headCenterX - 8} ${headCenterY - 18} ${headCenterX - 4} ${headCenterY - 8}`}
            stroke="#18181B"
            strokeWidth={3.5}
            strokeLinecap="round"
            opacity={0.75}
          />
          <path
            d={`M ${headCenterX + 8} ${headCenterY + 10} Q ${headCenterX + 18} ${headCenterY + 6} ${headCenterX + 15} ${headCenterY + 16}`}
            stroke="#18181B"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.7}
          />
        </g>
      )}

      {/* Cheek Blush */}
      {faceState.blush && (
        <g opacity={0.55}>
          <ellipse cx={headCenterX - 16} cy={headCenterY + 6} rx={5.5} ry={3} fill="#FB7185" />
          <ellipse cx={headCenterX + 16} cy={headCenterY + 6} rx={5.5} ry={3} fill="#FB7185" />
        </g>
      )}

      {/* Left & Right Independent Eyes */}
      <g data-part="eyes">
        {renderEye(
          headCenterX - 11.5,
          headCenterY - 2,
          faceState.eyeState,
          faceState.isBlinking,
          faceState.blinkAmount01,
          faceState.pupilOffsetX,
          faceState.pupilOffsetY,
          faceState.pupilScale,
          skin
        )}
        {renderEye(
          headCenterX + 11.5,
          headCenterY - 2,
          faceState.eyeState,
          faceState.isBlinking,
          faceState.blinkAmount01,
          faceState.pupilOffsetX,
          faceState.pupilOffsetY,
          faceState.pupilScale,
          skin
        )}
      </g>

      {/* Nose */}
      <path
        d={`M ${headCenterX + 1} ${headCenterY - 1} L ${headCenterX + 4.5} ${headCenterY + 4.5} L ${headCenterX} ${headCenterY + 5.5}`}
        fill={skin.shadow}
        stroke={SHARED_INK_OUTLINE}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Eyebrows */}
      <g data-part="brows">{renderBrows(headCenterX, headCenterY, faceState.browState)}</g>

      {/* Sunglasses Accessory (Next-Day Scene Toggle) */}
      {sunglasses && (
        <g data-part="accessory-sunglasses">
          {/* Temple arms */}
          <line
            x1={headCenterX - 27}
            y1={headCenterY - 5}
            x2={headCenterX + 27}
            y2={headCenterY - 5}
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={3.5}
          />
          {/* Left lens */}
          <rect
            x={headCenterX - 23}
            y={headCenterY - 10}
            width={20}
            height={13}
            rx={3.5}
            fill="url(#omniframe-sunglasses-grad)"
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={2.8}
          />
          {/* Right lens */}
          <rect
            x={headCenterX + 3}
            y={headCenterY - 10}
            width={20}
            height={13}
            rx={3.5}
            fill="url(#omniframe-sunglasses-grad)"
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={2.8}
          />
          {/* Diagonal lens sheen */}
          <line
            x1={headCenterX - 19}
            y1={headCenterY - 7}
            x2={headCenterX - 13}
            y2={headCenterY + 1}
            stroke="#E0F2FE"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={headCenterX + 7}
            y1={headCenterY - 7}
            x2={headCenterX + 13}
            y2={headCenterY + 1}
            stroke="#E0F2FE"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Mouth / Jaw */}
      <g data-part="mouth">
        {renderMouth(headCenterX, headCenterY + 12, faceState.mouthShape, totalJawDrop, skin)}
      </g>

      {/* Nervous / Terrified Sweat Drops */}
      {faceState.sweatDrops && (
        <g data-part="sweat-drops">
          <path
            d={`M ${headCenterX - 24} ${headCenterY - 12} C ${headCenterX - 27} ${headCenterY - 5}, ${headCenterX - 21} ${headCenterY - 5}, ${headCenterX - 24} ${headCenterY - 12} Z`}
            fill="#38BDF8"
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={1.8}
          />
          <path
            d={`M ${headCenterX + 25} ${headCenterY - 6} C ${headCenterX + 22} ${headCenterY + 1}, ${headCenterX + 28} ${headCenterY + 1}, ${headCenterX + 25} ${headCenterY - 6} Z`}
            fill="#38BDF8"
            stroke={SHARED_INK_OUTLINE}
            strokeWidth={1.8}
          />
        </g>
      )}
    </g>
  );
});
