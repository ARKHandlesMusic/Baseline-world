import * as THREE from 'three';
import {
  MAIN_STREET_SECTION_1_MANIFEST,
  StyleMoodId,
  STYLE_PALETTES,
  StylePalette,
  TimeOfDayMode,
} from './asset-manifest';
import {
  computeDayNightCycleState,
  computeSubPartElevationY,
} from './timeline-math';
import {
  buildAnimeCarAsset,
} from './three-street-assets-builder';
import {
  buildSurroundingCityAndMountains,
  createCityFootpathTexture,
  createRealisticSkyDomeShaderMaterial,
} from './three-sky-and-city-builder';
import {
  CityVehicleSpec,
  evaluateCityVehicleAtFrame,
  generateCityVehicleFleet,
} from './city-layout';
import { buildThreeSceneCastDirector } from './characters/three-scene-cast-director';

export interface MainStreetSceneHandle {
  rootGroup: THREE.Group;
  subPartGroups: Map<string, THREE.Group>;
  inkLineObjects: THREE.Object3D[];
  halftoneMaterials: THREE.ShaderMaterial[];
  keyLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  rimLight: THREE.DirectionalLight;
  streetPointLights: THREE.PointLight[];
  updateForFrame: (params: {
    frame: number;
    fps: number;
    explodeFactor: number;
    styleMood: StyleMoodId;
    timeOfDayMode?: TimeOfDayMode;
    inkOutlinesEnabled: boolean;
    halftoneIntensity: number;
    isolatedSubPartId: string | null;
    wireframeMode: boolean;
  }) => void;
  dispose: () => void;
}

/**
 * Create a quantized step-gradient texture for Cel-Shading (MeshToonMaterial).
 */
