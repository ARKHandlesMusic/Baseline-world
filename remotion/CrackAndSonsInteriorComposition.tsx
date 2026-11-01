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
  CRACK_AND_SONS_INTERIOR_ASSET_TABLE,
  InteriorCameraPresetId,
  InteriorLightMoodId,
  ShopDoorControlMode,
  computeInteriorCameraTransformAtFrame,
  evaluateShopDoorRigState,
  evaluateStoreTvAdStateAtFrame,
} from '../lib/omniframe/crack-and-sons-interior-manifest';
import {
  CrackAndSonsInteriorHandle,
  buildCrackAndSonsInteriorScene,
} from '../lib/omniframe/three-crack-and-sons-interior-builder';
import {SceneCharacterStageOverlay} from '../components/omniframe/characters/SceneCharacterStageOverlay';
import {subscribeToGlbCharacterMounts} from '../lib/omniframe/characters/glb-character-loader';
export interface InteriorInspectedItem {
  id: string;
  label: string;
  category: string;
  target: [number, number, number];
  optimalDistance: number;
  cameraPosition?: [number, number, number];
}

export const crackAndSonsInteriorSchema = z.object({
  cameraPreset: z
    .enum([
      'interior-choreographed-tour',
      'hero-nutcracker-closeup',
      'counter-and-register-closeup',
      'tv-commercial-showcase',
      'shelves-and-ornaments-closeup',
      'entrance-doorbell-chime',
      'rigged-door-handle-closeup',
      'interior-wide-overview',
    ])
    .default('interior-choreographed-tour'),
  lightMood: z
    .enum(['warm-boutique', 'festive-golden', 'closing-twilight'])
    .default('warm-boutique'),
  doorControlMode: z
    .enum(['timeline-auto', 'manual-open', 'manual-closed', 'turn-handle-only'])
    .default('timeline-auto'),
  manualDoorOpenProgress: z.number().min(0).max(1).step(0.02).default(1),
  inkOutlinesEnabled: z.boolean().default(true),
  dustIntensity: z.number().min(0).max(1.5).step(0.05).default(1.0),
  wireframeMode: z.boolean().default(false),
  manualOrbitAzimuthRad: z.number().min(-3.14).max(3.14).step(0.05).default(0),
  manualOrbitPolarRad: z.number().min(-0.6).max(0.5).step(0.02).default(0),
  manualZoomDistance: z.number().min(0.4).max(2.0).step(0.05).default(1),
});

export type CrackAndSonsInteriorProps = z.infer<
  typeof crackAndSonsInteriorSchema
>;

export const CrackAndSonsInteriorComposition: React.FC<
  Partial<CrackAndSonsInteriorProps> & {onSwitchToExterior?: () => void}
