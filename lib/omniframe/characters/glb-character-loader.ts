import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { continueRender, delayRender, staticFile } from 'remotion';
import {
  createMainStreetToonGradientTexture,
  createSmoothCharacterToonGradientTexture,
  MAIN_STREET_STYLE_SIGNATURE,
} from '../main-street-style-engine';
import {
  evaluateExpressionFaceState,
  evaluatePoseJointAngles,
  type CharacterExpressionId,
  type CharacterFacing,
  type CharacterId,
  type CharacterPoseId,
  type PedestrianArchetypeVariant,
} from './rig-utils';

export type GlbModelId =
  | 'game-boy-hero'
  | 'rigged-anime-girl-hero'
  | 'anime-girl-hero'
  | 'low-poly-man'
  | 'idle-male-loop'
  | 'casual-male-tpose'
  | 'basic-walk-female-loop'
  | 'nathan-walking-man'
  | 'police-man-rigged'
  | 'dog-glb'
  | 'pigeon-glb';

export type GlbSkeletonFamily =
  | 'reallusion-cc-base'
  | 'anime-girl-rigged'
  | 'blender-rigify'
  | 'max-biped'
  | 'renderpeople-nathan'
  | 'mixamo'
  | 'dog-rig'
  | 'pigeon-rig';

export interface GlbCharacterAssetEntry {
  modelId: GlbModelId;
  fileName: string;
  publicPath: string;
  fallbackPublicPaths?: readonly string[];
  title: string;
  assignedCharacterIds: readonly CharacterId[];
  skeletonFamily: GlbSkeletonFamily;
  jointCount: number;
  hasEmbeddedAnimation: boolean;
  embeddedClipName: string | null;
  targetHeightMeters: number;
  stripSkateboard?: boolean;
}

/**
 * Authoritative Manifest of all Rigged .glb Character & Animal Models in `/public/models/characters/`
 */
export const GLB_CHARACTER_ASSET_MANIFEST: readonly GlbCharacterAssetEntry[] = [
  {
    modelId: 'game-boy-hero',
    fileName: 'free_stylized_cartoon_game_boy_character_rigged.glb',
    publicPath: 'models/characters/free_stylized_cartoon_game_boy_character_rigged.glb',
    title: 'Main Guy — Stylized Cartoon Game Boy Character (195-Bone Rig, Skateboard Removed)',
    assignedCharacterIds: ['main-boy'],
    skeletonFamily: 'reallusion-cc-base',
    jointCount: 195,
    hasEmbeddedAnimation: false,
    embeddedClipName: null,
    targetHeightMeters: 1.66,
    stripSkateboard: true,
  },
  {
    modelId: 'rigged-anime-girl-hero',
    fileName: 'riiged_anime_girl_outfits__facial_expressions.glb',
    publicPath: 'models/characters/riiged_anime_girl_outfits__facial_expressions.glb',
    fallbackPublicPaths: [
      'riiged_anime_girl_outfits__facial_expressions.glb',
      'models/characters/anime_girl_character-1.glb',
    ],
    title: 'Main Girlfriend — Rigged Anime Girl (Outfits & Facial Expressions)',
    assignedCharacterIds: ['main-girl'],
    skeletonFamily: 'anime-girl-rigged',
    jointCount: 14,
    hasEmbeddedAnimation: false,
    embeddedClipName: null,
    targetHeightMeters: 1.63,
  },
  {
    modelId: 'anime-girl-hero',
    fileName: 'anime_girl_character-1.glb',
    publicPath: 'models/characters/anime_girl_character-1.glb',
    title: 'Anime Girl Character (Stylized Variant)',
    assignedCharacterIds: ['main-girl'],
    skeletonFamily: 'anime-girl-rigged',
    jointCount: 14,
    hasEmbeddedAnimation: false,
    embeddedClipName: null,
    targetHeightMeters: 1.63,
  },
  {
    modelId: 'low-poly-man',
    fileName: 'low_poly_man_-_rigged.glb',
    publicPath: 'models/characters/low_poly_man_-_rigged.glb',
    title: 'Hacker Friend — Low Poly Man Rigged (83-Bone Blender Metarig)',
    assignedCharacterIds: ['hacker-friend'],
    skeletonFamily: 'blender-rigify',
    jointCount: 83,
    hasEmbeddedAnimation: false,
    embeddedClipName: null,
    targetHeightMeters: 1.70,
  },
  {
    modelId: 'idle-male-loop',
    fileName: 'idle_1_male_free_animation_200_frames_loop.glb',
    publicPath: 'models/characters/idle_1_male_free_animation_200_frames_loop.glb',
    title: 'Hype Man — Idle Male Rigged Character (200-Frame Loop + 31-Bone Biped)',
    assignedCharacterIds: ['hype-man'],
    skeletonFamily: 'max-biped',
    jointCount: 31,
    hasEmbeddedAnimation: true,
    embeddedClipName: 'Take 001',
    targetHeightMeters: 1.74,
  },
  {
    modelId: 'casual-male-tpose',
    fileName: 'casual_lowpoly_male_rig_t-pose.glb',
    publicPath: 'models/characters/casual_lowpoly_male_rig_t-pose.glb',
    title: 'Squad Member A — Casual Low-Poly Male Rig (38-Bone Biped + Retargeted Clips)',
    assignedCharacterIds: ['squad-member-a'],
    skeletonFamily: 'max-biped',
    jointCount: 38,
    hasEmbeddedAnimation: false,
    embeddedClipName: null,
    targetHeightMeters: 1.72,
  },
  {
    modelId: 'basic-walk-female-loop',
    fileName: 'basic_walk_free_animation_30_frames_loop.glb',
    publicPath: 'models/characters/basic_walk_free_animation_30_frames_loop.glb',
    title: 'Squad Member B — Basic Walk Female Casual Rig (30-Frame Walk Loop + 31-Bone Biped)',
    assignedCharacterIds: ['squad-member-b'],
    skeletonFamily: 'max-biped',
    jointCount: 31,
    hasEmbeddedAnimation: true,
    embeddedClipName: 'Take 001',
    targetHeightMeters: 1.66,
  },
  {
    modelId: 'nathan-walking-man',
    fileName: 'nathan_animated_003_-_walking_3d_man.glb',
    publicPath: 'models/characters/nathan_animated_003_-_walking_3d_man.glb',
    title: 'Pedestrian Commuter — Nathan Animated 003 Walking 3D Man (89-Bone Rig)',
    assignedCharacterIds: ['pedestrian'],
    skeletonFamily: 'renderpeople-nathan',
    jointCount: 89,
    hasEmbeddedAnimation: true,
    embeddedClipName: 'Take 001',
    targetHeightMeters: 1.74,
  },
  {
    modelId: 'police-man-rigged',
    fileName: 'police_man_rigged.glb',
    publicPath: 'models/characters/police_man_rigged.glb',
    title: 'Patrol Officer / Jogger — Police Man Rigged (79-Bone Mixamo Rig)',
    assignedCharacterIds: ['pedestrian'],
    skeletonFamily: 'mixamo',
    jointCount: 79,
    hasEmbeddedAnimation: false,
    embeddedClipName: null,
    targetHeightMeters: 1.75,
  },
  {
    modelId: 'dog-glb',
    fileName: 'dog.glb',
    publicPath: 'models/characters/dog.glb',
    fallbackPublicPaths: ['dog.glb'],
    title: 'Male Dog — Rigged 3D Canine GLB Model (12-Bone Rig + Tail/Jaw/Run Clips)',
    assignedCharacterIds: ['male-dog'],
    skeletonFamily: 'dog-rig',
    jointCount: 12,
    hasEmbeddedAnimation: true,
    embeddedClipName: 'Take 001',
    targetHeightMeters: 0.62,
  },
  {
    modelId: 'pigeon-glb',
    fileName: 'pigeon.glb',
    publicPath: 'models/characters/pigeon.glb',
    fallbackPublicPaths: [
      'models/characters/peigon.glb',
      'pigeon.glb',
      'peigon.glb',
    ],
    title: 'City Pigeon — Rigged 3D Avian GLB Model (9-Bone Rig + Wing Flap Clip)',
    assignedCharacterIds: ['pigeon'],
    skeletonFamily: 'pigeon-rig',
    jointCount: 9,
    hasEmbeddedAnimation: true,
    embeddedClipName: 'Take 001',
    targetHeightMeters: 0.34,
  },
] as const;

