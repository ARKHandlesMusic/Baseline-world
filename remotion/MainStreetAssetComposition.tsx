import React, {useEffect, useRef, useState} from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {
  CameraPresetId,
  MAIN_STREET_SECTION_1_MANIFEST,
  SHOT_MANIFEST,
  StyleMoodId,
  STYLE_PALETTES,
  TimeOfDayMode,
} from '../lib/omniframe/asset-manifest';
import {
  computeCameraTransformAtFrame,
  computeDayNightCycleState,
  computeHalftoneBurstState,
} from '../lib/omniframe/timeline-math';
import {
  buildMainStreetRoadSection1,
  MainStreetSceneHandle,
} from '../lib/omniframe/three-main-street-builder';
import {CrackAndSonsInteriorComposition} from './CrackAndSonsInteriorComposition';
import {SceneCharacterStageOverlay} from '../components/omniframe/characters/SceneCharacterStageOverlay';
import {subscribeToGlbCharacterMounts} from '../lib/omniframe/characters/glb-character-loader';

export interface InspectedSceneItem {
  id: string;
  label: string;
  category: string;
  target: [number, number, number];
  optimalDistance: number;
  cameraPosition?: [number, number, number];
}

export const mainStreetCompositionSchema = z.object({
  styleMood: z
    .enum(['lofi-night', 'golden-hour', 'neutral-anime', 'pop-halftone'])
    .default('lofi-night'),
  timeOfDayMode: z
    .enum(['day', 'night', 'auto-cycle'])
    .default('day'),
  cameraPreset: z
    .enum([
      'remotion-choreographed',
      'drone-city-flyover',
      'establishing-wide',
      'low-hero-street',
      'isometric-blueprint',
      'overhead-marking-check',
      'curb-drainage-closeup',
      'storefront-hero-closeup',
      'car-hero-showcase',
      'street-lamp-showcase',
    ])
    .default('remotion-choreographed'),
  explodeFactor: z.number().min(0).max(1).step(0.02).default(0),
  inkOutlinesEnabled: z.boolean().default(true),
  halftoneIntensity: z.number().min(0).max(1.2).step(0.05).default(0.7),
  isolatedSubPartId: z
    .enum([
      'ALL',
      'roadbed-subbase',
      'asphalt-carriageway',
      'curb-gutter-system',
      'sidewalk-promenade',
      'lane-markings',
      'zebra-crosswalk',
      'tactile-paving',
      'drainage-utility-covers',
      'center-median-island',
      'surface-weathering-puddles',
      'roadside-utility-strip',
      'halftone-burst-rig',
      'storefront-crack-and-sons',
      'anime-lofi-cars',
      'anime-street-lamps',
    ])
    .default('ALL'),
  wireframeMode: z.boolean().default(false),
  showComicCallout: z.boolean().default(true),
  manualOrbitAzimuthRad: z.number().min(-3.14).max(3.14).step(0.05).default(0),
  manualOrbitPolarRad: z.number().min(-0.6).max(0.5).step(0.02).default(0),
  manualZoomDistance: z.number().min(0.4).max(2.0).step(0.05).default(1),
});

export type MainStreetCompositionProps = z.infer<
  typeof mainStreetCompositionSchema
>;

export const MainStreetAssetComposition: React.FC<
  Partial<MainStreetCompositionProps>
