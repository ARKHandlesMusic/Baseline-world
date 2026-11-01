import * as THREE from 'three';
import {createMainStreetToonGradientTexture} from './main-street-style-engine';

export const MAIN_STREET_INK_COLOR_HEX = '#0A0812';

export function attachComicInkOutlineToMesh(
  mesh: THREE.Mesh,
  inkLineMat: THREE.LineBasicMaterial,
  inkRegistry: THREE.Object3D[],
): void {
  const edges = new THREE.EdgesGeometry(mesh.geometry, 18);
  const line = new THREE.LineSegments(edges, inkLineMat);
  line.position.copy(mesh.position);
  line.rotation.copy(mesh.rotation);
  line.scale.copy(mesh.scale);
  if (mesh.parent) {
    mesh.parent.add(line);
  } else {
    mesh.add(line);
  }
  inkRegistry.push(line);
}

export type ConnectedSceneId = 'main-street' | 'bedroom' | 'shop' | 'garage';

export type ExteriorTimeOfDayPreset =
  | 'golden-daylight'
  | 'twilight-city'
  | 'midnight-streetlamps';

export interface MainStreetGatewaySpec {
  id: 'gateway-bedroom-window' | 'gateway-shop-window' | 'gateway-garage-window';
  targetScene: Exclude<ConnectedSceneId, 'main-street'>;
  title: string;
  subtitle: string;
  buildingId: string;
  buildingName: string;
  floorLabel: string;
  /** World-space position of the transparent gateway window center on Main Street */
  worldWindowPosition: [number, number, number];
  /** World-space camera position on Main Street to peer through the transparent window into the room */
  streetOutsideCameraPos: [number, number, number];
  /** World-space lookAt target inside the recessed 3D room pocket on Main Street */
  streetOutsideLookAt: [number, number, number];
  /** Interior scene camera position looking OUT the transparent room window at the Main Street city */
  interiorLookingOutCameraPos: [number, number, number];
  /** Interior scene camera lookAt target outside the window in the 3D Main Street cityscape */
  interiorLookingOutTarget: [number, number, number];
  badgeColorHex: string;
}

export const MAIN_STREET_SCENE_GATEWAYS: readonly MainStreetGatewaySpec[] = [
  {
    id: 'gateway-bedroom-window',
    targetScene: 'bedroom',
    title: '2F Apartment Window → Dark Room Bedroom',
    subtitle:
      'Transparent 2nd-floor balcony window above Crack & Sons looking into the lit Bedroom (Desk, Phone, Sofa & News TV)',
    buildingId: 'shop-west-center-crack-and-sons',
    buildingName: 'CRACK & SONS (2nd Floor Apartment #2B)',
    floorLabel: '2nd Floor Center Balcony Window (Y = 6.95m)',
    worldWindowPosition: [-11.05, 6.95, 0.0],
    streetOutsideCameraPos: [-6.4, 7.15, 0.45],
    streetOutsideLookAt: [-12.6, 6.85, 0.0],
    interiorLookingOutCameraPos: [-1.15, 1.72, -0.35],
    interiorLookingOutTarget: [-14.0, 1.45, -0.35],
    badgeColorHex: '#38BDF8',
  },
  {
    id: 'gateway-shop-window',
    targetScene: 'shop',
    title: '1F Storefront Window & Door → Crack & Sons Shop',
    subtitle:
      'Transparent ground-floor display bay window & glazed walnut door looking into Crack & Sons Nutcracker Boutique',
    buildingId: 'shop-west-center-crack-and-sons',
    buildingName: 'CRACK & SONS NUTCRACKERS (Ground Floor)',
    floorLabel: '1st Floor Display Window & Doorway (Y = 2.25m)',
    worldWindowPosition: [-11.05, 2.25, 1.85],
    streetOutsideCameraPos: [-6.2, 2.15, 2.15],
    streetOutsideLookAt: [-13.2, 1.95, 1.85],
    interiorLookingOutCameraPos: [-1.45, 1.68, 1.05],
    interiorLookingOutTarget: [-0.85, 1.62, 14.5],
    badgeColorHex: '#F59E0B',
  },
  {
    id: 'gateway-garage-window',
    targetScene: 'garage',
    title: '1F Garage Bay & Window → Nuclear Launch Garage',
    subtitle:
      'Transparent workshop bay window & overhead garage door looking into the Sub-Floor Nuclear Silo & Garage',
    buildingId: 'shop-west-south-hardware',
    buildingName: 'METRO HARDWARE & GARAGE BAY (Ground Floor)',
    floorLabel: '1st Floor Garage Bay & Window (Y = 2.25m, Z = +15.05m)',
    worldWindowPosition: [-11.05, 2.25, 15.05],
    streetOutsideCameraPos: [-6.1, 2.15, 15.25],
    streetOutsideLookAt: [-13.4, 1.85, 15.05],
    interiorLookingOutCameraPos: [0.0, 1.65, 0.85],
    interiorLookingOutTarget: [0.0, 1.55, 15.5],
    badgeColorHex: '#EF4444',
  },
] as const;

export interface ExteriorWindowLightingState {
  sunColorHex: string;
  sunIntensity: number;
  skyHemiTopHex: string;
  skyHemiBottomHex: string;
  skyHemiIntensity: number;
  windowBounceColorHex: string;
  windowBounceIntensity: number;
  sunbeamFloorOpacity: number;
  glassTintHex: string;
  glassOpacity: number;
}

/**
 * Pure deterministic calculation of how the exterior Main Street city lighting
 * streams through the transparent windows/doors into the Bedroom, Shop, and Garage.
 */
