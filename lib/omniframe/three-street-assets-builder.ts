import * as THREE from 'three';
import {StylePalette} from './asset-manifest';

/**
 * Shared helper to wrap any 3D mesh in crisp 2D dark comic ink outlines (EdgesGeometry + inverted hull).
 */
export function attachComicInkOutline(
  mesh: THREE.Mesh,
  parentGroup: THREE.Group,
  inkLineMat: THREE.LineBasicMaterial,
  inkHullMat?: THREE.MeshBasicMaterial,
  hullThickness = 0.03,
  thresholdAngle = 15,
  inkRegistry?: THREE.Object3D[],
): void {
  const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
  const lineSegments = new THREE.LineSegments(edgesGeo, inkLineMat);
  lineSegments.position.copy(mesh.position);
  lineSegments.rotation.copy(mesh.rotation);
  lineSegments.scale.copy(mesh.scale);
  parentGroup.add(lineSegments);
  if (inkRegistry) {
    inkRegistry.push(lineSegments);
  }

  if (inkHullMat && hullThickness > 0) {
    const hullMesh = new THREE.Mesh(mesh.geometry, inkHullMat);
    hullMesh.position.copy(mesh.position);
    hullMesh.rotation.copy(mesh.rotation);
    hullMesh.scale.set(
      mesh.scale.x * (1 + hullThickness * 0.42),
      mesh.scale.y * (1 + hullThickness * 0.42),
      mesh.scale.z * (1 + hullThickness * 0.42),
    );
    parentGroup.add(hullMesh);
    if (inkRegistry) {
      inkRegistry.push(hullMesh);
    }
  }
}

/**
 * Create a procedural flat-shaded Anime/Lo-Fi Brick & Mortar CanvasTexture with sparse comic ink brick clusters.
 */
function createLoFiBrickTexture(
  baseHex: string,
  accentHex: string,
  inkHex: string,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle flat atmospheric shadow bands (Lo-Fi aesthetic)
    ctx.fillStyle = accentHex;
    ctx.fillRect(0, 0, 512, 96);
    ctx.fillRect(0, 380, 512, 132);

    // Sparse hand-drawn anime background brick clusters
    ctx.strokeStyle = inkHex;
    ctx.lineWidth = 3;
    const clusters = [
      [48, 120],
      [310, 148],
      [140, 232],
      [360, 290],
      [72, 340],
      [250, 410],
    ];
    for (const [cx, cy] of clusters) {
      ctx.fillStyle = accentHex;
      ctx.fillRect(cx, cy, 56, 24);
      ctx.strokeRect(cx, cy, 56, 24);
      ctx.strokeRect(cx + 28, cy + 24, 56, 24);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Create a procedural Anime Window Glass texture with diagonal cel-shaded sky reflection slashes.
 */
function createAnimeWindowReflectionTexture(
  glassBaseHex: string,
  slashColorHex: string,
  inkHex: string,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = glassBaseHex;
    ctx.fillRect(0, 0, 256, 256);

    // Diagonal stepped anime reflection bands
    ctx.fillStyle = slashColorHex;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(20, 256);
    ctx.lineTo(150, 0);
    ctx.lineTo(195, 0);
    ctx.lineTo(65, 256);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(95, 256);
    ctx.lineTo(225, 0);
    ctx.lineTo(242, 0);
    ctx.lineTo(112, 256);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Crisp dark ink inner window border
    ctx.strokeStyle = inkHex;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 248, 248);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Create a high-contrast comic sign texture for "CRACK & SONS" and "Gentlemen: Enter at Your Own Risk".
 */
function createShopSignCanvasTexture(
  titleText: string,
  subtitleText: string,
  bgHex: string,
  textHex: string,
  accentHex: string,
  inkHex: string,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 512, 192);

    // Inner comic border
    ctx.strokeStyle = inkHex;
    ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, 500, 180);

    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, 480, 160);

    ctx.fillStyle = textHex;
    ctx.textAlign = 'center';
    ctx.font = '900 44px sans-serif';
    ctx.fillText(titleText, 256, 88);

    ctx.fillStyle = accentHex;
    ctx.font = '700 24px sans-serif';
    ctx.fillText(subtitleText, 256, 142);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Create a procedural License Plate texture with dark ink outline and plate code.
 */
