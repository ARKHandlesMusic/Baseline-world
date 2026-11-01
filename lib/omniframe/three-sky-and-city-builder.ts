import * as THREE from 'three';
import {StylePalette} from './asset-manifest';
import {
  AlleySpec,
  HERO_BLOCK_SHOPS,
  HERO_SIDEWALK_PROPS,
  HeroShopSpec,
  UtilityPoleSpec,
  generateCityAlleys,
  generateCityRoadNetwork,
  generateCityShrubPlanters,
  generateExtendedCityBuildings,
  generateExtendedCityProps,
  generateSurroundingMountainRange,
  generateUtilityPolesAndCables,
} from './city-layout';
import {
  attachComicInkOutline,
  buildStreetLampAsset,
} from './three-street-assets-builder';

/**
 * 1. PHOTOREALISTIC IRL BLUE SKY, SUN DISC, SOLAR CORONA, SUNSET TWILIGHT,
 * STARRY NIGHT SKY & FULL MOON DOME SHADER
 * Supports Day Mode (`uNightFactor = 0.0`), Night Mode (`uNightFactor = 1.0`), and Smooth Day-Night Cycle!
 */
export function createRealisticSkyDomeShaderMaterial(
  sunDirection: THREE.Vector3,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSunDir: {value: sunDirection.clone().normalize()},
      uMoonDir: {value: new THREE.Vector3(-0.14, 0.32, -0.937).normalize()},
      uNightFactor: {value: 0.0},
      uTime: {value: 0.0},
      uHalftoneOverlay: {value: 0.0},
    },
    vertexShader: `
      varying vec3 vWorldPos;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPos;
      varying vec2 vUv;
      uniform vec3 uSunDir;
      uniform vec3 uMoonDir;
      uniform float uNightFactor;
      uniform float uTime;
      uniform float uHalftoneOverlay;

      // Deterministic 2D hash & value noise for IRL atmospheric clouds & starfield
      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise2D(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbmClouds(vec2 p) {
        float v = 0.0;
        float amp = 0.5;
        mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
        for (int i = 0; i < 4; i++) {
          v += amp * noise2D(p);
          p = rot * p * 2.04;
          amp *= 0.5;
        }
        return v;
      }

      void main() {
        vec3 dir = normalize(vWorldPos);
        float upFactor = clamp(dir.y, 0.0, 1.0);
        float nf = clamp(uNightFactor, 0.0, 1.0);
        float twilightBell = sin(nf * 3.14159265);

        // 1A. Daytime Rayleigh Atmospheric Blue Sky Gradient
        vec3 zenithBlue = vec3(0.03, 0.24, 0.66);
        vec3 midSkyBlue = vec3(0.12, 0.45, 0.86);
        vec3 horizonHaze = vec3(0.48, 0.76, 0.96);
        vec3 warmHorizon = vec3(0.98, 0.88, 0.68);

        vec3 daySky = mix(horizonHaze, midSkyBlue, pow(upFactor, 0.38));
        daySky = mix(daySky, zenithBlue, pow(upFactor, 1.15));

        // 1B. Golden Sunset / Dawn Twilight Gradient (peaks when uNightFactor ~ 0.5)
        vec3 sunsetZenith = vec3(0.09, 0.12, 0.36);
        vec3 sunsetMid = vec3(0.58, 0.24, 0.52);
        vec3 sunsetHorizon = vec3(0.99, 0.48, 0.22);
        vec3 sunsetSky = mix(sunsetHorizon, sunsetMid, pow(upFactor, 0.45));
        sunsetSky = mix(sunsetSky, sunsetZenith, pow(upFactor, 1.1));

        // 1C. Nocturnal Midnight Starry Sky Gradient
        vec3 nightZenith = vec3(0.02, 0.03, 0.09);
        vec3 nightMid = vec3(0.05, 0.08, 0.19);
        vec3 nightHorizon = vec3(0.09, 0.15, 0.31);
        vec3 nightSky = mix(nightHorizon, nightMid, pow(upFactor, 0.45));
        nightSky = mix(nightSky, nightZenith, pow(upFactor, 1.15));

        vec3 skyCol = mix(daySky, nightSky, nf);
        skyCol = mix(skyCol, sunsetSky, twilightBell * 0.72);

        // 2A. Solar Alignment & Mie Scattering Corona + Crisp IRL Photosphere Sun Disc
        float sunCos = clamp(dot(dir, normalize(uSunDir)), 0.0, 1.0);
        float sunVis = clamp(1.0 - nf * 1.18, 0.0, 1.0);
        float horizonGlow = pow(1.0 - upFactor, 3.8) * pow(sunCos, 2.2);
        skyCol = mix(skyCol, warmHorizon, clamp(horizonGlow * 0.42 * sunVis, 0.0, 1.0));

        float mieHalo = pow(sunCos, 32.0) * 0.34 + pow(sunCos, 160.0) * 0.68;
        skyCol += vec3(1.0, 0.88, 0.55) * mieHalo * (1.0 - nf * 0.85);

        float solarRim = smoothstep(0.9962, 0.9984, sunCos) * sunVis;
        float sunDisc = smoothstep(0.9982, 0.9991, sunCos) * sunVis;
        skyCol = mix(skyCol, vec3(1.0, 0.86, 0.38), solarRim * 0.85);
        skyCol = mix(skyCol, vec3(1.0, 0.99, 0.92), sunDisc);

        // 2B. Nocturnal Twinkling Starfield & Luminous Full Moon Disc
        if (nf > 0.15 && dir.y > 0.04) {
          vec2 starGrid = dir.xz / (dir.y + 0.18) * 110.0;
          vec2 starCell = floor(starGrid);
          vec2 starFract = fract(starGrid) - 0.5;
          float starSeed = hash21(starCell);
          if (starSeed > 0.915) {
            float starDist = length(starFract);
            float twinkle = 0.65 + 0.35 * sin(uTime * 3.5 + starSeed * 62.8);
            float starBright = smoothstep(0.18, 0.02, starDist) * twinkle * smoothstep(0.18, 0.75, nf);
            vec3 starTint = mix(vec3(0.82, 0.91, 1.0), vec3(1.0, 0.94, 0.82), fract(starSeed * 17.3));
            skyCol += starTint * starBright * smoothstep(0.04, 0.25, dir.y);
          }
        }

        float moonCos = clamp(dot(dir, normalize(uMoonDir)), 0.0, 1.0);
        float moonVis = smoothstep(0.25, 0.85, nf);
        float moonHalo = pow(moonCos, 38.0) * 0.28 + pow(moonCos, 180.0) * 0.48;
        skyCol += vec3(0.56, 0.74, 0.98) * moonHalo * moonVis;

        float moonDisc = smoothstep(0.9978, 0.9988, moonCos) * moonVis;
        if (moonDisc > 0.01) {
          float craterNoise = noise2D(dir.xy * 180.0);
          vec3 moonSurface = mix(vec3(0.82, 0.88, 0.96), vec3(0.98, 0.99, 1.0), smoothstep(0.35, 0.75, craterNoise));
          skyCol = mix(skyCol, moonSurface, moonDisc);
        }

        // 3. Realistic High-Altitude Cumulus & Cirrus Clouds above horizon (Day, Sunset & Night lit)
        if (dir.y > 0.02) {
          vec2 cloudUv = dir.xz / (dir.y + 0.20) * 1.55;
          cloudUv += vec2(uTime * 0.012, uTime * 0.006);
          float n1 = fbmClouds(cloudUv);
          float n2 = fbmClouds(cloudUv * 2.15 - vec2(1.7, 3.2));
          float cloudDensity = smoothstep(0.52, 0.78, n1 * 0.72 + n2 * 0.28);
          float horizonCloudFade = smoothstep(0.04, 0.22, dir.y);
          float sunClearance = 1.0 - smoothstep(0.992, 0.9985, sunCos) * 0.75 * sunVis;
          float moonClearance = 1.0 - smoothstep(0.992, 0.9985, moonCos) * 0.75 * moonVis;
          cloudDensity *= horizonCloudFade * sunClearance * moonClearance;

          vec3 dayCloudShadow = vec3(0.58, 0.72, 0.89);
          vec3 dayCloudBright = mix(vec3(0.98, 0.99, 1.0), vec3(1.0, 0.95, 0.82), pow(sunCos, 6.0) * 0.65);
          vec3 dayCloudCol = mix(dayCloudShadow, dayCloudBright, smoothstep(0.48, 0.78, n1));

          vec3 sunsetCloudCol = mix(vec3(0.38, 0.22, 0.42), vec3(1.0, 0.58, 0.32), smoothstep(0.45, 0.78, n1));
          vec3 nightCloudCol = mix(vec3(0.08, 0.12, 0.24), vec3(0.24, 0.34, 0.52), smoothstep(0.48, 0.78, n1));

          vec3 cloudColor = mix(dayCloudCol, nightCloudCol, nf);
          cloudColor = mix(cloudColor, sunsetCloudCol, twilightBell * 0.75);
          skyCol = mix(skyCol, cloudColor, cloudDensity * 0.76);
        }

        // Below-horizon safety skirt (never allow black void)
        if (dir.y < 0.0) {
          vec3 groundSkirt = mix(vec3(0.28, 0.39, 0.49), vec3(0.05, 0.08, 0.16), nf);
          vec3 curHoriz = mix(horizonHaze, nightHorizon, nf);
          skyCol = mix(curHoriz, groundSkirt, clamp(-dir.y * 6.0, 0.0, 1.0));
        }

        // Optional subtle radial halftone overlay ONLY when explicitly boosted (e.g. Pop-Halftone mode)
        if (uHalftoneOverlay > 0.05 && dir.y > 0.0) {
          vec2 p = dir.xy * 18.0;
          vec2 cell = fract(p) - 0.5;
          float d = length(cell);
          float r = (1.0 - clamp(length(dir.xy), 0.0, 1.0)) * 0.38 * uHalftoneOverlay;
          float dotMask = 1.0 - smoothstep(r - 0.04, r + 0.04, d);
          skyCol = mix(skyCol, vec3(0.99, 0.88, 0.28), dotMask * uHalftoneOverlay * 0.45);
        }

        gl_FragColor = vec4(skyCol, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
}

const storeSignTexCache = new Map<string, THREE.CanvasTexture>();
const verticalBannerTexCache = new Map<string, THREE.CanvasTexture>();

/**
 * Helper to create a procedural Shop Sign or Rooftop Billboard CanvasTexture (cached for fast city-wide reuse).
 */
function createStoreSignTexture(
  title: string,
  subtitle: string,
  bgHex: string,
  textHex: string,
  accentHex: string,
  inkHex: string,
): THREE.CanvasTexture {
  const key = `${title}|${subtitle}|${bgHex}|${textHex}|${accentHex}|${inkHex}`;
  const cached = storeSignTexCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 512, 128);

    // Subtle graphic diagonal stripe accent
    ctx.fillStyle = accentHex;
    ctx.globalAlpha = 0.14;
    ctx.beginPath();
    ctx.moveTo(380, 0);
    ctx.lineTo(512, 0);
    ctx.lineTo(445, 128);
    ctx.lineTo(315, 128);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.strokeStyle = inkHex;
    ctx.lineWidth = 9;
    ctx.strokeRect(5, 5, 502, 118);

    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 3;
    ctx.strokeRect(13, 13, 486, 102);

    ctx.fillStyle = textHex;
    ctx.font = '900 39px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 256, 52);

    ctx.fillStyle = accentHex;
    ctx.font = '800 16px sans-serif';
    ctx.fillText(subtitle, 256, 93);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  storeSignTexCache.set(key, tex);
  return tex;
}

/**
 * Helper to create a Vertical Projecting Street Banner or Wheatpaste Poster CanvasTexture (cached).
 */
function createVerticalBannerTexture(
  label: string,
  bgHex: string,
  accentHex: string,
  inkHex: string,
): THREE.CanvasTexture {
  const key = `${label}|${bgHex}|${accentHex}|${inkHex}`;
  const cached = verticalBannerTexCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 128, 384);

    ctx.strokeStyle = inkHex;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 120, 376);

    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, 104, 360);

    // Top & bottom emblem stars/circles
    ctx.fillStyle = accentHex;
    ctx.beginPath();
    ctx.arc(64, 38, 13, 0, Math.PI * 2);
    ctx.arc(64, 346, 13, 0, Math.PI * 2);
    ctx.fill();

    // Rotated bold vertical typography
    ctx.save();
    ctx.translate(64, 192);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  verticalBannerTexCache.set(key, tex);
  return tex;
}

/**
 * Create a high-detail Cel-Shaded Lo-Fi Asphalt Road Texture matching Main Street Section 1
 * with wheel-track wear bands, aggregate grain, and hand-drawn comic ink hatch strokes!
 * Supports North-South avenues, East-West cross-streets, and 4-Way Intersections (with curved turning tire tracks).
 */
function createCityAsphaltTexture(
  palette: StylePalette,
  orientation: 'north-south' | 'east-west' | 'intersection',
  repeatX: number,
  repeatY: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = palette.asphaltBase;
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = palette.asphaltWear;
    if (orientation === 'north-south') {
      ctx.fillRect(56, 0, 88, 512);
      ctx.fillRect(168, 0, 76, 512);
      ctx.fillRect(268, 0, 76, 512);
      ctx.fillRect(368, 0, 88, 512);
    } else if (orientation === 'east-west') {
      ctx.fillRect(0, 56, 512, 88);
      ctx.fillRect(0, 168, 512, 76);
      ctx.fillRect(0, 268, 512, 76);
      ctx.fillRect(0, 368, 512, 88);
    } else {
      // 4-Way Intersection: crossing wheel tracks + curved Left/Right turning tire arcs
      ctx.fillRect(68, 0, 78, 512);
      ctx.fillRect(366, 0, 78, 512);
      ctx.fillRect(0, 68, 512, 78);
      ctx.fillRect(0, 366, 512, 78);

      ctx.strokeStyle = palette.asphaltWear;
      ctx.lineWidth = 42;
      for (const [cx, cy, startA, endA] of [
        [0, 0, 0, Math.PI / 2],
        [512, 0, Math.PI / 2, Math.PI],
        [512, 512, Math.PI, Math.PI * 1.5],
        [0, 512, Math.PI * 1.5, Math.PI * 2],
      ] as const) {
        ctx.beginPath();
        ctx.arc(cx, cy, 175, startA, endA);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 335, startA, endA);
        ctx.stroke();
      }
    }

    // Hand-drawn comic ink longitudinal hatch strokes & asphalt grain
    ctx.strokeStyle = palette.inkOutlineColor;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.38;
    for (let i = 0; i < 42; i++) {
      const x = ((i * 73) % 470) + 20;
      const y = ((i * 139) % 440) + 20;
      const len = 26 + ((i * 19) % 38);
      ctx.beginPath();
      if (orientation === 'east-west') {
        ctx.moveTo(y, x);
        ctx.lineTo(y + len, x);
      } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + len);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    if (orientation === 'intersection') {
      // Crisp 4-way intersection perimeter stone border & radial manhole apron lines
      ctx.strokeStyle = palette.inkOutlineColor;
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 492, 492);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(256, 256, 48, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Create a high-detail Cel-Shaded Anime Flagstone & Scored Concrete Footpath Texture
 * that stretches seamlessly across all sidewalks, boulevards, cross-streets, and intersection corner plazas!
 */
export function createCityFootpathTexture(
  palette: StylePalette,
  orientation: 'north-south' | 'east-west' | 'corner',
  repeatX: number,
  repeatY: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = palette.sidewalkSlab;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle alternating flagstone paving tile tones
    const tileColors = ['#CBD5E1', '#C3CEDB', '#D5DFEC', '#BAC6D6'];
    const cols = 4;
    const rows = 4;
    const cw = 512 / cols;
    const ch = 512 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = tileColors[(r * 3 + c) % tileColors.length];
        ctx.fillRect(c * cw + 4, r * ch + 4, cw - 8, ch - 8);
      }
    }

    // Scored dark comic ink flagstone mortar seams
    ctx.strokeStyle = palette.inkOutlineColor;
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.58;
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cw, 0);
      ctx.lineTo(i * cw, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * ch);
      ctx.lineTo(512, i * ch);
      ctx.stroke();
    }

    // Comic ink surface hatch marks on individual paving slabs
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.34;
    for (let i = 0; i < 24; i++) {
      const hx = ((i * 89) % 460) + 24;
      const hy = ((i * 131) % 460) + 24;
      ctx.beginPath();
      if (orientation === 'east-west') {
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + 22, hy);
      } else {
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx, hy + 22);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Create a high-detail Cast-Iron Concentric Waffle Manhole Cover Texture with comic ink linework.
 */
function createManholeWaffleTexture(palette: StylePalette): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = palette.drainIron;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = palette.inkOutlineColor;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(128, 128, 116, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(128, 128, 92, 0, Math.PI * 2);
    ctx.stroke();

    // Waffle cross-hatch grip grid inside the manhole lid
    ctx.lineWidth = 4;
    for (let p = 44; p <= 212; p += 24) {
      ctx.beginPath();
      ctx.moveTo(p, 44);
      ctx.lineTo(p, 212);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(44, p);
      ctx.lineTo(212, p);
      ctx.stroke();
    }

    // Center municipal emblem ring
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(128, 128, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Helper to create a procedural Brick & Window Grid texture for Mid-Ground City Buildings (LOD Tier 1).
 */
function createMidCityFacadeTexture(
  wallHex: string,
  trimHex: string,
  inkHex: string,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = wallHex;
    ctx.fillRect(0, 0, 256, 512);

    // Subtle horizontal brick coursing lines
    ctx.strokeStyle = inkHex;
    ctx.globalAlpha = 0.14;
    ctx.lineWidth = 2;
    for (let y = 24; y < 480; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Cornice bands
    ctx.fillStyle = trimHex;
    ctx.fillRect(0, 0, 256, 22);
    ctx.fillRect(0, 468, 256, 44);

    // 4 floors × 3 columns of stylized anime windows with diagonal sky reflections & curtains
    for (let row = 0; row < 4; row++) {
      const wy = 44 + row * 102;
      for (let col = 0; col < 3; col++) {
        const wx = 22 + col * 78;
        ctx.fillStyle = (row + col) % 3 === 0 ? '#3B2F2F' : '#1E293B';
        ctx.fillRect(wx, wy, 54, 68);

        // Warm interior glow or curtains on alternating windows
        if ((row + col) % 2 === 0) {
          ctx.fillStyle = '#FDE68A';
          ctx.globalAlpha = 0.35;
          ctx.fillRect(wx + 4, wy + 4, 46, 60);
          ctx.globalAlpha = 1.0;
        }

        // Diagonal cyan reflection slash
        ctx.fillStyle = '#7DD3FC';
        ctx.beginPath();
        ctx.moveTo(wx + 8, wy + 68);
        ctx.lineTo(wx + 38, wy);
        ctx.lineTo(wx + 48, wy);
        ctx.lineTo(wx + 18, wy + 68);
        ctx.closePath();
        ctx.fill();

        // Dark ink window frame, cross mullions & sill
        ctx.strokeStyle = inkHex;
        ctx.lineWidth = 4;
        ctx.strokeRect(wx, wy, 54, 68);
        ctx.beginPath();
        ctx.moveTo(wx + 27, wy);
        ctx.lineTo(wx + 27, wy + 68);
        ctx.moveTo(wx, wy + 34);
        ctx.lineTo(wx + 54, wy + 34);
        ctx.stroke();

        ctx.fillStyle = trimHex;
        ctx.fillRect(wx - 4, wy + 66, 62, 8);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * 2. BUILD COMPLETE MULTI-STORY HERO BUILDING
 * Includes Storefront + 2–3 Upper Apartment Floors + Micro-Detailed Balconies (AC Compressors, Satellite Dishes,
 * Flower Pots, Laundry Lines, Bistro Chairs, Fairy Lights) + Projecting Vertical Banners + Wall Posters + Rooftop Billboard.
 */
export function buildHeroBuildingWithBalconies(params: {
  spec: HeroShopSpec;
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
    spec,
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

  const group = new THREE.Group();
  group.name = spec.id;

  const w = spec.widthZ;
  const d = spec.depthX;
  const hGround = spec.groundFloorHeightY;
  const hUpperTotal = spec.upperFloorsCount * spec.upperFloorHeightY;
  const totalH = hGround + hUpperTotal;

  const signTex = createStoreSignTexture(
    spec.shopTitle,
    spec.shopSubtitle,
    spec.signBgHex,
    spec.signTextHex,
    spec.signAccentHex,
    palette.inkOutlineColor,
  );
  disposableTextures.push(signTex);

  const matGroundBrick = new THREE.MeshToonMaterial({
    color: spec.brickBaseHex,
    gradientMap: grad3,
  });
  const matUpperWall = new THREE.MeshToonMaterial({
    color: spec.upperWallHex,
    gradientMap: grad3,
  });
  const matTrim = new THREE.MeshToonMaterial({
    color: spec.trimHex,
    gradientMap: grad3,
  });
  const matDarkWood = new THREE.MeshToonMaterial({
    color: '#2A1D28',
    gradientMap: grad4,
  });
  const matIron = new THREE.MeshToonMaterial({
    color: '#1E2436',
    gradientMap: grad4,
  });
  const matAwningA = new THREE.MeshToonMaterial({
    color: spec.awningPrimaryHex,
    gradientMap: grad3,
  });
  const matAwningB = new THREE.MeshToonMaterial({
    color: spec.awningSecondaryHex,
    gradientMap: grad3,
  });
  const matWindowGlass = new THREE.MeshToonMaterial({
    color: '#38BDF8',
    gradientMap: grad3,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const matGlassSlash = new THREE.MeshBasicMaterial({
    color: '#BAE6FD',
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const matInteriorRoomBack = new THREE.MeshBasicMaterial({
    color:
      spec.windowDisplayType === 'nutcrackers'
        ? '#3B1D1A'
        : spec.windowDisplayType === 'hardware'
          ? '#1E293B'
          : '#272030',
  });
  const matInteriorWarmGlow = new THREE.MeshBasicMaterial({
    color:
      spec.windowDisplayType === 'nutcrackers'
        ? '#FEF08A'
        : spec.windowDisplayType === 'hardware'
          ? '#F97316'
          : '#FDE68A',
  });
  const matSign = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: signTex,
    gradientMap: grad3,
  });
  const matBrass = new THREE.MeshToonMaterial({
    color: '#FBBF24',
    gradientMap: grad4,
  });
  const matShrub = new THREE.MeshToonMaterial({
    color: '#10B981',
    gradientMap: grad3,
  });
  const matTerracotta = new THREE.MeshToonMaterial({
    color: '#C2410C',
    gradientMap: grad3,
  });
  const matAcUnit = new THREE.MeshToonMaterial({
    color: '#E2E8F0',
    gradientMap: grad3,
  });
  const matFlowerBloom = new THREE.MeshBasicMaterial({
    color: '#F43F5E',
  });
  const matFairyBulb = new THREE.MeshBasicMaterial({
    color: '#FEF08A',
  });

  disposableMaterials.push(
    matGroundBrick,
    matUpperWall,
    matTrim,
    matDarkWood,
    matIron,
    matAwningA,
    matAwningB,
    matWindowGlass,
    matGlassSlash,
    matInteriorRoomBack,
    matInteriorWarmGlow,
    matSign,
    matBrass,
    matShrub,
    matTerracotta,
    matAcUnit,
    matFlowerBloom,
    matFairyBulb,
  );

  // 1. Ground-Floor Commercial Hull (Z from -d to 0)
  const groundGeo = new THREE.BoxGeometry(w, hGround, d);
  groundGeo.translate(0, hGround * 0.5, -d * 0.5);
  // 2. Upper-Floor Apartment Hull (Z from -d to 0)
  const upperGeo = new THREE.BoxGeometry(w - 0.12, hUpperTotal, d - 0.12);
  upperGeo.translate(0, hGround + hUpperTotal * 0.5, -d * 0.5);
  // 3. Stone Cornice Ledges (Above Ground Floor & At Roof Parapet)
  const midCorniceGeo = new THREE.BoxGeometry(w + 0.35, 0.36, d + 0.35);
  midCorniceGeo.translate(0, hGround, -d * 0.5 + 0.1);
  const roofCorniceGeo = new THREE.BoxGeometry(w + 0.45, 0.48, d + 0.45);
  roofCorniceGeo.translate(0, totalH + 0.2, -d * 0.5 + 0.1);
  const parapetGeo = new THREE.BoxGeometry(w, 0.55, d);
  parapetGeo.translate(0, totalH + 0.65, -d * 0.5);

  disposableGeometries.push(
    groundGeo,
    upperGeo,
    midCorniceGeo,
    roofCorniceGeo,
    parapetGeo,
  );

  const groundMesh = new THREE.Mesh(groundGeo, matGroundBrick);
  groundMesh.castShadow = true;
  groundMesh.receiveShadow = true;
  const upperMesh = new THREE.Mesh(upperGeo, matUpperWall);
  upperMesh.castShadow = true;
  upperMesh.receiveShadow = true;
  const midCornice = new THREE.Mesh(midCorniceGeo, matTrim);
  const roofCornice = new THREE.Mesh(roofCorniceGeo, matTrim);
  const parapet = new THREE.Mesh(parapetGeo, matDarkWood);

  group.add(groundMesh, upperMesh, midCornice, roofCornice, parapet);
  attachComicInkOutline(groundMesh, group, inkLineMat, inkHullMat, 0.025, 15, inkRegistry);
  attachComicInkOutline(upperMesh, group, inkLineMat, inkHullMat, 0.025, 15, inkRegistry);
  attachComicInkOutline(midCornice, group, inkLineMat, inkHullMat, 0.025, 15, inkRegistry);
  attachComicInkOutline(roofCornice, group, inkLineMat, inkHullMat, 0.025, 15, inkRegistry);
  attachComicInkOutline(parapet, group, inkLineMat, inkHullMat, 0.025, 15, inkRegistry);

  // 4. Front Architectural Pilasters (flush at Z = +0.08m)
  const pilasterGeo = new THREE.BoxGeometry(0.48, hGround, 0.24);
  pilasterGeo.translate(0, hGround * 0.5, 0.08);
  disposableGeometries.push(pilasterGeo);
  for (const px of [-w * 0.46, 1.35, w * 0.46]) {
    const pil = new THREE.Mesh(pilasterGeo, matTrim);
    pil.position.x = px;
    group.add(pil);
    attachComicInkOutline(pil, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  }

  // 5. Ground-Floor Transparent Gateway Window (X = -1.85m) & Entrance Door (X = +3.25m)
  const winFrameGeo = new THREE.BoxGeometry(5.4, 3.0, 0.24);
  winFrameGeo.translate(-1.85, 2.25, 0.08);
  const winRoomBackGeo = new THREE.BoxGeometry(4.96, 2.6, 0.04);
  winRoomBackGeo.translate(-1.85, 2.25, 0.205);
  const winRoomCeilingGlowGeo = new THREE.BoxGeometry(4.6, 0.14, 0.06);
  winRoomCeilingGlowGeo.translate(-1.85, 3.42, 0.23);
  const winGlassGeo = new THREE.BoxGeometry(5.0, 2.65, 0.04);
  winGlassGeo.translate(-1.85, 2.25, 0.32);
  const slashGeo = new THREE.BoxGeometry(0.45, 2.3, 0.02);
  slashGeo.rotateZ(-0.35);
  slashGeo.translate(-2.4, 2.25, 0.35);

  const doorFrameGeo = new THREE.BoxGeometry(2.2, 3.55, 0.26);
  doorFrameGeo.translate(3.25, 1.78, 0.08);
  const doorLeafGeo = new THREE.BoxGeometry(1.8, 3.25, 0.14);
  doorLeafGeo.translate(3.25, 1.65, 0.16);
  const handleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.38, 8);
  handleGeo.translate(2.55, 1.5, 0.28);

  disposableGeometries.push(
    winFrameGeo,
    winRoomBackGeo,
    winRoomCeilingGlowGeo,
    winGlassGeo,
    slashGeo,
    doorFrameGeo,
    doorLeafGeo,
    handleGeo,
  );

  const winFrame = new THREE.Mesh(winFrameGeo, matDarkWood);
  const winRoomBack = new THREE.Mesh(winRoomBackGeo, matInteriorRoomBack);
  const winRoomCeilingGlow = new THREE.Mesh(
    winRoomCeilingGlowGeo,
    matInteriorWarmGlow,
  );
  const winGlass = new THREE.Mesh(winGlassGeo, matWindowGlass);
  const winSlash = new THREE.Mesh(slashGeo, matGlassSlash);
  const doorFrame = new THREE.Mesh(doorFrameGeo, matDarkWood);
  const doorLeaf = new THREE.Mesh(doorLeafGeo, matAwningA);
  const doorHandle = new THREE.Mesh(handleGeo, matBrass);
  group.add(
    winFrame,
    winRoomBack,
    winRoomCeilingGlow,
    winGlass,
    winSlash,
    doorFrame,
    doorLeaf,
    doorHandle,
  );
  attachComicInkOutline(winFrame, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  attachComicInkOutline(winGlass, group, inkLineMat, undefined, 0, 15, inkRegistry);
  attachComicInkOutline(doorFrame, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  attachComicInkOutline(doorLeaf, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  attachComicInkOutline(doorHandle, group, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);

  // 6. Specialized Connected Interior Room Gateway Dioramas (Visible through Transparent Glass)
  if (spec.windowDisplayType === 'nutcrackers') {
    // Crack & Sons Connected Interior Gateway: Wooden Counter, Christmas Tree, TV Ad Screen & 5 Nutcrackers
    const counterGeo = new THREE.BoxGeometry(4.6, 0.55, 0.08);
    counterGeo.translate(-1.85, 1.24, 0.24);
    const treeConeGeo = new THREE.ConeGeometry(0.45, 1.35, 8);
    treeConeGeo.translate(-3.75, 1.85, 0.25);
    const nutBodyGeo = new THREE.CylinderGeometry(0.15, 0.17, 0.72, 10);
    nutBodyGeo.translate(0, 1.62, 0.26);
    const nutHatGeo = new THREE.CylinderGeometry(0.17, 0.15, 0.38, 10);
    nutHatGeo.translate(0, 2.16, 0.26);
    disposableGeometries.push(counterGeo, treeConeGeo, nutBodyGeo, nutHatGeo);
    const counterMesh = new THREE.Mesh(counterGeo, matDarkWood);
    const treeMesh = new THREE.Mesh(treeConeGeo, matShrub);
    group.add(counterMesh, treeMesh);
    attachComicInkOutline(counterMesh, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
    attachComicInkOutline(treeMesh, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
    for (let nx = -2.95; nx <= -0.15; nx += 0.7) {
      const nb = new THREE.Mesh(nutBodyGeo, matAwningA);
      nb.position.x = nx;
      const nh = new THREE.Mesh(nutHatGeo, matBrass);
      nh.position.x = nx;
      group.add(nb, nh);
      attachComicInkOutline(nb, group, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
      attachComicInkOutline(nh, group, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
    }
  } else if (spec.windowDisplayType === 'hardware') {
    // Connected Garage & Underground Nuclear Launch Silo Gateway inside Arcade Hardware Window
    const siloHatchGeo = new THREE.BoxGeometry(2.6, 0.18, 0.08);
    siloHatchGeo.translate(-1.85, 1.12, 0.25);
    const nukeBodyGeo = new THREE.CylinderGeometry(0.36, 0.42, 1.45, 12);
    nukeBodyGeo.translate(-1.85, 1.85, 0.26);
    const nukeNoseGeo = new THREE.ConeGeometry(0.36, 0.62, 12);
    nukeNoseGeo.translate(-1.85, 2.88, 0.26);
    const toolCabGeo = new THREE.BoxGeometry(0.85, 1.35, 0.08);
    toolCabGeo.translate(-3.55, 1.65, 0.25);
    disposableGeometries.push(siloHatchGeo, nukeBodyGeo, nukeNoseGeo, toolCabGeo);
    const siloHatch = new THREE.Mesh(siloHatchGeo, matBrass);
    const nukeBody = new THREE.Mesh(nukeBodyGeo, matIron);
    const nukeNose = new THREE.Mesh(nukeNoseGeo, matFlowerBloom);
    const toolCab = new THREE.Mesh(toolCabGeo, matAwningA);
    group.add(siloHatch, nukeBody, nukeNose, toolCab);
    attachComicInkOutline(siloHatch, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
    attachComicInkOutline(nukeBody, group, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);
    attachComicInkOutline(nukeNose, group, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);
    attachComicInkOutline(toolCab, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  } else if (spec.windowDisplayType === 'mannequin') {
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.85, 10);
    torsoGeo.translate(-1.85, 1.65, 0.26);
    const headGeo = new THREE.SphereGeometry(0.16, 12, 10);
    headGeo.translate(-1.85, 2.28, 0.26);
    const standGeo = new THREE.CylinderGeometry(0.05, 0.22, 0.45, 8);
    standGeo.translate(-1.85, 1.05, 0.26);
    disposableGeometries.push(torsoGeo, headGeo, standGeo);
    const torso = new THREE.Mesh(torsoGeo, matAwningA);
    const head = new THREE.Mesh(headGeo, matTrim);
    const stand = new THREE.Mesh(standGeo, matBrass);
    group.add(torso, head, stand);
    attachComicInkOutline(torso, group, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
    attachComicInkOutline(head, group, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  } else if (
    spec.windowDisplayType === 'pastries' ||
    spec.windowDisplayType === 'ramen' ||
    spec.windowDisplayType === 'cafe' ||
    spec.windowDisplayType === 'books'
  ) {
    // Tiered display shelf with glowing warm lanterns / cake stands inside shop window
    const shelfGeo = new THREE.BoxGeometry(4.2, 0.12, 0.1);
    shelfGeo.translate(-1.85, 1.45, 0.25);
    const lanternGeo = new THREE.SphereGeometry(0.18, 10, 8);
    disposableGeometries.push(shelfGeo, lanternGeo);
    const shelf = new THREE.Mesh(shelfGeo, matTrim);
    group.add(shelf);
    for (const lx of [-3.2, -1.85, -0.5]) {
      const l = new THREE.Mesh(lanternGeo, matBrass);
      l.position.set(lx, 1.72, 0.26);
      group.add(l);
      attachComicInkOutline(l, group, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);
    }
  }

  // 7. Striped Storefront Awning & Compact Planters (tucked cleanly within Z = +0.55m)
  const stripeW = 0.72;
  const stripeGeo = new THREE.BoxGeometry(stripeW, 0.14, 1.15);
  disposableGeometries.push(stripeGeo);
  for (let i = 0; i < 8; i++) {
    const sx = -4.35 + i * stripeW;
    const stripe = new THREE.Mesh(
      stripeGeo,
      i % 2 === 0 ? matAwningA : matAwningB,
    );
    stripe.position.set(sx, 3.92, 0.48);
    stripe.rotation.x = 0.34;
    group.add(stripe);
    attachComicInkOutline(stripe, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  }

  const planterGeo = new THREE.BoxGeometry(2.1, 0.42, 0.44);
  planterGeo.translate(0, 0.21, 0.24);
  const bushGeo = new THREE.DodecahedronGeometry(0.3, 1);
  disposableGeometries.push(planterGeo, bushGeo);
  for (const px of [-3.25, -0.45]) {
    const planter = new THREE.Mesh(planterGeo, matDarkWood);
    planter.position.x = px;
    group.add(planter);
    attachComicInkOutline(planter, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
    for (const dx of [-0.55, 0, 0.55]) {
      const bush = new THREE.Mesh(bushGeo, matShrub);
      bush.position.set(px + dx, 0.52, 0.24);
      const bushSub = new THREE.Mesh(bushGeo, matShrub);
      bushSub.scale.set(0.75, 0.68, 0.75);
      bushSub.position.set(px + dx + 0.14, 0.46, 0.32);
      group.add(bush, bushSub);
      attachComicInkOutline(bush, group, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);
      for (const fOff of [-0.12, 0.08]) {
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 6, 6),
          dx === 0 ? matBrass : matFlowerBloom,
        );
        petal.position.set(px + dx + fOff, 0.76, 0.28);
        group.add(petal);
      }
    }
  }

  // 8. Storefront Fascia Signboard + Optional Warning Sign + Eye-Level Promotional Wall Poster
  const mainSignGeo = new THREE.BoxGeometry(4.9, 1.15, 0.2);
  mainSignGeo.translate(-0.4, 4.82, 0.32);
  disposableGeometries.push(mainSignGeo);
  const mainSign = new THREE.Mesh(mainSignGeo, matSign);
  group.add(mainSign);
  attachComicInkOutline(mainSign, group, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);

  if (spec.warningTitle && spec.warningSubtitle) {
    const warnTex = createStoreSignTexture(
      spec.warningTitle,
      spec.warningSubtitle,
      '#7F1D1D',
      '#FEF2F2',
      '#FBBF24',
      palette.inkOutlineColor,
    );
    disposableTextures.push(warnTex);
    const matWarn = new THREE.MeshToonMaterial({
      color: 0xffffff,
      map: warnTex,
      gradientMap: grad3,
    });
    disposableMaterials.push(matWarn);
    const warnGeo = new THREE.BoxGeometry(3.8, 0.72, 0.16);
    warnGeo.translate(3.15, 4.15, 0.34);
    disposableGeometries.push(warnGeo);
    const warnMesh = new THREE.Mesh(warnGeo, matWarn);
    group.add(warnMesh);
    attachComicInkOutline(warnMesh, group, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  }

  // Eye-level Framed Street Poster on Right/Center Pilaster
  if (spec.posterTitle) {
    const posterTex = createVerticalBannerTexture(
      spec.posterTitle,
      spec.signBgHex,
      spec.signAccentHex,
      palette.inkOutlineColor,
    );
    disposableTextures.push(posterTex);
    const matPoster = new THREE.MeshToonMaterial({
      color: 0xffffff,
      map: posterTex,
      gradientMap: grad3,
    });
    disposableMaterials.push(matPoster);
    const posterGeo = new THREE.BoxGeometry(0.68, 1.15, 0.06);
    posterGeo.translate(1.35, 2.1, 0.23);
    disposableGeometries.push(posterGeo);
    const posterMesh = new THREE.Mesh(posterGeo, matPoster);
    group.add(posterMesh);
    attachComicInkOutline(posterMesh, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  }

  // Projecting Vertical Street Banner on Steel Outrigger Brackets
  if (spec.bannerText) {
    const bannerTex = createVerticalBannerTexture(
      spec.bannerText,
      spec.awningPrimaryHex,
      spec.signAccentHex,
      palette.inkOutlineColor,
    );
    disposableTextures.push(bannerTex);
    const matBanner = new THREE.MeshToonMaterial({
      color: 0xffffff,
      map: bannerTex,
      gradientMap: grad3,
    });
    disposableMaterials.push(matBanner);

    const bannerX = w * 0.45;
    const bannerY = hGround + 2.8;
    const bannerGeo = new THREE.BoxGeometry(0.1, 3.6, 0.85);
    bannerGeo.translate(bannerX, bannerY, 0.62);
    const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.95, 6);
    armGeo.rotateX(Math.PI / 2);
    disposableGeometries.push(bannerGeo, armGeo);

    const bannerMesh = new THREE.Mesh(bannerGeo, matBanner);
    const topArm = new THREE.Mesh(armGeo, matIron);
    topArm.position.set(bannerX, bannerY + 1.65, 0.52);
    const botArm = new THREE.Mesh(armGeo, matIron);
    botArm.position.set(bannerX, bannerY - 1.65, 0.52);
    group.add(bannerMesh, topArm, botArm);
    attachComicInkOutline(bannerMesh, group, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);
  }

  // 9. UPPER-FLOOR WINDOWS & MICRO-DETAILED CANTILEVERED WROUGHT-IRON BALCONIES
  // Includes: Wrought-iron railings, Split AC Outdoor Compressor Units with fan grilles,
  // Parabolic Satellite Dishes, Terracotta Flower Pots & Railing Planters, Hanging Laundry Lines,
  // Bistro Chairs, and Warm String Fairy Lights!
  const uWinFrameGeo = new THREE.BoxGeometry(1.55, 2.05, 0.18);
  const uWinRoomBackGeo = new THREE.BoxGeometry(1.3, 1.8, 0.04);
  const uWinGlassGeo = new THREE.BoxGeometry(1.32, 1.82, 0.04);
  const uBedGeo = new THREE.BoxGeometry(0.46, 0.24, 0.05);
  const uDeskMonitorGeo = new THREE.BoxGeometry(0.36, 0.24, 0.05);
  const uNewsTvGeo = new THREE.BoxGeometry(0.42, 0.26, 0.05);
  const balSlabGeo = new THREE.BoxGeometry(2.45, 0.16, 0.96);
  const balFrontRailGeo = new THREE.BoxGeometry(2.45, 0.07, 0.07);
  const balSideRailGeo = new THREE.BoxGeometry(0.07, 0.07, 0.96);
  const balPostGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.88, 6);

  // Micro-detail balcony prop geometries
  const acBoxGeo = new THREE.BoxGeometry(0.74, 0.54, 0.34);
  const acFanGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.05, 12);
  acFanGeo.rotateX(Math.PI / 2);
  const potGeo = new THREE.CylinderGeometry(0.17, 0.12, 0.28, 8);
  const potBushGeo = new THREE.DodecahedronGeometry(0.2, 0);
  const flowerDotGeo = new THREE.SphereGeometry(0.065, 6, 6);
  const railPlanterGeo = new THREE.BoxGeometry(0.95, 0.22, 0.24);
  const dishBowlGeo = new THREE.SphereGeometry(0.34, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.42);
  dishBowlGeo.rotateX(Math.PI * 0.38);
  const clothItemGeo = new THREE.BoxGeometry(0.36, 0.48, 0.03);
  const fairyBulbGeo = new THREE.SphereGeometry(0.055, 6, 6);
  const chairSeatGeo = new THREE.BoxGeometry(0.42, 0.05, 0.42);
  const chairBackGeo = new THREE.BoxGeometry(0.42, 0.46, 0.05);

  const matCyanPhoneGlow = new THREE.MeshBasicMaterial({color: '#22D3EE'});
  const matBedroomWall = new THREE.MeshBasicMaterial({color: '#1E293B'});
  disposableMaterials.push(matCyanPhoneGlow, matBedroomWall);

  disposableGeometries.push(
    uWinFrameGeo,
    uWinRoomBackGeo,
    uWinGlassGeo,
    uBedGeo,
    uDeskMonitorGeo,
    uNewsTvGeo,
    balSlabGeo,
    balFrontRailGeo,
    balSideRailGeo,
    balPostGeo,
    acBoxGeo,
    acFanGeo,
    potGeo,
    potBushGeo,
    flowerDotGeo,
    railPlanterGeo,
    dishBowlGeo,
    clothItemGeo,
    fairyBulbGeo,
    chairSeatGeo,
    chairBackGeo,
  );

  const windowColsX = [-3.3, 0.0, 3.3];
  for (let fl = 0; fl < spec.upperFloorsCount; fl++) {
    const floorBaseY = hGround + fl * spec.upperFloorHeightY;

    for (let c = 0; c < windowColsX.length; c++) {
      const wx = windowColsX[c];
      const wf = new THREE.Mesh(uWinFrameGeo, matTrim);
      wf.position.set(wx, floorBaseY + 1.35, 0.06);

      const isHeroBedroomGateway = fl === 0 && c === 1;
      const uRoomBack = new THREE.Mesh(
        uWinRoomBackGeo,
        isHeroBedroomGateway ? matBedroomWall : matInteriorRoomBack,
      );
      uRoomBack.position.set(wx, floorBaseY + 1.35, 0.16);

      const wg = new THREE.Mesh(uWinGlassGeo, matWindowGlass);
      wg.position.set(wx, floorBaseY + 1.35, 0.24);
      group.add(wf, uRoomBack, wg);
      attachComicInkOutline(wf, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
      attachComicInkOutline(wg, group, inkLineMat, undefined, 0, 15, inkRegistry);

      if (isHeroBedroomGateway) {
        // Connected Dark Room Bedroom Diorama inside 2nd-floor Center Window Gateway:
        // Bed + Indigo Blanket, Cyan-lit Hacker Desk & Phone Glow, and Live News TV!
        const bedMesh = new THREE.Mesh(uBedGeo, matAwningA);
        bedMesh.position.set(wx - 0.34, floorBaseY + 0.72, 0.19);
        const monitorMesh = new THREE.Mesh(uDeskMonitorGeo, matCyanPhoneGlow);
        monitorMesh.position.set(wx + 0.32, floorBaseY + 1.05, 0.195);
        const tvMesh = new THREE.Mesh(uNewsTvGeo, matFairyBulb);
        tvMesh.position.set(wx - 0.28, floorBaseY + 1.48, 0.195);
        group.add(bedMesh, monitorMesh, tvMesh);
        attachComicInkOutline(bedMesh, group, inkLineMat, inkHullMat, 0.025, 15, inkRegistry);
        attachComicInkOutline(monitorMesh, group, inkLineMat, undefined, 0, 15, inkRegistry);
        attachComicInkOutline(tvMesh, group, inkLineMat, undefined, 0, 15, inkRegistry);
      }

      // Wall-mounted Split AC Outdoor Compressor Unit beside alternating windows
      if ((fl + c) % 2 === 0) {
        const acX = wx + 1.18;
        const acY = floorBaseY + 1.85;
        const acBox = new THREE.Mesh(acBoxGeo, matAcUnit);
        acBox.position.set(acX, acY, 0.2);
        const acFan = new THREE.Mesh(acFanGeo, matIron);
        acFan.position.set(acX - 0.1, acY, 0.36);
        group.add(acBox, acFan);
        attachComicInkOutline(acBox, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
        attachComicInkOutline(acFan, group, inkLineMat, undefined, 0, 15, inkRegistry);
      }

      // Cantilevered Wrought-Iron Balcony on EVERY bay for ultra-rich urban facade detail
      const slab = new THREE.Mesh(balSlabGeo, matTrim);
      slab.position.set(wx, floorBaseY + 0.22, 0.46);
      slab.castShadow = true;

      const topRail = new THREE.Mesh(balFrontRailGeo, matIron);
      topRail.position.set(wx, floorBaseY + 1.08, 0.9);
      const leftRail = new THREE.Mesh(balSideRailGeo, matIron);
      leftRail.position.set(wx - 1.16, floorBaseY + 1.08, 0.46);
      const rightRail = new THREE.Mesh(balSideRailGeo, matIron);
      rightRail.position.set(wx + 1.16, floorBaseY + 1.08, 0.46);

      group.add(slab, topRail, leftRail, rightRail);
      attachComicInkOutline(slab, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
      attachComicInkOutline(topRail, group, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
      attachComicInkOutline(leftRail, group, inkLineMat, undefined, 0, 15, inkRegistry);
      attachComicInkOutline(rightRail, group, inkLineMat, undefined, 0, 15, inkRegistry);

      for (const bxOffset of [-1.12, -0.74, -0.37, 0, 0.37, 0.74, 1.12]) {
        const post = new THREE.Mesh(balPostGeo, matIron);
        post.position.set(wx + bxOffset, floorBaseY + 0.65, 0.9);
        group.add(post);
      }

      // Balcony Railing Flower Box Planter with Colorful Blossoms
      const rPlanter = new THREE.Mesh(railPlanterGeo, matTerracotta);
      rPlanter.position.set(wx, floorBaseY + 0.98, 0.98);
      group.add(rPlanter);
      attachComicInkOutline(rPlanter, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
      for (const fx of [-0.28, 0, 0.28]) {
        const pBush = new THREE.Mesh(potBushGeo, matShrub);
        pBush.position.set(wx + fx, floorBaseY + 1.16, 0.98);
        const fDot = new THREE.Mesh(flowerDotGeo, matFlowerBloom);
        fDot.position.set(wx + fx, floorBaseY + 1.32, 1.02);
        group.add(pBush, fDot);
      }

      // Terracotta Potted Plant on Balcony Corner
      const pot = new THREE.Mesh(potGeo, matTerracotta);
      pot.position.set(wx - 0.85, floorBaseY + 0.44, 0.62);
      const potPlant = new THREE.Mesh(potBushGeo, matShrub);
      potPlant.position.set(wx - 0.85, floorBaseY + 0.68, 0.62);
      group.add(pot, potPlant);
      attachComicInkOutline(pot, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);

      // Balcony Bistro Chair on Center Balcony Bays
      if (c === 1) {
        const seat = new THREE.Mesh(chairSeatGeo, matDarkWood);
        seat.position.set(wx + 0.68, floorBaseY + 0.56, 0.58);
        const back = new THREE.Mesh(chairBackGeo, matDarkWood);
        back.position.set(wx + 0.68, floorBaseY + 0.8, 0.39);
        group.add(seat, back);
        attachComicInkOutline(seat, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);

        // Warm String Fairy Lights draped along Center Balcony Railing
        for (const lx of [-0.9, -0.45, 0, 0.45, 0.9]) {
          const bulb = new THREE.Mesh(fairyBulbGeo, matFairyBulb);
          bulb.position.set(wx + lx, floorBaseY + 1.04, 0.95);
          group.add(bulb);
        }
      }

      // Parabolic Satellite Dish mounted on Outer Balcony Railing
      if (c === 2 && fl === spec.upperFloorsCount - 1) {
        const dish = new THREE.Mesh(dishBowlGeo, matAcUnit);
        dish.position.set(wx + 1.08, floorBaseY + 1.25, 0.92);
        group.add(dish);
        attachComicInkOutline(dish, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
      }

      // Hanging Laundry Line with Colorful Clothes on Upper Apartment Floors
      if (fl === 1 && c === 0) {
        for (let ci = 0; ci < 3; ci++) {
          const clothMat = ci === 0 ? matAwningA : ci === 1 ? matAwningB : matBrass;
          const cloth = new THREE.Mesh(clothItemGeo, clothMat);
          cloth.position.set(wx - 0.5 + ci * 0.5, floorBaseY + 0.82, 0.88);
          cloth.rotation.z = (ci - 1) * 0.08;
          group.add(cloth);
          attachComicInkOutline(cloth, group, inkLineMat, inkHullMat, 0.025, 15, inkRegistry);
        }
      }
    }
  }

  // 10. Rooftop Water Tank / Chimneys for Urban Skyline Silhouette
  if (spec.hasRoofWaterTank) {
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.35, 6);
    const tankGeo = new THREE.CylinderGeometry(1.05, 1.05, 1.65, 12);
    const roofCapGeo = new THREE.ConeGeometry(1.18, 0.65, 12);
    disposableGeometries.push(legGeo, tankGeo, roofCapGeo);

    const tank = new THREE.Mesh(tankGeo, matDarkWood);
    tank.position.set(-2.4, totalH + 2.1, -d * 0.55);
    tank.castShadow = true;
    const cap = new THREE.Mesh(roofCapGeo, matIron);
    cap.position.set(-2.4, totalH + 3.25, -d * 0.55);
    group.add(tank, cap);
    attachComicInkOutline(tank, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
    attachComicInkOutline(cap, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);

    for (const [lx, lz] of [
      [-3.0, -d * 0.55 - 0.6],
      [-1.8, -d * 0.55 - 0.6],
      [-3.0, -d * 0.55 + 0.6],
      [-1.8, -d * 0.55 + 0.6],
    ]) {
      const leg = new THREE.Mesh(legGeo, matIron);
      leg.position.set(lx, totalH + 0.9, lz);
      group.add(leg);
    }
  }

  // 11. Illuminated Steel-Truss Rooftop Billboard (When Equipped)
  if (spec.rooftopBillboard) {
    const bb = spec.rooftopBillboard;
    const bbTex = createStoreSignTexture(
      bb.title,
      bb.subtitle,
      bb.bgHex,
      bb.textHex,
      bb.accentHex,
      palette.inkOutlineColor,
    );
    disposableTextures.push(bbTex);
    const matBb = new THREE.MeshToonMaterial({
      color: 0xffffff,
      map: bbTex,
      gradientMap: grad3,
    });
    disposableMaterials.push(matBb);

    const bbBoardGeo = new THREE.BoxGeometry(6.8, 2.55, 0.28);
    bbBoardGeo.translate(1.2, totalH + 2.85, -1.2);
    const bbStrutGeo = new THREE.CylinderGeometry(0.09, 0.09, 2.6, 6);
    const bbCatwalkGeo = new THREE.BoxGeometry(7.1, 0.12, 0.65);
    bbCatwalkGeo.translate(1.2, totalH + 1.45, -0.9);
    disposableGeometries.push(bbBoardGeo, bbStrutGeo, bbCatwalkGeo);

    const bbBoard = new THREE.Mesh(bbBoardGeo, matBb);
    const bbCatwalk = new THREE.Mesh(bbCatwalkGeo, matIron);
    group.add(bbBoard, bbCatwalk);
    attachComicInkOutline(bbBoard, group, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
    attachComicInkOutline(bbCatwalk, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);

    for (const sx of [-1.6, 1.2, 4.0]) {
      const strut = new THREE.Mesh(bbStrutGeo, matIron);
      strut.position.set(sx, totalH + 1.6, -1.25);
      group.add(strut);
    }
  }

  // 12. Rear Facade Architectural Details (Service Door, Exit Light, Twin HVAC Units, Utility Meters, Downspout & Rear Windows)
  const rearZ = -d - 0.06;
  const rearDoorGeo = new THREE.BoxGeometry(1.5, 2.5, 0.14);
  rearDoorGeo.translate(-1.8, 1.25, rearZ);
  const rearExitLampGeo = new THREE.BoxGeometry(0.45, 0.2, 0.14);
  rearExitLampGeo.translate(-1.8, 2.72, rearZ - 0.04);
  const rearMeterGeo = new THREE.BoxGeometry(0.65, 0.85, 0.18);
  rearMeterGeo.translate(1.4, 1.65, rearZ);
  const rearGutterGeo = new THREE.CylinderGeometry(0.06, 0.06, totalH, 8);
  rearGutterGeo.translate(w * 0.44, totalH * 0.5, rearZ);
  disposableGeometries.push(rearDoorGeo, rearExitLampGeo, rearMeterGeo, rearGutterGeo);

  const rearDoor = new THREE.Mesh(rearDoorGeo, matIron);
  const rearExitLamp = new THREE.Mesh(rearExitLampGeo, matFairyBulb);
  const rearMeter = new THREE.Mesh(rearMeterGeo, matAcUnit);
  const rearGutter = new THREE.Mesh(rearGutterGeo, matIron);
  group.add(rearDoor, rearExitLamp, rearMeter, rearGutter);
  attachComicInkOutline(rearDoor, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  attachComicInkOutline(rearMeter, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);

  for (let fl = 0; fl < spec.upperFloorsCount; fl++) {
    const floorBaseY = hGround + fl * spec.upperFloorHeightY;
    for (const rwx of [-2.8, 0.4, 3.1]) {
      const rwf = new THREE.Mesh(uWinFrameGeo, matTrim);
      rwf.position.set(rwx, floorBaseY + 1.35, rearZ);
      const rwg = new THREE.Mesh(uWinGlassGeo, matWindowGlass);
      rwg.position.set(rwx, floorBaseY + 1.35, rearZ - 0.05);
      group.add(rwf, rwg);
      attachComicInkOutline(rwf, group, inkLineMat, undefined, 0, 15, inkRegistry);
    }
    const rearAc = new THREE.Mesh(acBoxGeo, matAcUnit);
    rearAc.position.set(-0.8, floorBaseY + 1.45, rearZ - 0.12);
    group.add(rearAc);
    attachComicInkOutline(rearAc, group, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  }

  group.userData.inspectable = {
    id: spec.id,
    label: `${spec.shopTitle} (${spec.shopSubtitle})`,
    category: 'Hero Storefront & Apartment Building',
  };

  return group;
}

/**
 * 3. BUILD ICONIC AMERICAN CAST-IRON FIRE HYDRANT (`PRP-HYDRANT-01`)
 */
export function buildAmericanFireHydrant(params: {
  grad3: THREE.DataTexture;
  grad4: THREE.DataTexture;
  inkLineMat: THREE.LineBasicMaterial;
  inkHullMat: THREE.MeshBasicMaterial;
  inkRegistry: THREE.Object3D[];
  disposableGeometries: THREE.BufferGeometry[];
  disposableMaterials: THREE.Material[];
}): THREE.Group {
  const {
    grad3,
    grad4,
    inkLineMat,
    inkHullMat,
    inkRegistry,
    disposableGeometries,
    disposableMaterials,
  } = params;

  const g = new THREE.Group();
  g.name = 'american-fire-hydrant';

  const matRed = new THREE.MeshToonMaterial({
    color: '#DC2626',
    gradientMap: grad3,
  });
  const matSilver = new THREE.MeshToonMaterial({
    color: '#E2E8F0',
    gradientMap: grad4,
  });
  const matDarkIron = new THREE.MeshToonMaterial({
    color: '#1E293B',
    gradientMap: grad4,
  });
  disposableMaterials.push(matRed, matSilver, matDarkIron);

  const baseFlangeGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.14, 8);
  baseFlangeGeo.translate(0, 0.07, 0);
  const barrelGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.58, 10);
  barrelGeo.translate(0, 0.43, 0);
  const collarGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 10);
  collarGeo.translate(0, 0.74, 0);
  const bonnetGeo = new THREE.SphereGeometry(0.19, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55);
  bonnetGeo.translate(0, 0.76, 0);
  const topNutGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.1, 5);
  topNutGeo.translate(0, 0.96, 0);
  const sideNozzleGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.52, 8);
  sideNozzleGeo.rotateZ(Math.PI / 2);
  sideNozzleGeo.translate(0, 0.54, 0);
  const frontSteamerGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.28, 10);
  frontSteamerGeo.rotateX(Math.PI / 2);
  frontSteamerGeo.translate(0, 0.48, 0.14);

  disposableGeometries.push(
    baseFlangeGeo,
    barrelGeo,
    collarGeo,
    bonnetGeo,
    topNutGeo,
    sideNozzleGeo,
    frontSteamerGeo,
  );

  const base = new THREE.Mesh(baseFlangeGeo, matDarkIron);
  const barrel = new THREE.Mesh(barrelGeo, matRed);
  barrel.castShadow = true;
  const collar = new THREE.Mesh(collarGeo, matSilver);
  const bonnet = new THREE.Mesh(bonnetGeo, matRed);
  const topNut = new THREE.Mesh(topNutGeo, matSilver);
  const sideNozzles = new THREE.Mesh(sideNozzleGeo, matSilver);
  const frontSteamer = new THREE.Mesh(frontSteamerGeo, matSilver);

  g.add(base, barrel, collar, bonnet, topNut, sideNozzles, frontSteamer);
  attachComicInkOutline(base, g, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);
  attachComicInkOutline(barrel, g, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);
  attachComicInkOutline(collar, g, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);
  attachComicInkOutline(bonnet, g, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);
  attachComicInkOutline(sideNozzles, g, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);
  attachComicInkOutline(frontSteamer, g, inkLineMat, inkHullMat, 0.05, 15, inkRegistry);

  return g;
}

/**
 * 4. BUILD AMERICAN RIBBED MUNICIPAL DUSTBIN & TRASH BAGS (`PRP-TRASH-01` & `PRP-LITTER-01`)
 */
export function buildMunicipalDustbin(params: {
  grad3: THREE.DataTexture;
  grad4: THREE.DataTexture;
  inkLineMat: THREE.LineBasicMaterial;
  inkHullMat: THREE.MeshBasicMaterial;
  inkRegistry: THREE.Object3D[];
  disposableGeometries: THREE.BufferGeometry[];
  disposableMaterials: THREE.Material[];
}): THREE.Group {
  const {
    grad3,
    grad4,
    inkLineMat,
    inkHullMat,
    inkRegistry,
    disposableGeometries,
    disposableMaterials,
  } = params;

  const g = new THREE.Group();
  g.name = 'municipal-dustbin';

  const matBinSteel = new THREE.MeshToonMaterial({
    color: '#475569',
    gradientMap: grad4,
  });
  const matBinLid = new THREE.MeshToonMaterial({
    color: '#334155',
    gradientMap: grad4,
  });
  const matTrashBag = new THREE.MeshToonMaterial({
    color: '#1E1B2E',
    gradientMap: grad3,
  });
  disposableMaterials.push(matBinSteel, matBinLid, matTrashBag);

  const canBodyGeo = new THREE.CylinderGeometry(0.32, 0.27, 0.84, 12);
  canBodyGeo.translate(0, 0.42, 0);
  const rimGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12);
  rimGeo.translate(0, 0.85, 0);
  const domeLidGeo = new THREE.SphereGeometry(0.33, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
  domeLidGeo.translate(0, 0.86, 0);
  const bagGeo = new THREE.DodecahedronGeometry(0.24, 0);
  bagGeo.scale(1.1, 0.85, 1.0);

  disposableGeometries.push(canBodyGeo, rimGeo, domeLidGeo, bagGeo);

  const canBody = new THREE.Mesh(canBodyGeo, matBinSteel);
  canBody.castShadow = true;
  const rim = new THREE.Mesh(rimGeo, matBinLid);
  const domeLid = new THREE.Mesh(domeLidGeo, matBinLid);
  const bag1 = new THREE.Mesh(bagGeo, matTrashBag);
  bag1.position.set(0.38, 0.2, 0.16);
  const bag2 = new THREE.Mesh(bagGeo, matTrashBag);
  bag2.position.set(0.24, 0.18, -0.26);
  bag2.scale.setScalar(0.82);

  g.add(canBody, rim, domeLid, bag1, bag2);
  attachComicInkOutline(canBody, g, inkLineMat, inkHullMat, 0.05, 12, inkRegistry);
  attachComicInkOutline(rim, g, inkLineMat, inkHullMat, 0.05, 12, inkRegistry);
  attachComicInkOutline(domeLid, g, inkLineMat, inkHullMat, 0.05, 12, inkRegistry);
  attachComicInkOutline(bag1, g, inkLineMat, inkHullMat, 0.05, 10, inkRegistry);
  attachComicInkOutline(bag2, g, inkLineMat, inkHullMat, 0.05, 10, inkRegistry);

  return g;
}

/**
 * 5. BUILD SIDEWALK PARK BENCH, BLUE AMERICAN MAILBOX, STREET TREE IN GRATE,
 * TRAFFIC SIGNAL POLE & STREET SIGNPOST
 */
export function buildParkBench(params: {
  grad3: THREE.DataTexture;
  grad4: THREE.DataTexture;
  inkLineMat: THREE.LineBasicMaterial;
  inkHullMat: THREE.MeshBasicMaterial;
  inkRegistry: THREE.Object3D[];
  disposableGeometries: THREE.BufferGeometry[];
  disposableMaterials: THREE.Material[];
}): THREE.Group {
  const {
    grad3,
    grad4,
    inkLineMat,
    inkHullMat,
    inkRegistry,
    disposableGeometries,
    disposableMaterials,
  } = params;

  const g = new THREE.Group();
  const matWood = new THREE.MeshToonMaterial({color: '#9A5B32', gradientMap: grad3});
  const matIron = new THREE.MeshToonMaterial({color: '#1E293B', gradientMap: grad4});
  disposableMaterials.push(matWood, matIron);

  const seatGeo = new THREE.BoxGeometry(0.55, 0.08, 1.75);
  seatGeo.translate(0, 0.44, 0);
  const backGeo = new THREE.BoxGeometry(0.08, 0.46, 1.75);
  backGeo.translate(-0.24, 0.72, 0);
  const legGeo = new THREE.BoxGeometry(0.58, 0.44, 0.1);
  disposableGeometries.push(seatGeo, backGeo, legGeo);

  const seat = new THREE.Mesh(seatGeo, matWood);
  seat.castShadow = true;
  const back = new THREE.Mesh(backGeo, matWood);
  back.castShadow = true;
  g.add(seat, back);
  attachComicInkOutline(seat, g, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  attachComicInkOutline(back, g, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);

  for (const lz of [-0.72, 0.72]) {
    const leg = new THREE.Mesh(legGeo, matIron);
    leg.position.set(0, 0.22, lz);
    g.add(leg);
    attachComicInkOutline(leg, g, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  }
  return g;
}

export function buildAmericanMailbox(params: {
  grad3: THREE.DataTexture;
  inkLineMat: THREE.LineBasicMaterial;
  inkHullMat: THREE.MeshBasicMaterial;
  inkRegistry: THREE.Object3D[];
  disposableGeometries: THREE.BufferGeometry[];
  disposableMaterials: THREE.Material[];
}): THREE.Group {
  const {grad3, inkLineMat, inkHullMat, inkRegistry, disposableGeometries, disposableMaterials} =
    params;

  const g = new THREE.Group();
  const matBlue = new THREE.MeshToonMaterial({color: '#1D4ED8', gradientMap: grad3});
  const matStripe = new THREE.MeshToonMaterial({color: '#F8FAFC', gradientMap: grad3});
  disposableMaterials.push(matBlue, matStripe);

  const boxGeo = new THREE.BoxGeometry(0.52, 0.88, 0.52);
  boxGeo.translate(0, 0.44, 0);
  const archGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.52, 12);
  archGeo.rotateZ(Math.PI / 2);
  archGeo.translate(0, 0.88, 0);
  const badgeGeo = new THREE.BoxGeometry(0.54, 0.12, 0.42);
  badgeGeo.translate(0, 0.68, 0);
  disposableGeometries.push(boxGeo, archGeo, badgeGeo);

  const box = new THREE.Mesh(boxGeo, matBlue);
  box.castShadow = true;
  const arch = new THREE.Mesh(archGeo, matBlue);
  const badge = new THREE.Mesh(badgeGeo, matStripe);
  g.add(box, arch, badge);
  attachComicInkOutline(box, g, inkLineMat, inkHullMat, 0.045, 15, inkRegistry);
  attachComicInkOutline(arch, g, inkLineMat, inkHullMat, 0.045, 15, inkRegistry);
  return g;
}

export function buildStreetTreeInGrate(params: {
  variant: number;
  grad3: THREE.DataTexture;
  inkLineMat: THREE.LineBasicMaterial;
  inkHullMat: THREE.MeshBasicMaterial;
  inkRegistry: THREE.Object3D[];
  disposableGeometries: THREE.BufferGeometry[];
  disposableMaterials: THREE.Material[];
}): THREE.Group {
  const {
    variant,
    grad3,
    inkLineMat,
    inkHullMat,
    inkRegistry,
    disposableGeometries,
    disposableMaterials,
  } = params;

  const g = new THREE.Group();
  const speciesPalettes = [
    {name: 'Zelkova Elm Tree', trunk: '#5C3A21', primary: '#15803D', secondary: '#166534', highlight: '#4ADE80'},
    {name: 'Urban Maple Tree', trunk: '#52341E', primary: '#0F766E', secondary: '#115E59', highlight: '#2DD4BF'},
    {name: 'Golden Ginkgo Tree', trunk: '#6B4423', primary: '#4D7C0F', secondary: '#3F6212', highlight: '#A3E635'},
    {name: 'Sakura Blossom Tree', trunk: '#4A2E2B', primary: '#166534', secondary: '#14532D', highlight: '#F472B6'},
  ];
  const sp = speciesPalettes[variant % speciesPalettes.length];

  const matFoliageMain = new THREE.MeshToonMaterial({color: sp.primary, gradientMap: grad3});
  const matFoliageDeep = new THREE.MeshToonMaterial({color: sp.secondary, gradientMap: grad3});
  const matFoliageHi = new THREE.MeshToonMaterial({color: sp.highlight, gradientMap: grad3});
  const matTrunk = new THREE.MeshToonMaterial({color: sp.trunk, gradientMap: grad3});
  const matGrate = new THREE.MeshToonMaterial({color: '#1E293B', gradientMap: grad3});
  disposableMaterials.push(matFoliageMain, matFoliageDeep, matFoliageHi, matTrunk, matGrate);

  // 1. Detailed Cast-Iron Tree Grate + Inner Soil Bed
  const grateGeo = new THREE.BoxGeometry(1.32, 0.04, 1.32);
  grateGeo.translate(0, 0.02, 0);
  const trunkGeo = new THREE.CylinderGeometry(0.13, 0.25, 2.65, 10);
  trunkGeo.translate(0, 1.32, 0);
  const rootGeo = new THREE.ConeGeometry(0.14, 0.48, 6);
  const barkRingGeo = new THREE.TorusGeometry(0.18, 0.028, 6, 10);
  barkRingGeo.rotateX(Math.PI / 2);
  const branchGeo = new THREE.CylinderGeometry(0.055, 0.1, 1.35, 7);
  const leafCloudGeo = new THREE.IcosahedronGeometry(1.0, 2);
  const petalGeo = new THREE.CircleGeometry(0.065, 6);
  petalGeo.rotateX(-Math.PI / 2);

  disposableGeometries.push(
    grateGeo,
    trunkGeo,
    rootGeo,
    barkRingGeo,
    branchGeo,
    leafCloudGeo,
    petalGeo,
  );

  const grate = new THREE.Mesh(grateGeo, matGrate);
  const trunk = new THREE.Mesh(trunkGeo, matTrunk);
  trunk.castShadow = true;
  g.add(grate, trunk);
  attachComicInkOutline(grate, g, inkLineMat, undefined, 0, 15, inkRegistry);
  attachComicInkOutline(trunk, g, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);

  // 2. Flared Root Buttresses + Bark Ridge Rings
  for (let r = 0; r < 4; r++) {
    const angle = (r * Math.PI) / 2 + 0.35;
    const root = new THREE.Mesh(rootGeo, matTrunk);
    root.position.set(Math.cos(angle) * 0.18, 0.2, Math.sin(angle) * 0.18);
    root.rotation.z = -Math.cos(angle) * 0.42;
    root.rotation.x = Math.sin(angle) * 0.42;
    g.add(root);
  }
  for (const ry of [0.65, 1.25, 1.85]) {
    const ring = new THREE.Mesh(barkRingGeo, matTrunk);
    ring.position.y = ry;
    const s = 1 - (ry / 3.0) * 0.28;
    ring.scale.set(s, 1, s);
    g.add(ring);
  }

  // 3. 4 Angled Structural Wooden Limbs Reaching Into the Canopy
  const branches = [
    {x: -0.38, y: 2.45, z: 0.24, rx: 0.35, rz: 0.58},
    {x: 0.4, y: 2.52, z: -0.22, rx: -0.32, rz: -0.55},
    {x: 0.22, y: 2.6, z: 0.38, rx: 0.55, rz: -0.3},
    {x: -0.24, y: 2.55, z: -0.36, rx: -0.52, rz: 0.32},
  ];
  for (const br of branches) {
    const bMesh = new THREE.Mesh(branchGeo, matTrunk);
    bMesh.position.set(br.x, br.y, br.z);
    bMesh.rotation.set(br.rx, 0, br.rz);
    g.add(bMesh);
    attachComicInkOutline(bMesh, g, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  }

  // 4. 7 Multi-Layered Organic Leaf Cloud Clusters + Sunlit Toon Highlight Caps
  const clusters = [
    {dx: 0, dy: 3.55, dz: 0, r: 1.15, sy: 0.8},
    {dx: -0.75, dy: 3.05, dz: 0.42, r: 0.86, sy: 0.76},
    {dx: 0.76, dy: 3.12, dz: -0.38, r: 0.88, sy: 0.78},
    {dx: 0.42, dy: 3.25, dz: 0.68, r: 0.78, sy: 0.75},
    {dx: -0.48, dy: 3.2, dz: -0.65, r: 0.8, sy: 0.75},
    {dx: 0.18, dy: 4.18, dz: 0.12, r: 0.76, sy: 0.74},
    {dx: -0.25, dy: 3.92, dz: -0.22, r: 0.72, sy: 0.72},
  ];
  clusters.forEach((c, idx) => {
    const cloudMat = idx % 2 === 0 ? matFoliageMain : matFoliageDeep;
    const cloud = new THREE.Mesh(leafCloudGeo, cloudMat);
    cloud.position.set(c.dx, c.dy, c.dz);
    cloud.scale.set(c.r, c.r * c.sy, c.r);
    cloud.castShadow = true;
    g.add(cloud);
    attachComicInkOutline(cloud, g, inkLineMat, inkHullMat, 0.032, 18, inkRegistry);

    if (idx < 4) {
      const cap = new THREE.Mesh(leafCloudGeo, matFoliageHi);
      cap.position.set(c.dx + 0.08, c.dy + c.r * 0.34, c.dz + 0.08);
      cap.scale.set(c.r * 0.68, c.r * 0.38, c.r * 0.68);
      g.add(cap);
    }
  });

  // 5. Fallen Blossom / Leaf Petals around the Iron Tree Grate
  for (let p = 0; p < 6; p++) {
    const pa = (p * Math.PI) / 3 + 0.2;
    const pr = 0.32 + (p % 2) * 0.18;
    const petal = new THREE.Mesh(petalGeo, matFoliageHi);
    petal.position.set(Math.cos(pa) * pr, 0.045, Math.sin(pa) * pr);
    g.add(petal);
  }

  g.userData.inspectable = {
    id: `tree-variant-${variant}`,
    label: sp.name,
    category: 'Detailed Multi-Branch Urban Tree',
  };

  return g;
}

/**
 * 5B. BUILD CANTILEVERED TRAFFIC SIGNAL POLE (`PRP-TRAFFIC-LIGHT`) & STREET SIGNPOST (`PRP-SIGNPOST`)
 */
export function buildTrafficSignalPole(params: {
  grad3: THREE.DataTexture;
  inkLineMat: THREE.LineBasicMaterial;
  inkHullMat: THREE.MeshBasicMaterial;
  inkRegistry: THREE.Object3D[];
  disposableGeometries: THREE.BufferGeometry[];
  disposableMaterials: THREE.Material[];
}): THREE.Group {
  const {grad3, inkLineMat, inkHullMat, inkRegistry, disposableGeometries, disposableMaterials} =
    params;

  const g = new THREE.Group();
  const matPole = new THREE.MeshToonMaterial({color: '#1E293B', gradientMap: grad3});
  const matHousing = new THREE.MeshToonMaterial({color: '#FACC15', gradientMap: grad3});
  const matRed = new THREE.MeshBasicMaterial({color: '#EF4444'});
  const matAmber = new THREE.MeshBasicMaterial({color: '#F59E0B'});
  const matGreen = new THREE.MeshBasicMaterial({color: '#10B981'});
  disposableMaterials.push(matPole, matHousing, matRed, matAmber, matGreen);

  const postGeo = new THREE.CylinderGeometry(0.11, 0.14, 5.4, 8);
  postGeo.translate(0, 2.7, 0);
  const mastArmGeo = new THREE.CylinderGeometry(0.07, 0.09, 3.8, 8);
  mastArmGeo.rotateZ(Math.PI / 2);
  mastArmGeo.translate(1.85, 5.1, 0);
  const headGeo = new THREE.BoxGeometry(0.42, 1.15, 0.36);
  headGeo.translate(3.2, 4.75, 0);
  const lensGeo = new THREE.SphereGeometry(0.11, 8, 8);
  disposableGeometries.push(postGeo, mastArmGeo, headGeo, lensGeo);

  const post = new THREE.Mesh(postGeo, matPole);
  const mastArm = new THREE.Mesh(mastArmGeo, matPole);
  const head = new THREE.Mesh(headGeo, matHousing);
  const lRed = new THREE.Mesh(lensGeo, matRed);
  lRed.position.set(3.2, 5.08, 0.18);
  const lAmb = new THREE.Mesh(lensGeo, matAmber);
  lAmb.position.set(3.2, 4.75, 0.18);
  const lGrn = new THREE.Mesh(lensGeo, matGreen);
  lGrn.position.set(3.2, 4.42, 0.18);

  g.add(post, mastArm, head, lRed, lAmb, lGrn);
  attachComicInkOutline(post, g, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  attachComicInkOutline(mastArm, g, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  attachComicInkOutline(head, g, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  return g;
}

export function buildStreetSignpost(params: {
  grad3: THREE.DataTexture;
  inkLineMat: THREE.LineBasicMaterial;
  inkHullMat: THREE.MeshBasicMaterial;
  inkRegistry: THREE.Object3D[];
  disposableGeometries: THREE.BufferGeometry[];
  disposableMaterials: THREE.Material[];
}): THREE.Group {
  const {grad3, inkLineMat, inkHullMat, inkRegistry, disposableGeometries, disposableMaterials} =
    params;

  const g = new THREE.Group();
  const matPole = new THREE.MeshToonMaterial({color: '#334155', gradientMap: grad3});
  const matGreenPlate = new THREE.MeshToonMaterial({color: '#047857', gradientMap: grad3});
  const matStopOct = new THREE.MeshToonMaterial({color: '#DC2626', gradientMap: grad3});
  disposableMaterials.push(matPole, matGreenPlate, matStopOct);

  const postGeo = new THREE.CylinderGeometry(0.05, 0.06, 3.1, 8);
  postGeo.translate(0, 1.55, 0);
  const plateAGeo = new THREE.BoxGeometry(0.95, 0.22, 0.05);
  plateAGeo.translate(0, 2.95, 0);
  const plateBGeo = new THREE.BoxGeometry(0.05, 0.22, 0.95);
  plateBGeo.translate(0, 2.7, 0);
  const stopGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.05, 8);
  stopGeo.rotateX(Math.PI / 2);
  stopGeo.translate(0, 2.15, 0.06);
  disposableGeometries.push(postGeo, plateAGeo, plateBGeo, stopGeo);

  const post = new THREE.Mesh(postGeo, matPole);
  const plateA = new THREE.Mesh(plateAGeo, matGreenPlate);
  const plateB = new THREE.Mesh(plateBGeo, matGreenPlate);
  const stop = new THREE.Mesh(stopGeo, matStopOct);
  g.add(post, plateA, plateB, stop);
  attachComicInkOutline(post, g, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  attachComicInkOutline(plateA, g, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  attachComicInkOutline(stop, g, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
  return g;
}

/**
 * 5C. BUILD DETAILED URBAN ALLEYWAY WITH HUGE INDUSTRIAL STEEL ROLL-OFF DUMPSTERS,
 * OVERFLOWING TRASH BAGS, CARDBOARD BOXES, OVERHEAD SHADE TARP, LAUNDRY LINES & FIRE-ESCAPE LADDER
 */
export function buildDetailedAlleyway(params: {
  alley: AlleySpec;
  grad3: THREE.DataTexture;
  grad4: THREE.DataTexture;
  inkLineMat: THREE.LineBasicMaterial;
  inkHullMat: THREE.MeshBasicMaterial;
  inkRegistry: THREE.Object3D[];
  disposableGeometries: THREE.BufferGeometry[];
  disposableMaterials: THREE.Material[];
}): THREE.Group {
  const {
    alley,
    grad3,
    grad4,
    inkLineMat,
    inkHullMat,
    inkRegistry,
    disposableGeometries,
    disposableMaterials,
  } = params;

  const g = new THREE.Group();
  g.name = alley.id;

  const sideSign = alley.side === 'west' ? -1 : 1;
  const alleyCenterX = sideSign * (11.2 + alley.depthX * 0.5);

  const matAlleyPave = new THREE.MeshToonMaterial({color: '#2A3042', gradientMap: grad3});
  const matDumpster = new THREE.MeshToonMaterial({color: alley.dumpsterColorHex, gradientMap: grad4});
  const matLid = new THREE.MeshToonMaterial({color: '#1E293B', gradientMap: grad4});
  const matTrashBag = new THREE.MeshToonMaterial({color: '#111827', gradientMap: grad3});
  const matCardboard = new THREE.MeshToonMaterial({color: '#B45309', gradientMap: grad3});
  const matTarp = new THREE.MeshToonMaterial({color: alley.tarpColorHex, gradientMap: grad3});
  const matIron = new THREE.MeshToonMaterial({color: '#1E293B', gradientMap: grad4});
  const matGraffiti = new THREE.MeshBasicMaterial({color: '#F43F5E'});
  disposableMaterials.push(
    matAlleyPave,
    matDumpster,
    matLid,
    matTrashBag,
    matCardboard,
    matTarp,
    matIron,
    matGraffiti,
  );

  // 1. Recessed Alley Pavement Apron
  const paveGeo = new THREE.BoxGeometry(alley.depthX, 0.24, alley.widthZ);
  paveGeo.translate(alleyCenterX, 0.12, alley.centerZ);
  disposableGeometries.push(paveGeo);
  const paveMesh = new THREE.Mesh(paveGeo, matAlleyPave);
  g.add(paveMesh);

  // 2. HUGE Industrial Steel Roll-Off Dumpsters (1.9m × 1.35m × 1.25m) with vertical reinforcement ribs & flip lids
  const dumpBodyGeo = new THREE.BoxGeometry(1.9, 1.32, 1.22);
  dumpBodyGeo.translate(0, 0.66, 0);
  const dumpRimGeo = new THREE.BoxGeometry(2.02, 0.1, 1.32);
  dumpRimGeo.translate(0, 1.34, 0);
  const dumpLidClosedGeo = new THREE.BoxGeometry(0.94, 0.08, 1.28);
  const dumpRibGeo = new THREE.BoxGeometry(0.08, 1.18, 1.28);
  const bagGeo = new THREE.DodecahedronGeometry(0.32, 0);
  const boxCartonGeo = new THREE.BoxGeometry(0.58, 0.44, 0.48);

  disposableGeometries.push(
    dumpBodyGeo,
    dumpRimGeo,
    dumpLidClosedGeo,
    dumpRibGeo,
    bagGeo,
    boxCartonGeo,
  );

  for (let dIdx = 0; dIdx < alley.dumpsterCount; dIdx++) {
    const dumpGroup = new THREE.Group();
    const body = new THREE.Mesh(dumpBodyGeo, matDumpster);
    body.castShadow = true;
    const rim = new THREE.Mesh(dumpRimGeo, matLid);
    const closedLid = new THREE.Mesh(dumpLidClosedGeo, matLid);
    closedLid.position.set(-0.46, 1.42, 0);
    const openLid = new THREE.Mesh(dumpLidClosedGeo, matLid);
    openLid.position.set(0.46, 1.62, -0.35);
    openLid.rotation.x = -0.65;
    dumpGroup.add(body, rim, closedLid, openLid);

    attachComicInkOutline(body, dumpGroup, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
    attachComicInkOutline(rim, dumpGroup, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
    attachComicInkOutline(closedLid, dumpGroup, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
    attachComicInkOutline(openLid, dumpGroup, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);

    // Vertical structural steel ribs on the huge dumpster
    for (const rx of [-0.62, 0, 0.62]) {
      const rib = new THREE.Mesh(dumpRibGeo, matDumpster);
      rib.position.set(rx, 0.66, 0);
      dumpGroup.add(rib);
    }

    // Overflowing trash bags inside and piled next to the huge dumpster + tied knot necks, cardboard stacks, wooden pallets, oil drums & milk crates
    const bagKnotGeo = new THREE.ConeGeometry(0.09, 0.14, 6);
    const palletBoardGeo = new THREE.BoxGeometry(1.1, 0.12, 0.9);
    const drumCylGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.86, 10);
    const crateBoxGeo = new THREE.BoxGeometry(0.38, 0.34, 0.38);
    disposableGeometries.push(bagKnotGeo, palletBoardGeo, drumCylGeo, crateBoxGeo);

    const topBag = new THREE.Mesh(bagGeo, matTrashBag);
    topBag.position.set(0.45, 1.42, 0.1);
    const groundBag1 = new THREE.Mesh(bagGeo, matTrashBag);
    groundBag1.position.set(1.18, 0.26, 0.35);
    const knot1 = new THREE.Mesh(bagKnotGeo, matGraffiti);
    knot1.position.set(1.18, 0.56, 0.35);
    const groundBag2 = new THREE.Mesh(bagGeo, matTrashBag);
    groundBag2.position.set(1.12, 0.22, -0.25);
    const groundBag3 = new THREE.Mesh(bagGeo, matTrashBag);
    groundBag3.position.set(1.48, 0.2, 0.05);
    groundBag3.scale.set(0.9, 0.78, 0.95);
    const groundBag4 = new THREE.Mesh(bagGeo, matTrashBag);
    groundBag4.position.set(-1.35, 0.24, -0.32);

    const carton = new THREE.Mesh(boxCartonGeo, matCardboard);
    carton.position.set(-1.22, 0.22, 0.28);
    carton.rotation.y = 0.28;
    const cartonTop = new THREE.Mesh(boxCartonGeo, matCardboard);
    cartonTop.scale.set(0.78, 0.75, 0.8);
    cartonTop.position.set(-1.2, 0.58, 0.26);
    cartonTop.rotation.y = -0.18;

    const pallet = new THREE.Mesh(palletBoardGeo, matCardboard);
    pallet.position.set(-0.2, 0.06, 0.95);
    pallet.rotation.y = 0.12;

    const oilDrum = new THREE.Mesh(drumCylGeo, matTarp);
    oilDrum.position.set(1.55, 0.43, -0.52);

    const milkCrate = new THREE.Mesh(crateBoxGeo, matGraffiti);
    milkCrate.position.set(-1.55, 0.17, 0.52);

    dumpGroup.add(
      topBag,
      groundBag1,
      knot1,
      groundBag2,
      groundBag3,
      groundBag4,
      carton,
      cartonTop,
      pallet,
      oilDrum,
      milkCrate,
    );
    attachComicInkOutline(topBag, dumpGroup, inkLineMat, inkHullMat, 0.04, 12, inkRegistry);
    attachComicInkOutline(groundBag1, dumpGroup, inkLineMat, inkHullMat, 0.04, 12, inkRegistry);
    attachComicInkOutline(groundBag2, dumpGroup, inkLineMat, inkHullMat, 0.04, 12, inkRegistry);
    attachComicInkOutline(groundBag3, dumpGroup, inkLineMat, inkHullMat, 0.04, 12, inkRegistry);
    attachComicInkOutline(carton, dumpGroup, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
    attachComicInkOutline(cartonTop, dumpGroup, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
    attachComicInkOutline(pallet, dumpGroup, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);
    attachComicInkOutline(oilDrum, dumpGroup, inkLineMat, inkHullMat, 0.04, 15, inkRegistry);
    attachComicInkOutline(milkCrate, dumpGroup, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);

    dumpGroup.userData.inspectable = {
      id: `${alley.id}-dumpster-${dIdx}`,
      label: `Alley Dumpster, Tied Garbage Bags, Cardboard & Crates (${alley.graffitiText})`,
      category: 'Urban Alleyway & Clutter',
    };

    const dxOffset = sideSign * (12.8 + dIdx * 3.1);
    const dzOffset = alley.centerZ + (dIdx % 2 === 0 ? -0.45 : 0.45);
    dumpGroup.position.set(dxOffset, 0.24, dzOffset);
    dumpGroup.rotation.y = sideSign > 0 ? 0.15 : Math.PI - 0.15;
    g.add(dumpGroup);
  }
  g.userData.inspectable = {
    id: alley.id,
    label: `Detailed Alleyway (${alley.side.toUpperCase()} Z=${alley.centerZ}m • "${alley.graffitiText}")`,
    category: 'Urban Alleyway & Clutter',
  };

  // 3. Overhead Alley Shade Netting / Tarp Canopy
  if (alley.hasOverheadTarp) {
    const tarpGeo = new THREE.BoxGeometry(5.5, 0.08, alley.widthZ - 0.2);
    tarpGeo.translate(sideSign * 14.2, 6.2, alley.centerZ);
    disposableGeometries.push(tarpGeo);
    const tarpMesh = new THREE.Mesh(tarpGeo, matTarp);
    tarpMesh.rotation.z = sideSign * 0.08;
    g.add(tarpMesh);
    attachComicInkOutline(tarpMesh, g, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
  }

  // Note: Building-to-building overhead wires/lines are intentionally omitted so 100% of overhead cables
  // are connected strictly pole-to-pole along the street utility poles!

  // 5. Steel Fire-Escape Ladder & Landing inside Alleyway
  if (alley.hasFireEscape) {
    const railGeo = new THREE.CylinderGeometry(0.04, 0.04, 8.5, 6);
    railGeo.translate(sideSign * 12.2, 5.2, alley.centerZ - alley.widthZ * 0.38);
    const platGeo = new THREE.BoxGeometry(1.4, 0.12, 0.9);
    platGeo.translate(sideSign * 12.2, 5.8, alley.centerZ - alley.widthZ * 0.35);
    disposableGeometries.push(railGeo, platGeo);
    const rail = new THREE.Mesh(railGeo, matIron);
    const plat = new THREE.Mesh(platGeo, matIron);
    g.add(rail, plat);
    attachComicInkOutline(plat, g, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);
  }

  return g;
}

/**
 * 6. BUILD COMPLETE SURROUNDING CITY, CROSS-STREETS, ALLEYS, HUGE DUMPSTERS,
 * 30+ SHOPS, BALCONIES, BILLBOARDS, FOOTPATHS, MARKED ROADS & 360° MOUNTAIN RANGE
 */
export function buildSurroundingCityAndMountains(params: {
  palette: StylePalette;
  grad3: THREE.DataTexture;
  grad4: THREE.DataTexture;
  inkLineMat: THREE.LineBasicMaterial;
  inkHullMat: THREE.MeshBasicMaterial;
  inkRegistry: THREE.Object3D[];
  disposableGeometries: THREE.BufferGeometry[];
  disposableMaterials: THREE.Material[];
  disposableTextures: THREE.Texture[];
}): {
  heroBlocksGroup: THREE.Group;
  sidewalkPropsGroup: THREE.Group;
  cityAndMountainsGroup: THREE.Group;
} {
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

  const heroBlocksGroup = new THREE.Group();
  heroBlocksGroup.name = 'hero-block-buildings';

  storeSignTexCache.clear();
  verticalBannerTexCache.clear();

  const sidewalkPropsGroup = new THREE.Group();
  sidewalkPropsGroup.name = 'hero-sidewalk-props';

  const cityAndMountainsGroup = new THREE.Group();
  cityAndMountainsGroup.name = 'extended-city-and-mountains';

  // A. Build all 6 Hero Block Storefronts + Multi-Story Upper Apartments, Micro-Detailed Balconies, Banners & Rooftop Billboards
  for (const shopSpec of HERO_BLOCK_SHOPS) {
    const bld = buildHeroBuildingWithBalconies({
      spec: shopSpec,
      palette,
      grad3,
      grad4,
      inkLineMat,
      inkHullMat,
      inkRegistry,
      disposableGeometries,
      disposableMaterials,
      disposableTextures,
    });
    if (shopSpec.side === 'west') {
      bld.position.set(-11.2, 0, shopSpec.centerZ);
      bld.rotation.y = Math.PI / 2;
    } else {
      bld.position.set(11.2, 0, shopSpec.centerZ);
      bld.rotation.y = -Math.PI / 2;
    }
    heroBlocksGroup.add(bld);
  }

  // B. Helper to instantiate any Sidewalk Prop (Hero Block + Full Extended City)
  const instantiateSidewalkProp = (prop: {
    type: string;
    x: number;
    y: number;
    z: number;
    rotationY: number;
    variant: number;
  }): THREE.Group => {
    let obj: THREE.Group;
    if (prop.type === 'street-lamp') {
      obj = buildStreetLampAsset({
        palette,
        grad3,
        grad4,
        inkLineMat,
        inkHullMat,
        inkRegistry,
        disposableGeometries,
        disposableMaterials,
      });
    } else if (prop.type === 'fire-hydrant') {
      obj = buildAmericanFireHydrant({
        grad3,
        grad4,
        inkLineMat,
        inkHullMat,
        inkRegistry,
        disposableGeometries,
        disposableMaterials,
      });
    } else if (prop.type === 'dustbin') {
      obj = buildMunicipalDustbin({
        grad3,
        grad4,
        inkLineMat,
        inkHullMat,
        inkRegistry,
        disposableGeometries,
        disposableMaterials,
      });
    } else if (prop.type === 'bench') {
      obj = buildParkBench({
        grad3,
        grad4,
        inkLineMat,
        inkHullMat,
        inkRegistry,
        disposableGeometries,
        disposableMaterials,
      });
    } else if (prop.type === 'mailbox') {
      obj = buildAmericanMailbox({
        grad3,
        inkLineMat,
        inkHullMat,
        inkRegistry,
        disposableGeometries,
        disposableMaterials,
      });
    } else if (prop.type === 'traffic-light') {
      obj = buildTrafficSignalPole({
        grad3,
        inkLineMat,
        inkHullMat,
        inkRegistry,
        disposableGeometries,
        disposableMaterials,
      });
    } else if (prop.type === 'signpost') {
      obj = buildStreetSignpost({
        grad3,
        inkLineMat,
        inkHullMat,
        inkRegistry,
        disposableGeometries,
        disposableMaterials,
      });
    } else {
      obj = buildStreetTreeInGrate({
        variant: prop.variant,
        grad3,
        inkLineMat,
        inkHullMat,
        inkRegistry,
        disposableGeometries,
        disposableMaterials,
      });
    }
    obj.position.set(prop.x, prop.y - 0.52, prop.z);
    obj.rotation.y = prop.rotationY;
    if (!obj.userData.inspectable) {
      const labelMap: Record<string, string> = {
        'street-lamp': 'Vintage Double-Lantern Street Lamp',
        'fire-hydrant': 'American Cast-Iron Fire Hydrant',
        dustbin: 'Ribbed Steel Municipal Dustbin & Trash Bags',
        bench: 'Hardwood Slat Sidewalk Park Bench',
        mailbox: 'USPS Blue Arched Street Mailbox',
        'traffic-light': 'Cantilevered Intersection Traffic Signal',
        signpost: 'Cross-Street Wayfinding Signpost & Stop Octagon',
        tree: 'Detailed Multi-Branch Street Tree in Grate',
      };
      obj.userData.inspectable = {
        id: `${prop.type}-${prop.x.toFixed(1)}-${prop.z.toFixed(1)}`,
        label: `${labelMap[prop.type] || prop.type} (X=${prop.x.toFixed(1)}m, Z=${prop.z.toFixed(1)}m)`,
        category: 'Street Furniture & Foliage',
      };
    }
    return obj;
  };

  for (const prop of HERO_SIDEWALK_PROPS) {
    sidewalkPropsGroup.add(instantiateSidewalkProp(prop));
  }

  // Build Full-City Street Furniture across North/South Avenue & East-West Cross-Streets
  const extendedCityProps = generateExtendedCityProps();
  for (const prop of extendedCityProps) {
    cityAndMountainsGroup.add(instantiateSidewalkProp(prop));
  }

  // B2. Build All 22 Detailed Alleys with Huge Industrial Roll-Off Dumpsters across West & East City Blocks
  const cityAlleys = generateCityAlleys();
  for (const alley of cityAlleys) {
    const alleyGroup = buildDetailedAlleyway({
      alley,
      grad3,
      grad4,
      inkLineMat,
      inkHullMat,
      inkRegistry,
      disposableGeometries,
      disposableMaterials,
    });
    cityAndMountainsGroup.add(alleyGroup);
  }

  // C. BUILD STREET-SIDE UTILITY POLES (WITH CROSSARMS, INSULATORS & TRANSFORMERS) +
  // STRICT POLE-TO-POLE OVERHEAD CATENARY CABLES ACROSS THE CITY!
  const {poles: utilityPoles, cables: utilityCables} = generateUtilityPolesAndCables();
  const poleMap = new Map<string, UtilityPoleSpec>();
  for (const p of utilityPoles) {
    poleMap.set(p.id, p);
  }

  const matPoleTimber = new THREE.MeshToonMaterial({color: '#4A3222', gradientMap: grad3});
  const matPoleCrossarm = new THREE.MeshToonMaterial({color: '#6B4423', gradientMap: grad3});
  const matPoleSteel = new THREE.MeshToonMaterial({color: '#334155', gradientMap: grad4});
  const matInsulator = new THREE.MeshToonMaterial({color: '#38BDF8', gradientMap: grad4});
  const matTransformer = new THREE.MeshToonMaterial({color: '#64748B', gradientMap: grad4});
  disposableMaterials.push(
    matPoleTimber,
    matPoleCrossarm,
    matPoleSteel,
    matInsulator,
    matTransformer,
  );

  const uPoleShaftGeo = new THREE.CylinderGeometry(0.1, 0.16, 7.8, 10);
  uPoleShaftGeo.translate(0, 3.9, 0);
  const uPoleBaseBootGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.65, 10);
  uPoleBaseBootGeo.translate(0, 0.325, 0);
  const uCrossarmGeo = new THREE.BoxGeometry(1.88, 0.12, 0.12);
  const uBraceGeo = new THREE.BoxGeometry(0.65, 0.04, 0.04);
  const uInsulatorGeo = new THREE.CylinderGeometry(0.045, 0.065, 0.18, 8);
  const uTransCanGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.92, 12);
  const uBushingGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.24, 6);
  disposableGeometries.push(
    uPoleShaftGeo,
    uPoleBaseBootGeo,
    uCrossarmGeo,
    uBraceGeo,
    uInsulatorGeo,
    uTransCanGeo,
    uBushingGeo,
  );

  for (const pole of utilityPoles) {
    const pGroup = new THREE.Group();
    pGroup.name = pole.id;
    pGroup.position.set(pole.x, pole.y - 0.52, pole.z);
    pGroup.rotation.y = pole.rotationY;

    const shaft = new THREE.Mesh(uPoleShaftGeo, matPoleTimber);
    shaft.castShadow = true;
    const boot = new THREE.Mesh(uPoleBaseBootGeo, matPoleSteel);
    pGroup.add(shaft, boot);
    attachComicInkOutline(shaft, pGroup, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);
    attachComicInkOutline(boot, pGroup, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);

    for (const armY of [pole.lowerCrossarmY, pole.upperCrossarmY]) {
      const arm = new THREE.Mesh(uCrossarmGeo, matPoleCrossarm);
      arm.position.set(0, armY, 0);
      pGroup.add(arm);
      attachComicInkOutline(arm, pGroup, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);

      for (const bSide of [-1, 1]) {
        const brace = new THREE.Mesh(uBraceGeo, matPoleSteel);
        brace.position.set(bSide * 0.32, armY - 0.24, 0);
        brace.rotation.z = bSide * 0.65;
        pGroup.add(brace);
      }

      for (const ix of [-0.62, 0, 0.62]) {
        const ins = new THREE.Mesh(uInsulatorGeo, matInsulator);
        ins.position.set(ix, armY + 0.14, 0);
        pGroup.add(ins);
        attachComicInkOutline(ins, pGroup, inkLineMat, undefined, 0, 15, inkRegistry);
      }
    }

    if (pole.hasTransformerCan) {
      const can = new THREE.Mesh(uTransCanGeo, matTransformer);
      can.position.set(0, 5.15, 0.32);
      const bushL = new THREE.Mesh(uBushingGeo, matInsulator);
      bushL.position.set(-0.1, 5.72, 0.32);
      const bushR = new THREE.Mesh(uBushingGeo, matInsulator);
      bushR.position.set(0.1, 5.72, 0.32);
      pGroup.add(can, bushL, bushR);
      attachComicInkOutline(can, pGroup, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);
    }

    pGroup.userData.inspectable = {
      id: pole.id,
      label: `Utility Power/Telecom Pole & Insulator Crossarms (${pole.corridorId})`,
      category: 'Pole-to-Pole Overhead Utility Grid',
    };
    cityAndMountainsGroup.add(pGroup);
  }

  // String Pole-to-Pole Catenary Power & Telecom Cables directly between Utility Pole Insulator Tips
  for (const span of utilityCables) {
    const pFrom = poleMap.get(span.fromPoleId);
    const pTo = poleMap.get(span.toPoleId);
    if (!pFrom || !pTo) continue;

    const armYFrom = span.startPos[1] + 0.18;
    const armYTo = span.endPos[1] + 0.18;

    for (const latOffset of span.wireLateralOffsets) {
      const sx = pFrom.x + Math.cos(pFrom.rotationY) * latOffset;
      const sz = pFrom.z - Math.sin(pFrom.rotationY) * latOffset;
      const ex = pTo.x + Math.cos(pTo.rotationY) * latOffset;
      const ez = pTo.z - Math.sin(pTo.rotationY) * latOffset;
      const mx = (sx + ex) * 0.5;
      const mz = (sz + ez) * 0.5;
      const my = Math.min(armYFrom, armYTo) - span.sagMeters;

      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(sx, armYFrom, sz),
        new THREE.Vector3(mx, my, mz),
        new THREE.Vector3(ex, armYTo, ez),
      );
      const cableGeo = new THREE.TubeGeometry(curve, 14, 0.026, 5, false);
      disposableGeometries.push(cableGeo);
      const cableMesh = new THREE.Mesh(cableGeo, inkHullMat);
      cityAndMountainsGroup.add(cableMesh);
      inkRegistry.push(cableMesh);
    }
  }

  // D. FULL INTERCONNECTED 2D CITY MAP ROAD NETWORK WITH SEAMLESS STRETCHED ROAD & FOOTPATH TEXTURES,
  // WAFFLE MANHOLE COVERS, SIDEWALK SHRUB PLANTERS, AND NON-OVERLAPPING 4-WAY INTERSECTIONS!
  const asphaltTexNS = createCityAsphaltTexture(palette, 'north-south', 1, 10);
  const asphaltTexEW = createCityAsphaltTexture(palette, 'east-west', 10, 1);
  const asphaltTexIntersection = createCityAsphaltTexture(palette, 'intersection', 1, 1);
  const footpathTexNS = createCityFootpathTexture(palette, 'north-south', 1, 14);
  const footpathTexEW = createCityFootpathTexture(palette, 'east-west', 14, 1);
  const footpathTexCorner = createCityFootpathTexture(palette, 'corner', 1, 1);
  const manholeWaffleTex = createManholeWaffleTexture(palette);

  disposableTextures.push(
    asphaltTexNS,
    asphaltTexEW,
    asphaltTexIntersection,
    footpathTexNS,
    footpathTexEW,
    footpathTexCorner,
    manholeWaffleTex,
  );

  const matValleyGround = new THREE.MeshToonMaterial({
    color: '#435B4E',
    gradientMap: grad3,
  });
  const matCityPave = new THREE.MeshToonMaterial({
    color: '#576075',
    gradientMap: grad3,
  });
  const matAsphaltNS = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: asphaltTexNS,
    gradientMap: grad3,
  });
  const matAsphaltEW = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: asphaltTexEW,
    gradientMap: grad3,
  });
  const matAsphaltIntersection = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: asphaltTexIntersection,
    gradientMap: grad3,
  });
  const matSidewalkNS = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: footpathTexNS,
    gradientMap: grad3,
  });
  const matSidewalkEW = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: footpathTexEW,
    gradientMap: grad3,
  });
  const matSidewalkCorner = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: footpathTexCorner,
    gradientMap: grad3,
  });
  const matCurbStone = new THREE.MeshToonMaterial({
    color: palette.curbStone,
    gradientMap: grad3,
  });
  const matRoadYellow = new THREE.MeshToonMaterial({
    color: palette.laneMarkingYellow,
    gradientMap: grad3,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const matRoadWhite = new THREE.MeshToonMaterial({
    color: palette.laneMarkingWhite,
    gradientMap: grad3,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const matMedianGrass = new THREE.MeshToonMaterial({
    color: '#15803D',
    gradientMap: grad3,
  });
  const matIronCover = new THREE.MeshToonMaterial({
    color: palette.drainIron,
    gradientMap: grad4,
  });
  const matManholeWaffle = new THREE.MeshToonMaterial({
    color: 0xffffff,
    map: manholeWaffleTex,
    gradientMap: grad4,
  });

  disposableMaterials.push(
    matValleyGround,
    matCityPave,
    matAsphaltNS,
    matAsphaltEW,
    matAsphaltIntersection,
    matSidewalkNS,
    matSidewalkEW,
    matSidewalkCorner,
    matCurbStone,
    matRoadYellow,
    matRoadWhite,
    matMedianGrass,
    matIronCover,
    matManholeWaffle,
  );

  // 1600m × 1600m Valley Ground Plane at Y = -0.08m
  const valleyGeo = new THREE.PlaneGeometry(1600, 1600);
  valleyGeo.rotateX(-Math.PI / 2);
  valleyGeo.translate(0, -0.08, 0);
  // 640m × 640m Urban Block Pavement Apron at Y = -0.02m
  const urbanApronGeo = new THREE.PlaneGeometry(640, 640);
  urbanApronGeo.rotateX(-Math.PI / 2);
  urbanApronGeo.translate(0, -0.02, 0);
  cityAndMountainsGroup.add(
    new THREE.Mesh(valleyGeo, matValleyGround),
    new THREE.Mesh(urbanApronGeo, matCityPave),
  );

  // 1. NON-OVERLAPPING NORTH-SOUTH AVENUE SEGMENTS (X = -56m, 0m, +56m)
  // Segmented cleanly between the 4 East-West Cross-Streets (Z = -75, -24.5, +24.5, +75)
  // so no roadbed, curbstone, footpath, or yellow centerline ever cuts across a 4-way intersection!
  const nsIntervals: Array<[number, number]> = [
    [-210.0, -81.25], // North of 5th St N
    [-68.75, -30.75], // Between 5th St N and 2nd St N
    [-18.25, 18.25], // Center block (built for West/East Boulevards; Central Ave X=0 uses Hero Main Street)
    [30.75, 68.75], // Between 2nd St S and 5th St S
    [81.25, 210.0], // South of 5th St S
  ];

  for (const aveX of [-56, 0, 56]) {
    for (const [zStart, zEnd] of nsIntervals) {
      // Central Avenue center block [-18.25, 18.25] is occupied by the Hero Main Street Section 1 ground plane
      if (aveX === 0 && Math.abs(zStart + zEnd) < 1) continue;

      const segLen = zEnd - zStart;
      const segMidZ = (zStart + zEnd) * 0.5;
      // Footpaths & curbs stop 3.6m before the intersection edge so the 4-way corner sidewalk plazas meet cleanly
      const fpLen = Math.max(4, segLen - 7.2);

      const rGeo = new THREE.BoxGeometry(14.0, 0.28, segLen);
      const fpGeo = new THREE.BoxGeometry(4.2, 0.28, fpLen);
      const cbGeo = new THREE.BoxGeometry(0.45, 0.34, fpLen);
      const clGeo = new THREE.BoxGeometry(0.14, 0.03, Math.max(4, segLen - 4.0));
      disposableGeometries.push(rGeo, fpGeo, cbGeo, clGeo);

      const rMesh = new THREE.Mesh(rGeo, matAsphaltNS);
      rMesh.position.set(aveX, 0.14, segMidZ);
      rMesh.receiveShadow = true;
      cityAndMountainsGroup.add(rMesh);
      attachComicInkOutline(rMesh, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);

      for (const sideSign of [-1, 1]) {
        const fpMesh = new THREE.Mesh(fpGeo, matSidewalkNS);
        fpMesh.position.set(aveX + sideSign * 9.1, 0.14, segMidZ);
        fpMesh.receiveShadow = true;
        const cbMesh = new THREE.Mesh(cbGeo, matCurbStone);
        cbMesh.position.set(aveX + sideSign * 7.18, 0.17, segMidZ);
        cityAndMountainsGroup.add(fpMesh, cbMesh);
        attachComicInkOutline(fpMesh, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
        attachComicInkOutline(cbMesh, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
      }

      for (const cxOff of [-0.16, 0.16]) {
        const clMesh = new THREE.Mesh(clGeo, matRoadYellow);
        clMesh.position.set(aveX + cxOff, 0.295, segMidZ);
        cityAndMountainsGroup.add(clMesh);
      }
    }
  }

  // 2. NON-OVERLAPPING EAST-WEST CROSS-STREET SEGMENTS (Z = -75m, -24.5m, +24.5m, +75m)
  // Segmented cleanly between the 3 North-South Avenues (X = -56, 0, +56)
  const ewIntervals: Array<[number, number]> = [
    [-210.0, -63.0], // West of West Grand Blvd
    [-49.0, -7.0], // Between West Grand Blvd and Central Ave
    [7.0, 49.0], // Between Central Ave and East Grand Blvd
    [63.0, 210.0], // East of East Grand Blvd
  ];

  for (const cz of [-75, -24.5, 24.5, 75]) {
    for (const [xStart, xEnd] of ewIntervals) {
      const segLen = xEnd - xStart;
      const segMidX = (xStart + xEnd) * 0.5;
      const fpLen = Math.max(4, segLen - 8.4);

      const cRoadGeo = new THREE.BoxGeometry(segLen, 0.28, 12.5);
      const cFpGeo = new THREE.BoxGeometry(fpLen, 0.28, 3.6);
      const cCbGeo = new THREE.BoxGeometry(fpLen, 0.34, 0.44);
      const cClGeo = new THREE.BoxGeometry(Math.max(4, segLen - 4.0), 0.03, 0.14);
      disposableGeometries.push(cRoadGeo, cFpGeo, cCbGeo, cClGeo);

      const cRoad = new THREE.Mesh(cRoadGeo, matAsphaltEW);
      cRoad.position.set(segMidX, 0.14, cz);
      cRoad.receiveShadow = true;
      cityAndMountainsGroup.add(cRoad);
      attachComicInkOutline(cRoad, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);

      for (const zOff of [-0.16, 0.16]) {
        const cCl = new THREE.Mesh(cClGeo, matRoadYellow);
        cCl.position.set(segMidX, 0.295, cz + zOff);
        cityAndMountainsGroup.add(cCl);
      }

      for (const fpSign of [-1, 1]) {
        const cFp = new THREE.Mesh(cFpGeo, matSidewalkEW);
        cFp.position.set(segMidX, 0.14, cz + fpSign * 8.05);
        cFp.receiveShadow = true;
        const cCb = new THREE.Mesh(cCbGeo, matCurbStone);
        cCb.position.set(segMidX, 0.17, cz + fpSign * 6.42);
        cityAndMountainsGroup.add(cFp, cCb);
        attachComicInkOutline(cFp, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
        attachComicInkOutline(cCb, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
      }
    }
  }

  // 3. DASHED WHITE LANE LINES, WAFFLE MANHOLE COVERS & ROADSIDE STORM DRAINS ACROSS ALL AVENUES & CROSS-STREETS
  const dashGeo = new THREE.BoxGeometry(0.18, 0.03, 2.6);
  const dashEWGeo = new THREE.BoxGeometry(2.6, 0.03, 0.18);
  const manholeRimGeo = new THREE.CylinderGeometry(0.72, 0.76, 0.04, 20);
  const manholeLidGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.048, 20);
  const drainGeo = new THREE.BoxGeometry(0.54, 0.04, 1.05);
  const drainEWGeo = new THREE.BoxGeometry(1.05, 0.04, 0.54);
  const curbJointGeo = new THREE.BoxGeometry(0.52, 0.36, 0.08);
  disposableGeometries.push(
    valleyGeo,
    urbanApronGeo,
    dashGeo,
    dashEWGeo,
    manholeRimGeo,
    manholeLidGeo,
    drainGeo,
    drainEWGeo,
    curbJointGeo,
  );

  for (const aveX of [-56, 0, 56]) {
    for (let z = -192; z <= 186; z += 6.0) {
      if (aveX === 0 && Math.abs(z) < 21) continue;
      if (Math.abs(Math.abs(z) - 24.5) < 9.5 || Math.abs(Math.abs(z) - 75) < 9.5) continue;

      for (const lx of [-3.4, 3.4]) {
        const dash = new THREE.Mesh(dashGeo, matRoadWhite);
        dash.position.set(aveX + lx, 0.3, z);
        cityAndMountainsGroup.add(dash);
        attachComicInkOutline(dash, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
      }

      for (const sideSign of [-1, 1]) {
        const joint = new THREE.Mesh(curbJointGeo, inkHullMat);
        joint.position.set(aveX + sideSign * 7.18, 0.18, z);
        cityAndMountainsGroup.add(joint);
        inkRegistry.push(joint);
      }

      if (Math.abs(z % 12) < 3.1) {
        const mhX = aveX + (z > 0 ? 1.75 : -1.75);
        const mhRim = new THREE.Mesh(manholeRimGeo, matIronCover);
        mhRim.position.set(mhX, 0.3, z);
        const mhLid = new THREE.Mesh(manholeLidGeo, matManholeWaffle);
        mhLid.position.set(mhX, 0.3, z);
        mhLid.userData.inspectable = {
          id: `manhole-ave-${aveX}-${z}`,
          label: `Cast-Iron Waffle Manhole Cover & Storm Grates (X=${aveX}m, Z=${z}m)`,
          category: 'Street Utility & Drainage',
        };
        const drW = new THREE.Mesh(drainGeo, matIronCover);
        drW.position.set(aveX - 6.65, 0.3, z);
        const drE = new THREE.Mesh(drainGeo, matIronCover);
        drE.position.set(aveX + 6.65, 0.3, z);
        cityAndMountainsGroup.add(mhRim, mhLid, drW, drE);
        attachComicInkOutline(mhRim, cityAndMountainsGroup, inkLineMat, undefined, 0, 12, inkRegistry);
        attachComicInkOutline(drW, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
        attachComicInkOutline(drE, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
      }
    }
  }

  for (const cz of [-75, -24.5, 24.5, 75]) {
    for (let x = -180; x <= 180; x += 6.5) {
      if (Math.abs(x) < 10.5 || Math.abs(Math.abs(x) - 56) < 10.5) continue;
      for (const lz of [-3.1, 3.1]) {
        const dashEW = new THREE.Mesh(dashEWGeo, matRoadWhite);
        dashEW.position.set(x, 0.3, cz + lz);
        cityAndMountainsGroup.add(dashEW);
        attachComicInkOutline(dashEW, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
      }
      if (Math.abs(x % 13) < 3.5) {
        const mhRim = new THREE.Mesh(manholeRimGeo, matIronCover);
        mhRim.position.set(x, 0.3, cz + (x > 0 ? 1.55 : -1.55));
        const mhLid = new THREE.Mesh(manholeLidGeo, matManholeWaffle);
        mhLid.position.set(x, 0.3, cz + (x > 0 ? 1.55 : -1.55));
        const drN = new THREE.Mesh(drainEWGeo, matIronCover);
        drN.position.set(x, 0.3, cz - 5.85);
        const drS = new THREE.Mesh(drainEWGeo, matIronCover);
        drS.position.set(x, 0.3, cz + 5.85);
        cityAndMountainsGroup.add(mhRim, mhLid, drN, drS);
        attachComicInkOutline(mhRim, cityAndMountainsGroup, inkLineMat, undefined, 0, 12, inkRegistry);
        attachComicInkOutline(drN, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
        attachComicInkOutline(drS, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
      }
    }
  }

  // 4. Planted Center Median Islands with Concrete Curbs, Trimmed Shrubs & Reflective Bollards along the Avenue
  const medianCurbGeo = new THREE.BoxGeometry(1.15, 0.24, 11.0);
  const medianSoilGeo = new THREE.BoxGeometry(0.88, 0.28, 10.4);
  const medianBushGeo = new THREE.DodecahedronGeometry(0.42, 1);
  const bollardGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.72, 8);
  disposableGeometries.push(medianCurbGeo, medianSoilGeo, medianBushGeo, bollardGeo);

  for (const mz of [-145, -105, -50, 50, 105, 145]) {
    const mCurb = new THREE.Mesh(medianCurbGeo, matCurbStone);
    mCurb.position.set(0, 0.34, mz);
    const mSoil = new THREE.Mesh(medianSoilGeo, matMedianGrass);
    mSoil.position.set(0, 0.36, mz);
    cityAndMountainsGroup.add(mCurb, mSoil);
    attachComicInkOutline(mCurb, cityAndMountainsGroup, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);

    for (const bz of [-3.4, 0, 3.4]) {
      const bush = new THREE.Mesh(medianBushGeo, matMedianGrass);
      bush.position.set(0, 0.72, mz + bz);
      cityAndMountainsGroup.add(bush);
      attachComicInkOutline(bush, cityAndMountainsGroup, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);
    }
    for (const endSign of [-1, 1]) {
      const bol = new THREE.Mesh(bollardGeo, matRoadYellow);
      bol.position.set(0, 0.62, mz + endSign * 5.1);
      cityAndMountainsGroup.add(bol);
      attachComicInkOutline(bol, cityAndMountainsGroup, inkLineMat, inkHullMat, 0.035, 15, inkRegistry);
    }
  }

  // 5. LANDSCAPED SIDEWALK SHRUB & BLOSSOM PLANTERS ACROSS ALL AVENUES, BOULEVARDS & CROSS-STREETS
  const planterTroughGeo = new THREE.BoxGeometry(1.85, 0.46, 0.78);
  planterTroughGeo.translate(0, 0.23, 0);
  const planterSoilGeo = new THREE.BoxGeometry(1.68, 0.08, 0.62);
  planterSoilGeo.translate(0, 0.45, 0);
  const shrubClusterGeo = new THREE.DodecahedronGeometry(0.38, 1);
  const blossomBudGeo = new THREE.SphereGeometry(0.1, 6, 6);
  disposableGeometries.push(planterTroughGeo, planterSoilGeo, shrubClusterGeo, blossomBudGeo);

  const cityPlanters = generateCityShrubPlanters();
  for (const sp of cityPlanters) {
    const pGroup = new THREE.Group();
    const trough = new THREE.Mesh(planterTroughGeo, matCurbStone);
    const soil = new THREE.Mesh(planterSoilGeo, matMedianGrass);
    pGroup.add(trough, soil);
    attachComicInkOutline(trough, pGroup, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);

    const matBlossom = new THREE.MeshBasicMaterial({color: sp.flowerColorHex});
    disposableMaterials.push(matBlossom);

    for (const [bx, by, bz, bScale] of [
      [-0.52, 0.68, 0, 0.95],
      [0, 0.76, 0.04, 1.12],
      [0.52, 0.68, -0.03, 0.95],
    ] as const) {
      const shrub = new THREE.Mesh(shrubClusterGeo, matMedianGrass);
      shrub.position.set(bx, by, bz);
      shrub.scale.setScalar(bScale);
      const bud = new THREE.Mesh(blossomBudGeo, matBlossom);
      bud.position.set(bx, by + 0.32, bz + 0.12);
      pGroup.add(shrub, bud);
      attachComicInkOutline(shrub, pGroup, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
    }

    pGroup.position.set(sp.x, sp.y, sp.z);
    pGroup.rotation.y = sp.rotationY;
    pGroup.userData.inspectable = {
      id: sp.id,
      label: `Landscaped Sidewalk Shrub & Blossom Planter (${sp.id})`,
      category: 'Street Foliage & Shrubs',
    };
    cityAndMountainsGroup.add(pGroup);
  }

  // 6. BUILD ALL 12 4-WAY INTERSECTIONS WITH FLUSH NON-OVERLAPPING ASPHALT, 4 CORNER TEXTURED SIDEWALK PLAZAS,
  // L-SHAPED CORNER CURBS, CENTRAL WAFFLE MANHOLE COVERS, 4-WAY ZEBRA CROSSWALKS, STOP BARS & LEFT/RIGHT TURN ARROWS!
  const intersectionPadGeo = new THREE.BoxGeometry(14.0, 0.28, 12.5);
  const cornerPlazaGeo = new THREE.BoxGeometry(4.2, 0.28, 3.6);
  const cornerCurbNSGeo = new THREE.BoxGeometry(0.45, 0.34, 3.8);
  const cornerCurbEWGeo = new THREE.BoxGeometry(4.4, 0.34, 0.44);
  const zebraStripeNSGeo = new THREE.BoxGeometry(0.68, 0.035, 2.8);
  const zebraStripeEWGeo = new THREE.BoxGeometry(2.8, 0.035, 0.68);
  const stopBarNSGeo = new THREE.BoxGeometry(6.1, 0.035, 0.44);
  const stopBarEWGeo = new THREE.BoxGeometry(0.44, 0.035, 5.5);
  const tactilePadGeo = new THREE.BoxGeometry(2.2, 0.04, 2.2);
  const turnArrowStemGeo = new THREE.BoxGeometry(0.24, 0.035, 1.45);
  const turnArrowHookGeo = new THREE.BoxGeometry(0.75, 0.035, 0.24);
  const turnArrowHeadGeo = new THREE.ConeGeometry(0.32, 0.55, 3);
  turnArrowHeadGeo.rotateX(Math.PI / 2);

  disposableGeometries.push(
    intersectionPadGeo,
    cornerPlazaGeo,
    cornerCurbNSGeo,
    cornerCurbEWGeo,
    zebraStripeNSGeo,
    zebraStripeEWGeo,
    stopBarNSGeo,
    stopBarEWGeo,
    tactilePadGeo,
    turnArrowStemGeo,
    turnArrowHookGeo,
    turnArrowHeadGeo,
  );

  const {intersections} = generateCityRoadNetwork();
  for (const inter of intersections) {
    const ix = inter.x;
    const iz = inter.z;

    // Flush 14.0m × 12.5m Multi-Road Intersection Asphalt Pad (zero overlap with adjacent road segments!)
    const iPad = new THREE.Mesh(intersectionPadGeo, matAsphaltIntersection);
    iPad.position.set(ix, 0.14, iz);
    iPad.receiveShadow = true;
    iPad.userData.inspectable = {
      id: inter.id,
      label: `${inter.name} (Left & Right Turns + 4-Way Crosswalks + Waffle Manhole)`,
      category: 'City Road Intersection',
    };
    cityAndMountainsGroup.add(iPad);
    attachComicInkOutline(iPad, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);

    // Central Intersection Cast-Iron Waffle Manhole Cover + 2 Offset Utility Lids
    for (const [mxOff, mzOff] of [
      [0, 0],
      [-2.8, -2.2],
      [2.8, 2.2],
    ] as const) {
      const cRim = new THREE.Mesh(manholeRimGeo, matIronCover);
      cRim.position.set(ix + mxOff, 0.3, iz + mzOff);
      const cLid = new THREE.Mesh(manholeLidGeo, matManholeWaffle);
      cLid.position.set(ix + mxOff, 0.3, iz + mzOff);
      cityAndMountainsGroup.add(cRim, cLid);
      attachComicInkOutline(cRim, cityAndMountainsGroup, inkLineMat, undefined, 0, 12, inkRegistry);
    }

    // 4 Corner Textured Sidewalk Plazas + L-Shaped Granite Curbs + Yellow Tactile Warning Blister Pads
    for (const sideX of [-1, 1]) {
      for (const sideZ of [-1, 1]) {
        const cPlaza = new THREE.Mesh(cornerPlazaGeo, matSidewalkCorner);
        cPlaza.position.set(ix + sideX * 9.1, 0.14, iz + sideZ * 8.05);
        cPlaza.receiveShadow = true;

        const cCurbNS = new THREE.Mesh(cornerCurbNSGeo, matCurbStone);
        cCurbNS.position.set(ix + sideX * 7.18, 0.17, iz + sideZ * 8.05);

        const cCurbEW = new THREE.Mesh(cornerCurbEWGeo, matCurbStone);
        cCurbEW.position.set(ix + sideX * 9.1, 0.17, iz + sideZ * 6.42);

        const tac = new THREE.Mesh(tactilePadGeo, matRoadYellow);
        tac.position.set(ix + sideX * 8.35, 0.3, iz + sideZ * 7.45);

        cityAndMountainsGroup.add(cPlaza, cCurbNS, cCurbEW, tac);
        attachComicInkOutline(cPlaza, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
        attachComicInkOutline(cCurbNS, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
        attachComicInkOutline(cCurbEW, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
        attachComicInkOutline(tac, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
      }
    }

    // North & South leg zebra crosswalks + stop bars + Left/Right turn arrows
    for (const legSign of [-1, 1]) {
      const crosswalkZ = iz + legSign * 7.85;
      for (let sx = -5.6; sx <= 5.6; sx += 1.4) {
        if (Math.abs(sx) < 0.6) continue;
        const zStripe = new THREE.Mesh(zebraStripeNSGeo, matRoadWhite);
        zStripe.position.set(ix + sx, 0.3, crosswalkZ);
        cityAndMountainsGroup.add(zStripe);
        attachComicInkOutline(zStripe, cityAndMountainsGroup, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
      }
      const stopBar = new THREE.Mesh(stopBarNSGeo, matRoadWhite);
      stopBar.position.set(ix + legSign * 3.35, 0.3, iz + legSign * 9.8);
      cityAndMountainsGroup.add(stopBar);
      attachComicInkOutline(stopBar, cityAndMountainsGroup, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);

      // Painted Left-Turn (inner lane) & Right-Turn (outer lane) arrows on avenue approaches
      for (const [laneXOff, turnDir] of [
        [legSign * 1.75, -legSign], // Inner lane -> Left Turn arrow
        [legSign * 5.05, legSign], // Outer lane -> Right Turn arrow
      ] as const) {
        const arrowZ = iz + legSign * 11.8;
        const stem = new THREE.Mesh(turnArrowStemGeo, matRoadWhite);
        stem.position.set(ix + laneXOff, 0.3, arrowZ);
        const hook = new THREE.Mesh(turnArrowHookGeo, matRoadWhite);
        hook.position.set(ix + laneXOff + turnDir * 0.32, 0.3, arrowZ - legSign * 0.62);
        cityAndMountainsGroup.add(stem, hook);
        attachComicInkOutline(stem, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
        attachComicInkOutline(hook, cityAndMountainsGroup, inkLineMat, undefined, 0, 15, inkRegistry);
      }
    }

    // West & East leg zebra crosswalks + stop bars on Cross-Streets
    for (const legSignX of [-1, 1]) {
      const crosswalkX = ix + legSignX * 8.45;
      for (let sz = -4.9; sz <= 4.9; sz += 1.4) {
        if (Math.abs(sz) < 0.6) continue;
        const zStripeEW = new THREE.Mesh(zebraStripeEWGeo, matRoadWhite);
        zStripeEW.position.set(crosswalkX, 0.3, iz + sz);
        cityAndMountainsGroup.add(zStripeEW);
        attachComicInkOutline(zStripeEW, cityAndMountainsGroup, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
      }
      const stopBarEW = new THREE.Mesh(stopBarEWGeo, matRoadWhite);
      stopBarEW.position.set(ix + legSignX * 10.4, 0.3, iz - legSignX * 3.0);
      cityAndMountainsGroup.add(stopBarEW);
      attachComicInkOutline(stopBarEW, cityAndMountainsGroup, inkLineMat, inkHullMat, 0.03, 15, inkRegistry);
    }
  }

  // E. BUILD ALL CITY BLOCK BUILDINGS ACROSS AVENUES & CROSS-STREETS WITH FULL MAIN-STREET HERO DETAIL PARITY!
  // Every Tier-1 building across Central Avenue, West Boulevard, East Boulevard, and all 4 East-West Cross-Streets
  // uses `buildHeroBuildingWithBalconies` so its recessed shopfront, striped awning, flower planters, fascia signage,
  // projecting banners, upper windows, and cantilevered wrought-iron balconies (with pickets, flower boxes, potted plants,
  // bistro chairs, string fairy lights, satellite dish, laundry line, and split AC units) are 100% as detailed as Main Street!
  const cityBuildings = generateExtendedCityBuildings();
  const midFacadeTextures = new Map<string, THREE.CanvasTexture>();
  const balLedgeGeo = new THREE.BoxGeometry(0.88, 0.22, 3.4);
  const balRailGeo = new THREE.BoxGeometry(0.92, 0.78, 3.44);
  disposableGeometries.push(balLedgeGeo, balRailGeo);
  const matCityIron = new THREE.MeshToonMaterial({color: '#1E293B', gradientMap: grad4});
  disposableMaterials.push(matCityIron);

  for (const b of cityBuildings) {
    if (b.detailedFacade && b.shopBrand) {
      const isFacingX = Math.abs(Math.abs(b.facingRotationY) - Math.PI / 2) < 0.2;
      const frontWidth = isFacingX ? b.depthZ : b.widthX;
      const buildingDepth = isFacingX ? b.widthX : b.depthZ;

      const detailedSpec: HeroShopSpec = {
        id: b.id,
        shopTitle: b.shopBrand.shopTitle,
        shopSubtitle: b.shopBrand.shopSubtitle,
        side: b.x < 0 ? 'west' : 'east',
        centerZ: b.z,
        widthZ: frontWidth,
        depthX: buildingDepth,
        groundFloorHeightY: 5.4,
        upperFloorsCount: Math.max(2, b.floors - 1),
        upperFloorHeightY: 3.0,
        brickBaseHex: b.wallColorHex,
        brickAccentHex: b.brickAccentHex,
        upperWallHex: b.upperWallHex,
        trimHex: b.trimColorHex,
        awningPrimaryHex: b.shopBrand.awningPrimaryHex,
        awningSecondaryHex: b.shopBrand.awningSecondaryHex,
        signBgHex: b.shopBrand.signBgHex,
        signTextHex: b.shopBrand.signTextHex,
        signAccentHex: b.shopBrand.signAccentHex,
        windowDisplayType: b.windowDisplayType,
        hasRoofWaterTank: b.hasRoofWaterTank,
        bannerText: b.bannerText ?? b.shopBrand.bannerText,
        posterTitle: b.posterTitle ?? b.shopBrand.posterTitle,
        rooftopBillboard: b.rooftopBillboard,
      };

      const detailedBld = buildHeroBuildingWithBalconies({
        spec: detailedSpec,
        palette,
        grad3,
        grad4,
        inkLineMat,
        inkHullMat,
        inkRegistry,
        disposableGeometries,
        disposableMaterials,
        disposableTextures,
      });

      // Position so the front facade (local Z = 0) aligns with the street-facing edge of the building footprint
      const frontOffsetX = Math.sin(b.facingRotationY) * (buildingDepth * 0.5);
      const frontOffsetZ = Math.cos(b.facingRotationY) * (buildingDepth * 0.5);
      detailedBld.position.set(b.x + frontOffsetX, 0, b.z + frontOffsetZ);
      detailedBld.rotation.y = b.facingRotationY;
      cityAndMountainsGroup.add(detailedBld);
      continue;
    }

    // Far-ground Town Outskirts (LOD Tier 2: radius > 130m) with textured facades & balcony ledges
    const bGeo = new THREE.BoxGeometry(b.widthX, b.heightY, b.depthZ);
    bGeo.translate(0, b.heightY * 0.5, 0);
    disposableGeometries.push(bGeo);

    let tex = midFacadeTextures.get(b.wallColorHex);
    if (!tex) {
      tex = createMidCityFacadeTexture(
        b.wallColorHex,
        b.trimColorHex,
        palette.inkOutlineColor,
      );
      midFacadeTextures.set(b.wallColorHex, tex);
      disposableTextures.push(tex);
    }
    const bMat = new THREE.MeshToonMaterial({
      color: 0xffffff,
      map: tex,
      gradientMap: grad3,
    });
    disposableMaterials.push(bMat);

    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.position.set(b.x, 0, b.z);
    cityAndMountainsGroup.add(bMesh);
    attachComicInkOutline(bMesh, cityAndMountainsGroup, inkLineMat, undefined, 0, 20, inkRegistry);

    for (let fl = 1; fl < b.floors; fl++) {
      const by = fl * 3.0 + 1.6;
      const ledge = new THREE.Mesh(balLedgeGeo, matCurbStone);
      ledge.position.set(b.x, by, b.z + (b.z < 0 ? 1 : -1) * (b.depthZ * 0.5 + 0.35));
      const rail = new THREE.Mesh(balRailGeo, matCityIron);
      rail.position.set(b.x, by + 0.45, b.z + (b.z < 0 ? 1 : -1) * (b.depthZ * 0.5 + 0.38));
      cityAndMountainsGroup.add(ledge, rail);
    }
  }

  // F. Build Detailed Multi-Ridge Craggy 360° Encircling Foothills & Snow-Capped Mountain Massifs (Zero Void Horizon)
  const mountainPeaks = generateSurroundingMountainRange();
  const matSnowCap = new THREE.MeshToonMaterial({
    color: '#F1F5F9',
    gradientMap: grad3,
  });
  const matSnowShadow = new THREE.MeshToonMaterial({
    color: '#CBD5E1',
    gradientMap: grad3,
  });
  disposableMaterials.push(matSnowCap, matSnowShadow);

  for (const peak of mountainPeaks) {
    const massifGroup = new THREE.Group();
    massifGroup.position.set(peak.x, 0, peak.z);
    massifGroup.rotation.y = peak.ridgeRotationY;

    const peakMat = new THREE.MeshToonMaterial({
      color: peak.colorHex,
      gradientMap: grad3,
    });
    const shadowMat = new THREE.MeshToonMaterial({
      color: peak.shadowColorHex,
      gradientMap: grad3,
    });
    disposableMaterials.push(peakMat, shadowMat);

    // 1. Primary Craggy Summit Cone (8-sided faceted rock massif)
    const peakGeo = new THREE.ConeGeometry(peak.baseRadius, peak.heightY, 8);
    peakGeo.translate(0, peak.heightY * 0.5 - 0.5, 0);
    // 2. Asymmetrical Left & Right Flanking Sub-Peaks for Realistic Multi-Ridge Silhouette
    const leftH = peak.heightY * peak.subPeakLeftScale;
    const leftR = peak.baseRadius * 0.72;
    const leftGeo = new THREE.ConeGeometry(leftR, leftH, 7);
    leftGeo.translate(-peak.baseRadius * 0.48, leftH * 0.5 - 0.5, peak.baseRadius * 0.18);

    const rightH = peak.heightY * peak.subPeakRightScale;
    const rightR = peak.baseRadius * 0.68;
    const rightGeo = new THREE.ConeGeometry(rightR, rightH, 7);
    rightGeo.translate(peak.baseRadius * 0.52, rightH * 0.5 - 0.5, -peak.baseRadius * 0.16);

    disposableGeometries.push(peakGeo, leftGeo, rightGeo);

    const mainMesh = new THREE.Mesh(peakGeo, peakMat);
    const leftMesh = new THREE.Mesh(leftGeo, shadowMat);
    const rightMesh = new THREE.Mesh(rightGeo, peakMat);
    massifGroup.add(mainMesh, leftMesh, rightMesh);

    attachComicInkOutline(mainMesh, massifGroup, inkLineMat, undefined, 0, 18, inkRegistry);
    attachComicInkOutline(leftMesh, massifGroup, inkLineMat, undefined, 0, 18, inkRegistry);
    attachComicInkOutline(rightMesh, massifGroup, inkLineMat, undefined, 0, 18, inkRegistry);

    // 3. Jagged Multi-Peak Snow Caps on Central & Flanking Ridges
    if (peak.snowCapRatio > 0) {
      const capH = peak.heightY * peak.snowCapRatio;
      const capR = peak.baseRadius * peak.snowCapRatio * 1.05;
      const capGeo = new THREE.ConeGeometry(capR, capH, 8);
      capGeo.translate(0, peak.heightY - capH * 0.5 - 0.4, 0);
      disposableGeometries.push(capGeo);
      const capMesh = new THREE.Mesh(capGeo, matSnowCap);
      massifGroup.add(capMesh);

      if (peak.subPeakLeftScale > 0.68) {
        const subCapH = leftH * (peak.snowCapRatio * 0.85);
        const subCapR = leftR * (peak.snowCapRatio * 0.9);
        const subCapGeo = new THREE.ConeGeometry(subCapR, subCapH, 7);
        subCapGeo.translate(
          -peak.baseRadius * 0.48,
          leftH - subCapH * 0.5 - 0.4,
          peak.baseRadius * 0.18,
        );
        disposableGeometries.push(subCapGeo);
        const subCapMesh = new THREE.Mesh(subCapGeo, matSnowShadow);
        massifGroup.add(subCapMesh);
      }
    }

    cityAndMountainsGroup.add(massifGroup);
  }

  return {
    heroBlocksGroup,
    sidewalkPropsGroup,
    cityAndMountainsGroup,
  };
}
