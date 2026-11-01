import * as THREE from 'three';

export interface MainStreetStyleSignature {
  styleId: 'main-street-cel-ink-v1';
  styleName: string;
  celBands: readonly [3, 4];
  inkOutlineColor: string;
  invertedHullScale: number;
  edgeThresholdAngleDeg: number;
  comicFrameBorderPx: number;
  supportedScenes: readonly [
    'MainStreetRoadSection1',
    'GarageNuclearLaunch',
    'DarkRoomBedroom',
    'CrackAndSonsShopInterior',
  ];
}

export const MAIN_STREET_STYLE_SIGNATURE: MainStreetStyleSignature = {
  styleId: 'main-street-cel-ink-v1',
  styleName:
    'Main Street Cel-Shaded Toon (3/4-Step Quantized Gradients) + 2D Comic Ink Outlines & Inverted Hulls + Lo-Fi Hatch Textures',
  celBands: [3, 4],
  inkOutlineColor: '#0A0812',
  invertedHullScale: 1.018,
  edgeThresholdAngleDeg: 18,
  comicFrameBorderPx: 5,
  supportedScenes: [
    'MainStreetRoadSection1',
    'GarageNuclearLaunch',
    'DarkRoomBedroom',
    'CrackAndSonsShopInterior',
  ],
};

/**
 * Pure helper: selects 3-band or 4-band quantized cel-shading steps based on PBR roughness/metalness.
 */
export function selectMainStreetToonSteps(
  roughness = 0.65,
  metalness = 0.08,
): 3 | 4 {
  if (metalness >= 0.32 || roughness <= 0.38) {
    return 4;
  }
  return 3;
}

/**
 * Pure helper: determines whether a 3D mesh should receive an inverted BackSide comic ink hull
 * in addition to its EdgesGeometry crease lines.
 */
export function shouldAttachInvertedInkHull(
  bboxSize: [number, number, number],
  isTransparent: boolean,
  opacity: number,
): boolean {
  if (isTransparent && opacity < 0.85) {
    return false;
  }
  const [sx, sy, sz] = bboxSize;
  const minDim = Math.min(sx, sy, sz);
  const maxDim = Math.max(sx, sy, sz);
  // Must be a 3D solid prop (not a flat 2D plane/decal and not a massive room shell wall/floor)
  return minDim >= 0.025 && maxDim >= 0.06 && maxDim <= 3.1;
}

/**
 * Creates a quantized step-gradient DataTexture for Cel-Shading (MeshToonMaterial),
 * identical to Main Street's createToonGradientTexture.
 */