export function evaluateExteriorWindowLightingCoupling(params: {
  scene: Exclude<ConnectedSceneId, 'main-street'>;
  preset?: ExteriorTimeOfDayPreset;
  apertureOpen01?: number;
}): ExteriorWindowLightingState {
  const preset = params.preset ?? 'golden-daylight';
  const open01 = Math.max(0, Math.min(1, params.apertureOpen01 ?? 1));

  if (preset === 'golden-daylight') {
    const baseSun =
      params.scene === 'bedroom'
        ? 4.6
        : params.scene === 'shop'
          ? 4.2
          : 3.4 + open01 * 3.2;
    return {
      sunColorHex: '#FFFbeb',
      sunIntensity: Number(baseSun.toFixed(3)),
      skyHemiTopHex: '#BAE6FD',
      skyHemiBottomHex: '#FDE68A',
      skyHemiIntensity: Number((1.45 + open01 * 0.45).toFixed(3)),
      windowBounceColorHex: '#38BDF8',
      windowBounceIntensity: Number((2.8 + open01 * 1.4).toFixed(3)),
      sunbeamFloorOpacity: Number((0.22 + open01 * 0.14).toFixed(3)),
      glassTintHex: '#BAE6FD',
      glassOpacity: 0.18,
    };
  }

  if (preset === 'twilight-city') {
    const baseSun =
      params.scene === 'bedroom'
        ? 3.4
        : params.scene === 'shop'
          ? 3.1
          : 2.4 + open01 * 2.2;
    return {
      sunColorHex: '#FB923C',
      sunIntensity: Number(baseSun.toFixed(3)),
      skyHemiTopHex: '#818CF8',
      skyHemiBottomHex: '#FDBA74',
      skyHemiIntensity: Number((1.15 + open01 * 0.35).toFixed(3)),
      windowBounceColorHex: '#F59E0B',
      windowBounceIntensity: Number((2.4 + open01 * 1.1).toFixed(3)),
      sunbeamFloorOpacity: Number((0.18 + open01 * 0.1).toFixed(3)),
      glassTintHex: '#93C5FD',
      glassOpacity: 0.2,
    };
  }

  // midnight-streetlamps
  const baseSun =
    params.scene === 'bedroom'
      ? 2.4
      : params.scene === 'shop'
        ? 2.2
        : 1.8 + open01 * 1.6;
  return {
    sunColorHex: '#60A5FA',
    sunIntensity: Number(baseSun.toFixed(3)),
    skyHemiTopHex: '#38BDF8',
    skyHemiBottomHex: '#1E293B',
    skyHemiIntensity: Number((0.92 + open01 * 0.28).toFixed(3)),
    windowBounceColorHex: '#FACC15',
    windowBounceIntensity: Number((2.2 + open01 * 1.2).toFixed(3)),
    sunbeamFloorOpacity: Number((0.12 + open01 * 0.08).toFixed(3)),
    glassTintHex: '#60A5FA',
    glassOpacity: 0.22,
  };
}

function createStoreSignBannerTexture(
  title: string,
  subtitle: string,
  bgHex: string,
  textHex: string,
  accentHex: string,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 496, 112);
    ctx.strokeStyle = MAIN_STREET_INK_COLOR_HEX;
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 506, 122);

    ctx.fillStyle = textHex;
    ctx.font = '900 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 256, 62);

    ctx.fillStyle = accentHex;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(subtitle, 256, 98);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export interface ConnectedMainStreetExteriorHandle {
  group: THREE.Group;
  windowSunLight: THREE.DirectionalLight;
  windowSkyHemiLight: THREE.HemisphereLight;
  windowStreetBounceLight: THREE.PointLight;
  sunbeamMeshes: THREE.Mesh[];
  updateAtFrame: (
    frame: number,
    fps: number,
    preset?: ExteriorTimeOfDayPreset,
    apertureOpen01?: number,
  ) => void;
  dispose: () => void;
}

/**
 * Builds the 3D Connected Main Street City Exterior outside the transparent windows/doors
 * of the Bedroom (`bedroom`), Crack & Sons Shop (`shop`), or Garage (`garage`).
 *
 * Includes:
 *  - Cel-shaded Main Street 2-lane asphalt road with yellow center dashes & crosswalks
 *  - Concrete sidewalks, granite curbs, street trees in grates, fire hydrants, and vintage double-lantern streetlamps
 *  - Wooden utility poles with dual crossarms, cyan insulators & pole-to-pole catenary overhead power cables
 *  - Across-the-street multi-story brick Hero Storefronts with striped awnings, 2F/3F windows, wrought-iron balconies, flower planters & rooftop water tanks
 *  - Animated anime lo-fi vehicles driving along Main Street outside the window
 *  - 360° snow-capped mountain peaks and cel-shaded sky dome with drifting clouds & sun
 *  - Coupled Exterior-to-Interior Window Directional Sunlight, Sky Hemisphere Light & Floor Sunbeams
 */
