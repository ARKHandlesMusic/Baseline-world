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
  BedroomDoorControlMode,
  DARK_ROOM_ASSET_TABLE,
  DarkRoomCameraPresetId,
  DarkRoomLightModeId,
  PhoneGlowColorModeId,
  computeDarkRoomCameraTransformAtFrame,
  evaluateDarkRoomDoorRigAtFrame,
  evaluatePhoneScreenGlowAtFrame,
} from '../lib/omniframe/dark-room-bedroom-manifest';
import {
  DarkRoomInspectableMeta,
  DarkRoomSceneHandle,
  buildDarkRoomBedroomScene,
} from '../lib/omniframe/three-dark-room-bedroom-builder';
import {SceneCharacterStageOverlay} from '../components/omniframe/characters/SceneCharacterStageOverlay';
import {subscribeToGlbCharacterMounts} from '../lib/omniframe/characters/glb-character-loader';

export const darkRoomBedroomSchema = z.object({
  cameraPreset: z
    .enum([
      'dark-room-choreographed-tour',
      'phone-glow-hero-closeup',
      'desk-setup-closeup',
      'bed-window-posters-overview',
      'sofa-news-tv-window-closeup',
      'rigged-bedroom-door-closeup',
      'dark-room-wide-overview',
    ])
    .default('dark-room-choreographed-tour'),
  lightMode: z
    .enum([
      'full-bedroom-lit',
      'cozy-lamp-and-phone',
      'midnight-neon-and-phone',
    ])
    .default('full-bedroom-lit'),
  phoneGlowColorMode: z
    .enum([
      'auto-ui-sync',
      'electric-cyan',
      'neon-magenta',
      'emerald-matrix',
    ])
    .default('auto-ui-sync'),
  phoneGlowMultiplier: z.number().min(0.4).max(2.4).step(0.05).default(1.25),
  doorControlMode: z
    .enum(['timeline-auto', 'manual-open', 'manual-closed', 'turn-handle-only'])
    .default('timeline-auto'),
  dustIntensity: z.number().min(0).max(1.8).step(0.05).default(1.0),
  inkOutlinesEnabled: z.boolean().default(true),
  wireframeMode: z.boolean().default(false),
  manualOrbitAzimuthRad: z.number().min(-3.14).max(3.14).step(0.05).default(0),
  manualOrbitPolarRad: z.number().min(-0.6).max(0.5).step(0.02).default(0),
  manualZoomDistance: z.number().min(0.4).max(2.0).step(0.05).default(1),
});

export type DarkRoomBedroomProps = z.infer<typeof darkRoomBedroomSchema>;

export const DarkRoomBedroomComposition: React.FC<
  Partial<DarkRoomBedroomProps>