export function createMainStreetToonGradientTexture(
  steps: 3 | 4,
): THREE.DataTexture {
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
 * Creates a smooth multi-step cel-gradient DataTexture with LinearFilter for organic 3D characters,
 * preventing hard facet banding while preserving stylized cel-shaded dimensionality.
 */
export function createSmoothCharacterToonGradientTexture(): THREE.DataTexture {
  const data = new Uint8Array([82, 122, 164, 204, 236, 255]);
  const texture = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Converts a MeshStandardMaterial into a Cel-Shaded MeshToonMaterial with Main Street's
 * quantized 3-band or 4-band gradientMap (or smooth character gradientMap) while preserving all maps, colors, emissives, and offsets.
 */
export function convertStandardToMainStreetToonMaterial(
  mat: THREE.Material,
  grad3: THREE.DataTexture,
  grad4: THREE.DataTexture,
  smoothCharGrad?: THREE.DataTexture,
): THREE.Material {
  if (mat instanceof THREE.MeshStandardMaterial) {
    const steps = selectMainStreetToonSteps(mat.roughness, mat.metalness);
    const toonMat = new THREE.MeshToonMaterial({
      color: mat.color.clone(),
      map: mat.map,
      gradientMap: smoothCharGrad ?? (steps === 4 ? grad4 : grad3),
      emissive: mat.emissive.clone(),
      emissiveMap: mat.emissiveMap,
      emissiveIntensity: mat.emissiveIntensity,
      transparent: mat.transparent,
      opacity: mat.opacity,
      side: mat.side,
      depthWrite: mat.depthWrite,
      blending: mat.blending,
      polygonOffset: mat.polygonOffset,
      polygonOffsetFactor: mat.polygonOffsetFactor,
      polygonOffsetUnits: mat.polygonOffsetUnits,
    });
    toonMat.name = mat.name ? `${mat.name}-toon` : 'main-street-toon-mat';
    return toonMat;
  }
  return mat;
}

/**
 * Traverses a built 3D scene rootGroup and applies the full Main Street visual style:
 * 1) Converts any MeshStandardMaterial to quantized 3-band / 4-band MeshToonMaterial (or smooth cel shading for characters).
 * 2) Wraps architectural/prop meshes in crisp 2D dark comic ink outlines (EdgesGeometry + LineSegments),
 *    while skipping internal wireframe edges on smooth organic 3D character meshes.
 * 3) Wraps 3D solid props in inverted BackSide comic ink silhouette hulls.
 */
export function applyMainStreetStyleToSceneGraph(
  rootGroup: THREE.Group,
  options?: {
    inkOutlineColor?: string;
    edgeThresholdAngle?: number;
    smoothOrganicCharacter?: boolean;
  },
): {
  inkLineObjects: THREE.Object3D[];
  convertedMaterials: THREE.Material[];
  disposeStyleResources: () => void;
} {
  const inkColor =
    options?.inkOutlineColor ?? MAIN_STREET_STYLE_SIGNATURE.inkOutlineColor;
  const thresholdAngle =
    options?.edgeThresholdAngle ??
    MAIN_STREET_STYLE_SIGNATURE.edgeThresholdAngleDeg;
  const isCharacterRoot = Boolean(
    options?.smoothOrganicCharacter ||
      rootGroup.userData.__isSmoothCharacterRig ||
      rootGroup.name.startsWith('char3d-') ||
      rootGroup.name.startsWith('three-crowd-'),
  );

  const grad3 = createMainStreetToonGradientTexture(3);
  const grad4 = createMainStreetToonGradientTexture(4);
  const charGrad = createSmoothCharacterToonGradientTexture();

  const inkLineMat = new THREE.LineBasicMaterial({
    color: inkColor,
    transparent: true,
    opacity: 0.94,
  });
  const inkHullMat = new THREE.MeshBasicMaterial({
    color: inkColor,
    side: THREE.BackSide,
  });

  const inkLineObjects: THREE.Object3D[] = [];
  const styleGeometries: THREE.BufferGeometry[] = [];
  const convertedMaterials: THREE.Material[] = [];
  const materialCache = new Map<string, THREE.Material>();

  const targetMeshes: THREE.Mesh[] = [];
  rootGroup.traverse((node) => {
    if (node instanceof THREE.LineSegments) {
      node.userData.__isMainStreetInkOutline = true;
      if (!inkLineObjects.includes(node)) {
        inkLineObjects.push(node);
      }
      return;
    }
    if ((node as THREE.Mesh).isMesh) {
      const mesh = node as THREE.Mesh;
      if (mesh.userData.__isMainStreetInkOutline) return;
      targetMeshes.push(mesh);
    }
  });

  const scratchBox = new THREE.Box3();
  const scratchSize = new THREE.Vector3();

  for (const mesh of targetMeshes) {
    // Check if mesh belongs to a smooth 3D character rig
    let isSmoothCharMesh = Boolean(
      isCharacterRoot || mesh.userData.__isSmoothCharacterMesh,
    );
    if (!isSmoothCharMesh) {
      let p: THREE.Object3D | null = mesh.parent;
      while (p) {
        if (
          p.userData?.__isSmoothCharacterRig ||
          p.name?.startsWith('char3d-')
        ) {
          isSmoothCharMesh = true;
          break;
        }
        p = p.parent;
      }
    }

    if (isSmoothCharMesh && mesh.geometry) {
      mesh.geometry.computeVertexNormals();
    }

    const useSmoothGrad = isSmoothCharMesh ? charGrad : undefined;

    // 1. Convert MeshStandardMaterial -> MeshToonMaterial
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((m) => {
        const cacheKey = `${m.uuid}:${isSmoothCharMesh ? 'char' : 'env'}`;
        let converted = materialCache.get(cacheKey);
        if (!converted) {
          converted = convertStandardToMainStreetToonMaterial(
            m,
            grad3,
            grad4,
            useSmoothGrad,
          );
          materialCache.set(cacheKey, converted);
          if (converted !== m) convertedMaterials.push(converted);
        }
        return converted;
      });
    } else if (mesh.material) {
      const m = mesh.material;
      const cacheKey = `${m.uuid}:${isSmoothCharMesh ? 'char' : 'env'}`;
      let converted = materialCache.get(cacheKey);
      if (!converted) {
        converted = convertStandardToMainStreetToonMaterial(
          m,
          grad3,
          grad4,
          useSmoothGrad,
        );
        materialCache.set(cacheKey, converted);
        if (converted !== m) convertedMaterials.push(converted);
      }
      mesh.material = converted;
    }

    const primaryMat = Array.isArray(mesh.material)
      ? mesh.material[0]
      : mesh.material;
    if (!primaryMat) continue;

    // Skip additive glow cones, low-opacity volumetric shafts, or BackSide hulls
    const isTransparent = Boolean(primaryMat.transparent);
    const opacity = primaryMat.opacity ?? 1.0;
    if (
      primaryMat.blending === THREE.AdditiveBlending ||
      (isTransparent && opacity < 0.65) ||
      primaryMat.side === THREE.BackSide
    ) {
      continue;
    }

    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox();
    }
    const bbox = mesh.geometry.boundingBox;
    if (!bbox) continue;
    scratchBox.copy(bbox);
    scratchBox.getSize(scratchSize);
    const sx = scratchSize.x * Math.abs(mesh.scale.x);
    const sy = scratchSize.y * Math.abs(mesh.scale.y);
    const sz = scratchSize.z * Math.abs(mesh.scale.z);
    const maxDim = Math.max(sx, sy, sz);

    // Skip micro-particles (dust motes, tiny eye catchlights < 2.8cm)
    if (maxDim < 0.028) {
      continue;
    }

    // 2. Attach 2D Comic Ink EdgesGeometry LineSegments ONLY for architectural/hard-surface props
    // (Skip internal EdgesGeometry lines on organic 3D character meshes so limbs/torsos never have blocky lines!)
    const skipEdges =
      Boolean(mesh.userData.__skipMainStreetEdges) ||
      (isSmoothCharMesh && !mesh.userData.__forceComicEdges);
    const alreadyHasEdgeLines = mesh.children.some(
      (ch) => ch instanceof THREE.LineSegments,
    );
    if (!alreadyHasEdgeLines && !skipEdges) {
      const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
      styleGeometries.push(edgesGeo);
      const lineSegments = new THREE.LineSegments(edgesGeo, inkLineMat);
      lineSegments.userData.__isMainStreetInkOutline = true;
      mesh.add(lineSegments);
      inkLineObjects.push(lineSegments);
    }

    // 3. Attach Inverted BackSide Comic Ink Silhouette Hull for 3D solid props
    const skipHull =
      Boolean(mesh.userData.__skipMainStreetHull) ||
      (isSmoothCharMesh && !mesh.userData.__allowCharacterSilhouetteHull);
    const alreadyHasHull = mesh.children.some(
      (ch) => ch.userData && ch.userData.__isMainStreetInkHull,
    );
    if (
      !alreadyHasHull &&
      !skipHull &&
      shouldAttachInvertedInkHull([sx, sy, sz], isTransparent, opacity)
    ) {
      const hullMesh = new THREE.Mesh(mesh.geometry, inkHullMat);
      const hs =
        (mesh.userData.__customInkHullScale as number | undefined) ??
        (isSmoothCharMesh ? 1.012 : MAIN_STREET_STYLE_SIGNATURE.invertedHullScale);
      hullMesh.scale.set(hs, hs, hs);
      hullMesh.userData.__isMainStreetInkOutline = true;
      hullMesh.userData.__isMainStreetInkHull = true;
      mesh.add(hullMesh);
      inkLineObjects.push(hullMesh);
    }
  }

  const disposeStyleResources = () => {
    for (const g of styleGeometries) g.dispose();
    for (const m of convertedMaterials) m.dispose();
    inkLineMat.dispose();
    inkHullMat.dispose();
    grad3.dispose();
    grad4.dispose();
    charGrad.dispose();
  };

  return {
    inkLineObjects,
    convertedMaterials,
    disposeStyleResources,
  };
}