export function buildConnectedMainStreetExteriorVista(params: {
  scene: Exclude<ConnectedSceneId, 'main-street'>;
}): ConnectedMainStreetExteriorHandle {
  const {scene} = params;
  const group = new THREE.Group();
  group.name = `ConnectedMainStreetExteriorVista_${scene}`;

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const inkObjects: THREE.Object3D[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    textures.push(t);
    return t;
  };

  const grad3 = trackTex(createMainStreetToonGradientTexture(3));
  const grad4 = trackTex(createMainStreetToonGradientTexture(4));
  const inkLineMat = trackMat(
    new THREE.LineBasicMaterial({color: MAIN_STREET_INK_COLOR_HEX}),
  );

  // Materials matching Main Street palette
  const asphaltMat = trackMat(
    new THREE.MeshToonMaterial({color: '#2B2B3C', gradientMap: grad3}),
  );
  const sidewalkMat = trackMat(
    new THREE.MeshToonMaterial({color: '#95919E', gradientMap: grad3}),
  );
  const curbMat = trackMat(
    new THREE.MeshToonMaterial({color: '#C7C1CA', gradientMap: grad3}),
  );
  const yellowLineMat = trackMat(
    new THREE.MeshBasicMaterial({color: '#FFBF36'}),
  );
  const whiteLineMat = trackMat(
    new THREE.MeshBasicMaterial({color: '#FFF4E6'}),
  );
  const ironMat = trackMat(
    new THREE.MeshToonMaterial({color: '#1E293B', gradientMap: grad4}),
  );
  const poleWoodMat = trackMat(
    new THREE.MeshToonMaterial({color: '#5C3A21', gradientMap: grad3}),
  );
  const insulatorMat = trackMat(
    new THREE.MeshToonMaterial({color: '#38BDF8', gradientMap: grad4}),
  );
  const foliageMat = trackMat(
    new THREE.MeshToonMaterial({color: '#22C55E', gradientMap: grad3}),
  );
  const trunkMat = trackMat(
    new THREE.MeshToonMaterial({color: '#6B4423', gradientMap: grad3}),
  );
  const lampGlowMat = trackMat(
    new THREE.MeshBasicMaterial({color: '#FEF08A'}),
  );
  const skyDomeMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#BAE6FD',
      side: THREE.BackSide,
    }),
  );
  const mountainMat = trackMat(
    new THREE.MeshToonMaterial({color: '#475569', gradientMap: grad3}),
  );
  const snowCapMat = trackMat(
    new THREE.MeshBasicMaterial({color: '#F8FAFC'}),
  );
  const cloudMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#FFFBEB',
      transparent: true,
      opacity: 0.88,
    }),
  );

  // Helper to build a complete Main Street corridor strip (oriented along local X axis, centered at local Z = 0)
  const buildStreetCorridorCluster = (corridorName: string): {
    corridorGroup: THREE.Group;
    animatedCars: Array<{
      carGroup: THREE.Group;
      laneZ: number;
      direction: 1 | -1;
      speedMetersPerSec: number;
      phaseOffset: number;
    }>;
  } => {
    const corridorGroup = new THREE.Group();
    corridorGroup.name = corridorName;

    // 1. Asphalt Roadway (width 11m in Z, length 64m in X)
    const roadMesh = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(64, 0.16, 11.0)),
      asphaltMat,
    );
    roadMesh.position.set(0, -0.08, 0);
    corridorGroup.add(roadMesh);

    // Center Yellow Dashed Divider Lines
    const dashGeo = trackGeo(new THREE.BoxGeometry(2.4, 0.04, 0.22));
    for (let dx = -28; dx <= 28; dx += 4.8) {
      const dash = new THREE.Mesh(dashGeo, yellowLineMat);
      dash.position.set(dx, 0.015, 0);
      corridorGroup.add(dash);
    }

    // Crosswalk Zebra Stripes near X = -9.5 and X = +9.5
    const zebraGeo = trackGeo(new THREE.BoxGeometry(2.2, 0.04, 0.48));
    for (const cx of [-10.5, 10.5]) {
      for (let cz = -4.2; cz <= 4.2; cz += 1.05) {
        const zStripe = new THREE.Mesh(zebraGeo, whiteLineMat);
        zStripe.position.set(cx, 0.016, cz);
        corridorGroup.add(zStripe);
      }
    }

    // 2. Near & Far Concrete Sidewalks + Granite Curbs
    const swGeo = trackGeo(new THREE.BoxGeometry(64, 0.24, 4.2));
    const curbGeo = trackGeo(new THREE.BoxGeometry(64, 0.28, 0.28));
    for (const sideZ of [-1, 1]) {
      const sw = new THREE.Mesh(swGeo, sidewalkMat);
      sw.position.set(0, 0.04, sideZ * 7.6);
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(0, 0.06, sideZ * 5.55);
      corridorGroup.add(sw, curb);
      attachComicInkOutlineToMesh(curb, inkLineMat, inkObjects);
    }

    // 3. Vintage Double-Lantern Streetlamps, Trees in Grates & Fire Hydrants along Both Sidewalks
    const lampPostGeo = trackGeo(new THREE.CylinderGeometry(0.06, 0.1, 4.2, 8));
    const lampArmGeo = trackGeo(new THREE.BoxGeometry(0.95, 0.06, 0.06));
    const lampGlobeGeo = trackGeo(new THREE.SphereGeometry(0.2, 10, 10));
    const treeTrunkGeo = trackGeo(new THREE.CylinderGeometry(0.14, 0.2, 2.2, 8));
    const treeCrownGeo = trackGeo(new THREE.DodecahedronGeometry(1.15, 1));
    const hydrantGeo = trackGeo(new THREE.CylinderGeometry(0.14, 0.16, 0.72, 8));
    const hydrantRedMat = trackMat(
      new THREE.MeshToonMaterial({color: '#EF4444', gradientMap: grad4}),
    );

    for (const lx of [-20, -7.5, 5.5, 19]) {
      for (const sideZ of [-1, 1]) {
        const lampGroup = new THREE.Group();
        lampGroup.position.set(lx, 0.16, sideZ * 6.1);
        const post = new THREE.Mesh(lampPostGeo, ironMat);
        post.position.y = 2.1;
        const arm = new THREE.Mesh(lampArmGeo, ironMat);
        arm.position.y = 4.05;
        lampGroup.add(post, arm);
        attachComicInkOutlineToMesh(post, inkLineMat, inkObjects);
        for (const gx of [-0.42, 0.42]) {
          const globe = new THREE.Mesh(lampGlobeGeo, lampGlowMat);
          globe.position.set(gx, 4.22, 0);
          lampGroup.add(globe);
        }
        corridorGroup.add(lampGroup);
      }
    }

    for (const tx of [-14, -1.2, 12.5]) {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(tx, 0.16, 6.4);
      const trunk = new THREE.Mesh(treeTrunkGeo, trunkMat);
      trunk.position.y = 1.1;
      const crownMain = new THREE.Mesh(treeCrownGeo, foliageMat);
      crownMain.position.y = 2.65;
      const crownSub = new THREE.Mesh(treeCrownGeo, foliageMat);
      crownSub.scale.setScalar(0.75);
      crownSub.position.set(0.55, 2.35, -0.25);
      treeGroup.add(trunk, crownMain, crownSub);
      attachComicInkOutlineToMesh(trunk, inkLineMat, inkObjects);
      attachComicInkOutlineToMesh(crownMain, inkLineMat, inkObjects);
      corridorGroup.add(treeGroup);
    }

    const hydrant = new THREE.Mesh(hydrantGeo, hydrantRedMat);
    hydrant.position.set(-4.2, 0.52, -6.05);
    corridorGroup.add(hydrant);
    attachComicInkOutlineToMesh(hydrant, inkLineMat, inkObjects);

    // 4. Wooden Utility Poles with Crossarms, Cyan Insulators & Overhead Catenary Power Cables
    const uPoleGeo = trackGeo(new THREE.CylinderGeometry(0.11, 0.16, 8.2, 8));
    const uArmGeo = trackGeo(new THREE.BoxGeometry(0.12, 0.12, 1.85));
    const uInsGeo = trackGeo(new THREE.CylinderGeometry(0.045, 0.06, 0.18, 6));
    const poleXs = [-22, -6, 10, 24];
    for (const px of poleXs) {
      const pGroup = new THREE.Group();
      pGroup.position.set(px, 0.16, 6.25);
      const shaft = new THREE.Mesh(uPoleGeo, poleWoodMat);
      shaft.position.y = 4.1;
      pGroup.add(shaft);
      attachComicInkOutlineToMesh(shaft, inkLineMat, inkObjects);

      for (const armY of [6.4, 7.5]) {
        const arm = new THREE.Mesh(uArmGeo, poleWoodMat);
        arm.position.y = armY;
        pGroup.add(arm);
        for (const iz of [-0.65, 0, 0.65]) {
          const ins = new THREE.Mesh(uInsGeo, insulatorMat);
          ins.position.set(0, armY + 0.14, iz);
          pGroup.add(ins);
        }
      }
      corridorGroup.add(pGroup);
    }

    // String catenary cables between consecutive utility poles
    const cableMat = trackMat(
      new THREE.MeshBasicMaterial({color: MAIN_STREET_INK_COLOR_HEX}),
    );
    for (let i = 0; i < poleXs.length - 1; i++) {
      const x0 = poleXs[i];
      const x1 = poleXs[i + 1];
      for (const armY of [6.68, 7.78]) {
        for (const iz of [-0.65, 0, 0.65]) {
          const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(x0, armY, 6.25 + iz),
            new THREE.Vector3((x0 + x1) * 0.5, armY - 0.52, 6.25 + iz),
            new THREE.Vector3(x1, armY, 6.25 + iz),
          );
          const tubeGeo = trackGeo(
            new THREE.TubeGeometry(curve, 12, 0.024, 5, false),
          );
          corridorGroup.add(new THREE.Mesh(tubeGeo, cableMat));
        }
      }
    }

    // 5. Across-the-Street Multi-Story Brick Hero Storefronts (at Z = +13.5 facing -Z toward our window!)
    const buildingSpecs = [
      {
        x: -14.2,
        w: 11.8,
        floors: 3,
        brickHex: '#9A3412',
        upperHex: '#D97706',
        trimHex: '#FEF3C7',
        awningA: '#DC2626',
        awningB: '#FFFBEB',
        title: 'BOULANGERIE DORÉE',
        subtitle: 'ARTISAN PASTRIES • CAFÉ • EST. 1924',
      },
      {
        x: 0.0,
        w: 12.4,
        floors: 3,
        brickHex: '#7C2D12',
        upperHex: '#B45309',
        trimHex: '#FDE68A',
        awningA: '#0284C7',
        awningB: '#F0F9FF',
        title: 'SAKURA NOODLE BAR',
        subtitle: 'RAMEN • GYOZA • LATE NIGHT',
      },
      {
        x: 14.2,
        w: 11.8,
        floors: 2,
        brickHex: '#334155',
        upperHex: '#64748B',
        trimHex: '#E2E8F0',
        awningA: '#16A34A',
        awningB: '#F0FDF4',
        title: 'LE PETIT TAILOR',
        subtitle: 'BESPOKE SUITS • DRY CLEANING',
      },
    ];

    const winFrameGeo = trackGeo(new THREE.BoxGeometry(1.48, 1.92, 0.18));
    const winGlassGeo = trackGeo(new THREE.BoxGeometry(1.26, 1.7, 0.08));
    const balSlabGeo = trackGeo(new THREE.BoxGeometry(2.25, 0.16, 0.92));
    const balRailGeo = trackGeo(new THREE.BoxGeometry(2.25, 0.82, 0.06));
    const planterBoxGeo = trackGeo(new THREE.BoxGeometry(0.92, 0.24, 0.24));
    const terracottaMat = trackMat(
      new THREE.MeshToonMaterial({color: '#C2410C', gradientMap: grad3}),
    );
    const upperWinMat = trackMat(
      new THREE.MeshToonMaterial({color: '#38BDF8', gradientMap: grad4}),
    );

    for (const bSpec of buildingSpecs) {
      const bGroup = new THREE.Group();
      bGroup.position.set(bSpec.x, 0.16, 13.5);

      const hGround = 4.6;
      const hUpper = bSpec.floors * 3.35;
      const totalH = hGround + hUpper;

      const matBrick = trackMat(
        new THREE.MeshToonMaterial({color: bSpec.brickHex, gradientMap: grad3}),
      );
      const matUpper = trackMat(
        new THREE.MeshToonMaterial({color: bSpec.upperHex, gradientMap: grad3}),
      );
      const matTrim = trackMat(
        new THREE.MeshToonMaterial({color: bSpec.trimHex, gradientMap: grad3}),
      );
      const matAwningA = trackMat(
        new THREE.MeshToonMaterial({color: bSpec.awningA, gradientMap: grad3}),
      );
      const matAwningB = trackMat(
        new THREE.MeshToonMaterial({color: bSpec.awningB, gradientMap: grad3}),
      );

      const groundHull = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(bSpec.w, hGround, 7.5)),
        matBrick,
      );
      groundHull.position.set(0, hGround * 0.5, 0);

      const upperHull = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(bSpec.w - 0.12, hUpper, 7.3)),
        matUpper,
      );
      upperHull.position.set(0, hGround + hUpper * 0.5, 0);

      const cornice = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(bSpec.w + 0.4, 0.42, 7.8)),
        matTrim,
      );
      cornice.position.set(0, totalH, 0);

      bGroup.add(groundHull, upperHull, cornice);
      attachComicInkOutlineToMesh(groundHull, inkLineMat, inkObjects);
      attachComicInkOutlineToMesh(upperHull, inkLineMat, inkObjects);
      attachComicInkOutlineToMesh(cornice, inkLineMat, inkObjects);

      // Storefront Sign Banner on Front Face (Z = -3.82 facing -Z)
      const signTex = trackTex(
        createStoreSignBannerTexture(
          bSpec.title,
          bSpec.subtitle,
          '#0F172A',
          '#FFFBEB',
          '#FACC15',
        ),
      );
      const signBoard = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(5.2, 1.15, 0.22)),
        trackMat(new THREE.MeshBasicMaterial({map: signTex})),
      );
      signBoard.position.set(0, 4.15, -3.82);
      bGroup.add(signBoard);
      attachComicInkOutlineToMesh(signBoard, inkLineMat, inkObjects);

      // Ground-floor glowing shop display window & striped awning
      const shopWin = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(5.4, 2.55, 0.14)),
        upperWinMat,
      );
      shopWin.position.set(-1.4, 2.05, -3.78);
      bGroup.add(shopWin);
      attachComicInkOutlineToMesh(shopWin, inkLineMat, inkObjects);

      const stripeGeo = trackGeo(new THREE.BoxGeometry(0.72, 0.14, 1.25));
      for (let s = 0; s < 8; s++) {
        const stripe = new THREE.Mesh(
          stripeGeo,
          s % 2 === 0 ? matAwningA : matAwningB,
        );
        stripe.position.set(-3.9 + s * 0.72, 3.45, -4.25);
        stripe.rotation.x = -0.32;
        bGroup.add(stripe);
      }

      // Upper Apartment Windows & Wrought-Iron Balconies
      for (let fl = 0; fl < bSpec.floors; fl++) {
        const fy = hGround + fl * 3.35 + 1.45;
        for (const wx of [-3.2, 0, 3.2]) {
          const wf = new THREE.Mesh(winFrameGeo, matTrim);
          wf.position.set(wx, fy, -3.72);
          const wg = new THREE.Mesh(winGlassGeo, upperWinMat);
          wg.position.set(wx, fy, -3.78);
          const slab = new THREE.Mesh(balSlabGeo, matTrim);
          slab.position.set(wx, fy - 1.05, -4.15);
          const rail = new THREE.Mesh(balRailGeo, ironMat);
          rail.position.set(wx, fy - 0.58, -4.55);
          const planter = new THREE.Mesh(planterBoxGeo, terracottaMat);
          planter.position.set(wx, fy - 0.55, -4.65);
          bGroup.add(wf, wg, slab, rail, planter);
          attachComicInkOutlineToMesh(wf, inkLineMat, inkObjects);
          attachComicInkOutlineToMesh(slab, inkLineMat, inkObjects);
          attachComicInkOutlineToMesh(rail, inkLineMat, inkObjects);
        }
      }

      corridorGroup.add(bGroup);
    }

    // 6. Animated Anime Lo-Fi Cars driving along Main Street outside the window
    const animatedCars: Array<{
      carGroup: THREE.Group;
      laneZ: number;
      direction: 1 | -1;
      speedMetersPerSec: number;
      phaseOffset: number;
    }> = [];

    const carColors = ['#EF4444', '#38BDF8', '#FACC15', '#A855F7'];
    const carBodyGeo = trackGeo(new THREE.BoxGeometry(3.5, 0.72, 1.68));
    const carCabinGeo = trackGeo(new THREE.BoxGeometry(1.95, 0.58, 1.48));
    const carWheelGeo = trackGeo(
      new THREE.CylinderGeometry(0.32, 0.32, 0.24, 12),
    );
    carWheelGeo.rotateX(Math.PI / 2);
    const wheelMat = trackMat(
      new THREE.MeshToonMaterial({color: '#0F172A', gradientMap: grad3}),
    );
    const headlightMat = trackMat(
      new THREE.MeshBasicMaterial({color: '#FEF08A'}),
    );
    const taillightMat = trackMat(
      new THREE.MeshBasicMaterial({color: '#EF4444'}),
    );

    for (let c = 0; c < 4; c++) {
      const carGroup = new THREE.Group();
      const bodyMat = trackMat(
        new THREE.MeshToonMaterial({
          color: carColors[c % carColors.length],
          gradientMap: grad4,
        }),
      );
      const body = new THREE.Mesh(carBodyGeo, bodyMat);
      body.position.y = 0.58;
      const cabin = new THREE.Mesh(carCabinGeo, upperWinMat);
      cabin.position.set(-0.15, 1.18, 0);
      carGroup.add(body, cabin);
      attachComicInkOutlineToMesh(body, inkLineMat, inkObjects);
      attachComicInkOutlineToMesh(cabin, inkLineMat, inkObjects);

      for (const [wx, wz] of [
        [-1.08, -0.82],
        [1.08, -0.82],
        [-1.08, 0.82],
        [1.08, 0.82],
      ]) {
        const wh = new THREE.Mesh(carWheelGeo, wheelMat);
        wh.position.set(wx, 0.32, wz);
        carGroup.add(wh);
      }

      const hl = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.08, 0.18, 1.25)),
        headlightMat,
      );
      hl.position.set(1.76, 0.62, 0);
      const tl = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.08, 0.18, 1.25)),
        taillightMat,
      );
      tl.position.set(-1.76, 0.62, 0);
      carGroup.add(hl, tl);

      const direction: 1 | -1 = c % 2 === 0 ? 1 : -1;
      const laneZ = direction === 1 ? 2.45 : -2.45;
      if (direction === -1) {
        carGroup.rotation.y = Math.PI;
      }
      corridorGroup.add(carGroup);
      animatedCars.push({
        carGroup,
        laneZ,
        direction,
        speedMetersPerSec: 6.2 + c * 1.35,
        phaseOffset: c * 14.5,
      });
    }

    // 7. Distant Snow-Capped Mountain Peaks & Drifting Anime Clouds behind the buildings
    const mtnGeo = trackGeo(new THREE.ConeGeometry(16, 22, 5));
    const capGeo = trackGeo(new THREE.ConeGeometry(6.2, 8.4, 5));
    for (const [mx, mz, sc] of [
      [-28, 36, 1.15],
      [-6, 40, 1.35],
      [18, 37, 1.2],
      [36, 34, 1.05],
    ]) {
      const mtn = new THREE.Mesh(mtnGeo, mountainMat);
      mtn.position.set(mx, 9.5 * sc, mz);
      mtn.scale.setScalar(sc);
      const cap = new THREE.Mesh(capGeo, snowCapMat);
      cap.position.set(mx, 16.2 * sc, mz);
      cap.scale.setScalar(sc);
      corridorGroup.add(mtn, cap);
      attachComicInkOutlineToMesh(mtn, inkLineMat, inkObjects);
    }

    const cloudPuffGeo = trackGeo(new THREE.DodecahedronGeometry(2.6, 1));
    for (const [cx, cy, cz] of [
      [-18, 18.5, 25],
      [2, 20.5, 28],
      [20, 17.8, 24],
    ]) {
      const cGroup = new THREE.Group();
      cGroup.position.set(cx, cy, cz);
      const p1 = new THREE.Mesh(cloudPuffGeo, cloudMat);
      const p2 = new THREE.Mesh(cloudPuffGeo, cloudMat);
      p2.scale.setScalar(0.75);
      p2.position.set(2.2, -0.4, 0.3);
      const p3 = new THREE.Mesh(cloudPuffGeo, cloudMat);
      p3.scale.setScalar(0.7);
      p3.position.set(-2.1, -0.5, -0.2);
      cGroup.add(p1, p2, p3);
      corridorGroup.add(cGroup);
    }

    return {corridorGroup, animatedCars};
  };

  // Sky Dome surrounding the entire scene so any angle through any window sees the Main Street sky
  const skyDome = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(85, 24, 18)),
    skyDomeMat,
  );
  group.add(skyDome);

  const allAnimatedCars: Array<{
    carGroup: THREE.Group;
    laneZ: number;
    direction: 1 | -1;
    speedMetersPerSec: number;
    phaseOffset: number;
  }> = [];

  if (scene === 'bedroom') {
    // Bedroom is on the 2nd Floor (Y = +6.2m above Main Street ground)!
    // Place the primary Main Street corridor outside the West Window (X < -3.65),
    // rotated so the street runs along Z and faces +X toward the Bedroom's West Window!
    const westCorridor = buildStreetCorridorCluster('MainStreetWestWindowVista');
    westCorridor.corridorGroup.rotation.y = -Math.PI / 2;
    westCorridor.corridorGroup.position.set(-12.5, -6.2, 0);
    group.add(westCorridor.corridorGroup);
    allAnimatedCars.push(...westCorridor.animatedCars);

    // Also place a Cross-Street Main Street vista outside the South Lounge Window (Z > 2.95)
    const southCorridor = buildStreetCorridorCluster('MainStreetSouthWindowVista');
    southCorridor.corridorGroup.position.set(0, -6.2, 12.2);
    group.add(southCorridor.corridorGroup);
    allAnimatedCars.push(...southCorridor.animatedCars);

    // Build the Bedroom's OWN Exterior 2nd-Floor Wrought-Iron Balcony & Flower Planter right outside the West Window (X = -4.08, Y = 0.88, Z = -0.35)!
    const extBalconyGroup = new THREE.Group();
    extBalconyGroup.name = 'BedroomExteriorBalconyOutsideWindow';
    extBalconyGroup.position.set(-4.05, 0.85, -0.35);

    const balSlab = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.96, 0.14, 2.45)),
      curbMat,
    );
    balSlab.position.set(0, 0, 0);
    const balFrontRail = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.06, 0.06, 2.45)),
      ironMat,
    );
    balFrontRail.position.set(-0.44, 0.86, 0);
    extBalconyGroup.add(balSlab, balFrontRail);
    attachComicInkOutlineToMesh(balSlab, inkLineMat, inkObjects);
    attachComicInkOutlineToMesh(balFrontRail, inkLineMat, inkObjects);

    const balPostGeo = trackGeo(new THREE.CylinderGeometry(0.03, 0.03, 0.84, 6));
    for (let pz = -1.1; pz <= 1.11; pz += 0.36) {
      const post = new THREE.Mesh(balPostGeo, ironMat);
      post.position.set(-0.44, 0.43, pz);
      extBalconyGroup.add(post);
    }

    // Terracotta flower planter box + green shrubs + warm fairy bulbs on the bedroom balcony railing!
    const planterMat = trackMat(
      new THREE.MeshToonMaterial({color: '#C2410C', gradientMap: grad3}),
    );
    const planter = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.24, 0.22, 1.05)),
      planterMat,
    );
    planter.position.set(-0.54, 0.78, 0);
    extBalconyGroup.add(planter);
    attachComicInkOutlineToMesh(planter, inkLineMat, inkObjects);

    const bushGeo = trackGeo(new THREE.DodecahedronGeometry(0.18, 0));
    const bulbGeo = trackGeo(new THREE.SphereGeometry(0.048, 8, 8));
    for (const fz of [-0.35, 0, 0.35]) {
      const bush = new THREE.Mesh(bushGeo, foliageMat);
      bush.position.set(-0.54, 0.96, fz);
      extBalconyGroup.add(bush);
    }
    for (const lz of [-0.9, -0.45, 0, 0.45, 0.9]) {
      const bulb = new THREE.Mesh(bulbGeo, lampGlowMat);
      bulb.position.set(-0.44, 0.89, lz);
      extBalconyGroup.add(bulb);
    }
    group.add(extBalconyGroup);
  } else if (scene === 'shop') {
    // Crack & Sons Shop is on the Ground Floor (Y = 0) with South Front Bay Window & Door at Z = +3.32!
    const shopStreet = buildStreetCorridorCluster('MainStreetOutsideShop');
    shopStreet.corridorGroup.position.set(0, -0.04, 11.2);
    group.add(shopStreet.corridorGroup);
    allAnimatedCars.push(...shopStreet.animatedCars);
  } else {
    // Garage & Nuclear Launch Setup is at Ground Level (Y = 0) with Overhead Garage Door & Workshop Window at Z = +3.52!
    const garageStreet = buildStreetCorridorCluster('MainStreetOutsideGarage');
    garageStreet.corridorGroup.position.set(0, -0.04, 11.5);
    group.add(garageStreet.corridorGroup);
    allAnimatedCars.push(...garageStreet.animatedCars);
  }

  // Coupled Exterior-to-Interior Lights that stream IN through the transparent windows/doors
  const windowSunLight = new THREE.DirectionalLight('#FFFBEB', 4.2);
  if (scene === 'bedroom') {
    windowSunLight.position.set(-14.0, 8.5, 6.5);
    windowSunLight.target.position.set(0.5, 0.5, -0.5);
  } else {
    windowSunLight.position.set(4.5, 9.0, 15.0);
    windowSunLight.target.position.set(-0.5, 0.5, -0.5);
  }
  group.add(windowSunLight);
  group.add(windowSunLight.target);

  const windowSkyHemiLight = new THREE.HemisphereLight(
    '#BAE6FD',
    '#FDE68A',
    1.55,
  );
  group.add(windowSkyHemiLight);

  const windowStreetBounceLight = new THREE.PointLight(
    '#38BDF8',
    3.2,
    14.0,
    1.1,
  );
  if (scene === 'bedroom') {
    windowStreetBounceLight.position.set(-3.95, 1.85, -0.35);
  } else if (scene === 'shop') {
    windowStreetBounceLight.position.set(-0.4, 2.15, 3.85);
  } else {
    windowStreetBounceLight.position.set(0, 2.25, 4.15);
  }
  group.add(windowStreetBounceLight);

  // Volumetric Floor Sunbeam Patches inside the room cast by the transparent windows
  const sunbeamMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#FEF3C7',
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  const sunbeamMeshes: THREE.Mesh[] = [];
  if (scene === 'bedroom') {
    const westBeam = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(2.35, 1.82)),
      sunbeamMat,
    );
    westBeam.rotation.x = -Math.PI / 2;
    westBeam.position.set(-2.05, 0.014, -0.35);
    group.add(westBeam);
    sunbeamMeshes.push(westBeam);

    const southBeam = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(1.18, 1.55)),
      sunbeamMat,
    );
    southBeam.rotation.x = -Math.PI / 2;
    southBeam.position.set(-0.62, 0.014, 1.85);
    group.add(southBeam);
    sunbeamMeshes.push(southBeam);
  } else if (scene === 'shop') {
    const shopBayBeam = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(2.65, 1.95)),
      sunbeamMat,
    );
    shopBayBeam.rotation.x = -Math.PI / 2;
    shopBayBeam.position.set(-1.45, 0.025, 1.75);
    group.add(shopBayBeam);
    sunbeamMeshes.push(shopBayBeam);
  } else {
    const garageDoorBeam = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(4.4, 2.35)),
      sunbeamMat,
    );
    garageDoorBeam.rotation.x = -Math.PI / 2;
    garageDoorBeam.position.set(0, 0.016, 2.15);
    group.add(garageDoorBeam);
    sunbeamMeshes.push(garageDoorBeam);
  }

  const updateAtFrame = (
    frame: number,
    fps: number,
    preset: ExteriorTimeOfDayPreset = 'golden-daylight',
    apertureOpen01 = 1,
  ) => {
    const tSec = Math.max(0, frame) / Math.max(1, fps);
    for (const c of allAnimatedCars) {
      const travel = ((tSec * c.speedMetersPerSec + c.phaseOffset) % 52) - 26;
      c.carGroup.position.set(
        c.direction === 1 ? travel : -travel,
        0.08,
        c.laneZ,
      );
    }

    const lightState = evaluateExteriorWindowLightingCoupling({
      scene,
      preset,
      apertureOpen01,
    });
    windowSunLight.color.set(lightState.sunColorHex);
    windowSunLight.intensity = lightState.sunIntensity;
    windowSkyHemiLight.color.set(lightState.skyHemiTopHex);
    windowSkyHemiLight.groundColor.set(lightState.skyHemiBottomHex);
    windowSkyHemiLight.intensity = lightState.skyHemiIntensity;
    windowStreetBounceLight.color.set(lightState.windowBounceColorHex);
    windowStreetBounceLight.intensity = lightState.windowBounceIntensity;
    sunbeamMat.opacity = lightState.sunbeamFloorOpacity;
    skyDomeMat.color.set(
      preset === 'golden-daylight'
        ? '#BAE6FD'
        : preset === 'twilight-city'
          ? '#312E81'
          : '#0F172A',
    );
  };

  const dispose = () => {
    for (const g of geometries) g.dispose();
    for (const m of materials) m.dispose();
    for (const t of textures) t.dispose();
  };

  return {
    group,
    windowSunLight,
    windowSkyHemiLight,
    windowStreetBounceLight,
    sunbeamMeshes,
    updateAtFrame,
    dispose,
  };
}

