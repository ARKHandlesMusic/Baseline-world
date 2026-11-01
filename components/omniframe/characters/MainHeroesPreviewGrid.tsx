'use client';

import React, { memo } from 'react';
import {
  type MainBoyAnimation,
  type MainBoyExpression,
  type MainGirlAnimation,
  type MainGirlExpression,
} from '../../../lib/omniframe/characters/rig-utils';
import { MainBoyRig } from './MainBoyRig';
import { MainGirlRig } from './MainGirlRig';

const MAIN_BOY_EXPRESSIONS: readonly MainBoyExpression[] = [
  'happy',
  'nervous',
  'terrified',
  'determined',
  'shocked',
  'guilty',
];

const MAIN_BOY_ANIMATIONS: readonly MainBoyAnimation[] = [
  'walk',
  'hand-holding-walk',
  'sprint',
  'point',
  'salute',
  'dance',
  'freeze',
  'mouth-drop',
];

const MAIN_GIRL_EXPRESSIONS: readonly MainGirlExpression[] = [
  'happy',
  'confused',
  'neutral',
  'soot-covered',
];

const MAIN_GIRL_ANIMATIONS: readonly MainGirlAnimation[] = [
  'walk',
  'point-at-shop',
  'shrug',
  'browse-shelves',
  'walk-out-of-rubble',
  'hand-holding',
  'holding-christmas-doll',
];

/**
 * Phase 2 Deliverable: Preview Labeled Grid showing every single Pose/Animation and Expression
 * for Main Boy (with Sunglasses toggle) and Main Girl, calibrated for 4K (3840x2160) Remotion Studio.
 */
export const MainHeroesPreviewGrid = memo(function MainHeroesPreviewGrid({
  sunglasses = false,
}: {
  sunglasses?: boolean;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#070B19',
        color: '#F8FAFC',
        padding: '28px 36px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 32,
          height: '100%',
        }}
      >
        {/* MAIN BOY SECTION */}
        <div
          style={{
            borderRadius: 24,
            border: '3px solid #38BDF8',
            background: 'rgba(15, 23, 42, 0.94)',
            padding: '22px 26px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <h3
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: '#38BDF8',
                margin: 0,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              1. Main Boy — All 8 Animations &amp; 6 Expressions
            </h3>
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#FACC15',
                background: 'rgba(250, 204, 21, 0.14)',
                border: '2px solid #FACC15',
                padding: '6px 14px',
                borderRadius: 10,
              }}
            >
              Sunglasses: {sunglasses ? 'ON (Next-Day)' : 'OFF'}
            </span>
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#94A3B8',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Animations (8/8)
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              marginBottom: 18,
            }}
          >
            {MAIN_BOY_ANIMATIONS.map((anim, i) => (
              <div
                key={anim}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 16,
                  border: '2px solid #1E293B',
                  background: '#090D16',
                  padding: '10px 8px',
                }}
              >
                <MainBoyRig
                  pose={anim}
                  expression={anim === 'mouth-drop' ? 'shocked' : 'happy'}
                  scale={1.08}
                  sunglasses={sunglasses || i === 7}
                  seed={`boy-anim-${anim}`}
                />
                <span
                  style={{
                    marginTop: 6,
                    fontSize: 20,
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: '#38BDF8',
                    textAlign: 'center',
                  }}
                >
                  {anim}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#94A3B8',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Expressions (6/6)
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 12,
            }}
          >
            {MAIN_BOY_EXPRESSIONS.map((expr) => (
              <div
                key={expr}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 14,
                  border: '2px solid #1E293B',
                  background: '#090D16',
                  padding: '8px 6px',
                }}
              >
                <MainBoyRig
                  pose="idle"
                  expression={expr}
                  scale={0.92}
                  sunglasses={sunglasses}
                  seed={`boy-expr-${expr}`}
                />
                <span
                  style={{
                    marginTop: 4,
                    fontSize: 19,
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: '#FACC15',
                    textAlign: 'center',
                  }}
                >
                  {expr}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN GIRL SECTION */}
        <div
          style={{
            borderRadius: 24,
            border: '3px solid #FB7185',
            background: 'rgba(15, 23, 42, 0.94)',
            padding: '22px 26px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <h3
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: '#FB7185',
                margin: 0,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              2. Main Girl — All 7 Animations/Poses &amp; 4 Expressions
            </h3>
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#F43F5E',
                background: 'rgba(244, 63, 94, 0.14)',
                border: '2px solid #FB7185',
                padding: '6px 14px',
                borderRadius: 10,
              }}
            >
              Hero Layered SVG Rig
            </span>
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#94A3B8',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Animations &amp; Poses (7/7)
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              marginBottom: 18,
            }}
          >
            {MAIN_GIRL_ANIMATIONS.map((anim) => (
              <div
                key={anim}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 16,
                  border: '2px solid #1E293B',
                  background: '#090D16',
                  padding: '10px 8px',
                }}
              >
                <MainGirlRig
                  pose={anim}
                  expression={
                    anim === 'walk-out-of-rubble' ? 'soot-covered' : 'happy'
                  }
                  scale={1.08}
                  seed={`girl-anim-${anim}`}
                />
                <span
                  style={{
                    marginTop: 6,
                    fontSize: 20,
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: '#FB7185',
                    textAlign: 'center',
                  }}
                >
                  {anim}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#94A3B8',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Expressions (4/4)
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
            }}
          >
            {MAIN_GIRL_EXPRESSIONS.map((expr) => (
              <div
                key={expr}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 16,
                  border: '2px solid #1E293B',
                  background: '#090D16',
                  padding: '10px 8px',
                }}
              >
                <MainGirlRig
                  pose="idle"
                  expression={expr}
                  scale={1.02}
                  seed={`girl-expr-${expr}`}
                />
                <span
                  style={{
                    marginTop: 4,
                    fontSize: 20,
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: '#34D399',
                    textAlign: 'center',
                  }}
                >
                  {expr}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
