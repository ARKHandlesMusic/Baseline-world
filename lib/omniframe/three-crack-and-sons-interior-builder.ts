import * as THREE from 'three';
import {
  DISPLAY_NUTCRACKER_SPECS,
  DustParticleSpec,
  HERO_NUTCRACKER_SPEC,
  INTERIOR_GIFT_BAG_SPECS,
  INTERIOR_GIFT_BOX_SPECS,
  INTERIOR_ORNAMENT_SPECS,
  INTERIOR_PRICE_TAG_SPECS,
  INTERIOR_SHELF_SPECS,
  INTERIOR_WRAPPED_PRESENT_SPECS,
  InteriorLightMoodId,
  NutcrackerDollSpec,
  PriceTagSpec,
  ShopDoorControlMode,
  StoreTvAdState,
  evaluateDustParticleAtFrame,
  evaluateHeroNutcrackerPoseAtFrame,
  evaluateShopDoorRigState,
  evaluateStoreTvAdStateAtFrame,
  generateDeterministicDustParticles,
} from './crack-and-sons-interior-manifest';
import {
  applyMainStreetStyleToSceneGraph,
  createMainStreetExteriorVistaTexture,
  drawMainStreetComicHatchAndBorderOverlay,
} from './main-street-style-engine';
import { buildThreeSceneCastDirector } from './characters/three-scene-cast-director';

export interface CrackAndSonsInteriorHandle {
  rootGroup: THREE.Group;
  inkLineObjects: THREE.Object3D[];
  updateForFrame: (params: {
    frame: number;
    fps: number;
    lightMood: InteriorLightMoodId;
    inkOutlinesEnabled: boolean;
    dustIntensity: number;
    wireframeMode: boolean;
    doorControlMode?: ShopDoorControlMode;
    manualDoorOpenProgress?: number;
  }) => void;
  dispose: () => void;
}