> = ({
  cameraPreset = 'dark-room-choreographed-tour',
  lightMode = 'full-bedroom-lit',
  phoneGlowColorMode = 'auto-ui-sync',
  phoneGlowMultiplier = 1.25,
  doorControlMode = 'timeline-auto',
  dustIntensity = 1.0,
  inkOutlinesEnabled = true,
  wireframeMode = false,
  manualOrbitAzimuthRad = 0,
  manualOrbitPolarRad = 0,
  manualZoomDistance = 1,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const [lightModeOverride, setLightModeOverride] =
    useState<DarkRoomLightModeId | null>(null);
  const [cameraPresetOverride, setCameraPresetOverride] =
    useState<DarkRoomCameraPresetId | null>(null);
  const [phoneColorOverride, setPhoneColorOverride] =
    useState<PhoneGlowColorModeId | null>(null);
  const [phoneGlowBoostOverride, setPhoneGlowBoostOverride] =
    useState<number | null>(null);
  const [doorModeOverride, setDoorModeOverride] =
    useState<BedroomDoorControlMode | null>(null);
  const [inkOutlinesOverride, setInkOutlinesOverride] = useState<
    boolean | null
  >(null);
  const [inspectedItem, setInspectedItem] =
    useState<DarkRoomInspectableMeta | null>(null);
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
  const darkRoomHandleRef = useRef<DarkRoomSceneHandle | null>(null);
  const pointerDownPosRef = useRef<{x: number; y: number} | null>(null);
  const isDraggingRef = useRef(false);

  const activeLightMode: DarkRoomLightModeId =
    lightModeOverride ?? (lightMode as DarkRoomLightModeId);
  const activeCameraPreset: DarkRoomCameraPresetId =
    cameraPresetOverride ?? (cameraPreset as DarkRoomCameraPresetId);
  const activePhoneColorMode: PhoneGlowColorModeId =
    phoneColorOverride ?? (phoneGlowColorMode as PhoneGlowColorModeId);
  const activePhoneGlowMultiplier: number =
    phoneGlowBoostOverride ?? phoneGlowMultiplier;
  const activeDoorControlMode: BedroomDoorControlMode =
    doorModeOverride ?? (doorControlMode as BedroomDoorControlMode);
  const activeInkOutlines: boolean =
    inkOutlinesOverride ?? inkOutlinesEnabled;

  const latestStateRef = useRef({
    frame,
    fps,
    activeLightMode,
    activeCameraPreset,
    activePhoneColorMode,
    activePhoneGlowMultiplier,
    activeDoorControlMode,
    dustIntensity,
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
    const handle = darkRoomHandleRef.current;
    if (!renderer || !scene || !camera || !handle) return;

    const st = latestStateRef.current;
    const camState = computeDarkRoomCameraTransformAtFrame(
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
        offsetVec = new THREE.Vector3(0, dist * 0.35, dist * 0.85);
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
        0.48,
        5.5,
      );
      offsetVec.setFromSpherical(spherical);
    }

    const desiredPos = targetVec.clone().add(offsetVec);
    desiredPos.x = THREE.MathUtils.clamp(desiredPos.x, -3.15, 3.15);
    desiredPos.y = THREE.MathUtils.clamp(desiredPos.y, 0.42, 2.88);
    desiredPos.z = THREE.MathUtils.clamp(desiredPos.z, -2.42, 2.42);

    camera.position.copy(desiredPos);
    camera.lookAt(targetVec);
    const desiredFov = st.inspectedItem ? 40 : camState.fov;
    if (camera.fov !== desiredFov) {
      camera.fov = desiredFov;
      camera.updateProjectionMatrix();
    }

    handle.updateForFrame({
      frame: st.frame,
      fps: st.fps,
      lightMode: st.activeLightMode,
      phoneGlowColorMode: st.activePhoneColorMode,
      phoneGlowMultiplier: st.activePhoneGlowMultiplier,
      doorControlMode: st.activeDoorControlMode,
      dustIntensity: st.dustIntensity,
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

    const camera = new THREE.PerspectiveCamera(46, 16 / 9, 0.08, 35);
    const handle = buildDarkRoomBedroomScene();
    scene.add(handle.rootGroup);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    darkRoomHandleRef.current = handle;

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
      darkRoomHandleRef.current = null;
    };
  }, []);

  useEffect(() => {
    latestStateRef.current = {
      frame,
      fps,
      activeLightMode,
      activeCameraPreset,
      activePhoneColorMode,
      activePhoneGlowMultiplier,
      activeDoorControlMode,
      dustIntensity,
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
    activeLightMode,
    activeCameraPreset,
    activePhoneColorMode,
    activePhoneGlowMultiplier,
    activeDoorControlMode,
    dustIntensity,
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
          const info = curr.userData.inspectable as DarkRoomInspectableMeta;
          setInspectedItem(info);
          setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
          if (info.id === 'rigged-bedroom-door-01') {
            setDoorModeOverride((prev) =>
              prev === 'manual-open' ? 'manual-closed' : 'manual-open',
            );
          }
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

  const phoneGlowState = evaluatePhoneScreenGlowAtFrame({
    frame,
    fps,
    colorMode: activePhoneColorMode,
    glowMultiplier: activePhoneGlowMultiplier,
  });
  const doorRigState = evaluateDarkRoomDoorRigAtFrame({
    frame,
    fps,
    mode: activeDoorControlMode,
  });
  const totalBuiltAssets = DARK_ROOM_ASSET_TABLE.reduce(
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
        name="Bedroom 01: Room Shell (1), Floor & 4 Walls (1 Set), Ceiling Ring Chandelier + 4 Downlights, Window (1) & Curtains/Blinds (1 Set)"
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
        name="Bedroom 02: Smartphone (1) + 60fps Phone Screen/UI (1 Interface) + Multi-Source Bedroom Lighting Rig"
        from={0}
        durationInFrames={480}
      >
        <div style={{display: 'none'}} />
      </Sequence>
      <Sequence
        name="Bedroom 03: Desk (1), Chair (1), Computer Monitor (1), Mechanical Keyboard (1), Mouse (1) & Active Desk Lamp (1)"
        from={0}
        durationInFrames={480}
      >
        <div style={{display: 'none'}} />
      </Sequence>
      <Sequence
        name="Bedroom 04: Bed (1), Blanket & Pillow (1 Set), Sunglasses (1 Pair), Water Bottle (1) & 3 Wall Posters"
        from={0}
        durationInFrames={480}
      >
        <div style={{display: 'none'}} />
      </Sequence>
      <Sequence
        name="Bedroom 05: Rigged Bedroom Door (1) with Articulated Handle & 120 Volumetric Dust Motes"
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
            data-testid="bedroom-main-street-comic-frame"
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
        name="Style Layer: Main Street 2D Comic Ink Line Art & Frame"
        from={0}
        durationInFrames={480}
      >
        {activeInkOutlines ? (
          <div
            data-testid="bedroom-main-street-comic-frame"
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
        name="Cast: Hacker Friend, Main Boy, Squad Member A & Pigeon Outside Window"
        from={0}
        durationInFrames={480}
      >
        <SceneCharacterStageOverlay
          sceneContext="dark-room-bedroom"
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
          maxWidth: 1760,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Row 1: Scene Switchers + Room Lighting Mode + Inventory Button */}
        <div
          data-testid="dark-room-top-control-bar"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            border: '2px solid #22D3EE',
            borderRadius: 14,
            padding: '10px 16px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 12px 28px rgba(0,0,0,0.65)',
          }}
        >
          <span
            style={{
              backgroundColor: '#0E7490',
              color: '#ECFEFF',
              border: '2px solid #22D3EE',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: '0.04em',
            }}
          >
            🛏️ BEDROOM STUDIO • TRANSPARENT CITY WINDOW + ROOM LIGHTS
          </span>

          <button
            type="button"
            data-testid="bedroom-toggle-ink-style-btn"
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
            data-testid="switch-to-garage-nuke-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              if (typeof window !== 'undefined') {
                window.location.href = '/GarageNuclearLaunch';
              }
            }}
            style={{
              backgroundColor: '#7F1D1D',
              color: '#FEF08A',
              border: '2px solid #F97316',
              borderRadius: 9,
              padding: '6px 12px',
              fontSize: 16,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            🚀 Garage & Nuke Launch
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

          <span style={{color: '#E2E8F0', fontSize: 15, fontWeight: 800}}>
            ROOM LIGHTING:
          </span>

          <button
            type="button"
            data-testid="light-mode-full-bedroom-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setLightModeOverride('full-bedroom-lit');
            }}
            style={{
              backgroundColor:
                activeLightMode === 'full-bedroom-lit' ? '#FACC15' : '#1E293B',
              color:
                activeLightMode === 'full-bedroom-lit' ? '#020617' : '#FEF08A',
              border: '2px solid #FACC15',
              borderRadius: 8,
              padding: '5px 11px',
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            💡 Full Room Lights + Phone Glow
          </button>

          <button
            type="button"
            data-testid="light-mode-desk-lamp-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setLightModeOverride('cozy-lamp-and-phone');
            }}
            style={{
              backgroundColor:
                activeLightMode === 'cozy-lamp-and-phone'
                  ? '#F59E0B'
                  : '#1E293B',
              color:
                activeLightMode === 'cozy-lamp-and-phone'
                  ? '#020617'
                  : '#FDE047',
              border: '2px solid #F59E0B',
              borderRadius: 8,
              padding: '5px 11px',
              fontSize: 15,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🕯️ Cozy Lamp + Bedside + Phone
          </button>

          <button
            type="button"
            data-testid="light-mode-midnight-neon-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setLightModeOverride('midnight-neon-and-phone');
            }}
            style={{
              backgroundColor:
                activeLightMode === 'midnight-neon-and-phone'
                  ? '#A855F7'
                  : '#1E293B',
              color: '#FFFFFF',
              border: '2px solid #C084FC',
              borderRadius: 8,
              padding: '5px 11px',
              fontSize: 15,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🌆 Window Neon + Phone
          </button>

          <button
            type="button"
            data-testid="toggle-dark-room-inventory-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setShowInventoryModal((prev) => !prev);
            }}
            style={{
              backgroundColor: showInventoryModal ? '#10B981' : '#065F46',
              color: '#FFFFFF',
              border: '2px solid #34D399',
              borderRadius: 8,
              padding: '5px 12px',
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            📋 {DARK_ROOM_ASSET_TABLE.length} Categories ({totalBuiltAssets} Built Items)
          </button>

          <span
            data-testid="phone-glow-live-badge"
            style={{
              backgroundColor: 'rgba(8, 145, 178, 0.35)',
              color: '#67E8F9',
              border: '1px solid #22D3EE',
              borderRadius: 8,
              padding: '5px 11px',
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            📱 {phoneGlowState.screenHeadline}
          </span>
        </div>

        {/* Row 2: Quick-Focus Camera Bar + Interactive Smartphone Glow & Bedroom Door Controls */}
        <div
          data-testid="dark-room-quick-focus-bar"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '2px solid rgba(34, 211, 238, 0.72)',
            borderRadius: 14,
            padding: '10px 16px',
            color: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: '0 10px 25px rgba(0,0,0,0.55)',
          }}
        >
          <div style={{fontSize: 16, fontWeight: 700, color: '#67E8F9'}}>
            Click any 3D object (Smartphone UI, Sunglasses, Water Bottle, Monitor, Bed, Window, Posters, Door) • Or use Quick-Focus:
          </div>

          <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
            <button
              type="button"
              data-testid="focus-phone-glow-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'hero-smartphone-01',
                  label:
                    'Smartphone (1) + 60fps OLED Phone Screen/UI (1 Interface), Sunglasses (1 Pair) & Water Bottle (1)',
                  category: 'Phone UI, Sunglasses & Water Bottle',
                  target: [-0.05, 0.81, -1.96],
                  optimalDistance: 0.78,
                  cameraPosition: [0.08, 1.08, -1.32],
                });
              }}
              style={{
                backgroundColor: '#0E7490',
                color: '#FEF08A',
                border: '2px solid #22D3EE',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              📱 Inspect Smartphone UI, Sunglasses & Bottle
            </button>

            <button
              type="button"
              data-testid="focus-desk-monitor-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'computer-monitor-01',
                  label:
                    'Creator Desk (1), Swivel Chair (1), 27" Monitor (1), Mechanical Keyboard (1), Mouse (1) & Desk Lamp (1)',
                  category: 'Desk, Chair, Monitor, Keyboard, Mouse & Lamp',
                  target: [-0.42, 0.92, -2.14],
                  optimalDistance: 1.45,
                  cameraPosition: [0.18, 1.38, -0.95],
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
              🖥️ Inspect Desk, Chair, Monitor, Keyboard, Mouse & Lamp
            </button>

            <button
              type="button"
              data-testid="focus-bed-window-posters-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'bed-and-blanket-pillow-set',
                  label:
                    'Platform Bed (1), Quilted Blanket & 3 Pillows (1 Set), Window (1), Curtains/Blinds (1 Set) & 3 Wall Posters',
                  category: 'Bed, Blanket/Pillows, Window, Blinds & 3 Posters',
                  target: [0.65, 1.15, -1.05],
                  optimalDistance: 2.2,
                  cameraPosition: [-0.85, 1.68, 1.55],
                });
              }}
              style={{
                backgroundColor: '#1E293B',
                color: '#E879F9',
                border: '2px solid #E879F9',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🛏️ Inspect Bed, Blanket/Pillows, Window Blinds & 3 Posters
            </button>

            <button
              type="button"
              data-testid="focus-sofa-news-tv-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'sofa-news-tv-window-01',
                  label:
                    'Plush Lounge Sofa (1), 55" TV Playing Live Breaking News (1) & Adjacent Lounge Window (1)',
                  category: 'Sofa + News TV + Window',
                  target: [-1.65, 1.08, 2.15],
                  optimalDistance: 2.25,
                  cameraPosition: [0.25, 1.55, 0.35],
                });
              }}
              style={{
                backgroundColor: '#7C2D12',
                color: '#FEF08A',
                border: '2px solid #F97316',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              🛋️📺 Inspect Sofa, News TV & Window
            </button>

            <button
              type="button"
              data-testid="focus-bedroom-door-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'rigged-bedroom-door-01',
                  label:
                    'Rigged 6-Panel Bedroom Door (1): Articulated Handle (38° Turn), Latch Bolt & Warm Hallway Spill',
                  category: 'Rigged Room Door (1)',
                  target: [1.85, 1.15, 2.68],
                  optimalDistance: 1.85,
                  cameraPosition: [0.65, 1.38, 0.95],
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
              🚪 Inspect Rigged Room Door
            </button>

            <button
              type="button"
              data-testid="focus-dark-room-wide-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInspectedItem(null);
                setCameraPresetOverride('dark-room-wide-overview');
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
              🏛️ Wide Illuminated Bedroom Overview
            </button>
          </div>

          {/* Sub-Bar: Interactive Phone Glow Color / Intensity + Bedroom Door Handle Controls */}
          <div
            data-testid="phone-glow-and-door-subbar"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              paddingTop: 6,
              borderTop: '1px solid rgba(148, 163, 184, 0.28)',
            }}
          >
            <span style={{color: '#22D3EE', fontSize: 15, fontWeight: 900}}>
              📱 PHONE GLOW COLOR:
            </span>

            <button
              type="button"
              data-testid="phone-color-cyan-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setPhoneColorOverride('electric-cyan');
              }}
              style={{
                backgroundColor:
                  activePhoneColorMode === 'electric-cyan'
                    ? '#22D3EE'
                    : '#1E293B',
                color:
                  activePhoneColorMode === 'electric-cyan'
                    ? '#020617'
                    : '#67E8F9',
                border: '1px solid #22D3EE',
                borderRadius: 7,
                padding: '4px 10px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              💎 Electric Cyan
            </button>

            <button
              type="button"
              data-testid="phone-color-magenta-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setPhoneColorOverride('neon-magenta');
              }}
              style={{
                backgroundColor:
                  activePhoneColorMode === 'neon-magenta'
                    ? '#F472B6'
                    : '#1E293B',
                color:
                  activePhoneColorMode === 'neon-magenta'
                    ? '#020617'
                    : '#F9A8D4',
                border: '1px solid #F472B6',
                borderRadius: 7,
                padding: '4px 10px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🔮 Neon Magenta
            </button>

            <button
              type="button"
              data-testid="phone-glow-surge-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setPhoneGlowBoostOverride((prev) =>
                  prev && prev > 1.7 ? 1.25 : 2.1,
                );
              }}
              style={{
                backgroundColor:
                  activePhoneGlowMultiplier > 1.7 ? '#FACC15' : '#1E293B',
                color:
                  activePhoneGlowMultiplier > 1.7 ? '#020617' : '#FEF08A',
                border: '1px solid #FACC15',
                borderRadius: 7,
                padding: '4px 10px',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              ⚡ {activePhoneGlowMultiplier > 1.7 ? '210% Max Glow Surge ON' : 'Boost Phone Glow (210%)'}
            </button>

            <div
              style={{
                width: 2,
                height: 20,
                backgroundColor: 'rgba(148, 163, 184, 0.3)',
              }}
            />

            <span style={{color: '#34D399', fontSize: 15, fontWeight: 900}}>
              🚪 ROOM DOOR:
            </span>

            <button
              type="button"
              data-testid="bedroom-door-open-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setDoorModeOverride('manual-open');
              }}
              style={{
                backgroundColor:
                  activeDoorControlMode === 'manual-open'
                    ? '#10B981'
                    : '#1E293B',
                color: '#FFFFFF',
                border: '1px solid #34D399',
                borderRadius: 7,
                padding: '4px 10px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🔑 Turn Handle & Open Door (58°)
            </button>

            <button
              type="button"
              data-testid="bedroom-door-close-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setDoorModeOverride('manual-closed');
              }}
              style={{
                backgroundColor:
                  activeDoorControlMode === 'manual-closed'
                    ? '#EF4444'
                    : '#1E293B',
                color: '#FFFFFF',
                border: '1px solid #F87171',
                borderRadius: 7,
                padding: '4px 10px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🔒 Close Door
            </button>

            <span
              style={{
                color: '#94A3B8',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {doorRigState.phaseLabel}
            </span>
          </div>
        </div>

        {inspectedItem ? (
          <div
            data-testid="dark-room-active-inspection-card"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '2px solid #22D3EE',
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
                  backgroundColor: '#22D3EE',
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
                data-testid="dark-room-inspect-rotate-btn"
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
                data-testid="dark-room-inspect-reset-btn"
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
            data-testid="dark-room-inventory-modal"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.97)',
              border: '3px solid #22D3EE',
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
                color: '#22D3EE',
                marginBottom: 10,
              }}
            >
              BEDROOM STUDIO — COMPLETE ASSET MANIFEST & MULTI-SOURCE LIGHTING RIG
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 9,
              }}
            >
              {DARK_ROOM_ASSET_TABLE.map((row) => (
                <div
                  key={row.id}
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.88)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
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
                        color: '#67E8F9',
                      }}
                    >
                      {row.assetName}
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
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