export function getGlbAssetEntryForCharacter(
  characterId: CharacterId,
  options?: {
    pose?: CharacterPoseId;
    archetype?: PedestrianArchetypeVariant;
    modelIdOverride?: GlbModelId;
  },
): GlbCharacterAssetEntry | null {
  if (options?.modelIdOverride) {
    return (
      GLB_CHARACTER_ASSET_MANIFEST.find(
        (e) => e.modelId === options.modelIdOverride,
      ) ?? null
    );
  }
  if (characterId === 'main-boy') {
    return (
      GLB_CHARACTER_ASSET_MANIFEST.find((e) => e.modelId === 'game-boy-hero') ??
      null
    );
  }
  if (characterId === 'main-girl') {
    return (
      GLB_CHARACTER_ASSET_MANIFEST.find(
        (e) => e.modelId === 'rigged-anime-girl-hero',
      ) ?? null
    );
  }
  if (characterId === 'hacker-friend') {
    return (
      GLB_CHARACTER_ASSET_MANIFEST.find((e) => e.modelId === 'low-poly-man') ??
      null
    );
  }
  if (characterId === 'hype-man') {
    return (
      GLB_CHARACTER_ASSET_MANIFEST.find((e) => e.modelId === 'idle-male-loop') ??
      null
    );
  }
  if (characterId === 'squad-member-a') {
    return (
      GLB_CHARACTER_ASSET_MANIFEST.find(
        (e) => e.modelId === 'casual-male-tpose',
      ) ?? null
    );
  }
  if (characterId === 'squad-member-b') {
    return (
      GLB_CHARACTER_ASSET_MANIFEST.find(
        (e) => e.modelId === 'basic-walk-female-loop',
      ) ?? null
    );
  }
  if (characterId === 'pedestrian') {
    if (options?.archetype === 'shop-cashier') {
      return (
        GLB_CHARACTER_ASSET_MANIFEST.find(
          (e) => e.modelId === 'idle-male-loop',
        ) ?? null
      );
    }
    if (options?.archetype === 'casual-shopper') {
      return (
        GLB_CHARACTER_ASSET_MANIFEST.find(
          (e) => e.modelId === 'basic-walk-female-loop',
        ) ?? null
      );
    }
    if (options?.archetype === 'jogger-hoodie') {
      return (
        GLB_CHARACTER_ASSET_MANIFEST.find(
          (e) => e.modelId === 'police-man-rigged',
        ) ?? null
      );
    }
    if (options?.archetype === 'elder-coat') {
      return (
        GLB_CHARACTER_ASSET_MANIFEST.find((e) => e.modelId === 'low-poly-man') ??
        null
      );
    }
    return (
      GLB_CHARACTER_ASSET_MANIFEST.find(
        (e) => e.modelId === 'nathan-walking-man',
      ) ?? null
    );
  }
  if (characterId === 'male-dog') {
    return (
      GLB_CHARACTER_ASSET_MANIFEST.find((e) => e.modelId === 'dog-glb') ?? null
    );
  }
  if (characterId === 'pigeon') {
    return (
      GLB_CHARACTER_ASSET_MANIFEST.find((e) => e.modelId === 'pigeon-glb') ??
      null
    );
  }
  return null;
}

/**
 * Resolves the primary and fallback URLs for a GLB asset in `/public/models/characters/`
 * using Remotion's `staticFile()` when in browser/Remotion context.
 */
export function resolveGlbPublicUrl(entry: GlbCharacterAssetEntry): string {
  try {
    return staticFile(entry.publicPath);
  } catch {
    return `/${entry.publicPath}`;
  }
}

function resolveCandidateUrls(entry: GlbCharacterAssetEntry): string[] {
  const paths = [entry.publicPath, ...(entry.fallbackPublicPaths ?? [])];
  const urls: string[] = [];
  for (const p of paths) {
    try {
      urls.push(staticFile(p));
    } catch {
      // ignore
    }
    urls.push(`/${p}`);
    urls.push(`/public/${p}`);
  }
  return Array.from(new Set(urls));
}

/**
 * Removes the skateboard (`Skate_Board`, `Skate_Board_Material_#185_0`, `Skate_Board_Material_#197_0`)
 * from `free_stylized_cartoon_game_boy_character_rigged.glb` so the Main Boy has NO skateboard
 * and his shoes become the lowest point of his bounding box (`y = 0`).
 */
export function stripSkateboardFromGameBoyGlb(root: THREE.Object3D): number {
  const toRemove: THREE.Object3D[] = [];
  root.traverse((obj) => {
    const nameLower = (obj.name || '').toLowerCase();
    const mat = (obj as THREE.Mesh).material;
    const matNameLower = Array.isArray(mat)
      ? mat.map((m) => m.name || '').join(' ').toLowerCase()
      : ((mat as THREE.Material | undefined)?.name || '').toLowerCase();

    if (
      nameLower.includes('skate') ||
      nameLower.includes('board') ||
      matNameLower.includes('material_185') ||
      matNameLower.includes('material_197')
    ) {
      toRemove.push(obj);
    }
  });

  for (const node of toRemove) {
    node.visible = false;
    node.parent?.remove(node);
  }
  return toRemove.length;
}

/**
 * Automatically rigs a static humanoid GLTF scene (such as `riiged_anime_girl_outfits__facial_expressions.glb`
 * / `anime_girl_character-1.glb`) into an articulated `THREE.SkinnedMesh` bound to a 12-bone humanoid
 * `THREE.Skeleton` (`AG_Root`, `AG_Hips`, `AG_Spine`, `AG_Neck`, `AG_Head`, `AG_LeftArm`, `AG_LeftForeArm`,
 * `AG_RightArm`, `AG_RightForeArm`, `AG_LeftUpLeg`, `AG_LeftLeg`, `AG_RightUpLeg`, `AG_RightLeg`).
 *
 * If the GLTF already contains `SkinnedMesh` bones, this function is a no-op.
 */