function createLicensePlateTexture(
  plateText: string,
  inkHex: string,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#FDE68A';
    ctx.fillRect(0, 0, 256, 96);
    ctx.strokeStyle = inkHex;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 246, 86);
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.font = '900 42px monospace';
    ctx.fillText(plateText, 128, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * 1. BUILD HERO STOREFRONT ("CRACK & SONS") — 12-Part Composite Cel-Shaded Asset
 * Pivot: Bottom-Center (0, 0, 0). Width: 11.0m, Depth: 6.2m, Height: 6.8m.
 */
export function buildStorefrontAsset(params: {
  palette: StylePalette;
  grad3: THREE.DataTexture;
  grad4: THREE.DataTexture;
  inkLineMat: THREE.LineBasicMaterial;
  inkHullMat: THREE.MeshBasicMaterial;
  inkRegistry: THREE.Object3D[];
  disposableGeometries: THREE.BufferGeometry[];
  disposableMaterials: THREE.Material[];
  disposableTextures: THREE.Texture[];
}): THREE.Group {
  const {
    palette,
    grad3,
    grad4,
    inkLineMat,
    inkHullMat,
    inkRegistry,
    disposableGeometries,
    disposableMaterials,
    disposableTextures,
  } = params;

  const storefrontGroup = new THREE.Group();
  storefrontGroup.name = 'storefront-crack-and-sons';

  const brickTex = createLoFiBrickTexture(
    '#3B2D54',
    '#2A1F3D',
    palette.inkOutlineColor,
  );
  const windowGlassTex = createAnimeWindowReflectionTexture(
    '#161229',
    '#38BDF8',
    palette.inkOutlineColor,
  );
  const mainSignTex = createShopSignCanvasTexture(
    'CRACK & SONS',
    'NUTCRACKERS SINCE 1887',
    '#1E1633',
    '#FDE047',
    '#F43F5E',
    palette.inkOutlineColor,
  );
  const warnSignTex = createShopSignCanvasTexture(
    'GENTLEMEN:',
    'ENTER AT YOUR OWN RISK',
    '#7F1D1D',
    '#FEF2F2',
    '#FBBF24',
    palette.inkOutlineColor,
  );
  disposableTextures.push(brickTex, windowGlassTex, mainSignTex, warnSignTex);

  const matBrick = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: brickTex,
    gradientMap: grad3,
  });
  const matStoneTrim = new THREE.MeshToonMaterial({
    color: '#6D678E',
    gradientMap: grad3,
  });
  const matDarkWood = new THREE.MeshToonMaterial({
    color: '#2A1B2E',
    gradientMap: grad4,
  });
  const matAwningRed = new THREE.MeshToonMaterial({
    color: '#9F1239',
    gradientMap: grad3,
  });
  const matAwningCream = new THREE.MeshToonMaterial({
    color: '#F1ECF9',
    gradientMap: grad3,
  });
  const matWindowGlass = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: windowGlassTex,
    gradientMap: grad3,
  });
  const matGoldBrass = new THREE.MeshToonMaterial({
    color: '#FBBF24',
    gradientMap: grad4,
  });
  const matMainSign = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: mainSignTex,
    gradientMap: grad3,
  });
  const matWarnSign = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: warnSignTex,
    gradientMap: grad3,
  });
  const matNutcrackerRed = new THREE.MeshToonMaterial({
    color: '#E11D48',
    gradientMap: grad3,
  });
  const matShrubGreen = new THREE.MeshToonMaterial({
    color: '#10B981',
    gradientMap: grad3,
  });
  const matWarmLamp = new THREE.MeshBasicMaterial({
    color: '#FDE047',
  });

  disposableMaterials.push(
    matBrick,
    matStoneTrim,
    matDarkWood,
    matAwningRed,
    matAwningCream,
    matWindowGlass,
    matGoldBrass,
    matMainSign,
    matWarnSign,
    matNutcrackerRed,
    matShrubGreen,
    matWarmLamp,
  );

  // 1. Primary Masonry Building Hull (10.6m W × 5.8m H × 5.4m D)
  const hullGeo = new THREE.BoxGeometry(10.6, 5.8, 5.4);
  hullGeo.translate(0, 2.9, 0);
  disposableGeometries.push(hullGeo);
  const hullMesh = new THREE.Mesh(hullGeo, matBrick);
  hullMesh.castShadow = true;
  hullMesh.receiveShadow = true;
  storefrontGroup.add(hullMesh);
  attachComicInkOutline(hullMesh, storefrontGroup, inkLineMat, inkHullMat, 0.028, 15, inkRegistry);

  // 2. Stone Base Plinth & Upper Stepped Cornice Roofline
  const plinthGeo = new THREE.BoxGeometry(10.9, 0.55, 5.65);
  plinthGeo.translate(0, 0.275, 0);
  const corniceGeo = new THREE.BoxGeometry(11.1, 0.52, 5.85);
  corniceGeo.translate(0, 6.06, 0);
  const parapetGeo = new THREE.BoxGeometry(10.7, 0.45, 5.5);
  parapetGeo.translate(0, 6.52, 0);
  disposableGeometries.push(plinthGeo, corniceGeo, parapetGeo);

  const plinthMesh = new THREE.Mesh(plinthGeo, matStoneTrim);
  const corniceMesh = new THREE.Mesh(corniceGeo, matStoneTrim);
  const parapetMesh = new THREE.Mesh(parapetGeo, matDarkWood);
  storefrontGroup.add(plinthMesh, corniceMesh, parapetMesh);
  attachComicInkOutline(plinthMesh, storefrontGroup, inkLineMat, inkHullMat, 0.025, 15, inkRegistry);
  attachComicInkOutline(corniceMesh, storefrontGroup, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  attachComicInkOutline(parapetMesh, storefrontGroup, inkLineMat, inkHullMat, 0.025, 15, inkRegistry);

  // 3. Architectural Front Pilasters (Left, Divider, Right)
  const pilasterGeo = new THREE.BoxGeometry(0.55, 5.6, 0.42);
  pilasterGeo.translate(0, 2.8, 0);
  disposableGeometries.push(pilasterGeo);
  for (const px of [-5.1, 1.45, 5.1]) {
    const pilaster = new THREE.Mesh(pilasterGeo, matStoneTrim);
    pilaster.position.set(px, 0, 2.72);
    storefrontGroup.add(pilaster);
    attachComicInkOutline(pilaster, storefrontGroup, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  }

  // 4. Hero Display Window Frame & Glass (Left-Center Bay: X = -1.85m)
  const winFrameGeo = new THREE.BoxGeometry(5.6, 3.2, 0.36);
  winFrameGeo.translate(0, 2.35, 0);
  const winSillGeo = new THREE.BoxGeometry(5.9, 0.24, 0.58);
  winSillGeo.translate(0, 0.72, 0);
  const winGlassGeo = new THREE.BoxGeometry(5.2, 2.85, 0.12);
  winGlassGeo.translate(0, 2.35, 0);
  disposableGeometries.push(winFrameGeo, winSillGeo, winGlassGeo);

  const winFrame = new THREE.Mesh(winFrameGeo, matDarkWood);
  winFrame.position.set(-1.85, 0, 2.72);
  const winSill = new THREE.Mesh(winSillGeo, matStoneTrim);
  winSill.position.set(-1.85, 0, 2.78);
  const winGlass = new THREE.Mesh(winGlassGeo, matWindowGlass);
  winGlass.position.set(-1.85, 0, 2.86);
  storefrontGroup.add(winFrame, winSill, winGlass);
  attachComicInkOutline(winFrame, storefrontGroup, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  attachComicInkOutline(winSill, storefrontGroup, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  attachComicInkOutline(winGlass, storefrontGroup, inkLineMat, undefined, 0, 15, inkRegistry);

  // 5. Rows of Staring Nutcracker Dolls in the Display Window (Panel 1 & 9 detail)
  const nutBodyGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.75, 10);
  nutBodyGeo.translate(0, 1.35, 0);
  const nutHatGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.42, 10);
  nutHatGeo.translate(0, 1.92, 0);
  disposableGeometries.push(nutBodyGeo, nutHatGeo);
  for (let nx = -3.65; nx <= -0.05; nx += 0.9) {
    const nutBody = new THREE.Mesh(nutBodyGeo, matNutcrackerRed);
    nutBody.position.set(nx, 0, 2.94);
    const nutHat = new THREE.Mesh(nutHatGeo, matGoldBrass);
    nutHat.position.set(nx, 0, 2.94);
    storefrontGroup.add(nutBody, nutHat);
    attachComicInkOutline(nutBody, storefrontGroup, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
    attachComicInkOutline(nutHat, storefrontGroup, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  }

  // 6. Shop Entrance Door & Ornate Brass Handle (Right Bay: X = +3.3m)
  const doorFrameGeo = new THREE.BoxGeometry(2.4, 3.8, 0.38);
  doorFrameGeo.translate(0, 1.9, 0);
  const doorLeafGeo = new THREE.BoxGeometry(1.95, 3.45, 0.18);
  doorLeafGeo.translate(0, 1.75, 0);
  const handleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.42, 10);
  handleGeo.translate(0, 1.55, 0);
  const stepGeo = new THREE.BoxGeometry(2.6, 0.18, 0.75);
  stepGeo.translate(0, 0.09, 0);
  disposableGeometries.push(doorFrameGeo, doorLeafGeo, handleGeo, stepGeo);

  const doorFrame = new THREE.Mesh(doorFrameGeo, matDarkWood);
  doorFrame.position.set(3.3, 0, 2.72);
  const doorLeaf = new THREE.Mesh(doorLeafGeo, matAwningRed);
  doorLeaf.position.set(3.3, 0, 2.85);
  const doorHandle = new THREE.Mesh(handleGeo, matGoldBrass);
  doorHandle.position.set(2.55, 0, 3.0);
  const doorStep = new THREE.Mesh(stepGeo, matStoneTrim);
  doorStep.position.set(3.3, 0, 3.05);
  storefrontGroup.add(doorFrame, doorLeaf, doorHandle, doorStep);
  attachComicInkOutline(doorFrame, storefrontGroup, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  attachComicInkOutline(doorLeaf, storefrontGroup, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  attachComicInkOutline(doorHandle, storefrontGroup, inkLineMat, inkHullMat, 0.06, 15, inkRegistry);
  attachComicInkOutline(doorStep, storefrontGroup, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);

  // 7. Striped Storefront Awning Canopy (8 Alternating Stripes with Dark Ink Outlines)
  const stripeWidth = 0.74;
  const stripeGeo = new THREE.BoxGeometry(stripeWidth, 0.16, 1.65);
  disposableGeometries.push(stripeGeo);
  for (let i = 0; i < 8; i++) {
    const sx = -4.45 + i * stripeWidth;
    const stripeMesh = new THREE.Mesh(
      stripeGeo,
      i % 2 === 0 ? matAwningRed : matAwningCream,
    );
    stripeMesh.position.set(sx, 4.18, 3.35);
    stripeMesh.rotation.x = 0.38;
    storefrontGroup.add(stripeMesh);
    attachComicInkOutline(stripeMesh, storefrontGroup, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);
  }

  // 8. Hanging Shop Sign ("CRACK & SONS") + Small Warning Sign ("Gentlemen: Enter at Your Own Risk") + Pigeon Perch
  const bracketArmGeo = new THREE.BoxGeometry(0.14, 0.14, 1.85);
  const mainSignGeo = new THREE.BoxGeometry(4.8, 1.25, 0.22);
  const warnSignGeo = new THREE.BoxGeometry(3.9, 0.78, 0.18);
  const perchBarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8);
  perchBarGeo.rotateZ(Math.PI / 2);
  disposableGeometries.push(bracketArmGeo, mainSignGeo, warnSignGeo, perchBarGeo);

  const bracketArm = new THREE.Mesh(bracketArmGeo, matDarkWood);
  bracketArm.position.set(0, 5.35, 3.45);
  const mainSign = new THREE.Mesh(mainSignGeo, matMainSign);
  mainSign.position.set(0, 5.15, 3.85);
  const warnSign = new THREE.Mesh(warnSignGeo, matWarnSign);
  warnSign.position.set(0, 3.95, 3.85);
  const pigeonPerch = new THREE.Mesh(perchBarGeo, matGoldBrass);
  pigeonPerch.position.set(0, 5.9, 3.85);

  storefrontGroup.add(bracketArm, mainSign, warnSign, pigeonPerch);
  attachComicInkOutline(bracketArm, storefrontGroup, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  attachComicInkOutline(mainSign, storefrontGroup, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  attachComicInkOutline(warnSign, storefrontGroup, inkLineMat, inkHullMat, 0.045, 15, inkRegistry);
  attachComicInkOutline(pigeonPerch, storefrontGroup, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);

  // 9. Storefront Planter Boxes & Warm Gooseneck Lamps
  const planterBoxGeo = new THREE.BoxGeometry(2.2, 0.48, 0.65);
  planterBoxGeo.translate(0, 0.24, 0);
  const shrubGeo = new THREE.DodecahedronGeometry(0.38, 1);
  const lampShadeGeo = new THREE.ConeGeometry(0.24, 0.28, 10);
  disposableGeometries.push(planterBoxGeo, shrubGeo, lampShadeGeo);

  for (const px of [-3.4, -0.3]) {
    const planter = new THREE.Mesh(planterBoxGeo, matDarkWood);
    planter.position.set(px, 0, 3.12);
    storefrontGroup.add(planter);
    attachComicInkOutline(planter, storefrontGroup, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);

    for (const dx of [-0.55, 0, 0.55]) {
      const shrub = new THREE.Mesh(shrubGeo, matShrubGreen);
      shrub.position.set(px + dx, 0.62, 3.12);
      storefrontGroup.add(shrub);
      attachComicInkOutline(shrub, storefrontGroup, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
    }
  }

  for (const lx of [-4.6, 2.2, 4.4]) {
    const lampShade = new THREE.Mesh(lampShadeGeo, matWarmLamp);
    lampShade.position.set(lx, 4.65, 3.15);
    storefrontGroup.add(lampShade);
    attachComicInkOutline(lampShade, storefrontGroup, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);
  }

  return storefrontGroup;
}

/**
 * 2. BUILD ANIME / LO-FI CEL-SHADED CAR — 11-Part Composite Asset
 * Pivot: Bottom-Center (0, 0, 0) where tires touch the road surface.
 * Length (Z): 4.35m, Width (X): 1.92m, Height (Y): 1.42m.
 */
export function buildAnimeCarAsset(params: {
  palette: StylePalette;
  bodyColorHex?: string;
  accentColorHex?: string;
  plateCode?: string;
  grad3: THREE.DataTexture;
  grad4: THREE.DataTexture;
  inkLineMat: THREE.LineBasicMaterial;
  inkHullMat: THREE.MeshBasicMaterial;
  inkRegistry: THREE.Object3D[];
  disposableGeometries: THREE.BufferGeometry[];
  disposableMaterials: THREE.Material[];
  disposableTextures: THREE.Texture[];
}): THREE.Group {
  const {
    palette,
    bodyColorHex = '#4F46E5',
    accentColorHex = '#38BDF8',
    plateCode = 'NUT-1887',
    grad3,
    grad4,
    inkLineMat,
    inkHullMat,
    inkRegistry,
    disposableGeometries,
    disposableMaterials,
    disposableTextures,
  } = params;

  const carGroup = new THREE.Group();
  carGroup.name = `anime-lofi-car-${plateCode}`;

  const glassTex = createAnimeWindowReflectionTexture(
    '#18162B',
    '#38BDF8',
    palette.inkOutlineColor,
  );
  const plateTex = createLicensePlateTexture(plateCode, palette.inkOutlineColor);
  disposableTextures.push(glassTex, plateTex);

  const matBody = new THREE.MeshToonMaterial({
    color: bodyColorHex,
    gradientMap: grad3,
  });
  const matAccent = new THREE.MeshToonMaterial({
    color: accentColorHex,
    gradientMap: grad3,
  });
  const matGlass = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: glassTex,
    gradientMap: grad3,
  });
  const matTire = new THREE.MeshToonMaterial({
    color: '#171524',
    gradientMap: grad3,
  });
  const matRim = new THREE.MeshToonMaterial({
    color: '#E2D9F3',
    gradientMap: grad4,
  });
  const matBumper = new THREE.MeshToonMaterial({
    color: '#2B2D42',
    gradientMap: grad4,
  });
  const matHeadlight = new THREE.MeshBasicMaterial({
    color: '#FEF08A',
  });
  const matTaillight = new THREE.MeshBasicMaterial({
    color: '#F43F5E',
  });
  const matPlate = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: plateTex,
    gradientMap: grad3,
  });
  const matShadow = new THREE.MeshBasicMaterial({
    color: '#07050E',
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });

  disposableMaterials.push(
    matBody,
    matAccent,
    matGlass,
    matTire,
    matRim,
    matBumper,
    matHeadlight,
    matTaillight,
    matPlate,
    matShadow,
  );

  // 1. Contact Shadow Plane (Y = +0.015m)
  const shadowGeo = new THREE.PlaneGeometry(2.25, 4.65);
  shadowGeo.rotateX(-Math.PI / 2);
  shadowGeo.translate(0, 0.015, 0);
  disposableGeometries.push(shadowGeo);
  const shadowMesh = new THREE.Mesh(shadowGeo, matShadow);
  carGroup.add(shadowMesh);

  // 2. Lower Sculpted Chassis Body & Side Rocker Trim
  const lowerHullGeo = new THREE.BoxGeometry(1.88, 0.54, 4.24);
  lowerHullGeo.translate(0, 0.56, 0);
  const sideStripeGeo = new THREE.BoxGeometry(1.92, 0.14, 3.85);
  sideStripeGeo.translate(0, 0.44, 0);
  disposableGeometries.push(lowerHullGeo, sideStripeGeo);

  const lowerHull = new THREE.Mesh(lowerHullGeo, matBody);
  lowerHull.castShadow = true;
  lowerHull.receiveShadow = true;
  const sideStripe = new THREE.Mesh(sideStripeGeo, matAccent);
  carGroup.add(lowerHull, sideStripe);
  attachComicInkOutline(lowerHull, carGroup, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  attachComicInkOutline(sideStripe, carGroup, inkLineMat, undefined, 0, 15, inkRegistry);

  // 3. Tapered Cabin Greenhouse & Roof
  const cabinGeo = new THREE.BoxGeometry(1.62, 0.52, 2.15);
  cabinGeo.translate(0, 1.08, -0.15);
  const windshieldGeo = new THREE.BoxGeometry(1.52, 0.46, 0.12);
  const sideWinGeo = new THREE.BoxGeometry(1.66, 0.38, 1.75);
  sideWinGeo.translate(0, 1.08, -0.15);
  disposableGeometries.push(cabinGeo, windshieldGeo, sideWinGeo);

  const cabin = new THREE.Mesh(cabinGeo, matBody);
  cabin.castShadow = true;
  const sideWin = new THREE.Mesh(sideWinGeo, matGlass);

  const frontWindshield = new THREE.Mesh(windshieldGeo, matGlass);
  frontWindshield.position.set(0, 1.05, 0.92);
  frontWindshield.rotation.x = -0.42;

  const rearWindshield = new THREE.Mesh(windshieldGeo, matGlass);
  rearWindshield.position.set(0, 1.05, -1.22);
  rearWindshield.rotation.x = 0.42;

  carGroup.add(cabin, sideWin, frontWindshield, rearWindshield);
  attachComicInkOutline(cabin, carGroup, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  attachComicInkOutline(sideWin, carGroup, inkLineMat, undefined, 0, 15, inkRegistry);
  attachComicInkOutline(frontWindshield, carGroup, inkLineMat, undefined, 0, 15, inkRegistry);
  attachComicInkOutline(rearWindshield, carGroup, inkLineMat, undefined, 0, 15, inkRegistry);

  // 4. 4 Deep-Dish Alloy Wheels & Rubber Tires (Grounded at Y = 0)
  const tireGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 18);
  tireGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.3, 12);
  rimGeo.rotateZ(Math.PI / 2);
  disposableGeometries.push(tireGeo, rimGeo);

  const wheelPositions: Array<[number, number, number]> = [
    [-0.92, 0.36, 1.32],
    [0.92, 0.36, 1.32],
    [-0.92, 0.36, -1.32],
    [0.92, 0.36, -1.32],
  ];
  for (const [wx, wy, wz] of wheelPositions) {
    const tire = new THREE.Mesh(tireGeo, matTire);
    tire.position.set(wx, wy, wz);
    tire.castShadow = true;
    const rim = new THREE.Mesh(rimGeo, matRim);
    rim.position.set(wx, wy, wz);
    carGroup.add(tire, rim);
    attachComicInkOutline(tire, carGroup, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);
    attachComicInkOutline(rim, carGroup, inkLineMat, undefined, 0, 15, inkRegistry);
  }

  // 5. Front & Rear Bumpers, Headlights, Taillights & License Plates
  const bumperGeo = new THREE.BoxGeometry(1.96, 0.22, 0.28);
  const headlightGeo = new THREE.BoxGeometry(0.42, 0.18, 0.12);
  const taillightGeo = new THREE.BoxGeometry(1.76, 0.16, 0.1);
  const plateGeo = new THREE.BoxGeometry(0.52, 0.22, 0.06);
  const mirrorGeo = new THREE.BoxGeometry(0.24, 0.14, 0.16);
  disposableGeometries.push(
    bumperGeo,
    headlightGeo,
    taillightGeo,
    plateGeo,
    mirrorGeo,
  );

  const frontBumper = new THREE.Mesh(bumperGeo, matBumper);
  frontBumper.position.set(0, 0.36, 2.15);
  const rearBumper = new THREE.Mesh(bumperGeo, matBumper);
  rearBumper.position.set(0, 0.36, -2.15);
  carGroup.add(frontBumper, rearBumper);
  attachComicInkOutline(frontBumper, carGroup, inkLineMat, inkHullMat, 0.045, 15, inkRegistry);
  attachComicInkOutline(rearBumper, carGroup, inkLineMat, inkHullMat, 0.045, 15, inkRegistry);

  for (const side of [-1, 1]) {
    const hl = new THREE.Mesh(headlightGeo, matHeadlight);
    hl.position.set(side * 0.62, 0.64, 2.14);
    const mirror = new THREE.Mesh(mirrorGeo, matAccent);
    mirror.position.set(side * 1.02, 0.92, 0.65);
    carGroup.add(hl, mirror);
    attachComicInkOutline(hl, carGroup, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);
    attachComicInkOutline(mirror, carGroup, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);
  }

  const tailBar = new THREE.Mesh(taillightGeo, matTaillight);
  tailBar.position.set(0, 0.64, -2.14);
  const frontPlate = new THREE.Mesh(plateGeo, matPlate);
  frontPlate.position.set(0, 0.36, 2.3);
  const rearPlate = new THREE.Mesh(plateGeo, matPlate);
  rearPlate.position.set(0, 0.36, -2.3);

  carGroup.add(tailBar, frontPlate, rearPlate);
  attachComicInkOutline(tailBar, carGroup, inkLineMat, inkHullMat, 0.045, 15, inkRegistry);
  attachComicInkOutline(frontPlate, carGroup, inkLineMat, inkHullMat, 0.06, 15, inkRegistry);
  attachComicInkOutline(rearPlate, carGroup, inkLineMat, inkHullMat, 0.06, 15, inkRegistry);

  return carGroup;
}

/**
 * 3. BUILD CEL-SHADED ANIME / LO-FI STREET LAMP — 9-Part Composite Asset
 * Pivot: Bottom-Center (0, 0, 0). Total Height: 4.85m, Span Width: 1.65m.
 */
export function buildStreetLampAsset(params: {
  palette: StylePalette;
  grad3: THREE.DataTexture;
  grad4: THREE.DataTexture;
  inkLineMat: THREE.LineBasicMaterial;
  inkHullMat: THREE.MeshBasicMaterial;
  inkRegistry: THREE.Object3D[];
  disposableGeometries: THREE.BufferGeometry[];
  disposableMaterials: THREE.Material[];
}): THREE.Group {
  const {
    palette,
    grad3,
    grad4,
    inkLineMat,
    inkHullMat,
    inkRegistry,
    disposableGeometries,
    disposableMaterials,
  } = params;

  const lampGroup = new THREE.Group();
  lampGroup.name = 'anime-lofi-street-lamp';

  const matIron = new THREE.MeshToonMaterial({
    color: '#2A2E45',
    gradientMap: grad4,
  });
  const matTrim = new THREE.MeshToonMaterial({
    color: '#5E638A',
    gradientMap: grad3,
  });
  const matLanternGlow = new THREE.MeshBasicMaterial({
    color: palette.laneMarkingYellow,
  });
  const matHalo = new THREE.MeshBasicMaterial({
    color: palette.laneMarkingYellow,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  disposableMaterials.push(matIron, matTrim, matLanternGlow, matHalo);

  // 1. Octagonal Base Plinth & Fluted Collar (Y = 0 to 0.95m)
  const plinthGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.58, 8);
  plinthGeo.translate(0, 0.29, 0);
  const collarGeo = new THREE.CylinderGeometry(0.14, 0.24, 0.38, 8);
  collarGeo.translate(0, 0.77, 0);
  // 2. Main Tapered Column & Mid Torus Ring (Y = 0.95m to 4.15m)
  const poleGeo = new THREE.CylinderGeometry(0.085, 0.125, 3.25, 10);
  poleGeo.translate(0, 2.55, 0);
  const ringGeo = new THREE.TorusGeometry(0.14, 0.035, 8, 12);
  ringGeo.rotateX(Math.PI / 2);
  ringGeo.translate(0, 2.45, 0);
  // 3. Cross-Arm Bar & Center Finial Spire
  const crossArmGeo = new THREE.BoxGeometry(1.56, 0.1, 0.1);
  crossArmGeo.translate(0, 4.12, 0);
  const finialGeo = new THREE.ConeGeometry(0.12, 0.45, 8);
  finialGeo.translate(0, 4.42, 0);
  // 4. Dual Hexagonal Lantern Cages, Roof Caps & Ground Light Halo
  const lanternGlassGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.44, 6);
  const lanternRoofGeo = new THREE.ConeGeometry(0.28, 0.22, 6);
  const haloGeo = new THREE.CircleGeometry(0.62, 24);
  haloGeo.rotateX(-Math.PI / 2);
  haloGeo.translate(0, 0.018, 0);

  disposableGeometries.push(
    plinthGeo,
    collarGeo,
    poleGeo,
    ringGeo,
    crossArmGeo,
    finialGeo,
    lanternGlassGeo,
    lanternRoofGeo,
    haloGeo,
  );

  const plinth = new THREE.Mesh(plinthGeo, matIron);
  plinth.castShadow = true;
  const collar = new THREE.Mesh(collarGeo, matTrim);
  const pole = new THREE.Mesh(poleGeo, matIron);
  pole.castShadow = true;
  const midRing = new THREE.Mesh(ringGeo, matTrim);
  const crossArm = new THREE.Mesh(crossArmGeo, matIron);
  const finial = new THREE.Mesh(finialGeo, matTrim);
  const halo = new THREE.Mesh(haloGeo, matHalo);

  lampGroup.add(plinth, collar, pole, midRing, crossArm, finial, halo);
  attachComicInkOutline(plinth, lampGroup, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);
  attachComicInkOutline(collar, lampGroup, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);
  attachComicInkOutline(pole, lampGroup, inkLineMat, inkHullMat, 0.06, 15, inkRegistry);
  attachComicInkOutline(midRing, lampGroup, inkLineMat, undefined, 0, 15, inkRegistry);
  attachComicInkOutline(crossArm, lampGroup, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);
  attachComicInkOutline(finial, lampGroup, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);

  for (const side of [-1, 1]) {
    const lx = side * 0.68;
    const glass = new THREE.Mesh(lanternGlassGeo, matLanternGlow);
    glass.position.set(lx, 4.38, 0);
    const roof = new THREE.Mesh(lanternRoofGeo, matIron);
    roof.position.set(lx, 4.71, 0);
    lampGroup.add(glass, roof);
    attachComicInkOutline(glass, lampGroup, inkLineMat, inkHullMat, 0.06, 12, inkRegistry);
    attachComicInkOutline(roof, lampGroup, inkLineMat, inkHullMat, 0.05, 12, inkRegistry);
  }

  return lampGroup;
}