/**
 * Adds Main Street's signature hand-drawn comic ink hatch strokes, cel-shaded tonal bands,
 * and bold comic ink border onto a 2D CanvasRenderingContext2D.
 */
export function drawMainStreetComicHatchAndBorderOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options?: {
    inkColor?: string;
    hatchCount?: number;
    borderWidth?: number;
    hatchAlpha?: number;
    addHalftoneCornerDots?: boolean;
    halftoneColor?: string;
  },
): void {
  const inkColor =
    options?.inkColor ?? MAIN_STREET_STYLE_SIGNATURE.inkOutlineColor;
  const hatchCount = options?.hatchCount ?? 28;
  const borderWidth = options?.borderWidth ?? 6;
  const hatchAlpha = options?.hatchAlpha ?? 0.34;

  ctx.save();
  // 1. Hand-drawn comic ink longitudinal hatch strokes (deterministic positions)
  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = hatchAlpha;
  for (let i = 0; i < hatchCount; i++) {
    const x = ((i * 73 + 19) % Math.max(1, width - 36)) + 18;
    const y = ((i * 139 + 23) % Math.max(1, height - 56)) + 18;
    const len = 22 + ((i * 19) % 34);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + len);
    ctx.stroke();
  }

  // 2. Optional subtle halftone pop-art corner dots
  if (options?.addHalftoneCornerDots) {
    ctx.fillStyle = options.halftoneColor ?? '#38BDF8';
    ctx.globalAlpha = 0.28;
    for (let gx = 0; gx < 5; gx++) {
      for (let gy = 0; gy < 5; gy++) {
        const r = Math.max(1.5, (6 - (gx + gy)) * 1.4);
        ctx.beginPath();
        ctx.arc(24 + gx * 16, 24 + gy * 16, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width - 24 - gx * 16, height - 24 - gy * 16, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 3. Crisp dark comic ink border
  if (borderWidth > 0) {
    ctx.globalAlpha = 0.92;
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(
      borderWidth / 2,
      borderWidth / 2,
      width - borderWidth,
      height - borderWidth,
    );
  }
  ctx.restore();
}

/**
 * Creates a Main Street Cel-Shaded Exterior Vista CanvasTexture for windows and open garage doors,
 * featuring Main Street's Rayleigh/Mie blue or twilight sky, cumulus clouds, cel-shaded brick
 * storefronts with wrought-iron balconies, utility poles with pole-to-pole cables, and diagonal
 * anime glass reflection slashes.
 */
export function createMainStreetExteriorVistaTexture(
  mode: 'day-street' | 'twilight-street' | 'night-city' = 'twilight-street',
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 1. Sky gradient matching Main Street's sky shader
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 340);
    if (mode === 'day-street') {
      skyGrad.addColorStop(0, '#1452B4');
      skyGrad.addColorStop(0.55, '#38BDF8');
      skyGrad.addColorStop(1, '#BAE6FD');
    } else if (mode === 'twilight-street') {
      skyGrad.addColorStop(0, '#1E3A8A');
      skyGrad.addColorStop(0.5, '#3B82F6');
      skyGrad.addColorStop(0.85, '#FDBA74');
      skyGrad.addColorStop(1, '#FEF08A');
    } else {
      skyGrad.addColorStop(0, '#090D16');
      skyGrad.addColorStop(0.55, '#1E293B');
      skyGrad.addColorStop(1, '#334155');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 512, 512);

    // 2. Blazing Sun / Moon disc & cel-shaded cumulus clouds
    ctx.fillStyle = mode === 'night-city' ? '#FEF9C3' : '#FFFBEB';
    ctx.beginPath();
    ctx.arc(390, 96, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0A0812';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Cel-shaded clouds
    const cloudCoords = [
      [110, 95, 48],
      [148, 88, 38],
      [260, 122, 42],
    ];
    for (const [cx, cy, cr] of cloudCoords) {
      ctx.fillStyle = mode === 'night-city' ? '#334155' : '#F8FAFC';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0A0812';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 3. Distant 360° Mountain Ridge silhouette (from Main Street)
    ctx.fillStyle = mode === 'night-city' ? '#0F172A' : '#334155';
    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.lineTo(85, 225);
    ctx.lineTo(175, 285);
    ctx.lineTo(285, 205);
    ctx.lineTo(395, 275);
    ctx.lineTo(465, 220);
    ctx.lineTo(512, 265);
    ctx.lineTo(512, 340);
    ctx.lineTo(0, 340);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0A0812';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // 4. Main Street Cel-Shaded Storefront Buildings & Balconies across the street
    const buildingSpecs = [
      {x: 12, w: 92, h: 175, col: '#9A3412', awning: '#EF4444'},
      {x: 108, w: 96, h: 198, col: '#B45309', awning: '#0284C7'},
      {x: 208, w: 102, h: 168, col: '#334155', awning: '#10B981'},
      {x: 314, w: 92, h: 192, col: '#7C2D12', awning: '#F59E0B'},
      {x: 410, w: 90, h: 178, col: '#1E3A8A', awning: '#EC4899'},
    ];
    for (const b of buildingSpecs) {
      const by = 415 - b.h;
      ctx.fillStyle = b.col;
      ctx.fillRect(b.x, by, b.w, b.h);
      ctx.strokeStyle = '#0A0812';
      ctx.lineWidth = 4;
      ctx.strokeRect(b.x, by, b.w, b.h);

      // Glowing anime upper apartment windows + wrought-iron balcony rails
      for (let wy = by + 22; wy < 355; wy += 44) {
        for (let wx = b.x + 14; wx < b.x + b.w - 22; wx += 32) {
          ctx.fillStyle = '#FEF08A';
          ctx.fillRect(wx, wy, 20, 26);
          ctx.strokeStyle = '#0A0812';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(wx, wy, 20, 26);
        }
        // Wrought-iron balcony bar
        ctx.strokeStyle = '#0A0812';
        ctx.lineWidth = 3;
        ctx.strokeRect(b.x + 8, wy + 18, b.w - 16, 10);
      }

      // Ground-floor storefront awning
      ctx.fillStyle = b.awning;
      ctx.fillRect(b.x + 4, 368, b.w - 8, 18);
      ctx.strokeRect(b.x + 4, 368, b.w - 8, 18);
    }

    // 5. Timber Utility Poles & Pole-to-Pole Catenary Cables (from Main Street)
    ctx.strokeStyle = '#0A0812';
    ctx.lineWidth = 5;
    for (const px of [68, 256, 444]) {
      ctx.beginPath();
      ctx.moveTo(px, 150);
      ctx.lineTo(px, 425);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px - 22, 168);
      ctx.lineTo(px + 22, 168);
      ctx.stroke();
    }
    ctx.lineWidth = 2.5;
    for (const cy of [165, 175]) {
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.quadraticCurveTo(162, cy + 28, 256, cy);
      ctx.quadraticCurveTo(350, cy + 28, 512, cy);
      ctx.stroke();
    }

    // 6. Main Street Sidewalk, Granite Curb & Crown-Cambered Asphalt Roadway
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(0, 415, 512, 24);
    ctx.fillStyle = '#3E465E';
    ctx.fillRect(0, 439, 512, 73);
    ctx.strokeStyle = '#0A0812';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 415);
    ctx.lineTo(512, 415);
    ctx.moveTo(0, 439);
    ctx.lineTo(512, 439);
    ctx.stroke();

    // Dashed yellow center road markings
    ctx.fillStyle = '#FACC15';
    for (let rx = 18; rx < 500; rx += 64) {
      ctx.fillRect(rx, 472, 36, 8);
      ctx.strokeRect(rx, 472, 36, 8);
    }

    // 7. Diagonal Cel-Shaded Anime Window Reflection Slashes
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.moveTo(40, 512);
    ctx.lineTo(210, 0);
    ctx.lineTo(255, 0);
    ctx.lineTo(85, 512);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(115, 512);
    ctx.lineTo(285, 0);
    ctx.lineTo(308, 0);
    ctx.lineTo(138, 512);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Outer dark comic ink frame
    ctx.strokeStyle = '#0A0812';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 502, 502);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