export function ensureAnimeGirlRiggedWithOutfitsAndExpressions(
  gltfScene: THREE.Object3D,
): void {
  if (gltfScene.userData.__animeGirlAutoRigged) return;

  let existingBoneCount = 0;
  const staticMeshes: THREE.Mesh[] = [];
  gltfScene.traverse((obj) => {
    if ((obj as THREE.Bone).isBone) {
      existingBoneCount++;
    } else if (
      (obj as THREE.Mesh).isMesh &&
      !(obj as THREE.SkinnedMesh).isSkinnedMesh
    ) {
      staticMeshes.push(obj as THREE.Mesh);
    }
  });

  if (existingBoneCount > 0 || staticMeshes.length === 0) {
    gltfScene.userData.__animeGirlAutoRigged = true;
    return;
  }

  // Create 12-bone humanoid skeleton in the local coordinate space of the anime girl meshes
  // (Y in [-0.95, +0.95], X in [-0.34, +0.34], Z in [-0.21, +0.21])
  const bHips = new THREE.Bone();
  bHips.name = 'AG_Hips';
  bHips.position.set(0, -0.15, 0);

  const bSpine = new THREE.Bone();
  bSpine.name = 'AG_Spine';
  bSpine.position.set(0, 0.35, 0); // world Y = +0.20
  bHips.add(bSpine);

  const bNeck = new THREE.Bone();
  bNeck.name = 'AG_Neck';
  bNeck.position.set(0, 0.34, 0); // world Y = +0.54
  bSpine.add(bNeck);

  const bHead = new THREE.Bone();
  bHead.name = 'AG_Head';
  bHead.position.set(0, 0.08, 0); // world Y = +0.62
  bNeck.add(bHead);

  const bLeftArm = new THREE.Bone();
  bLeftArm.name = 'AG_LeftArm';
  bLeftArm.position.set(0.16, 0.26, 0); // world Y = +0.46, X = +0.16
  bSpine.add(bLeftArm);

  const bLeftForeArm = new THREE.Bone();
  bLeftForeArm.name = 'AG_LeftForeArm';
  bLeftForeArm.position.set(0.06, -0.26, 0); // world Y = +0.20, X = +0.22
  bLeftArm.add(bLeftForeArm);

  const bRightArm = new THREE.Bone();
  bRightArm.name = 'AG_RightArm';
  bRightArm.position.set(-0.16, 0.26, 0); // world Y = +0.46, X = -0.16
  bSpine.add(bRightArm);

  const bRightForeArm = new THREE.Bone();
  bRightForeArm.name = 'AG_RightForeArm';
  bRightForeArm.position.set(-0.06, -0.26, 0); // world Y = +0.20, X = -0.22
  bRightArm.add(bRightForeArm);

  const bLeftUpLeg = new THREE.Bone();
  bLeftUpLeg.name = 'AG_LeftUpLeg';
  bLeftUpLeg.position.set(0.095, -0.05, 0); // world Y = -0.20, X = +0.095
  bHips.add(bLeftUpLeg);

  const bLeftLeg = new THREE.Bone();
  bLeftLeg.name = 'AG_LeftLeg';
  bLeftLeg.position.set(0, -0.36, 0); // world Y = -0.56
  bLeftUpLeg.add(bLeftLeg);

  const bRightUpLeg = new THREE.Bone();
  bRightUpLeg.name = 'AG_RightUpLeg';
  bRightUpLeg.position.set(-0.095, -0.05, 0); // world Y = -0.20, X = -0.095
  bHips.add(bRightUpLeg);

  const bRightLeg = new THREE.Bone();
  bRightLeg.name = 'AG_RightLeg';
  bRightLeg.position.set(0, -0.36, 0); // world Y = -0.56
  bRightUpLeg.add(bRightLeg);

  // Bone indices:
  // 0: Hips, 1: Spine, 2: Neck, 3: Head,
  // 4: LeftArm, 5: LeftForeArm, 6: RightArm, 7: RightForeArm,
  // 8: LeftUpLeg, 9: LeftLeg, 10: RightUpLeg, 11: RightLeg
  const bones: THREE.Bone[] = [
    bHips,
    bSpine,
    bNeck,
    bHead,
    bLeftArm,
    bLeftForeArm,
    bRightArm,
    bRightForeArm,
    bLeftUpLeg,
    bLeftLeg,
    bRightUpLeg,
    bRightLeg,
  ];

  const parentContainer = staticMeshes[0].parent ?? gltfScene;
  parentContainer.add(bHips);
  parentContainer.updateMatrixWorld(true);

  const skeleton = new THREE.Skeleton(bones);

  for (const mesh of staticMeshes) {
    const geom = mesh.geometry;
    const posAttr = geom.attributes.position;
    if (!posAttr) continue;

    const vertCount = posAttr.count;
    const skinIndices = new Uint16Array(vertCount * 4);
    const skinWeights = new Float32Array(vertCount * 4);

    for (let i = 0; i < vertCount; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);

      let b0 = 1; // Spine default
      let w0 = 1.0;
      let b1 = 0;
      let w1 = 0.0;

      if (y >= 0.58) {
        // Head & Hair
        b0 = 3;
        b1 = 2;
        w0 = Math.min(1, Math.max(0, (y - 0.54) / 0.1));
        w1 = 1 - w0;
      } else if (y >= 0.50) {
        // Neck transition
        b0 = 2;
        b1 = 1;
        w0 = (y - 0.50) / 0.08;
        w1 = 1 - w0;
      } else if (y >= 0.08 && Math.abs(x) > 0.195) {
        // Arms & Hands (above skirt flare y >= 0.08 and outside torso cylinder |x| > 0.195)
        const isLeft = x > 0;
        const armIdx = isLeft ? 4 : 6;
        const foreIdx = isLeft ? 5 : 7;
        if (y >= 0.24) {
          b0 = armIdx;
          b1 = 1; // blend smoothly with spine near shoulder
          const shoulderBlend = Math.min(1, Math.max(0, (Math.abs(x) - 0.195) / 0.055));
          w0 = shoulderBlend;
          w1 = 1 - shoulderBlend;
        } else {
          b0 = foreIdx;
          b1 = armIdx;
          w0 = Math.min(1, Math.max(0, (0.26 - y) / 0.1));
          w1 = 1 - w0;
        }
      } else if (y < -0.18) {
        // Legs & Boots
        const isLeft = x >= 0;
        const upLegIdx = isLeft ? 8 : 10;
        const lowLegIdx = isLeft ? 9 : 11;
        if (y >= -0.54) {
          b0 = upLegIdx;
          b1 = 0; // blend with Hips near top of skirt/pelvis
          w0 = Math.min(1, Math.max(0, (-0.18 - y) / 0.12));
          w1 = 1 - w0;
        } else {
          b0 = lowLegIdx;
          b1 = upLegIdx;
          w0 = Math.min(1, Math.max(0, (-0.50 - y) / 0.12));
          w1 = 1 - w0;
        }
      } else {
        // Torso & Pelvis
        b0 = 1;
        b1 = 0;
        w0 = Math.min(1, Math.max(0, (y + 0.18) / 0.35));
        w1 = 1 - w0;
      }

      const idx4 = i * 4;
      skinIndices[idx4] = b0;
      skinIndices[idx4 + 1] = b1;
      skinIndices[idx4 + 2] = 0;
      skinIndices[idx4 + 3] = 0;

      skinWeights[idx4] = w0;
      skinWeights[idx4 + 1] = w1;
      skinWeights[idx4 + 2] = 0;
      skinWeights[idx4 + 3] = 0;
    }

    geom.setAttribute('skinIndex', new THREE.BufferAttribute(skinIndices, 4));
    geom.setAttribute('skinWeight', new THREE.BufferAttribute(skinWeights, 4));

    const skinned = new THREE.SkinnedMesh(geom, mesh.material);
    skinned.name = mesh.name || 'AG_SkinnedMesh';
    skinned.position.copy(mesh.position);
    skinned.quaternion.copy(mesh.quaternion);
    skinned.scale.copy(mesh.scale);
    skinned.castShadow = true;
    skinned.receiveShadow = true;
    skinned.frustumCulled = false;

    const meshParent = mesh.parent ?? parentContainer;
    meshParent.add(skinned);
    meshParent.remove(mesh);
    skinned.bind(skeleton, skinned.matrixWorld);
  }

  gltfScene.userData.__animeGirlAutoRigged = true;
}

// Global in-memory cache of parsed GLTF templates so each .glb is fetched & parsed at most once
const gltfCache = new Map<GlbModelId, GLTF>();
const gltfLoadingPromises = new Map<GlbModelId, Promise<GLTF>>();
const glbMountListeners = new Set<() => void>();

export function subscribeToGlbCharacterMounts(listener: () => void): () => void {
  glbMountListeners.add(listener);
  return () => {
    glbMountListeners.delete(listener);
  };
}

let activeInflightGlbCount = 0;
let glbMountDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export function notifyGlbCharacterMounted(): void {
  if (glbMountDebounceTimer !== null) {
    clearTimeout(glbMountDebounceTimer);
  }
  glbMountDebounceTimer = setTimeout(() => {
    glbMountDebounceTimer = null;
    if (activeInflightGlbCount > 0) {
      notifyGlbCharacterMounted();
      return;
    }
    for (const listener of glbMountListeners) {
      try {
        listener();
      } catch {
        // ignore
      }
    }
  }, 80);
}

let sharedGltfLoader: GLTFLoader | null = null;
function getGltfLoader(): GLTFLoader {
  if (!sharedGltfLoader) {
    sharedGltfLoader = new GLTFLoader();
  }
  return sharedGltfLoader;
}

let cachedIsSoftwareWebGl: boolean | null = null;
function getCachedIsSoftwareWebGl(): boolean {
  if (cachedIsSoftwareWebGl !== null) return cachedIsSoftwareWebGl;
  if (typeof document === 'undefined') return false;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) {
      cachedIsSoftwareWebGl = true;
      return true;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cachedIsSoftwareWebGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(
      gpu,
    );
    return cachedIsSoftwareWebGl;
  } catch {
    cachedIsSoftwareWebGl = false;
    return false;
  }
}

/**
 * Loads and caches a GLTF asset by `modelId`. Coordinates with Remotion's `delayRender` / `continueRender`
 * when running in a browser so Remotion never captures a frame with unloaded GLB characters.
 */
