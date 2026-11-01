'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type {
  CharacterExpressionId,
  CharacterFacing,
  CharacterId,
  CharacterPoseId,
  CountdownSignValue,
  NutcrackerDollVariant,
  PedestrianArchetypeVariant,
} from '../../../lib/omniframe/characters/rig-utils';
import {
  buildThreeCharacterRig,
  buildThreeCrowdGroup,
} from '../../../lib/omniframe/characters/three-character-rigs-builder';
import {
  subscribeToGlbCharacterMounts,
  type GlbModelId,
} from '../../../lib/omniframe/characters/glb-character-loader';
import { applyMainStreetStyleToSceneGraph } from '../../../lib/omniframe/main-street-style-engine';

export type R3FCastViewMode =
  | 'full-cast'
  | 'heroes-grid'
  | 'inspector'
  | 'checklist';

export interface GlbCharacterStageR3FProps {
  width: number;
  height: number;
  frame: number;
  fps: number;
  activeMode: R3FCastViewMode;
  inspectedChar: CharacterId;
  inspectedPose: CharacterPoseId;
  inspectedExpr: CharacterExpressionId;
  inspectedFacing: CharacterFacing;
  shadesOn: boolean;
  signOverride?: CountdownSignValue;
  pedArch: PedestrianArchetypeVariant;
  nutVariant: NutcrackerDollVariant;
  turntableYaw: number;
  crowdCount: number;
  crowdSeed: string;
  glbModelOverride?: GlbModelId;
}

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

