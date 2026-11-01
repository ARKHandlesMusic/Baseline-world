import * as THREE from 'three';
import {
  BedroomDoorControlMode,
  DARK_ROOM_DESK_SPEC,
  DarkRoomDustMoteSpec,
  DarkRoomLightModeId,
  PhoneGlowColorModeId,
  PhoneScreenGlowState,
  evaluateDarkRoomDoorRigAtFrame,
  evaluateDarkRoomDustMoteAtFrame,
  evaluatePhoneScreenGlowAtFrame,
  generateDarkRoomDustMotes,
} from './dark-room-bedroom-manifest';
import {
  applyMainStreetStyleToSceneGraph,
  convertStandardToMainStreetToonMaterial,
  createMainStreetToonGradientTexture,
  drawMainStreetComicHatchAndBorderOverlay,
} from './main-street-style-engine';
import { buildThreeSceneCastDirector } from './characters/three-scene-cast-director';

export interface DarkRoomInspectableMeta {
  id: string;
  label: string;
  category: string;
  target: [number, number, number];
  optimalDistance: number;
  cameraPosition?: [number, number, number];
}

export interface DarkRoomSceneHandle {
  rootGroup: THREE.Group;
  inkLineObjects: THREE.Object3D[];
  updateForFrame: (params: {
    frame: number;
    fps: number;
    lightMode: DarkRoomLightModeId;
    phoneGlowColorMode: PhoneGlowColorModeId;
    phoneGlowMultiplier: number;
    doorControlMode: BedroomDoorControlMode;
    dustIntensity: number;
    inkOutlinesEnabled?: boolean;
    wireframeMode: boolean;
  }) => void;
  dispose: () => void;
}

function attachInspectable(
  obj: THREE.Object3D,
  meta: DarkRoomInspectableMeta,
): void {
  obj.userData.inspectable = meta;
}

function createWalnutFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#2B1B12';
    ctx.fillRect(0, 0, 512, 512);
    const plankRows = 8;
    const plankH = 512 / plankRows;
    for (let r = 0; r < plankRows; r++) {
      const y = r * plankH;
      ctx.fillStyle = r % 2 === 0 ? '#382317' : '#2E1C12';
      ctx.fillRect(0, y + 1, 512, plankH - 2);
      ctx.strokeStyle = '#140B07';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, y, 512, plankH);

      // Wood grain streaks
      ctx.strokeStyle = 'rgba(92, 58, 38, 0.42)';
      ctx.lineWidth = 1.5;
      for (let g = 0; g < 6; g++) {
        ctx.beginPath();
        ctx.moveTo(0, y + 8 + g * 9);
        ctx.bezierCurveTo(
          170,
          y + 4 + g * 9 + (r % 3) * 3,
          340,
          y + 12 + g * 9 - (r % 2) * 3,
          512,
          y + 8 + g * 9,
        );
        ctx.stroke();
      }
      // Vertical plank joint
      const jointX = ((r * 173 + 95) % 420) + 45;
      ctx.strokeStyle = '#120A06';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(jointX, y);
      ctx.lineTo(jointX, y + plankH);
      ctx.stroke();
    }
    drawMainStreetComicHatchAndBorderOverlay(ctx, 512, 512, {
      hatchCount: 28,
      borderWidth: 0,
      hatchAlpha: 0.36,
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createWallPosterTexture(variant: 0 | 1 | 2): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 680;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (variant === 0) {
      // Poster 1: OMNIFRAME // MIDNIGHT PROTOCOL
      const grad = ctx.createLinearGradient(0, 0, 0, 680);
      grad.addColorStop(0, '#090D16');
      grad.addColorStop(0.55, '#1E1B4B');
      grad.addColorStop(1, '#3B0764');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 680);

      const sunGrad = ctx.createLinearGradient(0, 150, 0, 390);
      sunGrad.addColorStop(0, '#22D3EE');
      sunGrad.addColorStop(0.5, '#E879F9');
      sunGrad.addColorStop(1, '#F43F5E');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(256, 275, 118, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1E1B4B';
      for (let s = 0; s < 6; s++) {
        ctx.fillRect(120, 290 + s * 16, 272, 4 + s * 1.5);
      }

      ctx.strokeStyle = '#22D3EE';
      ctx.lineWidth = 2;
      for (let i = -6; i <= 6; i++) {
        ctx.beginPath();
        ctx.moveTo(256 + i * 18, 420);
        ctx.lineTo(256 + i * 75, 650);
        ctx.stroke();
      }
      for (let h = 0; h < 6; h++) {
        const y = 420 + h * 38;
        ctx.beginPath();
        ctx.moveTo(24, y);
        ctx.lineTo(488, y);
        ctx.stroke();
      }

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 8;
      ctx.strokeRect(18, 18, 476, 644);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 42px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OMNIFRAME', 256, 82);
      ctx.fillStyle = '#22D3EE';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('MIDNIGHT PROTOCOL // 2026', 256, 122);
      ctx.fillStyle = '#F472B6';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('LIVE AUDIO-REACTIVE WORLD TOUR', 256, 625);
    } else if (variant === 1) {
      // Poster 2: CRACK & SONS MIDNIGHT EDITION
      const grad = ctx.createLinearGradient(0, 0, 0, 680);
      grad.addColorStop(0, '#1C0D0A');
      grad.addColorStop(0.5, '#450A0A');
      grad.addColorStop(1, '#0F172A');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 680);

      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 10;
      ctx.strokeRect(20, 20, 472, 640);

      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.moveTo(156, 260);
      ctx.lineTo(176, 180);
      ctx.lineTo(216, 225);
      ctx.lineTo(256, 165);
      ctx.lineTo(296, 225);
      ctx.lineTo(336, 180);
      ctx.lineTo(356, 260);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#EF4444';
      ctx.fillRect(176, 275, 160, 145);
      ctx.fillStyle = '#F8FAFC';
      for (let t = 0; t < 6; t++) {
        ctx.fillRect(186 + t * 24, 345, 18, 32);
      }

      ctx.fillStyle = '#FEF08A';
      ctx.font = 'bold 38px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CRACK & SONS', 256, 92);
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('MIDNIGHT HUSSAR EDITION', 256, 134);
      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('9,000 PSI TITANIUM JAW', 256, 515);
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('MAIN STREET COLLECTOR SERIES #01', 256, 595);
    } else {
      // Poster 3: TOKYO LO-FI DRIFT 02:14 AM
      const grad = ctx.createLinearGradient(0, 0, 512, 680);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.6, '#0F172A');
      grad.addColorStop(1, '#1E1B4B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 680);

      const cols = ['#22D3EE', '#A855F7', '#F43F5E', '#38BDF8'];
      for (let b = 0; b < 14; b++) {
        const bh = 120 + ((b * 53) % 210);
        ctx.fillStyle = '#090D16';
        ctx.fillRect(28 + b * 33, 470 - bh, 28, bh);
        ctx.fillStyle = cols[b % cols.length];
        for (let w = 0; w < 6; w++) {
          ctx.fillRect(33 + b * 33, 485 - bh + w * 26, 18, 10);
        }
      }

      ctx.fillStyle = '#F43F5E';
      ctx.fillRect(105, 510, 110, 18);
      ctx.fillRect(297, 510, 110, 18);
      ctx.strokeStyle = '#22D3EE';
      ctx.lineWidth = 6;
      ctx.strokeRect(16, 16, 480, 648);

      ctx.fillStyle = '#22D3EE';
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LO-FI NIGHT DRIFT', 256, 86);
      ctx.fillStyle = '#E879F9';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('CHILL BEATS TO CODE & ANIMATE TO', 256, 128);
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('02:14 AM // CHANNEL 88.4 FM', 256, 610);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createMonitorScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#070B14';
    ctx.fillRect(0, 0, 1024, 512);

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 1024, 44);
    ctx.fillStyle = '#22D3EE';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(
      'OMNIFRAME STUDIO // BEDROOM_SESSION_0214.RPP  [60.0 FPS | 120 BPM]',
      24,
      29,
    );

    const trackColors = ['#22D3EE', '#E879F9', '#38BDF8', '#F43F5E', '#34D399'];
    const trackNames = [
      '01. SUB BASS 808',
      '02. SYNTH ARPEGGIO',
      '03. LO-FI RHODES',
      '04. PHONE FX CHIME',
      '05. MASTER VOCAL',
    ];
    for (let i = 0; i < 5; i++) {
      const y = 64 + i * 76;
      ctx.fillStyle = '#111827';
      ctx.fillRect(18, y, 210, 64);
      ctx.fillStyle = trackColors[i];
      ctx.fillRect(18, y, 8, 64);
      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 17px monospace';
      ctx.fillText(trackNames[i], 36, y + 38);

      ctx.fillStyle = '#0B1120';
      ctx.fillRect(240, y, 760, 64);
      ctx.strokeStyle = trackColors[i];
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < 740; x += 6) {
        const amp =
          (Math.sin(x * 0.05 + i * 1.4) * 0.5 +
            Math.cos(x * 0.13 - i) * 0.5) *
          22;
        if (x === 0) ctx.moveTo(250 + x, y + 32 + amp);
        else ctx.lineTo(250 + x, y + 32 + amp);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(580, 48);
    ctx.lineTo(580, 460);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createWindowCitySkylineTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0B132B');
    grad.addColorStop(0.55, '#1C2541');
    grad.addColorStop(1, '#3A506B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Moon & stars
    ctx.fillStyle = '#FEF9C3';
    ctx.beginPath();
    ctx.arc(380, 110, 36, 0, Math.PI * 2);
    ctx.fill();

    // Distant city buildings & glowing windows
    for (let i = 0; i < 12; i++) {
      const bx = i * 44;
      const bh = 160 + ((i * 67) % 180);
      ctx.fillStyle = '#090F1C';
      ctx.fillRect(bx, 512 - bh, 40, bh);
      for (let wy = 512 - bh + 14; wy < 495; wy += 18) {
        for (let wx = bx + 6; wx < bx + 32; wx += 12) {
          if ((wx + wy + i) % 3 !== 0) {
            ctx.fillStyle =
              (wx + wy) % 5 === 0
                ? '#22D3EE'
                : (wx + wy) % 4 === 0
                  ? '#F472B6'
                  : '#FDE047';
            ctx.fillRect(wx, wy, 7, 9);
            ctx.strokeStyle = '#0A0812';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(wx, wy, 7, 9);
          }
        }
      }
      ctx.strokeStyle = '#0A0812';
      ctx.lineWidth = 3;
      ctx.strokeRect(bx, 512 - bh, 40, bh);
    }

    // Diagonal Cel-Shaded Anime Window Reflection Slashes (matching Main Street windows)
    ctx.fillStyle = '#BAE6FD';
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.moveTo(40, 512);
    ctx.lineTo(220, 0);
    ctx.lineTo(270, 0);
    ctx.lineTo(90, 512);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(120, 512);
    ctx.lineTo(300, 0);
    ctx.lineTo(324, 0);
    ctx.lineTo(144, 512);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    drawMainStreetComicHatchAndBorderOverlay(ctx, 512, 512, {
      hatchCount: 18,
      borderWidth: 10,
      hatchAlpha: 0.28,
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Draws the live 60fps Smartphone Screen/UI onto the 512×1024 OLED canvas.
 */
function renderPhoneScreenCanvas(
  ctx: CanvasRenderingContext2D,
  state: PhoneScreenGlowState,
): void {
  const w = 512;
  const h = 1024;

  const bgGrad = ctx.createRadialGradient(
    w * 0.5,
    h * 0.44,
    25,
    w * 0.5,
    h * 0.5,
    560,
  );
  bgGrad.addColorStop(0, state.primaryColorHex);
  bgGrad.addColorStop(0.48, state.secondaryColorHex);
  bgGrad.addColorStop(1, '#061024');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 8;
  ctx.strokeRect(14, 14, w - 28, h - 28);

  // Dynamic Island / Speaker Cutout + Top Status Bar
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(176, 28, 160, 36, 18);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(state.clockTimeText, 38, 56);
  ctx.textAlign = 'right';
  ctx.fillText(`5G • ${state.batteryPercent}%`, w - 38, 56);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 116px sans-serif';
  ctx.fillText(state.clockTimeText, w / 2, 195);
  ctx.fillStyle = '#E0F2FE';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('FRIDAY, OCTOBER 30 • STUDIO SYNC', w / 2, 236);

  const centerY = 475;
  for (let r = 0; r < 3; r++) {
    const rad =
      72 +
      r * 48 +
      state.ringRippleRadius01 * 42 +
      state.notificationPulse01 * 18;
    ctx.strokeStyle =
      r === 0
        ? '#FFFFFF'
        : r === 1
          ? state.primaryColorHex
          : state.secondaryColorHex;
    ctx.lineWidth = 6 - r * 1.5;
    ctx.beginPath();
    ctx.arc(w / 2, centerY, rad, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
  ctx.beginPath();
  ctx.roundRect(36, 305, w - 72, 340, 28);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('⚡ LIVE OLED SCREEN UI ⚡', w / 2, 355);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 31px sans-serif';
  ctx.fillText(state.screenHeadline, w / 2, 412);

  ctx.fillStyle = '#BAE6FD';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(state.screenSubtext, w / 2, 452);

  const barCount = state.equalizerBars.length;
  const totalBarW = 360;
  const barW = 20;
  const startX = (w - totalBarW) / 2;
  for (let i = 0; i < barCount; i++) {
    const val = state.equalizerBars[i];
    const bh = Math.max(14, val * 120);
    const bx = startX + i * 30;
    const by = 608 - bh;
    ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#FEF08A';
    ctx.fillRect(bx, by, barW, bh);
  }

  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.roundRect(48, 700, 190, 86, 43);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('ANSWER', 143, 752);

  ctx.fillStyle = '#EC4899';
  ctx.beginPath();
  ctx.roundRect(274, 700, 190, 86, 43);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('PLAY TRACK', 369, 752);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(
    `LUMINANCE: ${Math.round(state.keyLightIntensity * 280)} NITS`,
    w / 2,
    865,
  );

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(166, 968, 180, 12, 6);
  ctx.fill();
}

export function buildDarkRoomBedroomScene(): DarkRoomSceneHandle {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'DarkRoomBedroomSceneRoot';

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
  // 1. BEDROOM SHELL (1), FLOOR AND WALLS (1 SET) & CEILING LIGHTING FIXTURES
  // Room dimensions: X in [-3.6, +3.6] (7.2m), Z in [-2.9, +2.9] (5.8m), Y in [0, 3.2]
  // =========================================================================
  const roomShellGroup = new THREE.Group();
  roomShellGroup.name = 'BedroomShellAndFloorWalls';
  rootGroup.add(roomShellGroup);

  const floorTex = trackTex(createWalnutFloorTexture());
  const floorMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.45,
      metalness: 0.08,
    }),
  );
  const floorMesh = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(7.2, 5.8)),
    floorMat,
  );
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(0, 0, 0);
  roomShellGroup.add(floorMesh);

  const wallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#253146',
      roughness: 0.72,
      metalness: 0.05,
    }),
  );
  const wainscotMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#192233',
      roughness: 0.62,
      metalness: 0.08,
    }),
  );
  const trimMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.5,
      metalness: 0.15,
    }),
  );

  // North Wall
  const northWall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(7.2, 3.2, 0.12)),
    wallMat,
  );
  northWall.position.set(0, 1.6, -2.9);
  roomShellGroup.add(northWall);

  const northWainscot = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(7.16, 0.95, 0.03)),
    wainscotMat,
  );
  northWainscot.position.set(0, 0.475, -2.83);
  roomShellGroup.add(northWainscot);

  // West Wall
  const westWall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.12, 3.2, 5.8)),
    wallMat,
  );
  westWall.position.set(-3.6, 1.6, 0);
  roomShellGroup.add(westWall);

  // East Wall
  const eastWall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.12, 3.2, 5.8)),
    wallMat,
  );
  eastWall.position.set(3.6, 1.6, 0);
  roomShellGroup.add(eastWall);

  const eastWainscot = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.03, 0.95, 5.76)),
    wainscotMat,
  );
  eastWainscot.position.set(3.53, 0.475, 0);
  roomShellGroup.add(eastWainscot);

  // South Wall with doorway opening on the right
  const southWallLeft = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(5.05, 3.2, 0.12)),
    wallMat,
  );
  southWallLeft.position.set(-1.075, 1.6, 2.9);
  roomShellGroup.add(southWallLeft);

  const southWallRight = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.15, 3.2, 0.12)),
    wallMat,
  );
  southWallRight.position.set(3.025, 1.6, 2.9);
  roomShellGroup.add(southWallRight);

  const southDoorHeader = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.0, 0.85, 0.12)),
    wallMat,
  );
  southDoorHeader.position.set(1.95, 2.775, 2.9);
  roomShellGroup.add(southDoorHeader);

  // Ceiling (1) + Modern Ceiling Ring Chandelier & 4 Recessed Downlights
  const ceilingMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(7.2, 0.1, 5.8)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#1E293B',
        roughness: 0.8,
      }),
    ),
  );
  ceilingMesh.position.set(0, 3.2, 0);
  roomShellGroup.add(ceilingMesh);

  const ceilingGlowMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#FFFBEB',
    }),
  );
  const brassFixtureMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#FACC15',
      roughness: 0.25,
      metalness: 0.85,
    }),
  );

  // Center Ceiling Ring Chandelier Fixture
  const ceilingChandelier = new THREE.Group();
  ceilingChandelier.position.set(0, 3.12, -0.35);
  roomShellGroup.add(ceilingChandelier);

  const outerRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.58, 0.025, 12, 36)),
    brassFixtureMat,
  );
  outerRing.rotation.x = Math.PI / 2;
  ceilingChandelier.add(outerRing);

  const innerGlowRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.54, 0.018, 10, 36)),
    ceilingGlowMat,
  );
  innerGlowRing.rotation.x = Math.PI / 2;
  ceilingChandelier.add(innerGlowRing);

  // 4 Recessed Ceiling Downlights
  const downlightCoords: Array<[number, number]> = [
    [-1.85, -1.55],
    [1.85, -1.55],
    [-1.85, 1.15],
    [1.85, 1.15],
  ];
  for (const [dx, dz] of downlightCoords) {
    const canBezel = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 20)),
      brassFixtureMat,
    );
    canBezel.position.set(dx, 3.14, dz);
    roomShellGroup.add(canBezel);

    const canLens = new THREE.Mesh(
      trackGeo(new THREE.CircleGeometry(0.095, 20)),
      ceilingGlowMat,
    );
    canLens.rotation.x = Math.PI / 2;
    canLens.position.set(dx, 3.128, dz);
    roomShellGroup.add(canLens);
  }

  // Baseboards
  const northBaseboard = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(7.16, 0.12, 0.04)),
    trimMat,
  );
  northBaseboard.position.set(0, 0.06, -2.82);
  roomShellGroup.add(northBaseboard);

  // =========================================================================
  // 2. BED (1) & BLANKET AND PILLOW (1 SET) + BEDSIDE WALL SCONCE
  // Positioned along East wall: centerX = 2.15, centerZ = -0.95
  // =========================================================================
  const bedAndBeddingGroup = new THREE.Group();
  bedAndBeddingGroup.name = 'BedAndBeddingSet';
  bedAndBeddingGroup.position.set(2.15, 0, -0.95);
  attachInspectable(bedAndBeddingGroup, {
    id: 'bed-and-blanket-pillow-set',
    label:
      'Platform Bed (1) + Quilted Duvet Blanket & 3 Plush Pillows Set (1 Set)',
    category: 'Bed + Blanket & Pillow Set',
    target: [2.15, 0.68, -0.95],
    optimalDistance: 2.2,
    cameraPosition: [0.15, 1.48, 0.55],
  });
  rootGroup.add(bedAndBeddingGroup);

  const bedWoodMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#3E2417',
      roughness: 0.45,
      metalness: 0.1,
    }),
  );
  const headboardUpholsteryMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.68,
    }),
  );

  // Platform base frame
  const bedPlatform = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.12, 0.28, 1.72)),
    bedWoodMat,
  );
  bedPlatform.position.set(0.15, 0.16, 0);
  bedAndBeddingGroup.add(bedPlatform);

  // Headboard against East Wall
  const headboardFrame = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.12, 1.34, 1.78)),
    bedWoodMat,
  );
  headboardFrame.position.set(1.18, 0.67, 0);
  bedAndBeddingGroup.add(headboardFrame);

  for (let p = -1; p <= 1; p++) {
    const pad = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.06, 0.72, 0.52)),
      headboardUpholsteryMat,
    );
    pad.position.set(1.11, 0.82, p * 0.56);
    bedAndBeddingGroup.add(pad);
  }

  // Fitted Mattress
  const mattressMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#E2E8F0',
      roughness: 0.75,
    }),
  );
  const mattressMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.98, 0.24, 1.58)),
    mattressMat,
  );
  mattressMesh.position.set(0.12, 0.42, 0);
  bedAndBeddingGroup.add(mattressMesh);

  // Quilted Duvet Blanket (1) with sculpted organic folds
  const blanketMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#1E3A8A',
      roughness: 0.58,
      metalness: 0.08,
    }),
  );
  const blanketMain = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.52, 0.27, 1.64)),
    blanketMat,
  );
  blanketMain.position.set(-0.12, 0.43, 0);
  bedAndBeddingGroup.add(blanketMain);

  for (let f = 0; f < 5; f++) {
    const fold = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.065, 0.075, 1.62, 14)),
      blanketMat,
    );
    fold.rotation.x = Math.PI / 2;
    fold.position.set(-0.68 + f * 0.28, 0.56, 0);
    bedAndBeddingGroup.add(fold);
  }

  const foldBackMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#3B82F6',
      roughness: 0.55,
    }),
  );
  const sheetFold = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.24, 0.28, 1.65)),
    foldBackMat,
  );
  sheetFold.position.set(0.58, 0.44, 0);
  bedAndBeddingGroup.add(sheetFold);

  // 3 Plush Pillows
  const pillowMainMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#F8FAFC',
      roughness: 0.65,
    }),
  );
  const pillowAccentMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#F59E0B',
      roughness: 0.55,
    }),
  );
  for (const pz of [-0.42, 0.42]) {
    const pillow = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.36, 0.14, 0.62)),
      pillowMainMat,
    );
    pillow.position.set(0.86, 0.61, pz);
    pillow.rotation.z = 0.24;
    bedAndBeddingGroup.add(pillow);
  }
  const accentPillow = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.26, 0.16, 0.44)),
    pillowAccentMat,
  );
  accentPillow.position.set(0.68, 0.62, 0);
  accentPillow.rotation.z = 0.32;
  bedAndBeddingGroup.add(accentPillow);

  // Warm Bedside Wall Sconce above Headboard
  const bedsideSconce = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.07, 0.09, 0.22, 16)),
    ceilingGlowMat,
  );
  bedsideSconce.position.set(3.46, 1.62, -2.05);
  rootGroup.add(bedsideSconce);

  // =========================================================================
  // 3. DESK (1) & CHAIR (1)
  // Desk top surface at y = 0.76m, centerX = -0.35, centerZ = -2.18
  // =========================================================================
  const deskGroup = new THREE.Group();
  deskGroup.name = 'CreatorDeskUnit';
  attachInspectable(deskGroup, {
    id: 'creator-desk-01',
    label:
      'Dark Oak & Brushed-Steel Creator Desk (1) with 3-Drawer Cabinet & Stitched Desk Mat',
    category: 'Desk (1)',
    target: [-0.35, 0.78, -2.18],
    optimalDistance: 1.85,
    cameraPosition: [0.25, 1.42, -0.85],
  });
  rootGroup.add(deskGroup);

  const deskWoodMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#3A2318',
      roughness: 0.38,
      metalness: 0.12,
    }),
  );
  const steelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.32,
      metalness: 0.78,
    }),
  );

  const tabletop = new THREE.Mesh(
    trackGeo(
      new THREE.BoxGeometry(
        DARK_ROOM_DESK_SPEC.width,
        DARK_ROOM_DESK_SPEC.thickness,
        DARK_ROOM_DESK_SPEC.depth,
      ),
    ),
    deskWoodMat,
  );
  tabletop.position.set(
    DARK_ROOM_DESK_SPEC.centerX,
    DARK_ROOM_DESK_SPEC.topSurfaceY - DARK_ROOM_DESK_SPEC.thickness / 2,
    DARK_ROOM_DESK_SPEC.centerZ,
  );
  deskGroup.add(tabletop);

  // Stitched desk mat (top surface at y = 0.765m)
  const deskMatMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.12, 0.005, 0.56)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#0F172A',
        roughness: 0.65,
        metalness: 0.1,
      }),
    ),
  );
  deskMatMesh.position.set(-0.37, 0.7625, -2.12);
  deskGroup.add(deskMatMesh);

  for (const lz of [-2.52, -1.84]) {
    const leg = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.055, 0.715, 0.055)),
      steelMat,
    );
    leg.position.set(-1.21, 0.3575, lz);
    deskGroup.add(leg);
  }

  // Right 3-drawer cabinet under desk
  const cabinet = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.46, 0.715, 0.76)),
    deskWoodMat,
  );
  cabinet.position.set(0.32, 0.3575, -2.18);
  deskGroup.add(cabinet);

  for (let d = 0; d < 3; d++) {
    const drawerFront = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.42, 0.2, 0.02)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: '#2B1911',
          roughness: 0.45,
        }),
      ),
    );
    drawerFront.position.set(0.32, 0.16 + d * 0.22, -1.79);
    deskGroup.add(drawerFront);

    const handleBar = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.14, 0.018, 0.025)),
      steelMat,
    );
    handleBar.position.set(0.32, 0.16 + d * 0.22, -1.77);
    deskGroup.add(handleBar);
  }

  // Ergonomic Swivel Chair (1) at [-0.45, 0, -1.25]
  const chairGroup = new THREE.Group();
  chairGroup.name = 'ErgonomicStudioChair';
  chairGroup.position.set(-0.45, 0, -1.25);
  chairGroup.rotation.y = Math.PI + 0.18;
  attachInspectable(chairGroup, {
    id: 'studio-chair-01',
    label:
      'Ergonomic Studio Swivel Chair (1) with 5-Star Caster Base, Bucket Seat & Lumbar Pillow',
    category: 'Chair (1)',
    target: [-0.45, 0.65, -1.25],
    optimalDistance: 1.65,
    cameraPosition: [0.65, 1.28, -0.35],
  });
  rootGroup.add(chairGroup);

  const chairLeatherMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#1E293B',
      roughness: 0.45,
      metalness: 0.15,
    }),
  );
  const chairAccentMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#0EA5E9',
      roughness: 0.4,
      metalness: 0.25,
    }),
  );

  const cylinderPost = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.032, 0.038, 0.38, 12)),
    steelMat,
  );
  cylinderPost.position.set(0, 0.24, 0);
  chairGroup.add(cylinderPost);

  for (let armIdx = 0; armIdx < 5; armIdx++) {
    const a = (armIdx * Math.PI * 2) / 5;
    const legArm = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.04, 0.03, 0.34)),
      steelMat,
    );
    legArm.position.set(Math.sin(a) * 0.16, 0.06, Math.cos(a) * 0.16);
    legArm.rotation.y = a;
    chairGroup.add(legArm);

    const caster = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 10)),
      chairLeatherMat,
    );
    caster.rotation.z = Math.PI / 2;
    caster.position.set(Math.sin(a) * 0.31, 0.03, Math.cos(a) * 0.31);
    chairGroup.add(caster);
  }

  const seatCushion = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.52, 0.09, 0.5)),
    chairLeatherMat,
  );
  seatCushion.position.set(0, 0.46, 0);
  chairGroup.add(seatCushion);

  const backrest = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.48, 0.82, 0.09)),
    chairLeatherMat,
  );
  backrest.position.set(0, 0.88, -0.22);
  backrest.rotation.x = -0.1;
  chairGroup.add(backrest);

  const headrestStripe = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.32, 0.14, 0.11)),
    chairAccentMat,
  );
  headrestStripe.position.set(0, 1.18, -0.24);
  chairGroup.add(headrestStripe);

  for (const side of [-1, 1]) {
    const armrestPost = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.035, 0.22, 0.05)),
      steelMat,
    );
    armrestPost.position.set(side * 0.27, 0.56, -0.02);
    chairGroup.add(armrestPost);

    const armPad = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.08, 0.03, 0.26)),
      chairLeatherMat,
    );
    armPad.position.set(side * 0.27, 0.67, 0.02);
    chairGroup.add(armPad);
  }

  // =========================================================================
  // 4. SMARTPHONE (1) & PHONE SCREEN/UI (1 INTERFACE)
  // Resting cleanly on the desk mat at [-0.02, 0.765, -1.94]
  // =========================================================================
  const smartphoneGroup = new THREE.Group();
  smartphoneGroup.name = 'HeroSmartphoneAndScreenUI';
  smartphoneGroup.position.set(-0.02, 0.765, -1.94);
  smartphoneGroup.rotation.y = -0.22;
  attachInspectable(smartphoneGroup, {
    id: 'hero-smartphone-01',
    label:
      'Smartphone (1) + 60fps OLED Phone Screen/UI (1 Interface) & Screen Glow Rig',
    category: 'Hero Phone & Screen Glow',
    target: [-0.02, 0.8, -1.94],
    optimalDistance: 0.85,
    cameraPosition: [0.12, 1.08, -1.32],
  });
  rootGroup.add(smartphoneGroup);

  const phoneBodyMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#1E293B',
      roughness: 0.22,
      metalness: 0.88,
    }),
  );
  const phoneChassis = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.086, 0.011, 0.174)),
    phoneBodyMat,
  );
  phoneChassis.position.set(0, 0.0055, 0);
  smartphoneGroup.add(phoneChassis);

  const phoneRim = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.09, 0.008, 0.178)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#38BDF8',
        roughness: 0.18,
        metalness: 0.92,
      }),
    ),
  );
  phoneRim.position.set(0, 0.005, 0);
  smartphoneGroup.add(phoneRim);

  const powerBtn = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.004, 0.004, 0.024)),
    phoneBodyMat,
  );
  powerBtn.position.set(0.046, 0.006, -0.025);
  smartphoneGroup.add(powerBtn);

  // Live 60fps Phone Screen/UI Canvas Texture
  const phoneCanvas = document.createElement('canvas');
  phoneCanvas.width = 512;
  phoneCanvas.height = 1024;
  const phoneCtx = phoneCanvas.getContext('2d');
  const phoneScreenTex = trackTex(new THREE.CanvasTexture(phoneCanvas));
  phoneScreenTex.colorSpace = THREE.SRGBColorSpace;

  const phoneScreenMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: phoneScreenTex,
    }),
  );
  const phoneScreenMesh = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.078, 0.164)),
    phoneScreenMat,
  );
  phoneScreenMesh.rotation.x = -Math.PI / 2;
  phoneScreenMesh.position.set(0, 0.0115, 0);
  smartphoneGroup.add(phoneScreenMesh);

  // Subtle Contact Glow Halo immediately around the Smartphone Bezel
  const phoneHaloMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#22D3EE',
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  const phoneSurfaceHalo = new THREE.Mesh(
    trackGeo(new THREE.RingGeometry(0.05, 0.14, 32)),
    phoneHaloMat,
  );
  phoneSurfaceHalo.rotation.x = -Math.PI / 2;
  phoneSurfaceHalo.position.set(0, 0.001, 0);
  smartphoneGroup.add(phoneSurfaceHalo);

  // Soft Translucent Screen Light Beam
  const phoneConeMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#22D3EE',
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  const phoneVolumetricCone = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.28, 0.065, 0.72, 24, 1, true)),
    phoneConeMat,
  );
  phoneVolumetricCone.position.set(0, 0.37, 0);
  smartphoneGroup.add(phoneVolumetricCone);

  // Smartphone Screen PointLight + Room Lights
  const phoneKeyLight = new THREE.PointLight('#22D3EE', 4.5, 3.8, 1.35);
  phoneKeyLight.position.set(-0.02, 0.92, -1.94);
  rootGroup.add(phoneKeyLight);

  const phoneBounceLight = new THREE.PointLight('#38BDF8', 2.2, 6.5, 1.2);
  phoneBounceLight.position.set(-0.02, 1.65, -1.65);
  rootGroup.add(phoneBounceLight);

  // =========================================================================
  // 5. SUNGLASSES (1 PAIR) — Resting beside the Smartphone
  // Placed at [-0.22, 0.765, -1.91]
  // =========================================================================
  const sunglassesGroup = new THREE.Group();
  sunglassesGroup.name = 'SunglassesPair';
  sunglassesGroup.position.set(-0.22, 0.765, -1.91);
  sunglassesGroup.rotation.y = 0.35;
  attachInspectable(sunglassesGroup, {
    id: 'sunglasses-pair-01',
    label:
      'Sunglasses (1 Pair): Cyber-Aviator Gold Frame & Tinted Lenses Reflecting the Smartphone & Lamp Glow',
    category: 'Sunglasses (1 Pair)',
    target: [-0.22, 0.79, -1.91],
    optimalDistance: 0.78,
    cameraPosition: [-0.1, 1.02, -1.38],
  });
  rootGroup.add(sunglassesGroup);

  const sunglassFrameMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#FACC15',
      roughness: 0.2,
      metalness: 0.92,
    }),
  );
  const sunglassLensMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#090D16',
      emissive: '#0891B2',
      emissiveIntensity: 0.45,
      roughness: 0.06,
      metalness: 0.95,
    }),
  );

  for (const side of [-1, 1]) {
    const lensRim = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.028, 0.0032, 10, 24)),
      sunglassFrameMat,
    );
    lensRim.position.set(side * 0.036, 0.028, 0.03);
    lensRim.rotation.x = -0.22;
    sunglassesGroup.add(lensRim);

    const lensGlass = new THREE.Mesh(
      trackGeo(new THREE.CircleGeometry(0.027, 24)),
      sunglassLensMat,
    );
    lensGlass.position.set(side * 0.036, 0.028, 0.031);
    lensGlass.rotation.x = -0.22;
    sunglassesGroup.add(lensGlass);

    const templeArm = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.004, 0.005, 0.115)),
      sunglassFrameMat,
    );
    templeArm.position.set(side * 0.064, 0.018, -0.025);
    templeArm.rotation.x = -0.14;
    sunglassesGroup.add(templeArm);
  }

  const topBridge = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.032, 0.003, 0.003)),
    sunglassFrameMat,
  );
  topBridge.position.set(0, 0.046, 0.026);
  sunglassesGroup.add(topBridge);

  const midBridge = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.022, 0.003, 0.003)),
    sunglassFrameMat,
  );
  midBridge.position.set(0, 0.032, 0.029);
  sunglassesGroup.add(midBridge);

  // =========================================================================
  // 6. COMPUTER MONITOR (1), KEYBOARD (1), AND MOUSE (1)
  // =========================================================================
  const monitorGroup = new THREE.Group();
  monitorGroup.name = 'ComputerMonitorUnit';
  monitorGroup.position.set(-0.48, 0.76, -2.38);
  monitorGroup.rotation.y = 0.05;
  attachInspectable(monitorGroup, {
    id: 'computer-monitor-01',
    label:
      '27-Inch Studio Computer Monitor (1) + Mechanical Keyboard (1) & Wireless Mouse (1)',
    category: 'Monitor, Keyboard & Mouse',
    target: [-0.45, 0.98, -2.18],
    optimalDistance: 1.35,
    cameraPosition: [-0.22, 1.24, -1.18],
  });
  rootGroup.add(monitorGroup);

  const standBase = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.28, 0.014, 0.18)),
    steelMat,
  );
  standBase.position.set(0, 0.007, 0);
  monitorGroup.add(standBase);

  const standNeck = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.045, 0.22, 0.035)),
    steelMat,
  );
  standNeck.position.set(0, 0.11, -0.04);
  monitorGroup.add(standNeck);

  const bezelMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.64, 0.37, 0.024)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#090D16',
        roughness: 0.35,
        metalness: 0.5,
      }),
    ),
  );
  bezelMesh.position.set(0, 0.33, 0);
  monitorGroup.add(bezelMesh);

  const monitorTex = trackTex(createMonitorScreenTexture());
  const monitorScreenMesh = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.61, 0.34)),
    trackMat(
      new THREE.MeshBasicMaterial({
        map: monitorTex,
      }),
    ),
  );
  monitorScreenMesh.position.set(0, 0.33, 0.013);
  monitorGroup.add(monitorScreenMesh);

  const monitorScreenLight = new THREE.PointLight('#38BDF8', 1.8, 3.5, 1.4);
  monitorScreenLight.position.set(-0.48, 1.08, -2.18);
  rootGroup.add(monitorScreenLight);

  // Mechanical Keyboard (1) at [-0.54, 0.765, -2.02]
  const keyboardGroup = new THREE.Group();
  keyboardGroup.name = 'MechanicalKeyboard';
  keyboardGroup.position.set(-0.54, 0.765, -2.02);
  keyboardGroup.rotation.y = 0.03;
  attachInspectable(keyboardGroup, {
    id: 'keyboard-mech-01',
    label:
      'Tenkeyless Mechanical Keyboard (1) with Sculpted Keycaps & Cyan Underglow',
    category: 'Keyboard (1)',
    target: [-0.54, 0.78, -2.02],
    optimalDistance: 0.9,
    cameraPosition: [-0.38, 1.08, -1.42],
  });
  rootGroup.add(keyboardGroup);

  const kbChassis = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.35, 0.022, 0.14)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#1E293B',
        roughness: 0.35,
        metalness: 0.65,
      }),
    ),
  );
  kbChassis.position.set(0, 0.011, 0);
  keyboardGroup.add(kbChassis);

  const kbGlowStrip = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.356, 0.005, 0.146)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: '#22D3EE',
      }),
    ),
  );
  kbGlowStrip.position.set(0, 0.003, 0);
  keyboardGroup.add(kbGlowStrip);

  const keyDarkMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#0F172A',
      roughness: 0.45,
    }),
  );
  const keyAccentCyanMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#06B6D4',
      emissive: '#0891B2',
      emissiveIntensity: 0.35,
      roughness: 0.35,
    }),
  );
  const keyAccentPinkMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#EC4899',
      emissive: '#BE185D',
      emissiveIntensity: 0.35,
      roughness: 0.35,
    }),
  );

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 14; col++) {
      const isAccent =
        (row === 0 && col === 0) ||
        (row === 2 && col === 13) ||
        (row === 4 && col >= 4 && col <= 8);
      const mat =
        row === 0 && col === 0
          ? keyAccentPinkMat
          : isAccent
            ? keyAccentCyanMat
            : keyDarkMat;
      const keycap = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.019, 0.01, 0.019)),
        mat,
      );
      keycap.position.set(-0.148 + col * 0.0225, 0.025, -0.048 + row * 0.024);
      keyboardGroup.add(keycap);
    }
  }

  // Wireless Gaming Mouse (1) at [-0.21, 0.765, -2.09]
  const mouseGroup = new THREE.Group();
  mouseGroup.name = 'WirelessGamingMouse';
  mouseGroup.position.set(-0.21, 0.765, -2.09);
  mouseGroup.rotation.y = -0.08;
  attachInspectable(mouseGroup, {
    id: 'mouse-wireless-01',
    label: 'Ergonomic Wireless Gaming Mouse (1) with Illuminated Scroll Wheel',
    category: 'Mouse (1)',
    target: [-0.21, 0.78, -2.09],
    optimalDistance: 0.85,
    cameraPosition: [-0.15, 1.05, -1.48],
  });
  rootGroup.add(mouseGroup);

  const mouseBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.064, 0.034, 0.115)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#0F172A',
        roughness: 0.32,
        metalness: 0.35,
      }),
    ),
  );
  mouseBody.position.set(0, 0.017, 0);
  mouseGroup.add(mouseBody);

  const scrollWheel = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.009, 0.009, 0.008, 12)),
    keyAccentCyanMat,
  );
  scrollWheel.rotation.z = Math.PI / 2;
  scrollWheel.position.set(0, 0.033, -0.028);
  mouseGroup.add(scrollWheel);

  // =========================================================================
  // 7. WATER BOTTLE (1) — Cleanly placed on the right side of the desk [0.24, 0.76, -2.22]
  // (Chips packets and scattered snack pieces removed as requested!)
  // =========================================================================
  const waterBottleGroup = new THREE.Group();
  waterBottleGroup.name = 'SapphireWaterBottle';
  waterBottleGroup.position.set(0.24, 0.76, -2.22);
  attachInspectable(waterBottleGroup, {
    id: 'water-bottle-01',
    label:
      'Sapphire Hydrate Sports Water Bottle (1) with Screw Cap & Internal Water Column',
    category: 'Water Bottle (1)',
    target: [0.24, 0.88, -2.22],
    optimalDistance: 0.85,
    cameraPosition: [0.35, 1.14, -1.42],
  });
  rootGroup.add(waterBottleGroup);

  const bottleOuterMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#38BDF8',
      transparent: true,
      opacity: 0.58,
      roughness: 0.12,
      metalness: 0.25,
    }),
  );
  const bottleBody = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.038, 0.038, 0.21, 20)),
    bottleOuterMat,
  );
  bottleBody.position.set(0, 0.105, 0);
  waterBottleGroup.add(bottleBody);

  const waterColumn = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.034, 0.034, 0.15, 18)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#06B6D4',
        emissive: '#0891B2',
        emissiveIntensity: 0.4,
        roughness: 0.15,
      }),
    ),
  );
  waterColumn.position.set(0, 0.078, 0);
  waterBottleGroup.add(waterColumn);

  const bottleCap = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.024, 0.026, 0.034, 16)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#0F172A',
        roughness: 0.4,
      }),
    ),
  );
  bottleCap.position.set(0, 0.225, 0);
  waterBottleGroup.add(bottleCap);

  // =========================================================================
  // 8. DESK LAMP (1) — Active Warm Architect Task Lamp at [-1.06, 0.76, -2.36]
  // =========================================================================
  const deskLampGroup = new THREE.Group();
  deskLampGroup.name = 'ArchitectDeskLamp';
  deskLampGroup.position.set(-1.06, 0.76, -2.36);
  deskLampGroup.rotation.y = 0.58;
  attachInspectable(deskLampGroup, {
    id: 'desk-lamp-01',
    label:
      'Articulated Architect Desk Lamp (1) with Twin Spring Arms & Warm Golden Task Light',
    category: 'Desk Lamp (1)',
    target: [-1.02, 1.02, -2.32],
    optimalDistance: 1.15,
    cameraPosition: [-0.45, 1.28, -1.42],
  });
  rootGroup.add(deskLampGroup);

  const lampBase = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.085, 0.095, 0.028, 20)),
    steelMat,
  );
  lampBase.position.set(0, 0.014, 0);
  deskLampGroup.add(lampBase);

  const lowerArm = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.011, 0.011, 0.34, 10)),
    steelMat,
  );
  lowerArm.position.set(-0.04, 0.17, 0);
  lowerArm.rotation.z = 0.28;
  deskLampGroup.add(lowerArm);

  const upperArm = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.01, 0.01, 0.32, 10)),
    steelMat,
  );
  upperArm.position.set(0.04, 0.4, 0);
  upperArm.rotation.z = -0.58;
  deskLampGroup.add(upperArm);

  const lampShade = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.095, 0.14, 20, 1, true)),
    steelMat,
  );
  lampShade.position.set(0.18, 0.46, 0);
  lampShade.rotation.z = -0.45;
  deskLampGroup.add(lampShade);

  const lampBulbMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#FEF08A',
    }),
  );
  const lampBulb = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.036, 12, 12)),
    lampBulbMat,
  );
  lampBulb.position.set(0.19, 0.43, 0);
  deskLampGroup.add(lampBulb);

  const deskLampPointLight = new THREE.PointLight('#FBBF24', 4.6, 6.2, 1.2);
  deskLampPointLight.position.set(-0.86, 1.18, -2.22);
  rootGroup.add(deskLampPointLight);

  // =========================================================================
  // 9. WINDOW (1) & CURTAINS/BLINDS (1 SET)
  // Mounted on West wall at X = -3.52, Y = 1.72, Z = -0.35
  // =========================================================================
  const windowAndBlindsGroup = new THREE.Group();
  windowAndBlindsGroup.name = 'BedroomWindowAndCurtainsBlinds';
  windowAndBlindsGroup.position.set(-3.52, 1.72, -0.35);
  windowAndBlindsGroup.rotation.y = Math.PI / 2;
  attachInspectable(windowAndBlindsGroup, {
    id: 'window-and-curtains-blinds-01',
    label:
      'Bedroom Window (1) Overlooking Skyline + Venetian Blinds & Velvet Curtains (1 Set)',
    category: 'Window (1) + Curtains/Blinds (1 Set)',
    target: [-3.45, 1.72, -0.35],
    optimalDistance: 2.2,
    cameraPosition: [-1.15, 1.72, 0.15],
  });
  rootGroup.add(windowAndBlindsGroup);

  const windowSkyTex = trackTex(createWindowCitySkylineTexture());
  const windowGlass = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(1.88, 1.48)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: '#BAE6FD',
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    ),
  );
  windowGlass.position.set(0, 0, 0.01);
  windowAndBlindsGroup.add(windowGlass);

  // Exterior 3D Main Street City Vista outside the transparent Bedroom Window (X < -3.65)
  const exteriorCityGatewayGroup = new THREE.Group();
  exteriorCityGatewayGroup.name = 'ExteriorCityOutsideBedroomWindow';
  exteriorCityGatewayGroup.position.set(0, -0.35, -2.2);
  windowAndBlindsGroup.add(exteriorCityGatewayGroup);

  const extStreetRoad = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(8.4, 0.12, 3.2)),
    trackMat(new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.8 })),
  );
  extStreetRoad.position.set(0, -1.65, -0.4);
  exteriorCityGatewayGroup.add(extStreetRoad);

  // Across-the-street Crack & Sons & Neighboring Buildings visible through the bedroom window
  const extCrackBld = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.2, 4.2, 0.6)),
    trackMat(new THREE.MeshStandardMaterial({ color: '#991B1B', roughness: 0.65 })),
  );
  extCrackBld.position.set(-0.4, 0.4, -1.8);
  exteriorCityGatewayGroup.add(extCrackBld);

  const extNeighborBld = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.8, 4.8, 0.6)),
    trackMat(new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.65 })),
  );
  extNeighborBld.position.set(2.7, 0.7, -1.8);
  exteriorCityGatewayGroup.add(extNeighborBld);

  const extSkyBackdrop = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(9.6, 5.4)),
    trackMat(
      new THREE.MeshBasicMaterial({
        map: windowSkyTex,
        side: THREE.DoubleSide,
      }),
    ),
  );
  extSkyBackdrop.position.set(0, 0.6, -2.4);
  exteriorCityGatewayGroup.add(extSkyBackdrop);

  const windowFrameMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.45,
      metalness: 0.25,
    }),
  );
  const windowSill = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.08, 0.06, 0.18)),
    windowFrameMat,
  );
  windowSill.position.set(0, -0.77, 0.06);
  windowAndBlindsGroup.add(windowSill);

  const windowTopHeader = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.06, 0.07, 0.12)),
    windowFrameMat,
  );
  windowTopHeader.position.set(0, 0.77, 0.04);
  windowAndBlindsGroup.add(windowTopHeader);

  // Venetian Horizontal Blinds raised to top third so the transparent window gateway is wide open
  const blindSlatMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#475569',
      roughness: 0.4,
      metalness: 0.35,
    }),
  );
  for (let s = 0; s < 5; s++) {
    const slat = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.84, 0.008, 0.042)),
      blindSlatMat,
    );
    slat.position.set(0, 0.72 - s * 0.045, 0.045);
    slat.rotation.x = 0.08;
    windowAndBlindsGroup.add(slat);
  }

  const curtainRod = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.016, 0.016, 2.38, 12)),
    steelMat,
  );
  curtainRod.rotation.z = Math.PI / 2;
  curtainRod.position.set(0, 0.88, 0.09);
  windowAndBlindsGroup.add(curtainRod);

  const curtainFabricMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#312E81',
      roughness: 0.72,
    }),
  );
  for (const side of [-1, 1]) {
    for (let pleat = 0; pleat < 4; pleat++) {
      const drape = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.055, 0.07, 1.92, 12)),
        curtainFabricMat,
      );
      drape.position.set(
        side * (0.88 + pleat * 0.075),
        -0.06,
        0.09 + (pleat % 2) * 0.018,
      );
      windowAndBlindsGroup.add(drape);
    }
  }

  // Exterior Daylight & Sky Fill streaming into the room through the transparent window gateway
  const windowMoonLight = new THREE.PointLight('#BAE6FD', 4.4, 11.5, 1.1);
  windowMoonLight.position.set(-2.65, 1.85, -0.35);
  rootGroup.add(windowMoonLight);

  const windowSunSpillLight = new THREE.DirectionalLight('#FEF08A', 1.85);
  windowSunSpillLight.position.set(-5.2, 3.2, -0.35);
  rootGroup.add(windowSunSpillLight);

  // =========================================================================
  // 10. WALL POSTERS (3 BUILT, REQ 2–3)
  // =========================================================================
  const postersGroup = new THREE.Group();
  postersGroup.name = 'WallPostersCollection';
  attachInspectable(postersGroup, {
    id: 'wall-posters-collection',
    label:
      '3 Illustrated Bedroom Wall Posters ("OMNIFRAME PROTOCOL", "CRACK & SONS MIDNIGHT", "LO-FI DRIFT")',
    category: 'Wall Posters (3)',
    target: [-0.65, 1.92, -2.82],
    optimalDistance: 2.1,
    cameraPosition: [-0.65, 1.82, -0.85],
  });
  rootGroup.add(postersGroup);

  const posterSpecs: Array<{
    pos: [number, number, number];
    rotY: number;
    variant: 0 | 1 | 2;
    size: [number, number];
  }> = [
    {pos: [-1.82, 1.95, -2.82], rotY: 0, variant: 0, size: [0.82, 1.08]},
    {pos: [0.58, 1.95, -2.82], rotY: 0, variant: 1, size: [0.82, 1.08]},
    {
      pos: [3.51, 2.04, -0.95],
      rotY: -Math.PI / 2,
      variant: 2,
      size: [1.12, 0.86],
    },
  ];

  for (const ps of posterSpecs) {
    const tex = trackTex(createWallPosterTexture(ps.variant));
    const frameMesh = new THREE.Mesh(
      trackGeo(
        new THREE.BoxGeometry(ps.size[0] + 0.05, ps.size[1] + 0.05, 0.02),
      ),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: '#0F172A',
          roughness: 0.4,
          metalness: 0.4,
        }),
      ),
    );
    frameMesh.position.set(...ps.pos);
    frameMesh.rotation.y = ps.rotY;
    postersGroup.add(frameMesh);

    const artPlane = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(ps.size[0], ps.size[1])),
      trackMat(
        new THREE.MeshStandardMaterial({
          map: tex,
          emissive: '#FFFFFF',
          emissiveMap: tex,
          emissiveIntensity: 0.42,
          roughness: 0.35,
        }),
      ),
    );
    artPlane.position.set(0, 0, 0.012);
    frameMesh.add(artPlane);
  }

  // =========================================================================
  // 10B. SOFA (1), TV PLAYING THE NEWS (1) & LOUNGE WINDOW (1)
  // Positioned in the Southwest Lounge Zone of the Bedroom
  // =========================================================================
  const sofaAndNewsTvGroup = new THREE.Group();
  sofaAndNewsTvGroup.name = 'SofaNewsTvAndLoungeWindowGroup';
  attachInspectable(sofaAndNewsTvGroup, {
    id: 'sofa-news-tv-window-01',
    label:
      'Plush Lounge Sofa (1), 55" TV Playing Live Breaking News (1) & Lounge Window (1)',
    category: 'Sofa + News TV + Window',
    target: [-1.65, 1.08, 2.15],
    optimalDistance: 2.25,
    cameraPosition: [0.25, 1.55, 0.35],
  });
  rootGroup.add(sofaAndNewsTvGroup);

  // --- Plush 3-Seater Lounge Sofa (1) at [-2.38, 0, 1.05] ---
  const sofaGroup = new THREE.Group();
  sofaGroup.name = 'PlushLoungeSofa';
  sofaGroup.position.set(-2.38, 0, 1.05);
  sofaGroup.rotation.y = 0.48;
  sofaAndNewsTvGroup.add(sofaGroup);

  const sofaFabricMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#1E3A5F',
      roughness: 0.65,
      metalness: 0.06,
    }),
  );
  const sofaCushionMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#254B7C',
      roughness: 0.6,
      metalness: 0.06,
    }),
  );
  const sofaPillowCoralMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#F97316',
      roughness: 0.55,
    }),
  );
  const sofaPillowCyanMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#38BDF8',
      roughness: 0.55,
    }),
  );

  // Sofa base deck
  const sofaBaseDeck = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.76, 0.22, 0.82)),
    sofaFabricMat,
  );
  sofaBaseDeck.position.set(0, 0.21, 0);
  sofaGroup.add(sofaBaseDeck);

  // 4 Tapered walnut legs
  for (const lx of [-0.78, 0.78]) {
    for (const lz of [-0.32, 0.32]) {
      const leg = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.028, 0.018, 0.12, 10)),
        bedWoodMat,
      );
      leg.position.set(lx, 0.06, lz);
      sofaGroup.add(leg);
    }
  }

  // 3 Seat cushions + 3 Backrest cushions
  for (let c = -1; c <= 1; c++) {
    const seatCush = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.51, 0.15, 0.68)),
      sofaCushionMat,
    );
    seatCush.position.set(c * 0.53, 0.38, 0.04);
    sofaGroup.add(seatCush);

    const backCush = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.51, 0.44, 0.16)),
      sofaCushionMat,
    );
    backCush.position.set(c * 0.53, 0.64, -0.28);
    backCush.rotation.x = -0.12;
    sofaGroup.add(backCush);
  }

  // Sofa Backrest Shell & 2 Sculpted Armrests
  const sofaBackShell = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.76, 0.68, 0.14)),
    sofaFabricMat,
  );
  sofaBackShell.position.set(0, 0.54, -0.36);
  sofaGroup.add(sofaBackShell);

  for (const side of [-1, 1]) {
    const armrest = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.16, 0.48, 0.84)),
      sofaFabricMat,
    );
    armrest.position.set(side * 0.84, 0.44, 0);
    sofaGroup.add(armrest);
  }

  // 2 Throw Pillows on the Sofa
  const throwPillowLeft = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.28, 0.28, 0.11)),
    sofaPillowCoralMat,
  );
  throwPillowLeft.position.set(-0.62, 0.56, -0.12);
  throwPillowLeft.rotation.set(0.15, 0.35, -0.18);
  sofaGroup.add(throwPillowLeft);

  const throwPillowRight = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.28, 0.28, 0.11)),
    sofaPillowCyanMat,
  );
  throwPillowRight.position.set(0.62, 0.56, -0.12);
  throwPillowRight.rotation.set(0.15, -0.35, 0.18);
  sofaGroup.add(throwPillowRight);

  // --- 55-Inch Widescreen TV Playing the News (1) on Media Console at [-2.18, 0, 2.58] ---
  const newsTvConsoleGroup = new THREE.Group();
  newsTvConsoleGroup.name = 'NewsTvAndConsoleUnit';
  newsTvConsoleGroup.position.set(-2.18, 0, 2.58);
  newsTvConsoleGroup.rotation.y = Math.PI; // Faces North (-Z) into the room
  sofaAndNewsTvGroup.add(newsTvConsoleGroup);

  const consoleCabinet = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.42, 0.52, 0.42)),
    deskWoodMat,
  );
  consoleCabinet.position.set(0, 0.28, 0);
  newsTvConsoleGroup.add(consoleCabinet);

  const tvStandPedestal = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.46, 0.03, 0.26)),
    steelMat,
  );
  tvStandPedestal.position.set(0, 0.555, 0);
  newsTvConsoleGroup.add(tvStandPedestal);

  const tvStandPillar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.12, 0.22, 0.05)),
    steelMat,
  );
  tvStandPillar.position.set(0, 0.65, -0.04);
  newsTvConsoleGroup.add(tvStandPillar);

  const newsTvBezel = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.28, 0.76, 0.04)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#090D16',
        roughness: 0.28,
        metalness: 0.65,
      }),
    ),
  );
  newsTvBezel.position.set(0, 1.08, 0);
  newsTvConsoleGroup.add(newsTvBezel);

  const newsTvCanvas = document.createElement('canvas');
  newsTvCanvas.width = 1024;
  newsTvCanvas.height = 576;
  const newsTvCtx = newsTvCanvas.getContext('2d');
  const newsTvTex = trackTex(new THREE.CanvasTexture(newsTvCanvas));
  newsTvTex.colorSpace = THREE.SRGBColorSpace;

  const newsTvScreenMesh = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(1.22, 0.7)),
    trackMat(
      new THREE.MeshBasicMaterial({
        map: newsTvTex,
      }),
    ),
  );
  newsTvScreenMesh.position.set(0, 1.08, 0.022);
  newsTvConsoleGroup.add(newsTvScreenMesh);

  const newsTvGlowLight = new THREE.PointLight('#38BDF8', 2.4, 4.5, 1.25);
  newsTvGlowLight.position.set(-2.18, 1.15, 2.15);
  rootGroup.add(newsTvGlowLight);

  // --- Lounge Picture Window (1) Adjacent to the News TV at [-0.62, 1.42, 2.78] ---
  const loungeWindowGroup = new THREE.Group();
  loungeWindowGroup.name = 'LoungePictureWindow';
  loungeWindowGroup.position.set(-0.62, 1.42, 2.78);
  loungeWindowGroup.rotation.y = Math.PI; // Faces North (-Z) into the room
  sofaAndNewsTvGroup.add(loungeWindowGroup);

  const loungeWindowOuterFrame = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.28, 1.18, 0.09)),
    windowFrameMat,
  );
  loungeWindowGroup.add(loungeWindowOuterFrame);

  const loungeWindowGlass = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(1.14, 1.04)),
    trackMat(
      new THREE.MeshBasicMaterial({
        map: windowSkyTex,
      }),
    ),
  );
  loungeWindowGlass.position.set(0, 0, 0.048);
  loungeWindowGroup.add(loungeWindowGlass);

  // Window cross mullions
  const mullionV = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.03, 1.06, 0.025)),
    windowFrameMat,
  );
  mullionV.position.set(0, 0, 0.052);
  loungeWindowGroup.add(mullionV);

  const mullionH = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.16, 0.03, 0.025)),
    windowFrameMat,
  );
  mullionH.position.set(0, 0.08, 0.052);
  loungeWindowGroup.add(mullionH);

  const loungeWindowSill = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.36, 0.055, 0.16)),
    windowFrameMat,
  );
  loungeWindowSill.position.set(0, -0.61, 0.04);
  loungeWindowGroup.add(loungeWindowSill);

  // =========================================================================
  // 11. ROOM DOOR (1) — Rigged 6-Panel Bedroom Door with Articulated Handle & Latch
  // Positioned on South Wall at [1.95, 0, 2.84]
  // =========================================================================
  const bedroomDoorGroup = new THREE.Group();
  bedroomDoorGroup.name = 'RiggedBedroomDoorGroup';
  bedroomDoorGroup.position.set(1.95, 0, 2.84);
  attachInspectable(bedroomDoorGroup, {
    id: 'rigged-bedroom-door-01',
    label:
      'Rigged Bedroom Door (1): Articulated Lever Handle (38° Turn), Mortise Latch & Warm Hallway Spill',
    category: 'Room Door (1)',
    target: [1.85, 1.15, 2.68],
    optimalDistance: 1.85,
    cameraPosition: [0.75, 1.38, 1.05],
  });
  rootGroup.add(bedroomDoorGroup);

  const hallwayAlcove = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.25, 2.45, 0.65)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#3B2316',
        roughness: 0.7,
        side: THREE.BackSide,
      }),
    ),
  );
  hallwayAlcove.position.set(0, 1.22, 0.34);
  bedroomDoorGroup.add(hallwayAlcove);

  const hallwaySpillLight = new THREE.PointLight('#F59E0B', 1.4, 4.5, 1.3);
  hallwaySpillLight.position.set(1.85, 1.65, 3.05);
  rootGroup.add(hallwaySpillLight);

  const jambMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.48,
      metalness: 0.15,
    }),
  );
  const leftJamb = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.08, 2.38, 0.16)),
    jambMat,
  );
  leftJamb.position.set(-0.5, 1.19, 0);
  bedroomDoorGroup.add(leftJamb);

  const rightJamb = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.08, 2.38, 0.16)),
    jambMat,
  );
  rightJamb.position.set(0.5, 1.19, 0);
  bedroomDoorGroup.add(rightJamb);

  const topJamb = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.08, 0.08, 0.16)),
    jambMat,
  );
  topJamb.position.set(0, 2.38, 0);
  bedroomDoorGroup.add(topJamb);

  const doorHingePivot = new THREE.Group();
  doorHingePivot.name = 'BedroomDoorHingePivot';
  doorHingePivot.position.set(0.46, 0, -0.02);
  bedroomDoorGroup.add(doorHingePivot);

  const doorLeafMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#2E263D',
      roughness: 0.45,
      metalness: 0.12,
    }),
  );
  const doorLeaf = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.92, 2.32, 0.055)),
    doorLeafMat,
  );
  doorLeaf.position.set(-0.46, 1.16, 0);
  doorHingePivot.add(doorLeaf);

  const doorPanelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#1E192B',
      roughness: 0.55,
    }),
  );
  for (const px of [-0.64, -0.28]) {
    for (const py of [0.46, 1.16, 1.84]) {
      const panel = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.26, 0.48, 0.065)),
        doorPanelMat,
      );
      panel.position.set(px, py, 0);
      doorHingePivot.add(panel);
    }
  }

  const doorHandleRig = new THREE.Group();
  doorHandleRig.position.set(-0.82, 1.04, 0);
  doorHingePivot.add(doorHandleRig);

  const handleBrassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#FACC15',
      roughness: 0.22,
      metalness: 0.88,
    }),
  );

  const escutcheonPlate = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.055, 0.18, 0.072)),
    handleBrassMat,
  );
  doorHandleRig.add(escutcheonPlate);

  const latchBoltMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.036, 0.028, 0.018)),
    handleBrassMat,
  );
  latchBoltMesh.position.set(-0.1, 0.02, 0);
  doorHandleRig.add(latchBoltMesh);

  const handleSpindlePivot = new THREE.Group();
  handleSpindlePivot.position.set(0, 0.02, 0);
  doorHandleRig.add(handleSpindlePivot);

  const spindleBar = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.012, 0.012, 0.13, 12)),
    handleBrassMat,
  );
  spindleBar.rotation.x = Math.PI / 2;
  handleSpindlePivot.add(spindleBar);

  for (const zSide of [-1, 1]) {
    const leverGrip = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.125, 0.022, 0.022)),
      handleBrassMat,
    );
    leverGrip.position.set(0.052, 0, zSide * 0.062);
    handleSpindlePivot.add(leverGrip);
  }

  // =========================================================================
  // 12. AMBIENT DUST (1 REUSABLE EFFECT)
  // =========================================================================
  const dustSpecs: DarkRoomDustMoteSpec[] = generateDarkRoomDustMotes(120);
  const dustMeshes: THREE.Mesh[] = [];
  const dustGroup = new THREE.Group();
  dustGroup.name = 'DarkRoomVolumetricDust';
  rootGroup.add(dustGroup);

  const dustBaseGeo = trackGeo(new THREE.OctahedronGeometry(0.011, 0));
  const dustCyanMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#67E8F9',
      transparent: true,
      opacity: 0.72,
    }),
  );
  const dustWarmMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#FDE68A',
      transparent: true,
      opacity: 0.55,
    }),
  );

  for (let i = 0; i < dustSpecs.length; i++) {
    const m = new THREE.Mesh(
      dustBaseGeo,
      i < dustSpecs.length * 0.4 ? dustCyanMat : dustWarmMat,
    );
    dustGroup.add(m);
    dustMeshes.push(m);
  }

  // =========================================================================
  // 13. MULTI-SOURCE ROOM LIGHTING RIG (Ceiling + Bedside + Desk Lamp + Window + Phone)
  // =========================================================================
  const ceilingMainLight = new THREE.PointLight('#FFF3E0', 7.2, 16.0, 1.0);
  ceilingMainLight.position.set(0, 2.95, -0.35);
  rootGroup.add(ceilingMainLight);

  const bedsideWarmLight = new THREE.PointLight('#FDBA74', 4.2, 9.5, 1.15);
  bedsideWarmLight.position.set(2.85, 1.85, -1.25);
  rootGroup.add(bedsideWarmLight);

  const roomFillLightSouth = new THREE.PointLight('#E2E8F0', 3.4, 12.0, 1.15);
  roomFillLightSouth.position.set(-0.85, 2.45, 1.65);
  rootGroup.add(roomFillLightSouth);

  const ambientLight = new THREE.AmbientLight('#475569', 1.85);
  rootGroup.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight('#FFFBEB', '#1E293B', 1.25);
  rootGroup.add(hemiLight);

  // =========================================================================
  // 14. APPLY MAIN STREET CEL-SHADED TOON & 2D COMIC INK OUTLINE STYLE
  // =========================================================================
  const {inkLineObjects, disposeStyleResources} =
    applyMainStreetStyleToSceneGraph(rootGroup);

  // =========================================================================
  // DETERMINISTIC FRAME UPDATE
  // =========================================================================
  const updateForFrame: DarkRoomSceneHandle['updateForFrame'] = ({
    frame,
    fps,
    lightMode,
    phoneGlowColorMode,
    phoneGlowMultiplier,
    doorControlMode,
    dustIntensity,
    inkOutlinesEnabled = true,
    wireframeMode,
  }) => {
    const phoneGlow = evaluatePhoneScreenGlowAtFrame({
      frame,
      fps,
      colorMode: phoneGlowColorMode,
      glowMultiplier: phoneGlowMultiplier,
    });

    if (phoneCtx) {
      renderPhoneScreenCanvas(phoneCtx, phoneGlow);
      phoneScreenTex.needsUpdate = true;
    }

    if (newsTvCtx) {
      const tSec = Math.max(0, frame) / Math.max(1, fps);
      const w = 1024;
      const h = 576;
      // Studio backdrop
      const grad = newsTvCtx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0B192C');
      grad.addColorStop(0.6, '#1E3E62');
      grad.addColorStop(1, '#0F172A');
      newsTvCtx.fillStyle = grad;
      newsTvCtx.fillRect(0, 0, w, h);

      // World map grid lines behind anchor
      newsTvCtx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      newsTvCtx.lineWidth = 2;
      for (let gx = 60; gx < w; gx += 80) {
        newsTvCtx.beginPath();
        newsTvCtx.moveTo(gx, 40);
        newsTvCtx.lineTo(gx, 420);
        newsTvCtx.stroke();
      }
      for (let gy = 70; gy < 420; gy += 65) {
        newsTvCtx.beginPath();
        newsTvCtx.moveTo(40, gy);
        newsTvCtx.lineTo(w - 40, gy);
        newsTvCtx.stroke();
      }

      // Live OTS Graphic Box (top right)
      newsTvCtx.fillStyle = '#090D16';
      newsTvCtx.fillRect(610, 68, 360, 220);
      newsTvCtx.strokeStyle = '#EF4444';
      newsTvCtx.lineWidth = 5;
      newsTvCtx.strokeRect(610, 68, 360, 220);
      newsTvCtx.fillStyle = '#EF4444';
      newsTvCtx.fillRect(610, 68, 360, 42);
      newsTvCtx.fillStyle = '#FFFFFF';
      newsTvCtx.font = 'bold 24px sans-serif';
      newsTvCtx.textAlign = 'center';
      newsTvCtx.fillText('ALERT: SUBURBAN GARAGE', 790, 97);

      // Animated radar rings in OTS graphic
      const radarPulse = (tSec * 1.4) % 1;
      newsTvCtx.strokeStyle = '#22D3EE';
      newsTvCtx.lineWidth = 3;
      newsTvCtx.beginPath();
      newsTvCtx.arc(790, 195, 25 + radarPulse * 55, 0, Math.PI * 2);
      newsTvCtx.stroke();
      newsTvCtx.fillStyle = '#FACC15';
      newsTvCtx.font = 'bold 22px sans-serif';
      newsTvCtx.fillText('ANOMALY DETECTED', 790, 268);

      // News Anchor silhouette behind desk (with comic ink outlines)
      const headBob = Math.sin(tSec * 5.0) * 4;
      newsTvCtx.fillStyle = '#334155';
      newsTvCtx.strokeStyle = '#0A0812';
      newsTvCtx.lineWidth = 5;
      newsTvCtx.beginPath();
      newsTvCtx.roundRect(220, 210, 230, 175, 28);
      newsTvCtx.fill();
      newsTvCtx.stroke();
      // Tie & Shirt
      newsTvCtx.fillStyle = '#F8FAFC';
      newsTvCtx.beginPath();
      newsTvCtx.moveTo(310, 215);
      newsTvCtx.lineTo(360, 215);
      newsTvCtx.lineTo(335, 295);
      newsTvCtx.closePath();
      newsTvCtx.fill();
      newsTvCtx.fillStyle = '#EF4444';
      newsTvCtx.fillRect(327, 225, 16, 65);
      // Anchor Head
      newsTvCtx.fillStyle = '#FDBA74';
      newsTvCtx.beginPath();
      newsTvCtx.arc(335, 148 + headBob, 46, 0, Math.PI * 2);
      newsTvCtx.fill();
      newsTvCtx.stroke();
      // Hair
      newsTvCtx.fillStyle = '#1E293B';
      newsTvCtx.beginPath();
      newsTvCtx.arc(335, 134 + headBob, 48, Math.PI, Math.PI * 2);
      newsTvCtx.fill();
      newsTvCtx.stroke();

      // Anchor Desk
      newsTvCtx.fillStyle = '#0F172A';
      newsTvCtx.fillRect(90, 345, 490, 95);
      newsTvCtx.strokeRect(90, 345, 490, 95);
      newsTvCtx.fillStyle = '#38BDF8';
      newsTvCtx.fillRect(90, 345, 490, 8);

      // Top-Left LIVE badge
      newsTvCtx.fillStyle = '#DC2626';
      newsTvCtx.fillRect(42, 34, 150, 44);
      newsTvCtx.strokeRect(42, 34, 150, 44);
      newsTvCtx.fillStyle = '#FFFFFF';
      newsTvCtx.font = 'bold 26px sans-serif';
      newsTvCtx.textAlign = 'center';
      newsTvCtx.fillText('● LIVE TV', 117, 65);

      // Lower-Third Breaking News Banner
      newsTvCtx.fillStyle = '#B91C1C';
      newsTvCtx.fillRect(0, 425, w, 68);
      newsTvCtx.fillStyle = '#FEF08A';
      newsTvCtx.font = 'bold 34px sans-serif';
      newsTvCtx.textAlign = 'left';
      newsTvCtx.fillText(
        'BREAKING NEWS: MYSTERIOUS GARAGE LAUNCH PREP SPOTTED',
        34,
        471,
      );

      // Bottom Scrolling Ticker
      newsTvCtx.fillStyle = '#020617';
      newsTvCtx.fillRect(0, 493, w, 83);
      const tickerOffset = (frame * 4) % 900;
      newsTvCtx.fillStyle = '#38BDF8';
      newsTvCtx.font = 'bold 26px monospace';
      newsTvCtx.fillText(
        '>>> CHANNEL 9 NEWS • WEATHER CLEAR FOR LAUNCH • CITIZENS ADVISED TO CHECK THEIR GARAGES • STAY TUNED >>>',
        40 - tickerOffset * 0.45,
        544,
      );

      newsTvTex.needsUpdate = true;
    }

    // Update Smartphone Key Light, Bounce Light, Cone & Halo
    phoneKeyLight.color.set(phoneGlow.primaryColorHex);
    phoneKeyLight.intensity = phoneGlow.keyLightIntensity;

    phoneBounceLight.color.set(phoneGlow.secondaryColorHex);
    phoneBounceLight.intensity = phoneGlow.bounceLightIntensity;

    phoneConeMat.color.set(phoneGlow.primaryColorHex);
    phoneConeMat.opacity = phoneGlow.volumetricConeOpacity;

    phoneHaloMat.color.set(phoneGlow.primaryColorHex);
    phoneHaloMat.opacity = phoneGlow.surfaceHaloOpacity;

    sunglassLensMat.emissive.set(phoneGlow.primaryColorHex);
    sunglassLensMat.emissiveIntensity =
      0.38 + phoneGlow.notificationPulse01 * 0.35;

    // Room Lighting Mode adjustments
    if (lightMode === 'full-bedroom-lit') {
      ceilingMainLight.intensity = 7.2;
      bedsideWarmLight.intensity = 4.2;
      roomFillLightSouth.intensity = 3.4;
      ambientLight.intensity = 1.85;
      hemiLight.intensity = 1.25;
      deskLampPointLight.intensity = 4.6;
      lampBulbMat.color.set('#FEF08A');
      ceilingGlowMat.color.set('#FFFBEB');
      windowMoonLight.color.set('#60A5FA');
      windowMoonLight.intensity = 2.8;
    } else if (lightMode === 'cozy-lamp-and-phone') {
      ceilingMainLight.intensity = 3.2;
      bedsideWarmLight.intensity = 3.8;
      roomFillLightSouth.intensity = 1.8;
      ambientLight.intensity = 1.25;
      hemiLight.intensity = 0.85;
      deskLampPointLight.intensity = 5.2;
      lampBulbMat.color.set('#FDE047');
      ceilingGlowMat.color.set('#FDE68A');
      windowMoonLight.color.set('#60A5FA');
      windowMoonLight.intensity = 2.2;
    } else {
      // 'midnight-neon-and-phone'
      ceilingMainLight.intensity = 2.8;
      bedsideWarmLight.intensity = 2.4;
      roomFillLightSouth.intensity = 1.6;
      ambientLight.intensity = 1.15;
      hemiLight.intensity = 0.78;
      deskLampPointLight.intensity = 3.2;
      lampBulbMat.color.set('#F59E0B');
      ceilingGlowMat.color.set('#A855F7');
      windowMoonLight.color.set('#A855F7');
      windowMoonLight.intensity = 3.8;
    }

    // Rigged Bedroom Door update
    const doorState = evaluateDarkRoomDoorRigAtFrame({
      frame,
      fps,
      mode: doorControlMode,
    });
    handleSpindlePivot.rotation.z = -doorState.handleTurnAngleRad;
    latchBoltMesh.position.x = -0.1 + doorState.latchRetractionMeters;
    doorHingePivot.rotation.y = doorState.doorSwingAngleRad;
    hallwaySpillLight.intensity = doorState.hallwayLightIntensity;

    // Volumetric Dust Motes update
    dustCyanMat.color.set(phoneGlow.primaryColorHex);
    for (let i = 0; i < dustSpecs.length; i++) {
      const st = evaluateDarkRoomDustMoteAtFrame(dustSpecs[i], frame, fps);
      const m = dustMeshes[i];
      m.position.set(st.x, st.y, st.z);
      const s = st.scale * Math.max(0, dustIntensity);
      m.scale.set(s, s, s);
      m.visible = dustIntensity > 0.01;
    }

    for (const inkObj of inkLineObjects) {
      inkObj.visible = inkOutlinesEnabled && !wireframeMode;
    }

    // Update 3D Character Cast inside Dark Room Bedroom
    threeBedroomCast.updateAtFrame(frame, fps);

    // Wireframe toggle
    for (const mat of materialsToDispose) {
      if ('wireframe' in mat) {
        (mat as THREE.MeshToonMaterial).wireframe = wireframeMode;
      }
    }
  };

  const threeBedroomCast = buildThreeSceneCastDirector('dark-room-bedroom');
  rootGroup.add(threeBedroomCast.rootGroup);

  const dispose = () => {
    threeBedroomCast.dispose();
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