export function loadCachedGlbAsset(modelId: GlbModelId): Promise<GLTF> {
  const existing = gltfCache.get(modelId);
  if (existing) {
    return Promise.resolve(existing);
  }
  const inflight = gltfLoadingPromises.get(modelId);
  if (inflight) {
    return inflight;
  }

  const entry = GLB_CHARACTER_ASSET_MANIFEST.find((e) => e.modelId === modelId);
  if (!entry) {
    return Promise.reject(new Error(`Unknown GLB modelId: ${modelId}`));
  }

  activeInflightGlbCount++;

  let delayHandle: number | null = null;
  if (typeof window !== 'undefined') {
    try {
      delayHandle = delayRender(`Loading GLB character model: ${entry.fileName}`, {
        timeoutInMilliseconds: 28000,
      });
    } catch {
      delayHandle = null;
    }
  }

  const candidateUrls = resolveCandidateUrls(entry);
  const loader = getGltfLoader();

  const tryLoadIndex = (idx: number): Promise<GLTF> => {
    const url = candidateUrls[idx];
    return new Promise<GLTF>((resolve, reject) => {
      loader.load(
        url,
        (gltf) => resolve(gltf),
        undefined,
        (err) => {
          if (idx + 1 < candidateUrls.length) {
            tryLoadIndex(idx + 1).then(resolve, reject);
          } else {
            reject(err);
          }
        },
      );
    });
  };

  const promise = tryLoadIndex(0)
    .then((gltf) => {
      activeInflightGlbCount = Math.max(0, activeInflightGlbCount - 1);
      if (entry.stripSkateboard) {
        stripSkateboardFromGameBoyGlb(gltf.scene);
      }
      if (entry.skeletonFamily === 'anime-girl-rigged') {
        ensureAnimeGirlRiggedWithOutfitsAndExpressions(gltf.scene);
      }
      gltfCache.set(modelId, gltf);
      if (delayHandle !== null) {
        try {
          continueRender(delayHandle);
        } catch {
          // ignore
        }
      }
      return gltf;
    })
    .catch((err) => {
      activeInflightGlbCount = Math.max(0, activeInflightGlbCount - 1);
      if (delayHandle !== null) {
        try {
          continueRender(delayHandle);
        } catch {
          // ignore
        }
      }
      throw err;
    });

  gltfLoadingPromises.set(modelId, promise);
  return promise;
}

/**
 * Preloads all .glb character & animal models in parallel.
 */
export function preloadAllGlbCharacterModels(): Promise<GLTF[]> {
  return Promise.all(
    GLB_CHARACTER_ASSET_MANIFEST.map((entry) =>
      loadCachedGlbAsset(entry.modelId),
    ),
  );
}

let sharedCharacterToonGradientTex: THREE.DataTexture | null = null;
function getSharedCharacterToonGradientTexture(): THREE.DataTexture {
  if (!sharedCharacterToonGradientTex) {
    sharedCharacterToonGradientTex = createSmoothCharacterToonGradientTexture();
  }
  return sharedCharacterToonGradientTex;
}

/**
 * Applies the Main Street Cel-Shaded Toon + Comic Ink Outline style to an imported GLB scene graph!
 */
export function applyMainStreetStyleToGlbModel(
  modelRoot: THREE.Object3D,
  options?: {
    tintColorHex?: string;
    tintStrength?: number;
    inkOutlineColor?: string;
    enableSkinnedInkHull?: boolean;
  },
): {
  convertedMaterials: THREE.Material[];
  outlineMeshes: THREE.Object3D[];
  disposeStyle: () => void;
} {
  const charGrad = getSharedCharacterToonGradientTexture();
  const inkColor =
    options?.inkOutlineColor ?? MAIN_STREET_STYLE_SIGNATURE.inkOutlineColor;
  const enableHull = options?.enableSkinnedInkHull ?? true;

  const convertedMaterials: THREE.Material[] = [];
  const outlineMeshes: THREE.Object3D[] = [];
  const matCache = new Map<string, THREE.Material>();

  const inkHullMat = new THREE.MeshBasicMaterial({
    color: inkColor,
    side: THREE.BackSide,
  });
  convertedMaterials.push(inkHullMat);

  const meshes: THREE.Mesh[] = [];
  modelRoot.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      const m = node as THREE.Mesh;
      if (m.userData.__isMainStreetInkOutline) return;
      meshes.push(m);
    }
  });

  const convertMat = (srcMat: THREE.Material): THREE.Material => {
    const cached = matCache.get(srcMat.uuid);
    if (cached) return cached;

    const anyMat = srcMat as THREE.MeshStandardMaterial & {
      map?: THREE.Texture | null;
      normalMap?: THREE.Texture | null;
      emissiveMap?: THREE.Texture | null;
      alphaMap?: THREE.Texture | null;
    };

    const baseColor = anyMat.color
      ? anyMat.color.clone()
      : new THREE.Color('#FFFFFF');
    if (options?.tintColorHex && (options.tintStrength ?? 0) > 0) {
      baseColor.lerp(
        new THREE.Color(options.tintColorHex),
        options.tintStrength ?? 0.22,
      );
    }

    if (anyMat.map) {
      anyMat.map.colorSpace = THREE.SRGBColorSpace;
      anyMat.map.needsUpdate = true;
    }

    const toonMat = new THREE.MeshToonMaterial({
      color: baseColor,
      map: anyMat.map ?? null,
      gradientMap: charGrad,
      normalMap: anyMat.normalMap ?? null,
      emissive: anyMat.emissive
        ? anyMat.emissive.clone()
        : new THREE.Color('#000000'),
      emissiveMap: anyMat.emissiveMap ?? null,
      emissiveIntensity: anyMat.emissiveIntensity ?? 0,
      alphaMap: anyMat.alphaMap ?? null,
      transparent: Boolean(srcMat.transparent),
      opacity: srcMat.opacity ?? 1.0,
      alphaTest: srcMat.alphaTest ?? 0,
      side: srcMat.side ?? THREE.FrontSide,
      depthWrite: srcMat.depthWrite ?? true,
      vertexColors: Boolean(srcMat.vertexColors),
    });

    toonMat.name = `${srcMat.name || 'glb-mat'}-cel-toon`;
    matCache.set(srcMat.uuid, toonMat);
    convertedMaterials.push(toonMat);
    return toonMat;
  };

  const isSoftwareWebGl = getCachedIsSoftwareWebGl();

  for (const mesh of meshes) {
    mesh.userData.__isSmoothCharacterMesh = true;
    mesh.userData.__skipMainStreetEdges = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (mesh.geometry && !mesh.geometry.attributes.normal) {
      mesh.geometry.computeVertexNormals();
    }

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map(convertMat);
    } else if (mesh.material) {
      mesh.material = convertMat(mesh.material);
    }

    const primaryMat = Array.isArray(mesh.material)
      ? mesh.material[0]
      : mesh.material;
    const isTransparent = Boolean(
      primaryMat?.transparent && (primaryMat.opacity ?? 1) < 0.85,
    );

    if (
      enableHull &&
      !isSoftwareWebGl &&
      meshes.length <= 4 &&
      !isTransparent &&
      !mesh.name.toLowerCase().includes('eyelash') &&
      !mesh.name.toLowerCase().includes('eye') &&
      mesh.parent
    ) {
      if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) {
        const skinned = mesh as THREE.SkinnedMesh;
        if (skinned.skeleton) {
          const hullSkinned = new THREE.SkinnedMesh(
            skinned.geometry,
            inkHullMat,
          );
          hullSkinned.name = `${skinned.name}-ink-hull`;
          hullSkinned.userData.__isMainStreetInkOutline = true;
          hullSkinned.userData.__isMainStreetInkHull = true;
          hullSkinned.bind(skinned.skeleton, skinned.bindMatrix);
          hullSkinned.frustumCulled = false;
          hullSkinned.scale.copy(skinned.scale).multiplyScalar(1.012);
          hullSkinned.position.copy(skinned.position);
          hullSkinned.quaternion.copy(skinned.quaternion);
          skinned.parent?.add(hullSkinned);
          outlineMeshes.push(hullSkinned);
        }
      }
    }
  }

  return {
    convertedMaterials,
    outlineMeshes,
    disposeStyle: () => {
      for (const m of convertedMaterials) m.dispose();
    },
  };
}

const rawGlbBoundsCache = new Map<
  string,
  { rawSize: THREE.Vector3; rawCenter: THREE.Vector3; minY: number }
>();

/**
 * Normalizes a cloned GLB scene so its height matches `targetHeightMeters`,
 * its horizontal center sits at `(x=0, z=0)`, and its feet/paws rest flush on `y=0`.
 */
