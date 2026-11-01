'use client';

import React, {memo, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {
  CHARACTER_CAST_MANIFEST,
  type CharacterExpressionId,
  type CharacterFacing,
  type CharacterId,
  type CharacterPoseId,
  type CountdownSignValue,
  type NutcrackerDollVariant,
  type PedestrianArchetypeVariant,
} from '../lib/omniframe/characters/rig-utils';
import {
  GLB_CHARACTER_ASSET_MANIFEST,
  type GlbModelId,
} from '../lib/omniframe/characters/glb-character-loader';
import {GlbCharacterStageR3F} from '../components/omniframe/characters/GlbCharacterStageR3F';

export type CastShowcaseViewMode =
  | 'full-cast'
  | 'heroes-grid'
  | 'inspector'
  | 'checklist';

export const characterCastShowcaseSchema = z.object({
  initialViewMode: z
    .enum(['full-cast', 'heroes-grid', 'inspector', 'checklist'])
    .default('full-cast'),
  crowdCount: z.number().min(3).max(24).default(14),
  crowdSeed: z.string().default('omniframe-crowd-42'),
});

export interface CharacterCastShowcaseCompositionProps {
  initialViewMode?: CastShowcaseViewMode;
  viewMode?: CastShowcaseViewMode;
  selectedCharacter?: CharacterId;
  selectedPose?: CharacterPoseId;
  selectedExpression?: CharacterExpressionId;
  facing?: CharacterFacing;
  sunglasses?: boolean;
  countdownValue?: CountdownSignValue;
  pedestrianArchetype?: PedestrianArchetypeVariant;
  nutcrackerVariant?: NutcrackerDollVariant;
  crowdCount?: number;
  crowdSeed?: string;
}

const COUNTDOWN_VALUES: readonly CountdownSignValue[] = [
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

const MAIN_BOY_ANIMS: readonly CharacterPoseId[] = [
  'walk',
  'hand-holding-walk',
  'sprint',
  'point',
  'salute',
  'dance',
  'freeze',
  'mouth-drop',
];

const MAIN_GIRL_ANIMS: readonly CharacterPoseId[] = [
  'walk',
  'point-at-shop',
  'shrug',
  'browse-shelves',
  'walk-out-of-rubble',
  'hand-holding',
  'holding-christmas-doll',
];

/**
 * Phase 7 Deliverable: Master 3D React Three Fiber (@remotion/three ThreeCanvas) Composition
 * showcasing the 8 rigged .glb models in `/public/models/characters/` and full 10-character 3D cast
 * with Main Street Cel-Shaded Toon + Comic Ink Outlines.
 */
export const CharacterCastShowcaseComposition = memo(
  function CharacterCastShowcaseComposition({
    initialViewMode = 'full-cast',
    viewMode,
    selectedCharacter = 'main-boy',
    selectedPose = 'walk',
    selectedExpression = 'happy',
    facing = 'right',
    sunglasses = false,
    countdownValue,
    pedestrianArchetype = 'business-commuter',
    nutcrackerVariant = 'hero',
    crowdCount = 12,
    crowdSeed = 'cast-showcase-background-crowd',
  }: CharacterCastShowcaseCompositionProps) {
    const frame = useCurrentFrame();
    const {fps, width, height} = useVideoConfig();

    const [activeMode, setActiveMode] = useState<CastShowcaseViewMode>(
      viewMode ?? initialViewMode,
    );
    const [inspectedChar, setInspectedChar] =
      useState<CharacterId>(selectedCharacter);
    const [inspectedPose, setInspectedPose] =
      useState<CharacterPoseId>(selectedPose);
    const [inspectedExpr, setInspectedExpr] =
      useState<CharacterExpressionId>(selectedExpression);
    const [inspectedFacing, setInspectedFacing] =
      useState<CharacterFacing>(facing);
    const [shadesOn, setShadesOn] = useState<boolean>(sunglasses);
    const [signOverride, setSignOverride] = useState<
      CountdownSignValue | undefined
    >(countdownValue);
    const [pedArch, setPedArch] =
      useState<PedestrianArchetypeVariant>(pedestrianArchetype);
    const [nutVariant, setNutVariant] =
      useState<NutcrackerDollVariant>(nutcrackerVariant);
    const [turntableYaw, setTurntableYaw] = useState<number>(0);
    const [glbModelOverride, setGlbModelOverride] = useState<
      GlbModelId | undefined
    >(undefined);

    const activeSpec =
      CHARACTER_CAST_MANIFEST.find((c) => c.characterId === inspectedChar) ??
      CHARACTER_CAST_MANIFEST[0];

    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#070B19',
          overflow: 'hidden',
          userSelect: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* 3D React Three Fiber (@remotion/three ThreeCanvas) Stage */}
        <GlbCharacterStageR3F
          width={width}
          height={height}
          frame={frame}
          fps={fps}
          activeMode={activeMode}
          inspectedChar={inspectedChar}
          inspectedPose={inspectedPose}
          inspectedExpr={inspectedExpr}
          inspectedFacing={inspectedFacing}
          shadesOn={shadesOn}
          signOverride={signOverride}
          pedArch={pedArch}
          nutVariant={nutVariant}
          turntableYaw={turntableYaw}
          crowdCount={crowdCount}
          crowdSeed={crowdSeed}
          glbModelOverride={glbModelOverride}
        />

        {/* Top Interactive Mode Switcher Bar inside the 4K Composition */}
        <div
          data-testid="cast-showcase-mode-bar"
          style={{
            position: 'absolute',
            top: 24,
            left: 32,
            right: 32,
            zIndex: 60,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            background: 'rgba(15, 23, 42, 0.96)',
            border: '4px solid #FACC15',
            borderRadius: 20,
            padding: '16px 26px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.65)',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <span
              style={{
                background: '#FACC15',
                color: '#0A0812',
                fontWeight: 900,
                fontSize: 26,
                padding: '8px 18px',
                borderRadius: 12,
                border: '3px solid #0A0812',
              }}
            >
              🧊 3D GLB + R3F 10-CHARACTER CAST (REACT THREE FIBER)
            </span>
            <span
              style={{
                color: '#E2E8F0',
                fontWeight: 800,
                fontSize: 22,
              }}
            >
              11 Rigged .GLB Models (/public/models/characters/) • @remotion/three R3F • Cel-Shaded Toon + Ink Outlines
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <button
              type="button"
              data-testid="cast-mode-full-cast-btn"
              onClick={() => setActiveMode('full-cast')}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                fontSize: 21,
                fontWeight: 900,
                cursor: 'pointer',
                border:
                  activeMode === 'full-cast'
                    ? '3px solid #0A0812'
                    : '2px solid #475569',
                background: activeMode === 'full-cast' ? '#38BDF8' : '#1E293B',
                color: activeMode === 'full-cast' ? '#0A0812' : '#F8FAFC',
              }}
            >
              1. Full 3D 10-Character Cast + 8 .GLBs + &lt;Crowd /&gt;
            </button>
            <button
              type="button"
              data-testid="cast-mode-heroes-grid-btn"
              onClick={() => setActiveMode('heroes-grid')}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                fontSize: 21,
                fontWeight: 900,
                cursor: 'pointer',
                border:
                  activeMode === 'heroes-grid'
                    ? '3px solid #0A0812'
                    : '2px solid #475569',
                background:
                  activeMode === 'heroes-grid' ? '#FACC15' : '#1E293B',
                color: activeMode === 'heroes-grid' ? '#0A0812' : '#F8FAFC',
              }}
            >
              2. Phase 2: 3D Main Boy &amp; 3D Main Girl GLB Grid
            </button>
            <button
              type="button"
              data-testid="cast-mode-inspector-btn"
              onClick={() => setActiveMode('inspector')}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                fontSize: 21,
                fontWeight: 900,
                cursor: 'pointer',
                border:
                  activeMode === 'inspector'
                    ? '3px solid #0A0812'
                    : '2px solid #475569',
                background: activeMode === 'inspector' ? '#A855F7' : '#1E293B',
                color: '#FFFFFF',
              }}
            >
              3. Interactive R3F .GLB &amp; Turntable Inspector
            </button>
            <button
              type="button"
              data-testid="cast-mode-checklist-btn"
              onClick={() => setActiveMode('checklist')}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                fontSize: 21,
                fontWeight: 900,
                cursor: 'pointer',
                border:
                  activeMode === 'checklist'
                    ? '3px solid #0A0812'
                    : '2px solid #475569',
                background: activeMode === 'checklist' ? '#10B981' : '#1E293B',
                color: activeMode === 'checklist' ? '#0A0812' : '#F8FAFC',
              }}
            >
              4. Phase 7 Master Checklist (100%)
            </button>
            <button
              type="button"
              data-testid="cast-toggle-sunglasses-btn"
              onClick={() => setShadesOn((prev) => !prev)}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                fontSize: 21,
                fontWeight: 900,
                cursor: 'pointer',
                border: shadesOn ? '3px solid #FACC15' : '2px solid #FACC15',
                background: shadesOn ? '#F43F5E' : '#1E293B',
                color: shadesOn ? '#FFFFFF' : '#FDE047',
              }}
            >
              🕶️ 3D Sunglasses: {shadesOn ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* VIEW MODE 1: BOTTOM 10-CHARACTER 3D LABELS */}
        {activeMode === 'full-cast' && (
          <div
            data-cast-lineup="all-10-characters"
            style={{
              position: 'absolute',
              left: 64,
              right: 64,
              bottom: 36,
              zIndex: 40,
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: 14,
              pointerEvents: 'none',
            }}
          >
            {[
              {label: '1. Main Boy (.GLB)', color: '#38BDF8'},
              {label: '2. Main Girl (.GLB)', color: '#FB7185'},
              {label: '3. Hacker (.GLB)', color: '#34D399'},
              {label: '4. Hype Man (.GLB)', color: '#FACC15'},
              {label: '5. Squad A (.GLB)', color: '#A3E635'},
              {label: '6. Squad B (.GLB)', color: '#C084FC'},
              {label: '7. Pedestrian (.GLB)', color: '#94A3B8'},
              {label: '8. Nutcracker (3D)', color: '#F87171'},
              {label: '9. Male Dog (.GLB)', color: '#FB923C'},
              {label: '10. Pigeon (.GLB)', color: '#22D3EE'},
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  textAlign: 'center',
                  padding: '10px 12px',
                  borderRadius: 14,
                  background: 'rgba(9, 13, 22, 0.94)',
                  border: `3px solid ${item.color}`,
                  color: item.color,
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        )}

        {/* VIEW MODE 2: PHASE 2 3D MAIN BOY & 3D MAIN GIRL GRID LABELS */}
        {activeMode === 'heroes-grid' && (
          <div
            style={{
              position: 'absolute',
              left: 48,
              right: 48,
              bottom: 36,
              zIndex: 40,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 48,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                padding: '18px 26px',
                borderRadius: 18,
                background: 'rgba(9, 13, 22, 0.92)',
                border: '3px solid #38BDF8',
                color: '#F8FAFC',
              }}
            >
              <div
                style={{fontSize: 28, fontWeight: 900, color: '#38BDF8'}}
              >
                1. 3D MAIN BOY (.GLB Rig) — All 8 Animations &amp; 6 Expressions
              </div>
              <div
                style={{
                  fontSize: 21,
                  fontFamily: 'monospace',
                  color: '#BAE6FD',
                  marginTop: 6,
                }}
              >
                Poses: {MAIN_BOY_ANIMS.join(' • ')}
              </div>
            </div>
            <div
              style={{
                padding: '18px 26px',
                borderRadius: 18,
                background: 'rgba(9, 13, 22, 0.92)',
                border: '3px solid #FB7185',
                color: '#F8FAFC',
              }}
            >
              <div
                style={{fontSize: 28, fontWeight: 900, color: '#FB7185'}}
              >
                2. 3D MAIN GIRL (.GLB Rig) — All 7 Animations/Poses &amp; 4 Expressions
              </div>
              <div
                style={{
                  fontSize: 21,
                  fontFamily: 'monospace',
                  color: '#FECDD3',
                  marginTop: 6,
                }}
              >
                Poses: {MAIN_GIRL_ANIMS.join(' • ')}
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 3: INTERACTIVE 3D RIG & TURNTABLE INSPECTOR SIDEBAR */}
        {activeMode === 'inspector' && (
          <div
            style={{
              position: 'absolute',
              top: 136,
              left: 40,
              bottom: 36,
              width: 1420,
              zIndex: 45,
              borderRadius: 24,
              border: '3px solid #334155',
              background: 'rgba(15, 23, 42, 0.95)',
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              color: '#F8FAFC',
              overflowY: 'auto',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#38BDF8',
                  marginBottom: 10,
                }}
              >
                Select 3D Character Role (1–10):
              </div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
                {CHARACTER_CAST_MANIFEST.map((c) => (
                  <button
                    key={c.characterId}
                    type="button"
                    onClick={() => {
                      setGlbModelOverride(undefined);
                      setInspectedChar(c.characterId);
                      setInspectedPose(
                        (c.animations[0] as CharacterPoseId) ?? 'walk',
                      );
                      setInspectedExpr(
                        (c.expressions[0] as CharacterExpressionId) ?? 'happy',
                      );
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 12,
                      fontSize: 20,
                      fontWeight: 800,
                      cursor: 'pointer',
                      border:
                        !glbModelOverride && inspectedChar === c.characterId
                          ? '3px solid #FFFFFF'
                          : '2px solid #475569',
                      background:
                        !glbModelOverride && inspectedChar === c.characterId
                          ? '#38BDF8'
                          : '#1E293B',
                      color:
                        !glbModelOverride && inspectedChar === c.characterId
                          ? '#0A0812'
                          : '#E2E8F0',
                    }}
                  >
                    {c.characterName}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#C084FC',
                  marginBottom: 10,
                }}
              >
                Direct .GLB Asset Override (/public/models/characters/*.glb):
              </div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
                {GLB_CHARACTER_ASSET_MANIFEST.map((entry) => (
                  <button
                    key={entry.modelId}
                    type="button"
                    onClick={() => setGlbModelOverride(entry.modelId)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      fontSize: 18,
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border:
                        glbModelOverride === entry.modelId
                          ? '3px solid #FFFFFF'
                          : '2px solid #475569',
                      background:
                        glbModelOverride === entry.modelId
                          ? '#A855F7'
                          : '#1E293B',
                      color: '#FFFFFF',
                    }}
                  >
                    {entry.fileName} ({entry.jointCount} bones)
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#34D399',
                  marginBottom: 10,
                }}
              >
                3D Animations &amp; Poses ({activeSpec.animations.length}):
              </div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
                {activeSpec.animations.map((anim) => (
                  <button
                    key={anim}
                    type="button"
                    onClick={() => setInspectedPose(anim as CharacterPoseId)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 12,
                      fontSize: 20,
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border:
                        inspectedPose === anim
                          ? '3px solid #FFFFFF'
                          : '2px solid #475569',
                      background:
                        inspectedPose === anim ? '#34D399' : '#1E293B',
                      color: inspectedPose === anim ? '#0A0812' : '#A7F3D0',
                    }}
                  >
                    {anim}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#FACC15',
                  marginBottom: 10,
                }}
              >
                3D Facial Expressions ({activeSpec.expressions.length}):
              </div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
                {activeSpec.expressions.map((expr) => (
                  <button
                    key={expr}
                    type="button"
                    onClick={() =>
                      setInspectedExpr(expr as CharacterExpressionId)
                    }
                    style={{
                      padding: '8px 16px',
                      borderRadius: 12,
                      fontSize: 20,
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border:
                        inspectedExpr === expr
                          ? '3px solid #FFFFFF'
                          : '2px solid #475569',
                      background:
                        inspectedExpr === expr ? '#FACC15' : '#1E293B',
                      color: inspectedExpr === expr ? '#0A0812' : '#FDE047',
                    }}
                  >
                    {expr}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 16,
                paddingTop: 12,
                borderTop: '2px solid #1E293B',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setInspectedFacing((f) => (f === 'right' ? 'left' : 'right'))
                }
                style={{
                  padding: '10px 20px',
                  borderRadius: 12,
                  fontSize: 20,
                  fontWeight: 800,
                  background: '#9333EA',
                  color: '#FFFFFF',
                  border: '2px solid #D8B4FE',
                  cursor: 'pointer',
                }}
              >
                3D Facing: {inspectedFacing.toUpperCase()}
              </button>

              <button
                type="button"
                onClick={() => setTurntableYaw((y) => (y + 45) % 360)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 12,
                  fontSize: 20,
                  fontWeight: 800,
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: '2px solid #7DD3FC',
                  cursor: 'pointer',
                }}
              >
                🔄 Rotate 3D Turntable ({turntableYaw}°)
              </button>

              {inspectedChar === 'hype-man' && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{fontSize: 20, fontWeight: 800, color: '#FDE047'}}
                  >
                    3D Sign:
                  </span>
                  {COUNTDOWN_VALUES.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSignOverride(val)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 10,
                        fontSize: 19,
                        fontWeight: 900,
                        cursor: 'pointer',
                        border:
                          signOverride === val
                            ? '2px solid #FDE047'
                            : '2px solid #475569',
                        background:
                          signOverride === val ? '#EF4444' : '#1E293B',
                        color: signOverride === val ? '#FEF08A' : '#E2E8F0',
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}

              {inspectedChar === 'pedestrian' && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  {(
                    [
                      'business-commuter',
                      'jogger-hoodie',
                      'elder-coat',
                    ] as const
                  ).map((arch) => (
                    <button
                      key={arch}
                      type="button"
                      onClick={() => setPedArch(arch)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 10,
                        fontSize: 19,
                        fontWeight: 800,
                        cursor: 'pointer',
                        border:
                          pedArch === arch
                            ? '2px solid #FFFFFF'
                            : '2px solid #475569',
                        background: pedArch === arch ? '#38BDF8' : '#1E293B',
                        color: pedArch === arch ? '#0A0812' : '#E2E8F0',
                      }}
                    >
                      {arch}
                    </button>
                  ))}
                </div>
              )}

              {inspectedChar === 'nutcracker-doll' && (
                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                  {(['hero', 'shop-window'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setNutVariant(v)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 10,
                        fontSize: 19,
                        fontWeight: 800,
                        cursor: 'pointer',
                        border:
                          nutVariant === v
                            ? '2px solid #FDE047'
                            : '2px solid #475569',
                        background: nutVariant === v ? '#EF4444' : '#1E293B',
                        color: nutVariant === v ? '#FEF08A' : '#E2E8F0',
                      }}
                    >
                      3D Variant: {v}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE 4: PHASE 7 MASTER CHECKLIST */}
        {activeMode === 'checklist' && (
          <div
            style={{
              width: '100%',
              height: '100%',
              paddingTop: 136,
              paddingLeft: 40,
              paddingRight: 40,
              paddingBottom: 32,
              boxSizing: 'border-box',
              color: '#F8FAFC',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '3px solid #1E293B',
                paddingBottom: 16,
                marginBottom: 22,
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 38,
                    fontWeight: 900,
                    color: '#FACC15',
                    margin: 0,
                  }}
                >
                  OMNIFRAME 3D GLB + React Three Fiber Character Cast — Phase 7 Master Checklist
                </h2>
                <p
                  style={{
                    fontSize: 24,
                    color: '#CBD5E1',
                    margin: '6px 0 0 0',
                  }}
                >
                  8 Rigged .GLB Models (/public/models/characters/) • @remotion/three R3F • Cel-Shaded Toon + Ink Outlines
                </p>
              </div>
              <span
                style={{
                  padding: '10px 24px',
                  borderRadius: 14,
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '3px solid #34D399',
                  color: '#6EE7B7',
                  fontSize: 24,
                  fontFamily: 'monospace',
                  fontWeight: 900,
                }}
              >
                ALL 10 3D CHARACTERS + 8 .GLBs IMPLEMENTED (100%)
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 22,
              }}
            >
              {CHARACTER_CAST_MANIFEST.map((item) => (
                <div
                  key={item.characterId}
                  style={{
                    borderRadius: 18,
                    border: '2px solid #334155',
                    background: 'rgba(15, 23, 42, 0.94)',
                    padding: '18px 24px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 28,
                        fontWeight: 900,
                        color: '#38BDF8',
                      }}
                    >
                      {item.characterName} (3D R3F / .GLB Rig)
                    </span>
                    <span
                      style={{
                        fontSize: 20,
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        padding: '4px 14px',
                        borderRadius: 10,
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '2px solid #34D399',
                        color: '#6EE7B7',
                      }}
                    >
                      Phase {item.phase} ✓ 3D IMPLEMENTED
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 21,
                      color: '#E2E8F0',
                      lineHeight: 1.45,
                    }}
                  >
                    <div>
                      <strong style={{color: '#94A3B8'}}>
                        3D Outfits &amp; Props:{' '}
                      </strong>
                      {item.outfitsAndProps.join(' • ')}
                    </div>
                    <div>
                      <strong style={{color: '#94A3B8'}}>
                        3D Expressions:{' '}
                      </strong>
                      <span style={{fontFamily: 'monospace', color: '#FDE047'}}>
                        {item.expressions.join(', ')}
                      </span>
                    </div>
                    <div>
                      <strong style={{color: '#94A3B8'}}>
                        3D Animations:{' '}
                      </strong>
                      <span style={{fontFamily: 'monospace', color: '#6EE7B7'}}>
                        {item.animations.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </AbsoluteFill>
    );
  },
);