function createToonGradientTexture(steps: 3 | 4): THREE.DataTexture {
  const data =
    steps === 3
      ? new Uint8Array([72, 168, 255])
      : new Uint8Array([55, 125, 195, 255]);
  const texture = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generate a flat lo-fi anime asphalt texture with subtle block bands and comic ink hatch marks.
 */
function createLoFiAsphaltCanvasTexture(
  palette: StylePalette,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = palette.asphaltBase;
    ctx.fillRect(0, 0, 512, 512);

    // Flat cel-shaded tonal wheel-track bands
    ctx.fillStyle = palette.asphaltWear;
    ctx.fillRect(56, 0, 88, 512);
    ctx.fillRect(168, 0, 76, 512);
    ctx.fillRect(268, 0, 76, 512);
    ctx.fillRect(368, 0, 88, 512);

    // Subtle hand-drawn comic ink longitudinal hatch strokes (deterministic positions)
    ctx.strokeStyle = palette.inkOutlineColor;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.36;
    for (let i = 0; i < 32; i++) {
      const x = ((i * 73) % 480) + 16;
      const y = ((i * 139) % 440) + 20;
      const len = 26 + ((i * 19) % 38);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 4);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Helper to wrap any mesh in distinct 2D dark comic ink outlines (EdgesGeometry + inverted hull).
 */
function addInkOutlines(
  mesh: THREE.Mesh,
  parentGroup: THREE.Group,
  inkMaterial: THREE.LineBasicMaterial,
  hullMaterial?: THREE.MeshBasicMaterial,
  hullThickness = 0.03,
  thresholdAngle = 15,
  inkRegistry?: THREE.Object3D[],
): void {
  const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
  const lineSegments = new THREE.LineSegments(edgesGeo, inkMaterial);
  lineSegments.position.copy(mesh.position);
  lineSegments.rotation.copy(mesh.rotation);
  lineSegments.scale.copy(mesh.scale);
  parentGroup.add(lineSegments);
  if (inkRegistry) {
    inkRegistry.push(lineSegments);
  }

  if (hullMaterial && hullThickness > 0) {
    const hullMesh = new THREE.Mesh(mesh.geometry, hullMaterial);
    hullMesh.position.copy(mesh.position);
    hullMesh.rotation.copy(mesh.rotation);
    hullMesh.scale.set(
      mesh.scale.x * (1 + hullThickness * 0.4),
      mesh.scale.y * (1 + hullThickness * 0.65),
      mesh.scale.z * (1 + hullThickness * 0.4),
    );
    parentGroup.add(hullMesh);
    if (inkRegistry) {
      inkRegistry.push(hullMesh);
    }
  }
}

/**
 * Custom GLSL ShaderMaterial for the Halftone Pop-Art Burst & Radiating Manga Speed Lines.
 * Implements:
 * 1) Halftone circles that are LARGER at the center and SHRINK progressively as they move outwards.
 * 2) Sharp radiating comic/manga speed-line spikes framing the burst with dark ink borders.
 */
export function createHalftoneBurstShaderMaterial(
  palette: StylePalette,
  isGroundHalo: boolean,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: {value: 0},
      uPulse: {value: 0.8},
      uIntensity: {value: palette.defaultHalftoneIntensity},
      uPrimaryColor: {value: new THREE.Color(palette.halftonePrimary)},
      uSecondaryColor: {value: new THREE.Color(palette.halftoneSecondary)},
      uSpikeColor: {value: new THREE.Color(palette.burstSpikeColor)},
      uInkColor: {value: new THREE.Color(palette.inkOutlineColor)},
      uBgColor: {value: new THREE.Color(palette.skyTop)},
      uHorizonColor: {value: new THREE.Color(palette.skyHorizon)},
      uIsGround: {value: isGroundHalo ? 1.0 : 0.0},
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uPulse;
      uniform float uIntensity;
      uniform vec3 uPrimaryColor;
      uniform vec3 uSecondaryColor;
      uniform vec3 uSpikeColor;
      uniform vec3 uInkColor;
      uniform vec3 uBgColor;
      uniform vec3 uHorizonColor;
      uniform float uIsGround;

      void main() {
        vec2 center = uIsGround > 0.5 ? vec2(0.5, 0.5) : vec2(0.5, 0.22);
        vec2 p = vUv - center;
        if (uIsGround < 0.5) {
          p.x *= 1.85;
        }
        float dist = length(p);
        float angle = atan(p.y, p.x);

        // 1. Halftone Pop-Art Dot Grid:
        // Dots are LARGEST in the center (normalizedR -> 0) and SHRINK progressively as they move outwards (normalizedR -> 1)
        float gridFreq = uIsGround > 0.5 ? 26.0 : 30.0;
        vec2 gridUv = fract(p * gridFreq) - 0.5;
        float cellDist = length(gridUv);

        float normalizedR = clamp(dist * (uIsGround > 0.5 ? 2.0 : 1.18), 0.0, 1.0);
        // Center = large radius (0.52), Outward = shrinks smoothly down to 0.0
        float dotTargetRadius = mix(0.0, 0.52, pow(1.0 - normalizedR, 1.45)) * (0.88 + 0.22 * uPulse);
        float halftoneDot = 1.0 - smoothstep(dotTargetRadius - 0.035, dotTargetRadius + 0.035, cellDist);
        float dotInkRing = (smoothstep(dotTargetRadius - 0.065, dotTargetRadius - 0.015, cellDist) - smoothstep(dotTargetRadius - 0.015, dotTargetRadius + 0.03, cellDist));
        float outerFade = 1.0 - smoothstep(0.78, 0.98, normalizedR);
        halftoneDot *= outerFade;
        dotInkRing = clamp(dotInkRing * outerFade, 0.0, 1.0);

        // 2. Radiating Comic / Manga Speed Lines & Zigzag Action Spikes:
        float numSpikes = 52.0;
        float spikeWave = abs(fract((angle / 6.2831853) * numSpikes + uTime * 0.1) - 0.5) * 2.0;
        float spikeInner = mix(0.18, 0.58, pow(spikeWave, 1.6)) - 0.04 * uPulse;
        float spikeOuter = mix(0.68, 0.96, pow(1.0 - spikeWave, 1.4));
        float isSpike = smoothstep(spikeInner, spikeInner + 0.02, normalizedR) * (1.0 - smoothstep(spikeOuter - 0.03, spikeOuter, normalizedR));

        // 3. Distinct Dark Ink Outline around Halftone Dots & Radiating Speed Spikes
        float spikeEdgeInk = (smoothstep(spikeInner - 0.022, spikeInner, normalizedR) - smoothstep(spikeInner, spikeInner + 0.022, normalizedR)) * (1.0 - smoothstep(spikeOuter, spikeOuter + 0.02, normalizedR));

        // Smooth atmospheric sky gradient background
        float radialGlow = pow(1.0 - normalizedR, 1.8);
        vec3 baseSky = mix(uBgColor, uHorizonColor, clamp(radialGlow * 1.15, 0.0, 1.0));

        vec3 dotColor = mix(uSecondaryColor, uPrimaryColor, clamp(normalizedR * 1.25, 0.0, 1.0));
        vec3 col = baseSky;
        col = mix(col, dotColor, halftoneDot * uIntensity);
        col = mix(col, uInkColor, dotInkRing * 0.85 * uIntensity);
        col = mix(col, uSpikeColor, isSpike * 0.72 * uIntensity);
        col = mix(col, uInkColor, clamp(spikeEdgeInk * 1.2 * uIntensity, 0.0, 1.0));

        float alpha = uIsGround > 0.5
          ? clamp((halftoneDot * 0.82 + isSpike * 0.65) * uIntensity * (1.0 - smoothstep(0.4, 0.49, dist)), 0.0, 0.92)
          : 1.0;

        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: isGroundHalo,
    depthWrite: !isGroundHalo,
    side: THREE.DoubleSide,
  });
}

/**
 * Construct the complete 12-Part Cel-Shaded "Main Street Road Section 1 — Primary Ground Plane" asset.
 */
export function buildMainStreetRoadSection1(
  scene: THREE.Scene,
  maxAnisotropy = 4,
): MainStreetSceneHandle {
  const defaultPalette = STYLE_PALETTES['lofi-night'];
  const rootGroup = new THREE.Group();
  rootGroup.name = MAIN_STREET_SECTION_1_MANIFEST.assetId;
  rootGroup.position.set(0, 0, 0);
  scene.add(rootGroup);

  const subPartGroups = new Map<string, THREE.Group>();
  const inkLineObjects: THREE.Object3D[] = [];
  const halftoneMaterials: THREE.ShaderMaterial[] = [];
  const disposableGeometries: THREE.BufferGeometry[] = [];
  const disposableMaterials: THREE.Material[] = [];
  const disposableTextures: THREE.Texture[] = [];

  const grad3 = createToonGradientTexture(3);
  const grad4 = createToonGradientTexture(4);
  disposableTextures.push(grad3, grad4);

  const asphaltTex = createLoFiAsphaltCanvasTexture(defaultPalette, maxAnisotropy);
  const heroFootpathTex = createCityFootpathTexture(defaultPalette, 'north-south', 2, 10);
  disposableTextures.push(asphaltTex, heroFootpathTex);

  // Shared Dark Ink Outline Materials
  const inkLineMat = new THREE.LineBasicMaterial({
    color: defaultPalette.inkOutlineColor,
  });
  const inkHullMat = new THREE.MeshBasicMaterial({
    color: defaultPalette.inkOutlineColor,
    side: THREE.BackSide,
  });
  const inkFlatMat = new THREE.MeshBasicMaterial({
    color: defaultPalette.inkOutlineColor,
  });
  disposableMaterials.push(inkLineMat, inkHullMat, inkFlatMat);

  // Toon Materials mapped by semantic role
  const matSubbase = new THREE.MeshToonMaterial({
    color: defaultPalette.subbaseConcrete,
    gradientMap: grad3,
  });
  const matAsphalt = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: asphaltTex,
    gradientMap: grad3,
  });
  const matCurb = new THREE.MeshToonMaterial({
    color: defaultPalette.curbStone,
    gradientMap: grad3,
  });
  const matSidewalk = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: heroFootpathTex,
    gradientMap: grad3,
  });
  const matMarkingWhite = new THREE.MeshToonMaterial({
    color: defaultPalette.laneMarkingWhite,
    gradientMap: grad3,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const matMarkingYellow = new THREE.MeshToonMaterial({
    color: defaultPalette.laneMarkingYellow,
    gradientMap: grad3,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const matTactileYellow = new THREE.MeshToonMaterial({
    color: defaultPalette.tactileYellow,
    gradientMap: grad4,
  });
  const matDrainIron = new THREE.MeshToonMaterial({
    color: defaultPalette.drainIron,
    gradientMap: grad4,
  });
  const matPuddle = new THREE.MeshToonMaterial({
    color: defaultPalette.puddleTint,
    gradientMap: grad3,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const matAmberEmissive = new THREE.MeshBasicMaterial({
    color: defaultPalette.laneMarkingYellow,
  });

  disposableMaterials.push(
    matSubbase,
    matAsphalt,
    matCurb,
    matSidewalk,
    matMarkingWhite,
    matMarkingYellow,
    matTactileYellow,
    matDrainIron,
    matPuddle,
    matAmberEmissive,
  );

  for (const spec of MAIN_STREET_SECTION_1_MANIFEST.subParts) {
    const g = new THREE.Group();
    g.name = spec.id;
    g.position.set(0, spec.baseElevationY, 0);
    rootGroup.add(g);
    subPartGroups.set(spec.id, g);
  }

  // ============================================================================
  // PART 1: Primary Structural Roadbed Slab (`roadbed-subbase`) — Y = 0.00m
  // ============================================================================
  const gRoadbed = subPartGroups.get('roadbed-subbase')!;
  {
    const bedGeo = new THREE.BoxGeometry(24.0, 0.28, 40.0);
    bedGeo.translate(0, 0.14, 0);
    disposableGeometries.push(bedGeo);
    const bedMesh = new THREE.Mesh(bedGeo, matSubbase);
    bedMesh.receiveShadow = true;
    gRoadbed.add(bedMesh);
    addInkOutlines(bedMesh, gRoadbed, inkLineMat, inkHullMat, 0.02, 20, inkLineObjects);

    const ribGeo = new THREE.BoxGeometry(0.35, 0.24, 0.8);
    ribGeo.translate(0, 0.12, 0);
    disposableGeometries.push(ribGeo);
    for (let z = -18; z <= 18; z += 4) {
      for (const side of [-1, 1]) {
        const rib = new THREE.Mesh(ribGeo, matCurb);
        rib.position.set(side * 12.05, 0, z);
        gRoadbed.add(rib);
        addInkOutlines(rib, gRoadbed, inkLineMat, inkHullMat, 0.025, 20, inkLineObjects);
      }
    }
  }

  // ============================================================================
  // PART 2: Crown-Cambered 4-Lane Asphalt Deck (`asphalt-carriageway`) — Y = 0.28m
  // ============================================================================
  const gAsphalt = subPartGroups.get('asphalt-carriageway')!;
  {
    const roadShape = new THREE.Shape();
    roadShape.moveTo(-7.0, 0);
    roadShape.lineTo(7.0, 0);
    roadShape.lineTo(6.95, 0.06);
    roadShape.lineTo(0, 0.095);
    roadShape.lineTo(-6.95, 0.06);
    roadShape.closePath();

    const roadGeo = new THREE.ExtrudeGeometry(roadShape, {
      depth: 40.0,
      bevelEnabled: false,
      steps: 1,
    });
    roadGeo.translate(0, 0, -20.0);
    disposableGeometries.push(roadGeo);

    const roadMesh = new THREE.Mesh(roadGeo, matAsphalt);
    roadMesh.receiveShadow = true;
    gAsphalt.add(roadMesh);
    addInkOutlines(roadMesh, gAsphalt, inkLineMat, inkHullMat, 0.015, 12, inkLineObjects);
  }

  // ============================================================================
  // PART 3: Beveled Granite Curbs (4 Segments + Yellow Curb Markings + Ink Outlines)
  // ============================================================================
  const gCurb = subPartGroups.get('curb-gutter-system')!;
  {
    const curbBlockGeo = new THREE.BoxGeometry(0.56, 0.22, 2.42);
    curbBlockGeo.translate(0, 0.11, 0);
    const gutterSlabGeo = new THREE.BoxGeometry(0.56, 0.045, 2.42);
    gutterSlabGeo.translate(0, 0.022, 0);
    const inkSeamGeo = new THREE.BoxGeometry(0.6, 0.23, 0.06);
    inkSeamGeo.translate(0, 0.115, 0);
    disposableGeometries.push(curbBlockGeo, gutterSlabGeo, inkSeamGeo);

    for (let z = -18.75; z <= 18.75; z += 2.5) {
      const isCrosswalkDrop = Math.abs(Math.abs(z) - 11.25) < 2.6;
      const isCornerYellowCurb =
        !isCrosswalkDrop && Math.abs(Math.abs(z) - 13.75) < 1.5;
      const heightScale = isCrosswalkDrop ? 0.36 : 1.0;

      for (const side of [-1, 1]) {
        const curbMesh = new THREE.Mesh(
          curbBlockGeo,
          isCornerYellowCurb ? matMarkingYellow : matCurb,
        );
        curbMesh.position.set(side * 7.25, 0, z);
        curbMesh.scale.set(1, heightScale, 1);
        curbMesh.castShadow = true;
        curbMesh.receiveShadow = true;
        gCurb.add(curbMesh);
        addInkOutlines(
          curbMesh,
          gCurb,
          inkLineMat,
          inkHullMat,
          0.035,
          15,
          inkLineObjects,
        );

        // Bold dark comic ink expansion joint seam between curbstones
        const seamMesh = new THREE.Mesh(inkSeamGeo, inkFlatMat);
        seamMesh.position.set(side * 7.25, 0, z + 1.24);
        seamMesh.scale.set(1, heightScale, 1);
        gCurb.add(seamMesh);
        inkLineObjects.push(seamMesh);

        const gutterMesh = new THREE.Mesh(gutterSlabGeo, matSubbase);
        gutterMesh.position.set(side * 6.72, 0, z);
        gCurb.add(gutterMesh);
        addInkOutlines(
          gutterMesh,
          gCurb,
          inkLineMat,
          undefined,
          0,
          15,
          inkLineObjects,
        );
      }
    }
  }

  // ============================================================================
  // PART 4: 4 Sidewalk Sections & Lo-Fi Paving Grid (`sidewalk-promenade`)
  // ============================================================================
  const gSidewalk = subPartGroups.get('sidewalk-promenade')!;
  {
    // 4 distinct sidewalk sections (NW, SW, NE, SE)
    const walkSectionGeo = new THREE.BoxGeometry(4.45, 0.18, 19.6);
    walkSectionGeo.translate(0, 0.09, 0);
    disposableGeometries.push(walkSectionGeo);

    for (const side of [-1, 1]) {
      for (const zCenter of [-10.0, 10.0]) {
        const walkMesh = new THREE.Mesh(walkSectionGeo, matSidewalk);
        walkMesh.position.set(side * 9.75, 0, zCenter);
        walkMesh.receiveShadow = true;
        gSidewalk.add(walkMesh);
        addInkOutlines(
          walkMesh,
          gSidewalk,
          inkLineMat,
          inkHullMat,
          0.018,
          18,
          inkLineObjects,
        );
      }

      const gridPoints: THREE.Vector3[] = [];
      const xInner = side * 7.55;
      const xOuter = side * 11.95;
      const xMid = side * 9.75;

      gridPoints.push(new THREE.Vector3(xMid, 0.186, -19.9));
      gridPoints.push(new THREE.Vector3(xMid, 0.186, 19.9));

      for (let z = -18; z <= 18; z += 2.0) {
        gridPoints.push(new THREE.Vector3(xInner, 0.186, z));
        gridPoints.push(new THREE.Vector3(xOuter, 0.186, z));
      }

      const gridGeo = new THREE.BufferGeometry().setFromPoints(gridPoints);
      disposableGeometries.push(gridGeo);
      const gridLines = new THREE.LineSegments(gridGeo, inkLineMat);
      gSidewalk.add(gridLines);
      inkLineObjects.push(gridLines);
    }
  }

  // ============================================================================
  // PART 5: Painted Lane Lines, Directional Arrows & Stop Bars (with Dark Ink Outlines)
  // ============================================================================
  const gMarkings = subPartGroups.get('lane-markings')!;
  {
    const centerLineGeo = new THREE.BoxGeometry(0.16, 0.02, 15.5);
    centerLineGeo.translate(0, 0.01, 0);
    const stopBarGeo = new THREE.BoxGeometry(6.1, 0.022, 0.48);
    stopBarGeo.translate(0, 0.011, 0);
    const dashGeo = new THREE.BoxGeometry(0.16, 0.02, 2.2);
    dashGeo.translate(0, 0.01, 0);
    const arrowStemGeo = new THREE.BoxGeometry(0.24, 0.02, 1.4);
    arrowStemGeo.translate(0, 0.01, 0);
    disposableGeometries.push(centerLineGeo, stopBarGeo, dashGeo, arrowStemGeo);

    // Double yellow centerlines with dark ink outline borders
    for (const xOffset of [-0.18, 0.18]) {
      const centerMid = new THREE.Mesh(centerLineGeo, matMarkingYellow);
      centerMid.position.set(xOffset, 0, 0);
      gMarkings.add(centerMid);
      addInkOutlines(
        centerMid,
        gMarkings,
        inkLineMat,
        inkHullMat,
        0.045,
        15,
        inkLineObjects,
      );
    }

    // Stop bars with thick dark ink outlines
    const stopSouth = new THREE.Mesh(stopBarGeo, matMarkingWhite);
    stopSouth.position.set(3.35, 0, 8.2);
    const stopNorth = new THREE.Mesh(stopBarGeo, matMarkingWhite);
    stopNorth.position.set(-3.35, 0, -8.2);
    gMarkings.add(stopSouth, stopNorth);
    addInkOutlines(
      stopSouth,
      gMarkings,
      inkLineMat,
      inkHullMat,
      0.035,
      15,
      inkLineObjects,
    );
    addInkOutlines(
      stopNorth,
      gMarkings,
      inkLineMat,
      inkHullMat,
      0.035,
      15,
      inkLineObjects,
    );

    // Dashed lane divider stripes with dark ink outlines
    for (const laneX of [-3.4, 3.4]) {
      for (let z = -17.5; z <= 17.5; z += 4.2) {
        if (Math.abs(Math.abs(z) - 11.25) < 3.0) continue;
        const dash = new THREE.Mesh(dashGeo, matMarkingWhite);
        dash.position.set(laneX, 0, z);
        gMarkings.add(dash);
        addInkOutlines(
          dash,
          gMarkings,
          inkLineMat,
          inkHullMat,
          0.05,
          15,
          inkLineObjects,
        );
      }
    }

    // Painted directional lane arrows with dark ink outlines
    for (const [ax, az] of [
      [1.7, 4.5],
      [5.1, 4.5],
      [-1.7, -4.5],
      [-5.1, -4.5],
    ] as const) {
      const stem = new THREE.Mesh(arrowStemGeo, matMarkingWhite);
      stem.position.set(ax, 0, az);
      gMarkings.add(stem);
      addInkOutlines(
        stem,
        gMarkings,
        inkLineMat,
        inkHullMat,
        0.04,
        15,
        inkLineObjects,
      );
    }
  }

  // ============================================================================
  // PART 6: High-Contrast Anime Zebra Crosswalk Stripes (`zebra-crosswalk`)
  // ============================================================================
  const gCrosswalk = subPartGroups.get('zebra-crosswalk')!;
  {
    const stripeGeo = new THREE.BoxGeometry(0.74, 0.024, 3.4);
    stripeGeo.translate(0, 0.012, 0);
    disposableGeometries.push(stripeGeo);

    for (const crossZ of [-11.25, 11.25]) {
      for (let x = -5.6; x <= 5.6; x += 1.4) {
        if (Math.abs(x) < 0.8) continue;
        const stripe = new THREE.Mesh(stripeGeo, matMarkingWhite);
        stripe.position.set(x, 0, crossZ);
        gCrosswalk.add(stripe);
        addInkOutlines(
          stripe,
          gCrosswalk,
          inkLineMat,
          inkHullMat,
          0.04,
          15,
          inkLineObjects,
        );
      }
    }
  }

  // ============================================================================
  // PART 7: Tactile Warning Blister Paving (`tactile-paving`)
  // ============================================================================
  const gTactile = subPartGroups.get('tactile-paving')!;
  {
    const plateGeo = new THREE.BoxGeometry(0.65, 0.024, 3.2);
    plateGeo.translate(0, 0.012, 0);
    const domeGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.02, 8);
    domeGeo.translate(0, 0.03, 0);
    disposableGeometries.push(plateGeo, domeGeo);

    const domeLocations: [number, number][] = [];
    for (const side of [-1, 1]) {
      for (const crossZ of [-11.25, 11.25]) {
        const plateX = side * 7.95;
        const plate = new THREE.Mesh(plateGeo, matTactileYellow);
        plate.position.set(plateX, 0, crossZ);
        gTactile.add(plate);
        addInkOutlines(
          plate,
          gTactile,
          inkLineMat,
          inkHullMat,
          0.035,
          15,
          inkLineObjects,
        );

        for (let dx = -0.18; dx <= 0.18; dx += 0.18) {
          for (let dz = -1.35; dz <= 1.35; dz += 0.3) {
            domeLocations.push([plateX + dx, crossZ + dz]);
          }
        }
      }
    }

    const domeInstanced = new THREE.InstancedMesh(
      domeGeo,
      matTactileYellow,
      domeLocations.length,
    );
    const dummy = new THREE.Object3D();
    domeLocations.forEach(([x, z], idx) => {
      dummy.position.set(x, 0, z);
      dummy.updateMatrix();
      domeInstanced.setMatrixAt(idx, dummy.matrix);
    });
    domeInstanced.instanceMatrix.needsUpdate = true;
    domeInstanced.computeBoundingSphere();
    gTactile.add(domeInstanced);
  }

  // ============================================================================
  // PART 8: Detailed Manhole Covers (2) & Storm Drains (4) with Dark Ink Outlines
  // ============================================================================
  const gDrainage = subPartGroups.get('drainage-utility-covers')!;
  {
    // 2 Detailed Road Manhole Covers with outer ink rim, inner lid, and cross-hatch waffle tread lines
    const manholeRimGeo = new THREE.CylinderGeometry(0.68, 0.72, 0.032, 24);
    manholeRimGeo.translate(0, 0.016, 0);
    const manholeLidGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.038, 24);
    manholeLidGeo.translate(0, 0.019, 0);
    const manholeCenterGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.044, 16);
    manholeCenterGeo.translate(0, 0.022, 0);
    const grateFrameGeo = new THREE.BoxGeometry(0.52, 0.028, 1.04);
    grateFrameGeo.translate(0, 0.014, 0);
    const grateBarGeo = new THREE.BoxGeometry(0.44, 0.034, 0.06);
    grateBarGeo.translate(0, 0.017, 0);
    disposableGeometries.push(
      manholeRimGeo,
      manholeLidGeo,
      manholeCenterGeo,
      grateFrameGeo,
      grateBarGeo,
    );

    for (const [mhX, mhZ] of [
      [-1.65, 3.8],
      [1.75, -4.6],
    ] as const) {
      const mhRim = new THREE.Mesh(manholeRimGeo, matDrainIron);
      mhRim.position.set(mhX, 0, mhZ);
      const mhLid = new THREE.Mesh(manholeLidGeo, matCurb);
      mhLid.position.set(mhX, 0, mhZ);
      const mhCenter = new THREE.Mesh(manholeCenterGeo, matDrainIron);
      mhCenter.position.set(mhX, 0, mhZ);

      gDrainage.add(mhRim, mhLid, mhCenter);
      addInkOutlines(
        mhRim,
        gDrainage,
        inkLineMat,
        inkHullMat,
        0.045,
        12,
        inkLineObjects,
      );
      addInkOutlines(
        mhLid,
        gDrainage,
        inkLineMat,
        inkHullMat,
        0.03,
        12,
        inkLineObjects,
      );
      addInkOutlines(
        mhCenter,
        gDrainage,
        inkLineMat,
        undefined,
        0,
        12,
        inkLineObjects,
      );

      // Waffle cross-hatch comic ink line art across each manhole cover
      const hatchPts: THREE.Vector3[] = [];
      for (const offset of [-0.3, -0.15, 0, 0.15, 0.3]) {
        const span = Math.sqrt(Math.max(0.01, 0.52 * 0.52 - offset * offset));
        hatchPts.push(new THREE.Vector3(mhX - span, 0.046, mhZ + offset));
        hatchPts.push(new THREE.Vector3(mhX + span, 0.046, mhZ + offset));
        hatchPts.push(new THREE.Vector3(mhX + offset, 0.046, mhZ - span));
        hatchPts.push(new THREE.Vector3(mhX + offset, 0.046, mhZ + span));
      }
      const hatchGeo = new THREE.BufferGeometry().setFromPoints(hatchPts);
      disposableGeometries.push(hatchGeo);
      const hatchLines = new THREE.LineSegments(hatchGeo, inkLineMat);
      gDrainage.add(hatchLines);
      inkLineObjects.push(hatchLines);
    }

    // 4 Roadside Storm Drain Grates with individual iron bars & dark ink outlines
    for (const side of [-1, 1]) {
      for (const gz of [-6.5, 6.5]) {
        const grateX = side * 6.66;
        const grateFrame = new THREE.Mesh(grateFrameGeo, inkFlatMat);
        grateFrame.position.set(grateX, 0, gz);
        gDrainage.add(grateFrame);

        for (let b = -0.38; b <= 0.38; b += 0.15) {
          const bar = new THREE.Mesh(grateBarGeo, matCurb);
          bar.position.set(grateX, 0, gz + b);
          gDrainage.add(bar);
          addInkOutlines(
            bar,
            gDrainage,
            inkLineMat,
            undefined,
            0,
            15,
            inkLineObjects,
          );
        }
      }
    }
  }

  // ============================================================================
  // PART 9: Sculpted Traffic Island, Reflector Studs & Bollards (`center-median-island`)
  // ============================================================================
  const gMedian = subPartGroups.get('center-median-island')!;
  {
    const islandGeo = new THREE.BoxGeometry(1.15, 0.18, 4.6);
    islandGeo.translate(0, 0.09, 0);
    const bollardPostGeo = new THREE.CylinderGeometry(0.14, 0.17, 0.82, 12);
    bollardPostGeo.translate(0, 0.41, 0);
    const bollardBeaconGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.18, 12);
    bollardBeaconGeo.translate(0, 0.68, 0);
    const studGeo = new THREE.BoxGeometry(0.16, 0.04, 0.16);
    studGeo.translate(0, 0.02, 0);
    disposableGeometries.push(islandGeo, bollardPostGeo, bollardBeaconGeo, studGeo);

    for (const islandZ of [-11.25, 11.25]) {
      const island = new THREE.Mesh(islandGeo, matCurb);
      island.position.set(0, 0, islandZ);
      island.castShadow = true;
      gMedian.add(island);
      addInkOutlines(
        island,
        gMedian,
        inkLineMat,
        inkHullMat,
        0.03,
        15,
        inkLineObjects,
      );

      const post = new THREE.Mesh(bollardPostGeo, matDrainIron);
      post.position.set(0, 0.18, islandZ);
      post.castShadow = true;
      const beacon = new THREE.Mesh(bollardBeaconGeo, matAmberEmissive);
      beacon.position.set(0, 0.18, islandZ);
      gMedian.add(post, beacon);
      addInkOutlines(
        post,
        gMedian,
        inkLineMat,
        inkHullMat,
        0.035,
        15,
        inkLineObjects,
      );
      addInkOutlines(
        beacon,
        gMedian,
        inkLineMat,
        inkHullMat,
        0.03,
        15,
        inkLineObjects,
      );
    }

    const studCount = 12;
    const studInstanced = new THREE.InstancedMesh(studGeo, matAmberEmissive, studCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < studCount; i++) {
      const z = -7.2 + i * 1.3;
      dummy.position.set(0, 0, z);
      dummy.updateMatrix();
      studInstanced.setMatrixAt(i, dummy.matrix);
    }
    studInstanced.instanceMatrix.needsUpdate = true;
    studInstanced.computeBoundingSphere();
    gMedian.add(studInstanced);
  }

  // ============================================================================
  // PART 10: Comic Ink Asphalt Cracks & Lo-Fi Rain Puddles (`surface-weathering-puddles`)
  // ============================================================================
  const gWeathering = subPartGroups.get('surface-weathering-puddles')!;
  {
    const puddleConfigs: Array<{x: number; z: number; rx: number; rz: number}> = [
      {x: -5.4, z: 6.2, rx: 0.95, rz: 1.85},
      {x: 5.2, z: -5.8, rx: 1.1, rz: 2.1},
      {x: -4.8, z: -14.2, rx: 0.85, rz: 1.5},
      {x: 5.5, z: 14.8, rx: 0.9, rz: 1.65},
    ];

    for (const p of puddleConfigs) {
      const puddleShape = new THREE.Shape();
      puddleShape.absellipse(0, 0, p.rx, p.rz, 0, Math.PI * 2, false, 0);
      const puddleGeo = new THREE.ShapeGeometry(puddleShape, 20);
      puddleGeo.rotateX(-Math.PI / 2);
      puddleGeo.translate(p.x, 0.005, p.z);
      disposableGeometries.push(puddleGeo);

      const puddleMesh = new THREE.Mesh(puddleGeo, matPuddle);
      gWeathering.add(puddleMesh);
      addInkOutlines(puddleMesh, gWeathering, inkLineMat, undefined, 0, 5, inkLineObjects);
    }

    const crackVertices: THREE.Vector3[] = [
      new THREE.Vector3(-4.2, 0.01, 3.0),
      new THREE.Vector3(-3.8, 0.01, 4.1),
      new THREE.Vector3(-3.8, 0.01, 4.1),
      new THREE.Vector3(-4.4, 0.01, 5.3),
      new THREE.Vector3(2.8, 0.01, -2.5),
      new THREE.Vector3(3.4, 0.01, -1.2),
      new THREE.Vector3(3.4, 0.01, -1.2),
      new THREE.Vector3(2.9, 0.01, 0.2),
    ];
    const crackGeo = new THREE.BufferGeometry().setFromPoints(crackVertices);
    disposableGeometries.push(crackGeo);
    const crackLines = new THREE.LineSegments(crackGeo, inkLineMat);
    gWeathering.add(crackLines);
    inkLineObjects.push(crackLines);
  }

  // ============================================================================
  // BUILD SURROUNDING CITY, HERO BUILDINGS WITH BALCONIES, SIDEWALK PROPS & MOUNTAINS
  // ============================================================================
  const {heroBlocksGroup, sidewalkPropsGroup, cityAndMountainsGroup} =
    buildSurroundingCityAndMountains({
      palette: defaultPalette,
      grad3,
      grad4,
      inkLineMat,
      inkHullMat,
      inkRegistry: inkLineObjects,
      disposableGeometries,
      disposableMaterials,
      disposableTextures,
    });

  // ============================================================================
  // PART 11: Extended Multi-Block City, Cross-Streets & 360° Distant Mountains (`roadside-utility-strip`)
  // ============================================================================
  const gUtility = subPartGroups.get('roadside-utility-strip')!;
  {
    // Offset by -0.615 so cityAndMountainsGroup sits at world Y = 0.00m
    cityAndMountainsGroup.position.set(0, -0.615, 0);
    gUtility.add(cityAndMountainsGroup);
  }

  // ============================================================================
  // PART 12: 360° IRL Blue Sky, Blazing Sun Disc, Solar Corona & Volumetric Clouds Dome (`halftone-burst-rig`)
  // ============================================================================
  const gHalftone = subPartGroups.get('halftone-burst-rig')!;
  const sunDirection = new THREE.Vector3(0.02, 0.22, -0.975).normalize();
  const skyDomeMaterial = createRealisticSkyDomeShaderMaterial(sunDirection);
  {
    disposableMaterials.push(skyDomeMaterial);
    const skyDomeGeo = new THREE.SphereGeometry(920, 48, 32);
    disposableGeometries.push(skyDomeGeo);
    const skyDomeMesh = new THREE.Mesh(skyDomeGeo, skyDomeMaterial);
    gHalftone.add(skyDomeMesh);
  }

  // ============================================================================
  // PART 13: 6 Hero Block Storefronts, Upper Apartment Facades & Balconies (`storefront-crack-and-sons`)
  // ============================================================================
  const gStorefront = subPartGroups.get('storefront-crack-and-sons')!;
  {
    gStorefront.add(heroBlocksGroup);
  }

  // ============================================================================
  // PART 14: Cel-Shaded Anime / Lo-Fi Cars (`anime-lofi-cars`)
  // Distributed across ALL Avenues, Boulevards, Cross-Streets & Left/Right Intersection Turns!
  // ============================================================================
  const gCars = subPartGroups.get('anime-lofi-cars')!;
  const cityVehicleFleetSpecs = generateCityVehicleFleet();
  const cityVehicleHandles: Array<{
    spec: CityVehicleSpec;
    group: THREE.Group;
  }> = [];
  {
    for (const vSpec of cityVehicleFleetSpecs) {
      const carObj = buildAnimeCarAsset({
        palette: defaultPalette,
        bodyColorHex: vSpec.bodyColorHex,
        accentColorHex: vSpec.accentColorHex,
        plateCode: vSpec.plateCode,
        grad3,
        grad4,
        inkLineMat,
        inkHullMat,
        inkRegistry: inkLineObjects,
        disposableGeometries,
        disposableMaterials,
        disposableTextures,
      });
      const initialEval = evaluateCityVehicleAtFrame(
        vSpec,
        0,
        MAIN_STREET_SECTION_1_MANIFEST.durationInFrames,
      );
      carObj.position.set(
        initialEval.position[0],
        initialEval.position[1],
        initialEval.position[2],
      );
      carObj.rotation.y = initialEval.rotationY;
      gCars.add(carObj);
      cityVehicleHandles.push({spec: vSpec, group: carObj});
    }
  }

  // ============================================================================
  // PART 15: Street Lamps, American Fire Hydrants, Dustbins, Benches, Mailboxes & Trees (`anime-street-lamps`)
  // ============================================================================
  const gStreetLamps = subPartGroups.get('anime-street-lamps')!;
  {
    gStreetLamps.add(sidewalkPropsGroup);
  }

  // ============================================================================
  // DAYLIGHT SUN & STUDIO CEL-SHADED LIGHTING RIG (Aligned with IRL Sun Vector)
  // ============================================================================
  const keyLight = new THREE.DirectionalLight(
    defaultPalette.keyLightColor,
    defaultPalette.keyLightIntensity,
  );
  keyLight.position.copy(sunDirection).multiplyScalar(160);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 10;
  keyLight.shadow.camera.far = 320;
  const d = 38;
  keyLight.shadow.camera.left = -d;
  keyLight.shadow.camera.right = d;
  keyLight.shadow.camera.top = d;
  keyLight.shadow.camera.bottom = -d;
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.normalBias = 0.02;
  scene.add(keyLight);

  const hemiLight = new THREE.HemisphereLight(
    defaultPalette.hemiSkyColor,
    defaultPalette.hemiGroundColor,
    defaultPalette.hemiIntensity,
  );
  scene.add(hemiLight);

  const rimLight = new THREE.DirectionalLight(defaultPalette.rimLightColor, 1.35);
  rimLight.position.set(-28, 24, 32);
  scene.add(rimLight);

  const streetPointLights: THREE.PointLight[] = [];
  for (const lz of [-11.25, 6.8]) {
    const pt = new THREE.PointLight(defaultPalette.laneMarkingYellow, 1.6, 22, 1.4);
    pt.position.set(-6.5, 4.8, lz);
    scene.add(pt);
    streetPointLights.push(pt);
  }

  let activeMood: StyleMoodId = 'lofi-night';

  const updateForFrame: MainStreetSceneHandle['updateForFrame'] = ({
    frame,
    fps,
    explodeFactor,
    styleMood,
    timeOfDayMode = 'day',
    inkOutlinesEnabled,
    halftoneIntensity,
    isolatedSubPartId,
    wireframeMode,
  }) => {
    const palette = STYLE_PALETTES[styleMood];
    const timeSec = frame / Math.max(1, fps);
    const beat = (timeSec * MAIN_STREET_SECTION_1_MANIFEST.bpm) / 60;
    const beatEnvelope = Math.pow(1 - (beat - Math.floor(beat)), 2.2);

    const dayNight = computeDayNightCycleState(
      frame,
      MAIN_STREET_SECTION_1_MANIFEST.durationInFrames,
      timeOfDayMode,
    );
    const nf = dayNight.nightFactor;

    if (styleMood !== activeMood) {
      activeMood = styleMood;
      matSubbase.color.set(palette.subbaseConcrete);
      matCurb.color.set(palette.curbStone);
      matMarkingWhite.color.set(palette.laneMarkingWhite);
      matMarkingYellow.color.set(palette.laneMarkingYellow);
      matTactileYellow.color.set(palette.tactileYellow);
      matDrainIron.color.set(palette.drainIron);
      matPuddle.color.set(palette.puddleTint);
      matAmberEmissive.color.set(palette.laneMarkingYellow);
      inkLineMat.color.set(palette.inkOutlineColor);
      inkHullMat.color.set(palette.inkOutlineColor);
      inkFlatMat.color.set(palette.inkOutlineColor);
    }

    // Dynamic Day / Night / Sunset Scene Lighting & Atmospheric Fog Interpolation
    const dayKeyCol = new THREE.Color(palette.keyLightColor);
    const nightKeyCol = new THREE.Color('#93C5FD');
    keyLight.color.copy(dayKeyCol).lerp(nightKeyCol, nf);
    keyLight.intensity = THREE.MathUtils.lerp(palette.keyLightIntensity, 1.35, nf);
    if (nf < 0.55) {
      keyLight.position
        .set(
          dayNight.sunDirection[0],
          Math.max(0.18, dayNight.sunDirection[1]),
          dayNight.sunDirection[2],
        )
        .normalize()
        .multiplyScalar(160);
    } else {
      keyLight.position
        .set(
          dayNight.moonDirection[0],
          Math.max(0.22, dayNight.moonDirection[1]),
          dayNight.moonDirection[2],
        )
        .normalize()
        .multiplyScalar(160);
    }

    const dayHemiSky = new THREE.Color(palette.hemiSkyColor);
    const nightHemiSky = new THREE.Color('#1E293B');
    hemiLight.color.copy(dayHemiSky).lerp(nightHemiSky, nf);

    const dayHemiGround = new THREE.Color(palette.hemiGroundColor);
    const nightHemiGround = new THREE.Color('#0F172A');
    hemiLight.groundColor.copy(dayHemiGround).lerp(nightHemiGround, nf);
    hemiLight.intensity = THREE.MathUtils.lerp(palette.hemiIntensity, 0.72, nf);

    const dayFogCol = new THREE.Color(palette.fogColor);
    const nightFogCol = new THREE.Color('#0F172A');
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(dayFogCol).lerp(nightFogCol, nf);
    }
    if (scene.background instanceof THREE.Color) {
      scene.background
        .set(palette.skyTop)
        .lerp(new THREE.Color('#060B19'), nf);
    }

    const meshMaterials = [
      matSubbase,
      matAsphalt,
      matCurb,
      matSidewalk,
      matMarkingWhite,
      matMarkingYellow,
      matTactileYellow,
      matDrainIron,
      matPuddle,
    ];
    for (const m of meshMaterials) {
      m.wireframe = wireframeMode;
    }

    for (const inkObj of inkLineObjects) {
      inkObj.visible = inkOutlinesEnabled && !wireframeMode;
    }

    for (const spec of MAIN_STREET_SECTION_1_MANIFEST.subParts) {
      const grp = subPartGroups.get(spec.id);
      if (!grp) continue;
      grp.position.y = computeSubPartElevationY(
        spec.baseElevationY,
        spec.explodedOffsetY,
        explodeFactor,
      );
      grp.visible =
        isolatedSubPartId === null || isolatedSubPartId === spec.id;
    }

    // Deterministic Remotion frame-driven motion for all 32 City Vehicles (Parked, Cruising, Left Turns & Right Turns)
    for (const vh of cityVehicleHandles) {
      const evalState = evaluateCityVehicleAtFrame(
        vh.spec,
        frame,
        MAIN_STREET_SECTION_1_MANIFEST.durationInFrames,
      );
      vh.group.position.set(
        evalState.position[0],
        evalState.position[1],
        evalState.position[2],
      );
      vh.group.rotation.y = evalState.rotationY;
    }

    skyDomeMaterial.uniforms.uTime.value = timeSec;
    skyDomeMaterial.uniforms.uNightFactor.value = nf;
    skyDomeMaterial.uniforms.uSunDir.value
      .set(
        dayNight.sunDirection[0],
        dayNight.sunDirection[1],
        dayNight.sunDirection[2],
      )
      .normalize();
    skyDomeMaterial.uniforms.uMoonDir.value
      .set(
        dayNight.moonDirection[0],
        dayNight.moonDirection[1],
        dayNight.moonDirection[2],
      )
      .normalize();
    skyDomeMaterial.uniforms.uHalftoneOverlay.value =
      styleMood === 'pop-halftone' ? halftoneIntensity : 0.0;

    for (const pt of streetPointLights) {
      pt.intensity = (1.4 + beatEnvelope * 0.55) * (1.0 + nf * 1.45);
    }

    threeSceneCast.updateAtFrame(frame, MAIN_STREET_SECTION_1_MANIFEST.fps);
  };

  // Mount 3D Articulated Character Cast & 3D <Crowd /> directly on Main Street sidewalks and windows
  const threeSceneCast = buildThreeSceneCastDirector('main-street');
  rootGroup.add(threeSceneCast.rootGroup);

  const dispose = () => {
    threeSceneCast.dispose();
    disposableGeometries.forEach((g) => g.dispose());
    disposableMaterials.forEach((m) => m.dispose());
    disposableTextures.forEach((t) => t.dispose());
    scene.remove(rootGroup);
    scene.remove(keyLight);
    scene.remove(hemiLight);
    scene.remove(rimLight);
    streetPointLights.forEach((pt) => scene.remove(pt));
  };

  return {
    rootGroup,
    subPartGroups,
    inkLineObjects,
    halftoneMaterials,
    keyLight,
    hemiLight,
    rimLight,
    streetPointLights,
    updateForFrame,
    dispose,
  };
}