export function normalizeAndGroundGlbScene(
  clonedScene: THREE.Object3D,
  targetHeightMeters = 1.7,
  cacheKey?: string,
): {
  wrapperGroup: THREE.Group;
  scaleFactor: number;
  normalizedHeight: number;
} {
  const wrapperGroup = new THREE.Group();
  wrapperGroup.name = 'glb-normalized-wrapper';

  let cached = cacheKey ? rawGlbBoundsCache.get(cacheKey) : undefined;
  if (!cached) {
    clonedScene.updateMatrixWorld(true);
    const rawBox = new THREE.Box3().setFromObject(clonedScene);
    const rawSize = rawBox.getSize(new THREE.Vector3());
    const rawCenter = rawBox.getCenter(new THREE.Vector3());
    cached = { rawSize, rawCenter, minY: rawBox.min.y };
    if (cacheKey) {
      rawGlbBoundsCache.set(cacheKey, cached);
    }
  }

  const safeRawHeight = Math.max(0.001, cached.rawSize.y);
  const scaleFactor = targetHeightMeters / safeRawHeight;

  clonedScene.scale.multiplyScalar(scaleFactor);
  clonedScene.position.set(
    -cached.rawCenter.x * scaleFactor,
    -cached.minY * scaleFactor,
    -cached.rawCenter.z * scaleFactor,
  );
  clonedScene.updateMatrixWorld(true);

  wrapperGroup.add(clonedScene);
  return {
    wrapperGroup,
    scaleFactor,
    normalizedHeight: targetHeightMeters,
  };
}

/**
 * Retargets a Biped AnimationClip onto another Biped skeleton whose bone suffix numbers differ.
 */
export function retargetBipedAnimationClip(
  sourceClip: THREE.AnimationClip,
  targetRoot: THREE.Object3D,
  newName: string,
): THREE.AnimationClip {
  const boneMapByBase = new Map<string, string>();
  targetRoot.traverse((obj) => {
    if ((obj as THREE.Bone).isBone || obj.name.startsWith('bip_')) {
      const baseKey = obj.name.replace(/_0\d+$/, '');
      boneMapByBase.set(baseKey, obj.name);
    }
  });

  const remappedTracks: THREE.KeyframeTrack[] = [];
  for (const track of sourceClip.tracks) {
    const dotIdx = track.name.indexOf('.');
    if (dotIdx === -1) continue;
    const nodeName = track.name.slice(0, dotIdx);
    const propName = track.name.slice(dotIdx + 1);
    if (propName === 'position' && !nodeName.includes('Pelvis')) {
      continue;
    }
    const baseKey = nodeName.replace(/_0\d+$/, '');
    const targetBoneName = boneMapByBase.get(baseKey);
    if (targetBoneName) {
      const clonedTrack = track.clone();
      clonedTrack.name = `${targetBoneName}.${propName}`;
      remappedTracks.push(clonedTrack);
    }
  }

  return new THREE.AnimationClip(newName, sourceClip.duration, remappedTracks);
}

export interface GlbBoneMap {
  head?: THREE.Object3D;
  neck?: THREE.Object3D;
  spine?: THREE.Object3D;
  hips?: THREE.Object3D;
  leftArm?: THREE.Object3D;
  leftForeArm?: THREE.Object3D;
  leftHand?: THREE.Object3D;
  rightArm?: THREE.Object3D;
  rightForeArm?: THREE.Object3D;
  rightHand?: THREE.Object3D;
  leftUpLeg?: THREE.Object3D;
  leftLeg?: THREE.Object3D;
  rightUpLeg?: THREE.Object3D;
  rightLeg?: THREE.Object3D;
  // Animal-specific bones (Dog & Pigeon)
  jaw?: THREE.Object3D;
  tail?: THREE.Object3D;
  earL?: THREE.Object3D;
  earR?: THREE.Object3D;
  wingL?: THREE.Object3D;
  wingR?: THREE.Object3D;
  dogLegFL?: THREE.Object3D;
  dogLegFR?: THREE.Object3D;
  dogLegBL?: THREE.Object3D;
  dogLegBR?: THREE.Object3D;
}

/**
 * Discovers the primary limb, torso, and animal bones across all skeleton families
 * and snapshots each bone's rest quaternion (`__restQuat`) for deterministic articulation.
 */
export function extractAndSnapshotGlbBones(root: THREE.Object3D): GlbBoneMap {
  const bones: GlbBoneMap = {};

  root.traverse((obj) => {
    if (!obj.userData.__restQuat) {
      obj.userData.__restQuat = obj.quaternion.clone();
    }
    const n = obj.name;
    // Head
    if (
      !bones.head &&
      (n === 'CC_Base_Head_08' ||
        n === 'AG_Head' ||
        n === 'bip_Head_06' ||
        n === 'mixamorigHead_06' ||
        n === 'spine006_07' ||
        n === 'rp_nathan_animated_003_walking_head_07' ||
        n === 'Dog_Head' ||
        n === 'Pigeon_Head')
    ) {
      bones.head = obj;
    }
    // Neck
    if (
      !bones.neck &&
      (n === 'CC_Base_NeckTwist01_06' ||
        n === 'AG_Neck' ||
        n === 'bip_Neck_05' ||
        n === 'mixamorigNeck_05' ||
        n === 'spine004_05' ||
        n === 'rp_nathan_animated_003_walking_neck_06' ||
        n === 'Dog_Neck' ||
        n === 'Pigeon_Neck')
    ) {
      bones.neck = obj;
    }
    // Spine / Body
    if (
      !bones.spine &&
      (n === 'CC_Base_Spine02_05' ||
        n === 'AG_Spine' ||
        n === 'bip_Spine1_04' ||
        n === 'mixamorigSpine1_03' ||
        n === 'spine002_03' ||
        n === 'rp_nathan_animated_003_walking_spine_02_04' ||
        n === 'Dog_Spine' ||
        n === 'Pigeon_Body')
    ) {
      bones.spine = obj;
    }
    // Hips / Pelvis
    if (
      !bones.hips &&
      (n === 'AG_Hips' || n === 'Dog_Pelvis' || n === 'Pigeon_Root')
    ) {
      bones.hips = obj;
    }
    // Left Arm
    if (
      !bones.leftArm &&
      (n === 'CC_Base_L_Upperarm_019' ||
        n === 'AG_LeftArm' ||
        n.startsWith('bip_L_UpperArm_') ||
        n === 'mixamorigLeftArm_09' ||
        n === 'upper_armL_09' ||
        n === 'rp_nathan_animated_003_walking_upperarm_l_024')
    ) {
      bones.leftArm = obj;
    }
    // Left Forearm
    if (
      !bones.leftForeArm &&
      (n === 'CC_Base_L_Forearm_020' ||
        n === 'AG_LeftForeArm' ||
        n.startsWith('bip_L_Forearm_') ||
        n === 'mixamorigLeftForeArm_010' ||
        n === 'forearmL_010' ||
        n === 'rp_nathan_animated_003_walking_lowerarm_l_025')
    ) {
      bones.leftForeArm = obj;
    }
    // Right Arm
    if (
      !bones.rightArm &&
      (n === 'CC_Base_R_Upperarm_047' ||
        n === 'AG_RightArm' ||
        n.startsWith('bip_R_UpperArm_') ||
        n === 'mixamorigRightArm_033' ||
        n === 'upper_armR_032' ||
        n === 'rp_nathan_animated_003_walking_upperarm_r_049')
    ) {
      bones.rightArm = obj;
    }
    // Right Forearm
    if (
      !bones.rightForeArm &&
      (n === 'CC_Base_R_Forearm_048' ||
        n === 'AG_RightForeArm' ||
        n.startsWith('bip_R_Forearm_') ||
        n === 'mixamorigRightForeArm_034' ||
        n === 'forearmR_033' ||
        n === 'rp_nathan_animated_003_walking_lowerarm_r_050')
    ) {
      bones.rightForeArm = obj;
    }
    // Left Thigh / UpLeg
    if (
      !bones.leftUpLeg &&
      (n === 'CC_Base_L_Thigh_071' ||
        n === 'AG_LeftUpLeg' ||
        n.startsWith('bip_L_Thigh_') ||
        n === 'mixamorigLeftUpLeg_055' ||
        n === 'thighL_055' ||
        n === 'rp_nathan_animated_003_walking_upperleg_l_074')
    ) {
      bones.leftUpLeg = obj;
    }
    // Left Calf / Leg
    if (
      !bones.leftLeg &&
      (n === 'CC_Base_L_Calf_072' ||
        n === 'AG_LeftLeg' ||
        n.startsWith('bip_L_Calf_') ||
        n === 'mixamorigLeftLeg_056' ||
        n === 'shinL_056' ||
        n === 'rp_nathan_animated_003_walking_lowerleg_l_075')
    ) {
      bones.leftLeg = obj;
    }
    // Right Thigh / UpLeg
    if (
      !bones.rightUpLeg &&
      (n === 'CC_Base_R_Thigh_086' ||
        n === 'AG_RightUpLeg' ||
        n.startsWith('bip_R_Thigh_') ||
        n === 'mixamorigRightUpLeg_060' ||
        n === 'thighR_060' ||
        n === 'rp_nathan_animated_003_walking_upperleg_r_081')
    ) {
      bones.rightUpLeg = obj;
    }
    // Right Calf / Leg
    if (
      !bones.rightLeg &&
      (n === 'CC_Base_R_Calf_087' ||
        n === 'AG_RightLeg' ||
        n.startsWith('bip_R_Calf_') ||
        n === 'mixamorigRightLeg_061' ||
        n === 'shinR_061' ||
        n === 'rp_nathan_animated_003_walking_lowerleg_r_082')
    ) {
      bones.rightLeg = obj;
    }
    // Dog & Pigeon specific bones
    if (!bones.jaw && n === 'Dog_Jaw') bones.jaw = obj;
    if (!bones.tail && (n === 'Dog_Tail' || n === 'Pigeon_Tail')) {
      bones.tail = obj;
    }
    if (!bones.earL && n === 'Dog_Ear_L') bones.earL = obj;
    if (!bones.earR && n === 'Dog_Ear_R') bones.earR = obj;
    if (!bones.wingL && n === 'Pigeon_Wing_L') bones.wingL = obj;
    if (!bones.wingR && n === 'Pigeon_Wing_R') bones.wingR = obj;
    if (!bones.dogLegFL && n === 'Dog_Leg_FL') bones.dogLegFL = obj;
    if (!bones.dogLegFR && n === 'Dog_Leg_FR') bones.dogLegFR = obj;
    if (!bones.dogLegBL && n === 'Dog_Leg_BL') bones.dogLegBL = obj;
    if (!bones.dogLegBR && n === 'Dog_Leg_BR') bones.dogLegBR = obj;
  });

  return bones;
}

