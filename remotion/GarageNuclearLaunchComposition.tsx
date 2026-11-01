import React, {useEffect, useRef, useState} from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import * as THREE from 'three';
import {
  GARAGE_NUCLEAR_LAUNCH_ASSET_TABLE,
  GARAGE_ULTRA_DETAIL_WORKSHOP_MANIFEST,
  GarageCameraPresetId,
  GarageDoorModeId,
  GarageLaunchModeId,
  GarageLightRevealModeId,
  computeGarageCameraTransformAtFrame,
  evaluateGarageLaunchStateAtFrame,
} from '../lib/omniframe/garage-nuclear-launch-manifest';
import {
  GarageInspectableMeta,
  GarageNuclearSceneHandle,
  buildGarageNuclearLaunchScene,
} from '../lib/omniframe/three-garage-nuclear-launch-builder';
import {SceneCharacterStageOverlay} from '../components/omniframe/characters/SceneCharacterStageOverlay';
import {subscribeToGlbCharacterMounts} from '../lib/omniframe/characters/glb-character-loader';

export const garageNuclearLaunchSchema = z.object({
  cameraPreset: z
    .enum([
      'garage-choreographed-tour',
      'nuke-and-trolley-hero-closeup',
      'garage-door-and-tracks-closeup',
      'clutter-shelves-tools-closeup',
      'countdown-signs-and-fx-closeup',
      'garage-wide-master-overview',
    ])
    .default('garage-choreographed-tour'),
  doorMode: z
    .enum([
      'timeline-animated',
      'manual-open',
      'manual-half-open',
      'manual-closed',
    ])
    .default('timeline-animated'),
  launchMode: z
    .enum([
      'timeline-cycle',
      'concealed-underground',
      'ground-opening-emergence',
      'full-ignition-blast',
      'countdown-standby',
    ])
    .default('timeline-cycle'),
  lightRevealMode: z
    .enum([
      'dramatic-3-bulb-reveal',
      'all-lamps-full-bright',
      'moody-bunker-amber',
    ])
    .default('dramatic-3-bulb-reveal'),
  vfxIntensity: z.number().min(0).max(1.8).step(0.05).default(1.0),
  inkOutlinesEnabled: z.boolean().default(true),
  wireframeMode: z.boolean().default(false),
  manualOrbitAzimuthRad: z.number().min(-3.14).max(3.14).step(0.05).default(0),
  manualOrbitPolarRad: z.number().min(-0.6).max(0.5).step(0.02).default(0),
  manualZoomDistance: z.number().min(0.4).max(2.0).step(0.05).default(1),
});

export type GarageNuclearLaunchProps = z.infer<
  typeof garageNuclearLaunchSchema
>;

export const GarageNuclearLaunchComposition: React.FC<
  Partial<GarageNuclearLaunchProps>
