import * as THREE from 'three';
import {
  GarageDoorModeId,
  GarageLaunchModeId,
  GarageLightRevealModeId,
  evaluateGarageLaunchStateAtFrame,
} from './garage-nuclear-launch-manifest';
import {
  applyMainStreetStyleToSceneGraph,
  convertStandardToMainStreetToonMaterial,
  createMainStreetExteriorVistaTexture,
  createMainStreetToonGradientTexture,
  drawMainStreetComicHatchAndBorderOverlay,
} from './main-street-style-engine';
import { buildThreeSceneCastDirector } from './characters/three-scene-cast-director';

export interface GarageInspectableMeta {
  id: string;
  label: string;
  category: string;
  target: [number, number, number];
  optimalDistance: number;
  cameraPosition?: [number, number, number];
}

export interface GarageNuclearSceneHandle {
  rootGroup: THREE.Group;
  inkLineObjects: THREE.Object3D[];
  updateForFrame: (params: {
    frame: number;
    fps: number;
    doorMode: GarageDoorModeId;
    launchMode: GarageLaunchModeId;
    lightRevealMode: GarageLightRevealModeId;
    vfxIntensity: number;
    inkOutlinesEnabled?: boolean;
    wireframeMode: boolean;
  }) => void;
  dispose: () => void;
}

function attachInspectable(
  obj: THREE.Object3D,
  meta: GarageInspectableMeta,
): void {
  obj.userData.inspectable = meta;
}

/**
 * Procedural Texture Set #1: Floor Stains and Cracks (1 Texture Set)
 * Aged garage concrete slab with expansion joints, oil stains, tire marks, and cracks.
 */
function createGarageFloorStainsAndCracksTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#525864';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle aggregate speckle
    for (let i = 0; i < 2200; i++) {
      const rx = ((i * 197) % 1019) + 2;
      const ry = ((i * 353) % 1019) + 2;
      ctx.fillStyle =
        i % 2 === 0 ? 'rgba(30,41,59,0.24)' : 'rgba(148,163,184,0.18)';
      ctx.fillRect(rx, ry, 3, 3);
    }

    // Concrete slab expansion joints (4x4 grid)
    ctx.strokeStyle = '#272B33';
    ctx.lineWidth = 5;
    for (const pos of [256, 512, 768]) {
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, 1024);
      ctx.moveTo(0, pos);
      ctx.lineTo(1024, pos);
      ctx.stroke();
    }

    // Dark motor-oil stains & grease puddles
    const stains: Array<[number, number, number, string]> = [
      [512, 480, 145, 'rgba(15, 23, 42, 0.62)'],
      [440, 540, 95, 'rgba(17, 24, 39, 0.55)'],
      [630, 390, 82, 'rgba(30, 27, 24, 0.48)'],
      [280, 690, 110, 'rgba(20, 25, 35, 0.45)'],
      [770, 640, 90, 'rgba(24, 24, 27, 0.5)'],
      [210, 310, 85, 'rgba(15, 23, 42, 0.48)'],
    ];
    for (const [sx, sy, sr, col] of stains) {
      const grad = ctx.createRadialGradient(sx, sy, sr * 0.1, sx, sy, sr);
      grad.addColorStop(0, col);
      grad.addColorStop(0.65, col);
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rubber tire skid marks leading toward garage door
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.lineWidth = 18;
    for (const tx of [420, 604]) {
      ctx.beginPath();
      ctx.moveTo(tx, 340);
      ctx.lineTo(tx, 960);
      ctx.stroke();
    }

    // Branching floor cracks
    ctx.strokeStyle = '#1E2229';
    ctx.lineWidth = 3.5;
    const crackPaths: Array<Array<[number, number]>> = [
      [
        [512, 512],
        [455, 435],
        [390, 410],
        [310, 355],
      ],
      [
        [455, 435],
        [470, 360],
      ],
      [
        [512, 680],
        [595, 725],
        [680, 790],
        [745, 815],
      ],
      [
        [240, 220],
        [310, 265],
        [355, 245],
        [410, 290],
      ],
    ];
    for (const path of crackPaths) {
      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][0], path[i][1]);
      }
      ctx.stroke();
    }
    drawMainStreetComicHatchAndBorderOverlay(ctx, 1024, 1024, {
      hatchCount: 36,
      borderWidth: 8,
      hatchAlpha: 0.38,
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural Diamond-Plate Steel + Hazard Stripes Texture for the Twin Sub-Floor Silo Hatch Doors.
 */
function createSiloHatchDoorTexture(side: 'left' | 'right'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Gunmetal diamond-plate steel base
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 512, 1024);

    // Cel-shaded shadow bands
    ctx.fillStyle = '#263142';
    ctx.fillRect(0, 0, 512, 120);
    ctx.fillRect(0, 904, 512, 120);

    // Diamond tread pattern
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 3;
    for (let y = 80; y < 944; y += 36) {
      for (let x = 32; x < 480; x += 36) {
        ctx.beginPath();
        if (((x + y) / 36) % 2 === 0) {
          ctx.moveTo(x - 8, y - 8);
          ctx.lineTo(x + 8, y + 8);
        } else {
          ctx.moveTo(x + 8, y - 8);
          ctx.lineTo(x - 8, y + 8);
        }
        ctx.stroke();
      }
    }

    // Yellow & black diagonal hazard stripe border along the center parting edge
    const hazardX = side === 'left' ? 436 : 0;
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(hazardX, 0, 76, 1024);
    ctx.fillStyle = '#0A0812';
    for (let y = -80; y < 1080; y += 64) {
      ctx.beginPath();
      ctx.moveTo(hazardX, y);
      ctx.lineTo(hazardX + 76, y + 36);
      ctx.lineTo(hazardX + 76, y + 68);
      ctx.lineTo(hazardX, y + 32);
      ctx.closePath();
      ctx.fill();
    }

    // Heavy structural steel cross-ribs & rivets
    ctx.strokeStyle = '#0A0812';
    ctx.lineWidth = 6;
    for (const ry of [180, 512, 844]) {
      ctx.fillStyle = '#475569';
      ctx.fillRect(16, ry - 22, 412, 44);
      ctx.strokeRect(16, ry - 22, 412, 44);
    }

    // Stenciled Warning Text
    ctx.save();
    ctx.translate(220, 512);
    ctx.rotate(side === 'left' ? -Math.PI / 2 : Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 42px monospace';
    ctx.fillText('DANGER: SUB-FLOOR SILO', 0, -28);
    ctx.fillStyle = '#F97316';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('STAND CLEAR OF HATCH', 0, 26);
    ctx.restore();

    drawMainStreetComicHatchAndBorderOverlay(ctx, 512, 1024, {
      hatchCount: 24,
      borderWidth: 10,
      addHalftoneCornerDots: true,
      halftoneColor: '#FACC15',
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural Cinderblock Wall Texture for the Garage Shell (Main Street Lo-Fi Cel-Shaded Style).
 */
function createCinderblockWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#3E4756';
    ctx.fillRect(0, 0, 512, 92);
    ctx.fillRect(0, 396, 512, 116);
    const rows = 8;
    const cols = 4;
    const rh = 512 / rows;
    const cw = 512 / cols;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (cw / 2);
      for (let c = -1; c <= cols; c++) {
        const x = c * cw + offset;
        const y = r * rh;
        ctx.fillStyle = (r + c) % 2 === 0 ? '#525E6E' : '#475261';
        ctx.fillRect(x + 3, y + 3, cw - 6, rh - 6);
        ctx.strokeStyle = '#0A0812';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(x, y, cw, rh);
      }
    }
    drawMainStreetComicHatchAndBorderOverlay(ctx, 512, 512, {
      hatchCount: 22,
      borderWidth: 0,
      hatchAlpha: 0.34,
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural Blueprint & Garage Wall Poster Texture ("SUB-FLOOR SILO MK-IV" / Speed Shop / Safety Board).
 */
function createGarageWallPosterTexture(
  variant: 'silo-blueprint' | 'speed-shop-banner' | 'safety-scoreboard',
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (variant === 'silo-blueprint') {
      ctx.fillStyle = '#0C4A6E';
      ctx.fillRect(0, 0, 512, 384);
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.25)';
      ctx.lineWidth = 2;
      for (let x = 0; x < 512; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 384);
        ctx.stroke();
      }
      for (let y = 0; y < 384; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
      ctx.strokeStyle = '#E0F2FE';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 472, 344);
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 26px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TOP SECRET: SUB-FLOOR SILO MK-IV', 256, 58);
      // Draw schematic of scissor lift + nuke + parting floor doors
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 4;
      ctx.strokeRect(110, 110, 292, 210);
      // Scissor X-arms
      ctx.beginPath();
      ctx.moveTo(150, 305);
      ctx.lineTo(362, 210);
      ctx.moveTo(362, 305);
      ctx.lineTo(150, 210);
      ctx.stroke();
      // Rocket silhouette
      ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
      ctx.fillRect(185, 138, 142, 54);
      ctx.strokeRect(185, 138, 142, 54);
      ctx.fillStyle = '#E0F2FE';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('HATCH OPEN ANGLE: 26° • LIFT STROKE: 2.35M', 256, 346);
    } else if (variant === 'speed-shop-banner') {
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(0, 0, 512, 384);
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(18, 18, 476, 72);
      ctx.fillStyle = '#0A0812';
      ctx.font = 'bold 38px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CRACK & SONS GARAGE', 256, 68);
      ctx.fillStyle = '#FEF3C7';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('CUSTOM ROCKETRY & LUBE', 256, 155);
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 26px monospace';
      ctx.fillText('• HYDRAULIC SILO INSTALLS', 256, 225);
      ctx.fillText('• ANVIL & TURBINE TUNING', 256, 270);
      ctx.fillText('• 24-HR LAUNCH ROAD SERVICE', 256, 315);
    } else {
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(0, 0, 512, 384);
      ctx.fillStyle = '#166534';
      ctx.fillRect(16, 16, 480, 74);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ SHOP SAFETY RECORD', 256, 65);
      ctx.fillStyle = '#0A0812';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('DAYS SINCE LAST ACCIDENTAL', 256, 138);
      ctx.fillText('SUB-FLOOR SILO LAUNCH:', 256, 174);
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(176, 198, 160, 136);
      ctx.strokeStyle = '#0A0812';
      ctx.lineWidth = 6;
      ctx.strokeRect(176, 198, 160, 136);
      ctx.fillStyle = '#FEF08A';
      ctx.font = 'bold 98px monospace';
      ctx.fillText('0', 256, 300);
    }
    drawMainStreetComicHatchAndBorderOverlay(ctx, 512, 384, {
      hatchCount: 16,
      borderWidth: 10,
      addHalftoneCornerDots: true,
      halftoneColor: '#FACC15',
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural Texture Set #2: Nuke Warning Markings (1 Texture Set)
 */
function createNukeWarningMarkingsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#334155');
    grad.addColorStop(0.5, '#475569');
    grad.addColorStop(1, '#1E293B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    for (const bandY of [18, 444]) {
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(0, bandY, 1024, 50);
      ctx.fillStyle = '#090D16';
      for (let x = -60; x < 1080; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, bandY);
        ctx.lineTo(x + 32, bandY);
        ctx.lineTo(x + 8, bandY + 50);
        ctx.lineTo(x - 24, bandY + 50);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.fillStyle = '#94A3B8';
    for (let x = 24; x < 1024; x += 32) {
      ctx.beginPath();
      ctx.arc(x, 82, 4, 0, Math.PI * 2);
      ctx.arc(x, 428, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const cx of [220, 740]) {
      const cy = 256;
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(cx, cy, 86, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#090D16';
      ctx.stroke();

      ctx.fillStyle = '#090D16';
      for (let b = 0; b < 3; b++) {
        const a0 = (b * Math.PI * 2) / 3 - Math.PI / 6;
        const a1 = a0 + Math.PI / 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 68, a0, a1);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#090D16';
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('ACME-9000 MEGA-GAG', 480, 195);

    ctx.fillStyle = '#EF4444';
    ctx.fillRect(330, 218, 300, 56);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.strokeRect(330, 218, 300, 56);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('DO NOT DROP!!', 480, 258);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('YIELD: 100% COMEDY • HANDLE WITH CARE', 480, 325);
    drawMainStreetComicHatchAndBorderOverlay(ctx, 1024, 512, {
      hatchCount: 24,
      borderWidth: 6,
      addHalftoneCornerDots: true,
      halftoneColor: '#FACC15',
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural Texture for the Separate Cardboard “NUKE LAUNCH” Sign (1).
 */
function createCardboardNukeLaunchSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#B4824E';
    ctx.fillRect(0, 0, 512, 384);

    ctx.strokeStyle = 'rgba(120, 72, 32, 0.32)';
    ctx.lineWidth = 3;
    for (let y = 0; y < 384; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(12, 12, 95, 34);
    ctx.fillRect(405, 12, 95, 34);
    ctx.fillRect(12, 338, 95, 34);
    ctx.fillRect(405, 338, 95, 34);

    ctx.strokeStyle = '#1E1B18';
    ctx.lineWidth = 8;
    ctx.strokeRect(24, 24, 464, 336);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 58px sans-serif';
    ctx.fillText('NUKE LAUNCH', 256, 122);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText('UNDERGROUND SILO #1', 256, 182);

    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(95, 255);
    ctx.lineTo(310, 255);
    ctx.lineTo(310, 222);
    ctx.lineTo(420, 275);
    ctx.lineTo(310, 328);
    ctx.lineTo(310, 295);
    ctx.lineTo(95, 295);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('WATCH FLOOR HATCH!', 215, 283);

    drawMainStreetComicHatchAndBorderOverlay(ctx, 512, 384, {
      hatchCount: 16,
      borderWidth: 8,
      addHalftoneCornerDots: true,
      halftoneColor: '#EF4444',
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Live 60fps Canvas Renderer for the Hype Man's Cardboard Countdown Sign (1).
 */
function renderCardboardCountdownCanvas(
  ctx: CanvasRenderingContext2D,
  digitText: string,
  subtext: string,
  accentHex: string,
): void {
  const w = 512;
  const h = 512;

  ctx.fillStyle = '#BA8753';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(115, 68, 28, 0.34)';
  ctx.lineWidth = 3;
  for (let y = 0; y < h; y += 9) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(175, 8, 162, 34);
  ctx.fillRect(175, 470, 162, 34);

  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 10;
  ctx.strokeRect(22, 22, w - 44, h - 44);

  ctx.fillStyle = '#111827';
  ctx.fillRect(36, 48, w - 72, 66);
  ctx.fillStyle = '#FACC15';
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📣 HYPE MAN SILO SIGN', w / 2, 93);

  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(46, 138, w - 92, 210);
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 10;
  ctx.strokeRect(46, 138, w - 92, 210);

  ctx.fillStyle = accentHex;
  ctx.font = 'bold 72px sans-serif';
  ctx.fillText(digitText, w / 2, 272);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(subtext, w / 2, 412);
  drawMainStreetComicHatchAndBorderOverlay(ctx, w, h, {
    hatchCount: 16,
    borderWidth: 8,
    addHalftoneCornerDots: true,
    halftoneColor: accentHex,
  });
}

export function buildGarageNuclearLaunchScene(): GarageNuclearSceneHandle {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'GarageNuclearLaunchSceneRoot';

  const geometriesToDispose: THREE.BufferGeometry[] = [];
  const materialsToDispose: THREE.Material[] = [];
  const texturesToDispose: THREE.Texture[] = [];

  const grad3 = createMainStreetToonGradientTexture(3);
  const grad4 = createMainStreetToonGradientTexture(4);
  texturesToDispose.push(grad3, grad4);

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometriesToDispose.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    const converted = convertStandardToMainStreetToonMaterial(
      m,
      grad3,
      grad4,
    ) as T;
    if (converted !== m) {
      m.dispose();
    }
    materialsToDispose.push(converted);
    return converted;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    texturesToDispose.push(t);
    return t;
  };

  // =========================================================================
  // 1. GARAGE SHELL (1) + SPLIT CONCRETE FLOOR AROUND SUB-FLOOR SILO OPENING
  // Garage dimensions: X in [-4.3, +4.3] (8.6m), Z in [-3.6, +3.6] (7.2m), Y in [0, 3.8]
  // Sub-Floor Silo Opening at center: X in [-0.88, +0.88] (1.76m), Z in [-1.62, +0.92] (2.54m)
  // =========================================================================
  const garageShellGroup = new THREE.Group();
  garageShellGroup.name = 'GarageShellAndStainedFloor';
  rootGroup.add(garageShellGroup);

  const floorTex = trackTex(createGarageFloorStainsAndCracksTexture());
  const floorMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.72,
      metalness: 0.08,
    }),
  );

  // 4 Surrounding Concrete Floor Slab Sections leaving the 1.76m x 2.54m Silo Pit Opening
  // West Slab: X in [-4.3, -0.88] (width 3.42m), Z in [-3.6, +3.6] (depth 7.2m)
  const floorWestSlab = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(3.42, 7.2)),
    floorMat,
  );
  floorWestSlab.rotation.x = -Math.PI / 2;
  floorWestSlab.position.set(-2.59, 0, 0);
  garageShellGroup.add(floorWestSlab);

  // East Slab: X in [+0.88, +4.3] (width 3.42m), Z in [-3.6, +3.6] (depth 7.2m)
  const floorEastSlab = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(3.42, 7.2)),
    floorMat,
  );
  floorEastSlab.rotation.x = -Math.PI / 2;
  floorEastSlab.position.set(2.59, 0, 0);
  garageShellGroup.add(floorEastSlab);

  // North Slab (behind pit): X in [-0.88, +0.88] (width 1.76m), Z in [-3.6, -1.62] (depth 1.98m)
  const floorNorthSlab = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(1.76, 1.98)),
    floorMat,
  );
  floorNorthSlab.rotation.x = -Math.PI / 2;
  floorNorthSlab.position.set(0, 0, -2.61);
  garageShellGroup.add(floorNorthSlab);

  // South Slab (in front of pit): X in [-0.88, +0.88] (width 1.76m), Z in [+0.92, +3.6] (depth 2.68m)
  const floorSouthSlab = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(1.76, 2.68)),
    floorMat,
  );
  floorSouthSlab.rotation.x = -Math.PI / 2;
  floorSouthSlab.position.set(0, 0, 2.26);
  garageShellGroup.add(floorSouthSlab);

  const wallTex = trackTex(createCinderblockWallTexture());
  const wallMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.78,
      metalness: 0.06,
    }),
  );
  const darkSteelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.38,
      metalness: 0.78,
    }),
  );
  const galvSteelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#94A3B8',
      roughness: 0.28,
      metalness: 0.85,
    }),
  );
  const hazardYellowMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#FACC15',
      roughness: 0.3,
      metalness: 0.5,
    }),
  );
  const crimsonRedMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#DC2626',
      roughness: 0.28,
      metalness: 0.45,
    }),
  );
  const brassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#EAB308',
      roughness: 0.25,
      metalness: 0.82,
    }),
  );
  const hardwoodOakMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#9A6334',
      roughness: 0.58,
      metalness: 0.08,
    }),
  );

  // Back Wall (North, Z = -3.6)
  const backWall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(8.6, 3.8, 0.16)),
    wallMat,
  );
  backWall.position.set(0, 1.9, -3.6);
  garageShellGroup.add(backWall);

  // Left Wall (West, X = -4.3)
  const leftWall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.16, 3.8, 7.2)),
    wallMat,
  );
  leftWall.position.set(-4.3, 1.9, 0);
  garageShellGroup.add(leftWall);

  // Right Wall (East, X = +4.3)
  const rightWall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.16, 3.8, 7.2)),
    wallMat,
  );
  rightWall.position.set(4.3, 1.9, 0);
  garageShellGroup.add(rightWall);

  // Concrete Baseboard Plinths & Structural Wall Pilasters for 1000x Architectural Detail
  for (const px of [-4.18, 4.18]) {
    for (const pz of [-2.4, 0.0, 2.4]) {
      const pilaster = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.14, 3.72, 0.22)),
        darkSteelMat,
      );
      pilaster.position.set(px, 1.86, pz);
      garageShellGroup.add(pilaster);
    }
  }

  // Front Garage Door Wall Framing (South, Z = +3.52, with 4.8m × 2.68m opening)
  const frontPillarLeft = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.9, 3.8, 0.18)),
    wallMat,
  );
  frontPillarLeft.position.set(-3.35, 1.9, 3.52);
  garageShellGroup.add(frontPillarLeft);

  const frontPillarRight = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.9, 3.8, 0.18)),
    wallMat,
  );
  frontPillarRight.position.set(3.35, 1.9, 3.52);
  garageShellGroup.add(frontPillarRight);

  const frontHeader = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(5.0, 1.12, 0.18)),
    wallMat,
  );
  frontHeader.position.set(0, 3.24, 3.52);
  garageShellGroup.add(frontHeader);

  // Exterior twilight sky & driveway apron beyond open garage door (Z > 3.6)
  const drivewayApron = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(9.5, 4.5)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#1E293B',
        roughness: 0.85,
      }),
    ),
  );
  drivewayApron.rotation.x = -Math.PI / 2;
  drivewayApron.position.set(0, -0.01, 5.75);
  garageShellGroup.add(drivewayApron);

  const exteriorVistaTex = trackTex(
    createMainStreetExteriorVistaTexture('twilight-street'),
  );
  const exteriorSkyBackdrop = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(11.0, 5.2)),
    trackMat(
      new THREE.MeshBasicMaterial({
        map: exteriorVistaTex,
        side: THREE.DoubleSide,
      }),
    ),
  );
  exteriorSkyBackdrop.position.set(0, 2.2, 6.8);
  garageShellGroup.add(exteriorSkyBackdrop);

  // Garage Ceiling, Exposed Timber Rafters & Steel Roof Truss Webbing
  const ceilingSlab = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(8.6, 0.12, 7.2)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#1E293B',
        roughness: 0.85,
      }),
    ),
  );
  ceilingSlab.position.set(0, 3.8, 0);
  garageShellGroup.add(ceilingSlab);

  const rafterMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#452715',
      roughness: 0.68,
    }),
  );
  for (const rz of [-2.8, -1.8, -0.8, 0.2, 1.2, 2.2, 3.1]) {
    const beam = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(8.4, 0.18, 0.12)),
      rafterMat,
    );
    beam.position.set(0, 3.66, rz);
    garageShellGroup.add(beam);

    // Steel gusset plates & diagonal knee braces at both ends of each rafter
    for (const side of [-1, 1]) {
      const brace = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.06, 0.65, 0.06)),
        darkSteelMat,
      );
      brace.position.set(side * 3.92, 3.35, rz);
      brace.rotation.z = side * 0.68;
      garageShellGroup.add(brace);
    }
  }

  // Longitudinal steel purlins across the ceiling
  for (const px of [-2.8, -1.1, 1.1, 2.8]) {
    const purlin = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.07, 0.08, 7.0)),
      darkSteelMat,
    );
    purlin.position.set(px, 3.72, 0);
    garageShellGroup.add(purlin);
  }

  // =========================================================================
  // 1B. SUB-FLOOR NUCLEAR SILO PIT, TWIN ANIMATED DIAMOND-PLATE HATCH DOORS
  //     & HYDRAULIC SCISSOR-LIFT ELEVATOR PLATFORM
  //     ("do not shoow the nuke.... Make a aniamtion of it the ground opens up a littly bit and it comes out!")
  // =========================================================================
  const subFloorSiloGroup = new THREE.Group();
  subFloorSiloGroup.name = 'SubFloorNuclearSiloAndHatchGroup';
  subFloorSiloGroup.position.set(0, 0, -0.35);
  attachInspectable(subFloorSiloGroup, {
    id: 'sub-floor-nuclear-silo-hatch',
    label:
      'Sub-Floor Nuclear Silo Hatch Doors (2), Hydraulic Scissor-Lift Elevator & Underground Bunker Pit',
    category: 'Animated Ground Silo Hatch & Hydraulic Lift',
    target: [0.0, 0.15, -0.35],
    optimalDistance: 2.55,
    cameraPosition: [1.85, 1.52, 1.55],
  });
  rootGroup.add(subFloorSiloGroup);

  const bunkerPitWallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#1E293B',
      roughness: 0.72,
      metalness: 0.35,
    }),
  );

  // Underground Silo Pit Chamber Walls (X in [-0.88, +0.88], Z in [-1.27, +1.27] relative to -0.35, depth 2.38m)
  const pitFloor = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.88, 0.12, 2.66)),
    bunkerPitWallMat,
  );
  pitFloor.position.set(0, -2.38, 0);
  subFloorSiloGroup.add(pitFloor);

  const pitWallLeft = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.1, 2.38, 2.66)),
    bunkerPitWallMat,
  );
  pitWallLeft.position.set(-0.91, -1.19, 0);
  subFloorSiloGroup.add(pitWallLeft);

  const pitWallRight = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.1, 2.38, 2.66)),
    bunkerPitWallMat,
  );
  pitWallRight.position.set(0.91, -1.19, 0);
  subFloorSiloGroup.add(pitWallRight);

  const pitWallBack = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.88, 2.38, 0.1)),
    bunkerPitWallMat,
  );
  pitWallBack.position.set(0, -1.19, -1.3);
  subFloorSiloGroup.add(pitWallBack);

  const pitWallFront = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.88, 2.38, 0.1)),
    bunkerPitWallMat,
  );
  pitWallFront.position.set(0, -1.19, 1.3);
  subFloorSiloGroup.add(pitWallFront);

  // Internal Glowing Subterranean Strip Bars & Hazard Ribs inside the Pit
  const pitGlowStripMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#F97316',
    }),
  );
  for (const sideX of [-0.84, 0.84]) {
    for (const py of [-0.45, -1.15, -1.85]) {
      const strip = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.03, 0.08, 2.35)),
        pitGlowStripMat,
      );
      strip.position.set(sideX, py, 0);
      subFloorSiloGroup.add(strip);
    }
  }

  const siloPitPointLight = new THREE.PointLight('#F97316', 5.5, 6.5, 1.2);
  siloPitPointLight.position.set(0, -0.85, -0.35);
  rootGroup.add(siloPitPointLight);

  // Hazard Steel Curb Frame around the Silo Floor Opening at Y = 0.015
  const curbFront = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.96, 0.035, 0.1)),
    hazardYellowMat,
  );
  curbFront.position.set(0, 0.017, 1.31);
  subFloorSiloGroup.add(curbFront);

  const curbBack = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.96, 0.035, 0.1)),
    hazardYellowMat,
  );
  curbBack.position.set(0, 0.017, -1.31);
  subFloorSiloGroup.add(curbBack);

  const curbLeft = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.1, 0.035, 2.54)),
    hazardYellowMat,
  );
  curbLeft.position.set(-0.93, 0.017, 0);
  subFloorSiloGroup.add(curbLeft);

  const curbRight = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.1, 0.035, 2.54)),
    hazardYellowMat,
  );
  curbRight.position.set(0.93, 0.017, 0);
  subFloorSiloGroup.add(curbRight);

  // 4 Corner Rotary Warning Strobe Beacons around the Silo Curb
  const beaconDomeMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#EF4444',
    }),
  );
  const cornerBeaconPositions: Array<[number, number]> = [
    [-0.95, -1.32],
    [0.95, -1.32],
    [-0.95, 1.32],
    [0.95, 1.32],
  ];
  const beaconMeshes: THREE.Mesh[] = [];
  for (const [bx, bz] of cornerBeaconPositions) {
    const base = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.065, 0.075, 0.05, 14)),
      darkSteelMat,
    );
    base.position.set(bx, 0.04, bz);
    subFloorSiloGroup.add(base);

    const dome = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.052, 14, 12)),
      beaconDomeMat,
    );
    dome.position.set(bx, 0.085, bz);
    subFloorSiloGroup.add(dome);
    beaconMeshes.push(dome);
  }

  // Twin Animated Diamond-Plate Ground Hatch Doors (Left & Right Leaves)
  const leftHatchTex = trackTex(createSiloHatchDoorTexture('left'));
  const rightHatchTex = trackTex(createSiloHatchDoorTexture('right'));

  const leftSiloHatchPivot = new THREE.Group();
  leftSiloHatchPivot.position.set(-0.88, 0.02, 0);
  subFloorSiloGroup.add(leftSiloHatchPivot);

  const leftHatchLeaf = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.88, 0.055, 2.52)),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: leftHatchTex,
        roughness: 0.42,
        metalness: 0.68,
      }),
    ),
  );
  // Offset +0.44 in X from left hinge so when closed it covers [-0.88, 0]
  leftHatchLeaf.position.set(0.44, 0, 0);
  leftSiloHatchPivot.add(leftHatchLeaf);

  const rightSiloHatchPivot = new THREE.Group();
  rightSiloHatchPivot.position.set(0.88, 0.02, 0);
  subFloorSiloGroup.add(rightSiloHatchPivot);

  const rightHatchLeaf = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.88, 0.055, 2.52)),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: rightHatchTex,
        roughness: 0.42,
        metalness: 0.68,
      }),
    ),
  );
  // Offset -0.44 in X from right hinge so when closed it covers [0, +0.88]
  rightHatchLeaf.position.set(-0.44, 0, 0);
  rightSiloHatchPivot.add(rightHatchLeaf);

  // 16 Subterranean Steam Puffs venting out of the opening ground hatch seam
  const siloSteamMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#F1F5F9',
      emissive: '#F97316',
      emissiveIntensity: 0.32,
      roughness: 0.9,
      transparent: true,
      opacity: 0.68,
    }),
  );
  const siloSteamGeo = trackGeo(new THREE.SphereGeometry(0.14, 12, 12));
  const siloSteamPuffs: THREE.Mesh[] = [];
  for (let i = 0; i < 16; i++) {
    const sp = new THREE.Mesh(siloSteamGeo, siloSteamMat);
    subFloorSiloGroup.add(sp);
    siloSteamPuffs.push(sp);
  }

  // Hydraulic Scissor-Lift Elevator Platform inside the pit
  const siloElevatorPlatformGroup = new THREE.Group();
  siloElevatorPlatformGroup.position.set(0, -2.35, 0);
  subFloorSiloGroup.add(siloElevatorPlatformGroup);

  const elevatorDeckMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.52, 0.08, 2.32)),
    hazardYellowMat,
  );
  elevatorDeckMesh.position.set(0, -0.04, 0);
  siloElevatorPlatformGroup.add(elevatorDeckMesh);

  // Twin telescoping chrome hydraulic lift rams beneath the platform
  const hydraulicRams: THREE.Mesh[] = [];
  for (const rz of [-0.68, 0.68]) {
    const outerCyl = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.095, 0.105, 1.25, 16)),
      darkSteelMat,
    );
    outerCyl.position.set(0, -1.75, rz);
    subFloorSiloGroup.add(outerCyl);

    const chromePiston = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.065, 0.065, 2.25, 16)),
      galvSteelMat,
    );
    chromePiston.position.set(0, -1.15, rz);
    siloElevatorPlatformGroup.add(chromePiston);
    hydraulicRams.push(chromePiston);
  }

  // 4 Scissor-Lift X-Arm Struts
  const scissorArms: THREE.Mesh[] = [];
  for (const sx of [-0.62, 0.62]) {
    for (const dir of [-1, 1]) {
      const arm = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.05, 2.15, 0.09)),
        crimsonRedMat,
      );
      arm.position.set(sx, -1.05, 0);
      arm.rotation.x = dir * 0.42;
      siloElevatorPlatformGroup.add(arm);
      scissorArms.push(arm);
    }
  }

  // =========================================================================
  // 2. GARAGE DOOR (1 — ANIMATED OPENING) & DOOR TRACKS (2 — VISIBLE MECHANISM)
  //    + CEILING ELECTRIC CHAIN-DRIVE OPENER MOTOR
  // =========================================================================
  const garageDoorAndTracksGroup = new THREE.Group();
  garageDoorAndTracksGroup.name = 'GarageDoorAndOverheadTracks';
  attachInspectable(garageDoorAndTracksGroup, {
    id: 'garage-door-and-tracks-01',
    label:
      'Animated 4-Panel Overhead Garage Door (1) + 2 Galvanized Steel Ceiling J-Tracks, Torsion Bar & Opener Motor',
    category: 'Garage Door (1) + Door Tracks (2)',
    target: [0, 1.95, 2.85],
    optimalDistance: 3.1,
    cameraPosition: [-1.75, 1.72, -0.55],
  });
  rootGroup.add(garageDoorAndTracksGroup);

  for (const sideX of [-2.42, 2.42]) {
    const vertTrack = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.06, 2.75, 0.07)),
      galvSteelMat,
    );
    vertTrack.position.set(sideX, 1.375, 3.38);
    garageDoorAndTracksGroup.add(vertTrack);

    const bendTrack = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.06, 0.45, 0.45)),
      galvSteelMat,
    );
    bendTrack.position.set(sideX, 2.84, 3.22);
    garageDoorAndTracksGroup.add(bendTrack);

    const horizTrack = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.06, 0.07, 3.15)),
      galvSteelMat,
    );
    horizTrack.position.set(sideX, 2.98, 1.65);
    garageDoorAndTracksGroup.add(horizTrack);

    for (const hz of [0.55, 1.45, 2.35]) {
      const hanger = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.04, 0.72, 0.04)),
        galvSteelMat,
      );
      hanger.position.set(sideX, 3.35, hz);
      garageDoorAndTracksGroup.add(hanger);
    }
  }

  // Overhead Torsion Spring Bar + Cable Drums above door header
  const torsionShaft = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.025, 0.025, 4.95, 14)),
    galvSteelMat,
  );
  torsionShaft.rotation.z = Math.PI / 2;
  torsionShaft.position.set(0, 2.92, 3.42);
  garageDoorAndTracksGroup.add(torsionShaft);

  const torsionSpringCoil = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.065, 0.065, 1.15, 16)),
    darkSteelMat,
  );
  torsionSpringCoil.rotation.z = Math.PI / 2;
  torsionSpringCoil.position.set(0, 2.92, 3.42);
  garageDoorAndTracksGroup.add(torsionSpringCoil);

  for (const dx of [-2.35, 2.35]) {
    const drum = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.085, 0.085, 0.09, 14)),
      crimsonRedMat,
    );
    drum.rotation.z = Math.PI / 2;
    drum.position.set(dx, 2.92, 3.42);
    garageDoorAndTracksGroup.add(drum);
  }

  // Ceiling-Mounted Electric Chain-Drive Garage Door Opener Motor & Center T-Rail
  const openerCenterRail = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.05, 0.05, 3.25)),
    galvSteelMat,
  );
  openerCenterRail.position.set(0, 3.08, 1.75);
  garageDoorAndTracksGroup.add(openerCenterRail);

  const openerMotorBox = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.42, 0.24, 0.48)),
    darkSteelMat,
  );
  openerMotorBox.position.set(0, 3.16, 0.12);
  garageDoorAndTracksGroup.add(openerMotorBox);

  // Emergency red release cord & handle hanging from opener carriage
  const releaseCord = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.006, 0.006, 0.55, 8)),
    crimsonRedMat,
  );
  releaseCord.position.set(0.12, 2.78, 1.25);
  garageDoorAndTracksGroup.add(releaseCord);

  const releaseHandle = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.022, 0.022, 0.09, 10)),
    crimsonRedMat,
  );
  releaseHandle.rotation.z = Math.PI / 2;
  releaseHandle.position.set(0.12, 2.5, 1.25);
  garageDoorAndTracksGroup.add(releaseHandle);

  // 4 Articulated Sectional Garage Door Panels
  const doorPanelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#CBD5E1',
      roughness: 0.42,
      metalness: 0.35,
    }),
  );
  const doorInsetMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#94A3B8',
      roughness: 0.48,
      metalness: 0.38,
    }),
  );
  const doorGlassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#38BDF8',
      emissive: '#1D4ED8',
      emissiveIntensity: 0.55,
      roughness: 0.15,
    }),
  );

  const doorPanelGroups: THREE.Group[] = [];
  for (let p = 0; p < 4; p++) {
    const pGroup = new THREE.Group();
    const slab = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(4.76, 0.62, 0.06)),
      doorPanelMat,
    );
    pGroup.add(slab);

    for (let c = 0; c < 4; c++) {
      const cx = -1.68 + c * 1.12;
      const isTopWindow = p === 3;
      const cassette = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.92, 0.42, 0.075)),
        isTopWindow ? doorGlassMat : doorInsetMat,
      );
      cassette.position.set(cx, 0, 0);
      pGroup.add(cassette);
    }

    // Steel hinges between panels
    for (const hx of [-1.85, 0, 1.85]) {
      const hinge = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.08, 0.14, 0.08)),
        galvSteelMat,
      );
      hinge.position.set(hx, 0.28, -0.02);
      pGroup.add(hinge);
    }

    for (const rx of [-2.41, 2.41]) {
      const roller = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.028, 0.028, 0.04, 12)),
        darkSteelMat,
      );
      roller.rotation.z = Math.PI / 2;
      roller.position.set(rx, 0, 0);
      pGroup.add(roller);
    }

    garageDoorAndTracksGroup.add(pGroup);
    doorPanelGroups.push(pGroup);
  }

  // =========================================================================
  // 3. LIGHT BULB / OVERHEAD LAMP (3 BUILT, REQ 2–3 — DRAMATIC REVEAL)
  // =========================================================================
  const overheadLampsGroup = new THREE.Group();
  overheadLampsGroup.name = 'OverheadRevealLampsGroup';
  rootGroup.add(overheadLampsGroup);

  const lampShadeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#14532D',
      roughness: 0.35,
      metalness: 0.55,
      side: THREE.DoubleSide,
    }),
  );

  const lampCoords: Array<[number, number, number]> = [
    [0.0, 3.26, 0.65],
    [0.0, 3.26, -0.75],
    [0.25, 3.26, -2.35],
  ];

  const lampBulbMats: THREE.MeshBasicMaterial[] = [];
  const lampConeMats: THREE.MeshBasicMaterial[] = [];
  const lampPointLights: THREE.PointLight[] = [];

  for (let i = 0; i < lampCoords.length; i++) {
    const [lx, ly, lz] = lampCoords[i];
    const fixture = new THREE.Group();
    fixture.position.set(lx, ly, lz);
    overheadLampsGroup.add(fixture);

    const cord = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.015, 0.015, 0.52, 10)),
      darkSteelMat,
    );
    cord.position.set(0, 0.26, 0);
    fixture.add(cord);

    const shade = new THREE.Mesh(
      trackGeo(new THREE.ConeGeometry(0.28, 0.22, 20, 1, true)),
      lampShadeMat,
    );
    shade.position.set(0, 0, 0);
    fixture.add(shade);

    const bulbMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: '#FEF08A',
      }),
    );
    lampBulbMats.push(bulbMat);

    const bulbMesh = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.068, 16, 16)),
      bulbMat,
    );
    bulbMesh.position.set(0, -0.08, 0);
    fixture.add(bulbMesh);

    const coneMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: '#FEF08A',
        transparent: true,
        opacity: 0.07,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    lampConeMats.push(coneMat);

    const lightCone = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(1.45, 0.26, 2.85, 24, 1, true)),
      coneMat,
    );
    lightCone.position.set(0, -1.5, 0);
    fixture.add(lightCone);

    const pLight = new THREE.PointLight('#FFE8B6', 7.0, 14.0, 1.1);
    pLight.position.set(lx, ly - 0.18, lz);
    rootGroup.add(pLight);
    lampPointLights.push(pLight);
  }

  // =========================================================================
  // 4. RUSTY TROLLEY (1) + CARTOON NUKE (1: BODY + NOSE CONE + 4 FINS + MARKINGS)
  //    Rises out of the Sub-Floor Silo Pit from Y = -2.35m to Y = 0.0m!
  // =========================================================================
  const trolleyAndNukeGroup = new THREE.Group();
  trolleyAndNukeGroup.name = 'RustyTrolleyAndCartoonNukeGroup';
  trolleyAndNukeGroup.position.set(0.0, -2.35, -0.35);
  attachInspectable(trolleyAndNukeGroup, {
    id: 'rusty-trolley-and-cartoon-nuke',
    label:
      'Cartoon Nuke (1: Separate Nose Cone, Body, 4 Tail Fins & Markings) on Rusty Trolley (1) — Sub-Floor Silo Emergence',
    category: 'Cartoon Nuke + Rusty Trolley (Silo Lift)',
    target: [0.0, 0.65, -0.35],
    optimalDistance: 2.55,
    cameraPosition: [1.85, 1.42, 1.45],
  });
  rootGroup.add(trolleyAndNukeGroup);

  const rustMetalMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#8B4513',
      roughness: 0.72,
      metalness: 0.55,
    }),
  );

  const rustyBedMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#6E3B1E',
      roughness: 0.78,
      metalness: 0.48,
    }),
  );

  const trolleyDeck = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.16, 0.09, 2.08)),
    rustyBedMat,
  );
  trolleyDeck.position.set(0, 0.34, 0);
  trolleyAndNukeGroup.add(trolleyDeck);

  for (const sx of [-0.56, 0.56]) {
    const rail = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.05, 0.14, 2.12)),
      rustMetalMat,
    );
    rail.position.set(sx, 0.36, 0);
    trolleyAndNukeGroup.add(rail);
  }

  const wheelRubberMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#111827',
      roughness: 0.82,
    }),
  );
  const trolleyWheels: THREE.Mesh[] = [];
  const wheelCoords: Array<[number, number]> = [
    [-0.46, -0.82],
    [0.46, -0.82],
    [-0.46, 0.82],
    [0.46, 0.82],
  ];
  for (const [wx, wz] of wheelCoords) {
    const yoke = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.1, 0.16, 0.12)),
      rustMetalMat,
    );
    yoke.position.set(wx, 0.22, wz);
    trolleyAndNukeGroup.add(yoke);

    const wheel = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 18)),
      wheelRubberMat,
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, 0.14, wz);
    trolleyAndNukeGroup.add(wheel);
    trolleyWheels.push(wheel);

    const hub = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.09, 12)),
      rustMetalMat,
    );
    hub.rotation.z = Math.PI / 2;
    hub.position.set(wx, 0.14, wz);
    trolleyAndNukeGroup.add(hub);
  }

  for (const hx of [-0.48, 0.48]) {
    const post = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.024, 0.024, 0.78, 10)),
      rustMetalMat,
    );
    post.position.set(hx, 0.72, -0.98);
    post.rotation.x = -0.18;
    trolleyAndNukeGroup.add(post);
  }
  const pushCrossbar = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.026, 0.026, 1.02, 12)),
    rustMetalMat,
  );
  pushCrossbar.rotation.z = Math.PI / 2;
  pushCrossbar.position.set(0, 1.08, -1.05);
  trolleyAndNukeGroup.add(pushCrossbar);

  for (const cz of [-0.52, 0.48]) {
    const chock = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.96, 0.24, 0.18)),
      rafterMat,
    );
    chock.position.set(0, 0.48, cz);
    trolleyAndNukeGroup.add(chock);
  }

  // --- CARTOON NUKE ASSEMBLY (1: Body + Separate Nose Cone + 4 Fins + Warning Markings) ---
  const cartoonNukeAssembly = new THREE.Group();
  cartoonNukeAssembly.name = 'CartoonNukeMainAssembly';
  cartoonNukeAssembly.position.set(0, 1.04, 0.08);
  cartoonNukeAssembly.rotation.x = -0.14;
  trolleyAndNukeGroup.add(cartoonNukeAssembly);

  const nukeMarkingsTex = trackTex(createNukeWarningMarkingsTexture());
  const nukeBodyMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: nukeMarkingsTex,
      roughness: 0.35,
      metalness: 0.48,
    }),
  );

  const nukeBodyMesh = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.52, 0.48, 1.68, 32)),
    nukeBodyMat,
  );
  nukeBodyMesh.rotation.x = Math.PI / 2;
  nukeBodyMesh.position.set(0, 0, 0);
  cartoonNukeAssembly.add(nukeBodyMesh);

  for (const rz of [-0.62, 0.0, 0.62]) {
    const bandRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.51, 0.026, 12, 32)),
      hazardYellowMat,
    );
    bandRing.position.set(0, 0, rz);
    cartoonNukeAssembly.add(bandRing);
  }

  // Extra Nuke Detail: Top Lifting Lug, Fuselage Pressure Gauge & Bolted Inspection Hatch
  const nukeGaugeDial = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 16)),
    brassMat,
  );
  nukeGaugeDial.rotation.z = Math.PI / 2;
  nukeGaugeDial.position.set(0.52, 0.12, 0.24);
  cartoonNukeAssembly.add(nukeGaugeDial);

  const nukeTopLug = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.09, 0.022, 10, 18)),
    galvSteelMat,
  );
  nukeTopLug.position.set(0, 0.55, 0.0);
  cartoonNukeAssembly.add(nukeTopLug);

  // Nuke Nose Cone (1 — Separate Model Section)
  const nukeNoseConeGroup = new THREE.Group();
  nukeNoseConeGroup.name = 'NukeNoseConeSection';
  nukeNoseConeGroup.position.set(0, 0, 0.84);
  cartoonNukeAssembly.add(nukeNoseConeGroup);

  const noseLowerSection = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.32, 0.52, 0.42, 32)),
    crimsonRedMat,
  );
  noseLowerSection.rotation.x = Math.PI / 2;
  noseLowerSection.position.set(0, 0, 0.21);
  nukeNoseConeGroup.add(noseLowerSection);

  const noseTipCone = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.32, 0.46, 32)),
    crimsonRedMat,
  );
  noseTipCone.rotation.x = Math.PI / 2;
  noseTipCone.position.set(0, 0, 0.65);
  nukeNoseConeGroup.add(noseTipCone);

  const noseFuseTip = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.035, 0.055, 0.18, 16)),
    hazardYellowMat,
  );
  noseFuseTip.rotation.x = Math.PI / 2;
  noseFuseTip.position.set(0, 0, 0.92);
  nukeNoseConeGroup.add(noseFuseTip);

  // Nuke Fins (4 Built, Req 3–4)
  const finAngles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
  for (let f = 0; f < 4; f++) {
    const finHolder = new THREE.Group();
    finHolder.position.set(0, 0, -0.72);
    finHolder.rotation.z = finAngles[f];
    cartoonNukeAssembly.add(finHolder);

    const finBlade = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.045, 0.56, 0.54)),
      f % 2 === 0 ? crimsonRedMat : hazardYellowMat,
    );
    finBlade.position.set(0, 0.62, -0.08);
    finBlade.rotation.x = 0.25;
    finHolder.add(finBlade);

    const finTipPod = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.038, 0.038, 0.58, 12)),
      darkSteelMat,
    );
    finTipPod.rotation.x = Math.PI / 2;
    finTipPod.position.set(0, 0.88, -0.1);
    finHolder.add(finTipPod);
  }

  const thrusterBell = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.38, 0.26, 0.34, 24)),
    darkSteelMat,
  );
  thrusterBell.rotation.x = -Math.PI / 2;
  thrusterBell.position.set(0, 0, -0.96);
  cartoonNukeAssembly.add(thrusterBell);

  // =========================================================================
  // 5. LAUNCH FIRE (1), LAUNCH SMOKE (1) & GROUND DUST (1) REUSABLE EFFECTS
  // =========================================================================
  const launchVfxGroup = new THREE.Group();
  launchVfxGroup.name = 'LaunchFireSmokeAndGroundDustVFX';
  rootGroup.add(launchVfxGroup);

  const fireOuterMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#F97316',
      transparent: true,
      opacity: 0.88,
    }),
  );
  const fireInnerMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#FEF08A',
      transparent: true,
      opacity: 0.96,
    }),
  );

  const launchFireGroup = new THREE.Group();
  launchFireGroup.position.set(0, 0.88, -1.48);
  launchVfxGroup.add(launchFireGroup);

  const outerFlameCone = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.38, 1.35, 20)),
    fireOuterMat,
  );
  outerFlameCone.rotation.x = -Math.PI / 2;
  outerFlameCone.position.set(0, 0, -0.45);
  launchFireGroup.add(outerFlameCone);

  const innerPlasmaCone = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.22, 0.85, 16)),
    fireInnerMat,
  );
  innerPlasmaCone.rotation.x = -Math.PI / 2;
  innerPlasmaCone.position.set(0, 0, -0.25);
  launchFireGroup.add(innerPlasmaCone);

  const thrusterFireLight = new THREE.PointLight('#F97316', 8.5, 9.5, 1.15);
  thrusterFireLight.position.set(0, 0.92, -1.75);
  launchVfxGroup.add(thrusterFireLight);

  const fireSparkMeshes: THREE.Mesh[] = [];
  const sparkGeo = trackGeo(new THREE.OctahedronGeometry(0.038, 0));
  for (let s = 0; s < 32; s++) {
    const sp = new THREE.Mesh(
      sparkGeo,
      s % 2 === 0 ? fireInnerMat : fireOuterMat,
    );
    launchFireGroup.add(sp);
    fireSparkMeshes.push(sp);
  }

  const smokeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#CBD5E1',
      emissive: '#F97316',
      emissiveIntensity: 0.22,
      roughness: 0.9,
      transparent: true,
      opacity: 0.72,
    }),
  );
  const smokePuffGeo = trackGeo(new THREE.SphereGeometry(0.22, 14, 14));
  const launchSmokeMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < 28; i++) {
    const puff = new THREE.Mesh(smokePuffGeo, smokeMat);
    launchVfxGroup.add(puff);
    launchSmokeMeshes.push(puff);
  }

  const groundDustMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#D6D3D1',
      roughness: 0.92,
      transparent: true,
      opacity: 0.58,
    }),
  );
  const shockwaveDustRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(1.15, 0.08, 10, 32)),
    groundDustMat,
  );
  shockwaveDustRing.rotation.x = Math.PI / 2;
  shockwaveDustRing.position.set(0, 0.06, -0.55);
  launchVfxGroup.add(shockwaveDustRing);

  const dustPuffGeo = trackGeo(new THREE.SphereGeometry(0.12, 10, 10));
  const groundDustMeshes: THREE.Mesh[] = [];
  for (let d = 0; d < 24; d++) {
    const dm = new THREE.Mesh(dustPuffGeo, groundDustMat);
    launchVfxGroup.add(dm);
    groundDustMeshes.push(dm);
  }

  // =========================================================================
  // 6. BICYCLE (1 — SITS NEXT TO THE TROLLEY AT [-1.45, 0.0, 0.15])
  //    Upgraded with Chainring, Pedals, Cranks, Brake Levers, Headlamp & Reflector
  // =========================================================================
  const bicycleGroup = new THREE.Group();
  bicycleGroup.name = 'StreetBicycleNextToTrolley';
  bicycleGroup.position.set(-1.45, 0.0, 0.15);
  bicycleGroup.rotation.y = 0.28;
  bicycleGroup.rotation.z = -0.08;
  attachInspectable(bicycleGroup, {
    id: 'bicycle-next-to-trolley',
    label:
      'Street Bicycle (1) Next to Silo Pit: Diamond Frame, 2 Spoked Wheels, Chainring, Pedals, Headlamp & Kickstand',
    category: 'Bicycle (1)',
    target: [-1.45, 0.58, 0.15],
    optimalDistance: 1.75,
    cameraPosition: [-0.25, 1.18, 1.45],
  });
  rootGroup.add(bicycleGroup);

  const bikeFrameMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#06B6D4',
      roughness: 0.25,
      metalness: 0.75,
    }),
  );

  for (const wz of [-0.52, 0.52]) {
    const tire = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.33, 0.032, 12, 28)),
      wheelRubberMat,
    );
    tire.rotation.y = Math.PI / 2;
    tire.position.set(0, 0.36, wz);
    bicycleGroup.add(tire);

    const rim = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.295, 0.012, 8, 24)),
      galvSteelMat,
    );
    rim.rotation.y = Math.PI / 2;
    rim.position.set(0, 0.36, wz);
    bicycleGroup.add(rim);

    for (let sp = 0; sp < 12; sp++) {
      const spoke = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.004, 0.004, 0.58, 6)),
        galvSteelMat,
      );
      spoke.position.set(0, 0.36, wz);
      spoke.rotation.x = (sp * Math.PI) / 12;
      bicycleGroup.add(spoke);
    }
  }

  const topTube = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 0.62, 10)),
    bikeFrameMat,
  );
  topTube.rotation.x = Math.PI / 2;
  topTube.position.set(0, 0.72, 0.02);
  bicycleGroup.add(topTube);

  const downTube = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.02, 0.02, 0.66, 10)),
    bikeFrameMat,
  );
  downTube.rotation.x = 0.92;
  downTube.position.set(0, 0.54, 0.12);
  bicycleGroup.add(downTube);

  const seatTube = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.019, 0.019, 0.56, 10)),
    bikeFrameMat,
  );
  seatTube.rotation.x = -0.22;
  seatTube.position.set(0, 0.58, -0.18);
  bicycleGroup.add(seatTube);

  const frontFork = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.018, 0.015, 0.62, 10)),
    bikeFrameMat,
  );
  frontFork.rotation.x = -0.25;
  frontFork.position.set(0, 0.62, 0.42);
  bicycleGroup.add(frontFork);

  // Chainring Gear & Pedals
  const chainring = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.095, 0.095, 0.016, 20)),
    galvSteelMat,
  );
  chainring.rotation.z = Math.PI / 2;
  chainring.position.set(0.03, 0.35, -0.1);
  bicycleGroup.add(chainring);

  for (const side of [-1, 1]) {
    const pedal = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.09, 0.022, 0.06)),
      darkSteelMat,
    );
    pedal.position.set(side * 0.11, 0.35 + side * 0.08, -0.1);
    bicycleGroup.add(pedal);
  }

  const handlebarBar = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.014, 0.014, 0.54, 10)),
    galvSteelMat,
  );
  handlebarBar.rotation.z = Math.PI / 2;
  handlebarBar.position.set(0, 0.92, 0.34);
  bicycleGroup.add(handlebarBar);

  for (const gx of [-0.24, 0.24]) {
    const grip = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 10)),
      crimsonRedMat,
    );
    grip.rotation.z = Math.PI / 2;
    grip.position.set(gx, 0.92, 0.34);
    bicycleGroup.add(grip);
  }

  const bikeSaddle = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.14, 0.05, 0.26)),
    wheelRubberMat,
  );
  bikeSaddle.position.set(0, 0.88, -0.25);
  bicycleGroup.add(bikeSaddle);

  const kickstand = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.008, 0.008, 0.38, 8)),
    galvSteelMat,
  );
  kickstand.position.set(-0.08, 0.18, -0.1);
  kickstand.rotation.z = 0.38;
  bicycleGroup.add(kickstand);

  // =========================================================================
  // 7. CARDBOARD COUNTDOWN SIGN (1 — HYPE MAN) & CARDBOARD “NUKE LAUNCH” SIGN (1)
  // =========================================================================
  const countdownSignGroup = new THREE.Group();
  countdownSignGroup.name = 'CardboardCountdownSignGroup';
  countdownSignGroup.position.set(1.88, 0.0, 0.55);
  countdownSignGroup.rotation.y = -0.48;
  attachInspectable(countdownSignGroup, {
    id: 'cardboard-countdown-sign-hype',
    label:
      'Hype Man Cardboard Countdown Sign (1) + Separate Cardboard "NUKE LAUNCH" Sign (1)',
    category: 'Cardboard Countdown & Nuke Launch Signs',
    target: [0.25, 0.85, 0.65],
    optimalDistance: 2.35,
    cameraPosition: [0.15, 1.38, 2.35],
  });
  rootGroup.add(countdownSignGroup);

  const signPostStand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.44, 0.05, 0.44)),
    rafterMat,
  );
  signPostStand.position.set(0, 0.025, 0);
  countdownSignGroup.add(signPostStand);

  const signWoodenPost = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.05, 1.32, 0.05)),
    rafterMat,
  );
  signWoodenPost.position.set(0, 0.66, 0);
  countdownSignGroup.add(signWoodenPost);

  const countdownCanvas = document.createElement('canvas');
  countdownCanvas.width = 512;
  countdownCanvas.height = 512;
  const countdownCtx = countdownCanvas.getContext('2d');
  const countdownTex = trackTex(new THREE.CanvasTexture(countdownCanvas));
  countdownTex.colorSpace = THREE.SRGBColorSpace;

  const countdownBoardMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.74, 0.74, 0.03)),
    trackMat(
      new THREE.MeshBasicMaterial({
        map: countdownTex,
      }),
    ),
  );
  countdownBoardMesh.position.set(0, 1.18, 0.03);
  countdownSignGroup.add(countdownBoardMesh);

  // Separate Cardboard “NUKE LAUNCH” Sign (1) at [-1.85, 0.0, 1.65]
  const nukeLaunchSignGroup = new THREE.Group();
  nukeLaunchSignGroup.name = 'CardboardNukeLaunchSignGroup';
  nukeLaunchSignGroup.position.set(-1.85, 0.0, 1.65);
  nukeLaunchSignGroup.rotation.y = 0.35;
  attachInspectable(nukeLaunchSignGroup, {
    id: 'cardboard-nuke-launch-sign',
    label: 'Cardboard “NUKE LAUNCH” Sign (1) with Duct Tape & Hand-Drawn Arrow',
    category: 'Cardboard “NUKE LAUNCH” Sign (1)',
    target: [-1.68, 0.58, 1.55],
    optimalDistance: 1.65,
    cameraPosition: [-0.45, 1.18, 2.55],
  });
  rootGroup.add(nukeLaunchSignGroup);

  const nukeLaunchSignTex = trackTex(createCardboardNukeLaunchSignTexture());
  const nukeSignFront = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.88, 0.66, 0.03)),
    trackMat(
      new THREE.MeshBasicMaterial({
        map: nukeLaunchSignTex,
      }),
    ),
  );
  nukeSignFront.position.set(0, 0.56, 0.14);
  nukeSignFront.rotation.x = -0.22;
  nukeLaunchSignGroup.add(nukeSignFront);

  const nukeSignBackStrut = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.84, 0.66, 0.025)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#9A6B3E',
        roughness: 0.85,
      }),
    ),
  );
  nukeSignBackStrut.position.set(0, 0.54, -0.14);
  nukeSignBackStrut.rotation.x = 0.25;
  nukeLaunchSignGroup.add(nukeSignBackStrut);

  // =========================================================================
  // 8. GARAGE CLUTTER: TOOL CABINET (1), TOOLBOX (1), SPARE TIRE (1),
  //    SHELVING (2), PAINT CANS (5), CARDBOARD BOXES (5) & EXTENSION CABLE (1)
  // =========================================================================
  const clutterGroup = new THREE.Group();
  clutterGroup.name = 'GarageClutterAndShelvesGroup';
  attachInspectable(clutterGroup, {
    id: 'tool-cabinet-and-toolbox',
    label:
      'Tool Cabinet (1), Toolbox (1), Spare Tire (1), 2 Shelving Units, 5 Paint Cans, 5 Cardboard Boxes & 1000x Workshop Gear',
    category: 'Garage Clutter & Shelving',
    target: [1.55, 1.05, -2.15],
    optimalDistance: 2.65,
    cameraPosition: [-0.85, 1.62, 1.25],
  });
  rootGroup.add(clutterGroup);

  // 8A. Red Rolling Mechanic's Tool Cabinet (1) at [3.35, 0, -1.25]
  const toolCabinetGroup = new THREE.Group();
  toolCabinetGroup.position.set(3.35, 0, -1.25);
  toolCabinetGroup.rotation.y = -Math.PI / 2;
  clutterGroup.add(toolCabinetGroup);

  const cabinetChassis = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.18, 1.12, 0.58)),
    crimsonRedMat,
  );
  cabinetChassis.position.set(0, 0.62, 0);
  toolCabinetGroup.add(cabinetChassis);

  for (let d = 0; d < 6; d++) {
    const drawer = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.06, 0.13, 0.03)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: '#991B1B',
          roughness: 0.35,
          metalness: 0.5,
        }),
      ),
    );
    drawer.position.set(0, 0.2 + d * 0.16, 0.295);
    toolCabinetGroup.add(drawer);

    const pull = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.82, 0.022, 0.025)),
      galvSteelMat,
    );
    pull.position.set(0, 0.22 + d * 0.16, 0.315);
    toolCabinetGroup.add(pull);
  }

  // 8B. Portable Steel Toolbox (1) resting on top of the Tool Cabinet
  const toolboxGroup = new THREE.Group();
  toolboxGroup.position.set(0.12, 1.18, 0);
  toolboxGroup.rotation.y = 0.18;
  toolCabinetGroup.add(toolboxGroup);

  const toolboxBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.52, 0.22, 0.26)),
    crimsonRedMat,
  );
  toolboxBody.position.set(0, 0.11, 0);
  toolboxGroup.add(toolboxBody);

  const toolboxHandle = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 10)),
    galvSteelMat,
  );
  toolboxHandle.rotation.z = Math.PI / 2;
  toolboxHandle.position.set(0, 0.26, 0);
  toolboxGroup.add(toolboxHandle);

  // 8C. Spare Tire (1) leaning next to Tool Cabinet at [3.38, 0, -0.15]
  const spareTireGroup = new THREE.Group();
  spareTireGroup.position.set(3.38, 0.34, -0.15);
  spareTireGroup.rotation.y = -0.35;
  spareTireGroup.rotation.z = 0.22;
  clutterGroup.add(spareTireGroup);

  const spareTireRubber = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.32, 0.12, 16, 28)),
    wheelRubberMat,
  );
  spareTireGroup.add(spareTireRubber);

  const spareTireHub = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.21, 0.21, 0.14, 18)),
    galvSteelMat,
  );
  spareTireHub.rotation.x = Math.PI / 2;
  spareTireGroup.add(spareTireHub);

  // 8D. 2 Heavy-Duty Industrial Shelving Units (Req 1–2, Built 2) along Back Wall
  const shelfUnitXCoords = [-1.85, 1.65];
  for (const sx of shelfUnitXCoords) {
    const rackGroup = new THREE.Group();
    rackGroup.position.set(sx, 0, -3.05);
    clutterGroup.add(rackGroup);

    for (const ux of [-0.88, 0.88]) {
      for (const uz of [-0.32, 0.32]) {
        const post = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.045, 2.15, 0.045)),
          darkSteelMat,
        );
        post.position.set(ux, 1.075, uz);
        rackGroup.add(post);
      }
    }

    for (const sy of [0.18, 0.78, 1.38, 1.98]) {
      const deck = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.82, 0.04, 0.68)),
        darkSteelMat,
      );
      deck.position.set(0, sy, 0);
      rackGroup.add(deck);
    }

    // Extra shelf clutter: aerosol cans, oil jugs & hardware bins on upper shelves
    for (let b = 0; b < 4; b++) {
      const bin = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.28, 0.2, 0.36)),
        b % 2 === 0 ? hazardYellowMat : crimsonRedMat,
      );
      bin.position.set(-0.62 + b * 0.41, 2.1, 0);
      rackGroup.add(bin);
    }
  }

  // 8E. 5 Paint Cans (Req 3–5, Built 5)
  const paintCanSpecs: Array<{
    pos: [number, number, number];
    dripColor: string;
  }> = [
    {pos: [-2.25, 0.8, -3.02], dripColor: '#FACC15'},
    {pos: [-1.98, 0.8, -2.98], dripColor: '#EF4444'},
    {pos: [-1.68, 1.4, -3.02], dripColor: '#22D3EE'},
    {pos: [1.35, 0.8, -3.02], dripColor: '#84CC16'},
    {pos: [-3.15, 0.0, -1.25], dripColor: '#F97316'},
  ];

  for (const pc of paintCanSpecs) {
    const canGroup = new THREE.Group();
    canGroup.position.set(...pc.pos);
    clutterGroup.add(canGroup);

    const canCylinder = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.095, 0.095, 0.24, 18)),
      galvSteelMat,
    );
    canCylinder.position.set(0, 0.12, 0);
    canGroup.add(canCylinder);

    const paintRim = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.098, 0.098, 0.045, 18)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: pc.dripColor,
          roughness: 0.25,
        }),
      ),
    );
    paintRim.position.set(0, 0.225, 0);
    canGroup.add(paintRim);
  }

  // 8F. 5 Corrugated Cardboard Boxes (Req 3–6, Built 5)
  const boxMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#B4824E',
      roughness: 0.82,
    }),
  );
  const tapeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#EAB308',
      roughness: 0.45,
    }),
  );
  const cardboardBoxSpecs: Array<{
    pos: [number, number, number];
    size: [number, number, number];
    rotY: number;
  }> = [
    {pos: [-3.42, 0.24, -1.68], size: [0.56, 0.48, 0.52], rotY: 0.18},
    {pos: [-3.38, 0.66, -1.65], size: [0.44, 0.36, 0.42], rotY: -0.22},
    {pos: [-1.42, 0.41, -3.02], size: [0.52, 0.42, 0.46], rotY: 0.08},
    {pos: [1.85, 0.41, -3.02], size: [0.54, 0.42, 0.48], rotY: -0.12},
    {pos: [1.52, 1.61, -3.02], size: [0.48, 0.42, 0.44], rotY: 0.15},
  ];

  for (const cb of cardboardBoxSpecs) {
    const bGroup = new THREE.Group();
    bGroup.position.set(...cb.pos);
    bGroup.rotation.y = cb.rotY;
    clutterGroup.add(bGroup);

    const boxMesh = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(...cb.size)),
      boxMat,
    );
    bGroup.add(boxMesh);

    const tapeStrip = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(cb.size[0] + 0.01, 0.01, 0.06)),
      tapeMat,
    );
    tapeStrip.position.set(0, cb.size[1] / 2, 0);
    bGroup.add(tapeStrip);
  }

  // 8G. Extension Cable (1 — Safety-Orange Floor Power Cord & Igniter Box)
  const cableMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#F97316',
      emissive: '#EA580C',
      emissiveIntensity: 0.28,
      roughness: 0.4,
    }),
  );
  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(4.18, 0.52, -0.55),
    new THREE.Vector3(3.85, 0.02, -0.52),
    new THREE.Vector3(2.55, 0.02, -0.82),
    new THREE.Vector3(1.55, 0.02, -0.35),
    new THREE.Vector3(1.02, 0.02, -0.38),
  ]);
  const extensionCableMesh = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(cableCurve, 44, 0.018, 10, false)),
    cableMat,
  );
  clutterGroup.add(extensionCableMesh);

  const junctionBox = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.18, 0.05, 0.12)),
    hazardYellowMat,
  );
  junctionBox.position.set(1.02, 0.025, -0.38);
  clutterGroup.add(junctionBox);

  // =========================================================================
  // 9. 1000X ULTRA-DETAILED MECHANIC'S WORKSHOP & ARCHITECTURAL SUB-ASSEMBLIES
  // =========================================================================
  const ultraDetailWorkshopGroup = new THREE.Group();
  ultraDetailWorkshopGroup.name = 'UltraDetailGarageWorkshopGroup';
  attachInspectable(ultraDetailWorkshopGroup, {
    id: 'ultra-detail-workshop-bench-pegboard',
    label:
      '1000x Detailed Workshop: Oak Workbench, Bench Vise, Dual Grinder, 26-Tool Pegboard, Air Compressor, Welder, Gantry Hoist & Silo Console',
    category: '1000x Garage Workshop Detail',
    target: [-3.45, 1.25, 0.35],
    optimalDistance: 2.65,
    cameraPosition: [-0.85, 1.55, 0.65],
  });
  rootGroup.add(ultraDetailWorkshopGroup);

  // 9A. Heavy-Duty Hardwood Workbench + Cast-Iron Vise + Dual Bench Grinder + 26-Tool Pegboard (West Wall X = -3.72, Z = 0.45)
  const workbenchGroup = new THREE.Group();
  workbenchGroup.position.set(-3.72, 0, 0.45);
  ultraDetailWorkshopGroup.add(workbenchGroup);

  // Butcher-block oak tabletop (0.82m deep x 2.25m wide along Z)
  const benchTop = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.82, 0.07, 2.25)),
    hardwoodOakMat,
  );
  benchTop.position.set(0, 0.92, 0);
  workbenchGroup.add(benchTop);

  // Lower steel shelf & 4 heavy legs
  const benchLowerShelf = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.74, 0.04, 2.12)),
    darkSteelMat,
  );
  benchLowerShelf.position.set(0, 0.24, 0);
  workbenchGroup.add(benchLowerShelf);

  for (const lx of [-0.35, 0.35]) {
    for (const lz of [-1.02, 1.02]) {
      const leg = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.06, 0.9, 0.06)),
        darkSteelMat,
      );
      leg.position.set(lx, 0.45, lz);
      workbenchGroup.add(leg);
    }
  }

  // Cast-Iron Machinist Bench Vise bolted to front-right corner of workbench
  const viseGroup = new THREE.Group();
  viseGroup.position.set(0.28, 0.96, 0.78);
  workbenchGroup.add(viseGroup);

  const viseBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.26, 0.16, 0.18)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#1D4ED8',
        roughness: 0.4,
        metalness: 0.65,
      }),
    ),
  );
  viseBody.position.set(0, 0.08, 0);
  viseGroup.add(viseBody);

  const viseJaws = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.12, 0.1, 0.2)),
    galvSteelMat,
  );
  viseJaws.position.set(0.08, 0.16, 0);
  viseGroup.add(viseJaws);

  const viseLeadscrew = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.016, 0.016, 0.26, 10)),
    galvSteelMat,
  );
  viseLeadscrew.rotation.z = Math.PI / 2;
  viseLeadscrew.position.set(0.14, 0.08, 0);
  viseGroup.add(viseLeadscrew);

  // Dual-Wheel Electric Bench Grinder at back-left of workbench
  const grinderGroup = new THREE.Group();
  grinderGroup.position.set(0.15, 0.96, -0.68);
  workbenchGroup.add(grinderGroup);

  const grinderMotor = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.11, 0.11, 0.28, 16)),
    crimsonRedMat,
  );
  grinderMotor.rotation.x = Math.PI / 2;
  grinderMotor.position.set(0, 0.14, 0);
  grinderGroup.add(grinderMotor);

  for (const wz of [-0.18, 0.18]) {
    const wheel = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 20)),
      galvSteelMat,
    );
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(0, 0.14, wz);
    grinderGroup.add(wheel);

    const guard = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.145, 0.145, 0.055, 16)),
      darkSteelMat,
    );
    guard.rotation.x = Math.PI / 2;
    guard.position.set(-0.02, 0.14, wz);
    grinderGroup.add(guard);
  }

  // Illuminated Perforated Pegboard Tool Wall above Workbench (West Wall X = -4.18, Y = 1.75, Z = 0.45)
  const pegboardBack = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.04, 1.25, 2.22)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#1E293B',
        roughness: 0.65,
      }),
    ),
  );
  pegboardBack.position.set(-0.44, 1.62, 0);
  workbenchGroup.add(pegboardBack);

  const pegboardFrame = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.05, 1.31, 2.28)),
    hazardYellowMat,
  );
  pegboardFrame.position.set(-0.455, 1.62, 0);
  workbenchGroup.add(pegboardFrame);

  // 26 Individual 3D Hand Tools hanging on the Pegboard!
  // 1. 6 Graduated Chrome Combination Wrenches
  for (let w = 0; w < 6; w++) {
    const len = 0.22 + w * 0.045;
    const wrenchShaft = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.018, len, 0.032)),
      galvSteelMat,
    );
    wrenchShaft.position.set(-0.4, 1.88 - w * 0.02, -0.92 + w * 0.11);
    workbenchGroup.add(wrenchShaft);

    const wrenchHead = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.026, 0.008, 8, 12)),
      galvSteelMat,
    );
    wrenchHead.rotation.y = Math.PI / 2;
    wrenchHead.position.set(-0.4, 1.88 - w * 0.02 + len / 2, -0.92 + w * 0.11);
    workbenchGroup.add(wrenchHead);
  }

  // 2. Claw Hammer & Rubber Mallet
  for (let h = 0; h < 2; h++) {
    const handle = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.016, 0.02, 0.36, 10)),
      hardwoodOakMat,
    );
    handle.position.set(-0.4, 1.82, -0.15 + h * 0.22);
    workbenchGroup.add(handle);

    const head = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.06, 0.065, 0.16)),
      h === 0 ? darkSteelMat : crimsonRedMat,
    );
    head.position.set(-0.4, 2.0, -0.15 + h * 0.22);
    workbenchGroup.add(head);
  }

  // 3. 6 Fluted Screwdrivers (Red & Yellow Handles)
  for (let s = 0; s < 6; s++) {
    const grip = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.018, 0.016, 0.11, 10)),
      s % 2 === 0 ? crimsonRedMat : hazardYellowMat,
    );
    grip.position.set(-0.4, 1.42, -0.88 + s * 0.09);
    workbenchGroup.add(grip);

    const shank = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.005, 0.005, 0.16, 8)),
      galvSteelMat,
    );
    shank.position.set(-0.4, 1.29, -0.88 + s * 0.09);
    workbenchGroup.add(shank);
  }

  // 4. Hacksaw, Carpenter Square, Circular Saw Disc & Coiled Air Hose on Pegboard Right Side
  const sawDisc = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.16, 0.16, 0.012, 24)),
    galvSteelMat,
  );
  sawDisc.rotation.z = Math.PI / 2;
  sawDisc.position.set(-0.4, 1.85, 0.45);
  workbenchGroup.add(sawDisc);

  const coiledHose = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.18, 0.028, 12, 24)),
    hazardYellowMat,
  );
  coiledHose.rotation.y = Math.PI / 2;
  coiledHose.position.set(-0.38, 1.38, 0.78);
  workbenchGroup.add(coiledHose);

  // 9B. 60-Gallon Vertical Red Air Compressor (West-Back Corner at [-3.68, 0, -2.65])
  const compressorGroup = new THREE.Group();
  compressorGroup.position.set(-3.68, 0, -2.65);
  ultraDetailWorkshopGroup.add(compressorGroup);

  const compressorTank = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.32, 0.32, 1.28, 22)),
    crimsonRedMat,
  );
  compressorTank.position.set(0, 0.72, 0);
  compressorGroup.add(compressorTank);

  const compressorDomeTop = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.32, 20, 14)),
    crimsonRedMat,
  );
  compressorDomeTop.position.set(0, 1.36, 0);
  compressorGroup.add(compressorDomeTop);

  const compressorHead = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.34, 0.32, 0.38)),
    darkSteelMat,
  );
  compressorHead.position.set(0, 1.72, 0);
  compressorGroup.add(compressorHead);

  const compressorGauge = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 14)),
    brassMat,
  );
  compressorGauge.rotation.z = Math.PI / 2;
  compressorGauge.position.set(0.32, 1.28, 0.08);
  compressorGroup.add(compressorGauge);

  // 9C. Oxy-Acetylene Welding Cart & Twin Gas Cylinders (East Wall at [3.58, 0, 1.15])
  const weldingRigGroup = new THREE.Group();
  weldingRigGroup.position.set(3.58, 0, 1.15);
  ultraDetailWorkshopGroup.add(weldingRigGroup);

  const welderBase = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.54, 0.06, 0.68)),
    darkSteelMat,
  );
  welderBase.position.set(0, 0.12, 0);
  weldingRigGroup.add(welderBase);

  // Tall Green Oxygen Cylinder & Maroon Acetylene Cylinder
  const oxygenTank = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.13, 0.13, 1.38, 18)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#15803D',
        roughness: 0.35,
        metalness: 0.55,
      }),
    ),
  );
  oxygenTank.position.set(0, 0.84, -0.16);
  weldingRigGroup.add(oxygenTank);

  const acetyleneTank = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.14, 0.14, 1.12, 18)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#7F1D1D',
        roughness: 0.38,
        metalness: 0.5,
      }),
    ),
  );
  acetyleneTank.position.set(0, 0.71, 0.16);
  weldingRigGroup.add(acetyleneTank);

  for (const gz of [-0.16, 0.16]) {
    const reg = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 12)),
      brassMat,
    );
    reg.position.set(0, gz < 0 ? 1.58 : 1.32, gz);
    weldingRigGroup.add(reg);
  }

  // 9D. Overhead Yellow Steel I-Beam Gantry Crane & Chain Hoist + Galvanized HVAC Ductwork
  const gantryBeam = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(7.8, 0.18, 0.16)),
    hazardYellowMat,
  );
  gantryBeam.position.set(0, 3.42, -1.35);
  ultraDetailWorkshopGroup.add(gantryBeam);

  const hoistTrolley = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.36, 0.24, 0.28)),
    crimsonRedMat,
  );
  hoistTrolley.position.set(-1.15, 3.32, -1.35);
  ultraDetailWorkshopGroup.add(hoistTrolley);

  const hoistChain = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 1.15, 10)),
    galvSteelMat,
  );
  hoistChain.position.set(-1.15, 2.68, -1.35);
  ultraDetailWorkshopGroup.add(hoistChain);

  const hoistHook = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.075, 0.022, 10, 16, Math.PI * 1.45)),
    hazardYellowMat,
  );
  hoistHook.position.set(-1.15, 2.06, -1.35);
  ultraDetailWorkshopGroup.add(hoistHook);

  // Galvanized Sheet-Metal HVAC Ducting along Back/West Ceiling
  const hvacMainDuct = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(7.9, 0.34, 0.38)),
    galvSteelMat,
  );
  hvacMainDuct.position.set(0, 3.36, -3.22);
  ultraDetailWorkshopGroup.add(hvacMainDuct);

  // 9E. High-Voltage Breaker Panel, EMT Conduit Network, Fire Extinguisher & 3 Wall Blueprints/Posters
  const breakerCabinet = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.14, 0.92, 0.64)),
    darkSteelMat,
  );
  breakerCabinet.position.set(4.15, 1.85, -2.35);
  ultraDetailWorkshopGroup.add(breakerCabinet);

  for (let r = 0; r < 8; r++) {
    const sw = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.03, 0.04, 0.14)),
      r === 0 ? crimsonRedMat : hazardYellowMat,
    );
    sw.position.set(4.07, 2.15 - r * 0.085, -2.35);
    ultraDetailWorkshopGroup.add(sw);
  }

  // Wall-mounted Red Fire Extinguisher on East Wall
  const extinguisherBody = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.085, 0.085, 0.46, 16)),
    crimsonRedMat,
  );
  extinguisherBody.position.set(4.12, 1.25, 2.15);
  ultraDetailWorkshopGroup.add(extinguisherBody);

  // 3 Wall Posters / Blueprints (Back Wall Blueprint, West Wall Speed Shop, East Wall Safety Scoreboard)
  const blueprintTex = trackTex(createGarageWallPosterTexture('silo-blueprint'));
  const blueprintBoard = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.42, 1.06, 0.02)),
    trackMat(new THREE.MeshBasicMaterial({map: blueprintTex})),
  );
  blueprintBoard.position.set(0.0, 2.15, -3.49);
  ultraDetailWorkshopGroup.add(blueprintBoard);

  const speedShopTex = trackTex(createGarageWallPosterTexture('speed-shop-banner'));
  const speedShopBoard = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.02, 1.02, 1.38)),
    trackMat(new THREE.MeshBasicMaterial({map: speedShopTex})),
  );
  speedShopBoard.position.set(-4.19, 2.25, -1.55);
  ultraDetailWorkshopGroup.add(speedShopBoard);

  const safetyTex = trackTex(createGarageWallPosterTexture('safety-scoreboard'));
  const safetyBoard = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.02, 0.96, 1.26)),
    trackMat(new THREE.MeshBasicMaterial({map: safetyTex})),
  );
  safetyBoard.position.set(4.19, 2.25, -0.35);
  ultraDetailWorkshopGroup.add(safetyBoard);

  // 9F. Silo Launch Control Console Pedestal (at [1.92, 0, -0.45]) + Hydraulic Floor Jack & Jerry Cans
  const siloConsoleGroup = new THREE.Group();
  siloConsoleGroup.position.set(1.92, 0, -0.45);
  siloConsoleGroup.rotation.y = -0.55;
  ultraDetailWorkshopGroup.add(siloConsoleGroup);

  const consolePillar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.42, 0.98, 0.36)),
    darkSteelMat,
  );
  consolePillar.position.set(0, 0.49, 0);
  siloConsoleGroup.add(consolePillar);

  const consoleDesk = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.52, 0.18, 0.46)),
    hazardYellowMat,
  );
  consoleDesk.position.set(0, 1.02, 0.04);
  consoleDesk.rotation.x = 0.38;
  siloConsoleGroup.add(consoleDesk);

  // Big Red "OPEN SILO" Push Button & Animated Elevator Throttle Lever
  const bigRedSiloButton = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.065, 16, 12)),
    crimsonRedMat,
  );
  bigRedSiloButton.position.set(-0.1, 1.12, 0.08);
  siloConsoleGroup.add(bigRedSiloButton);

  const siloThrottleLever = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.015, 0.015, 0.24, 10)),
    galvSteelMat,
  );
  siloThrottleLever.position.set(0.12, 1.16, 0.04);
  siloConsoleGroup.add(siloThrottleLever);

  // Low-Profile Hydraulic Racing Floor Jack & 2 Fuel Jerry Cans (at [-2.65, 0, -2.05])
  const floorJackGroup = new THREE.Group();
  floorJackGroup.position.set(-2.65, 0, -2.05);
  floorJackGroup.rotation.y = 0.42;
  ultraDetailWorkshopGroup.add(floorJackGroup);

  const jackChassis = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.32, 0.14, 0.68)),
    crimsonRedMat,
  );
  jackChassis.position.set(0, 0.08, 0);
  floorJackGroup.add(jackChassis);

  const jackHandle = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.016, 0.016, 0.95, 10)),
    galvSteelMat,
  );
  jackHandle.position.set(0, 0.48, -0.36);
  jackHandle.rotation.x = -0.52;
  floorJackGroup.add(jackHandle);

  // 2 Fuel Jerry Cans & 12V Car Battery
  for (let j = 0; j < 2; j++) {
    const jerryCan = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.18, 0.44, 0.32)),
      j === 0 ? crimsonRedMat : hazardYellowMat,
    );
    jerryCan.position.set(-3.15 + j * 0.26, 0.22, 2.15);
    ultraDetailWorkshopGroup.add(jerryCan);
  }

  // =========================================================================
  // 10. AMBIENT & FILL LIGHTING FOR CLEAR VISIBILITY ACROSS ALL GARAGE ASSETS
  // =========================================================================
  const ambientLight = new THREE.AmbientLight('#64748B', 2.15);
  rootGroup.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight('#FFFBEB', '#1E293B', 1.5);
  rootGroup.add(hemiLight);

  const frontDoorFillLight = new THREE.PointLight('#93C5FD', 3.8, 12.0, 1.15);
  frontDoorFillLight.position.set(0, 2.2, 3.85);
  rootGroup.add(frontDoorFillLight);

  // =========================================================================
  // 11. APPLY MAIN STREET CEL-SHADED TOON & 2D COMIC INK OUTLINE STYLE
  // =========================================================================
  const {inkLineObjects, disposeStyleResources} =
    applyMainStreetStyleToSceneGraph(rootGroup);

  // =========================================================================
  // DETERMINISTIC 60FPS UPDATE LOOP
  // =========================================================================
  const updateForFrame: GarageNuclearSceneHandle['updateForFrame'] = ({
    frame,
    fps,
    doorMode,
    launchMode,
    lightRevealMode,
    vfxIntensity,
    inkOutlinesEnabled = true,
    wireframeMode,
  }) => {
    const state = evaluateGarageLaunchStateAtFrame({
      frame,
      fps,
      doorMode,
      launchMode,
      lightRevealMode,
    });
    const t = Math.max(0, frame) / Math.max(1, fps);

    // 1. Update Animated 4-Panel Garage Door along the 2 Ceiling Tracks
    for (let i = 0; i < doorPanelGroups.length; i++) {
      const pose = state.doorPanelPoses[i];
      const pg = doorPanelGroups[i];
      pg.position.set(0, pose.y, pose.z);
      pg.rotation.x = pose.rotationX;
    }

    // 2. Update 3 Overhead Lamps Dramatic Reveal
    for (let i = 0; i < 3; i++) {
      const intensity = state.lampIntensities[i];
      lampPointLights[i].intensity = intensity;
      lampConeMats[i].opacity = Math.min(0.12, (intensity / 7.5) * 0.085);
    }

    // 3. Update Sub-Floor Silo Hatch Doors ("ground opens up a little bit") & Hydraulic Elevator ("and it comes out!")
    const hatchOpen = state.siloGroundOpenProgress01;
    // Left & Right diamond-plate ground hatch doors slide outward by 0.38m and hinge open by 28 degrees (0.49 rad)
    leftSiloHatchPivot.position.set(-0.88 - hatchOpen * 0.38, 0.02, 0);
    leftSiloHatchPivot.rotation.z = hatchOpen * 0.49;

    rightSiloHatchPivot.position.set(0.88 + hatchOpen * 0.38, 0.02, 0);
    rightSiloHatchPivot.rotation.z = -hatchOpen * 0.49;

    // Update Silo Elevator Platform & Scissor-Lift Linkages
    siloElevatorPlatformGroup.position.set(0, state.nukeWorldY, 0);
    siloThrottleLever.rotation.x = -0.35 + state.nukeElevatorRiseProgress01 * 0.7;

    // Subterranean pit light & flashing warning strobes
    siloPitPointLight.intensity = hatchOpen * 7.5;
    const beaconScale = 0.85 + 0.35 * state.siloWarningBeaconFlash01;
    for (const bm of beaconMeshes) {
      bm.scale.set(beaconScale, beaconScale, beaconScale);
    }

    // Pressurized Subterranean Steam Puffs rising out of the opening ground hatch seam
    const steamInt = state.siloSteamVentIntensity01 * Math.max(0, vfxIntensity);
    for (let i = 0; i < siloSteamPuffs.length; i++) {
      const sp = siloSteamPuffs[i];
      if (steamInt <= 0.02) {
        sp.visible = false;
      } else {
        sp.visible = true;
        const u = (t * 1.35 + i / siloSteamPuffs.length) % 1;
        const zPos = -1.15 + (i / (siloSteamPuffs.length - 1)) * 2.3;
        const xSpread = (i % 2 === 0 ? -1 : 1) * (0.08 + u * 0.48);
        sp.position.set(xSpread, 0.05 + u * 1.15, zPos);
        const sc = (0.35 + u * 1.15) * steamInt;
        sp.scale.set(sc, sc * 0.9, sc);
      }
    }

    // 4. Update Hype Man Cardboard Countdown Sign Canvas
    if (countdownCtx) {
      renderCardboardCountdownCanvas(
        countdownCtx,
        state.countdownDigitText,
        state.countdownSubtext,
        state.countdownColorHex,
      );
      countdownTex.needsUpdate = true;
    }
    countdownBoardMesh.rotation.z = state.countdownBoardTiltRad;

    // 5. Update Rusty Trolley & Cartoon Nuke Visibility + Hydraulic Emergence Y Position
    // When concealed underground (ground closed), hide the nuke completely ("do not shoow the nuke")!
    trolleyAndNukeGroup.visible = !state.nukeConcealedUnderground;
    trolleyAndNukeGroup.position.set(
      0,
      state.nukeWorldY,
      -0.35 + state.trolleyForwardSurgeMeters,
    );
    for (const w of trolleyWheels) {
      w.rotation.x = state.wheelRotationRad;
    }
    cartoonNukeAssembly.position.set(
      state.nukeVibrationOffset[0],
      1.04 + state.nukeVibrationOffset[1],
      0.08 + state.nukeVibrationOffset[2],
    );
    noseFuseTip.rotation.z = t * 12.0;

    // 6. Update Launch Fire, Launch Smoke & Ground Dust Reusable Effects
    const vfxMult = Math.max(0, vfxIntensity);
    const fireScale = state.launchFireIntensity01 * vfxMult;
    launchFireGroup.visible = fireScale > 0.02 && !state.nukeConcealedUnderground;
    launchFireGroup.position.set(
      0,
      0.88 + state.nukeWorldY,
      -1.48 + state.trolleyForwardSurgeMeters,
    );
    const flicker = 0.88 + 0.24 * Math.abs(Math.sin(t * 38));
    outerFlameCone.scale.set(
      Math.max(0.001, fireScale * flicker),
      Math.max(0.001, fireScale * (0.9 + 0.3 * Math.cos(t * 44))),
      Math.max(0.001, fireScale * flicker),
    );
    innerPlasmaCone.scale.set(
      Math.max(0.001, fireScale),
      Math.max(0.001, fireScale * flicker),
      Math.max(0.001, fireScale),
    );
    thrusterFireLight.intensity = 9.5 * fireScale * flicker;

    for (let s = 0; s < fireSparkMeshes.length; s++) {
      const sp = fireSparkMeshes[s];
      if (fireScale <= 0.02) {
        sp.visible = false;
        continue;
      }
      sp.visible = true;
      const u = ((t * 3.8 + s * 0.13) % 1) * fireScale;
      const angle = s * 2.15 + t * 5.0;
      const rad = 0.08 + u * 0.55;
      sp.position.set(
        Math.cos(angle) * rad,
        Math.sin(angle) * rad,
        -0.15 - u * 1.65,
      );
      const sc = Math.max(0.01, (1 - u * 0.7) * 1.2 * vfxMult);
      sp.scale.set(sc, sc, sc);
    }

    // Launch Smoke plumes
    const smokeScaleBase = state.launchSmokeScale01 * vfxMult;
    for (let i = 0; i < launchSmokeMeshes.length; i++) {
      const puff = launchSmokeMeshes[i];
      if (smokeScaleBase <= 0.02) {
        puff.visible = false;
        continue;
      }
      puff.visible = true;
      const u = (t * 0.95 + i / launchSmokeMeshes.length) % 1;
      const angle = i * 1.7 + t * 1.4;
      const spread = 0.18 + u * 1.15;
      puff.position.set(
        Math.cos(angle) * spread,
        0.24 + Math.abs(Math.sin(angle * 0.7)) * (0.35 + u * 0.95),
        -1.45 + state.trolleyForwardSurgeMeters - u * 1.85,
      );
      const sc = Math.max(0.01, (0.45 + u * 1.45) * smokeScaleBase);
      puff.scale.set(sc, sc * 0.85, sc);
    }

    // Ground Dust (Radial Shockwave Ring + Sprint-Gag Floor Dust Puffs)
    const dustActive = state.groundDustRingRadius01 > 0.02 && vfxMult > 0.02;
    shockwaveDustRing.visible = dustActive;
    const ringR = 0.65 + state.groundDustRingRadius01 * 1.65;
    shockwaveDustRing.scale.set(
      Math.max(0.01, ringR * vfxMult),
      Math.max(0.01, ringR * vfxMult),
      1,
    );
    for (let d = 0; d < groundDustMeshes.length; d++) {
      const dm = groundDustMeshes[d];
      if (!dustActive) {
        dm.visible = false;
        continue;
      }
      dm.visible = true;
      const a = (d / groundDustMeshes.length) * Math.PI * 2 + t * 1.2;
      const dist = 0.75 + ((t * 1.4 + d * 0.19) % 1) * 1.85;
      dm.position.set(
        Math.cos(a) * dist,
        0.08 + (d % 3) * 0.04,
        -0.35 + Math.sin(a) * dist * 0.85,
      );
      const dScale = Math.max(0.01, (0.65 + (d % 4) * 0.22) * vfxMult);
      dm.scale.set(dScale, dScale * 0.65, dScale);
    }

    for (const inkObj of inkLineObjects) {
      inkObj.visible = inkOutlinesEnabled && !wireframeMode;
    }

    // Update 3D Character Cast inside Garage Nuclear Launch Bay
    threeGarageCast.updateAtFrame(frame, fps);

    for (const mat of materialsToDispose) {
      if ('wireframe' in mat) {
        (mat as THREE.MeshToonMaterial).wireframe = wireframeMode;
      }
    }
  };

  const threeGarageCast = buildThreeSceneCastDirector('garage-nuclear-launch');
  rootGroup.add(threeGarageCast.rootGroup);

  const dispose = () => {
    threeGarageCast.dispose();
    disposeStyleResources();
    for (const g of geometriesToDispose) g.dispose();
    for (const m of materialsToDispose) m.dispose();
    for (const t of texturesToDispose) t.dispose();
  };

  return {
    rootGroup,
    inkLineObjects,
    updateForFrame,
    dispose,
  };
}