const _axisX = new THREE.Vector3(1, 0, 0);
const _axisY = new THREE.Vector3(0, 1, 0);
const _axisZ = new THREE.Vector3(0, 0, 1);
const _deltaQuat = new THREE.Quaternion();
const _deltaQuat2 = new THREE.Quaternion();

function applyBoneDelta(
  bone: THREE.Object3D | undefined,
  axis: THREE.Vector3,
  angleDeg: number,
  axis2?: THREE.Vector3,
  angleDeg2 = 0,
  preserveCurrentBase = false,
): void {
  if (!bone) return;
  const restQ = bone.userData.__restQuat as THREE.Quaternion | undefined;
  if (!preserveCurrentBase && restQ) {
    bone.quaternion.copy(restQ);
  }
  _deltaQuat.setFromAxisAngle(axis, THREE.MathUtils.degToRad(angleDeg));
  bone.quaternion.multiply(_deltaQuat);
  if (axis2 && Math.abs(angleDeg2) > 0.001) {
    _deltaQuat2.setFromAxisAngle(axis2, THREE.MathUtils.degToRad(angleDeg2));
    bone.quaternion.multiply(_deltaQuat2);
  }
}

/**
 * Attaches an expressive 3D facial expression + soot/blush overlay rig to `AG_Head` on
 * `riiged_anime_girl_outfits__facial_expressions.glb` so expressions (`happy`, `confused`,
 * `neutral`, `soot-covered`, `shocked`) animate deterministically on her face.
 */
function buildAnimeGirlFacialExpressionOverlay(headBone: THREE.Object3D): {
  updateExpression: (
    expr: CharacterExpressionId,
    frame: number,
    fps: number,
    seed: string,
  ) => void;
} {
  const faceGroup = new THREE.Group();
  faceGroup.name = 'AG_Facial_Expressions_Rig';
  // Position in AG_Head local space (head center is at Y=0.62, face front is at Z=+0.105, Y=+0.11)
  faceGroup.position.set(0, 0.11, 0.102);
  headBone.add(faceGroup);

  const darkMat = new THREE.MeshBasicMaterial({ color: '#1E1B4B' });
  const blushMat = new THREE.MeshBasicMaterial({
    color: '#FB7185',
    transparent: true,
    opacity: 0.55,
  });
  const mouthMat = new THREE.MeshBasicMaterial({ color: '#BE123C' });
  const sootMat = new THREE.MeshBasicMaterial({
    color: '#1E293B',
    transparent: true,
    opacity: 0.72,
  });

  const browL = new THREE.Mesh(
    new THREE.BoxGeometry(0.032, 0.006, 0.006),
    darkMat,
  );
  browL.position.set(0.036, 0.035, 0.01);
  faceGroup.add(browL);

  const browR = new THREE.Mesh(
    new THREE.BoxGeometry(0.032, 0.006, 0.006),
    darkMat,
  );
  browR.position.set(-0.036, 0.035, 0.01);
  faceGroup.add(browR);

  const eyelidL = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.005, 0.008),
    darkMat,
  );
  eyelidL.position.set(0.036, 0.014, 0.012);
  faceGroup.add(eyelidL);

  const eyelidR = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.005, 0.008),
    darkMat,
  );
  eyelidR.position.set(-0.036, 0.014, 0.012);
  faceGroup.add(eyelidR);

  const blushL = new THREE.Mesh(
    new THREE.CircleGeometry(0.014, 12),
    blushMat,
  );
  blushL.position.set(0.048, -0.008, 0.011);
  faceGroup.add(blushL);

  const blushR = new THREE.Mesh(
    new THREE.CircleGeometry(0.014, 12),
    blushMat,
  );
  blushR.position.set(-0.048, -0.008, 0.011);
  faceGroup.add(blushR);

  const mouthMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.006, 0.016, 6, 8),
    mouthMat,
  );
  mouthMesh.rotation.z = Math.PI * 0.5;
  mouthMesh.position.set(0, -0.026, 0.012);
  faceGroup.add(mouthMesh);

  // Soot smudges for `soot-covered` / `walk-out-of-rubble`
  const sootGroup = new THREE.Group();
  sootGroup.name = 'AG_Soot_Overlay';
  sootGroup.visible = false;
  const s1 = new THREE.Mesh(new THREE.CircleGeometry(0.022, 10), sootMat);
  s1.position.set(-0.032, -0.005, 0.013);
  const s2 = new THREE.Mesh(new THREE.CircleGeometry(0.018, 10), sootMat);
  s2.position.set(0.028, 0.022, 0.013);
  sootGroup.add(s1, s2);
  faceGroup.add(sootGroup);

  return {
    updateExpression: (expr, frame, fps, seed) => {
      const fState = evaluateExpressionFaceState(expr, 'idle', frame, seed, fps);
      const browAngle =
        fState.browState === 'furrowed'
          ? 16
          : fState.browState === 'worried'
            ? -14
            : 0;
      const browYOffset =
        fState.browState === 'shocked-high'
          ? 0.006
          : fState.browState === 'raised'
            ? 0.003
            : 0;

      browL.rotation.z = THREE.MathUtils.degToRad(-browAngle);
      browR.rotation.z = THREE.MathUtils.degToRad(browAngle);
      browL.position.y = 0.035 + browYOffset;
      browR.position.y = 0.035 + browYOffset;

      const blinkScale = fState.isBlinking || fState.blinkAmount01 > 0.5 ? 2.6 : 1.0;
      eyelidL.scale.y = blinkScale;
      eyelidR.scale.y = blinkScale;

      blushL.visible = Boolean(fState.blush || expr === 'happy' || expr === 'excited');
      blushR.visible = Boolean(fState.blush || expr === 'happy' || expr === 'excited');
      sootGroup.visible = Boolean(fState.sootCovered || expr === 'soot-covered');

      if (fState.mouthShape === 'o-mouth' || expr === 'shocked') {
        mouthMesh.scale.set(1.4, 0.9, 1.2);
      } else if (fState.mouthShape === 'smile' || expr === 'happy') {
        mouthMesh.scale.set(1.0, 1.25, 1.0);
      } else {
        mouthMesh.scale.set(0.75, 0.9, 1.0);
      }
    },
  };
}