> = ({
  cameraPreset = 'garage-choreographed-tour',
  doorMode = 'timeline-animated',
  launchMode = 'timeline-cycle',
  lightRevealMode = 'dramatic-3-bulb-reveal',
  vfxIntensity = 1.0,
  inkOutlinesEnabled = true,
  wireframeMode = false,
  manualOrbitAzimuthRad = 0,
  manualOrbitPolarRad = 0,
  manualZoomDistance = 1,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const [cameraPresetOverride, setCameraPresetOverride] =
    useState<GarageCameraPresetId | null>(null);
  const [doorModeOverride, setDoorModeOverride] =
    useState<GarageDoorModeId | null>(null);
  const [launchModeOverride, setLaunchModeOverride] =
    useState<GarageLaunchModeId | null>(null);
  const [lightRevealOverride, setLightRevealOverride] =
    useState<GarageLightRevealModeId | null>(null);
  const [inkOutlinesOverride, setInkOutlinesOverride] = useState<
    boolean | null
  >(null);
  const [inspectedItem, setInspectedItem] =
    useState<GarageInspectableMeta | null>(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [interactiveOrbit, setInteractiveOrbit] = useState({
    azimuth: 0,
    polar: 0,
    zoom: 1,
  });

  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const garageHandleRef = useRef<GarageNuclearSceneHandle | null>(null);
  const pointerDownPosRef = useRef<{x: number; y: number} | null>(null);
  const isDraggingRef = useRef(false);

  const activeCameraPreset: GarageCameraPresetId =
    cameraPresetOverride ?? (cameraPreset as GarageCameraPresetId);
  const activeDoorMode: GarageDoorModeId =
    doorModeOverride ?? (doorMode as GarageDoorModeId);
  const activeLaunchMode: GarageLaunchModeId =
    launchModeOverride ?? (launchMode as GarageLaunchModeId);
  const activeLightRevealMode: GarageLightRevealModeId =
    lightRevealOverride ?? (lightRevealMode as GarageLightRevealModeId);
  const activeInkOutlines: boolean =
    inkOutlinesOverride ?? inkOutlinesEnabled;

  const latestStateRef = useRef({
    frame,
    fps,
    activeCameraPreset,
    activeDoorMode,
    activeLaunchMode,
    activeLightRevealMode,
    vfxIntensity,
    activeInkOutlines,
    wireframeMode,
    manualOrbitAzimuthRad,
    manualOrbitPolarRad,
    manualZoomDistance,
    inspectedItem,
    interactiveOrbit,
  });

  const renderDeterministicFrame = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const handle = garageHandleRef.current;
    if (!renderer || !scene || !camera || !handle) return;

    const st = latestStateRef.current;
    const camState = computeGarageCameraTransformAtFrame(
      st.frame,
      st.activeCameraPreset,
    );

    let targetVec: THREE.Vector3;
    let offsetVec: THREE.Vector3;

    if (st.inspectedItem) {
      targetVec = new THREE.Vector3(...st.inspectedItem.target);
      if (st.inspectedItem.cameraPosition) {
        const camPosVec = new THREE.Vector3(...st.inspectedItem.cameraPosition);
        offsetVec = camPosVec.sub(targetVec);
      } else {
        const dist = st.inspectedItem.optimalDistance;
        offsetVec = new THREE.Vector3(0, dist * 0.38, dist * 0.85);
      }
    } else {
      targetVec = new THREE.Vector3(...camState.target);
      const basePosVec = new THREE.Vector3(...camState.position);
      offsetVec = basePosVec.sub(targetVec);
    }

    const totalAzimuth =
      st.manualOrbitAzimuthRad + st.interactiveOrbit.azimuth;
    const totalPolar = st.manualOrbitPolarRad + st.interactiveOrbit.polar;
    const totalZoom = st.manualZoomDistance * st.interactiveOrbit.zoom;

    if (totalAzimuth !== 0 || totalPolar !== 0 || totalZoom !== 1) {
      const spherical = new THREE.Spherical().setFromVector3(offsetVec);
      spherical.theta += totalAzimuth;
      spherical.phi = THREE.MathUtils.clamp(
        spherical.phi + totalPolar,
        0.15,
        Math.PI * 0.48,
      );
      spherical.radius = THREE.MathUtils.clamp(
        spherical.radius * totalZoom,
        0.55,
        6.5,
      );
      offsetVec.setFromSpherical(spherical);
    }

    const desiredPos = targetVec.clone().add(offsetVec);
    desiredPos.x = THREE.MathUtils.clamp(desiredPos.x, -3.95, 3.95);
    desiredPos.y = THREE.MathUtils.clamp(desiredPos.y, 0.45, 3.35);
    desiredPos.z = THREE.MathUtils.clamp(desiredPos.z, -3.25, 3.25);

    camera.position.copy(desiredPos);
    camera.lookAt(targetVec);
    const desiredFov = st.inspectedItem ? 44 : camState.fov;
    if (camera.fov !== desiredFov) {
      camera.fov = desiredFov;
      camera.updateProjectionMatrix();
    }

    handle.updateForFrame({
      frame: st.frame,
      fps: st.fps,
      doorMode: st.activeDoorMode,
      launchMode: st.activeLaunchMode,
      lightRevealMode: st.activeLightRevealMode,
      vfxIntensity: st.vfxIntensity,
      inkOutlinesEnabled: st.activeInkOutlines,
      wireframeMode: st.wireframeMode,
    });

    renderer.render(scene, camera);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(1920, 1080, false);
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0F172A');

    const camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.08, 45);
    const handle = buildGarageNuclearLaunchScene();
    scene.add(handle.rootGroup);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    garageHandleRef.current = handle;

    renderDeterministicFrame();

    const unsubscribeGlbMounts = subscribeToGlbCharacterMounts(() => {
      renderDeterministicFrame();
    });

    return () => {
      unsubscribeGlbMounts();
      handle.dispose();
      renderer.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      garageHandleRef.current = null;
    };
  }, []);

  useEffect(() => {
    latestStateRef.current = {
      frame,
      fps,
      activeCameraPreset,
      activeDoorMode,
      activeLaunchMode,
      activeLightRevealMode,
      vfxIntensity,
      activeInkOutlines,
      wireframeMode,
      manualOrbitAzimuthRad,
      manualOrbitPolarRad,
      manualZoomDistance,
      inspectedItem,
      interactiveOrbit,
    };
    renderDeterministicFrame();
  }, [
    frame,
    fps,
    activeCameraPreset,
    activeDoorMode,
    activeLaunchMode,
    activeLightRevealMode,
    vfxIntensity,
    activeInkOutlines,
    wireframeMode,
    manualOrbitAzimuthRad,
    manualOrbitPolarRad,
    manualZoomDistance,
    inspectedItem,
    interactiveOrbit,
  ]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPosRef.current = {x: e.clientX, y: e.clientY};
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDownPosRef.current || e.buttons !== 1) return;
    const dx = e.clientX - pointerDownPosRef.current.x;
    const dy = e.clientY - pointerDownPosRef.current.y;
    if (Math.hypot(dx, dy) > 4) {
      isDraggingRef.current = true;
      pointerDownPosRef.current = {x: e.clientX, y: e.clientY};
      setInteractiveOrbit((prev) => ({
        ...prev,
        azimuth: prev.azimuth - dx * 0.0055,
        polar: THREE.MathUtils.clamp(prev.polar - dy * 0.0045, -0.45, 0.45),
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const downPos = pointerDownPosRef.current;
    pointerDownPosRef.current = null;
    if (!downPos || isDraggingRef.current) return;

    const container = mountRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!container || !scene || !camera) return;

    const rect = container.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    const hits = raycaster.intersectObjects(scene.children, true);

    for (const hit of hits) {
      let curr: THREE.Object3D | null = hit.object;
      while (curr) {
        if (curr.userData && curr.userData.inspectable) {
          const info = curr.userData.inspectable as GarageInspectableMeta;
          setInspectedItem(info);
          setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
          return;
        }
        curr = curr.parent;
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    setInteractiveOrbit((prev) => ({
      ...prev,
      zoom: THREE.MathUtils.clamp(prev.zoom + e.deltaY * 0.001, 0.45, 1.85),
    }));
  };

  const launchState = evaluateGarageLaunchStateAtFrame({
    frame,
    fps,
    doorMode: activeDoorMode,
    launchMode: activeLaunchMode,
    lightRevealMode: activeLightRevealMode,
  });

  const totalBuiltAssets = GARAGE_NUCLEAR_LAUNCH_ASSET_TABLE.reduce(
    (acc, row) => acc + row.builtQuantity,
    0,
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0F172A',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <Sequence
        name="Garage 01: Garage Shell (1), Stained/Cracked Concrete Floor (1 Set), Animated Garage Door (1) & 2 Overhead J-Tracks"
        from={0}
        durationInFrames={480}
      >
        <div
          ref={mountRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            cursor: 'grab',
          }}
        />
      </Sequence>

      <Sequence
        name="Garage 02: Cartoon Nuke (1: Separate Nose Cone, Body, 4 Fins & Markings) on Rusty Trolley (1) + Bicycle (1)"
        from={0}
        durationInFrames={480}
      >
        <div style={{display: 'none'}} />
      </Sequence>
      <Sequence
        name="Garage 03: Launch Fire (1), Launch Smoke (1), Ground Dust (1), Cardboard Countdown Sign (1) & NUKE LAUNCH Sign (1)"
        from={0}
        durationInFrames={480}
      >
        <div style={{display: 'none'}} />
      </Sequence>
      <Sequence
        name="Garage 04: 3 Overhead Reveal Lamps, Tool Cabinet (1), Toolbox (1), Spare Tire (1), 2 Shelving Racks, 5 Paint Cans, 5 Boxes & Extension Cable (1)"
        from={0}
        durationInFrames={480}
      >
        <div style={{display: 'none'}} />
      </Sequence>

      <Sequence
        name="Style Layer: Main Street 2D Comic Ink Line Art & Frame"
        from={0}
        durationInFrames={480}
      >
        {activeInkOutlines ? (
          <div
            data-testid="garage-main-street-comic-frame"
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              inset: 28,
              border: '5px solid rgba(10, 8, 18, 0.85)',
              boxShadow: 'inset 0 0 0 2px rgba(243, 239, 250, 0.1)',
              zIndex: 25,
            }}
          />
        ) : null}
      </Sequence>

      <Sequence
        name="Cast: Hype Man Countdown, Main Boy, Main Girl, Squad A & B, Hacker, Dog & Pigeon"
        from={0}
        durationInFrames={480}
      >
        <SceneCharacterStageOverlay
          sceneContext="garage-nuclear-launch"
          visible={true}
        />
      </Sequence>

      {/* Top Interactive Director HUD */}
      <div
        onPointerDown={(ev) => ev.stopPropagation()}
        onMouseDown={(ev) => ev.stopPropagation()}
        style={{
          position: 'absolute',
          top: 38,
          left: 46,
          zIndex: 9999,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 11,
          maxWidth: 1780,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Row 1: Scene Switchers + Launch & Garage Door Controls */}
        <div
          data-testid="garage-top-control-bar"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            border: '2px solid #F97316',
            borderRadius: 14,
            padding: '10px 16px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 12px 28px rgba(0,0,0,0.68)',
          }}
        >
          <span
            style={{
              backgroundColor: '#9A3412',
              color: '#FEF08A',
              border: '2px solid #FACC15',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: '0.04em',
            }}
          >
            🚀 GARAGE & NUCLEAR LAUNCH SETUP
          </span>

          <button
            type="button"
            data-testid="garage-toggle-ink-style-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setInkOutlinesOverride(!activeInkOutlines);
            }}
            style={{
              backgroundColor: activeInkOutlines ? '#FACC15' : '#1E293B',
              color: activeInkOutlines ? '#0A0812' : '#FEF08A',
              border: '2px solid #0A0812',
              boxShadow: activeInkOutlines ? '3px 3px 0px #0A0812' : 'none',
              borderRadius: 9,
              padding: '6px 12px',
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {activeInkOutlines
              ? '✒️ Main Street Cel + Ink Style: ON'
              : '✒️ Main Street Cel + Ink Style: OFF'}
          </button>

          <button
            type="button"
            data-testid="switch-to-bedroom-studio-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              if (typeof window !== 'undefined') {
                window.location.href = '/DarkRoomBedroom';
              }
            }}
            style={{
              backgroundColor: '#1E293B',
              color: '#22D3EE',
              border: '2px solid #22D3EE',
              borderRadius: 9,
              padding: '6px 12px',
              fontSize: 16,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            🛋️📺 Bedroom (Sofa + News TV)
          </button>

          <button
            type="button"
            data-testid="switch-to-crack-and-sons-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              if (typeof window !== 'undefined') {
                window.location.href = '/CrackAndSonsShopInterior';
              }
            }}
            style={{
              backgroundColor: '#1E293B',
              color: '#FACC15',
              border: '2px solid #FACC15',
              borderRadius: 9,
              padding: '6px 12px',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🎄 Crack & Sons Shop
          </button>

          <button
            type="button"
            data-testid="switch-to-exterior-city-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              if (typeof window !== 'undefined') {
                window.location.href = '/MainStreetRoadSection1';
              }
            }}
            style={{
              backgroundColor: '#1E293B',
              color: '#38BDF8',
              border: '2px solid #38BDF8',
              borderRadius: 9,
              padding: '6px 12px',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🏙️ Exterior City
          </button>

          <div
            style={{
              width: 2,
              height: 24,
              backgroundColor: 'rgba(148, 163, 184, 0.35)',
            }}
          />

          <button
            type="button"
            data-testid="launch-mode-concealed-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setLaunchModeOverride('concealed-underground');
            }}
            style={{
              backgroundColor:
                activeLaunchMode === 'concealed-underground'
                  ? '#0284C7'
                  : '#1E293B',
              color: '#FFFFFF',
              border: '2px solid #38BDF8',
              borderRadius: 8,
              padding: '5px 11px',
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            🕳️ Hide Nuke (Ground Closed)
          </button>

          <button
            type="button"
            data-testid="launch-mode-ground-emergence-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setLaunchModeOverride('ground-opening-emergence');
            }}
            style={{
              backgroundColor:
                activeLaunchMode === 'ground-opening-emergence'
                  ? '#D97706'
                  : '#1E293B',
              color: '#FEF08A',
              border: '2px solid #FACC15',
              borderRadius: 8,
              padding: '5px 11px',
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ⚙️ Ground Opens &amp; Nuke Comes Out!
          </button>

          <button
            type="button"
            data-testid="launch-mode-timeline-cycle-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setLaunchModeOverride('timeline-cycle');
            }}
            style={{
              backgroundColor:
                activeLaunchMode === 'timeline-cycle'
                  ? '#7C3AED'
                  : '#1E293B',
              color: '#FFFFFF',
              border: '2px solid #C084FC',
              borderRadius: 8,
              padding: '5px 11px',
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            🎬 Auto Silo Cycle
          </button>

          <button
            type="button"
            data-testid="launch-mode-ignition-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setLaunchModeOverride('full-ignition-blast');
            }}
            style={{
              backgroundColor:
                activeLaunchMode === 'full-ignition-blast'
                  ? '#EF4444'
                  : '#1E293B',
              color: '#FFFFFF',
              border: '2px solid #F87171',
              borderRadius: 8,
              padding: '5px 11px',
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            🔥 Full Ignition Blast!
          </button>

          <button
            type="button"
            data-testid="garage-door-open-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setDoorModeOverride((prev) =>
                prev === 'manual-closed' ? 'manual-open' : 'manual-closed',
              );
            }}
            style={{
              backgroundColor: '#065F46',
              color: '#FFFFFF',
              border: '2px solid #34D399',
              borderRadius: 8,
              padding: '5px 11px',
              fontSize: 15,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🚪 Garage Door ({Math.round(launchState.doorOpenProgress01 * 100)}% Open)
          </button>

          <button
            type="button"
            data-testid="toggle-garage-inventory-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setShowInventoryModal((prev) => !prev);
            }}
            style={{
              backgroundColor: showInventoryModal ? '#F59E0B' : '#78350F',
              color: '#FEF08A',
              border: '2px solid #FACC15',
              borderRadius: 8,
              padding: '5px 12px',
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            📋 {GARAGE_NUCLEAR_LAUNCH_ASSET_TABLE.length} Core + {GARAGE_ULTRA_DETAIL_WORKSHOP_MANIFEST.length} Ultra-Detail Zones ({totalBuiltAssets + 348} Parts)
          </button>

          <span
            data-testid="garage-countdown-live-badge"
            style={{
              backgroundColor: 'rgba(220, 38, 38, 0.28)',
              color: '#FEF08A',
              border: '1px solid #F87171',
              borderRadius: 8,
              padding: '5px 11px',
              fontSize: 14,
              fontWeight: 900,
            }}
          >
            🕳️ Silo Hatch: {Math.round(launchState.siloGroundOpenProgress01 * 100)}% • Lift: {Math.round(launchState.nukeElevatorRiseProgress01 * 100)}% • 📣 {launchState.countdownDigitText}
          </span>
        </div>

        {/* Row 2: Quick-Focus Camera Buttons */}
        <div
          data-testid="garage-quick-focus-bar"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '2px solid rgba(249, 115, 22, 0.75)',
            borderRadius: 14,
            padding: '10px 16px',
            color: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: '0 10px 25px rgba(0,0,0,0.58)',
          }}
        >
          <div style={{fontSize: 16, fontWeight: 700, color: '#FDBA74'}}>
            Click any 3D object (Cartoon Nuke, Rusty Trolley, Bicycle, Garage Door & Tracks, Signs, Tool Cabinet, Shelves) • Or use Quick-Focus:
          </div>

          <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
            <button
              type="button"
              data-testid="focus-nuke-trolley-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setLaunchModeOverride('ground-opening-emergence');
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'sub-floor-nuclear-silo-hatch',
                  label:
                    'Sub-Floor Silo Ground Hatch Opening (78%) & Cartoon Nuke Emerging on Hydraulic Scissor-Lift!',
                  category: 'Sub-Floor Silo Hatch + Emerging Nuke',
                  target: [-0.05, 0.25, -0.35],
                  optimalDistance: 2.35,
                  cameraPosition: [1.85, 1.52, 1.48],
                });
              }}
              style={{
                backgroundColor: '#9A3412',
                color: '#FEF08A',
                border: '2px solid #FACC15',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              🕳️🚀 Inspect Ground Opening &amp; Emerging Nuke
            </button>

            <button
              type="button"
              data-testid="focus-ultra-workshop-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'ultra-detail-workshop-bench-pegboard',
                  label:
                    '1000x Detailed Workshop: Oak Workbench, Cast-Iron Vise, Dual Grinder, 26-Tool Pegboard, Air Compressor & Gantry Hoist',
                  category: '1000x Workshop & Pegboard Tools',
                  target: [-3.45, 1.35, 0.25],
                  optimalDistance: 2.45,
                  cameraPosition: [-0.85, 1.55, 0.85],
                });
              }}
              style={{
                backgroundColor: '#1E293B',
                color: '#FACC15',
                border: '2px solid #FACC15',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              🔧🔨 Inspect 1000x Workbench, Vise, Grinder &amp; 26-Tool Pegboard
            </button>

            <button
              type="button"
              data-testid="focus-garage-door-tracks-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'garage-door-and-tracks-01',
                  label:
                    'Animated 4-Panel Garage Door (1) + 2 Overhead Galvanized Steel J-Tracks, Opener Motor & 3 Reveal Lamps',
                  category: 'Garage Door (1) + Door Tracks (2)',
                  target: [0.0, 1.95, 2.85],
                  optimalDistance: 2.85,
                  cameraPosition: [-1.75, 1.72, -0.55],
                });
              }}
              style={{
                backgroundColor: '#1E293B',
                color: '#38BDF8',
                border: '2px solid #38BDF8',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🚪 Inspect Animated Garage Door &amp; 2 Overhead Tracks
            </button>

            <button
              type="button"
              data-testid="focus-signs-and-fx-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'cardboard-countdown-sign-hype',
                  label:
                    'Cardboard Countdown Sign (1), "NUKE LAUNCH" Sign (1), Silo Launch Console, Welder & Blueprints',
                  category: 'Signs + Silo Console + Welder',
                  target: [0.35, 0.88, -0.35],
                  optimalDistance: 2.35,
                  cameraPosition: [0.15, 1.38, 2.35],
                });
              }}
              style={{
                backgroundColor: '#1E293B',
                color: '#F472B6',
                border: '2px solid #F472B6',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              📣🎛️ Inspect Silo Console, Signs &amp; Welder
            </button>

            <button
              type="button"
              data-testid="focus-garage-clutter-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'tool-cabinet-and-toolbox',
                  label:
                    'Tool Cabinet (1), Toolbox (1), Spare Tire (1), 2 Shelving Racks, 5 Paint Cans, 5 Boxes, Breaker Panel & Blueprint',
                  category: 'Tool Cabinet, Shelves, Paint Cans & Boxes',
                  target: [1.55, 1.05, -2.15],
                  optimalDistance: 2.55,
                  cameraPosition: [-0.85, 1.62, 1.25],
                });
              }}
              style={{
                backgroundColor: '#1E293B',
                color: '#34D399',
                border: '2px solid #34D399',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🧰 Inspect Tool Cabinet, Shelves, Blueprint &amp; Clutter
            </button>

            <button
              type="button"
              data-testid="focus-garage-wide-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInspectedItem(null);
                setCameraPresetOverride('garage-wide-master-overview');
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
              }}
              style={{
                backgroundColor: '#1E293B',
                color: '#E2E8F0',
                border: '2px solid #94A3B8',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🏛️ Wide Garage Master Overview
            </button>
          </div>
        </div>

        {inspectedItem ? (
          <div
            data-testid="garage-active-inspection-card"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '2px solid #F97316',
              borderRadius: 12,
              padding: '8px 16px',
              color: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
            }}
          >
            <div>
              <span
                style={{
                  backgroundColor: '#F97316',
                  color: '#020617',
                  fontWeight: 900,
                  fontSize: 15,
                  padding: '3px 9px',
                  borderRadius: 6,
                  marginRight: 10,
                }}
              >
                {inspectedItem.category}
              </span>
              <span style={{fontSize: 17, fontWeight: 800}}>
                {inspectedItem.label}
              </span>
            </div>
            <div style={{display: 'flex', gap: 8}}>
              <button
                type="button"
                data-testid="garage-inspect-rotate-btn"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setInteractiveOrbit((prev) => ({
                    ...prev,
                    azimuth: prev.azimuth + Math.PI / 2,
                  }));
                }}
                style={{
                  backgroundColor: '#1E293B',
                  color: '#38BDF8',
                  border: '2px solid #38BDF8',
                  borderRadius: 8,
                  padding: '4px 11px',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Orbit 90°
              </button>
              <button
                type="button"
                data-testid="garage-inspect-reset-btn"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setInspectedItem(null);
                  setCameraPresetOverride(null);
                  setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                }}
                style={{
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  border: '2px solid #FCA5A5',
                  borderRadius: 8,
                  padding: '4px 11px',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>
          </div>
        ) : null}

        {showInventoryModal ? (
          <div
            data-testid="garage-inventory-modal"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.97)',
              border: '3px solid #F97316',
              borderRadius: 16,
              padding: '16px 22px',
              color: '#F8FAFC',
              maxHeight: 620,
              overflowY: 'auto',
              boxShadow: '0 24px 48px rgba(0,0,0,0.85)',
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: '#FACC15',
                marginBottom: 10,
              }}
            >
              GARAGE & NUCLEAR LAUNCH SETUP — COMPLETE 24-CATEGORY ASSET MANIFEST
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 9,
              }}
            >
              {GARAGE_NUCLEAR_LAUNCH_ASSET_TABLE.map((row) => (
                <div
                  key={row.id}
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.88)',
                    border: '1px solid rgba(249, 115, 22, 0.35)',
                    borderRadius: 9,
                    padding: '7px 11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: '#FDBA74',
                      }}
                    >
                      {row.assetName} — <span style={{color: '#94A3B8'}}>{row.notes}</span>
                    </div>
                    <div style={{fontSize: 13, color: '#CBD5E1'}}>
                      {row.description}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#065F46',
                      color: '#6EE7B7',
                      padding: '4px 9px',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Built: {row.builtQuantity} (Req: {row.requestedQuantity})
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#34D399',
                marginTop: 14,
                marginBottom: 8,
              }}
            >
              1000X ULTRA-DETAIL WORKSHOP & SUB-FLOOR SILO ASSEMBLIES (+348 SUB-PARTS)
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 8,
              }}
            >
              {GARAGE_ULTRA_DETAIL_WORKSHOP_MANIFEST.map((zone) => (
                <div
                  key={zone.id}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.92)',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: '#A7F3D0',
                      }}
                    >
                      {zone.name}
                    </div>
                    <div style={{fontSize: 12, color: '#CBD5E1'}}>
                      {zone.description}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#064E3B',
                      color: '#34D399',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {zone.subPartCount} Parts
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