/**
 * Builds the 3D Recessed Interior Gateway Room Pocket embedded inside a Main Street
 * hero building directly behind a transparent window/door opening (`bedroom`, `shop`, or `garage`).
 *
 * When viewing Main Street from the outside, you can peer through the transparent glass
 * directly into the lit 3D room, and click the gateway to focus or step inside!
 */
export function buildMainStreetGatewayInteriorPocket(params: {
  targetScene: Exclude<ConnectedSceneId, 'main-street'>;
  grad3: THREE.DataTexture;
  grad4: THREE.DataTexture;
  inkLineMat: THREE.LineBasicMaterial;
  inkHullMat: THREE.MeshBasicMaterial;
  inkRegistry: THREE.Object3D[];
  disposableGeometries: THREE.BufferGeometry[];
  disposableMaterials: THREE.Material[];
}): THREE.Group {
  const {
    targetScene,
    grad3,
    grad4,
    inkLineMat,
    inkRegistry,
    disposableGeometries,
    disposableMaterials,
  } = params;

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposableGeometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposableMaterials.push(m);
    return m;
  };

  const pocketGroup = new THREE.Group();
  pocketGroup.name = `MainStreetGatewayPocket_${targetScene}`;

  if (targetScene === 'bedroom') {
    // 2nd Floor Bedroom Gateway Pocket behind the transparent window at (wx = 0, wy = hGround + 1.35, wz = 0.12)
    const roomW = 3.4;
    const roomH = 2.45;
    const roomD = 3.2;

    const wallMat = trackMat(
      new THREE.MeshToonMaterial({
        color: '#253146',
        gradientMap: grad3,
        side: THREE.BackSide,
      }),
    );
    const floorMat = trackMat(
      new THREE.MeshToonMaterial({color: '#5C3A21', gradientMap: grad3}),
    );
    const cyanGlowMat = trackMat(
      new THREE.MeshBasicMaterial({color: '#22D3EE'}),
    );
    const warmGlowMat = trackMat(
      new THREE.MeshBasicMaterial({color: '#FEF08A'}),
    );
    const sofaMat = trackMat(
      new THREE.MeshToonMaterial({color: '#3B82F6', gradientMap: grad4}),
    );
    const bedMat = trackMat(
      new THREE.MeshToonMaterial({color: '#6366F1', gradientMap: grad3}),
    );
    const woodMat = trackMat(
      new THREE.MeshToonMaterial({color: '#3E2417', gradientMap: grad3}),
    );

    const shell = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(roomW, roomH, roomD)),
      wallMat,
    );
    shell.position.set(0, 0.15, -roomD * 0.5);
    pocketGroup.add(shell);

    const floor = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(roomW - 0.06, 0.06, roomD - 0.06)),
      floorMat,
    );
    floor.position.set(0, -roomH * 0.5 + 0.18, -roomD * 0.5);
    pocketGroup.add(floor);

    // Desk + Glowing Dual Monitors + Smartphone on Stand (left/back of bedroom pocket)
    const desk = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.25, 0.08, 0.68)),
      woodMat,
    );
    desk.position.set(-0.78, -0.38, -2.15);
    const monitor = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.68, 0.42, 0.05)),
      cyanGlowMat,
    );
    monitor.position.set(-0.78, -0.02, -2.32);
    const phone = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.14, 0.26, 0.03)),
      cyanGlowMat,
    );
    phone.position.set(-0.32, -0.22, -2.02);
    pocketGroup.add(desk, monitor, phone);
    attachComicInkOutlineToMesh(desk, inkLineMat, inkRegistry);
    attachComicInkOutlineToMesh(monitor, inkLineMat, inkRegistry);

    // Platform Bed with Pillows & Indigo Duvet Blanket (right side of bedroom pocket)
    const bedBase = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.15, 0.34, 1.65)),
      bedMat,
    );
    bedBase.position.set(0.88, -0.58, -1.85);
    const pillow = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.85, 0.16, 0.38)),
      warmGlowMat,
    );
    pillow.position.set(0.88, -0.34, -2.42);
    pocketGroup.add(bedBase, pillow);
    attachComicInkOutlineToMesh(bedBase, inkLineMat, inkRegistry);

    // Plush Sofa + Wall-Mounted Live News TV
    const sofa = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.12, 0.48, 0.58)),
      sofaMat,
    );
    sofa.position.set(-0.65, -0.58, -1.05);
    const tvScreen = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.06, 0.56, 0.96)),
      trackMat(new THREE.MeshBasicMaterial({color: '#EF4444'})),
    );
    tvScreen.position.set(-1.62, 0.18, -1.25);
    pocketGroup.add(sofa, tvScreen);
    attachComicInkOutlineToMesh(sofa, inkLineMat, inkRegistry);
    attachComicInkOutlineToMesh(tvScreen, inkLineMat, inkRegistry);

    // Ceiling Brass Ring Chandelier + Interior Warm/Cyan Light
    const chandelier = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.36, 0.035, 8, 20)),
      warmGlowMat,
    );
    chandelier.rotation.x = Math.PI / 2;
    chandelier.position.set(0, 1.18, -1.45);
    pocketGroup.add(chandelier);

    const bedroomLight = new THREE.PointLight('#38BDF8', 3.6, 6.5, 1.2);
    bedroomLight.position.set(0, 0.45, -1.25);
    pocketGroup.add(bedroomLight);
  } else if (targetScene === 'shop') {
    // Ground-Floor Crack & Sons Shop Gateway Pocket behind the transparent display window & door
    const roomW = 6.2;
    const roomH = 3.2;
    const roomD = 4.2;

    const wallMat = trackMat(
      new THREE.MeshToonMaterial({
        color: '#7C2D12',
        gradientMap: grad3,
        side: THREE.BackSide,
      }),
    );
    const floorMat = trackMat(
      new THREE.MeshToonMaterial({color: '#9A6334', gradientMap: grad3}),
    );
    const velvetMat = trackMat(
      new THREE.MeshToonMaterial({color: '#DC2626', gradientMap: grad4}),
    );
    const goldMat = trackMat(
      new THREE.MeshToonMaterial({color: '#FACC15', gradientMap: grad4}),
    );
    const pineMat = trackMat(
      new THREE.MeshToonMaterial({color: '#15803D', gradientMap: grad3}),
    );
    const mahoganyMat = trackMat(
      new THREE.MeshToonMaterial({color: '#451A03', gradientMap: grad3}),
    );
    const warmBulbMat = trackMat(
      new THREE.MeshBasicMaterial({color: '#FEF08A'}),
    );

    const shell = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(roomW, roomH, roomD)),
      wallMat,
    );
    shell.position.set(-1.55, 2.05, -roomD * 0.5);
    pocketGroup.add(shell);

    const floor = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(roomW - 0.08, 0.08, roomD - 0.08)),
      floorMat,
    );
    floor.position.set(-1.55, 0.5, -roomD * 0.5);
    pocketGroup.add(floor);

    // Center Hero Nutcracker on Crimson Velvet Pedestal inside the shop window!
    const pedestal = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.45, 0.52, 0.78, 16)),
      velvetMat,
    );
    pedestal.position.set(-1.85, 0.92, -1.45);
    const heroNutBody = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.22, 0.24, 0.95, 12)),
      velvetMat,
    );
    heroNutBody.position.set(-1.85, 1.78, -1.45);
    const heroNutCrown = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.25, 0.22, 0.42, 12)),
      goldMat,
    );
    heroNutCrown.position.set(-1.85, 2.45, -1.45);
    pocketGroup.add(pedestal, heroNutBody, heroNutCrown);
    attachComicInkOutlineToMesh(pedestal, inkLineMat, inkRegistry);
    attachComicInkOutlineToMesh(heroNutBody, inkLineMat, inkRegistry);
    attachComicInkOutlineToMesh(heroNutCrown, inkLineMat, inkRegistry);

    // Mahogany Shopkeeper Counter & Brass Cash Register
    const counter = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(2.2, 0.92, 0.78)),
      mahoganyMat,
    );
    counter.position.set(-0.35, 0.98, -2.85);
    const register = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.44, 0.42, 0.36)),
      goldMat,
    );
    register.position.set(-0.15, 1.64, -2.85);
    pocketGroup.add(counter, register);
    attachComicInkOutlineToMesh(counter, inkLineMat, inkRegistry);
    attachComicInkOutlineToMesh(register, inkLineMat, inkRegistry);

    // Decorated Holiday Christmas Tree with Glowing Star Topper
    const treeCone = new THREE.Mesh(
      trackGeo(new THREE.ConeGeometry(0.78, 2.15, 12)),
      pineMat,
    );
    treeCone.position.set(-3.35, 1.62, -2.35);
    const starTop = new THREE.Mesh(
      trackGeo(new THREE.OctahedronGeometry(0.2, 0)),
      warmBulbMat,
    );
    starTop.position.set(-3.35, 2.78, -2.35);
    pocketGroup.add(treeCone, starTop);
    attachComicInkOutlineToMesh(treeCone, inkLineMat, inkRegistry);

    const shopLight = new THREE.PointLight('#FBBF24', 4.2, 8.0, 1.15);
    shopLight.position.set(-1.85, 2.85, -1.65);
    pocketGroup.add(shopLight);
  } else {
    // Ground-Floor Garage & Nuclear Launch Gateway Pocket behind the transparent bay window
    const roomW = 6.2;
    const roomH = 3.2;
    const roomD = 4.4;

    const cinderMat = trackMat(
      new THREE.MeshToonMaterial({
        color: '#334155',
        gradientMap: grad3,
        side: THREE.BackSide,
      }),
    );
    const concreteMat = trackMat(
      new THREE.MeshToonMaterial({color: '#475569', gradientMap: grad3}),
    );
    const hazardMat = trackMat(
      new THREE.MeshToonMaterial({color: '#FACC15', gradientMap: grad4}),
    );
    const redMat = trackMat(
      new THREE.MeshToonMaterial({color: '#DC2626', gradientMap: grad4}),
    );
    const nukeBodyMat = trackMat(
      new THREE.MeshToonMaterial({color: '#E2E8F0', gradientMap: grad4}),
    );
    const orangeGlowMat = trackMat(
      new THREE.MeshBasicMaterial({color: '#F97316'}),
    );

    const shell = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(roomW, roomH, roomD)),
      cinderMat,
    );
    shell.position.set(-1.55, 2.05, -roomD * 0.5);
    pocketGroup.add(shell);

    const floor = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(roomW - 0.08, 0.08, roomD - 0.08)),
      concreteMat,
    );
    floor.position.set(-1.55, 0.5, -roomD * 0.5);
    pocketGroup.add(floor);

    // Open Sub-Floor Nuclear Silo Hatch Doors + Emerging Cartoon Nuke Nose Cone & Fuselage!
    for (const side of [-1, 1]) {
      const hatchDoor = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.55, 0.08, 1.65)),
        hazardMat,
      );
      hatchDoor.position.set(-1.85 + side * 0.78, 0.68, -2.05);
      hatchDoor.rotation.z = side * -0.45;
      pocketGroup.add(hatchDoor);
      attachComicInkOutlineToMesh(hatchDoor, inkLineMat, inkRegistry);
    }

    const siloPitGlow = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.15, 0.06, 1.55)),
      orangeGlowMat,
    );
    siloPitGlow.position.set(-1.85, 0.55, -2.05);
    pocketGroup.add(siloPitGlow);

    const nukeBody = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.42, 0.42, 1.35, 16)),
      nukeBodyMat,
    );
    nukeBody.rotation.x = Math.PI / 4;
    nukeBody.position.set(-1.85, 1.45, -2.05);
    const nukeNose = new THREE.Mesh(
      trackGeo(new THREE.ConeGeometry(0.42, 0.68, 16)),
      redMat,
    );
    nukeNose.rotation.x = Math.PI / 4;
    nukeNose.position.set(-1.85, 2.05, -1.45);
    pocketGroup.add(nukeBody, nukeNose);
    attachComicInkOutlineToMesh(nukeBody, inkLineMat, inkRegistry);
    attachComicInkOutlineToMesh(nukeNose, inkLineMat, inkRegistry);

    // Mechanic Red Rolling Tool Cabinet & Overhead Industrial Reveal Lamps
    const toolCab = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.95, 1.35, 0.58)),
      redMat,
    );
    toolCab.position.set(-3.45, 1.22, -2.85);
    pocketGroup.add(toolCab);
    attachComicInkOutlineToMesh(toolCab, inkLineMat, inkRegistry);

    const garageLight = new THREE.PointLight('#F97316', 4.5, 8.0, 1.15);
    garageLight.position.set(-1.85, 2.65, -1.85);
    pocketGroup.add(garageLight);
  }

  return pocketGroup;
}