function createToonGradientTexture(steps: 3 | 4): THREE.DataTexture {
  const data =
    steps === 3
      ? new Uint8Array([75, 172, 255])
      : new Uint8Array([58, 128, 198, 255]);
  const texture = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function addInkOutline(
  mesh: THREE.Mesh,
  inkMaterial: THREE.LineBasicMaterial,
  inkLineObjects: THREE.Object3D[],
  thresholdAngle = 22,
): void {
  const edges = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
  const line = new THREE.LineSegments(edges, inkMaterial);
  mesh.add(line);
  inkLineObjects.push(line);
}

function tagInspectable(
  obj: THREE.Object3D,
  info: {
    id: string;
    label: string;
    category: string;
    target: [number, number, number];
    optimalDistance: number;
    cameraPosition?: [number, number, number];
  },
): void {
  obj.userData.inspectable = info;
}

/**
 * Procedural Walnut & Oak Herringbone / Plank Wooden Floor Texture
 */
function createWoodenFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#5C3A21';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankCols = 8;
    const plankRows = 32;
    const colW = 1024 / plankCols;
    const rowH = 1024 / plankRows;
    const tones = ['#6B4226', '#5A351D', '#784B2A', '#4E2D18', '#633B20'];

    for (let r = 0; r < plankRows; r++) {
      const offset = (r % 2) * (colW * 0.5);
      for (let c = -1; c <= plankCols; c++) {
        const x = c * colW + offset;
        const y = r * rowH;
        const tone = tones[(r * 3 + c * 5 + 100) % tones.length];
        ctx.fillStyle = tone;
        ctx.fillRect(x + 2, y + 1.5, colW - 4, rowH - 3);

        // Subtle wood grain streaks
        ctx.strokeStyle = 'rgba(30, 15, 6, 0.28)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + rowH * 0.35);
        ctx.lineTo(x + colW - 12, y + rowH * 0.42);
        ctx.moveTo(x + 18, y + rowH * 0.72);
        ctx.lineTo(x + colW - 8, y + rowH * 0.68);
        ctx.stroke();

        // Occasional wood knot
        if ((r * 7 + c * 11) % 9 === 0) {
          ctx.fillStyle = 'rgba(36, 18, 8, 0.45)';
          ctx.beginPath();
          ctx.ellipse(
            x + colW * 0.48,
            y + rowH * 0.5,
            8,
            4,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }

        // Plank joints
        ctx.strokeStyle = '#0A0812';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 1, y + 1, colW - 2, rowH - 2);
      }
    }
    drawMainStreetComicHatchAndBorderOverlay(ctx, 1024, 1024, {
      hatchCount: 36,
      borderWidth: 0,
      hatchAlpha: 0.35,
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural Victorian Persian / Medallion Shop Rug Texture
 */
function createVictorianRugTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Deep crimson base
    ctx.fillStyle = '#7F1D1D';
    ctx.fillRect(0, 0, 1024, 640);

    // Outer navy & gold borders
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 18;
    ctx.strokeRect(28, 28, 1024 - 56, 640 - 56);

    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 28;
    ctx.strokeRect(58, 58, 1024 - 116, 640 - 116);

    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 8;
    ctx.strokeRect(84, 84, 1024 - 168, 640 - 168);

    // Corner golden flourishes
    const corners: [number, number][] = [
      [130, 130],
      [894, 130],
      [130, 510],
      [894, 510],
    ];
    for (const [cx, cy] of corners) {
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#991B1B';
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center diamond medallion
    ctx.save();
    ctx.translate(512, 320);
    ctx.fillStyle = '#1E3A8A';
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, -165);
    ctx.lineTo(250, 0);
    ctx.lineTo(0, 165);
    ctx.lineTo(-250, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner gold star emblem
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const rOuter = i % 2 === 0 ? 95 : 46;
      const px = Math.cos(a) * rOuter;
      const py = Math.sin(a) * rOuter;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0A0812';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.fillStyle = '#7F1D1D';
    ctx.font = '900 28px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('C & S • 1887', 0, 0);
    ctx.restore();
    drawMainStreetComicHatchAndBorderOverlay(ctx, 1024, 640, {
      hatchCount: 24,
      borderWidth: 10,
      hatchAlpha: 0.32,
      addHalftoneCornerDots: true,
      halftoneColor: '#FACC15',
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural Wallpaper Texture (Heritage Burgundy & Gold Damask Stripes)
 */
function createHeritageWallpaperTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#4A151B';
    ctx.fillRect(0, 0, 512, 512);

    for (let x = 0; x < 512; x += 64) {
      ctx.fillStyle = '#5D1B24';
      ctx.fillRect(x + 8, 0, 28, 512);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
      ctx.fillRect(x + 42, 0, 4, 512);

      // Diamond motif along stripe
      for (let y = 32; y < 512; y += 64) {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
        ctx.beginPath();
        ctx.moveTo(x + 22, y - 10);
        ctx.lineTo(x + 32, y);
        ctx.lineTo(x + 22, y + 10);
        ctx.lineTo(x + 12, y);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Create a high-contrast readable sign/board/poster canvas texture.
 */
function createBoardSignTexture(params: {
  bgColor: string;
  borderColor: string;
  headerText: string;
  headerColor: string;
  lines: string[];
  footerText?: string;
  width?: number;
  height?: number;
}): THREE.CanvasTexture {
  const w = params.width ?? 512;
  const h = params.height ?? 320;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = params.bgColor;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = params.borderColor;
    ctx.lineWidth = 14;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    ctx.strokeStyle = '#0A0812';
    ctx.lineWidth = 5;
    ctx.strokeRect(24, 24, w - 48, h - 48);

    ctx.fillStyle = params.headerColor;
    ctx.font = '900 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(params.headerText, w / 2, 72);

    ctx.strokeStyle = params.borderColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(48, 92);
    ctx.lineTo(w - 48, 92);
    ctx.stroke();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '700 23px sans-serif';
    params.lines.forEach((line, idx) => {
      ctx.fillText(line, w / 2, 134 + idx * 42);
    });

    if (params.footerText) {
      ctx.fillStyle = params.headerColor;
      ctx.font = '900 24px sans-serif';
      ctx.fillText(params.footerText, w / 2, h - 42);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Draw the live 60fps 2D Animated Store Advertisement onto a TV Canvas!
 */
function render2DStoreAdvertisementCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adState: StoreTvAdState,
  frame: number,
): void {
  ctx.save();
  // Background radial comic burst
  const bgPalette =
    adState.sceneId === 'logo-chomp'
      ? ['#7F1D1D', '#B91C1C']
      : adState.sceneId === 'walnut-crush'
        ? ['#1E3A8A', '#1D4ED8']
        : ['#065F46', '#047857'];

  ctx.fillStyle = bgPalette[0];
  ctx.fillRect(0, 0, width, height);

  // Rotating sunburst rays
  ctx.save();
  ctx.translate(width * 0.34, height * 0.52);
  ctx.rotate(adState.starburstRotationRad);
  const rayCount = 16;
  for (let i = 0; i < rayCount; i++) {
    if (i % 2 === 0) continue;
    const a0 = (i * Math.PI * 2) / rayCount;
    const a1 = ((i + 1) * Math.PI * 2) / rayCount;
    ctx.fillStyle = bgPalette[1];
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, width, a0, a1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Top Header Ribbon
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(0, 0, width, 54);
  ctx.strokeStyle = '#0A0812';
  ctx.lineWidth = 5;
  ctx.strokeRect(2, 2, width - 4, 50);

  ctx.fillStyle = '#0A0812';
  ctx.font = '900 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(adState.bannerHeadline, width / 2, 36);

  // Left Animated 2D Cartoon Nutcracker Head with Chomping Jaw!
  ctx.save();
  ctx.translate(width * 0.26, height * 0.52);
  const bounceY = Math.sin(frame * 0.25) * 5;
  ctx.translate(0, bounceY);

  // Tall Shako Hat
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#0A0812';
  ctx.lineWidth = 5;
  ctx.fillRect(-48, -108, 96, 56);
  ctx.strokeRect(-48, -108, 96, 56);

  // Gold Hat Crown Trim & Plume
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(-52, -62, 104, 12);
  ctx.beginPath();
  ctx.arc(0, -114, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#EF4444';
  ctx.fill();
  ctx.stroke();

  // Wooden Face
  ctx.fillStyle = '#FDBA74';
  ctx.fillRect(-42, -50, 84, 58);
  ctx.strokeRect(-42, -50, 84, 58);

  // Staring Anime Eyes
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(side * 18, -28, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.arc(side * 18, -28, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(side * 16, -31, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rosy cheeks & Mustache
  ctx.fillStyle = '#F87171';
  ctx.beginPath();
  ctx.arc(-28, -12, 7, 0, Math.PI * 2);
  ctx.arc(28, -12, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.quadraticCurveTo(-24, -18, -44, -4);
  ctx.quadraticCurveTo(-20, -2, 0, -6);
  ctx.quadraticCurveTo(20, -2, 44, -4);
  ctx.quadraticCurveTo(24, -18, 0, -10);
  ctx.fill();

  // Animated Chomping Jaw & Teeth
  const jawDropPx = 6 + adState.jawOpenFraction * 26;
  ctx.fillStyle = '#450A0A';
  ctx.fillRect(-30, 6, 60, jawDropPx + 14);

  // Upper & lower white teeth
  ctx.fillStyle = '#FFFFFF';
  for (let t = -24; t <= 16; t += 10) {
    ctx.fillRect(t, 6, 8, 8);
    ctx.fillRect(t, 6 + jawDropPx, 8, 8);
  }

  // Lower jaw & white beard
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(-34, 14 + jawDropPx, 68, 22);
  ctx.strokeRect(-34, 14 + jawDropPx, 68, 22);

  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.moveTo(-26, 36 + jawDropPx);
  ctx.lineTo(26, 36 + jawDropPx);
  ctx.lineTo(14, 72 + jawDropPx);
  ctx.lineTo(-14, 72 + jawDropPx);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // If scene is walnut-crush, draw animated cracking walnut!
  if (adState.sceneId === 'walnut-crush') {
    const splitPx = adState.walnutSplitFraction * 28;
    ctx.fillStyle = '#92400E';
    ctx.strokeStyle = '#0A0812';
    ctx.lineWidth = 4;
    // Left walnut shell
    ctx.beginPath();
    ctx.arc(76 - splitPx, 10, 20, Math.PI * 0.5, Math.PI * 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right walnut shell
    ctx.beginPath();
    ctx.arc(76 + splitPx, 10, 20, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (adState.walnutSplitFraction > 0.15) {
      ctx.fillStyle = '#FDE047';
      ctx.font = '900 24px sans-serif';
      ctx.fillText('CRACK!!', 82, -26);
    }
  }
  ctx.restore();

  // Right Side Ad Copy & Starburst Price Badge
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(adState.subHeadline.slice(0, 26), width * 0.5, 105);
  if (adState.subHeadline.length > 26) {
    ctx.fillText(adState.subHeadline.slice(26), width * 0.5, 134);
  }

  // Animated Starburst Price Callout
  ctx.save();
  ctx.translate(width * 0.72, height * 0.64);
  const pulse = 1 + 0.08 * Math.sin(frame * 0.35);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = '#0A0812';
  ctx.lineWidth = 5;
  ctx.beginPath();
  const spikes = 14;
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? 115 : 88;
    const ang = (i * Math.PI) / spikes;
    const x = Math.cos(ang) * (rad * 1.15);
    const y = Math.sin(ang) * (rad * 0.52);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#991B1B';
  ctx.font = '900 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(adState.priceCallout, 0, 0);
  ctx.restore();

  // Bottom Scrolling Ticker Tape
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, height - 42, width, 42);
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, height - 42);
  ctx.lineTo(width, height - 42);
  ctx.stroke();

  const tickerMsg =
    '★ CRACK & SONS NUTCRACKERS SINCE 1887 ★ BAVARIAN HARDWOOD SOLDIERS ★ FREE HOLIDAY WRAPPING ★ GENTLEMEN: KEEP FINGERS CLEAR OF JAWS! ★ ';
  ctx.fillStyle = '#FDE047';
  ctx.font = '800 20px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(tickerMsg + tickerMsg, -adState.tickerOffsetPx, height - 15);

  // Subtle CRT/TV scanline overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let y = 0; y < height; y += 6) {
    ctx.fillRect(0, y, width, 2);
  }
  ctx.restore();
}

/**
 * Build a 100% Detailed Articulated 3D Nutcracker Doll (Hero or Display Regiment)
 */
function buildDetailedNutcrackerDoll(params: {
  spec: NutcrackerDollSpec;
  toon3: THREE.DataTexture;
  toon4: THREE.DataTexture;
  inkMaterial: THREE.LineBasicMaterial;
  inkLineObjects: THREE.Object3D[];
}): {
  group: THREE.Group;
  jawPivot: THREE.Group;
  leverPivot: THREE.Group;
  headGroup: THREE.Group;
  eyesGroup: THREE.Group;
} {
  const {spec, toon3, toon4, inkMaterial, inkLineObjects} = params;
  const group = new THREE.Group();
  group.name = spec.id;
  group.position.set(...spec.position);
  group.rotation.y = spec.rotationY;
  group.scale.setScalar(spec.scale);

  const tunicMat = new THREE.MeshToonMaterial({
    color: spec.tunicColor,
    gradientMap: toon4,
  });
  const trouserMat = new THREE.MeshToonMaterial({
    color: spec.trouserColor,
    gradientMap: toon3,
  });
  const goldMat = new THREE.MeshToonMaterial({
    color: spec.trimGoldColor,
    gradientMap: toon4,
  });
  const bootMat = new THREE.MeshToonMaterial({
    color: '#111827',
    gradientMap: toon4,
  });
  const skinMat = new THREE.MeshToonMaterial({
    color: '#FDBA74',
    gradientMap: toon3,
  });
  const whiteHairMat = new THREE.MeshToonMaterial({
    color: spec.beardStyle === 'curled-silver' ? '#E2E8F0' : '#FFFFFF',
    gradientMap: toon3,
  });
  const darkWoodMat = new THREE.MeshToonMaterial({
    color: '#3E2723',
    gradientMap: toon3,
  });
  const hatMat = new THREE.MeshToonMaterial({
    color: spec.hatColor,
    gradientMap: toon4,
  });
  const plumeMat = new THREE.MeshToonMaterial({
    color: spec.plumeColor,
    gradientMap: toon3,
  });

  // 1. Circular Wooden Plinth Base + Gold Rim
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.21, 0.05, 24),
    darkWoodMat,
  );
  plinth.position.y = 0.025;
  group.add(plinth);
  addInkOutline(plinth, inkMaterial, inkLineObjects);

  const plinthGoldRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.195, 0.012, 10, 24),
    goldMat,
  );
  plinthGoldRing.rotation.x = Math.PI / 2;
  plinthGoldRing.position.y = 0.05;
  group.add(plinthGoldRing);

  // 2. Cavalry Boots, Buckles, Heel Spurs & Pleated Trousers
  for (const side of [-1, 1]) {
    const legX = side * 0.072;
    // Boot foot
    const bootFoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.085, 0.06, 0.16),
      bootMat,
    );
    bootFoot.position.set(legX, 0.08, 0.025);
    group.add(bootFoot);
    addInkOutline(bootFoot, inkMaterial, inkLineObjects);

    // Boot buckle
    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.028, 0.015),
      goldMat,
    );
    buckle.position.set(legX, 0.095, 0.106);
    group.add(buckle);

    // Boot shaft
    const bootShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.044, 0.2, 16),
      bootMat,
    );
    bootShaft.position.set(legX, 0.19, 0);
    group.add(bootShaft);
    addInkOutline(bootShaft, inkMaterial, inkLineObjects);

    // Gold boot cuff tassel
    const bootCuff = new THREE.Mesh(
      new THREE.TorusGeometry(0.049, 0.008, 8, 16),
      goldMat,
    );
    bootCuff.rotation.x = Math.PI / 2;
    bootCuff.position.set(legX, 0.285, 0);
    group.add(bootCuff);

    // Upper trouser leg
    const thigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.046, 0.19, 16),
      trouserMat,
    );
    thigh.position.set(legX, 0.38, 0);
    group.add(thigh);
    addInkOutline(thigh, inkMaterial, inkLineObjects);

    // Gold seam stripe down trouser side
    const trouserStripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.18, 0.018),
      goldMat,
    );
    trouserStripe.position.set(legX + side * 0.048, 0.38, 0);
    group.add(trouserStripe);
  }

  // 3. Royal Hussar Tunic Torso, Belt, Gold Frogs & Buttons
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.36, 0.19),
    tunicMat,
  );
  torso.position.set(0, 0.64, 0);
  group.add(torso);
  addInkOutline(torso, inkMaterial, inkLineObjects);

  // Flared coattails
  const coattail = new THREE.Mesh(
    new THREE.BoxGeometry(0.29, 0.1, 0.2),
    tunicMat,
  );
  coattail.position.set(0, 0.45, 0);
  group.add(coattail);
  addInkOutline(coattail, inkMaterial, inkLineObjects);

  // Leather belt & ornate gold buckle
  const belt = new THREE.Mesh(
    new THREE.BoxGeometry(0.295, 0.045, 0.205),
    bootMat,
  );
  belt.position.set(0, 0.51, 0);
  group.add(belt);
  addInkOutline(belt, inkMaterial, inkLineObjects);

  const beltBuckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.075, 0.058, 0.02),
    goldMat,
  );
  beltBuckle.position.set(0, 0.51, 0.105);
  group.add(beltBuckle);
  addInkOutline(beltBuckle, inkMaterial, inkLineObjects);

  // 5 horizontal braided gold Hussar cord frogs + 10 brass buttons
  for (let row = 0; row < 5; row++) {
    const ry = 0.57 + row * 0.048;
    const frog = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.014, 0.014),
      goldMat,
    );
    frog.position.set(0, ry, 0.098);
    group.add(frog);

    for (const side of [-1, 1]) {
      const btn = new THREE.Mesh(
        new THREE.SphereGeometry(0.013, 10, 10),
        goldMat,
      );
      btn.position.set(side * 0.088, ry, 0.102);
      group.add(btn);
    }
  }

  // Diagonal gold sash for Hero & Royal dolls
  if (spec.isHero || spec.hatStyle === 'royal-crown') {
    const sash = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.36, 0.202),
      goldMat,
    );
    sash.position.set(0, 0.65, 0);
    sash.rotation.z = 0.42;
    group.add(sash);
  }

  // 4. Fringed Gold Epaulettes, Articulated Arms, White Gloves & Weapons
  for (const side of [-1, 1]) {
    const shoulderX = side * 0.175;
    const epaulette = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.06, 0.032, 14),
      goldMat,
    );
    epaulette.position.set(shoulderX, 0.81, 0);
    epaulette.rotation.z = side * -0.2;
    group.add(epaulette);
    addInkOutline(epaulette, inkMaterial, inkLineObjects);

    // Epaulette fringes
    for (let f = -2; f <= 2; f++) {
      const fringe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 0.045, 6),
        goldMat,
      );
      fringe.position.set(shoulderX + side * 0.042, 0.78, f * 0.016);
      group.add(fringe);
    }

    // Arm sleeve
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.038, 0.27, 14),
      tunicMat,
    );
    arm.position.set(shoulderX, 0.66, 0.01);
    group.add(arm);
    addInkOutline(arm, inkMaterial, inkLineObjects);

    // Gold cuff
    const cuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.043, 0.043, 0.04, 14),
      goldMat,
    );
    cuff.position.set(shoulderX, 0.53, 0.01);
    group.add(cuff);

    // White gloved hand
    const glove = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 12, 12),
      whiteHairMat,
    );
    glove.position.set(shoulderX, 0.49, 0.02);
    group.add(glove);
    addInkOutline(glove, inkMaterial, inkLineObjects);
  }

  // Cavalry Saber at left hip
  if (spec.hasSaber) {
    const saberGroup = new THREE.Group();
    saberGroup.position.set(-0.185, 0.48, 0.04);
    saberGroup.rotation.x = 0.35;
    const hilt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.09, 10),
      goldMat,
    );
    hilt.position.y = 0.045;
    saberGroup.add(hilt);
    const guard = new THREE.Mesh(
      new THREE.TorusGeometry(0.032, 0.007, 8, 12, Math.PI),
      goldMat,
    );
    guard.position.set(0, 0.04, 0.015);
    saberGroup.add(guard);
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.32, 0.026),
      new THREE.MeshToonMaterial({color: '#E2E8F0', gradientMap: toon4}),
    );
    blade.position.y = -0.16;
    saberGroup.add(blade);
    addInkOutline(blade, inkMaterial, inkLineObjects);
    group.add(saberGroup);
  }

  // Royal Halberd / Scepter in right hand
  if (spec.hasHalberd) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 1.15, 10),
      darkWoodMat,
    );
    pole.position.set(0.185, 0.62, 0.06);
    group.add(pole);
    addInkOutline(pole, inkMaterial, inkLineObjects);

    const spearTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.032, 0.14, 8),
      goldMat,
    );
    spearTip.position.set(0.185, 1.24, 0.06);
    group.add(spearTip);
    addInkOutline(spearTip, inkMaterial, inkLineObjects);
  }

  // 5. Back Walnut-Cracking Wooden Lever (__leverPivot)
  const leverPivot = new THREE.Group();
  leverPivot.position.set(0, 0.72, -0.095);
  const leverArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.038, 0.28, 0.038),
    darkWoodMat,
  );
  leverArm.position.set(0, -0.12, -0.05);
  leverArm.rotation.x = 0.35;
  leverPivot.add(leverArm);
  addInkOutline(leverArm, inkMaterial, inkLineObjects);

  const leverBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 10, 10),
    goldMat,
  );
  leverBall.position.set(0, -0.25, -0.095);
  leverPivot.add(leverBall);
  group.add(leverPivot);

  // 6. Sculpted Head, Painted Anime/Toy Eyes, Mustache & Articulated Jaw (__jawPivot)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.94, 0);
  group.add(headGroup);

  const cranium = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115, 0.112, 0.21, 20),
    skinMat,
  );
  cranium.position.y = 0.04;
  headGroup.add(cranium);
  addInkOutline(cranium, inkMaterial, inkLineObjects);

  // Sculpted wooden nose
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.022, 0.065, 8),
    skinMat,
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.045, 0.125);
  headGroup.add(nose);
  addInkOutline(nose, inkMaterial, inkLineObjects);

  // Rosy painted cheeks
  const cheekMat = new THREE.MeshToonMaterial({
    color: '#F87171',
    gradientMap: toon3,
  });
  for (const side of [-1, 1]) {
    const cheek = new THREE.Mesh(
      new THREE.SphereGeometry(0.024, 10, 10),
      cheekMat,
    );
    cheek.scale.set(1.2, 0.9, 0.4);
    cheek.position.set(side * 0.068, 0.02, 0.098);
    headGroup.add(cheek);
  }

  // Expressive Staring Eyes Group (with sclera, colored iris, pupil & white catchlights)
  const eyesGroup = new THREE.Group();
  headGroup.add(eyesGroup);
  const scleraMat = new THREE.MeshBasicMaterial({color: '#FFFFFF'});
  const irisMat = new THREE.MeshBasicMaterial({color: spec.eyeColor});
  const pupilMat = new THREE.MeshBasicMaterial({color: '#090D16'});

  for (const side of [-1, 1]) {
    const ex = side * 0.046;
    const ey = 0.068;
    const ez = 0.106;

    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(0.023, 12, 12),
      scleraMat,
    );
    sclera.scale.set(1.0, 1.15, 0.45);
    sclera.position.set(ex, ey, ez);
    eyesGroup.add(sclera);

    const iris = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 10, 10),
      irisMat,
    );
    iris.scale.set(1.0, 1.1, 0.5);
    iris.position.set(ex, ey, ez + 0.006);
    eyesGroup.add(iris);

    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.009, 8, 8),
      pupilMat,
    );
    pupil.scale.set(1.0, 1.0, 0.5);
    pupil.position.set(ex, ey, ez + 0.01);
    eyesGroup.add(pupil);

    const catchlight = new THREE.Mesh(
      new THREE.SphereGeometry(0.0045, 6, 6),
      scleraMat,
    );
    catchlight.position.set(ex - 0.005, ey + 0.006, ez + 0.014);
    eyesGroup.add(catchlight);

    // Bold eyebrow
    const brow = new THREE.Mesh(
      new THREE.BoxGeometry(0.044, 0.012, 0.014),
      bootMat,
    );
    brow.position.set(ex, ey + 0.032, ez + 0.004);
    brow.rotation.z = side * -0.18;
    headGroup.add(brow);
  }

  // Twin-curled Bavarian Mustache
  for (const side of [-1, 1]) {
    const stache = new THREE.Mesh(
      new THREE.ConeGeometry(0.022, 0.085, 10),
      bootMat,
    );
    stache.rotation.z = side * (Math.PI / 2 - 0.25);
    stache.position.set(side * 0.045, 0.005, 0.118);
    headGroup.add(stache);
    addInkOutline(stache, inkMaterial, inkLineObjects);
  }

  // Dark mouth recess + upper row of individual painted teeth
  const mouthCavity = new THREE.Mesh(
    new THREE.BoxGeometry(0.095, 0.055, 0.04),
    new THREE.MeshBasicMaterial({color: '#450A0A'}),
  );
  mouthCavity.position.set(0, -0.028, 0.095);
  headGroup.add(mouthCavity);

  for (let t = -2; t <= 2; t++) {
    const upperTooth = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.016, 0.015),
      whiteHairMat,
    );
    upperTooth.position.set(t * 0.018, -0.008, 0.112);
    headGroup.add(upperTooth);
  }

  // Side hair curls
  for (const side of [-1, 1]) {
    const hairRoll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.16, 12),
      whiteHairMat,
    );
    hairRoll.position.set(side * 0.11, 0.035, -0.01);
    headGroup.add(hairRoll);
    addInkOutline(hairRoll, inkMaterial, inkLineObjects);
  }

  // Articulated Lower Jaw + Lower Teeth + Flowing Beard (__jawPivot)
  const jawPivot = new THREE.Group();
  jawPivot.position.set(0, -0.032, 0.085);
  headGroup.add(jawPivot);

  const lowerJawBlock = new THREE.Mesh(
    new THREE.BoxGeometry(0.086, 0.042, 0.055),
    skinMat,
  );
  lowerJawBlock.position.set(0, -0.02, 0.015);
  jawPivot.add(lowerJawBlock);
  addInkOutline(lowerJawBlock, inkMaterial, inkLineObjects);

  for (let t = -2; t <= 2; t++) {
    const lowerTooth = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.016, 0.015),
      whiteHairMat,
    );
    lowerTooth.position.set(t * 0.018, 0.005, 0.026);
    jawPivot.add(lowerTooth);
  }

  const beard = new THREE.Mesh(
    new THREE.ConeGeometry(0.062, 0.18, 12),
    whiteHairMat,
  );
  beard.rotation.x = Math.PI;
  beard.position.set(0, -0.11, 0.018);
  jawPivot.add(beard);
  addInkOutline(beard, inkMaterial, inkLineObjects);

  // 7. Royal Crown / Shako / Bearskin Busby Headgear
  const hatBaseY = 0.145;
  if (spec.hatStyle === 'royal-crown') {
    const crownBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.128, 0.118, 0.09, 20),
      goldMat,
    );
    crownBase.position.y = hatBaseY + 0.045;
    headGroup.add(crownBase);
    addInkOutline(crownBase, inkMaterial, inkLineObjects);

    const velvetCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.112, 16, 12),
      tunicMat,
    );
    velvetCap.position.y = hatBaseY + 0.075;
    headGroup.add(velvetCap);

    // 8 crown spires + ruby/emerald jewels
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI * 2) / 8;
      const sx = Math.cos(ang) * 0.118;
      const sz = Math.sin(ang) * 0.118;
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(0.022, 0.065, 8),
        goldMat,
      );
      spire.position.set(sx, hatBaseY + 0.11, sz);
      headGroup.add(spire);

      const jewel = new THREE.Mesh(
        new THREE.SphereGeometry(0.013, 8, 8),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? '#EF4444' : '#38BDF8',
        }),
      );
      jewel.position.set(sx * 1.05, hatBaseY + 0.045, sz * 1.05);
      headGroup.add(jewel);
    }
  } else if (spec.hatStyle === 'bearskin-busby') {
    const busby = new THREE.Mesh(
      new THREE.CylinderGeometry(0.132, 0.122, 0.26, 20),
      hatMat,
    );
    busby.position.y = hatBaseY + 0.13;
    headGroup.add(busby);
    addInkOutline(busby, inkMaterial, inkLineObjects);

    const badge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.015, 12),
      goldMat,
    );
    badge.rotation.x = Math.PI / 2;
    badge.position.set(0, hatBaseY + 0.11, 0.128);
    headGroup.add(badge);

    const plume = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.026, 0.09, 8, 12),
      plumeMat,
    );
    plume.position.set(0.12, hatBaseY + 0.21, 0.02);
    headGroup.add(plume);
  } else {
    // Tall Shako / Tricorn / Helmet
    const shako = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.116, 0.21, 20),
      hatMat,
    );
    shako.position.y = hatBaseY + 0.105;
    headGroup.add(shako);
    addInkOutline(shako, inkMaterial, inkLineObjects);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.018, 0.08),
      bootMat,
    );
    visor.position.set(0, hatBaseY + 0.01, 0.095);
    visor.rotation.x = 0.22;
    headGroup.add(visor);

    const topBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.128, 0.012, 8, 20),
      goldMat,
    );
    topBand.rotation.x = Math.PI / 2;
    topBand.position.y = hatBaseY + 0.2;
    headGroup.add(topBand);

    const plume = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 12, 12),
      plumeMat,
    );
    plume.scale.set(0.85, 1.75, 0.85);
    plume.position.set(0, hatBaseY + 0.265, 0.08);
    headGroup.add(plume);
    addInkOutline(plume, inkMaterial, inkLineObjects);
  }

  tagInspectable(group, {
    id: spec.id,
    label: `${spec.name} (${spec.priceLabel})`,
    category: spec.isHero
      ? 'Hero Nutcracker Masterpiece'
      : 'Nutcracker Display Regiment',
    target: [
      spec.position[0],
      spec.position[1] + 0.45 * spec.scale,
      spec.position[2],
    ],
    optimalDistance: spec.isHero ? 1.8 : 1.5,
    cameraPosition: spec.isHero
      ? [0.32, 1.55, 0.92]
      : [
          spec.position[0] * 0.45,
          spec.position[1] + 0.55,
          spec.position[2] + 1.15,
        ],
  });

  return {
    group,
    jawPivot,
    leverPivot,
    headGroup,
    eyesGroup,
  };
}