> = ({
  styleMood = 'lofi-night',
  timeOfDayMode = 'day',
  cameraPreset = 'remotion-choreographed',
  explodeFactor = 0,
  inkOutlinesEnabled = true,
  halftoneIntensity = 0.7,
  isolatedSubPartId = 'ALL',
  wireframeMode = false,
  showComicCallout = true,
  manualOrbitAzimuthRad = 0,
  manualOrbitPolarRad = 0,
  manualZoomDistance = 1,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const normalizedIsolatedPart =
    !isolatedSubPartId || isolatedSubPartId === 'ALL'
      ? null
      : isolatedSubPartId;

  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const assetHandleRef = useRef<MainStreetSceneHandle | null>(null);

  const [showShopInterior, setShowShopInterior] = useState(false);
  const [showCharacters, setShowCharacters] = useState(true);
  const [inspectedItem, setInspectedItem] = useState<InspectedSceneItem | null>(
    null,
  );
  const [timeOfDayOverride, setTimeOfDayOverride] =
    useState<TimeOfDayMode | null>(null);
  const [droneFlyoverOverride, setDroneFlyoverOverride] = useState<
    boolean | null
  >(null);
  const [interactiveOrbit, setInteractiveOrbit] = useState({
    azimuth: 0,
    polar: 0,
    zoom: 1,
  });
  const pointerDownPosRef = useRef<{x: number; y: number} | null>(null);
  const isDraggingRef = useRef(false);

  const activeTimeOfDay: TimeOfDayMode =
    timeOfDayOverride ?? (timeOfDayMode as TimeOfDayMode);
  const droneFlyoverActive: boolean =
    droneFlyoverOverride ?? (cameraPreset === 'drone-city-flyover');

  const effectiveCameraPreset: CameraPresetId = droneFlyoverActive
    ? 'drone-city-flyover'
    : (cameraPreset as CameraPresetId);

  const latestStateRef = useRef({
    frame,
    fps,
    styleMood: styleMood as StyleMoodId,
    activeTimeOfDay,
    cameraPreset: effectiveCameraPreset,
    explodeFactor,
    inkOutlinesEnabled,
    halftoneIntensity,
    isolatedSubPartId: normalizedIsolatedPart,
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
    const handle = assetHandleRef.current;
    if (!renderer || !scene || !camera || !handle) return;

    const st = latestStateRef.current;
    const camState = computeCameraTransformAtFrame(st.frame, st.cameraPreset);

    let targetVec: THREE.Vector3;
    let offsetVec: THREE.Vector3;

    if (st.inspectedItem) {
      targetVec = new THREE.Vector3(...st.inspectedItem.target);
      if (st.inspectedItem.cameraPosition) {
        const camPosVec = new THREE.Vector3(...st.inspectedItem.cameraPosition);
        offsetVec = camPosVec.sub(targetVec);
      } else {
        const dist = st.inspectedItem.optimalDistance;
        const sideSign = st.inspectedItem.target[0] < 0 ? 1 : -1;
        offsetVec = new THREE.Vector3(
          sideSign * dist * 0.72,
          dist * 0.45,
          dist * 0.68,
        );
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
        0.1,
        Math.PI * 0.48,
      );
      spherical.radius = THREE.MathUtils.clamp(
        spherical.radius * totalZoom,
        1.8,
        85.0,
      );
      offsetVec.setFromSpherical(spherical);
    }

    camera.position.copy(targetVec).add(offsetVec);
    camera.lookAt(targetVec);
    const desiredFov = st.inspectedItem ? 38 : camState.fov;
    if (camera.fov !== desiredFov) {
      camera.fov = desiredFov;
      camera.updateProjectionMatrix();
    }

    handle.updateForFrame({
      frame: st.frame,
      fps: st.fps,
      explodeFactor: st.explodeFactor,
      styleMood: st.styleMood,
      timeOfDayMode: st.activeTimeOfDay,
      inkOutlinesEnabled: st.inkOutlinesEnabled,
      halftoneIntensity: st.halftoneIntensity,
      isolatedSubPartId: st.isolatedSubPartId,
      wireframeMode: st.wireframeMode,
    });

    renderer.render(scene, camera);
  };

  useEffect(() => {
    if (showShopInterior) return;
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 1920;
    const height = container.clientHeight || 1080;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.cursor = 'grab';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const palette = STYLE_PALETTES[latestStateRef.current.styleMood];
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(palette.skyTop);
    scene.fog = new THREE.FogExp2(palette.fogColor, 0.00075);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.35, 1600);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const assetHandle = buildMainStreetRoadSection1(scene, maxAnisotropy);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    assetHandleRef.current = assetHandle;

    let lastW = width;
    let lastH = height;

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || 1920;
      const h = container.clientHeight || 1080;
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h, false);
      renderDeterministicFrame();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const unsubscribeGlbMounts = subscribeToGlbCharacterMounts(() => {
      renderDeterministicFrame();
    });

    return () => {
      unsubscribeGlbMounts();
      resizeObserver.disconnect();
      assetHandle.dispose();
      envTex.dispose();
      renderer.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      assetHandleRef.current = null;
    };
  }, [showShopInterior]);

  useEffect(() => {
    if (showShopInterior) return;
    latestStateRef.current = {
      frame,
      fps,
      styleMood: styleMood as StyleMoodId,
      activeTimeOfDay,
      cameraPreset: effectiveCameraPreset,
      explodeFactor,
      inkOutlinesEnabled,
      halftoneIntensity,
      isolatedSubPartId: normalizedIsolatedPart,
      wireframeMode,
      manualOrbitAzimuthRad,
      manualOrbitPolarRad,
      manualZoomDistance,
      inspectedItem,
      interactiveOrbit,
    };
    renderDeterministicFrame();
  }, [
    showShopInterior,
    frame,
    fps,
    styleMood,
    activeTimeOfDay,
    effectiveCameraPreset,
    explodeFactor,
    inkOutlinesEnabled,
    halftoneIntensity,
    normalizedIsolatedPart,
    wireframeMode,
    manualOrbitAzimuthRad,
    manualOrbitPolarRad,
    manualZoomDistance,
    inspectedItem,
    interactiveOrbit,
  ]);

  if (showShopInterior) {
    return (
      <CrackAndSonsInteriorComposition
        onSwitchToExterior={() => setShowShopInterior(false)}
      />
    );
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPosRef.current = {x: e.clientX, y: e.clientY};
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDownPosRef.current || e.buttons !== 1) return;
    const dx = e.clientX - pointerDownPosRef.current.x;
    const dy = e.clientY - pointerDownPosRef.current.y;
    if (Math.hypot(dx, dy) > 5) {
      isDraggingRef.current = true;
      pointerDownPosRef.current = {x: e.clientX, y: e.clientY};
      setInteractiveOrbit((prev) => ({
        ...prev,
        azimuth: prev.azimuth - dx * 0.0065,
        polar: THREE.MathUtils.clamp(prev.polar - dy * 0.005, -0.8, 0.7),
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const wasDragging = isDraggingRef.current;
    pointerDownPosRef.current = null;
    isDraggingRef.current = false;
    if (wasDragging) return;

    const container = mountRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!container || !scene || !camera) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    for (const hit of intersects) {
      const obj = hit.object;
      if (obj instanceof THREE.LineSegments) continue;
      if (
        obj instanceof THREE.Mesh &&
        obj.material instanceof THREE.MeshBasicMaterial &&
        obj.material.side === THREE.BackSide
      ) {
        continue;
      }
      if (hit.distance > 900) continue;

      let curr: THREE.Object3D | null = obj;
      let foundMeta: {id: string; label: string; category: string} | null = null;
      let targetNode: THREE.Object3D = obj;

      while (curr && curr !== scene) {
        if (curr.userData && curr.userData.inspectable) {
          foundMeta = curr.userData.inspectable;
          targetNode = curr;
          break;
        }
        if (curr.name && curr.name !== 'root-main-street-section-1') {
          const subPartSpec = MAIN_STREET_SECTION_1_MANIFEST.subParts.find(
            (sp) => sp.id === curr?.name,
          );
          if (subPartSpec) {
            foundMeta = {
              id: subPartSpec.id,
              label: subPartSpec.name,
              category: 'Main Street Hero Layer',
            };
            targetNode = obj;
            break;
          }
        }
        curr = curr.parent;
      }

      const box = new THREE.Box3().setFromObject(targetNode);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);

      const focusPoint: [number, number, number] =
        maxDim > 35
          ? [hit.point.x, Math.max(1.2, hit.point.y), hit.point.z]
          : [center.x, Math.max(0.8, center.y), center.z];
      const optimalDistance = THREE.MathUtils.clamp(
        maxDim > 35 ? 11.0 : Math.max(4.8, maxDim * 1.45),
        4.5,
        24.0,
      );

      setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
      setInspectedItem({
        id: foundMeta?.id ?? `mesh-${hit.point.x.toFixed(1)}`,
        label:
          foundMeta?.label ??
          `Urban Scene Detail (${hit.point.x.toFixed(1)}m, ${hit.point.z.toFixed(1)}m)`,
        category: foundMeta?.category ?? '3D City Environment Element',
        target: focusPoint,
        optimalDistance,
      });
      return;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    setInteractiveOrbit((prev) => ({
      ...prev,
      zoom: THREE.MathUtils.clamp(
        prev.zoom * (e.deltaY > 0 ? 1.08 : 0.92),
        0.35,
        2.6,
      ),
    }));
  };

  const burstState = computeHalftoneBurstState(
    frame,
    fps,
    MAIN_STREET_SECTION_1_MANIFEST.bpm,
    halftoneIntensity,
  );

  const showBanner =
    showComicCallout &&
    styleMood === 'pop-halftone' &&
    burstState.shoutBannerActive;

  const calloutScale = interpolate(
    frame % 30,
    [0, 6, 29],
    [1.08, 1.0, 0.97],
    {extrapolateRight: 'clamp'},
  );

  const dayNightInfo = computeDayNightCycleState(
    frame,
    MAIN_STREET_SECTION_1_MANIFEST.durationInFrames,
    activeTimeOfDay,
  );

  return (
    <AbsoluteFill style={{backgroundColor: '#1452B4', overflow: 'hidden'}}>
      <style>{`polygon[data-remotion-canvas-outline-key] { pointer-events: none !important; }`}</style>
      {/* Named Remotion Sequences so the raw Remotion Timeline displays all layers & shots */}
      <Sequence
        name="World 01: IRL Blue Sky, Blazing Sun, Cumulus Clouds & 360° Mountains"
        from={0}
        durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
      >
        <div
          ref={mountRef}
          data-testid="three-remotion-canvas-mount"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          style={{width: '100%', height: '100%', position: 'relative'}}
        />
      </Sequence>

      {/* 10 Animated Layered SVG Character Rigs Stage Overlay */}
      <Sequence
        name="Cast 01: All 10 Animated SVG Character Rigs & Seeded Crowd on Main Street"
        from={0}
        durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
      >
        <SceneCharacterStageOverlay
          sceneContext="main-street"
          visible={showCharacters}
        />
      </Sequence>

      {/* Interactive 3D Object Inspection + Drone & Day/Night HUD Overlay */}
      <div
        data-testid="inspectable-hud-overlay"
        style={{
          position: 'absolute',
          top: 52,
          left: 52,
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          maxWidth: 1220,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Persistent Top Control Bar: Drone City Flyover + Day / Night / Auto-Cycle Switcher */}
        <div
          data-testid="drone-and-daynight-toolbar"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.90)',
            border: '2px solid rgba(56, 189, 248, 0.85)',
            borderRadius: 14,
            padding: '12px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          }}
        >
          <button
            type="button"
            data-testid="enter-crack-and-sons-interior-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setShowShopInterior(true);
            }}
            style={{
              backgroundColor: '#B91C1C',
              color: '#FEF08A',
              border: '2px solid #FACC15',
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 19,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            🎄 Enter Crack & Sons Shop Interior
          </button>

          <button
            type="button"
            data-testid="toggle-characters-cast-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setShowCharacters((prev) => !prev);
            }}
            style={{
              backgroundColor: showCharacters ? '#7C3AED' : '#1E293B',
              color: '#FEF08A',
              border: '2px solid #FACC15',
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 18,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {showCharacters
              ? '🎭 10 Animated Characters + Crowd: ON'
              : '🎭 10 Animated Characters + Crowd: OFF'}
          </button>

          <button
            type="button"
            data-testid="toggle-drone-flyover-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setInspectedItem(null);
              setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
              setDroneFlyoverOverride(!droneFlyoverActive);
            }}
            style={{
              backgroundColor: droneFlyoverActive ? '#0284C7' : '#1E293B',
              color: '#FFFFFF',
              border: `2px solid ${droneFlyoverActive ? '#7DD3FC' : '#38BDF8'}`,
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 19,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {droneFlyoverActive
              ? '🚁 Drone City Flyover: ON (Aerial Sweep)'
              : '🚁 Start Drone City Flyover'}
          </button>

          <div
            style={{
              width: 2,
              height: 28,
              backgroundColor: 'rgba(148, 163, 184, 0.4)',
            }}
          />

          <span
            style={{
              color: '#CBD5E1',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.03em',
            }}
          >
            SKY & LIGHTING:
          </span>

          <button
            type="button"
            data-testid="tod-day-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setTimeOfDayOverride('day');
            }}
            style={{
              backgroundColor:
                activeTimeOfDay === 'day' ? '#FACC15' : '#1E293B',
              color: activeTimeOfDay === 'day' ? '#0F172A' : '#FDE047',
              border: '2px solid #FACC15',
              borderRadius: 10,
              padding: '7px 14px',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ☀️ Day
          </button>

          <button
            type="button"
            data-testid="tod-night-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setTimeOfDayOverride('night');
            }}
            style={{
              backgroundColor:
                activeTimeOfDay === 'night' ? '#6366F1' : '#1E293B',
              color: '#FFFFFF',
              border: '2px solid #818CF8',
              borderRadius: 10,
              padding: '7px 14px',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🌙 Night
          </button>

          <button
            type="button"
            data-testid="tod-cycle-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setTimeOfDayOverride('auto-cycle');
            }}
            style={{
              backgroundColor:
                activeTimeOfDay === 'auto-cycle' ? '#10B981' : '#1E293B',
              color: '#FFFFFF',
              border: '2px solid #34D399',
              borderRadius: 10,
              padding: '7px 14px',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🔄 Day/Night Cycle
          </button>

          <span
            data-testid="tod-phase-status"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              color: '#E2E8F0',
              border: '1px solid rgba(148, 163, 184, 0.45)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 17,
              fontWeight: 700,
            }}
          >
            {dayNightInfo.phaseLabel}
          </span>
        </div>
        {inspectedItem ? (
          <div
            data-testid="active-inspection-card"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              border: '4px solid #FACC15',
              borderRadius: 18,
              padding: '22px 28px',
              color: '#F8FAFC',
              boxShadow: '0 20px 45px rgba(0,0,0,0.65)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  backgroundColor: '#FACC15',
                  color: '#0F172A',
                  fontWeight: 800,
                  fontSize: 22,
                  padding: '4px 14px',
                  borderRadius: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Inspecting: {inspectedItem.category}
              </span>
              <span
                style={{
                  color: '#94A3B8',
                  fontSize: 22,
                  fontFamily: 'monospace',
                }}
              >
                XYZ: [{inspectedItem.target[0].toFixed(1)}m,{' '}
                {inspectedItem.target[1].toFixed(1)}m,{' '}
                {inspectedItem.target[2].toFixed(1)}m]
              </span>
            </div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: '#FFFFFF',
                marginBottom: 16,
              }}
            >
              {inspectedItem.label}
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
              <button
                type="button"
                data-testid="inspect-rotate-back-btn"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setInteractiveOrbit((prev) => ({
                    ...prev,
                    azimuth: prev.azimuth + Math.PI,
                  }));
                }}
                style={{
                  backgroundColor: '#1E293B',
                  color: '#38BDF8',
                  border: '2px solid #38BDF8',
                  borderRadius: 10,
                  padding: '10px 20px',
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Rotate 180° (Inspect Rear / Backside)
              </button>
              <button
                type="button"
                data-testid="inspect-zoom-in-btn"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setInteractiveOrbit((prev) => ({
                    ...prev,
                    zoom: Math.max(0.35, prev.zoom * 0.78),
                  }));
                }}
                style={{
                  backgroundColor: '#1E293B',
                  color: '#E2E8F0',
                  border: '2px solid #475569',
                  borderRadius: 10,
                  padding: '10px 20px',
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Zoom Closer (+)
              </button>
              <button
                type="button"
                data-testid="inspect-reset-btn"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setInspectedItem(null);
                  setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                }}
                style={{
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  border: '2px solid #FCA5A5',
                  borderRadius: 10,
                  padding: '10px 22px',
                  fontSize: 22,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Reset Camera Focus
              </button>
            </div>
          </div>
        ) : (
          <div
            data-testid="inspection-helper-pill"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.84)',
              border: '2px solid rgba(250, 204, 21, 0.75)',
              borderRadius: 14,
              padding: '14px 22px',
              color: '#F8FAFC',
              fontSize: 21,
              fontWeight: 600,
              boxShadow: '0 10px 25px rgba(0,0,0,0.45)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div>
              Click any 3D object (shops, balconies, intersections, utility poles, cars) to inspect • Drag to orbit
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
              <button
                type="button"
                data-testid="quick-focus-intersection-btn"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                  setInspectedItem({
                    id: 'intersection-0--24.5',
                    label: 'Central Ave & 2nd St N — 4-Way Intersection (Waffle Manholes, Crosswalks, Turn Arrows & Shrubs)',
                    category: 'Interconnected City Road & Turns',
                    target: [0, 0.2, -24.5],
                    optimalDistance: 20,
                    cameraPosition: [0.0, 14.5, -6.5],
                  });
                }}
                style={{
                  backgroundColor: '#1E293B',
                  color: '#FACC15',
                  border: '2px solid #FACC15',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Inspect 4-Way Intersection & Turns
              </button>
              <button
                type="button"
                data-testid="quick-focus-cross-street-btn"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                  setInspectedItem({
                    id: 'cross-street-shops-balconies',
                    label: '2nd Street Cross-Street Storefronts, Wrought-Iron Balconies, Footpaths & Shrub Planters',
                    category: 'Cross-Street Architecture & Balconies',
                    target: [-26.0, 3.4, -30.5],
                    optimalDistance: 18,
                    cameraPosition: [-14.0, 6.8, -19.5],
                  });
                }}
                style={{
                  backgroundColor: '#1E293B',
                  color: '#38BDF8',
                  border: '2px solid #38BDF8',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Inspect Cross-Street Shops & Balconies
              </button>
              <button
                type="button"
                data-testid="quick-focus-utility-poles-btn"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                  setInspectedItem({
                    id: 'utility-pole-cables',
                    label: 'Street-Side Timber Utility Poles, Crossarms, Insulators & Pole-to-Pole Catenary Cables',
                    category: 'Pole-to-Pole Utility Grid',
                    target: [-7.95, 5.4, -14.0],
                    optimalDistance: 12,
                    cameraPosition: [1.5, 5.2, -3.5],
                  });
                }}
                style={{
                  backgroundColor: '#1E293B',
                  color: '#34D399',
                  border: '2px solid #34D399',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Inspect Pole-to-Pole Utility Cables
              </button>
              <button
                type="button"
                data-testid="quick-focus-city-map-btn"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                  setInspectedItem({
                    id: 'full-city-grid-overview',
                    label: 'Full Interconnected 2D City Grid (3 Avenues, 4 Cross-Streets, 12 Intersections & 32 Cars)',
                    category: 'Full City Map Overview',
                    target: [0, 1.0, -32.0],
                    optimalDistance: 64,
                    cameraPosition: [0, 38.0, 22.0],
                  });
                }}
                style={{
                  backgroundColor: '#1E293B',
                  color: '#F472B6',
                  border: '2px solid #F472B6',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Full 2D City Grid Overview
              </button>
              <button
                type="button"
                data-testid="quick-focus-bedroom-window-gateway-btn"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                  setInspectedItem({
                    id: 'gateway-bedroom-window',
                    label: 'Transparent Apartment Window Gateway → Dark Room Bedroom (Bed, Cyan Hacker Desk, Phone Glow & Live News TV Inside!)',
                    category: 'Connected Scene Window Gateway',
                    target: [-10.8, 6.95, 0.0],
                    optimalDistance: 5.2,
                    cameraPosition: [-5.6, 7.1, 1.6],
                  });
                }}
                style={{
                  backgroundColor: '#0E7490',
                  color: '#ECFEFF',
                  border: '2px solid #22D3EE',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🪟 Inspect Transparent Bedroom Window Gateway
              </button>
              <button
                type="button"
                data-testid="quick-focus-shop-window-gateway-btn"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                  setInspectedItem({
                    id: 'gateway-crack-and-sons-window',
                    label: 'Transparent Shop Window Gateway → Crack & Sons Interior (Nutcracker Regiment, Counter & Christmas Tree Inside!)',
                    category: 'Connected Scene Window Gateway',
                    target: [-10.8, 2.25, -1.85],
                    optimalDistance: 5.5,
                    cameraPosition: [-5.4, 2.4, -0.5],
                  });
                }}
                style={{
                  backgroundColor: '#991B1B',
                  color: '#FEF08A',
                  border: '2px solid #FACC15',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🎄 Inspect Transparent Shop Window Gateway
              </button>
              <button
                type="button"
                data-testid="quick-focus-garage-window-gateway-btn"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setInteractiveOrbit({azimuth: 0, polar: 0, zoom: 1});
                  setInspectedItem({
                    id: 'gateway-garage-silo-window',
                    label: 'Transparent Hardware Bay Gateway → Garage & Underground Nuclear Silo Hatch (Rising Cartoon Nuke & Tool Cabinet Inside!)',
                    category: 'Connected Scene Window Gateway',
                    target: [-10.8, 2.25, 11.35],
                    optimalDistance: 5.5,
                    cameraPosition: [-5.4, 2.4, 12.8],
                  });
                }}
                style={{
                  backgroundColor: '#78350F',
                  color: '#FDE047',
                  border: '2px solid #F97316',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🚀 Inspect Transparent Garage Silo Gateway
              </button>
            </div>
          </div>
        )}
      </div>

      <Sequence
        name='World 02: 6 Multi-Story Shops ("CRACK & SONS", Tailor, Café, Books, Deli, Hardware) + Balconies'
        from={0}
        durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
      >
        <div style={{display: 'none'}} />
      </Sequence>

      <Sequence
        name="World 03: Extended City Blocks (LOD Tier 1 & Tier 2) + Cross-Streets"
        from={0}
        durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
      >
        <div style={{display: 'none'}} />
      </Sequence>

      <Sequence
        name="World 04: American Fire Hydrants, Municipal Dustbins, Street Lamps, Benches, Trees & Cars"
        from={0}
        durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
      >
        <div style={{display: 'none'}} />
      </Sequence>

      <Sequence
        name="Style Layer: 2D Comic Ink Line Art & Frame"
        from={0}
        durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
      >
        {inkOutlinesEnabled ? (
          <div
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              inset: 28,
              border: '5px solid rgba(10, 8, 18, 0.85)',
              boxShadow: 'inset 0 0 0 2px rgba(243, 239, 250, 0.1)',
            }}
          />
        ) : null}
      </Sequence>

      {SHOT_MANIFEST.map((shot) => (
        <Sequence
          key={shot.shotId}
          name={`${shot.title} (${shot.musicalAnchor})`}
          from={shot.startFrame}
          durationInFrames={shot.endFrame - shot.startFrame + 1}
        >
          <div style={{display: 'none'}} />
        </Sequence>
      ))}

      <Sequence
        name="FX: MAKE IT RIGHT! Halftone Pop-Art Burst & Manga Speed Spikes"
        from={240}
        durationInFrames={120}
      >
        {showBanner ? (
          <div
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              top: 96,
              left: '50%',
              transform: `translate(-50%, 0) scale(${calloutScale}) rotate(-2deg)`,
              padding: '16px 48px',
              backgroundColor: '#FDE047',
              color: '#0A0812',
              border: '8px solid #0A0812',
              boxShadow: '16px 16px 0px #0A0812',
              fontFamily: 'sans-serif',
              fontWeight: 900,
              fontSize: 64,
              letterSpacing: '0.08em',
            }}
          >
            MAKE IT RIGHT!
          </div>
        ) : null}
      </Sequence>
    </AbsoluteFill>
  );
};