const InnerR3FSceneContent: React.FC<GlbCharacterStageR3FProps> = ({
  frame,
  fps,
  activeMode,
  inspectedChar,
  inspectedPose,
  inspectedExpr,
  inspectedFacing,
  shadesOn,
  signOverride,
  pedArch,
  nutVariant,
  turntableYaw,
  crowdCount,
  crowdSeed,
  glbModelOverride,
}) => {
  const { gl, camera, invalidate } = useThree();
  const [glbMountVersion, setGlbMountVersion] = useState(0);

  // Configure sRGB & ACES Filmic Tone Mapping on the R3F WebGLRenderer
  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.12;
  }, [gl]);

  // Subscribe to GLB model load/mount notifications so R3F invalidates & re-renders immediately
  useEffect(() => {
    return subscribeToGlbCharacterMounts(() => {
      setGlbMountVersion((v) => v + 1);
      invalidate();
    });
  }, [invalidate]);

  // Build Cel-Shaded Main Street Stage Architecture
  const stageArchitecture = useMemo(() => {
    const stageEnvGroup = new THREE.Group();
    stageEnvGroup.name = 'r3f-cel-shaded-stage-env';

    const roadMesh = new THREE.Mesh(
      new THREE.BoxGeometry(36, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.75 }),
    );
    roadMesh.position.set(0, -0.1, 1.5);
    stageEnvGroup.add(roadMesh);

    const sidewalkMesh = new THREE.Mesh(
      new THREE.BoxGeometry(36, 0.24, 6),
      new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.65 }),
    );
    sidewalkMesh.position.set(0, 0.02, -3.5);
    stageEnvGroup.add(sidewalkMesh);

    for (let lx = -14; lx <= 14; lx += 2.8) {
      const dash = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.03, 0.22),
        new THREE.MeshStandardMaterial({ color: '#FACC15', roughness: 0.4 }),
      );
      dash.position.set(lx, 0.015, 1.6);
      stageEnvGroup.add(dash);
    }

    const bColors = ['#E2E8F0', '#FDE68A', '#7F1D1D', '#FECDD3', '#93C5FD'];
    for (let bi = 0; bi < 5; bi++) {
      const bx = -12 + bi * 6;
      const bh = 6.5 + (bi % 2) * 1.4;
      const bMesh = new THREE.Mesh(
        new THREE.BoxGeometry(5.6, bh, 2.2),
        new THREE.MeshStandardMaterial({
          color: bColors[bi],
          roughness: 0.6,
        }),
      );
      bMesh.position.set(bx, bh * 0.5, -7.2);
      stageEnvGroup.add(bMesh);
    }

    const envStyle = applyMainStreetStyleToSceneGraph(stageEnvGroup);
    return { stageEnvGroup, envStyle };
  }, []);

  useEffect(() => {
    return () => {
      stageArchitecture.envStyle.disposeStyleResources();
    };
  }, [stageArchitecture]);

  const activeInspectorKey = glbModelOverride
    ? `glb:${glbModelOverride}`
    : inspectedChar === 'pedestrian'
      ? `pedestrian:${pedArch}`
      : inspectedChar === 'nutcracker-doll'
        ? `nutcracker-doll:${nutVariant}`
        : inspectedChar;

  // Lazily build ONLY the rigs required for the active view mode
  const activeModeRigBundle = useMemo(() => {
    const modeGroup = new THREE.Group();
    modeGroup.name = `r3f-mode-group-${activeMode}`;

    const fullCastRigs: ReturnType<typeof buildThreeCharacterRig>[] = [];
    let policeOfficerRig: ReturnType<typeof buildThreeCharacterRig> | null = null;
    const windowNutcrackers: ReturnType<typeof buildThreeCharacterRig>[] = [];
    let crowdHandle: ReturnType<typeof buildThreeCrowdGroup> | null = null;
    const boyGridRigs: ReturnType<typeof buildThreeCharacterRig>[] = [];
    const girlGridRigs: ReturnType<typeof buildThreeCharacterRig>[] = [];
    let activeInspectorRig: ReturnType<typeof buildThreeCharacterRig> | null = null;

    if (activeMode === 'full-cast') {
      const castSpecs: {
        id: CharacterId;
        pose: CharacterPoseId;
        expr: CharacterExpressionId;
        scale: number;
        glbOverride?: GlbModelId;
      }[] = [
        {
          id: 'main-boy',
          pose: 'walk',
          expr: 'happy',
          scale: 1.38,
          glbOverride: 'game-boy-hero',
        },
        {
          id: 'main-girl',
          pose: 'holding-christmas-doll',
          expr: 'happy',
          scale: 1.36,
          glbOverride: 'rigged-anime-girl-hero',
        },
        {
          id: 'hacker-friend',
          pose: 'tapping-phone',
          expr: 'unbothered',
          scale: 1.38,
          glbOverride: 'low-poly-man',
        },
        {
          id: 'hype-man',
          pose: 'countdown-gestures',
          expr: 'excited',
          scale: 1.38,
          glbOverride: 'idle-male-loop',
        },
        {
          id: 'squad-member-a',
          pose: 'salute',
          expr: 'determined',
          scale: 1.36,
          glbOverride: 'casual-male-tpose',
        },
        {
          id: 'squad-member-b',
          pose: 'dance',
          expr: 'happy',
          scale: 1.36,
          glbOverride: 'basic-walk-female-loop',
        },
        {
          id: 'pedestrian',
          pose: 'hurry-away',
          expr: 'terrified',
          scale: 1.36,
          glbOverride: 'nathan-walking-man',
        },
        {
          id: 'nutcracker-doll',
          pose: 'detachable-head',
          expr: 'shocked',
          scale: 1.35,
        },
        {
          id: 'male-dog',
          pose: 'startled-expression',
          expr: 'shocked',
          scale: 1.45,
          glbOverride: 'dog-glb',
        },
        {
          id: 'pigeon',
          pose: 'wing-flap',
          expr: 'neutral',
          scale: 1.85,
          glbOverride: 'pigeon-glb',
        },
      ];

      castSpecs.forEach((sp, idx) => {
        const rig = buildThreeCharacterRig({
          characterId: sp.id,
          pose: sp.pose,
          expression: sp.expr,
          scale: sp.scale,
          seed: `r3f-showcase-cast-${idx}`,
          glbModelIdOverride: sp.glbOverride,
        });
        const xPos = -5.4 + idx * 1.2;
        rig.rootGroup.position.set(xPos, 0.02, 2.1);
        modeGroup.add(rig.rootGroup);
        fullCastRigs.push(rig);
      });

      // Also place `police-man-rigged` patrolling on the sidewalk beside the Shop Window Nutcrackers
      policeOfficerRig = buildThreeCharacterRig({
        characterId: 'pedestrian',
        archetype: 'jogger-hoodie',
        pose: 'salute',
        expression: 'determined',
        scale: 1.28,
        seed: 'r3f-showcase-police-glb',
        glbModelIdOverride: 'police-man-rigged',
      });
      policeOfficerRig.rootGroup.position.set(-3.1, 0.2, -2.2);
      modeGroup.add(policeOfficerRig.rootGroup);

      for (let w = 0; w < 4; w++) {
        const nRig = buildThreeCharacterRig({
          characterId: 'nutcracker-doll',
          nutcrackerVariant: 'shop-window',
          pose: w % 2 === 0 ? 'head-rotation' : 'eye-movement',
          scale: 0.95,
          seed: `r3f-win-nut-${w}`,
          startFrame: w * 9,
        });
        nRig.rootGroup.position.set(-1.35 + w * 0.9, 0.85, -5.6);
        modeGroup.add(nRig.rootGroup);
        windowNutcrackers.push(nRig);
      }

      crowdHandle = buildThreeCrowdGroup({
        count: crowdCount,
        seed: crowdSeed,
        pose: 'walk',
        baseScale: 0.98,
        zSpan: 24,
        sidewalkXPositions: [2.8, 3.6],
      });
      crowdHandle.rootGroup.rotation.y = Math.PI * 0.5;
      modeGroup.add(crowdHandle.rootGroup);
    } else if (activeMode === 'heroes-grid') {
      MAIN_BOY_ANIMS.forEach((anim, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const rig = buildThreeCharacterRig({
          characterId: 'main-boy',
          pose: anim,
          expression: anim === 'mouth-drop' ? 'shocked' : 'happy',
          scale: 1.15,
          seed: `r3f-grid-boy-${anim}`,
          glbModelIdOverride: 'game-boy-hero',
        });
        rig.rootGroup.position.set(
          -5.0 + col * 1.18,
          row === 0 ? 1.65 : -0.35,
          1.2,
        );
        modeGroup.add(rig.rootGroup);
        boyGridRigs.push(rig);
      });

      const girlOutfitTints = [
        undefined, // default outfit
        { base: '#F472B6', shadow: '#DB2777', highlight: '#FBCFE8' }, // pastel-rose outfit
        { base: '#38BDF8', shadow: '#0284C7', highlight: '#BAE6FD' }, // sky-cardigan outfit
        { base: '#A78BFA', shadow: '#7C3AED', highlight: '#DDD6FE' }, // lavender-street outfit
        { base: '#475569', shadow: '#1E293B', highlight: '#94A3B8' }, // soot-covered rubble outfit
        { base: '#FB7185', shadow: '#E11D48', highlight: '#FECDD3' }, // date-coral outfit
        { base: '#EF4444', shadow: '#B91C1C', highlight: '#FCA5A5' }, // festive-christmas outfit
      ] as const;

      const girlExprs: readonly CharacterExpressionId[] = [
        'happy',
        'happy',
        'confused',
        'neutral',
        'soot-covered',
        'happy',
        'happy',
      ];

      MAIN_GIRL_ANIMS.forEach((anim, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const rig = buildThreeCharacterRig({
          characterId: 'main-girl',
          pose: anim,
          expression: girlExprs[i] ?? 'happy',
          scale: 1.15,
          seed: `r3f-grid-girl-${anim}`,
          glbModelIdOverride: 'rigged-anime-girl-hero',
          topColorOverride: girlOutfitTints[i],
        });
        rig.rootGroup.position.set(
          1.35 + col * 1.18,
          row === 0 ? 1.65 : -0.35,
          1.2,
        );
        modeGroup.add(rig.rootGroup);
        girlGridRigs.push(rig);
      });
    } else if (activeMode === 'inspector') {
      activeInspectorRig = buildThreeCharacterRig({
        characterId: inspectedChar,
        archetype: inspectedChar === 'pedestrian' ? pedArch : undefined,
        nutcrackerVariant:
          inspectedChar === 'nutcracker-doll' ? nutVariant : undefined,
        glbModelIdOverride: glbModelOverride,
        scale:
          inspectedChar === 'pigeon'
            ? 2.5
            : inspectedChar === 'male-dog'
              ? 2.1
              : 1.85,
        seed: `r3f-inspector-${activeInspectorKey}`,
      });
      activeInspectorRig.rootGroup.position.set(2.4, -0.35, 2.2);
      modeGroup.add(activeInspectorRig.rootGroup);
    }

    return {
      modeGroup,
      fullCastRigs,
      policeOfficerRig,
      windowNutcrackers,
      crowdHandle,
      boyGridRigs,
      girlGridRigs,
      activeInspectorRig,
      disposeAll: () => {
        fullCastRigs.forEach((r) => r.dispose());
        policeOfficerRig?.dispose();
        windowNutcrackers.forEach((r) => r.dispose());
        crowdHandle?.dispose();
        boyGridRigs.forEach((r) => r.dispose());
        girlGridRigs.forEach((r) => r.dispose());
        activeInspectorRig?.dispose();
      },
    };
  }, [
    activeMode,
    crowdCount,
    crowdSeed,
    inspectedChar,
    pedArch,
    nutVariant,
    glbModelOverride,
    activeInspectorKey,
  ]);

  useEffect(() => {
    return () => {
      activeModeRigBundle.disposeAll();
    };
  }, [activeModeRigBundle]);

  // Deterministically evaluate all active rigs at the current Remotion frame
  useEffect(() => {
    void glbMountVersion;

    if (activeMode === 'full-cast') {
      camera.position.set(0, 1.95, 12.6);
      camera.lookAt(0, 1.1, 0);

      activeModeRigBundle.fullCastRigs.forEach((rig) => {
        rig.updateAtFrame({
          frame,
          fps,
          sunglasses: shadesOn,
          countdownValue: signOverride,
        });
        rig.rootGroup.rotation.y = Math.sin(frame * 0.03) * 0.22;
      });
      if (activeModeRigBundle.policeOfficerRig) {
        activeModeRigBundle.policeOfficerRig.updateAtFrame({
          frame,
          fps,
          sunglasses: shadesOn,
        });
        activeModeRigBundle.policeOfficerRig.rootGroup.rotation.y =
          Math.sin(frame * 0.025) * 0.25;
      }

      activeModeRigBundle.windowNutcrackers.forEach((rig) => {
        rig.updateAtFrame({ frame, fps });
        rig.rootGroup.rotation.y = 0;
      });
      activeModeRigBundle.crowdHandle?.updateAtFrame(frame, fps);
    } else if (activeMode === 'heroes-grid') {
      camera.position.set(0, 1.45, 11.8);
      camera.lookAt(0, 1.15, 0);

      activeModeRigBundle.boyGridRigs.forEach((rig, i) => {
        rig.updateAtFrame({
          frame,
          fps,
          pose: MAIN_BOY_ANIMS[i],
          expression: MAIN_BOY_ANIMS[i] === 'mouth-drop' ? 'shocked' : 'happy',
          sunglasses: shadesOn || i === 7,
        });
        rig.rootGroup.rotation.y = Math.sin(frame * 0.04 + i * 0.5) * 0.35;
      });

      const girlGridExprs: readonly CharacterExpressionId[] = [
        'happy',
        'happy',
        'confused',
        'neutral',
        'soot-covered',
        'happy',
        'happy',
      ];
      activeModeRigBundle.girlGridRigs.forEach((rig, i) => {
        rig.updateAtFrame({
          frame,
          fps,
          pose: MAIN_GIRL_ANIMS[i],
          expression: girlGridExprs[i] ?? 'happy',
          sunglasses: shadesOn,
        });
        rig.rootGroup.rotation.y = Math.sin(frame * 0.04 + i * 0.5) * 0.35;
      });
    } else if (activeMode === 'inspector') {
      camera.position.set(0, 1.45, 8.2);
      camera.lookAt(0, 1.1, 0);

      if (activeModeRigBundle.activeInspectorRig) {
        activeModeRigBundle.activeInspectorRig.updateAtFrame({
          frame,
          fps,
          pose: inspectedPose,
          expression: inspectedExpr,
          facing: inspectedFacing,
          sunglasses: shadesOn,
          countdownValue: signOverride,
        });
        activeModeRigBundle.activeInspectorRig.rootGroup.rotation.y =
          (inspectedFacing === 'left' ? -0.35 : 0.35) +
          THREE.MathUtils.degToRad(turntableYaw);
      }
    }

    invalidate();
  }, [
    frame,
    fps,
    activeMode,
    inspectedPose,
    inspectedExpr,
    inspectedFacing,
    shadesOn,
    signOverride,
    turntableYaw,
    glbMountVersion,
    camera,
    activeModeRigBundle,
    invalidate,
  ]);

  return (
    <>
      <color attach="background" args={['#0B132B']} />
      <fogExp2 attach="fog" args={['#0B132B', 0.018]} />

      {/* 3-Point Warm/Cool Studio Lighting */}
      <hemisphereLight args={['#BAE6FD', '#1E293B', 1.45]} />
      <directionalLight position={[8, 14, 12]} color="#FFFBEB" intensity={2.35} />
      <directionalLight position={[-10, 8, -8]} color="#38BDF8" intensity={1.25} />

      {/* Declarative React Three Fiber Scene Graph */}
      <primitive object={stageArchitecture.stageEnvGroup} />
      <primitive object={activeModeRigBundle.modeGroup} />
    </>
  );
};

export const GlbCharacterStageR3F: React.FC<GlbCharacterStageR3FProps> = (
  props,
) => {
  if (props.activeMode === 'checklist') {
    return null;
  }

  return (
    <div
      data-testid="three-character-cast-canvas"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <ThreeCanvas
        width={props.width}
        height={props.height}
        frameloop="demand"
        dpr={props.width > 1920 ? 0.5 : 1}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        camera={{
          fov: 38,
          near: 0.1,
          far: 200,
          position: [0, 1.95, 12.6],
        }}
      >
        <InnerR3FSceneContent {...props} />
      </ThreeCanvas>
    </div>
  );
};