/**
 * Build the complete Crack & Sons Shop Interior Scene
 */
export function buildCrackAndSonsInteriorScene(): CrackAndSonsInteriorHandle {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'CrackAndSonsShopInteriorRoot';

  const inkLineObjects: THREE.Object3D[] = [];
  const disposableTextures: THREE.Texture[] = [];

  const toon3 = createToonGradientTexture(3);
  const toon4 = createToonGradientTexture(4);
  disposableTextures.push(toon3, toon4);

  const inkMaterial = new THREE.LineBasicMaterial({
    color: '#0A0812',
    transparent: true,
    opacity: 0.92,
  });

  // Materials
  const mahoganyMat = new THREE.MeshToonMaterial({
    color: '#3B1E10',
    gradientMap: toon4,
  });
  const warmOakMat = new THREE.MeshToonMaterial({
    color: '#784421',
    gradientMap: toon3,
  });
  const darkWalnutMat = new THREE.MeshToonMaterial({
    color: '#27130A',
    gradientMap: toon4,
  });
  const brassMat = new THREE.MeshToonMaterial({
    color: '#FACC15',
    gradientMap: toon4,
  });
  const crimsonVelvetMat = new THREE.MeshToonMaterial({
    color: '#991B1B',
    gradientMap: toon3,
  });
  const pineGreenMat = new THREE.MeshToonMaterial({
    color: '#14532D',
    gradientMap: toon3,
  });
  const creamPlasterMat = new THREE.MeshToonMaterial({
    color: '#F5E6D3',
    gradientMap: toon3,
  });

  const floorTex = createWoodenFloorTexture();
  const rugTex = createVictorianRugTexture();
  const wallpaperTex = createHeritageWallpaperTexture();
  disposableTextures.push(floorTex, rugTex, wallpaperTex);

  // ==========================================================================
  // 1. INTERIOR ROOM SHELL (1) + WOODEN FLOOR (1) + 4 WALL SECTIONS + CEILING (1)
  // ==========================================================================
  const architectureGroup = new THREE.Group();
  architectureGroup.name = 'InteriorArchitectureShell';
  rootGroup.add(architectureGroup);

  // Wooden Floor (8.8m × 6.8m)
  const floorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(8.8, 0.14, 6.8),
    new THREE.MeshToonMaterial({
      map: floorTex,
      gradientMap: toon3,
    }),
  );
  floorMesh.position.set(0, -0.07, 0);
  architectureGroup.add(floorMesh);
  addInkOutline(floorMesh, inkMaterial, inkLineObjects);

  // Ornate Victorian Runner Rug (1)
  const rugGroup = new THREE.Group();
  rugGroup.position.set(0, 0.012, 0.15);
  const rugMesh = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.018, 2.5),
    new THREE.MeshToonMaterial({
      map: rugTex,
      gradientMap: toon3,
    }),
  );
  rugGroup.add(rugMesh);
  addInkOutline(rugMesh, inkMaterial, inkLineObjects);

  // Rug golden fringe tassels along left/right edges
  for (let z = -1.18; z <= 1.18; z += 0.12) {
    for (const side of [-1, 1]) {
      const tassel = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.012, 0.04),
        brassMat,
      );
      tassel.position.set(side * 1.94, 0, z);
      rugGroup.add(tassel);
    }
  }
  tagInspectable(rugGroup, {
    id: 'interior-rug-01',
    label: 'Victorian Crimson & Gold Medallion Woven Shop Rug with Fringe',
    category: 'Shop Floor & Rug',
    target: [0, 0.05, 0.15],
    optimalDistance: 3.4,
    cameraPosition: [0, 2.15, 2.25],
  });
  architectureGroup.add(rugGroup);

  const wallPaperMat = new THREE.MeshToonMaterial({
    map: wallpaperTex,
    gradientMap: toon3,
  });

  // Wall Section 1: West Display Wall (X = -4.35)
  const westWallGroup = new THREE.Group();
  const westWallUpper = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 4.2, 6.8),
    wallPaperMat,
  );
  westWallUpper.position.set(-4.35, 2.1, 0);
  westWallGroup.add(westWallUpper);
  addInkOutline(westWallUpper, inkMaterial, inkLineObjects);

  const westWainscot = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 1.05, 6.8),
    mahoganyMat,
  );
  westWainscot.position.set(-4.32, 0.525, 0);
  westWallGroup.add(westWainscot);
  addInkOutline(westWainscot, inkMaterial, inkLineObjects);
  architectureGroup.add(westWallGroup);

  // Wall Section 2: North Back Heritage Wall (Z = -3.35)
  const northWallGroup = new THREE.Group();
  const northWallUpper = new THREE.Mesh(
    new THREE.BoxGeometry(8.8, 4.2, 0.16),
    wallPaperMat,
  );
  northWallUpper.position.set(0, 2.1, -3.35);
  northWallGroup.add(northWallUpper);
  addInkOutline(northWallUpper, inkMaterial, inkLineObjects);

  const northWainscot = new THREE.Mesh(
    new THREE.BoxGeometry(8.8, 1.15, 0.22),
    mahoganyMat,
  );
  northWainscot.position.set(0, 0.575, -3.32);
  northWallGroup.add(northWainscot);
  addInkOutline(northWainscot, inkMaterial, inkLineObjects);

  // Heritage Crest Sign on North Back Wall
  const crestTex = createBoardSignTexture({
    bgColor: '#27130A',
    borderColor: '#FACC15',
    headerText: 'CRACK & SONS • EST. 1887',
    headerColor: '#FDE047',
    lines: [
      'PURVEYORS OF FINE BAVARIAN NUTCRACKERS',
      'HAND-CARVED HARDWOOD SOLDIERS & KINGS',
    ],
    footerText: '★ MAIN STREET FLAGSHIP BOUTIQUE ★',
    width: 640,
    height: 240,
  });
  disposableTextures.push(crestTex);
  const crestBoard = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.92, 0.08),
    new THREE.MeshToonMaterial({map: crestTex, gradientMap: toon3}),
  );
  crestBoard.position.set(0, 3.05, -3.22);
  northWallGroup.add(crestBoard);
  addInkOutline(crestBoard, inkMaterial, inkLineObjects);
  architectureGroup.add(northWallGroup);

  // Wall Section 3: East Gallery & TV Wall (X = +4.35)
  const eastWallGroup = new THREE.Group();
  const eastWallUpper = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 4.2, 6.8),
    wallPaperMat,
  );
  eastWallUpper.position.set(4.35, 2.1, 0);
  eastWallGroup.add(eastWallUpper);
  addInkOutline(eastWallUpper, inkMaterial, inkLineObjects);

  const eastWainscot = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 1.05, 6.8),
    mahoganyMat,
  );
  eastWainscot.position.set(4.32, 0.525, 0);
  eastWallGroup.add(eastWainscot);
  addInkOutline(eastWainscot, inkMaterial, inkLineObjects);
  architectureGroup.add(eastWallGroup);

  // Wall Section 4: South Front Bay Window & Rigged Hinged Entrance Door Wall (Z = +3.3)
  const southWallGroup = new THREE.Group();
  // Left Bay Window Frame & Stepped Showcase Riser (X = -2.8 to -0.3)
  const bayWindowRiser1 = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.65, 0.65),
    mahoganyMat,
  );
  bayWindowRiser1.position.set(-1.45, 0.325, 2.85);
  southWallGroup.add(bayWindowRiser1);
  addInkOutline(bayWindowRiser1, inkMaterial, inkLineObjects);

  const bayWindowVelvetTop = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.22, 0.45),
    crimsonVelvetMat,
  );
  bayWindowVelvetTop.position.set(-1.45, 0.76, 2.82);
  southWallGroup.add(bayWindowVelvetTop);
  addInkOutline(bayWindowVelvetTop, inkMaterial, inkLineObjects);

  // Center Commander Podium on Bay Window Riser (y = 0.87m to 1.02m) so Commander #13 sits flush
  const bayWindowCenterPodium = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.15, 0.42),
    darkWalnutMat,
  );
  bayWindowCenterPodium.position.set(-1.45, 0.945, 2.75);
  southWallGroup.add(bayWindowCenterPodium);
  addInkOutline(bayWindowCenterPodium, inkMaterial, inkLineObjects);

  // ==========================================================================
  // RIGGED SHOP ENTRANCE DOOR + ARTICULATED TURNING BRASS HANDLE & LATCH RIG
  // ==========================================================================
  const entranceDoorGroup = new THREE.Group();
  entranceDoorGroup.name = 'RiggedShopEntranceDoorGroup';
  entranceDoorGroup.position.set(1.55, 0, 3.22);

  // 1. Exterior Main Street Vestibule & Sidewalk Vista behind the doorway (visible when door opens!)
  const exteriorVestibuleGroup = new THREE.Group();
  exteriorVestibuleGroup.position.set(0, 0, 0.45);
  const exteriorSidewalk = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.12, 1.15),
    new THREE.MeshToonMaterial({color: '#64748B', gradientMap: toon3}),
  );
  exteriorSidewalk.position.set(0, -0.05, 0.15);
  exteriorVestibuleGroup.add(exteriorSidewalk);

  const brassThreshold = new THREE.Mesh(
    new THREE.BoxGeometry(1.16, 0.035, 0.18),
    brassMat,
  );
  brassThreshold.position.set(0, 0.018, -0.45);
  exteriorVestibuleGroup.add(brassThreshold);
  addInkOutline(brassThreshold, inkMaterial, inkLineObjects);

  // Exterior Evening Sky & Across-the-Street Main Street Shop Backdrop Panel
  const streetBackdropTex =
    createMainStreetExteriorVistaTexture('twilight-street');
  disposableTextures.push(streetBackdropTex);
  const streetBackdropMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.95, 2.75, 0.06),
    new THREE.MeshBasicMaterial({map: streetBackdropTex}),
  );
  streetBackdropMesh.position.set(0, 1.38, 0.58);
  exteriorVestibuleGroup.add(streetBackdropMesh);

  // Warm Exterior Streetlamp Globe visible outside doorway
  const exteriorLampPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.042, 2.25, 10),
    darkWalnutMat,
  );
  exteriorLampPost.position.set(-0.62, 1.12, 0.28);
  exteriorVestibuleGroup.add(exteriorLampPost);
  const exteriorLampGlobe = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshBasicMaterial({color: '#FEF08A'}),
  );
  exteriorLampGlobe.position.set(-0.62, 2.28, 0.28);
  exteriorVestibuleGroup.add(exteriorLampGlobe);
  entranceDoorGroup.add(exteriorVestibuleGroup);

  // 2. Fixed Heavy Walnut Door Frame Jambs & Transom Header (with open central doorway!)
  const leftDoorJamb = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 2.58, 0.2),
    darkWalnutMat,
  );
  leftDoorJamb.position.set(-0.59, 1.29, 0);
  entranceDoorGroup.add(leftDoorJamb);
  addInkOutline(leftDoorJamb, inkMaterial, inkLineObjects);

  const rightDoorJamb = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 2.58, 0.2),
    darkWalnutMat,
  );
  rightDoorJamb.position.set(0.59, 1.29, 0);
  entranceDoorGroup.add(rightDoorJamb);
  addInkOutline(rightDoorJamb, inkMaterial, inkLineObjects);

  const topDoorLintel = new THREE.Mesh(
    new THREE.BoxGeometry(1.36, 0.16, 0.22),
    darkWalnutMat,
  );
  topDoorLintel.position.set(0, 2.5, 0);
  entranceDoorGroup.add(topDoorLintel);
  addInkOutline(topDoorLintel, inkMaterial, inkLineObjects);

  // Brass Strike Plate & Mortise Pocket on the Left Door Jamb (x = -0.53, y = 1.05)
  const strikePlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, 0.22, 0.095),
    brassMat,
  );
  strikePlate.position.set(-0.525, 1.05, -0.02);
  entranceDoorGroup.add(strikePlate);
  addInkOutline(strikePlate, inkMaterial, inkLineObjects);

  const mortisePocketHole = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.08, 0.042),
    new THREE.MeshBasicMaterial({color: '#090D16'}),
  );
  mortisePocketHole.position.set(-0.522, 1.05, -0.02);
  entranceDoorGroup.add(mortisePocketHole);

  // 3 Fixed Brass Hinge Knuckles along the Right Door Jamb (x = +0.53, z = -0.02)
  const hingeHeights = [0.38, 1.18, 1.98];
  for (const hy of hingeHeights) {
    const hingeBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.13, 12),
      brassMat,
    );
    hingeBarrel.position.set(0.53, hy, -0.02);
    entranceDoorGroup.add(hingeBarrel);
    addInkOutline(hingeBarrel, inkMaterial, inkLineObjects);

    for (const finialEnd of [-1, 1]) {
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.024, 8, 8),
        brassMat,
      );
      tip.position.set(0.53, hy + finialEnd * 0.072, -0.02);
      entranceDoorGroup.add(tip);
    }
  }

  // 3. HINGED DOOR LEAF PIVOT GROUP (Origin at exact Right Hinge Axis: x = +0.53, y = 0, z = -0.02)
  const doorHingePivot = new THREE.Group();
  doorHingePivot.name = 'ShopDoorHingePivot';
  doorHingePivot.position.set(0.53, 0, -0.02);
  entranceDoorGroup.add(doorHingePivot);

  // Door Leaf Stile & Rail Construction (centered at local x = -0.53 so latch edge is at x = -1.06)
  // Left Latch Stile
  const latchStile = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 2.38, 0.09),
    mahoganyMat,
  );
  latchStile.position.set(-0.97, 1.19, 0);
  doorHingePivot.add(latchStile);
  addInkOutline(latchStile, inkMaterial, inkLineObjects);

  // Right Hinge Stile
  const hingeStile = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 2.38, 0.09),
    mahoganyMat,
  );
  hingeStile.position.set(-0.09, 1.19, 0);
  doorHingePivot.add(hingeStile);
  addInkOutline(hingeStile, inkMaterial, inkLineObjects);

  // Lower Carved Mahogany Panel & Lock Rail (y = 0 to 1.08m)
  const lowerDoorPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 1.06, 0.085),
    mahoganyMat,
  );
  lowerDoorPanel.position.set(-0.53, 0.53, 0);
  doorHingePivot.add(lowerDoorPanel);
  addInkOutline(lowerDoorPanel, inkMaterial, inkLineObjects);

  // Raised Walnut Bevel Moldings on Lower Door Panel
  const raisedMolding = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.64, 0.105),
    darkWalnutMat,
  );
  raisedMolding.position.set(-0.53, 0.58, 0);
  doorHingePivot.add(raisedMolding);
  addInkOutline(raisedMolding, inkMaterial, inkLineObjects);

  // Polished Brass Bottom Kickplate
  const brassKickplate = new THREE.Mesh(
    new THREE.BoxGeometry(0.98, 0.18, 0.1),
    brassMat,
  );
  brassKickplate.position.set(-0.53, 0.11, 0);
  doorHingePivot.add(brassKickplate);
  addInkOutline(brassKickplate, inkMaterial, inkLineObjects);

  // Top Door Rail
  const topDoorRail = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.24, 0.09),
    mahoganyMat,
  );
  topDoorRail.position.set(-0.53, 2.26, 0);
  doorHingePivot.add(topDoorRail);
  addInkOutline(topDoorRail, inkMaterial, inkLineObjects);

  // Glazed Upper Shop Door Window + Brass Muntin Crossbars
  const doorGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1.08, 0.035),
    new THREE.MeshBasicMaterial({
      color: '#BAE6FD',
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
    }),
  );
  doorGlass.position.set(-0.53, 1.6, 0);
  doorHingePivot.add(doorGlass);

  const muntinVert = new THREE.Mesh(
    new THREE.BoxGeometry(0.025, 1.08, 0.055),
    brassMat,
  );
  muntinVert.position.set(-0.53, 1.6, 0);
  doorHingePivot.add(muntinVert);

  const muntinHoriz = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.025, 0.055),
    brassMat,
  );
  muntinHoriz.position.set(-0.53, 1.6, 0);
  doorHingePivot.add(muntinHoriz);

  // 3 Moving Hinge Straps attached to the Door Leaf
  for (const hy of hingeHeights) {
    const hingeStrap = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.075, 0.105),
      brassMat,
    );
    hingeStrap.position.set(-0.07, hy, 0);
    doorHingePivot.add(hingeStrap);
    addInkOutline(hingeStrap, inkMaterial, inkLineObjects);
  }

  // 4. ARTICULATED BRASS DOOR HANDLE, SPINDLE & RETRACTING MORTISE LATCH RIG
  // Mounted on the Left Latch Stile of the Door Leaf (local x = -0.94, y = 1.05, z = 0)
  const doorHandleRig = new THREE.Group();
  doorHandleRig.name = 'ArticulatedDoorHandleAndLatchRig';
  doorHandleRig.position.set(-0.94, 1.05, 0);
  doorHingePivot.add(doorHandleRig);

  // Fixed Ornate Victorian Brass Escutcheon Backplates (Interior z = -0.048, Exterior z = +0.048)
  for (const faceSide of [-1, 1]) {
    const escutcheon = new THREE.Mesh(
      new THREE.BoxGeometry(0.088, 0.28, 0.018),
      brassMat,
    );
    escutcheon.position.set(0, -0.02, faceSide * 0.048);
    doorHandleRig.add(escutcheon);
    addInkOutline(escutcheon, inkMaterial, inkLineObjects);

    const collarRose = new THREE.Mesh(
      new THREE.CylinderGeometry(0.034, 0.038, 0.024, 16),
      brassMat,
    );
    collarRose.rotation.x = Math.PI / 2;
    collarRose.position.set(0, 0.025, faceSide * 0.056);
    doorHandleRig.add(collarRose);

    // Keyhole slot below the handle spindle
    const keyhole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.022, 10),
      new THREE.MeshBasicMaterial({color: '#090D16'}),
    );
    keyhole.rotation.x = Math.PI / 2;
    keyhole.position.set(0, -0.085, faceSide * 0.052);
    doorHandleRig.add(keyhole);
  }

  // Mortise Edge Faceplate on the outer edge of the Latch Stile (local x = -0.121)
  const mortiseEdgePlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.24, 0.065),
    brassMat,
  );
  mortiseEdgePlate.position.set(-0.121, -0.01, 0);
  doorHandleRig.add(mortiseEdgePlate);

  // Retracting Beveled Brass Spring Latch Bolt (slides into door edge when handle turns!)
  const latchBoltMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.044, 0.052, 0.032),
    brassMat,
  );
  latchBoltMesh.position.set(-0.138, 0.025, 0);
  doorHandleRig.add(latchBoltMesh);
  addInkOutline(latchBoltMesh, inkMaterial, inkLineObjects);

  // ROTATING HANDLE SPINDLE PIVOT (Turns around Z-axis: 0 rad horizontal -> +0.68 rad / 39° downward!)
  const handleSpindlePivot = new THREE.Group();
  handleSpindlePivot.name = 'DoorHandleSpindlePivot';
  handleSpindlePivot.position.set(0, 0.025, 0);
  doorHandleRig.add(handleSpindlePivot);

  // Square Brass Spindle Rod passing through the door
  const spindleRod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.19, 12),
    brassMat,
  );
  spindleRod.rotation.x = Math.PI / 2;
  handleSpindlePivot.add(spindleRod);

  // Sculpted Brass & Mahogany Lever Handles on Both Interior (-Z) and Exterior (+Z) Sides
  for (const faceSide of [-1, 1]) {
    const leverZ = faceSide * 0.088;
    // Hub boss on spindle
    const hub = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 12, 12),
      brassMat,
    );
    hub.position.set(0, 0, leverZ);
    handleSpindlePivot.add(hub);

    // Sculpted brass lever bar extending toward door center (+X = +0.085)
    const leverArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.02, 0.17, 14),
      brassMat,
    );
    leverArm.rotation.z = Math.PI / 2;
    leverArm.position.set(0.085, 0, leverZ);
    handleSpindlePivot.add(leverArm);
    addInkOutline(leverArm, inkMaterial, inkLineObjects);

    // Turned mahogany grip sleeve in the middle of the brass lever
    const leverGrip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.095, 14),
      darkWalnutMat,
    );
    leverGrip.rotation.z = Math.PI / 2;
    leverGrip.position.set(0.095, 0, leverZ);
    handleSpindlePivot.add(leverGrip);
    addInkOutline(leverGrip, inkMaterial, inkLineObjects);

    // Brass decorative finial ball at the end of the lever handle
    const leverTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.024, 12, 12),
      brassMat,
    );
    leverTip.position.set(0.175, 0, leverZ);
    handleSpindlePivot.add(leverTip);
  }

  // 5. Decorative Holiday Wreath (1) mounted on the Hinged Door Glass (sways with door motion!)
  const wreathGroup = new THREE.Group();
  wreathGroup.position.set(-0.53, 1.6, -0.055);
  const wreathRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.085, 14, 28),
    pineGreenMat,
  );
  wreathGroup.add(wreathRing);
  addInkOutline(wreathRing, inkMaterial, inkLineObjects);

  const wreathBow = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.11, 0.06),
    crimsonVelvetMat,
  );
  wreathBow.position.set(0, 0.26, -0.05);
  wreathGroup.add(wreathBow);
  addInkOutline(wreathBow, inkMaterial, inkLineObjects);

  for (const bSide of [-1, 1]) {
    const miniBell = new THREE.Mesh(
      new THREE.ConeGeometry(0.042, 0.075, 12),
      brassMat,
    );
    miniBell.position.set(bSide * 0.048, 0.18, -0.055);
    miniBell.rotation.z = bSide * 0.22;
    wreathGroup.add(miniBell);
  }

  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI * 2) / 8;
    const berry = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 8, 8),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? '#EF4444' : '#FACC15',
      }),
    );
    berry.position.set(Math.cos(ang) * 0.28, Math.sin(ang) * 0.28, -0.065);
    wreathGroup.add(berry);
  }
  doorHingePivot.add(wreathGroup);

  // 6. Coupled Mechanical Overhead Shop Doorbell Striker & Spring Coil (1)
  const doorbellGroup = new THREE.Group();
  doorbellGroup.position.set(-0.32, 2.42, -0.14);
  const coiledSpring = new THREE.Mesh(
    new THREE.TorusGeometry(0.065, 0.012, 8, 20),
    brassMat,
  );
  doorbellGroup.add(coiledSpring);

  const doorbellGong = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65),
    brassMat,
  );
  doorbellGong.rotation.x = -Math.PI / 2;
  doorbellGong.position.set(0.14, -0.04, 0.02);
  doorbellGroup.add(doorbellGong);
  addInkOutline(doorbellGong, inkMaterial, inkLineObjects);

  const strikerArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.18, 8),
    brassMat,
  );
  strikerArm.rotation.z = -0.5;
  strikerArm.position.set(0.07, -0.04, 0.03);
  doorbellGroup.add(strikerArm);

  // Visual Chime Sound-Wave Halo Ring around the Doorbell Gong when door opens
  const doorbellChimeRing = new THREE.Mesh(
    new THREE.RingGeometry(0.1, 0.135, 24),
    new THREE.MeshBasicMaterial({
      color: '#FDE047',
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    }),
  );
  doorbellChimeRing.position.set(0.14, -0.04, -0.04);
  doorbellGroup.add(doorbellChimeRing);
  entranceDoorGroup.add(doorbellGroup);

  const doorInspectInfo = {
    id: 'rigged-shop-door-and-handle',
    label:
      'Rigged Shop Entrance Door, Turning Brass Lever Handle, Retracting Latch Bolt, 3 Hinges & Doorbell Chime',
    category: 'Rigged Shop Door & Turning Handle',
    target: [1.42, 1.25, 3.05] as [number, number, number],
    optimalDistance: 1.95,
    cameraPosition: [0.55, 1.48, 1.35] as [number, number, number],
  };
  tagInspectable(entranceDoorGroup, doorInspectInfo);
  tagInspectable(doorHandleRig, doorInspectInfo);
  southWallGroup.add(entranceDoorGroup);
  architectureGroup.add(southWallGroup);

  // Ceiling (1) with Coffered Mahogany Rafters & Brass Medallions
  const ceilingGroup = new THREE.Group();
  const ceilingSlab = new THREE.Mesh(
    new THREE.BoxGeometry(8.8, 0.16, 6.8),
    creamPlasterMat,
  );
  ceilingSlab.position.set(0, 4.22, 0);
  ceilingGroup.add(ceilingSlab);

  for (let z = -2.6; z <= 2.6; z += 1.3) {
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(8.7, 0.18, 0.22),
      darkWalnutMat,
    );
    beam.position.set(0, 4.06, z);
    ceilingGroup.add(beam);
    addInkOutline(beam, inkMaterial, inkLineObjects);
  }
  for (const x of [-2.8, 0, 2.8]) {
    const longBeam = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.16, 6.7),
      darkWalnutMat,
    );
    longBeam.position.set(x, 4.07, 0);
    ceilingGroup.add(longBeam);
  }
  architectureGroup.add(ceilingGroup);

  // ==========================================================================
  // 2. DISPLAY SHELVES / CUPBOARDS (5 TALL HIGH-CLEARANCE UNITS — ZERO TOY PHASING)
  // ==========================================================================
  const shelvesGroup = new THREE.Group();
  shelvesGroup.name = 'DisplayShelves5';
  rootGroup.add(shelvesGroup);

  function buildCarvedShelfUnit(params: {
    id: string;
    label: string;
    position: [number, number, number];
    rotationY: number;
    width: number;
    height: number;
    depth: number;
    tierHeights: number[];
  }): THREE.Group {
    const unit = new THREE.Group();
    unit.position.set(...params.position);
    unit.rotation.y = params.rotationY;

    // Back panel
    const backBoard = new THREE.Mesh(
      new THREE.BoxGeometry(params.width, params.height, 0.06),
      darkWalnutMat,
    );
    backBoard.position.set(0, params.height / 2, -params.depth / 2 + 0.03);
    unit.add(backBoard);
    addInkOutline(backBoard, inkMaterial, inkLineObjects);

    // Side pillars
    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, params.height, params.depth),
        mahoganyMat,
      );
      pillar.position.set(
        side * (params.width / 2 - 0.04),
        params.height / 2,
        0,
      );
      unit.add(pillar);
      addInkOutline(pillar, inkMaterial, inkLineObjects);
    }

    // Tiers + crimson velvet shelf liners + brass trim + carved under-shelf corbels
    for (const ty of params.tierHeights) {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(params.width, 0.055, params.depth),
        warmOakMat,
      );
      plank.position.set(0, ty, 0);
      unit.add(plank);
      addInkOutline(plank, inkMaterial, inkLineObjects);

      const runner = new THREE.Mesh(
        new THREE.BoxGeometry(params.width - 0.18, 0.015, params.depth - 0.08),
        crimsonVelvetMat,
      );
      runner.position.set(0, ty + 0.0325, 0.01);
      unit.add(runner);

      const brassEdge = new THREE.Mesh(
        new THREE.BoxGeometry(params.width, 0.02, 0.018),
        brassMat,
      );
      brassEdge.position.set(0, ty, params.depth / 2 + 0.005);
      unit.add(brassEdge);
    }

    // Crown header
    const crown = new THREE.Mesh(
      new THREE.BoxGeometry(params.width + 0.1, 0.14, params.depth + 0.08),
      mahoganyMat,
    );
    crown.position.set(0, params.height + 0.05, 0);
    unit.add(crown);
    addInkOutline(crown, inkMaterial, inkLineObjects);

    const crownGoldTrim = new THREE.Mesh(
      new THREE.BoxGeometry(params.width + 0.12, 0.028, params.depth + 0.1),
      brassMat,
    );
    crownGoldTrim.position.set(0, params.height - 0.01, 0);
    unit.add(crownGoldTrim);

    tagInspectable(unit, {
      id: params.id,
      label: params.label,
      category: 'Carved Mahogany Display Cupboards',
      target: [params.position[0], 1.65, params.position[2]],
      optimalDistance: 2.5,
      cameraPosition: [
        params.position[0] * 0.35,
        1.85,
        params.position[2] + 0.55,
      ],
    });
    return unit;
  }

  for (const shelfSpec of INTERIOR_SHELF_SPECS) {
    shelvesGroup.add(buildCarvedShelfUnit(shelfSpec));
  }

  // ==========================================================================
  // 3. FULL WOODEN DECORATED COUNTER (1) + BOARDS + CASH REGISTER (1) + SMALL BELL (1)
  // ==========================================================================
  const counterGroup = new THREE.Group();
  counterGroup.name = 'DecoratedWoodenCounterAndRegister';
  counterGroup.position.set(0, 0, -1.85);
  rootGroup.add(counterGroup);

  // Main mahogany counter body (3.2m wide × 1.02m high × 0.86m deep)
  const counterBody = new THREE.Mesh(
    new THREE.BoxGeometry(3.15, 0.96, 0.82),
    mahoganyMat,
  );
  counterBody.position.set(0, 0.48, 0);
  counterGroup.add(counterBody);
  addInkOutline(counterBody, inkMaterial, inkLineObjects);

  // Polished warm oak overhanging countertop
  const counterTop = new THREE.Mesh(
    new THREE.BoxGeometry(3.32, 0.075, 0.94),
    warmOakMat,
  );
  counterTop.position.set(0, 0.995, 0);
  counterGroup.add(counterTop);
  addInkOutline(counterTop, inkMaterial, inkLineObjects);

  // Carved fluted pilasters along counter front
  for (const px of [-1.48, -0.68, 0.68, 1.48]) {
    const pilaster = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.92, 0.08),
      darkWalnutMat,
    );
    pilaster.position.set(px, 0.48, 0.41);
    counterGroup.add(pilaster);
    addInkOutline(pilaster, inkMaterial, inkLineObjects);

    const corbelGold = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.12, 0.1),
      brassMat,
    );
    corbelGold.position.set(px, 0.88, 0.42);
    counterGroup.add(corbelGold);
  }

  // Brass customer foot-rail along bottom front of counter
  const footRail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.024, 3.05, 16),
    brassMat,
  );
  footRail.rotation.z = Math.PI / 2;
  footRail.position.set(0, 0.12, 0.52);
  counterGroup.add(footRail);
  addInkOutline(footRail, inkMaterial, inkLineObjects);

  // Counter Front Promotional Price Board #1 (Center Front)
  const counterMenuTex = createBoardSignTexture({
    bgColor: '#0F172A',
    borderColor: '#FACC15',
    headerText: 'OFFICIAL NUTCRACKER TARIFF',
    headerColor: '#FACC15',
    lines: [
      '• ROYAL HUSSAR SOLDIER ....... $49.99',
      '• BAVARIAN KING EDITION ...... $79.99',
      '• 1887 HERO MASTERPIECE ..... $199.99',
    ],
    footerText: 'FREE HOLIDAY GIFT WRAPPING!',
  });
  disposableTextures.push(counterMenuTex);
  const frontCounterBoard = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.68, 0.045),
    new THREE.MeshToonMaterial({map: counterMenuTex, gradientMap: toon3}),
  );
  frontCounterBoard.position.set(0, 0.5, 0.43);
  counterGroup.add(frontCounterBoard);
  addInkOutline(frontCounterBoard, inkMaterial, inkLineObjects);

  // Counter Side Board #2 (Left Front Panel)
  const leftCounterTex = createBoardSignTexture({
    bgColor: '#7F1D1D',
    borderColor: '#FDE047',
    headerText: 'CUSTOM GIFT WRAPPING',
    headerColor: '#FDE047',
    lines: ['SATIN RIBBONS', 'GOLD FOIL PAPER', 'HAND-TIED BOWS'],
    footerText: 'ASK AT COUNTER!',
  });
  disposableTextures.push(leftCounterTex);
  const leftCounterBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.64, 0.58, 0.04),
    new THREE.MeshToonMaterial({map: leftCounterTex, gradientMap: toon3}),
  );
  leftCounterBoard.position.set(-1.08, 0.5, 0.43);
  counterGroup.add(leftCounterBoard);
  addInkOutline(leftCounterBoard, inkMaterial, inkLineObjects);

  // Counter Side Board #3 (Right Front Panel)
  const rightCounterTex = createBoardSignTexture({
    bgColor: '#14532D',
    borderColor: '#FACC15',
    headerText: 'SAFETY NOTICE',
    headerColor: '#FACC15',
    lines: ['HARDWOOD JAWS ARE', 'FOR WALNUTS ONLY!', 'KEEP FINGERS CLEAR'],
    footerText: 'NO REFUNDS!',
  });
  disposableTextures.push(rightCounterTex);
  const rightCounterBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.64, 0.58, 0.04),
    new THREE.MeshToonMaterial({map: rightCounterTex, gradientMap: toon3}),
  );
  rightCounterBoard.position.set(1.08, 0.5, 0.43);
  counterGroup.add(rightCounterBoard);
  addInkOutline(rightCounterBoard, inkMaterial, inkLineObjects);

  // CASH REGISTER (1) on left side of counter
  const registerGroup = new THREE.Group();
  registerGroup.position.set(-0.82, 1.03, 0.05);

  const regBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.12, 0.42),
    darkWalnutMat,
  );
  regBase.position.y = 0.06;
  registerGroup.add(regBase);
  addInkOutline(regBase, inkMaterial, inkLineObjects);

  const regCabinet = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.28, 0.34),
    brassMat,
  );
  regCabinet.position.set(0, 0.24, -0.02);
  registerGroup.add(regCabinet);
  addInkOutline(regCabinet, inkMaterial, inkLineObjects);

  // 24 individual cash register keys (4 rows × 6 cols)
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      const keyPin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.045, 8),
        new THREE.MeshToonMaterial({
          color: r === 0 ? '#DC2626' : '#F8FAFC',
          gradientMap: toon3,
        }),
      );
      keyPin.rotation.x = 0.45;
      keyPin.position.set(
        -0.14 + c * 0.056,
        0.18 + r * 0.045,
        0.16 - r * 0.032,
      );
      registerGroup.add(keyPin);
    }
  }

  // Top glass price flag window ("$19.99")
  const regTopWindow = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.11, 0.06),
    brassMat,
  );
  regTopWindow.position.set(0, 0.43, -0.04);
  registerGroup.add(regTopWindow);
  addInkOutline(regTopWindow, inkMaterial, inkLineObjects);

  const priceFlagTex = createBoardSignTexture({
    bgColor: '#0F172A',
    borderColor: '#FACC15',
    headerText: '$19.99',
    headerColor: '#4ADE80',
    lines: ['SALE REGISTERED'],
    width: 256,
    height: 128,
  });
  disposableTextures.push(priceFlagTex);
  const priceFlagPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.085),
    new THREE.MeshBasicMaterial({map: priceFlagTex}),
  );
  priceFlagPlane.position.set(0, 0.43, -0.008);
  registerGroup.add(priceFlagPlane);

  // Side crank handle & receipt roll
  const regCrank = new THREE.Mesh(
    new THREE.TorusGeometry(0.065, 0.012, 8, 16, Math.PI),
    brassMat,
  );
  regCrank.rotation.y = Math.PI / 2;
  regCrank.position.set(0.24, 0.26, 0.02);
  registerGroup.add(regCrank);

  const receiptRoll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.09, 14),
    new THREE.MeshBasicMaterial({color: '#F8FAFC'}),
  );
  receiptRoll.rotation.z = Math.PI / 2;
  receiptRoll.position.set(-0.16, 0.39, 0.04);
  registerGroup.add(receiptRoll);
  counterGroup.add(registerGroup);

  // SMALL BELL / CHIME (1) on Counter
  const serviceBellGroup = new THREE.Group();
  serviceBellGroup.position.set(-0.22, 1.03, 0.24);
  const bellBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.062, 0.018, 16),
    darkWalnutMat,
  );
  serviceBellGroup.add(bellBase);
  const bellDome = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.048,
      16,
      12,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.58,
    ),
    brassMat,
  );
  bellDome.position.y = 0.015;
  serviceBellGroup.add(bellDome);
  addInkOutline(bellDome, inkMaterial, inkLineObjects);
  const bellPlunger = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.03, 8),
    brassMat,
  );
  bellPlunger.position.y = 0.065;
  serviceBellGroup.add(bellPlunger);
  counterGroup.add(serviceBellGroup);

  // ==========================================================================
  // 4. WRAPPING PAPER ROLLS (3) + RIBBON SPOOLS (4) ON COUNTER WRAPPING STATION
  // ==========================================================================
  const wrappingStationGroup = new THREE.Group();
  wrappingStationGroup.position.set(0.92, 1.03, 0.02);
  counterGroup.add(wrappingStationGroup);

  const wrapColors = ['#DC2626', '#16A34A', '#2563EB'];
  for (let w = 0; w < 3; w++) {
    const roll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.56, 16),
      new THREE.MeshToonMaterial({color: wrapColors[w], gradientMap: toon3}),
    );
    roll.rotation.z = Math.PI / 2;
    roll.position.set(0, 0.08 + w * 0.11, -0.12 + w * 0.04);
    wrappingStationGroup.add(roll);
    addInkOutline(roll, inkMaterial, inkLineObjects);

    // Gold stripe bands on wrapping paper roll
    for (let b = -0.2; b <= 0.2; b += 0.1) {
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.047, 0.047, 0.018, 14),
        brassMat,
      );
      band.rotation.z = Math.PI / 2;
      band.position.set(b, 0.08 + w * 0.11, -0.12 + w * 0.04);
      wrappingStationGroup.add(band);
    }
  }

  // Dispenser side frames
  for (const side of [-1, 1]) {
    const framePost = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.36, 0.22),
      brassMat,
    );
    framePost.position.set(side * 0.3, 0.18, -0.04);
    wrappingStationGroup.add(framePost);
    addInkOutline(framePost, inkMaterial, inkLineObjects);
  }

  // 4 Ribbon Spools next to the wrapping paper rolls
  const ribbonColors = ['#EF4444', '#FACC15', '#10B981', '#EC4899'];
  for (let s = 0; s < 4; s++) {
    const spoolGroup = new THREE.Group();
    spoolGroup.position.set(-0.48 + s * 0.13, 0.055, 0.18);

    const ribbonCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.075, 14),
      new THREE.MeshToonMaterial({color: ribbonColors[s], gradientMap: toon3}),
    );
    spoolGroup.add(ribbonCore);
    addInkOutline(ribbonCore, inkMaterial, inkLineObjects);

    for (const end of [-1, 1]) {
      const flange = new THREE.Mesh(
        new THREE.CylinderGeometry(0.052, 0.052, 0.012, 14),
        warmOakMat,
      );
      flange.position.y = end * 0.042;
      spoolGroup.add(flange);
    }
    wrappingStationGroup.add(spoolGroup);
  }

  tagInspectable(counterGroup, {
    id: 'decorated-wooden-counter-register',
    label:
      'Decorated Mahogany Counter, Vintage Brass Cash Register, 3 Menu Boards, Wrapping Rolls, Ribbon Spools & Bell',
    category: 'Counter, Cash Register & Wrapping Station',
    target: [0, 1.15, -1.85],
    optimalDistance: 2.3,
    cameraPosition: [-0.25, 1.68, 0.45],
  });

  // ==========================================================================
  // 5. HERO NUTCRACKER DOLL (1) ON ILLUMINATED PEDESTAL + 14 DISPLAY DOLLS
  // ==========================================================================
  const nutcrackersRoot = new THREE.Group();
  nutcrackersRoot.name = 'All15NutcrackerDolls';
  rootGroup.add(nutcrackersRoot);

  // Illuminated Velvet & Brass Octagonal Pedestal for Hero Nutcracker (X = 1.35, Z = -0.35)
  const heroPedestalGroup = new THREE.Group();
  heroPedestalGroup.position.set(1.35, 0, -0.35);

  const pedStep1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.64, 0.14, 8),
    mahoganyMat,
  );
  pedStep1.position.y = 0.07;
  heroPedestalGroup.add(pedStep1);
  addInkOutline(pedStep1, inkMaterial, inkLineObjects);

  const pedColumn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.46, 0.68, 8),
    crimsonVelvetMat,
  );
  pedColumn.position.y = 0.48;
  heroPedestalGroup.add(pedColumn);
  addInkOutline(pedColumn, inkMaterial, inkLineObjects);

  const pedCrown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.44, 0.1, 8),
    brassMat,
  );
  pedCrown.position.y = 0.87;
  heroPedestalGroup.add(pedCrown);
  addInkOutline(pedCrown, inkMaterial, inkLineObjects);

  // 4 brass velvet-rope stanchions around the Hero Nutcracker Pedestal
  const stanchionOffsets: [number, number][] = [
    [-0.68, -0.68],
    [0.68, -0.68],
    [-0.68, 0.68],
    [0.68, 0.68],
  ];
  for (const [sx, sz] of stanchionOffsets) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.028, 0.78, 12),
      brassMat,
    );
    post.position.set(sx, 0.39, sz);
    heroPedestalGroup.add(post);

    const finial = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 10, 10),
      brassMat,
    );
    finial.position.set(sx, 0.8, sz);
    heroPedestalGroup.add(finial);
  }
  nutcrackersRoot.add(heroPedestalGroup);

  // Build Hero Nutcracker Doll (1)
  const heroDollHandle = buildDetailedNutcrackerDoll({
    spec: HERO_NUTCRACKER_SPEC,
    toon3,
    toon4,
    inkMaterial,
    inkLineObjects,
  });
  nutcrackersRoot.add(heroDollHandle.group);

  // Build 14 Display Nutcracker Dolls
  const displayDollHandles = DISPLAY_NUTCRACKER_SPECS.map((spec) => {
    const h = buildDetailedNutcrackerDoll({
      spec,
      toon3,
      toon4,
      inkMaterial,
      inkLineObjects,
    });
    nutcrackersRoot.add(h.group);
    return {spec, handle: h};
  });

  // ==========================================================================
  // 6. ROLLING MERCHANDISE DISPLAY CART (1) + GIFT BOXES (10) + WRAPPED PRESENTS (8)
  // ==========================================================================
  const cartAndGiftsGroup = new THREE.Group();
  cartAndGiftsGroup.name = 'CartGiftBoxesAndWrappedPresents';
  rootGroup.add(cartAndGiftsGroup);

  // Rolling Wooden & Brass Display Cart at X = -1.65, Z = -0.45
  const displayCart = new THREE.Group();
  displayCart.position.set(-1.65, 0, -0.45);
  displayCart.rotation.y = 0.28;

  const cartTrayLower = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.06, 0.68),
    warmOakMat,
  );
  cartTrayLower.position.y = 0.28;
  displayCart.add(cartTrayLower);
  addInkOutline(cartTrayLower, inkMaterial, inkLineObjects);

  const cartTrayUpper = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.06, 0.68),
    warmOakMat,
  );
  cartTrayUpper.position.y = 0.78;
  displayCart.add(cartTrayUpper);
  addInkOutline(cartTrayUpper, inkMaterial, inkLineObjects);

  for (const cx of [-0.52, 0.52]) {
    for (const cz of [-0.29, 0.29]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.78, 10),
        brassMat,
      );
      leg.position.set(cx, 0.48, cz);
      displayCart.add(leg);

      const wheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.022, 8, 16),
        brassMat,
      );
      wheel.position.set(cx, 0.12, cz);
      displayCart.add(wheel);
      addInkOutline(wheel, inkMaterial, inkLineObjects);
    }
  }
  cartAndGiftsGroup.add(displayCart);

  // 10 Gift Boxes across cupboards and display cart (seated flush on surfaces, zero phasing)
  INTERIOR_GIFT_BOX_SPECS.forEach((gb) => {
    const boxGrp = new THREE.Group();
    boxGrp.position.set(...gb.pos);
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(gb.size[0], gb.size[1], gb.size[2]),
      new THREE.MeshToonMaterial({color: gb.color, gradientMap: toon3}),
    );
    body.position.y = gb.size[1] / 2;
    boxGrp.add(body);
    addInkOutline(body, inkMaterial, inkLineObjects);

    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(
        gb.size[0] + 0.02,
        0.045,
        gb.size[2] + 0.02,
      ),
      new THREE.MeshToonMaterial({
        color: gb.secondaryColor,
        gradientMap: toon3,
      }),
    );
    lid.position.y = gb.size[1] + 0.01;
    boxGrp.add(lid);
    addInkOutline(lid, inkMaterial, inkLineObjects);
    cartAndGiftsGroup.add(boxGrp);
  });

  // 8 Wrapped Presents with Crossed Ribbons & 3D Multi-Loop Bows
  INTERIOR_WRAPPED_PRESENT_SPECS.forEach((wp) => {
    const pGrp = new THREE.Group();
    pGrp.position.set(...wp.pos);
    const [w, h, d] = wp.size;
    const ribMat = new THREE.MeshToonMaterial({
      color: wp.secondaryColor,
      gradientMap: toon4,
    });
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshToonMaterial({color: wp.color, gradientMap: toon3}),
    );
    box.position.y = h / 2;
    pGrp.add(box);
    addInkOutline(box, inkMaterial, inkLineObjects);

    const rib1 = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.014, h + 0.014, 0.045),
      ribMat,
    );
    rib1.position.y = h / 2;
    pGrp.add(rib1);

    const rib2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, h + 0.014, d + 0.014),
      ribMat,
    );
    rib2.position.y = h / 2;
    pGrp.add(rib2);

    // 3D Multi-loop bow on top
    for (let l = 0; l < 4; l++) {
      const loop = new THREE.Mesh(
        new THREE.TorusGeometry(0.042, 0.012, 8, 14),
        ribMat,
      );
      loop.rotation.y = (l * Math.PI) / 4;
      loop.position.y = h + 0.035;
      pGrp.add(loop);
    }
    cartAndGiftsGroup.add(pGrp);
  });

  // ==========================================================================
  // 7. SHOPPING BASKETS (2) + GIFT BAGS (5)
  // ==========================================================================
  const basketsPositions: [number, number, number][] = [
    [-1.32, 1.032, -1.68],
    [-1.25, 0.01, -0.25],
  ];
  basketsPositions.forEach((bPos) => {
    const basket = new THREE.Group();
    basket.position.set(...bPos);
    const tub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.14, 0.2, 14),
      warmOakMat,
    );
    tub.position.y = 0.1;
    basket.add(tub);
    addInkOutline(tub, inkMaterial, inkLineObjects);

    const handleArc = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.014, 8, 16, Math.PI),
      brassMat,
    );
    handleArc.position.y = 0.2;
    basket.add(handleArc);
    cartAndGiftsGroup.add(basket);
  });

  INTERIOR_GIFT_BAG_SPECS.forEach((gb) => {
    const bag = new THREE.Group();
    bag.position.set(...gb.pos);
    bag.rotation.y = gb.rotationY;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.25, 0.1),
      new THREE.MeshToonMaterial({color: gb.color, gradientMap: toon3}),
    );
    body.position.y = 0.125;
    bag.add(body);
    addInkOutline(body, inkMaterial, inkLineObjects);

    // Tissue paper tuft + rope handle
    const tissue = new THREE.Mesh(
      new THREE.ConeGeometry(0.065, 0.09, 6),
      new THREE.MeshBasicMaterial({color: '#FEF3C7'}),
    );
    tissue.position.y = 0.27;
    bag.add(tissue);

    const cord = new THREE.Mesh(
      new THREE.TorusGeometry(0.048, 0.006, 6, 12, Math.PI),
      brassMat,
    );
    cord.position.set(0, 0.25, 0.04);
    bag.add(cord);
    cartAndGiftsGroup.add(bag);
  });

  // ==========================================================================
  // 8. SMALL CHRISTMAS TREE (1) + CHRISTMAS ORNAMENTS (12) + GARLAND (3 RUNS)
  // ==========================================================================
  const holidayDecorGroup = new THREE.Group();
  holidayDecorGroup.name = 'HolidayTreeOrnamentsAndGarland';
  rootGroup.add(holidayDecorGroup);

  // Small Christmas Tree (1) at X = -2.45, Z = 1.65
  const treeGroup = new THREE.Group();
  treeGroup.position.set(-2.45, 0, 1.65);

  const barrelPlanter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.26, 0.42, 16),
    warmOakMat,
  );
  barrelPlanter.position.y = 0.21;
  treeGroup.add(barrelPlanter);
  addInkOutline(barrelPlanter, inkMaterial, inkLineObjects);

  for (const hoopY of [0.1, 0.32]) {
    const hoop = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.014, 8, 20),
      brassMat,
    );
    hoop.rotation.x = Math.PI / 2;
    hoop.position.y = hoopY;
    treeGroup.add(hoop);
  }

  // 5 conical evergreen tiers
  for (let tier = 0; tier < 5; tier++) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.68 - tier * 0.11, 0.56, 16),
      pineGreenMat,
    );
    cone.position.y = 0.65 + tier * 0.36;
    treeGroup.add(cone);
    addInkOutline(cone, inkMaterial, inkLineObjects);
  }

  // Glowing 3D Star Topper
  const starTopper = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.16, 0),
    new THREE.MeshBasicMaterial({color: '#FDE047'}),
  );
  starTopper.position.y = 2.42;
  treeGroup.add(starTopper);
  addInkOutline(starTopper, inkMaterial, inkLineObjects);

  tagInspectable(treeGroup, {
    id: 'small-christmas-tree-01',
    label:
      'Festive Shop Christmas Tree in Brass-Hooped Barrel Planter with Star Topper & Wrapped Presents',
    category: 'Holiday Tree & Ornaments',
    target: [-2.45, 1.25, 1.65],
    optimalDistance: 2.4,
    cameraPosition: [-0.95, 1.65, 0.45],
  });
  holidayDecorGroup.add(treeGroup);

  // 12 Sparkling Christmas Ornaments across Tree, Counter Garland & Cupboard Tier 3 Brass Stands
  INTERIOR_ORNAMENT_SPECS.forEach((ornSpec) => {
    const ornGrp = new THREE.Group();
    ornGrp.position.set(...ornSpec.pos);
    const baubleY = ornSpec.hasBrassStand ? 0.11 : 0;

    if (ornSpec.hasBrassStand) {
      const standBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.068, 0.02, 14),
        brassMat,
      );
      standBase.position.y = 0.01;
      ornGrp.add(standBase);

      const standStem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.19, 8),
        brassMat,
      );
      standStem.position.set(0, 0.105, -0.035);
      ornGrp.add(standStem);

      const standArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.012, 0.045),
        brassMat,
      );
      standArm.position.set(0, 0.19, -0.015);
      ornGrp.add(standArm);
    }

    const bauble = new THREE.Mesh(
      new THREE.SphereGeometry(0.062, 14, 14),
      new THREE.MeshToonMaterial({
        color: ornSpec.color,
        gradientMap: toon4,
      }),
    );
    bauble.position.y = baubleY;
    ornGrp.add(bauble);
    addInkOutline(bauble, inkMaterial, inkLineObjects);

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.022, 0.024, 10),
      brassMat,
    );
    cap.position.y = baubleY + 0.065;
    ornGrp.add(cap);
    holidayDecorGroup.add(ornGrp);
  });

  // 3 Lush Evergreen Garland Runs (1: Counter Front, 2: North Back Wall Cornice, 3: Central Ceiling Beam)
  function buildGarlandRun(
    start: [number, number, number],
    end: [number, number, number],
    sag: number,
    segments = 18,
  ): THREE.Group {
    const gRun = new THREE.Group();
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const x = start[0] + (end[0] - start[0]) * u;
      const z = start[2] + (end[2] - start[2]) * u;
      const y =
        start[1] +
        (end[1] - start[1]) * u -
        Math.sin(u * Math.PI) * sag;

      const tuft = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 10, 10),
        pineGreenMat,
      );
      tuft.scale.set(1.3, 0.95, 0.95);
      tuft.position.set(x, y, z);
      gRun.add(tuft);

      if (i % 3 === 0) {
        const fairyLight = new THREE.Mesh(
          new THREE.SphereGeometry(0.025, 8, 8),
          new THREE.MeshBasicMaterial({
            color: i % 6 === 0 ? '#EF4444' : '#FDE047',
          }),
        );
        fairyLight.position.set(x, y - 0.03, z + 0.055);
        gRun.add(fairyLight);
      }
    }
    return gRun;
  }

  // Garland Run #1: Across Front of Wooden Counter
  holidayDecorGroup.add(
    buildGarlandRun([-1.55, 0.94, -1.39], [1.55, 0.94, -1.39], 0.16, 20),
  );
  // Garland Run #2: Across North Back Wall Cornice
  holidayDecorGroup.add(
    buildGarlandRun([-3.2, 3.65, -3.18], [3.2, 3.65, -3.18], 0.24, 24),
  );
  // Garland Run #3: Across Central Overhead Ceiling Rafter
  holidayDecorGroup.add(
    buildGarlandRun([-3.6, 3.92, -0.65], [3.6, 3.92, -0.65], 0.28, 24),
  );

  // ==========================================================================
  // 9. PRICE TAGS (10 READABLE SWING TAGS)
  // ==========================================================================
  const priceTagsGroup = new THREE.Group();
  priceTagsGroup.name = 'ReadablePriceTags10';
  rootGroup.add(priceTagsGroup);

  INTERIOR_PRICE_TAG_SPECS.forEach((tagSpec: PriceTagSpec) => {
    const tagTex = createBoardSignTexture({
      bgColor: '#FFFBEB',
      borderColor: tagSpec.accentColor,
      headerText: tagSpec.priceText,
      headerColor: tagSpec.accentColor,
      lines: [tagSpec.subtitleText],
      footerText: 'CRACK & SONS',
      width: 256,
      height: 160,
    });
    disposableTextures.push(tagTex);

    const tagGroup = new THREE.Group();
    tagGroup.position.set(...tagSpec.position);
    tagGroup.rotation.y = tagSpec.rotationY;

    const card = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.15, 0.014),
      new THREE.MeshBasicMaterial({map: tagTex}),
    );
    tagGroup.add(card);
    addInkOutline(card, inkMaterial, inkLineObjects);

    const stringRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, 0.09, 6),
      brassMat,
    );
    stringRod.position.y = 0.11;
    tagGroup.add(stringRod);
    priceTagsGroup.add(tagGroup);
  });

  // ==========================================================================
  // 10. 2 SHOP TVS PLAYING 60FPS 2D ANIMATED STORE COMMERCIAL + POSTERS/BANNERS
  // ==========================================================================
  const mediaAndSignageGroup = new THREE.Group();
  mediaAndSignageGroup.name = 'AnimatedShopTVsAndPosters';
  rootGroup.add(mediaAndSignageGroup);

  const tvAdCanvas = document.createElement('canvas');
  tvAdCanvas.width = 512;
  tvAdCanvas.height = 320;
  const tvAdCtx = tvAdCanvas.getContext('2d');
  const tvAdTexture = new THREE.CanvasTexture(tvAdCanvas);
  tvAdTexture.colorSpace = THREE.SRGBColorSpace;
  disposableTextures.push(tvAdTexture);

  if (tvAdCtx) {
    render2DStoreAdvertisementCanvas(
      tvAdCtx,
      512,
      320,
      evaluateStoreTvAdStateAtFrame(0, 60),
      0,
    );
    tvAdTexture.needsUpdate = true;
  }

  function buildShopTvMonitor(params: {
    id: string;
    label: string;
    position: [number, number, number];
    rotationY: number;
    width: number;
    height: number;
  }): THREE.Group {
    const tvGrp = new THREE.Group();
    tvGrp.position.set(...params.position);
    tvGrp.rotation.y = params.rotationY;

    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(params.width + 0.14, params.height + 0.14, 0.12),
      darkWalnutMat,
    );
    tvGrp.add(bezel);
    addInkOutline(bezel, inkMaterial, inkLineObjects);

    const brassFrame = new THREE.Mesh(
      new THREE.BoxGeometry(params.width + 0.06, params.height + 0.06, 0.13),
      brassMat,
    );
    tvGrp.add(brassFrame);

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(params.width, params.height),
      new THREE.MeshBasicMaterial({map: tvAdTexture}),
    );
    screenMesh.position.z = 0.068;
    tvGrp.add(screenMesh);

    // Rabbit-ear antennas on top for vintage anime charm
    for (const side of [-1, 1]) {
      const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.34, 8),
        brassMat,
      );
      antenna.position.set(side * 0.14, params.height / 2 + 0.18, 0);
      antenna.rotation.z = side * -0.45;
      tvGrp.add(antenna);
    }

    tagInspectable(tvGrp, {
      id: params.id,
      label: params.label,
      category: 'Live 2D Animated Store Commercial TV',
      target: params.position,
      optimalDistance: 2.1,
      cameraPosition: [1.45, 2.28, 0.25],
    });
    return tvGrp;
  }

  // TV #1: East Gallery Wall Widescreen Ad TV (Unobstructed Bay)
  mediaAndSignageGroup.add(
    buildShopTvMonitor({
      id: 'shop-ad-tv-east',
      label:
        'East Wall Shop TV — Playing Live 2D Animated "CRACK & SONS" Store Commercial',
      position: [4.08, 2.58, -2.05],
      rotationY: -Math.PI / 2 + 0.38,
      width: 1.42,
      height: 0.88,
    }),
  );

  // TV #2: North-West Counter Overhead Ad Monitor
  mediaAndSignageGroup.add(
    buildShopTvMonitor({
      id: 'shop-ad-tv-counter',
      label:
        'Overhead Counter Monitor — Playing Live 2D Animated "CRACK & SONS" Commercial',
      position: [-2.85, 2.75, -2.88],
      rotationY: 0.38,
      width: 1.08,
      height: 0.68,
    }),
  );

  // Framed Wall Posters & Hanging Promotional Banners (3) in open wall bays (clear of tall cupboards)
  const posterSpecs = [
    {
      pos: [-4.22, 2.45, 2.22] as [number, number, number],
      rotY: Math.PI / 2,
      header: 'THE NUTCRACKER KING',
      lines: ['HAND-CARVED IN BAVARIA', 'COLLECT ALL 15 REGIMENTS'],
      bg: '#7F1D1D',
    },
    {
      pos: [4.22, 2.55, 1.92] as [number, number, number],
      rotY: -Math.PI / 2,
      header: '100% WALNUT CRUSHER',
      lines: ['REINFORCED HARDWOOD JAW', 'TESTED TO 9,000 PSI!'],
      bg: '#1E3A8A',
    },
    {
      pos: [4.22, 1.65, 1.92] as [number, number, number],
      rotY: -Math.PI / 2,
      header: 'HOLIDAY GIFT BUNDLES',
      lines: ['GIFT BOXES • RIBBONS', 'ORNAMENTS & WRAPPING'],
      bg: '#065F46',
    },
  ];
  posterSpecs.forEach((ps) => {
    const pTex = createBoardSignTexture({
      bgColor: ps.bg,
      borderColor: '#FACC15',
      headerText: ps.header,
      headerColor: '#FDE047',
      lines: ps.lines,
      footerText: 'CRACK & SONS • 1887',
    });
    disposableTextures.push(pTex);
    const posterMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.96, 0.64, 0.04),
      new THREE.MeshToonMaterial({map: pTex, gradientMap: toon3}),
    );
    posterMesh.position.set(...ps.pos);
    posterMesh.rotation.y = ps.rotY;
    mediaAndSignageGroup.add(posterMesh);
    addInkOutline(posterMesh, inkMaterial, inkLineObjects);
  });

  // ==========================================================================
  // 11. HANGING SHOP LIGHTS (5) + WALL LAMPS (2) + VOLUMETRIC LIGHT CONES
  // ==========================================================================
  const lightingFixturesGroup = new THREE.Group();
  lightingFixturesGroup.name = 'ShopLights5AndWallLamps2';
  rootGroup.add(lightingFixturesGroup);

  const pendantPositions: [number, number, number][] = [
    [-1.85, 3.35, -1.65],
    [0.0, 3.35, -1.65],
    [1.85, 3.35, -1.65],
    [-1.45, 3.35, 0.65],
    [1.35, 3.35, -0.35],
  ];

  const volumetricConeMat = new THREE.MeshBasicMaterial({
    color: '#FDE68A',
    transparent: true,
    opacity: 0.085,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const shopPointLights: THREE.PointLight[] = [];

  pendantPositions.forEach((pPos) => {
    const pend = new THREE.Group();
    pend.position.set(...pPos);

    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.72, 10),
      brassMat,
    );
    rod.position.y = 0.36;
    pend.add(rod);

    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.22, 16, 1, true),
      brassMat,
    );
    shade.position.y = 0.04;
    pend.add(shade);
    addInkOutline(shade, inkMaterial, inkLineObjects);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 12, 12),
      new THREE.MeshBasicMaterial({color: '#FFFBEB'}),
    );
    bulb.position.y = -0.02;
    pend.add(bulb);

    // Volumetric warm light cone shaft
    const lightCone = new THREE.Mesh(
      new THREE.ConeGeometry(1.15, 2.85, 20, 1, true),
      volumetricConeMat,
    );
    lightCone.position.y = -1.42;
    pend.add(lightCone);

    const ptLight = new THREE.PointLight('#FDE68A', 2.4, 7.5, 1.4);
    ptLight.position.set(pPos[0], pPos[1] - 0.15, pPos[2]);
    lightingFixturesGroup.add(ptLight);
    shopPointLights.push(ptLight);

    lightingFixturesGroup.add(pend);
  });

  // 2 Ornate Wall Lamps (West & East Open Front Wall Bays)
  const wallLampCoords: {pos: [number, number, number]; side: number}[] = [
    {pos: [-4.22, 2.25, 2.95], side: 1},
    {pos: [4.22, 2.25, 2.85], side: -1},
  ];
  wallLampCoords.forEach((wl) => {
    const sconce = new THREE.Group();
    sconce.position.set(...wl.pos);

    const backplate = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.26, 0.16),
      brassMat,
    );
    sconce.add(backplate);

    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.035, 0.035),
      brassMat,
    );
    arm.position.set(wl.side * 0.11, 0, 0);
    sconce.add(arm);

    const lantern = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.065, 0.22, 8),
      new THREE.MeshBasicMaterial({color: '#FDE047'}),
    );
    lantern.position.set(wl.side * 0.2, 0.08, 0);
    sconce.add(lantern);
    addInkOutline(lantern, inkMaterial, inkLineObjects);

    lightingFixturesGroup.add(sconce);
  });

  // ==========================================================================
  // 12. REUSABLE DUST PARTICLES IN LIGHT & SPARKLE GLINTS EFFECT (1)
  // ==========================================================================
  const dustParticlesGroup = new THREE.Group();
  dustParticlesGroup.name = 'VolumetricLightDustAndSparkles';
  rootGroup.add(dustParticlesGroup);

  const dustSpecs: DustParticleSpec[] = generateDeterministicDustParticles(120);
  const moteGeo = new THREE.SphereGeometry(0.016, 6, 6);
  const sparkleGeo = new THREE.OctahedronGeometry(0.038, 0);
  const moteMat = new THREE.MeshBasicMaterial({
    color: '#FEF08A',
    transparent: true,
    opacity: 0.78,
  });
  const sparkleMat = new THREE.MeshBasicMaterial({
    color: '#FFFFFF',
    transparent: true,
    opacity: 0.92,
  });

  const dustMeshes: THREE.Mesh[] = dustSpecs.map((spec) => {
    const mesh = new THREE.Mesh(
      spec.isSparkleStar ? sparkleGeo : moteGeo,
      spec.isSparkleStar ? sparkleMat : moteMat,
    );
    mesh.position.set(spec.baseX, spec.baseY, spec.baseZ);
    dustParticlesGroup.add(mesh);
    return mesh;
  });

  // Scene Global Illumination
  const hemiLight = new THREE.HemisphereLight('#FFFBEB', '#451A03', 1.75);
  rootGroup.add(hemiLight);

  const keyLight = new THREE.DirectionalLight('#FFF7ED', 2.2);
  keyLight.position.set(2.5, 5.5, 4.2);
  rootGroup.add(keyLight);

  const rimLight = new THREE.DirectionalLight('#FDE047', 1.35);
  rimLight.position.set(-3.2, 3.8, -2.5);
  rootGroup.add(rimLight);

  // Mount 3D Articulated Character Cast inside Crack & Sons Shop
  const threeShopCast = buildThreeSceneCastDirector('crack-and-sons-shop');
  rootGroup.add(threeShopCast.rootGroup);

  // Apply full Main Street Cel-Shaded Toon & Inverted Comic Ink Hull Style across all shop meshes
  const {inkLineObjects: extraInkObjects, disposeStyleResources} =
    applyMainStreetStyleToSceneGraph(rootGroup);
  for (const obj of extraInkObjects) {
    if (!inkLineObjects.includes(obj)) {
      inkLineObjects.push(obj);
    }
  }

  return {
    rootGroup,
    inkLineObjects,
    updateForFrame: ({
      frame,
      fps,
      lightMood,
      inkOutlinesEnabled,
      dustIntensity,
      wireframeMode,
      doorControlMode = 'timeline-auto',
      manualDoorOpenProgress = 1.0,
    }) => {
      // 1. Update Ink Outlines
      for (const line of inkLineObjects) {
        line.visible = inkOutlinesEnabled && !wireframeMode;
      }

      // 2. Update Lighting Mood
      if (lightMood === 'warm-boutique') {
        hemiLight.intensity = 1.85;
        keyLight.intensity = 2.25;
        volumetricConeMat.opacity = 0.085 * dustIntensity;
        shopPointLights.forEach((l) => {
          l.intensity = 2.4;
        });
      } else if (lightMood === 'festive-golden') {
        hemiLight.intensity = 2.1;
        keyLight.intensity = 2.8;
        volumetricConeMat.opacity = 0.12 * dustIntensity;
        shopPointLights.forEach((l) => {
          l.intensity = 3.1;
        });
      } else {
        // closing-twilight
        hemiLight.intensity = 1.15;
        keyLight.intensity = 1.25;
        volumetricConeMat.opacity = 0.14 * dustIntensity;
        shopPointLights.forEach((l) => {
          l.intensity = 2.9;
        });
      }

      // 3. Deterministic 60fps 2D Store Commercial Animation on TVs
      if (tvAdCtx) {
        const adState = evaluateStoreTvAdStateAtFrame(frame, fps);
        render2DStoreAdvertisementCanvas(tvAdCtx, 512, 320, adState, frame);
        tvAdTexture.needsUpdate = true;
      }

      // 4. Deterministic Hero Nutcracker & Display Regiment Jaw Clacking & Eyes
      const heroPose = evaluateHeroNutcrackerPoseAtFrame(frame, fps);
      heroDollHandle.group.rotation.y = heroPose.pedestalRotationY;
      heroDollHandle.jawPivot.rotation.x = heroPose.jawAngleRad;
      heroDollHandle.leverPivot.rotation.x = -heroPose.leverAngleRad;
      heroDollHandle.headGroup.rotation.y = heroPose.headTurnYawRad;
      heroDollHandle.eyesGroup.position.x = heroPose.eyeShiftX;

      displayDollHandles.forEach(({spec, handle}) => {
        const localPose = evaluateHeroNutcrackerPoseAtFrame(
          frame + Math.round(spec.jawPhaseOffset * 20),
          fps,
        );
        handle.jawPivot.rotation.x = localPose.jawAngleRad * 0.75;
        handle.leverPivot.rotation.x = -localPose.leverAngleRad * 0.75;
        handle.eyesGroup.position.x = localPose.eyeShiftX * 0.8;
      });

      // 5. Rigged Shop Entrance Door, Turning Brass Handle, Retracting Latch Bolt & Doorbell
      const t = frame / Math.max(1, fps);
      const doorRigState = evaluateShopDoorRigState({
        frame,
        fps,
        mode: doorControlMode,
        manualProgress01: manualDoorOpenProgress,
      });

      handleSpindlePivot.rotation.z = doorRigState.handleTurnAngleRad;
      latchBoltMesh.position.x = -0.138 + doorRigState.latchRetractionMeters;
      doorHingePivot.rotation.y = doorRigState.doorSwingAngleRad;
      wreathGroup.rotation.z = doorRigState.wreathSwayAngleRad;

      coiledSpring.scale.y = 1 + Math.sin(t * 24.0) * 0.16 * doorRigState.doorbellRingIntensity;
      strikerArm.rotation.z =
        -0.5 +
        Math.sin(t * 28.0) * (0.04 + 0.28 * doorRigState.doorbellRingIntensity);
      doorbellChimeRing.visible = doorRigState.doorbellRingIntensity > 0.05;
      const chimeScale = 0.85 + 0.55 * doorRigState.doorbellRingIntensity;
      doorbellChimeRing.scale.set(chimeScale, chimeScale, 1);

      // 6. Update Reusable Volumetric Dust Particles & 4-Point Sparkles
      dustParticlesGroup.visible = dustIntensity > 0.02;
      for (let i = 0; i < dustSpecs.length; i++) {
        const st = evaluateDustParticleAtFrame(dustSpecs[i], frame, fps);
        const mesh = dustMeshes[i];
        mesh.position.set(st.x, st.y, st.z);
        mesh.scale.setScalar(st.scale * dustIntensity);
        if (dustSpecs[i].isSparkleStar) {
          mesh.rotation.y = t * 2.2 + i;
          mesh.rotation.z = t * 1.5;
        }
      }

      // 7. Update 3D Character Cast inside Crack & Sons Shop
      threeShopCast.updateAtFrame(frame, fps);

      // 8. Wireframe debug toggle
      rootGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material;
          if (mat && 'wireframe' in mat) {
            (mat as THREE.MeshToonMaterial).wireframe = wireframeMode;
          }
        }
      });
    },
    dispose: () => {
      threeShopCast.dispose();
      disposeStyleResources();
      inkMaterial.dispose();
      disposableTextures.forEach((t) => t.dispose());
    },
  };
}