export interface GlbCharacterInstanceHandle {
  entry: GlbCharacterAssetEntry;
  wrapperGroup: THREE.Group;
  mixer: THREE.AnimationMixer | null;
  bones: GlbBoneMap;
  evaluateAtFrame: (params: {
    frame: number;
    fps?: number;
    pose?: CharacterPoseId;
    expression?: CharacterExpressionId;
    facing?: CharacterFacing;
    seed?: string;
    speed?: number;
    startFrame?: number;
  }) => void;
  dispose: () => void;
}

const retargetedBipedClipCache = new Map<string, THREE.AnimationClip>();

/**
 * Instantiates a cloned, normalized, grounded, and Cel-Shaded GLB character or animal model
 * with deterministic Remotion frame evaluation (`mixer.setTime(t)` + verified bone articulation).
 */
export function instantiatePreparedGlbCharacter(
  entry: GlbCharacterAssetEntry,
  gltf: GLTF,
  options?: {
    tintColorHex?: string;
    tintStrength?: number;
    targetHeightOverride?: number;
    donorIdleGltf?: GLTF | null;
    donorWalkGltf?: GLTF | null;
  },
): GlbCharacterInstanceHandle {
  // Ensure source scene is prepared (skateboard stripped on game-boy, auto-rigged on anime girl)
  if (entry.stripSkateboard) {
    stripSkateboardFromGameBoyGlb(gltf.scene);
  }
  if (entry.skeletonFamily === 'anime-girl-rigged') {
    ensureAnimeGirlRiggedWithOutfitsAndExpressions(gltf.scene);
  }

  const clonedScene = SkeletonUtils.clone(gltf.scene);

  // Double-check skateboard removal on the clone so zero skateboard meshes ever remain
  if (entry.stripSkateboard) {
    stripSkateboardFromGameBoyGlb(clonedScene);
  }

  clonedScene.traverse((obj) => {
    if ((obj as THREE.SkinnedMesh).isSkinnedMesh) {
      obj.frustumCulled = false;
    }
  });

  const { wrapperGroup } = normalizeAndGroundGlbScene(
    clonedScene,
    options?.targetHeightOverride ?? entry.targetHeightMeters,
    entry.modelId,
  );

  const styleHandle = applyMainStreetStyleToGlbModel(clonedScene, {
    tintColorHex: options?.tintColorHex,
    tintStrength: options?.tintStrength,
    enableSkinnedInkHull: true,
  });

  const bones = extractAndSnapshotGlbBones(clonedScene);

  // Attach facial expression rig if this is the girlfriend (`anime-girl-rigged`)
  const animeGirlFaceOverlay =
    entry.skeletonFamily === 'anime-girl-rigged' && bones.head
      ? buildAnimeGirlFacialExpressionOverlay(bones.head)
      : null;

  // Configure deterministic AnimationMixer if embedded or donor clips exist
  let mixer: THREE.AnimationMixer | null = null;
  let primaryClip: THREE.AnimationClip | null = null;
  let walkDonorClip: THREE.AnimationClip | null = null;

  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(clonedScene);
    primaryClip = gltf.animations[0];
  } else if (entry.skeletonFamily === 'max-biped') {
    mixer = new THREE.AnimationMixer(clonedScene);
    if (options?.donorIdleGltf?.animations?.[0]) {
      const idleKey = `${entry.modelId}::idle`;
      let cachedIdle = retargetedBipedClipCache.get(idleKey);
      if (!cachedIdle) {
        cachedIdle = retargetBipedAnimationClip(
          options.donorIdleGltf.animations[0],
          clonedScene,
          'retargeted-biped-idle',
        );
        retargetedBipedClipCache.set(idleKey, cachedIdle);
      }
      primaryClip = cachedIdle;
    }
    if (options?.donorWalkGltf?.animations?.[0]) {
      const walkKey = `${entry.modelId}::walk`;
      let cachedWalk = retargetedBipedClipCache.get(walkKey);
      if (!cachedWalk) {
        cachedWalk = retargetBipedAnimationClip(
          options.donorWalkGltf.animations[0],
          clonedScene,
          'retargeted-biped-walk',
        );
        retargetedBipedClipCache.set(walkKey, cachedWalk);
      }
      walkDonorClip = cachedWalk;
    }
  }

  const evaluateAtFrame: GlbCharacterInstanceHandle['evaluateAtFrame'] = ({
    frame,
    fps = 60,
    pose = 'walk',
    expression = 'happy',
    seed = entry.modelId,
    speed = 1,
    startFrame = 0,
  }) => {
    const localFrame = Math.max(0, (frame - startFrame) * speed);
    const timeSec = localFrame / Math.max(1, fps);
    const joints = evaluatePoseJointAngles(pose, localFrame, { fps, seed });

    const isWalkingPose =
      pose === 'walk' ||
      pose === 'hand-holding-walk' ||
      pose === 'sprint' ||
      pose === 'hurry-away' ||
      pose === 'walk-out-of-rubble' ||
      pose === 'bolt-away-run';

    // 1. Evaluate embedded or retargeted GLTF AnimationClip deterministically
    let mixerEvaluated = false;
    if (mixer) {
      const clipToUse =
        isWalkingPose && walkDonorClip ? walkDonorClip : primaryClip;
      if (clipToUse && clipToUse.duration > 0) {
        mixer.stopAllAction();
        const action = mixer.clipAction(clipToUse);
        action.play();
        const speedMult =
          pose === 'sprint' ||
          pose === 'hurry-away' ||
          pose === 'bolt-away-run' ||
          pose === 'takeoff'
            ? 1.75
            : 1.0;
        const clipTime = (timeSec * speedMult) % clipToUse.duration;
        mixer.setTime(clipTime);
        mixerEvaluated = true;
      }
    }

    // 2. Apply skeleton-specific procedural pose articulation using verified bone axes
    const fam = entry.skeletonFamily;
    if (fam === 'reallusion-cc-base') {
      // Main Boy: free_stylized_cartoon_game_boy_character_rigged.glb (skateboard removed!)
      // Verified axis: Z -26deg lowers LeftArm to side, Z +26deg lowers RightArm to side; X swings arms forward/back.
      applyBoneDelta(
        bones.head,
        _axisY,
        joints.headRotate * 0.7,
        _axisX,
        Math.sin(timeSec * 2.5) * 4,
      );
      applyBoneDelta(bones.spine, _axisZ, joints.torsoRotate * 0.45);
      applyBoneDelta(
        bones.leftArm,
        _axisZ,
        pose === 'dance' || pose === 'cheer' ? 18 : -26,
        _axisX,
        joints.shoulderL * 0.65,
      );
      applyBoneDelta(bones.leftForeArm, _axisX, joints.elbowL * 0.45);
      applyBoneDelta(
        bones.rightArm,
        _axisZ,
        pose === 'salute' || pose === 'point' ? -28 : 26,
        _axisX,
        joints.shoulderR * 0.65,
      );
      applyBoneDelta(bones.rightForeArm, _axisX, joints.elbowR * 0.55);
      applyBoneDelta(bones.leftUpLeg, _axisX, joints.hipL * 0.65);
      applyBoneDelta(bones.leftLeg, _axisX, -Math.abs(joints.kneeL) * 0.5);
      applyBoneDelta(bones.rightUpLeg, _axisX, joints.hipR * 0.65);
      applyBoneDelta(bones.rightLeg, _axisX, -Math.abs(joints.kneeR) * 0.5);
      wrapperGroup.position.y = Math.max(0, -joints.rootY * 0.0025);
    } else if (fam === 'anime-girl-rigged') {
      // Main Girlfriend: riiged_anime_girl_outfits__facial_expressions.glb
      applyBoneDelta(
        bones.head,
        _axisY,
        joints.headRotate * 0.75,
        _axisX,
        Math.sin(timeSec * 2.6) * 3.5,
      );
      applyBoneDelta(bones.spine, _axisZ, joints.torsoRotate * 0.38);
      applyBoneDelta(
        bones.leftArm,
        _axisX,
        joints.shoulderL * 0.55,
        _axisZ,
        pose === 'shrug' ? 22 : 0,
      );
      applyBoneDelta(bones.leftForeArm, _axisX, -Math.abs(joints.elbowL) * 0.45);
      applyBoneDelta(
        bones.rightArm,
        _axisX,
        joints.shoulderR * 0.55,
        _axisZ,
        pose === 'point-at-shop' || pose === 'point'
          ? -38
          : pose === 'shrug'
            ? -22
            : 0,
      );
      applyBoneDelta(
        bones.rightForeArm,
        _axisX,
        -Math.abs(joints.elbowR) * 0.45,
      );
      applyBoneDelta(bones.leftUpLeg, _axisX, joints.hipL * 0.55);
      applyBoneDelta(bones.leftLeg, _axisX, Math.abs(joints.kneeL) * 0.45);
      applyBoneDelta(bones.rightUpLeg, _axisX, joints.hipR * 0.55);
      applyBoneDelta(bones.rightLeg, _axisX, Math.abs(joints.kneeR) * 0.45);
      wrapperGroup.position.y = Math.max(0, -joints.rootY * 0.0025);

      if (animeGirlFaceOverlay) {
        animeGirlFaceOverlay.updateExpression(
          expression,
          localFrame,
          fps,
          seed,
        );
      }
    } else if (fam === 'blender-rigify') {
      // Hacker Friend: low_poly_man_-_rigged.glb
      applyBoneDelta(bones.head, _axisY, joints.headRotate * 0.75);
      applyBoneDelta(bones.spine, _axisZ, joints.torsoRotate * 0.45);
      applyBoneDelta(bones.leftArm, _axisX, joints.shoulderL * 0.55);
      applyBoneDelta(bones.leftForeArm, _axisX, joints.elbowL * 0.45);
      applyBoneDelta(bones.rightArm, _axisX, joints.shoulderR * 0.55);
      applyBoneDelta(bones.rightForeArm, _axisX, joints.elbowR * 0.45);
      applyBoneDelta(bones.leftUpLeg, _axisX, -joints.hipL * 0.55);
      applyBoneDelta(bones.leftLeg, _axisX, Math.abs(joints.kneeL) * 0.45);
      applyBoneDelta(bones.rightUpLeg, _axisX, -joints.hipR * 0.55);
      applyBoneDelta(bones.rightLeg, _axisX, Math.abs(joints.kneeR) * 0.45);
      wrapperGroup.position.y = Math.max(0, -joints.rootY * 0.0025);
    } else if (fam === 'mixamo') {
      // Police Officer / Jogger: police_man_rigged.glb
      applyBoneDelta(
        bones.head,
        _axisY,
        joints.headRotate * 0.85,
        _axisX,
        Math.sin(timeSec * 2.2) * 4,
      );
      applyBoneDelta(bones.spine, _axisZ, joints.torsoRotate * 0.4);
      applyBoneDelta(
        bones.leftArm,
        _axisX,
        66,
        _axisZ,
        joints.shoulderL * 0.65,
      );
      applyBoneDelta(bones.leftForeArm, _axisZ, joints.elbowL * 0.45);
      applyBoneDelta(
        bones.rightArm,
        _axisX,
        pose === 'salute' || pose === 'point' ? 15 : 66,
        _axisZ,
        -joints.shoulderR * 0.65,
      );
      applyBoneDelta(bones.rightForeArm, _axisZ, -joints.elbowR * 0.5);
      applyBoneDelta(bones.leftUpLeg, _axisX, joints.hipL * 0.6);
      applyBoneDelta(bones.leftLeg, _axisX, -Math.abs(joints.kneeL) * 0.5);
      applyBoneDelta(bones.rightUpLeg, _axisX, joints.hipR * 0.6);
      applyBoneDelta(bones.rightLeg, _axisX, -Math.abs(joints.kneeR) * 0.5);
      wrapperGroup.position.y = Math.max(0, -joints.rootY * 0.0025);
    } else if (fam === 'max-biped') {
      if (!mixerEvaluated) {
        applyBoneDelta(
          bones.leftArm,
          _axisY,
          66,
          _axisZ,
          -joints.shoulderL * 0.6,
        );
        applyBoneDelta(
          bones.rightArm,
          _axisY,
          -66,
          _axisZ,
          -joints.shoulderR * 0.6,
        );
      } else if (
        pose === 'salute' ||
        pose === 'point' ||
        pose === 'countdown-gestures' ||
        pose === 'cheer' ||
        pose === 'dance'
      ) {
        applyBoneDelta(
          bones.rightArm,
          _axisZ,
          -joints.shoulderR * 0.45,
          undefined,
          0,
          true,
        );
        applyBoneDelta(
          bones.head,
          _axisX,
          joints.headRotate * 0.4,
          undefined,
          0,
          true,
        );
      }
    } else if (fam === 'renderpeople-nathan') {
      if (bones.head) {
        applyBoneDelta(
          bones.head,
          _axisY,
          joints.headRotate * 0.35,
          undefined,
          0,
          true,
        );
      }
    } else if (fam === 'dog-rig') {
      // Male Dog GLB (`/models/characters/dog.glb`)
      const runCycle = Math.sin(timeSec * 14);
      if (pose === 'tail-tuck') {
        applyBoneDelta(bones.tail, _axisX, -65);
        applyBoneDelta(bones.earL, _axisZ, -25);
        applyBoneDelta(bones.earR, _axisZ, 25);
      } else if (pose === 'startled-expression') {
        applyBoneDelta(bones.head, _axisX, -18, _axisY, Math.sin(timeSec * 12) * 8);
        applyBoneDelta(bones.jaw, _axisX, 28);
        applyBoneDelta(bones.earL, _axisZ, 42);
        applyBoneDelta(bones.earR, _axisZ, -42);
        applyBoneDelta(bones.tail, _axisX, 35);
        wrapperGroup.position.y = Math.abs(Math.sin(timeSec * 8)) * 0.08;
      } else if (pose === 'bolt-away-run') {
        applyBoneDelta(bones.dogLegFL, _axisX, runCycle * 45);
        applyBoneDelta(bones.dogLegBR, _axisX, runCycle * 45);
        applyBoneDelta(bones.dogLegFR, _axisX, -runCycle * 45);
        applyBoneDelta(bones.dogLegBL, _axisX, -runCycle * 45);
        applyBoneDelta(bones.tail, _axisZ, runCycle * 32);
        wrapperGroup.position.y = Math.abs(runCycle) * 0.06;
      } else {
        // idle wagging + panting
        applyBoneDelta(bones.tail, _axisZ, Math.sin(timeSec * 9) * 28, undefined, 0, true);
      }
    } else if (fam === 'pigeon-rig') {
      // City Pigeon GLB (`/models/characters/pigeon.glb` / `peigon.glb`)
      const flapAngle = Math.sin(timeSec * 18) * 55;
      if (pose === 'head-turn') {
        applyBoneDelta(
          bones.head,
          _axisY,
          Math.sin(timeSec * 5) * 42,
          _axisX,
          Math.cos(timeSec * 7) * 14,
        );
        applyBoneDelta(bones.wingL, _axisZ, 0);
        applyBoneDelta(bones.wingR, _axisZ, 0);
      } else if (pose === 'wing-flap') {
        applyBoneDelta(bones.wingL, _axisZ, Math.max(-10, flapAngle));
        applyBoneDelta(bones.wingR, _axisZ, -Math.max(-10, flapAngle));
        wrapperGroup.position.y = Math.abs(Math.sin(timeSec * 9)) * 0.05;
      } else if (pose === 'takeoff') {
        applyBoneDelta(bones.wingL, _axisZ, flapAngle);
        applyBoneDelta(bones.wingR, _axisZ, -flapAngle);
        wrapperGroup.position.y =
          0.12 + Math.abs(Math.sin(timeSec * 6)) * 0.22;
      } else {
        // perch head-bob
        applyBoneDelta(bones.head, _axisX, Math.sin(timeSec * 6) * 12);
        applyBoneDelta(bones.wingL, _axisZ, 0);
        applyBoneDelta(bones.wingR, _axisZ, 0);
      }
    }
  };

  return {
    entry,
    wrapperGroup,
    mixer,
    bones,
    evaluateAtFrame,
    dispose: () => {
      if (mixer) {
        mixer.stopAllAction();
      }
      styleHandle.disposeStyle();
    },
  };
}