> = ({
  cameraPreset = 'interior-choreographed-tour',
  lightMood = 'warm-boutique',
  doorControlMode = 'timeline-auto',
  manualDoorOpenProgress = 1,
  inkOutlinesEnabled = true,
  dustIntensity = 1.0,
  wireframeMode = false,
  manualOrbitAzimuthRad = 0,
  manualOrbitPolarRad = 0,
  manualZoomDistance = 1,
  onSwitchToExterior,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const [lightMoodOverride, setLightMoodOverride] =
    useState<InteriorLightMoodId | null>(null);
  const [cameraPresetOverride, setCameraPresetOverride] =
    useState<InteriorCameraPresetId | null>(null);
  const [doorControlModeOverride, setDoorControlModeOverride] =
    useState<ShopDoorControlMode | null>(null);
  const [manualDoorProgressOverride, setManualDoorProgressOverride] =
    useState<number | null>(null);
  const [inkOutlinesOverride, setInkOutlinesOverride] = useState<
    boolean | null
  >(null);
  const [inspectedItem, setInspectedItem] =
    useState<InteriorInspectedItem | null>(null);
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
  const interiorHandleRef = useRef<CrackAndSonsInteriorHandle | null>(null);
  const pointerDownPosRef = useRef<{x: number; y: number} | null>(null);
  const isDraggingRef = useRef(false);

  const activeLightMood: InteriorLightMoodId =
    lightMoodOverride ?? (lightMood as InteriorLightMoodId);
  const activeCameraPreset: InteriorCameraPresetId =
    cameraPresetOverride ?? (cameraPreset as InteriorCameraPresetId);
  const activeDoorControlMode: ShopDoorControlMode =
    doorControlModeOverride ?? (doorControlMode as ShopDoorControlMode);
  const activeManualDoorProgress: number =
    manualDoorProgressOverride ?? manualDoorOpenProgress;
  const activeInkOutlines: boolean =
    inkOutlinesOverride ?? inkOutlinesEnabled;

  const latestStateRef = useRef({
    frame,
    fps,
    activeLightMood,
    activeCameraPreset,
    activeDoorControlMode,
    activeManualDoorProgress,
    inkOutlinesEnabled: activeInkOutlines,
    dustIntensity,
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
    const handle = interiorHandleRef.current;
    if (!renderer || !scene || !camera || !handle) return;

    const st = latestStateRef.current;
    const camState = computeInteriorCameraTransformAtFrame(
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
        0.75,
        6.2,
      );
      offsetVec.setFromSpherical(spherical);
    }

    const desiredPos = targetVec.clone().add(offsetVec);
    // Clamp camera inside the 8.8m × 6.8m × 4.2m room shell so walls never block view
    desiredPos.x = THREE.MathUtils.clamp(desiredPos.x, -3.55, 3.55);
    desiredPos.y = THREE.MathUtils.clamp(desiredPos.y, 0.45, 3.75);
    desiredPos.z = THREE.MathUtils.clamp(desiredPos.z, -2.55, 2.85);

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
      lightMood: st.activeLightMood,
      inkOutlinesEnabled: st.inkOutlinesEnabled,
      dustIntensity: st.dustIntensity,
      wireframeMode: st.wireframeMode,
      doorControlMode: st.activeDoorControlMode,
      manualDoorOpenProgress: st.activeManualDoorProgress,
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
    renderer.toneMappingExposure = 1.15;

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#27130A');

    const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 45);
    const handle = buildCrackAndSonsInteriorScene();
    scene.add(handle.rootGroup);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    interiorHandleRef.current = handle;

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
      interiorHandleRef.current = null;
    };
  }, []);

  useEffect(() => {
    latestStateRef.current = {
      frame,
      fps,
      activeLightMood,
      activeCameraPreset,
      activeDoorControlMode,
      activeManualDoorProgress,
      inkOutlinesEnabled: activeInkOutlines,
      dustIntensity,
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
    activeLightMood,
    activeCameraPreset,
    activeDoorControlMode,
    activeManualDoorProgress,
    activeInkOutlines,
    dustIntensity,
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
          const info = curr.userData.inspectable as InteriorInspectedItem;
          setInspectedItem(info);
          setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
          if (info.id === 'rigged-shop-door-and-handle') {
            setDoorControlModeOverride((prev) =>
              prev === 'manual-open' ? 'manual-closed' : 'manual-open',
            );
            setManualDoorProgressOverride(1);
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

  const tvAdState = evaluateStoreTvAdStateAtFrame(frame, fps);
  const doorRigState = evaluateShopDoorRigState({
    frame,
    fps,
    mode: activeDoorControlMode,
    manualProgress01: activeManualDoorProgress,
  });
  const handleDeg = Math.round((doorRigState.handleTurnAngleRad * 180) / Math.PI);
  const latchMm = Math.round(doorRigState.latchRetractionMeters * 1000);
  const doorSwingDeg = Math.round((doorRigState.doorSwingAngleRad * 180) / Math.PI);

  const totalBuiltAssets = CRACK_AND_SONS_INTERIOR_ASSET_TABLE.reduce(
    (acc, row) => acc + row.builtQuantity,
    0,
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1E0E07',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <Sequence
        name="Interior 01: Room Shell (1), Herringbone Wooden Floor (1), 4 Walls, Coffered Ceiling (1) & Victorian Rug (1)"
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
        name="Interior 02: 5 Carved Mahogany Display Shelves + Decorated Wooden Counter (3 Boards) + Brass Cash Register"
        from={0}
        durationInFrames={480}
      >
        <div style={{display: 'none'}} />
      </Sequence>
      <Sequence
        name="Interior 03: Hero Nutcracker Masterpiece (1) on Velvet Pedestal + 14 Unique Nutcracker Display Dolls"
        from={0}
        durationInFrames={480}
      >
        <div style={{display: 'none'}} />
      </Sequence>
      <Sequence
        name="Interior 04: 10 Gift Boxes, 8 Wrapped Presents, 12 Ornaments, Small Christmas Tree, 3 Garlands & Wreath"
        from={0}
        durationInFrames={480}
      >
        <div style={{display: 'none'}} />
      </Sequence>
      <Sequence
        name="Interior 05: 2 Live 2D Animated Store Ad TVs, 10 Price Tags, Wrapping Rolls, Ribbons, Bell, Doorbell & Dust Motes"
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
            data-testid="interior-main-street-comic-frame"
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
        name="Cast: Main Boy, Main Girl, Nutcracker Hero & Shop Window Dolls + Dog Outside"
        from={0}
        durationInFrames={480}
      >
        <SceneCharacterStageOverlay
          sceneContext="crack-and-sons-shop"
          visible={true}
        />
      </Sequence>

      {/* Top Interactive Director HUD */}
      <div
        onPointerDown={(ev) => ev.stopPropagation()}
        onMouseDown={(ev) => ev.stopPropagation()}
        style={{
          position: 'absolute',
          top: 40,
          left: 48,
          zIndex: 9999,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          maxWidth: 1740,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Row 1: Scene Switcher + Lighting Mood + TV Ad Status + Inventory Badge */}
        <div
          data-testid="interior-top-control-bar"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            border: '2px solid #FACC15',
            borderRadius: 14,
            padding: '10px 16px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 12px 28px rgba(0,0,0,0.55)',
          }}
        >
          <span
            style={{
              backgroundColor: '#B91C1C',
              color: '#FEF08A',
              border: '2px solid #FACC15',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: '0.04em',
            }}
          >
            🎄 CRACK & SONS SHOP INTERIOR
          </span>

          <button
            type="button"
            data-testid="interior-toggle-ink-style-btn"
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
            data-testid="switch-to-dark-room-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              if (typeof window !== 'undefined') {
                window.location.href = '/DarkRoomBedroom';
              }
            }}
            style={{
              backgroundColor: '#0E7490',
              color: '#ECFEFF',
              border: '2px solid #22D3EE',
              borderRadius: 10,
              padding: '6px 13px',
              fontSize: 17,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🌙 Switch to Dark Room
          </button>

          <button
            type="button"
            data-testid="switch-to-exterior-city-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              if (onSwitchToExterior) {
                onSwitchToExterior();
              } else if (typeof window !== 'undefined') {
                window.location.href = '/MainStreetRoadSection1';
              }
            }}
            style={{
              backgroundColor: '#1E293B',
              color: '#38BDF8',
              border: '2px solid #38BDF8',
              borderRadius: 10,
              padding: '6px 13px',
              fontSize: 17,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🏙️ Switch to Exterior City
          </button>

          <div
            style={{
              width: 2,
              height: 26,
              backgroundColor: 'rgba(148, 163, 184, 0.4)',
            }}
          />

          <span style={{color: '#CBD5E1', fontSize: 16, fontWeight: 700}}>
            LIGHTING:
          </span>

          <button
            type="button"
            data-testid="interior-mood-warm-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setLightMoodOverride('warm-boutique');
            }}
            style={{
              backgroundColor:
                activeLightMood === 'warm-boutique' ? '#FACC15' : '#1E293B',
              color:
                activeLightMood === 'warm-boutique' ? '#0F172A' : '#FDE047',
              border: '2px solid #FACC15',
              borderRadius: 9,
              padding: '6px 12px',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🕯️ Warm Boutique
          </button>

          <button
            type="button"
            data-testid="interior-mood-festive-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setLightMoodOverride('festive-golden');
            }}
            style={{
              backgroundColor:
                activeLightMood === 'festive-golden' ? '#F59E0B' : '#1E293B',
              color:
                activeLightMood === 'festive-golden' ? '#0F172A' : '#FDE68A',
              border: '2px solid #F59E0B',
              borderRadius: 9,
              padding: '6px 12px',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ✨ Festive Golden
          </button>

          <button
            type="button"
            data-testid="interior-mood-twilight-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setLightMoodOverride('closing-twilight');
            }}
            style={{
              backgroundColor:
                activeLightMood === 'closing-twilight' ? '#6366F1' : '#1E293B',
              color: '#FFFFFF',
              border: '2px solid #818CF8',
              borderRadius: 9,
              padding: '6px 12px',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🌙 Closing Twilight
          </button>

          <button
            type="button"
            data-testid="toggle-inventory-checklist-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setShowInventoryModal((prev) => !prev);
            }}
            style={{
              backgroundColor: showInventoryModal ? '#10B981' : '#065F46',
              color: '#FFFFFF',
              border: '2px solid #34D399',
              borderRadius: 9,
              padding: '6px 13px',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            📋 26/26 Categories ({totalBuiltAssets} Built Items)
          </button>

          <span
            data-testid="tv-ad-live-badge"
            style={{
              backgroundColor: 'rgba(185, 28, 28, 0.9)',
              color: '#FEF08A',
              border: '1px solid #FACC15',
              borderRadius: 8,
              padding: '5px 12px',
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            📺 TV AD: {tvAdState.bannerHeadline}
          </span>
        </div>

        {/* Row 2: Always-Visible Quick-Focus Bar + Rigged Door & Handle Interactive Controls */}
        <div
          data-testid="interior-quick-focus-bar"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            border: '2px solid rgba(250, 204, 21, 0.75)',
            borderRadius: 14,
            padding: '10px 16px',
            color: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            gap: 9,
            boxShadow: '0 10px 25px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{fontSize: 17, fontWeight: 700, color: '#FEF08A'}}>
            Click any 3D object (Rigged Door & Handle, Hero Nutcracker, 14 Display Dolls, Cupboards, TV Ads) • Or use Quick-Focus:
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
            <button
              type="button"
              data-testid="focus-hero-nutcracker-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'hero-nutcracker-01',
                  label:
                    'Hero Nutcracker Masterpiece (Articulated Jaw, Teeth, Crown, Braided Hussar Coat, Saber & Lever)',
                  category: 'Hero Nutcracker (100% Detail)',
                  target: [1.35, 1.92, -0.35],
                  optimalDistance: 1.8,
                  cameraPosition: [-0.15, 2.05, 1.55],
                });
              }}
              style={{
                backgroundColor: '#991B1B',
                color: '#FEF08A',
                border: '2px solid #FACC15',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              👑 Inspect Hero Nutcracker (100% Detail)
            </button>

            <button
              type="button"
              data-testid="focus-shelves-ornaments-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'shelf-unit-01',
                  label:
                    'Carved Mahogany Display Cupboards (Zero Phasing), 14 Nutcracker Dolls, Ornaments & 10 Price Tags',
                  category: 'Display Cupboards & Toys',
                  target: [-3.75, 1.65, -0.45],
                  optimalDistance: 2.4,
                  cameraPosition: [-1.15, 1.78, 0.55],
                });
              }}
              style={{
                backgroundColor: '#1E293B',
                color: '#34D399',
                border: '2px solid #34D399',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🏷️ Inspect Cupboards, 14 Dolls & Price Tags
            </button>

            <button
              type="button"
              data-testid="focus-rigged-door-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'rigged-shop-door-and-handle',
                  label:
                    'Rigged Shop Entrance Door: Articulated Brass Handle (39° Turn), Retracting Mortise Latch Bolt & 66° Hinge Swing',
                  category: 'Rigged Shop Door & Handle',
                  target: [1.38, 1.18, 3.05],
                  optimalDistance: 1.85,
                  cameraPosition: [0.35, 1.42, 1.25],
                });
              }}
              style={{
                backgroundColor: '#7C2D12',
                color: '#FDE047',
                border: '2px solid #FB923C',
                borderRadius: 8,
                padding: '6px 13px',
                fontSize: 16,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              🚪 Inspect Rigged Door & Handle
            </button>

            <button
              type="button"
              data-testid="focus-store-ad-tv-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'shop-ad-tv-east',
                  label:
                    'Shop TV Monitors Playing Live 60fps 2D Animated "CRACK & SONS" Store Commercial',
                  category: '2D Animated Store Advertisement TV',
                  target: [4.08, 2.58, -2.05],
                  optimalDistance: 2.1,
                  cameraPosition: [1.85, 2.45, -0.85],
                });
              }}
              style={{
                backgroundColor: '#1E293B',
                color: '#38BDF8',
                border: '2px solid #38BDF8',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              📺 Inspect 2D Animated Store Ad TV
            </button>

            <button
              type="button"
              data-testid="focus-counter-register-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'decorated-wooden-counter-register',
                  label:
                    'Decorated Wooden Counter, Brass Cash Register, 3 Menu Boards, Wrapping Rolls, Ribbons & Bell',
                  category: 'Wooden Counter & Cash Register',
                  target: [0, 1.05, -1.85],
                  optimalDistance: 2.2,
                  cameraPosition: [-0.25, 1.68, 0.45],
                });
              }}
              style={{
                backgroundColor: '#1E293B',
                color: '#FACC15',
                border: '2px solid #FACC15',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🛎️ Inspect Counter, Boards & Cash Register
            </button>

            <button
              type="button"
              data-testid="focus-doorbell-tree-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                setInspectedItem({
                  id: 'small-christmas-tree-01',
                  label:
                    'Small Christmas Tree, Wrapped Presents, Wreath, Entrance Doorbell & Window Nutcracker Army',
                  category: 'Holiday Tree, Wreath & Doorbell',
                  target: [-1.95, 1.25, 2.05],
                  optimalDistance: 2.4,
                  cameraPosition: [0.35, 1.85, 0.25],
                });
              }}
              style={{
                backgroundColor: '#1E293B',
                color: '#F472B6',
                border: '2px solid #F472B6',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🎄 Inspect Christmas Tree & Presents
            </button>

            <button
              type="button"
              data-testid="focus-wide-interior-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setInspectedItem(null);
                setCameraPresetOverride('interior-wide-overview');
                setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
              }}
              style={{
                backgroundColor: '#1E293B',
                color: '#E2E8F0',
                border: '2px solid #94A3B8',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🏛️ Wide Boutique Overview
            </button>
          </div>

          {/* Interactive Rigged Door & Handle Sub-Bar */}
          <div
            data-testid="rigged-door-control-bar"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              paddingTop: 6,
              borderTop: '1px solid rgba(148, 163, 184, 0.3)',
            }}
          >
            <span
              style={{
                color: '#FDE047',
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: '0.03em',
              }}
            >
              🚪 RIGGED SHOP DOOR & HANDLE:
            </span>

            <button
              type="button"
              data-testid="door-open-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setDoorControlModeOverride('manual-open');
                setManualDoorProgressOverride(1);
              }}
              style={{
                backgroundColor:
                  activeDoorControlMode === 'manual-open'
                    ? '#10B981'
                    : '#1E293B',
                color: '#FFFFFF',
                border: '2px solid #34D399',
                borderRadius: 8,
                padding: '5px 12px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🔑 Turn Handle & Open Door (66°)
            </button>

            <button
              type="button"
              data-testid="door-turn-handle-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setDoorControlModeOverride('turn-handle-only');
                setManualDoorProgressOverride(0.28);
              }}
              style={{
                backgroundColor:
                  activeDoorControlMode === 'turn-handle-only'
                    ? '#F59E0B'
                    : '#1E293B',
                color:
                  activeDoorControlMode === 'turn-handle-only'
                    ? '#0F172A'
                    : '#FDE68A',
                border: '2px solid #F59E0B',
                borderRadius: 8,
                padding: '5px 12px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🫳 Turn Handle & Unlatch Only (39°)
            </button>

            <button
              type="button"
              data-testid="door-close-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setDoorControlModeOverride('manual-closed');
                setManualDoorProgressOverride(0);
              }}
              style={{
                backgroundColor:
                  activeDoorControlMode === 'manual-closed'
                    ? '#EF4444'
                    : '#1E293B',
                color: '#FFFFFF',
                border: '2px solid #F87171',
                borderRadius: 8,
                padding: '5px 12px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🔒 Close & Latch Door
            </button>

            <button
              type="button"
              data-testid="door-auto-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                setDoorControlModeOverride('timeline-auto');
              }}
              style={{
                backgroundColor:
                  activeDoorControlMode === 'timeline-auto'
                    ? '#3B82F6'
                    : '#1E293B',
                color: '#FFFFFF',
                border: '2px solid #60A5FA',
                borderRadius: 8,
                padding: '5px 12px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🔄 Timeline Auto-Cycle
            </button>

            <span
              data-testid="door-rig-telemetry-badge"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                color: '#6EE7B7',
                border: '1px solid #34D399',
                borderRadius: 8,
                padding: '5px 11px',
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              Handle Turn: {handleDeg}° • Latch Retracted: {latchMm}mm • Door Swing: {doorSwingDeg}° ({doorRigState.phaseLabel})
            </span>
          </div>
        </div>
        {inspectedItem ? (
          <div
            data-testid="interior-active-inspection-card"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.94)',
              border: '3px solid #FACC15',
              borderRadius: 14,
              padding: '10px 18px',
              color: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div>
              <span
                style={{
                  backgroundColor: '#FACC15',
                  color: '#0F172A',
                  fontWeight: 900,
                  fontSize: 16,
                  padding: '3px 10px',
                  borderRadius: 6,
                  marginRight: 10,
                }}
              >
                {inspectedItem.category}
              </span>
              <span style={{fontSize: 19, fontWeight: 800}}>
                {inspectedItem.label}
              </span>
            </div>
            <div style={{display: 'flex', gap: 8}}>
              <button
                type="button"
                data-testid="interior-inspect-rotate-btn"
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
                  padding: '5px 12px',
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Orbit 90°
              </button>
              <button
                type="button"
                data-testid="interior-inspect-reset-btn"
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
                  padding: '5px 12px',
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>
          </div>
        ) : null}

        {/* Optional 26/26 Asset Inventory Checklist Drawer */}
        {showInventoryModal ? (
          <div
            data-testid="interior-inventory-modal"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.96)',
              border: '3px solid #34D399',
              borderRadius: 16,
              padding: '18px 24px',
              color: '#F8FAFC',
              maxHeight: 680,
              overflowY: 'auto',
              boxShadow: '0 24px 48px rgba(0,0,0,0.75)',
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#34D399',
                marginBottom: 12,
              }}
            >
              CRACK & SONS SHOP INTERIOR — COMPLETE 26-CATEGORY ASSET MANIFEST
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 10,
              }}
            >
              {CRACK_AND_SONS_INTERIOR_ASSET_TABLE.map((row) => (
                <div
                  key={row.id}
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.85)',
                    border: '1px solid rgba(148, 163, 184, 0.35)',
                    borderRadius: 10,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: '#FEF08A',
                      }}
                    >
                      {row.assetName}
                    </div>
                    <div style={{fontSize: 14, color: '#CBD5E1'}}>
                      {row.description}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#065F46',
                      color: '#6EE7B7',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 15,
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
