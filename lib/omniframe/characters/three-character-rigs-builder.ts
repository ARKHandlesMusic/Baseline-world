import * as THREE from 'three';
import {
  CHARACTER_OUTFIT_PALETTES,
  SHARED_INK_OUTLINE,
  SKIN_TONE_PALETTES,
  type CelColorTriplet,
  type SkinToneId,
} from './palette';
import {
  blendJointAngles,
  evaluateExpressionFaceState,
  evaluatePoseJointAngles,
  generateSeededCrowdSpecs,
  type CharacterExpressionId,
  type CharacterFacing,
  type CharacterId,
  type CharacterPoseId,
  type CountdownSignValue,
  type FaceStateEvaluation,
  type NutcrackerDollVariant,
  type PedestrianAnimation,
  type PedestrianArchetypeVariant,
  type JointAngles,
  type CrowdMemberSeededSpec,
} from './rig-utils';
import { applyMainStreetStyleToSceneGraph } from '../main-street-style-engine';
import {
  getGlbAssetEntryForCharacter,
  instantiatePreparedGlbCharacter,
  loadCachedGlbAsset,
  notifyGlbCharacterMounted,
  type GlbCharacterInstanceHandle,
  type GlbModelId,
} from './glb-character-loader';

export interface ThreeCharacterRigOptions {
  characterId: CharacterId;
  pose?: CharacterPoseId;
  secondaryPose?: CharacterPoseId;
  poseBlend?: number;
  expression?: CharacterExpressionId;
  facing?: CharacterFacing;
  scale?: number;
  seed?: string;
  startFrame?: number;
  speed?: number;
  sunglasses?: boolean;
  countdownValue?: CountdownSignValue;
  archetype?: PedestrianArchetypeVariant;
  nutcrackerVariant?: NutcrackerDollVariant;
  skinToneOverride?: SkinToneId;
  topColorOverride?: CelColorTriplet;
  bottomColorOverride?: CelColorTriplet;
  hairColorOverride?: CelColorTriplet;
  glbModelIdOverride?: GlbModelId;
}

export interface ThreeCharacterEvaluationParams {
  frame: number;
  fps?: number;
  pose?: CharacterPoseId;
  secondaryPose?: CharacterPoseId;
  poseBlend?: number;
  expression?: CharacterExpressionId;
  facing?: CharacterFacing;
  sunglasses?: boolean;
  countdownValue?: CountdownSignValue;
}

export interface ThreeCharacterRigHandle {
  characterId: CharacterId;
  rootGroup: THREE.Group;
  parts: {
    pelvis: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    jaw: THREE.Group;
    hat: THREE.Group;
    hair: THREE.Group;
    eyes: THREE.Group;
    brows: THREE.Group;
    mouth: THREE.Group;
    accessories: THREE.Group;
    upperArmL: THREE.Group;
    lowerArmL: THREE.Group;
    handL: THREE.Group;
    upperArmR: THREE.Group;
    lowerArmR: THREE.Group;
    handR: THREE.Group;
    upperLegL: THREE.Group;
    lowerLegL: THREE.Group;
    footL: THREE.Group;
    upperLegR: THREE.Group;
    lowerLegR: THREE.Group;
    footR: THREE.Group;
  };
  updateAtFrame: (params: ThreeCharacterEvaluationParams) => void;
  dispose: () => void;
}

const COUNTDOWN_SEQUENCE: readonly CountdownSignValue[] = [
  '10',
  '9',
  '8',
  '7',
  '6',
  '5',
  '4',
  '3',
  '2',
  '1',
  'BOOM!',
];

const signTextureCache = new Map<CountdownSignValue, THREE.CanvasTexture>();

function getCountdownSignTexture(signText: CountdownSignValue): THREE.CanvasTexture {
  const cached = signTextureCache.get(signText);
  if (cached) return cached;

  const isBoom = signText === 'BOOM!';
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = isBoom ? '#EF4444' : '#D97706';
      ctx.fillRect(0, 0, 256, 128);
      ctx.strokeStyle = '#0A0812';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, 246, 118);

      // Masking tape corners
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(10, 10, 36, 14);
      ctx.fillRect(210, 10, 36, 14);

      ctx.fillStyle = isBoom ? '#FEF08A' : '#0A0812';
      ctx.font = isBoom
        ? '900 54px system-ui, sans-serif'
        : '900 76px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(signText, 128, 68);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    signTextureCache.set(signText, tex);
    return tex;
  }

  const data = new Uint8Array([217, 119, 6, 255]);
  const fallback = new THREE.DataTexture(data, 1, 1);
  fallback.needsUpdate = true;
  return fallback as unknown as THREE.CanvasTexture;
}

interface ThreeFaceRigHandles {
  eyesGroup: THREE.Group;
  browsGroup: THREE.Group;
  mouthGroup: THREE.Group;
  jawGroup: THREE.Group;
  pupilL: THREE.Mesh;
  pupilR: THREE.Mesh;
  eyelidTopL: THREE.Mesh;
  eyelidTopR: THREE.Mesh;
  eyelidBotL: THREE.Mesh;
  eyelidBotR: THREE.Mesh;
  eyeBallL: THREE.Group;
  eyeBallR: THREE.Group;
  browL: THREE.Mesh;
  browR: THREE.Mesh;
  mouthSmile: THREE.Mesh;
  mouthFrown: THREE.Mesh;
  mouthO: THREE.Mesh;
  mouthGritted: THREE.Group;
  mouthFlat: THREE.Mesh;
  jawDropBox: THREE.Group;
  sweatDrop: THREE.Mesh;
  sootGroup: THREE.Group;
}

function createMat(
  colorHex: string,
  roughness = 0.52,
  metalness = 0.06,
  emissiveHex?: string,
  emissiveIntensity = 0
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness,
    metalness,
    emissive: emissiveHex ? new THREE.Color(emissiveHex) : new THREE.Color(0x000000),
    emissiveIntensity,
  });
}

/**
 * Helper: creates a smooth organic Mesh with computed vertex normals and no internal EdgesGeometry lines
 * or internal BackSide hull rings, so connected body parts (shoulders, elbows, hips, knees, chest) blend
 * into a continuous smooth 3D character surface without blocky segmentation lines.
 */
function createSmoothCharMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  allowSilhouetteHull = false,
  customHullScale = 1.008
): THREE.Mesh {
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.__isSmoothCharacterMesh = true;
  mesh.userData.__skipMainStreetEdges = true;
  mesh.userData.__allowCharacterSilhouetteHull = false;
  mesh.userData.__skipMainStreetHull = true;
  mesh.userData.__customInkHullScale = customHullScale;
  void allowSilhouetteHull;
  return mesh;
}

function buildThreeFaceRig(
  headRadius: number,
  skinColorHex: string,
  inkColorHex = SHARED_INK_OUTLINE
): ThreeFaceRigHandles {
  const eyesGroup = new THREE.Group();
  eyesGroup.name = 'eyes';
  const browsGroup = new THREE.Group();
  browsGroup.name = 'brows';
  const mouthGroup = new THREE.Group();
  mouthGroup.name = 'mouth';
  const jawGroup = new THREE.Group();
  jawGroup.name = 'jaw';

  const whiteMat = createMat('#FFFFFF', 0.22, 0.04);
  const darkMat = createMat(inkColorHex, 0.18, 0.08);
  const lidMat = createMat(skinColorHex, 0.54, 0.05);
  const mouthCavityMat = createMat('#7F1D1D', 0.68, 0.02);
  const tongueMat = createMat('#FB7185', 0.48, 0.05);
  const sweatMat = createMat('#38BDF8', 0.15, 0.1, '#38BDF8', 0.35);
  const sootMat = createMat('#18181B', 0.9, 0.02);

  const eyeSpacingX = headRadius * 0.36;
  const eyeY = headRadius * 0.01;
  const eyeZ = headRadius * 0.88;

  const makeEye = (side: -1 | 1) => {
    const grp = new THREE.Group();
    grp.position.set(side * eyeSpacingX, eyeY, eyeZ);

    const scleraGeo = new THREE.SphereGeometry(headRadius * 0.175, 24, 20);
    scleraGeo.scale(1.0, 1.14, 0.55);
    const sclera = createSmoothCharMesh(scleraGeo, whiteMat);
    grp.add(sclera);

    const pupilGeo = new THREE.SphereGeometry(headRadius * 0.088, 20, 16);
    pupilGeo.scale(1.0, 1.1, 0.48);
    const pupil = createSmoothCharMesh(pupilGeo, darkMat);
    pupil.position.set(0, 0, headRadius * 0.082);
    grp.add(pupil);

    const catchGeo = new THREE.SphereGeometry(headRadius * 0.032, 14, 12);
    const catchLight = createSmoothCharMesh(catchGeo, whiteMat);
    catchLight.position.set(-headRadius * 0.026, headRadius * 0.035, headRadius * 0.036);
    pupil.add(catchLight);

    // Smooth curved spherical eyelid shells
    const topLidGeo = new THREE.SphereGeometry(
      headRadius * 0.186,
      22,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.46
    );
    topLidGeo.scale(1.04, 1.14, 0.62);
    const topLid = createSmoothCharMesh(topLidGeo, lidMat);
    topLid.position.set(0, headRadius * 0.12, headRadius * 0.01);
    topLid.rotation.x = -0.35;
    grp.add(topLid);

    const botLidGeo = new THREE.SphereGeometry(
      headRadius * 0.184,
      22,
      16,
      0,
      Math.PI * 2,
      Math.PI * 0.55,
      Math.PI * 0.45
    );
    botLidGeo.scale(1.04, 1.12, 0.62);
    const botLid = createSmoothCharMesh(botLidGeo, lidMat);
    botLid.position.set(0, -headRadius * 0.06, headRadius * 0.01);
    botLid.visible = false;
    grp.add(botLid);

    return { grp, pupil, topLid, botLid };
  };

  const leftEye = makeEye(-1);
  const rightEye = makeEye(1);
  eyesGroup.add(leftEye.grp, rightEye.grp);

  // Smooth sculpted 3D Eyebrows
  const browGeo = new THREE.CapsuleGeometry(
    headRadius * 0.032,
    headRadius * 0.25,
    12,
    20
  );
  browGeo.rotateZ(Math.PI / 2);
  browGeo.scale(1.0, 0.85, 0.72);
  const browL = createSmoothCharMesh(browGeo, darkMat);
  browL.position.set(-eyeSpacingX, eyeY + headRadius * 0.31, eyeZ + headRadius * 0.04);
  const browR = createSmoothCharMesh(browGeo, darkMat);
  browR.position.set(eyeSpacingX, eyeY + headRadius * 0.31, eyeZ + headRadius * 0.04);
  browsGroup.add(browL, browR);

  // Smooth 3D Sculpted Nose
  const noseGeo = new THREE.SphereGeometry(headRadius * 0.1, 20, 18);
  noseGeo.scale(0.84, 0.92, 1.2);
  const noseMesh = createSmoothCharMesh(noseGeo, lidMat);
  noseMesh.position.set(0, -headRadius * 0.07, headRadius * 0.96);
  eyesGroup.add(noseMesh);

  // 3D Mouth Shapes
  const mouthZ = headRadius * 0.91;
  const mouthY = -headRadius * 0.34;

  // Smile (upturned smooth 3D torus arc)
  const smileGeo = new THREE.TorusGeometry(
    headRadius * 0.18,
    headRadius * 0.035,
    14,
    28,
    Math.PI
  );
  const mouthSmile = createSmoothCharMesh(smileGeo, darkMat);
  mouthSmile.rotation.x = Math.PI;
  mouthSmile.position.set(0, mouthY + headRadius * 0.06, mouthZ);
  mouthGroup.add(mouthSmile);

  // Frown (downturned smooth 3D torus arc)
  const mouthFrown = createSmoothCharMesh(smileGeo, darkMat);
  mouthFrown.position.set(0, mouthY - headRadius * 0.08, mouthZ);
  mouthFrown.visible = false;
  mouthGroup.add(mouthFrown);

  // O-mouth (smooth 3D oval cavity)
  const oGeo = new THREE.CylinderGeometry(
    headRadius * 0.13,
    headRadius * 0.13,
    headRadius * 0.065,
    24
  );
  oGeo.rotateX(Math.PI / 2);
  const mouthO = createSmoothCharMesh(oGeo, mouthCavityMat);
  mouthO.position.set(0, mouthY, mouthZ);
  mouthO.visible = false;
  mouthGroup.add(mouthO);

  // Flat line mouth
  const flatGeo = new THREE.CapsuleGeometry(
    headRadius * 0.025,
    headRadius * 0.26,
    10,
    18
  );
  flatGeo.rotateZ(Math.PI / 2);
  const mouthFlat = createSmoothCharMesh(flatGeo, darkMat);
  mouthFlat.position.set(0, mouthY, mouthZ);
  mouthFlat.visible = false;
  mouthGroup.add(mouthFlat);

  // Gritted teeth mouth
  const mouthGritted = new THREE.Group();
  const gritBoxGeo = new THREE.CapsuleGeometry(
    headRadius * 0.07,
    headRadius * 0.24,
    12,
    22
  );
  gritBoxGeo.rotateZ(Math.PI / 2);
  gritBoxGeo.scale(1.0, 1.0, 0.55);
  const gritBox = createSmoothCharMesh(gritBoxGeo, whiteMat);
  const gritBarGeo = new THREE.CapsuleGeometry(
    headRadius * 0.014,
    headRadius * 0.3,
    8,
    16
  );
  gritBarGeo.rotateZ(Math.PI / 2);
  const gritBar = createSmoothCharMesh(gritBarGeo, darkMat);
  gritBar.position.z = headRadius * 0.032;
  mouthGritted.add(gritBox, gritBar);
  mouthGritted.position.set(0, mouthY, mouthZ);
  mouthGritted.visible = false;
  mouthGroup.add(mouthGritted);

  // Articulated 3D Jaw-Drop Group
  const jawDropBox = new THREE.Group();
  const jawCavityGeo = new THREE.CapsuleGeometry(
    headRadius * 0.17,
    headRadius * 0.22,
    14,
    24
  );
  jawCavityGeo.scale(1.1, 1.0, 0.68);
  const jawCavity = createSmoothCharMesh(jawCavityGeo, mouthCavityMat);
  const jawChinGeo = new THREE.SphereGeometry(headRadius * 0.25, 24, 18);
  jawChinGeo.scale(1.08, 0.68, 0.88);
  const jawChin = createSmoothCharMesh(jawChinGeo, lidMat);
  jawChin.position.set(0, -headRadius * 0.26, -headRadius * 0.03);
  const tongueGeo = new THREE.SphereGeometry(headRadius * 0.14, 18, 14);
  tongueGeo.scale(1.0, 0.45, 1.25);
  const tongue = createSmoothCharMesh(tongueGeo, tongueMat);
  tongue.position.set(0, -headRadius * 0.16, headRadius * 0.06);
  const upperTeethGeo = new THREE.CapsuleGeometry(
    headRadius * 0.032,
    headRadius * 0.24,
    10,
    18
  );
  upperTeethGeo.rotateZ(Math.PI / 2);
  const upperTeeth = createSmoothCharMesh(upperTeethGeo, whiteMat);
  upperTeeth.position.set(0, headRadius * 0.2, headRadius * 0.09);
  jawDropBox.add(jawCavity, jawChin, tongue, upperTeeth);
  jawDropBox.position.set(0, mouthY - headRadius * 0.12, mouthZ - headRadius * 0.06);
  jawDropBox.visible = false;
  jawGroup.add(jawDropBox);

  // Smooth 3D Sweat Drop on Temple
  const sweatGeo = new THREE.ConeGeometry(headRadius * 0.072, headRadius * 0.2, 18);
  const sweatDrop = createSmoothCharMesh(sweatGeo, sweatMat);
  sweatDrop.position.set(headRadius * 0.85, headRadius * 0.22, headRadius * 0.42);
  sweatDrop.visible = false;
  eyesGroup.add(sweatDrop);

  // Smooth 3D Soot Overlay smudges
  const sootGroup = new THREE.Group();
  const smudgeGeo = new THREE.SphereGeometry(headRadius * 0.2, 18, 14);
  smudgeGeo.scale(1.2, 0.7, 0.22);
  const smudgeL = createSmoothCharMesh(smudgeGeo, sootMat);
  smudgeL.position.set(-headRadius * 0.46, -headRadius * 0.12, headRadius * 0.84);
  const smudgeR = createSmoothCharMesh(smudgeGeo, sootMat);
  smudgeR.position.set(headRadius * 0.44, headRadius * 0.28, headRadius * 0.82);
  sootGroup.add(smudgeL, smudgeR);
  sootGroup.visible = false;
  eyesGroup.add(sootGroup);

  return {
    eyesGroup,
    browsGroup,
    mouthGroup,
    jawGroup,
    pupilL: leftEye.pupil,
    pupilR: rightEye.pupil,
    eyelidTopL: leftEye.topLid,
    eyelidTopR: rightEye.topLid,
    eyelidBotL: leftEye.botLid,
    eyelidBotR: rightEye.botLid,
    eyeBallL: leftEye.grp,
    eyeBallR: rightEye.grp,
    browL,
    browR,
    mouthSmile,
    mouthFrown,
    mouthO,
    mouthGritted,
    mouthFlat,
    jawDropBox,
    sweatDrop,
    sootGroup,
  };
}

function updateThreeFaceRig(
  face: ThreeFaceRigHandles,
  faceState: FaceStateEvaluation,
  headRadius: number,
  jawDropOverridePx = 0
) {
  const lookX = faceState.pupilOffsetX * headRadius * 0.018;
  const lookY = -faceState.pupilOffsetY * headRadius * 0.018;
  const pScale = faceState.pupilScale;

  face.pupilL.position.x = lookX;
  face.pupilL.position.y = lookY;
  face.pupilL.scale.setScalar(pScale);
  face.pupilR.position.x = lookX;
  face.pupilR.position.y = lookY;
  face.pupilR.scale.setScalar(pScale);

  const eyeScaleY =
    faceState.eyeState === 'wide'
      ? 1.22
      : faceState.eyeState === 'squint' || faceState.eyeState === 'half-lid'
      ? 0.62
      : 1.0;
  face.eyeBallL.scale.y = eyeScaleY;
  face.eyeBallR.scale.y = eyeScaleY;

  const lidClosure = Math.max(
    faceState.blinkAmount01,
    faceState.eyeState === 'squint'
      ? 0.62
      : faceState.eyeState === 'half-lid'
      ? 0.42
      : faceState.eyeState === 'blink'
      ? 0.92
      : 0.04
  );
  const topLidY = THREE.MathUtils.lerp(
    headRadius * 0.14,
    0,
    lidClosure
  );
  const topLidRotX = THREE.MathUtils.lerp(-0.48, 0.18, lidClosure);
  face.eyelidTopL.position.y = topLidY;
  face.eyelidTopR.position.y = topLidY;
  face.eyelidTopL.rotation.x = topLidRotX;
  face.eyelidTopR.rotation.x = topLidRotX;
  face.eyelidTopL.visible = lidClosure > 0.12;
  face.eyelidTopR.visible = lidClosure > 0.12;

  face.eyelidBotL.visible =
    faceState.eyeState === 'squint' || faceState.eyeState === 'half-lid';
  face.eyelidBotR.visible =
    faceState.eyeState === 'squint' || faceState.eyeState === 'half-lid';

  // Eyebrows based on browState (kept cleanly below the upper forehead hairline)
  const baseBrowY = headRadius * 0.32;
  let browLOffsetY = 0;
  let browROffsetY = 0;
  let browLRot = 0;
  let browRRot = 0;
  if (
    faceState.browState === 'raised' ||
    faceState.browState === 'shocked-high'
  ) {
    browLOffsetY = -3.2;
    browROffsetY = -3.2;
  } else if (faceState.browState === 'furrowed') {
    browLOffsetY = 1.6;
    browROffsetY = 1.6;
    browLRot = -14;
    browRRot = 14;
  } else if (faceState.browState === 'worried') {
    browLRot = 12;
    browRRot = -12;
  } else if (faceState.browState === 'asymmetric') {
    browLOffsetY = -2.8;
    browROffsetY = 1.6;
    browLRot = 6;
    browRRot = -8;
  }
  face.browL.position.y = baseBrowY - browLOffsetY * headRadius * 0.02;
  face.browR.position.y = baseBrowY - browROffsetY * headRadius * 0.02;
  face.browL.rotation.z = THREE.MathUtils.degToRad(-browLRot);
  face.browR.rotation.z = THREE.MathUtils.degToRad(-browRRot);

  // Mouth visibility
  const effectiveJawDrop = Math.max(faceState.jawDropExtraPx, jawDropOverridePx);
  const isJawDrop =
    faceState.mouthShape === 'jaw-drop' || effectiveJawDrop > 20;

  face.mouthSmile.visible = !isJawDrop && faceState.mouthShape === 'smile';
  face.mouthFrown.visible = !isJawDrop && faceState.mouthShape === 'frown';
  face.mouthO.visible =
    !isJawDrop &&
    (faceState.mouthShape === 'o-mouth' || faceState.mouthShape === 'gulp');
  face.mouthGritted.visible =
    !isJawDrop && faceState.mouthShape === 'gritted-teeth';
  face.mouthFlat.visible = !isJawDrop && faceState.mouthShape === 'flat-line';

  face.jawDropBox.visible = isJawDrop;
  if (isJawDrop) {
    const dropFactor = Math.min(2.8, Math.max(0.55, effectiveJawDrop / 32));
    face.jawDropBox.scale.y = dropFactor;
    face.jawDropBox.position.y =
      -headRadius * 0.48 - dropFactor * headRadius * 0.38;
  }

  face.sweatDrop.visible = faceState.sweatDrops;
  face.sootGroup.visible = faceState.sootCovered;
}

/**
 * Helper: Builds a cranium-hugging 3D hair cap (concentric with the head sphere) + side temple locks
 * + back-of-skull hair bowl. Because the dome is concentric with the skull and tilted back (`rotation.x = -0.38`),
 * it hugs the head naturally down to the ears on the sides while keeping the front hairline high above
 * the eyebrows and eyes!
 */
function buildSculptedHairBaseCap(
  headRadius: number,
  hairMat: THREE.Material,
  frontThetaLength = Math.PI * 0.42,
  frontTiltRad = -0.22,
  includeSideburns = true
): THREE.Group {
  const capGroup = new THREE.Group();
  // 1. Cranium-hugging Crown & Forehead Dome (gently tilted so front rim sits cleanly at y ≈ +0.48*R above eyebrows while wrapping wide across the temples)
  const frontDomeGeo = new THREE.SphereGeometry(
    headRadius * 1.05,
    36,
    28,
    0,
    Math.PI * 2,
    0,
    frontThetaLength
  );
  frontDomeGeo.scale(1.03, 1.05, 0.98);
  const frontDome = createSmoothCharMesh(frontDomeGeo, hairMat);
  frontDome.position.set(0, headRadius * 0.04, -headRadius * 0.02);
  frontDome.rotation.x = frontTiltRad;
  capGroup.add(frontDome);

  // 2. Back-of-Skull Hair Bowl (sweeps down the back of the head to the nape)
  const backBowlGeo = new THREE.SphereGeometry(
    headRadius * 1.05,
    32,
    24,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.54
  );
  backBowlGeo.scale(1.03, 1.05, 0.98);
  const backBowl = createSmoothCharMesh(backBowlGeo, hairMat);
  backBowl.position.set(0, 0.0, -headRadius * 0.02);
  backBowl.rotation.x = -0.92;
  capGroup.add(backBowl);

  // 3. Sculpted Upper-Temple Hair Sweeps + Sideburn Locks (connects crown to ears with zero temple gap while keeping eyebrows 100% clear)
  if (includeSideburns) {
    for (const side of [-1, 1]) {
      const upperTempleGeo = new THREE.SphereGeometry(
        headRadius * 0.46,
        22,
        18
      );
      upperTempleGeo.scale(0.62, 1.05, 0.92);
      const upperTemple = createSmoothCharMesh(upperTempleGeo, hairMat);
      upperTemple.position.set(
        side * headRadius * 0.76,
        headRadius * 0.38,
        headRadius * 0.14
      );
      upperTemple.rotation.z = side * -0.42;
      capGroup.add(upperTemple);

      const templeGeo = new THREE.CapsuleGeometry(
        headRadius * 0.15,
        headRadius * 0.36,
        12,
        20
      );
      templeGeo.scale(0.68, 1.0, 0.95);
      const templeMesh = createSmoothCharMesh(templeGeo, hairMat);
      templeMesh.position.set(
        side * headRadius * 0.93,
        headRadius * 0.14,
        -headRadius * 0.04
      );
      templeMesh.rotation.z = side * 0.08;
      templeMesh.rotation.x = 0.12;
      capGroup.add(templeMesh);
    }
  }

  return capGroup;
}

/**
 * Builds a complete, articulated, smooth-sculpted 3D Humanoid Puppet Rig (Characters 1 through 7)
 * with balanced head-to-body proportions, seamless Capsule/Lathe anatomy, sculpted hands & sneakers,
 * cranium-hugging hair above the eyebrows, and zero internal blocky wireframe lines.
 */
function buildThreeHumanoidCharacterRig(
  options: ThreeCharacterRigOptions
): ThreeCharacterRigHandle {
  const {
    characterId,
    archetype = 'business-commuter',
    skinToneOverride,
    topColorOverride,
    bottomColorOverride,
    hairColorOverride,
  } = options;

  const rootGroup = new THREE.Group();
  rootGroup.name = `char3d-${characterId}`;
  rootGroup.userData.__isSmoothCharacterRig = true;

  // Contact shadow disc on floor
  const shadowGeo = new THREE.CircleGeometry(0.42, 28);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x050811,
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
  });
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.position.y = 0.015;
  rootGroup.add(shadowDisc);

  // Select palette colors by characterId
  let skinHex: string = SKIN_TONE_PALETTES.warmPeach.base;
  let topHex = '#EF4444';
  let sleeveHex = '#FEF3C7';
  let undershirtHex = '#38BDF8';
  let pantsHex = '#1E3A8A';
  let shoeHex = '#DC2626';
  let hairHex = '#451A03';

  if (characterId === 'main-boy') {
    const p = CHARACTER_OUTFIT_PALETTES.mainBoy;
    skinHex = SKIN_TONE_PALETTES[skinToneOverride ?? 'warmPeach'].base;
    topHex = p.jacket.base;
    sleeveHex = '#FEF3C7';
    undershirtHex = p.shirt.base;
    pantsHex = p.jeans.base;
    shoeHex = p.shoes.base;
    hairHex = p.hair.base;
  } else if (characterId === 'main-girl') {
    const p = CHARACTER_OUTFIT_PALETTES.mainGirl;
    skinHex = SKIN_TONE_PALETTES[skinToneOverride ?? 'lightIvory'].base;
    topHex = p.jacket.base;
    sleeveHex = p.jacket.highlight;
    undershirtHex = p.top.base;
    pantsHex = p.skirt.base;
    shoeHex = p.boots.base;
    hairHex = p.hair.base;
  } else if (characterId === 'hacker-friend') {
    const p = CHARACTER_OUTFIT_PALETTES.hackerFriend;
    skinHex = SKIN_TONE_PALETTES[skinToneOverride ?? 'oliveTan'].base;
    topHex = p.hoodie.base;
    sleeveHex = p.hoodie.shadow;
    undershirtHex = '#1E1B4B';
    pantsHex = p.pants.base;
    shoeHex = p.accent.base;
    hairHex = '#1E1B2E';
  } else if (characterId === 'hype-man') {
    const p = CHARACTER_OUTFIT_PALETTES.hypeMan;
    skinHex = SKIN_TONE_PALETTES[skinToneOverride ?? 'deepUmber'].base;
    topHex = p.tracksuit.base;
    sleeveHex = p.tracksuit.highlight;
    undershirtHex = '#18181B';
    pantsHex = p.pants.base;
    shoeHex = '#FACC15';
    hairHex = '#18181B';
  } else if (characterId === 'squad-member-a') {
    const p = CHARACTER_OUTFIT_PALETTES.squadMemberA;
    skinHex = SKIN_TONE_PALETTES[skinToneOverride ?? 'goldenBronze'].base;
    topHex = p.vest.base;
    sleeveHex = p.shirt.base;
    undershirtHex = p.shirt.base;
    pantsHex = p.cargo.base;
    shoeHex = '#1E293B';
    hairHex = p.beret.base;
  } else if (characterId === 'squad-member-b') {
    const p = CHARACTER_OUTFIT_PALETTES.squadMemberB;
    skinHex = SKIN_TONE_PALETTES[skinToneOverride ?? 'richAmber'].base;
    topHex = p.puffer.base;
    sleeveHex = p.puffer.highlight;
    undershirtHex = '#FACC15';
    pantsHex = p.trackPants.base;
    shoeHex = p.kicks.base;
    hairHex = '#3B1810';
  } else if (characterId === 'pedestrian') {
    skinHex = SKIN_TONE_PALETTES[skinToneOverride ?? 'goldenTan'].base;
    topHex = topColorOverride?.base ?? '#2563EB';
    sleeveHex = topColorOverride?.shadow ?? '#1D4ED8';
    undershirtHex = '#F8FAFC';
    pantsHex = bottomColorOverride?.base ?? '#334155';
    shoeHex = '#0F172A';
    hairHex = hairColorOverride?.base ?? '#451A03';
  }

  const skinMat = createMat(skinHex, 0.54, 0.04);
  const topMat = createMat(topHex, 0.5, 0.06);
  const sleeveMat = createMat(sleeveHex, 0.52, 0.05);
  const undershirtMat = createMat(undershirtHex, 0.56, 0.04);
  const pantsMat = createMat(pantsHex, 0.6, 0.04);
  const shoeMat = createMat(shoeHex, 0.42, 0.08);
  const soleMat = createMat('#F8FAFC', 0.48, 0.04);
  const hairMat = createMat(hairHex, 0.44, 0.06);
  const goldMat = createMat('#FACC15', 0.25, 0.65);
  const darkMat = createMat('#0A0812', 0.2, 0.15);

  // Pelvis root at hip height (0.76m) with smooth sculpted hip bowl
  const pelvis = new THREE.Group();
  pelvis.name = 'pelvis';
  pelvis.position.set(0, 0.76, 0);
  rootGroup.add(pelvis);

  const hipBowlGeo = new THREE.CapsuleGeometry(0.145, 0.11, 18, 32);
  hipBowlGeo.rotateZ(Math.PI / 2);
  hipBowlGeo.scale(1.0, 0.94, 0.84);
  const hipBowlMesh = createSmoothCharMesh(hipBowlGeo, pantsMat);
  hipBowlMesh.position.set(0, 0.015, 0);
  pelvis.add(hipBowlMesh);

  // Smooth sculpted legs (CapsuleGeometry Thigh -> CapsuleGeometry Calf -> Sculpted 3D Sneaker/Boot)
  const legMat =
    characterId === 'main-girl' ? createMat('#831843', 0.56, 0.04) : pantsMat;

  const makeLeg = (side: -1 | 1, suffix: 'l' | 'r') => {
    const upperLeg = new THREE.Group();
    upperLeg.name = `upper-leg-${suffix}`;
    upperLeg.position.set(side * 0.11, 0, 0);

    const thighGeo = new THREE.CapsuleGeometry(0.08, 0.22, 16, 28);
    thighGeo.translate(0, -0.15, 0);
    const thighMesh = createSmoothCharMesh(thighGeo, legMat);
    upperLeg.add(thighMesh);

    const lowerLeg = new THREE.Group();
    lowerLeg.name = `lower-leg-${suffix}`;
    lowerLeg.position.set(0, -0.33, 0);

    const shinGeo = new THREE.CapsuleGeometry(0.066, 0.21, 16, 28);
    shinGeo.translate(0, -0.15, 0);
    const shinMesh = createSmoothCharMesh(shinGeo, legMat);
    lowerLeg.add(shinMesh);

    // Sculpted Ankle Cuff / Sock Ring
    const cuffGeo = new THREE.TorusGeometry(0.058, 0.014, 12, 24);
    cuffGeo.rotateX(Math.PI / 2);
    const cuffMesh = createSmoothCharMesh(cuffGeo, soleMat);
    cuffMesh.position.set(0, -0.28, 0);
    lowerLeg.add(cuffMesh);

    const foot = new THREE.Group();
    foot.name = `foot-${suffix}`;
    foot.position.set(0, -0.32, 0);

    // Sculpted Rounded 3D Sneaker / Boot
    const shoeUpperGeo = new THREE.CapsuleGeometry(0.066, 0.115, 16, 28);
    shoeUpperGeo.rotateX(Math.PI / 2);
    shoeUpperGeo.scale(1.06, 0.78, 1.0);
    const shoeUpper = createSmoothCharMesh(shoeUpperGeo, shoeMat);
    shoeUpper.position.set(0, -0.042, 0.048);

    const toeCapGeo = new THREE.SphereGeometry(0.066, 24, 18);
    toeCapGeo.scale(1.04, 0.68, 0.92);
    const toeCap = createSmoothCharMesh(
      toeCapGeo,
      characterId === 'main-girl' ? shoeMat : soleMat
    );
    toeCap.position.set(0, -0.048, 0.112);

    const shoeSoleGeo = new THREE.CapsuleGeometry(0.07, 0.13, 14, 28);
    shoeSoleGeo.rotateX(Math.PI / 2);
    shoeSoleGeo.scale(1.12, 0.34, 1.04);
    const shoeSole = createSmoothCharMesh(shoeSoleGeo, soleMat);
    shoeSole.position.set(0, -0.08, 0.05);

    foot.add(shoeUpper, toeCap, shoeSole);

    lowerLeg.add(foot);
    upperLeg.add(lowerLeg);
    pelvis.add(upperLeg);

    return { upperLeg, lowerLeg, foot };
  };

  const legL = makeLeg(-1, 'l');
  const legR = makeLeg(1, 'r');

  // Torso Group (pivots at waist y=0 relative to pelvis)
  const torso = new THREE.Group();
  torso.name = 'torso';
  pelvis.add(torso);

  const isHoodie = characterId === 'hacker-friend';
  const isPuffer = characterId === 'squad-member-b';
  const torsoTopRadius = isHoodie || isPuffer ? 0.215 : 0.198;
  const torsoWaistRadius = isHoodie ? 0.195 : 0.168;

  // Single clean sculpted tapered torso + rounded shoulder yoke (zero intersecting spheres!)
  const torsoCylGeo = new THREE.CylinderGeometry(
    torsoTopRadius,
    torsoWaistRadius,
    0.46,
    36,
    12
  );
  torsoCylGeo.scale(1.15, 1.0, 0.8);
  torsoCylGeo.translate(0, 0.25, 0);
  const torsoMesh = createSmoothCharMesh(torsoCylGeo, topMat);
  torso.add(torsoMesh);

  // Smooth rounded shoulder/collarbone yoke dome capping the top of the torso cylinder
  const shoulderYokeGeo = new THREE.SphereGeometry(
    torsoTopRadius,
    36,
    20,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.5
  );
  shoulderYokeGeo.scale(1.15, 0.38, 0.8);
  const shoulderYoke = createSmoothCharMesh(shoulderYokeGeo, topMat);
  shoulderYoke.position.set(0, 0.478, 0);
  torso.add(shoulderYoke);

  // Clean crew-neck / V-neck undershirt collar triangle at top of chest (no M-shaped sphere intersections!)
  const vNeckGeo = new THREE.ConeGeometry(0.068, 0.14, 24);
  vNeckGeo.rotateX(Math.PI);
  vNeckGeo.scale(1.1, 1.0, 0.35);
  const vNeckMesh = createSmoothCharMesh(vNeckGeo, undershirtMat);
  vNeckMesh.position.set(0, 0.44, torsoTopRadius * 0.76);
  torso.add(vNeckMesh);

  // Clean vertical center zipper / placket line on jacket
  const zipperGeo = new THREE.CapsuleGeometry(0.011, 0.36, 10, 18);
  const zipperMesh = createSmoothCharMesh(zipperGeo, sleeveMat);
  zipperMesh.position.set(0, 0.26, torsoTopRadius * 0.78);
  torso.add(zipperMesh);

  // Smooth collar ring around base of neck
  const collarGeo = new THREE.TorusGeometry(0.086, 0.022, 14, 28);
  collarGeo.rotateX(Math.PI * 0.48);
  const collarMesh = createSmoothCharMesh(collarGeo, topMat);
  collarMesh.position.set(0, 0.515, -0.004);
  torso.add(collarMesh);

  // Smooth waist hem ring
  const waistHemGeo = new THREE.TorusGeometry(torsoWaistRadius * 0.98, 0.02, 14, 28);
  waistHemGeo.rotateX(Math.PI / 2);
  waistHemGeo.scale(1.15, 0.8, 1.0);
  const waistHem = createSmoothCharMesh(waistHemGeo, sleeveMat);
  waistHem.position.set(0, 0.04, 0);
  torso.add(waistHem);

  if (characterId === 'main-girl') {
    // Smooth flared 3D Skirt at waist
    const skirtGeo = new THREE.CylinderGeometry(0.18, 0.25, 0.22, 32, 8);
    skirtGeo.scale(1.1, 1.0, 0.84);
    const skirtMesh = createSmoothCharMesh(skirtGeo, pantsMat);
    skirtMesh.position.set(0, 0.04, 0);
    torso.add(skirtMesh);
  } else if (characterId === 'pedestrian' && archetype === 'business-commuter') {
    // Smooth sculpted 3D Necktie
    const tieGeo = new THREE.CapsuleGeometry(0.02, 0.24, 10, 20);
    tieGeo.scale(1.1, 1.0, 0.45);
    const tieMesh = createSmoothCharMesh(
      tieGeo,
      createMat('#EF4444', 0.42, 0.08)
    );
    tieMesh.position.set(0, 0.31, torsoTopRadius * 0.81);
    torso.add(tieMesh);
  } else if (characterId === 'pedestrian' && archetype === 'elder-coat') {
    // Smooth long trenchcoat skirt tail
    const coatTailGeo = new THREE.CylinderGeometry(0.19, 0.24, 0.3, 32, 8);
    coatTailGeo.scale(1.12, 1.0, 0.8);
    const coatTail = createSmoothCharMesh(coatTailGeo, topMat);
    coatTail.position.set(0, -0.06, 0);
    torso.add(coatTail);
  } else if (characterId === 'hype-man') {
    // Smooth Gold chain & medallion
    const chainGeo = new THREE.TorusGeometry(0.105, 0.015, 14, 28);
    const chainMesh = createSmoothCharMesh(chainGeo, goldMat);
    chainMesh.position.set(0, 0.43, 0.148);
    const medalGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.018, 24);
    medalGeo.rotateX(Math.PI / 2);
    const medalMesh = createSmoothCharMesh(medalGeo, goldMat);
    medalMesh.position.set(0, 0.32, 0.175);
    torso.add(chainMesh, medalMesh);
  } else if (characterId === 'squad-member-b') {
    // Smooth quilted puffer horizontal bolsters
    for (const ry of [0.15, 0.28, 0.41]) {
      const puffGeo = new THREE.TorusGeometry(0.205, 0.024, 14, 28);
      puffGeo.rotateX(Math.PI / 2);
      puffGeo.scale(1.15, 0.8, 1.0);
      const puff = createSmoothCharMesh(puffGeo, sleeveMat);
      puff.position.set(0, ry, 0);
      torso.add(puff);
    }
  }

  // Smooth Sculpted Arms (Shoulder Sphere + Capsule Upper Arm -> Capsule Forearm -> Sculpted 3D Hand with Thumb & Fingers)
  const makeArm = (side: -1 | 1, suffix: 'l' | 'r') => {
    const upperArm = new THREE.Group();
    upperArm.name = `upper-arm-${suffix}`;
    upperArm.position.set(side * 0.255, 0.45, 0);

    // Deltoid shoulder sphere for gap-free rotation
    const deltoidGeo = new THREE.SphereGeometry(0.068, 22, 18);
    const deltoidMesh = createSmoothCharMesh(deltoidGeo, sleeveMat);
    upperArm.add(deltoidMesh);

    const uGeo = new THREE.CapsuleGeometry(0.058, 0.18, 16, 28);
    uGeo.translate(0, -0.125, 0);
    const uMesh = createSmoothCharMesh(uGeo, sleeveMat);
    upperArm.add(uMesh);

    const lowerArm = new THREE.Group();
    lowerArm.name = `lower-arm-${suffix}`;
    lowerArm.position.set(0, -0.25, 0);

    const lGeo = new THREE.CapsuleGeometry(0.05, 0.17, 16, 28);
    lGeo.translate(0, -0.115, 0);
    const lMesh = createSmoothCharMesh(lGeo, sleeveMat);
    lowerArm.add(lMesh);

    const wristCuffGeo = new THREE.TorusGeometry(0.048, 0.013, 12, 24);
    wristCuffGeo.rotateX(Math.PI / 2);
    const wristCuff = createSmoothCharMesh(wristCuffGeo, topMat);
    wristCuff.position.set(0, -0.21, 0);
    lowerArm.add(wristCuff);

    const hand = new THREE.Group();
    hand.name = `hand-${suffix}`;
    hand.position.set(0, -0.23, 0);

    // Sculpted 3D Palm
    const palmGeo = new THREE.CapsuleGeometry(0.042, 0.03, 14, 24);
    palmGeo.scale(1.04, 1.0, 0.68);
    const palmMesh = createSmoothCharMesh(palmGeo, skinMat);
    palmMesh.position.set(0, -0.04, 0);
    hand.add(palmMesh);

    // Articulated 3D Thumb
    const thumbGeo = new THREE.CapsuleGeometry(0.015, 0.03, 10, 18);
    const thumbMesh = createSmoothCharMesh(thumbGeo, skinMat);
    thumbMesh.position.set(side * 0.042, -0.032, 0.016);
    thumbMesh.rotation.z = side * -0.52;
    thumbMesh.rotation.x = 0.25;
    hand.add(thumbMesh);

    // Sculpted 3D Finger Cluster
    for (let fi = 0; fi < 4; fi++) {
      const fx = (fi - 1.5) * 0.017;
      const fingerGeo = new THREE.CapsuleGeometry(0.0115, 0.032, 10, 16);
      const fingerMesh = createSmoothCharMesh(fingerGeo, skinMat);
      fingerMesh.position.set(fx, -0.078, 0.004);
      hand.add(fingerMesh);
    }

    lowerArm.add(hand);
    upperArm.add(lowerArm);
    torso.add(upperArm);

    return { upperArm, lowerArm, hand };
  };

  const armL = makeArm(-1, 'l');
  const armR = makeArm(1, 'r');

  // Head Group (pivots at neck y=0.53 on torso)
  const head = new THREE.Group();
  head.name = 'head';
  head.position.set(0, 0.53, 0);
  torso.add(head);

  const neckGeo = new THREE.CapsuleGeometry(0.062, 0.06, 16, 26);
  neckGeo.translate(0, 0.045, 0);
  const neckMesh = createSmoothCharMesh(neckGeo, skinMat);
  head.add(neckMesh);

  // Balanced, appealing cartoon 3D head (radius 0.22m, 36x32 segments)
  const headRadius = 0.22;
  const headCenterY = 0.265;
  const craniumGeo = new THREE.SphereGeometry(headRadius, 36, 32);
  craniumGeo.scale(0.99, 1.06, 0.95);
  const craniumMesh = createSmoothCharMesh(craniumGeo, skinMat);
  craniumMesh.position.set(0, headCenterY, 0);
  head.add(craniumMesh);

  // Smooth 3D Ears
  const earGeo = new THREE.SphereGeometry(0.048, 20, 16);
  earGeo.scale(0.52, 1.0, 0.72);
  const earL = createSmoothCharMesh(earGeo, skinMat);
  earL.position.set(-headRadius * 0.99, headCenterY - 0.01, -0.01);
  const earR = createSmoothCharMesh(earGeo, skinMat);
  earR.position.set(headRadius * 0.99, headCenterY - 0.01, -0.01);
  head.add(earL, earR);

  // Shared 3D Face System mounted at headCenterY
  const faceRig = buildThreeFaceRig(headRadius, skinHex);
  faceRig.eyesGroup.position.y = headCenterY;
  faceRig.browsGroup.position.y = headCenterY;
  faceRig.mouthGroup.position.y = headCenterY;
  faceRig.jawGroup.position.y = headCenterY;
  head.add(
    faceRig.eyesGroup,
    faceRig.browsGroup,
    faceRig.mouthGroup,
    faceRig.jawGroup
  );

  // 3D Hair & Hat Group (Cranium-hugging hair cap + sideburns, with front hairline cleanly above eyebrows!)
  const hair = new THREE.Group();
  hair.name = 'hair';
  hair.position.set(0, headCenterY, 0);
  head.add(hair);

  const hat = new THREE.Group();
  hat.name = 'hat';
  hat.position.set(0, headCenterY + headRadius * 0.88, 0);
  head.add(hat);

  if (characterId === 'main-boy') {
    // 1. Cranium-hugging sculpted hair cap + temple sideburns + back bowl
    hair.add(buildSculptedHairBaseCap(headRadius, hairMat, Math.PI * 0.42, -0.24, true));

    // 2. Smooth sculpted upward/swept anime spikes on the crown (above forehead/eyebrows!)
    const spikeOffsets: [number, number, number, number, number][] = [
      [-0.1, 0.215, 0.05, -0.15, 0.36],
      [0.0, 0.24, 0.06, -0.2, 0.0],
      [0.1, 0.215, 0.05, -0.15, -0.36],
      [-0.18, 0.175, 0.0, -0.1, 0.62],
      [0.18, 0.175, 0.0, -0.1, -0.62],
      [0.0, 0.22, -0.08, -0.55, 0.0],
    ];
    for (const [sx, sy, sz, rx, rz] of spikeOffsets) {
      const coneGeo = new THREE.ConeGeometry(0.066, 0.17, 20);
      const cone = createSmoothCharMesh(coneGeo, hairMat);
      cone.position.set(sx, sy, sz);
      cone.rotation.set(rx, 0, rz);
      hair.add(cone);
    }
  } else if (characterId === 'main-girl') {
    // 1. Cranium-hugging chestnut hair cap + sidelocks (front hairline sits cleanly above eyebrows!)
    hair.add(buildSculptedHairBaseCap(headRadius, hairMat, Math.PI * 0.42, -0.24, true));

    // 2. Smooth flowing back hair cascade
    const backHairCenterGeo = new THREE.CapsuleGeometry(0.125, 0.26, 18, 28);
    backHairCenterGeo.scale(1.55, 1.0, 0.72);
    const backHairCenter = createSmoothCharMesh(backHairCenterGeo, hairMat);
    backHairCenter.position.set(0, -0.1, -0.13);
    hair.add(backHairCenter);

    // Side-framing locks tucked beside cheeks/ears (x = ±0.212, z = -0.02) so eyes & eyebrows are 100% clear
    for (const side of [-1, 1]) {
      const sideLockGeo = new THREE.CapsuleGeometry(0.054, 0.24, 14, 24);
      const sideLock = createSmoothCharMesh(sideLockGeo, hairMat);
      sideLock.position.set(side * 0.21, -0.02, -0.02);
      sideLock.rotation.z = side * -0.08;
      hair.add(sideLock);
    }

    // Golden headband arched cleanly across the crown
    const bandGeo = new THREE.TorusGeometry(
      headRadius * 1.05,
      0.022,
      16,
      32,
      Math.PI * 1.08
    );
    const bandMesh = createSmoothCharMesh(bandGeo, goldMat);
    bandMesh.position.set(0, 0.03, -0.01);
    bandMesh.rotation.x = -0.32;
    bandMesh.rotation.z = 0.03;
    hair.add(bandMesh);
  } else if (characterId === 'hacker-friend') {
    // 1. Cranium-hugging Hoodie Cowl + dark hair temples (front arch sits cleanly above eyebrows!)
    hair.add(buildSculptedHairBaseCap(headRadius, hairMat, Math.PI * 0.41, -0.26, true));

    const cowlGeo = new THREE.SphereGeometry(
      headRadius * 1.12,
      32,
      24,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.45
    );
    const cowlMesh = createSmoothCharMesh(cowlGeo, topMat);
    cowlMesh.position.set(0, 0.02, -0.03);
    cowlMesh.rotation.x = -0.34;
    hair.add(cowlMesh);

    const cowlBackGeo = new THREE.SphereGeometry(
      headRadius * 1.11,
      28,
      20,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.52
    );
    const cowlBack = createSmoothCharMesh(cowlBackGeo, topMat);
    cowlBack.position.set(0, 0.0, -0.03);
    cowlBack.rotation.x = -0.98;
    hair.add(cowlBack);

    // Smooth Cyan Headphones over crown & ears
    const cyanMat = createMat('#22D3EE', 0.25, 0.3);
    const arcGeo = new THREE.TorusGeometry(headRadius * 1.14, 0.022, 16, 32, Math.PI);
    const arcMesh = createSmoothCharMesh(arcGeo, cyanMat);
    arcMesh.position.set(0, 0.015, -0.01);
    hair.add(arcMesh);

    const cupGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.05, 24);
    cupGeo.rotateZ(Math.PI / 2);
    const cupL = createSmoothCharMesh(cupGeo, cyanMat);
    cupL.position.set(-headRadius * 1.08, 0.01, -0.01);
    const cupR = createSmoothCharMesh(cupGeo, cyanMat);
    cupR.position.set(headRadius * 1.08, 0.01, -0.01);
    hair.add(cupL, cupR);
  } else if (characterId === 'hype-man') {
    // Cranium-hugging dark hair fade + Backwards Crimson Visor Cap
    hair.add(buildSculptedHairBaseCap(headRadius, hairMat, Math.PI * 0.42, -0.25, true));
    const capMat = createMat('#EF4444', 0.44, 0.08);
    hair.add(buildSculptedHairBaseCap(headRadius * 1.02, capMat, Math.PI * 0.41, -0.24, false));

    const billGeo = new THREE.CapsuleGeometry(0.076, 0.09, 14, 24);
    billGeo.scale(1.25, 0.22, 1.1);
    const billMesh = createSmoothCharMesh(
      billGeo,
      createMat('#B91C1C', 0.48, 0.08)
    );
    billMesh.position.set(0, 0.08, -headRadius * 1.06);
    billMesh.rotation.x = -0.15;
    hair.add(billMesh);
  } else if (characterId === 'squad-member-a') {
    // Cranium-hugging hair + Smooth Sculpted Tactical Olive Beret
    const darkHairMat = createMat('#27272A', 0.48, 0.05);
    hair.add(buildSculptedHairBaseCap(headRadius, darkHairMat, Math.PI * 0.42, -0.25, true));

    const beretCrownGeo = new THREE.SphereGeometry(0.225, 28, 22);
    beretCrownGeo.scale(1.08, 0.36, 1.04);
    const beretMesh = createSmoothCharMesh(
      beretCrownGeo,
      createMat('#15803D', 0.52, 0.08)
    );
    beretMesh.position.set(0.02, 0.2, -0.01);
    beretMesh.rotation.z = -0.14;
    beretMesh.rotation.x = -0.12;
    hair.add(beretMesh);

    const rimGeo = new THREE.TorusGeometry(0.198, 0.016, 14, 28);
    rimGeo.rotateX(Math.PI * 0.46);
    const rimMesh = createSmoothCharMesh(rimGeo, darkMat);
    rimMesh.position.set(0, 0.165, -0.01);
    hair.add(rimMesh);
  } else if (characterId === 'squad-member-b') {
    // Curly Hair Puffs at side temples + Cranium-hugging Yellow Beanie & Pom-Pom
    hair.add(buildSculptedHairBaseCap(headRadius, hairMat, Math.PI * 0.42, -0.25, true));
    for (const cx of [-0.215, 0.215]) {
      const curlGeo = new THREE.SphereGeometry(0.074, 20, 16);
      const curl = createSmoothCharMesh(curlGeo, hairMat);
      curl.position.set(cx, 0.11, -0.02);
      hair.add(curl);
    }
    hair.add(buildSculptedHairBaseCap(headRadius * 1.02, goldMat, Math.PI * 0.41, -0.24, false));

    const pomGeo = new THREE.SphereGeometry(0.066, 20, 16);
    const pomMesh = createSmoothCharMesh(
      pomGeo,
      createMat('#EC4899', 0.56, 0.05)
    );
    pomMesh.position.y = 0.065;
    hat.add(pomMesh);
  } else if (characterId === 'pedestrian') {
    if (archetype === 'elder-coat') {
      hair.add(buildSculptedHairBaseCap(headRadius, hairMat, Math.PI * 0.42, -0.25, true));
      const brimGeo = new THREE.CylinderGeometry(0.31, 0.31, 0.022, 28);
      const crownGeo = new THREE.CapsuleGeometry(0.16, 0.065, 16, 28);
      crownGeo.translate(0, 0.055, 0);
      const brim = createSmoothCharMesh(brimGeo, hairMat);
      const crown = createSmoothCharMesh(crownGeo, hairMat);
      brim.position.set(0, 0.185, -0.01);
      brim.rotation.x = -0.14;
      crown.position.set(0, 0.185, -0.01);
      crown.rotation.x = -0.14;
      hair.add(brim, crown);
    } else if (archetype === 'jogger-hoodie') {
      hair.add(buildSculptedHairBaseCap(headRadius, hairMat, Math.PI * 0.42, -0.24, true));
      const sweatBandGeo = new THREE.TorusGeometry(
        headRadius * 0.96,
        0.022,
        14,
        28
      );
      sweatBandGeo.rotateX(Math.PI * 0.42);
      const sweatBand = createSmoothCharMesh(
        sweatBandGeo,
        createMat('#22D3EE', 0.38, 0.08)
      );
      sweatBand.position.set(0, 0.145, -0.01);
      hair.add(sweatBand);
    } else {
      // Business commuter neat side-part hair hugging cranium with clean forehead
      hair.add(buildSculptedHairBaseCap(headRadius, hairMat, Math.PI * 0.42, -0.24, true));
      const waveGeo = new THREE.CapsuleGeometry(0.044, 0.13, 14, 24);
      waveGeo.rotateZ(Math.PI * 0.42);
      const waveMesh = createSmoothCharMesh(waveGeo, hairMat);
      waveMesh.position.set(0.04, 0.215, 0.04);
      hair.add(waveMesh);
    }
  }

  // Accessories Group (3D Sunglasses + Character-Specific 3D Props)
  const accessories = new THREE.Group();
  accessories.name = 'accessories';
  head.add(accessories);

  // Smooth 3D Sunglasses (for Main Boy & Main Girl next-day toggle)
  const sunglassesGroup = new THREE.Group();
  sunglassesGroup.name = 'sunglasses';
  sunglassesGroup.position.set(0, headCenterY + 0.01, headRadius * 0.96);
  const lensGeo = new THREE.CapsuleGeometry(0.048, 0.068, 12, 22);
  lensGeo.rotateZ(Math.PI / 2);
  lensGeo.scale(1.0, 1.0, 0.38);
  const lensL = createSmoothCharMesh(lensGeo, darkMat);
  lensL.position.x = -0.095;
  const lensR = createSmoothCharMesh(lensGeo, darkMat);
  lensR.position.x = 0.095;
  const bridgeGeo = new THREE.CapsuleGeometry(0.011, 0.055, 8, 16);
  bridgeGeo.rotateZ(Math.PI / 2);
  const bridge = createSmoothCharMesh(bridgeGeo, goldMat);
  sunglassesGroup.add(lensL, lensR, bridge);
  sunglassesGroup.visible = Boolean(options.sunglasses);
  accessories.add(sunglassesGroup);

  // Character-specific 3D Hand Props
  let girlDollProp: THREE.Group | null = null;
  let hackerPhoneProp: THREE.Group | null = null;
  let hackerSnackProp: THREE.Group | null = null;
  let hypeSignMesh: THREE.Mesh | null = null;
  let hypeSignGroup: THREE.Group | null = null;

  if (characterId === 'main-girl') {
    // 3D Miniature Christmas Nutcracker Doll held in hand
    girlDollProp = new THREE.Group();
    const dBody = createSmoothCharMesh(
      new THREE.CapsuleGeometry(0.05, 0.1, 14, 22),
      createMat('#DC2626', 0.4, 0.1)
    );
    const dHead = createSmoothCharMesh(
      new THREE.SphereGeometry(0.048, 18, 16),
      createMat('#FDBA74', 0.5, 0.05)
    );
    dHead.position.y = 0.12;
    const dHat = createSmoothCharMesh(
      new THREE.CylinderGeometry(0.05, 0.046, 0.09, 20),
      darkMat
    );
    dHat.position.y = 0.19;
    girlDollProp.add(dBody, dHead, dHat);
    girlDollProp.position.set(0, -0.08, 0.11);
    girlDollProp.visible = false;
    armR.hand.add(girlDollProp);
  } else if (characterId === 'hacker-friend') {
    // Left Hand: 3D Orange Snack Bag
    hackerSnackProp = new THREE.Group();
    const bagGeo = new THREE.CapsuleGeometry(0.065, 0.1, 14, 22);
    bagGeo.scale(1.15, 1.0, 0.65);
    const bagMesh = createSmoothCharMesh(
      bagGeo,
      createMat('#F97316', 0.45, 0.1)
    );
    const labelGeo = new THREE.CapsuleGeometry(0.038, 0.05, 10, 18);
    labelGeo.rotateZ(Math.PI / 2);
    labelGeo.scale(1.0, 1.0, 0.35);
    const labelMesh = createSmoothCharMesh(labelGeo, goldMat);
    labelMesh.position.z = 0.036;
    hackerSnackProp.add(bagMesh, labelMesh);
    hackerSnackProp.position.set(0, -0.08, 0.09);
    armL.hand.add(hackerSnackProp);

    // Right Hand: Glowing Cyan OLED 3D Smartphone
    hackerPhoneProp = new THREE.Group();
    const phoneBody = createSmoothCharMesh(
      new THREE.BoxGeometry(0.088, 0.155, 0.022),
      darkMat
    );
    const phoneScreen = createSmoothCharMesh(
      new THREE.BoxGeometry(0.074, 0.136, 0.025),
      createMat('#38BDF8', 0.15, 0.1, '#38BDF8', 0.85)
    );
    hackerPhoneProp.add(phoneBody, phoneScreen);
    hackerPhoneProp.position.set(0, -0.06, 0.09);
    armR.hand.add(hackerPhoneProp);
  } else if (characterId === 'hype-man') {
    // 3D Cardboard Countdown Sign on Stick
    hypeSignGroup = new THREE.Group();
    hypeSignGroup.position.set(0, headCenterY + 0.42, 0.08);
    const stickMesh = createSmoothCharMesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.36, 16),
      createMat('#92400E', 0.7, 0.05)
    );
    stickMesh.position.y = -0.16;
    const boardGeo = new THREE.BoxGeometry(0.56, 0.28, 0.04);
    const signTex = getCountdownSignTexture(options.countdownValue ?? '10');
    const boardMat = new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.6,
      metalness: 0.05,
    });
    hypeSignMesh = createSmoothCharMesh(boardGeo, boardMat);
    hypeSignGroup.add(stickMesh, hypeSignMesh);
    head.add(hypeSignGroup);
  } else if (characterId === 'pedestrian' && archetype === 'business-commuter') {
    const briefcase = createSmoothCharMesh(
      new THREE.BoxGeometry(0.21, 0.15, 0.055),
      createMat('#78350F', 0.6, 0.1)
    );
    briefcase.position.set(0, -0.12, 0.06);
    armR.hand.add(briefcase);
  } else if (characterId === 'pedestrian' && archetype === 'elder-coat') {
    const cane = createSmoothCharMesh(
      new THREE.CylinderGeometry(0.015, 0.013, 0.56, 16),
      createMat('#78350F', 0.6, 0.1)
    );
    cane.position.set(0, -0.28, 0.08);
    armR.hand.add(cane);
  }

  // Apply Smooth Character Cel-Shading (no internal EdgesGeometry lines!)
  const styleHandle = applyMainStreetStyleToSceneGraph(rootGroup, {
    smoothOrganicCharacter: true,
  });

  // Load and attach the rigged .glb character model (with Main Street Cel-Shading & Comic Ink Outline)
  let glbInstance: GlbCharacterInstanceHandle | null = null;
  let isDisposed = false;
  let lastEvalParams: ThreeCharacterEvaluationParams = { frame: 0 };

  const glbWearablesGroup = new THREE.Group();
  glbWearablesGroup.name = 'glb-wearables-overlay';
  glbWearablesGroup.visible = false;
  rootGroup.add(glbWearablesGroup);

  const glbEntry = getGlbAssetEntryForCharacter(characterId, {
    archetype,
    modelIdOverride: options.glbModelIdOverride,
  });

  if (typeof window !== 'undefined' && glbEntry) {
    const loadPromises: Promise<unknown>[] = [
      loadCachedGlbAsset(glbEntry.modelId),
    ];
    if (
      glbEntry.skeletonFamily === 'max-biped' &&
      !glbEntry.hasEmbeddedAnimation
    ) {
      loadPromises.push(
        loadCachedGlbAsset('idle-male-loop'),
        loadCachedGlbAsset('basic-walk-female-loop'),
      );
    }

    Promise.all(loadPromises)
      .then((results) => {
        if (isDisposed) return;
        const primaryGltf = results[0] as Awaited<
          ReturnType<typeof loadCachedGlbAsset>
        >;
        const donorIdleGltf = (results[1] ?? null) as Awaited<
          ReturnType<typeof loadCachedGlbAsset>
        > | null;
        const donorWalkGltf = (results[2] ?? null) as Awaited<
          ReturnType<typeof loadCachedGlbAsset>
        > | null;

        glbInstance = instantiatePreparedGlbCharacter(glbEntry, primaryGltf, {
          tintColorHex: options.topColorOverride?.base,
          tintStrength: options.topColorOverride ? 0.28 : 0,
          donorIdleGltf,
          donorWalkGltf,
        });

        rootGroup.add(glbInstance.wrapperGroup);

        // Reparent interactive 3D wearables/props onto glbWearablesGroup at normalized GLB coordinates
        sunglassesGroup.position.set(0, 1.54, 0.14);
        glbWearablesGroup.add(sunglassesGroup);

        if (hypeSignGroup) {
          hypeSignGroup.position.set(0, 1.92, 0.08);
          glbWearablesGroup.add(hypeSignGroup);
        }
        if (girlDollProp) {
          girlDollProp.position.set(0.24, 1.02, 0.18);
          glbWearablesGroup.add(girlDollProp);
        }
        if (hackerSnackProp) {
          hackerSnackProp.position.set(-0.24, 1.02, 0.16);
          glbWearablesGroup.add(hackerSnackProp);
        }
        if (hackerPhoneProp) {
          hackerPhoneProp.position.set(0.22, 1.06, 0.18);
          glbWearablesGroup.add(hackerPhoneProp);
        }

        // Hide procedural fallback body and show GLB rig + wearables
        pelvis.visible = false;
        glbWearablesGroup.visible = true;

        glbInstance.evaluateAtFrame({
          frame: lastEvalParams.frame,
          fps: lastEvalParams.fps ?? 60,
          pose: lastEvalParams.pose ?? options.pose ?? 'walk',
          expression: lastEvalParams.expression ?? options.expression ?? 'happy',
          facing: lastEvalParams.facing ?? options.facing ?? 'right',
          seed: options.seed ?? characterId,
          speed: options.speed ?? 1,
          startFrame: options.startFrame ?? 0,
        });
        notifyGlbCharacterMounted();
      })
      .catch(() => {
        // Keep procedural 3D character visible if GLB fetch fails in offline test environment
      });
  }

  const updateAtFrame = (params: ThreeCharacterEvaluationParams) => {
    lastEvalParams = params;
    const fps = params.fps ?? 60;
    const localFrame =
      Math.max(0, (params.frame - (options.startFrame ?? 0)) * (options.speed ?? 1));
    const activePose = params.pose ?? options.pose ?? 'walk';
    const activeExpr = params.expression ?? options.expression ?? 'happy';
    const activeFacing = params.facing ?? options.facing ?? 'right';
    const seed = options.seed ?? characterId;

    const primaryJoints: JointAngles = evaluatePoseJointAngles(
      activePose,
      localFrame,
      { fps, seed }
    );
    const joints =
      params.secondaryPose && (params.poseBlend ?? 0) > 0
        ? blendJointAngles(
            primaryJoints,
            evaluatePoseJointAngles(params.secondaryPose, localFrame, {
              fps,
              seed,
            }),
            params.poseBlend ?? 0
          )
        : primaryJoints;

    const faceState = evaluateExpressionFaceState(
      activeExpr,
      activePose,
      localFrame,
      seed
    );

    const scaleVal = options.scale ?? 1.0;
    rootGroup.scale.setScalar(scaleVal);

    // Orient 3D character slightly toward viewer while facing right (+X) or left (-X)
    rootGroup.rotation.y = activeFacing === 'left' ? -0.35 : 0.35;

    if (glbInstance) {
      glbInstance.evaluateAtFrame({
        frame: params.frame,
        fps,
        pose: activePose,
        expression: activeExpr,
        facing: activeFacing,
        seed,
        speed: options.speed ?? 1,
        startFrame: options.startFrame ?? 0,
      });
    }

    // Pelvis bounce & sway (convert 2D px to 3D meters: 1px ≈ 0.0045m)
    pelvis.position.x = joints.rootX * 0.0045;
    pelvis.position.y = 0.76 - joints.rootY * 0.0045;

    // Torso pitch/roll & breathing squash
    torso.rotation.z = THREE.MathUtils.degToRad(-joints.torsoRotate * 0.65);
    torso.rotation.x = THREE.MathUtils.degToRad(joints.torsoRotate * 0.45);
    torso.scale.y = joints.torsoSquashY;

    // Head rotation & offsets
    head.rotation.z = THREE.MathUtils.degToRad(-joints.headRotate * 0.6);
    head.rotation.y = THREE.MathUtils.degToRad(joints.headRotate * 0.8);
    head.position.x = joints.headOffsetX * 0.004;
    head.position.y = 0.53 - joints.headOffsetY * 0.004;

    // Hair & Hat tassel secondary motion (clamped so hair never dips toward eyes)
    hair.rotation.z = THREE.MathUtils.degToRad(-joints.hairSwing * 0.25);
    hat.rotation.z = THREE.MathUtils.degToRad(-joints.hatTasselSwing * 0.65);

    // Left & Right 3D Arms (pitch forward/back on X, raise outward on Z)
    armL.upperArm.rotation.x = THREE.MathUtils.degToRad(-joints.shoulderL * 0.85);
    armL.upperArm.rotation.z = THREE.MathUtils.degToRad(
      Math.max(0, -joints.shoulderL - 40) * 0.45 + 8
    );
    armL.lowerArm.rotation.x = THREE.MathUtils.degToRad(-joints.elbowL * 0.75);
    armL.hand.rotation.z = THREE.MathUtils.degToRad(-joints.wristL * 0.6);

    armR.upperArm.rotation.x = THREE.MathUtils.degToRad(-joints.shoulderR * 0.85);
    armR.upperArm.rotation.z = THREE.MathUtils.degToRad(
      -Math.max(0, -joints.shoulderR - 40) * 0.45 - 8
    );
    armR.lowerArm.rotation.x = THREE.MathUtils.degToRad(-joints.elbowR * 0.75);
    armR.hand.rotation.z = THREE.MathUtils.degToRad(-joints.wristR * 0.6);

    // Left & Right 3D Legs (stride forward/back on X)
    legL.upperLeg.rotation.x = THREE.MathUtils.degToRad(-joints.hipL * 0.9);
    legL.lowerLeg.rotation.x = THREE.MathUtils.degToRad(joints.kneeL * 0.85);
    legL.foot.rotation.x = THREE.MathUtils.degToRad(-joints.ankleL * 0.6);

    legR.upperLeg.rotation.x = THREE.MathUtils.degToRad(-joints.hipR * 0.9);
    legR.lowerLeg.rotation.x = THREE.MathUtils.degToRad(joints.kneeR * 0.85);
    legR.foot.rotation.x = THREE.MathUtils.degToRad(-joints.ankleR * 0.6);

    // Update 3D Face System
    updateThreeFaceRig(faceRig, faceState, headRadius, joints.jawDropPx);

    // Update Sunglasses & Character Props
    sunglassesGroup.visible = Boolean(params.sunglasses ?? options.sunglasses);
    if (girlDollProp) {
      girlDollProp.visible = activePose === 'holding-christmas-doll';
    }
    if (hypeSignGroup && hypeSignMesh) {
      const signVal =
        params.countdownValue ??
        options.countdownValue ??
        COUNTDOWN_SEQUENCE[
          Math.floor(localFrame / 18) % COUNTDOWN_SEQUENCE.length
        ];
      const tex = getCountdownSignTexture(signVal);
      const mat = hypeSignMesh.material as THREE.MeshToonMaterial;
      if (mat.map !== tex) {
        mat.map = tex;
        mat.needsUpdate = true;
      }
      hypeSignGroup.rotation.z = THREE.MathUtils.degToRad(-joints.propRotate);
      hypeSignGroup.position.y =
        (glbInstance ? 1.92 : headCenterY + 0.42) -
        joints.propOffsetY * 0.0045;
    }
  };

  // Run initial frame 0 evaluation
  updateAtFrame({ frame: 0 });

  return {
    characterId,
    rootGroup,
    parts: {
      pelvis,
      torso,
      head,
      jaw: faceRig.jawGroup,
      hat,
      hair,
      eyes: faceRig.eyesGroup,
      brows: faceRig.browsGroup,
      mouth: faceRig.mouthGroup,
      accessories,
      upperArmL: armL.upperArm,
      lowerArmL: armL.lowerArm,
      handL: armL.hand,
      upperArmR: armR.upperArm,
      lowerArmR: armR.lowerArm,
      handR: armR.hand,
      upperLegL: legL.upperLeg,
      lowerLegL: legL.lowerLeg,
      footL: legL.foot,
      upperLegR: legR.upperLeg,
      lowerLegR: legR.lowerLeg,
      footR: legR.foot,
    },
    updateAtFrame,
    dispose: () => {
      isDisposed = true;
      if (glbInstance) {
        glbInstance.dispose();
        glbInstance = null;
      }
      styleHandle.disposeStyleResources();
    },
  };
}

/**
 * 8. Builds the 3D NUTCRACKER DOLL Rig (Hero & Shop-Window Variants)
 * - Separate articulated 3D parts: `head`, `jaw`, `hat`, `body`.
 * - Smooth turned-wood cylinders & capsules with zero blocky wireframe lines.
 */
function buildThreeNutcrackerRig(
  options: ThreeCharacterRigOptions
): ThreeCharacterRigHandle {
  const isHero = (options.nutcrackerVariant ?? 'hero') === 'hero';
  const pal = CHARACTER_OUTFIT_PALETTES.nutcracker;

  const rootGroup = new THREE.Group();
  rootGroup.name = `char3d-nutcracker-${options.nutcrackerVariant ?? 'hero'}`;
  rootGroup.userData.__isSmoothCharacterRig = true;

  const pelvis = new THREE.Group();
  pelvis.name = 'pelvis';
  pelvis.position.set(0, 0.72, 0);
  rootGroup.add(pelvis);

  const woodMat = createMat(pal.woodSkin.base, 0.42, 0.08);
  const redMat = createMat(pal.uniformRed.base, 0.4, 0.1);
  const blueMat = createMat('#1D4ED8', 0.48, 0.08);
  const bootMat = createMat(pal.boots.base, 0.25, 0.18);
  const goldMat = createMat(pal.goldTrim.base, 0.25, 0.72);
  const beardMat = createMat(pal.beard.base, 0.62, 0.05);
  const hatMat = createMat(pal.shakoHat.base, 0.28, 0.18);

  // Smooth Wooden pedestal base
  const baseMesh = createSmoothCharMesh(
    new THREE.CylinderGeometry(0.28, 0.32, 0.08, 32),
    goldMat,
    true,
    1.01
  );
  baseMesh.position.y = 0.04;
  rootGroup.add(baseMesh);

  // Smooth Pelvis hip block
  const hipMesh = createSmoothCharMesh(
    new THREE.CapsuleGeometry(0.135, 0.08, 16, 28),
    blueMat,
    false
  );
  hipMesh.rotation.z = Math.PI / 2;
  pelvis.add(hipMesh);

  // Smooth Turned-Wood Legs
  const makeLeg = (side: -1 | 1, suffix: 'l' | 'r') => {
    const upperLeg = new THREE.Group();
    upperLeg.name = `upper-leg-${suffix}`;
    upperLeg.position.set(side * 0.1, 0, 0);
    const thigh = createSmoothCharMesh(
      new THREE.CapsuleGeometry(0.068, 0.2, 16, 28),
      blueMat,
      true,
      1.01
    );
    thigh.position.y = -0.15;
    upperLeg.add(thigh);

    const lowerLeg = new THREE.Group();
    lowerLeg.name = `lower-leg-${suffix}`;
    lowerLeg.position.set(0, -0.32, 0);
    const boot = createSmoothCharMesh(
      new THREE.CapsuleGeometry(0.07, 0.2, 16, 28),
      bootMat,
      true,
      1.01
    );
    boot.position.y = -0.15;
    lowerLeg.add(boot);

    const foot = new THREE.Group();
    foot.name = `foot-${suffix}`;
    foot.position.set(0, -0.32, 0.045);
    const toeGeo = new THREE.CapsuleGeometry(0.058, 0.1, 14, 24);
    toeGeo.rotateX(Math.PI / 2);
    toeGeo.scale(1.1, 0.72, 1.0);
    const toe = createSmoothCharMesh(toeGeo, bootMat, true, 1.01);
    foot.add(toe);
    lowerLeg.add(foot);
    upperLeg.add(lowerLeg);
    pelvis.add(upperLeg);
    return { upperLeg, lowerLeg, foot };
  };
  const legL = makeLeg(-1, 'l');
  const legR = makeLeg(1, 'r');

  // Smooth Body / Torso
  const torso = new THREE.Group();
  torso.name = 'body';
  pelvis.add(torso);

  const coatGeo = new THREE.CapsuleGeometry(0.19, 0.24, 18, 32);
  coatGeo.scale(1.06, 1.0, 0.92);
  const coatMesh = createSmoothCharMesh(coatGeo, redMat, true, 1.011);
  coatMesh.position.y = 0.27;
  torso.add(coatMesh);

  // Smooth Gold Epaulets & Brass Buttons
  for (const side of [-1, 1]) {
    const ep = createSmoothCharMesh(
      new THREE.SphereGeometry(0.082, 20, 16),
      goldMat,
      false
    );
    ep.scale.set(1.2, 0.65, 1.0);
    ep.position.set(side * 0.22, 0.49, 0);
    torso.add(ep);
  }
  if (isHero) {
    for (const by of [0.18, 0.3, 0.42]) {
      for (const bx of [-0.08, 0.08]) {
        const btn = createSmoothCharMesh(
          new THREE.SphereGeometry(0.024, 16, 14),
          goldMat,
          false
        );
        btn.position.set(bx, by, 0.185);
        torso.add(btn);
      }
    }
  }

  // Smooth Arms
  const makeArm = (side: -1 | 1, suffix: 'l' | 'r') => {
    const upperArm = new THREE.Group();
    upperArm.name = `upper-arm-${suffix}`;
    upperArm.position.set(side * 0.24, 0.45, 0);
    const uMesh = createSmoothCharMesh(
      new THREE.CapsuleGeometry(0.055, 0.16, 16, 26),
      redMat,
      true,
      1.01
    );
    uMesh.position.y = -0.12;
    upperArm.add(uMesh);

    const lowerArm = new THREE.Group();
    lowerArm.name = `lower-arm-${suffix}`;
    lowerArm.position.set(0, -0.25, 0);
    const lMesh = createSmoothCharMesh(
      new THREE.CapsuleGeometry(0.05, 0.14, 16, 26),
      redMat,
      true,
      1.01
    );
    lMesh.position.y = -0.1;
    lowerArm.add(lMesh);

    const hand = new THREE.Group();
    hand.name = `hand-${suffix}`;
    hand.position.set(0, -0.21, 0);
    const mitten = createSmoothCharMesh(
      new THREE.SphereGeometry(0.056, 20, 16),
      beardMat,
      false
    );
    hand.add(mitten);
    lowerArm.add(hand);
    upperArm.add(lowerArm);
    torso.add(upperArm);
    return { upperArm, lowerArm, hand };
  };
  const armL = makeArm(-1, 'l');
  const armR = makeArm(1, 'r');

  // Separate Part: Head (detaches on detachable-head!)
  const head = new THREE.Group();
  head.name = 'head';
  head.position.set(0, 0.56, 0);
  torso.add(head);

  const headCyl = createSmoothCharMesh(
    new THREE.CapsuleGeometry(0.195, 0.12, 20, 32),
    woodMat,
    true,
    1.011
  );
  headCyl.position.y = 0.19;
  head.add(headCyl);

  // White curly side hair & mustache (positioned cleanly beside ears & below nose so eyes are 100% clear)
  for (const side of [-1, 1]) {
    const curl = createSmoothCharMesh(
      new THREE.SphereGeometry(0.072, 20, 16),
      beardMat,
      false
    );
    curl.scale.set(0.68, 1.35, 0.95);
    curl.position.set(side * 0.21, 0.19, -0.02);
    head.add(curl);

    const stache = createSmoothCharMesh(
      new THREE.ConeGeometry(0.042, 0.15, 18),
      beardMat,
      false
    );
    stache.rotation.z = side * (Math.PI * 0.42);
    stache.position.set(side * 0.08, 0.11, 0.205);
    head.add(stache);
  }

  // Face eyes & brows on Nutcracker
  const faceRig = buildThreeFaceRig(0.195, pal.woodSkin.base);
  faceRig.eyesGroup.position.set(0, 0.2, 0.015);
  faceRig.browsGroup.position.set(0, 0.2, 0.015);
  head.add(faceRig.eyesGroup, faceRig.browsGroup);

  // Separate Part: Articulated Wooden Nutcracker Jaw & Beard
  const jaw = new THREE.Group();
  jaw.name = 'jaw';
  jaw.position.set(0, 0.06, 0.155);
  const jawWoodGeo = new THREE.CapsuleGeometry(0.055, 0.06, 12, 20);
  jawWoodGeo.rotateZ(Math.PI / 2);
  const jawWood = createSmoothCharMesh(jawWoodGeo, woodMat, false);
  const teethGeo = new THREE.CapsuleGeometry(0.025, 0.08, 10, 18);
  teethGeo.rotateZ(Math.PI / 2);
  const teethMesh = createSmoothCharMesh(teethGeo, beardMat, false);
  teethMesh.position.set(0, 0.032, 0.02);
  const beardMesh = createSmoothCharMesh(
    new THREE.ConeGeometry(0.095, 0.26, 20),
    beardMat,
    false
  );
  beardMesh.rotation.x = Math.PI;
  beardMesh.position.y = -0.15;
  jaw.add(jawWood, teethMesh, beardMesh);
  head.add(jaw);

  // Separate Part: Tall Hussar Shako Hat (sits high at y = 0.36, well above eyebrows!)
  const hat = new THREE.Group();
  hat.name = 'hat';
  hat.position.set(0, 0.36, 0);
  const shakoMesh = createSmoothCharMesh(
    new THREE.CylinderGeometry(0.215, 0.195, 0.34, 32),
    hatMat,
    true,
    1.011
  );
  shakoMesh.position.y = 0.17;
  const badgeMesh = createSmoothCharMesh(
    new THREE.SphereGeometry(0.052, 20, 16),
    goldMat,
    false
  );
  badgeMesh.position.set(0, 0.17, 0.205);
  hat.add(shakoMesh, badgeMesh);
  if (isHero) {
    const plumeMesh = createSmoothCharMesh(
      new THREE.SphereGeometry(0.062, 20, 16),
      redMat,
      false
    );
    plumeMesh.scale.set(0.8, 1.8, 0.8);
    plumeMesh.position.set(0, 0.4, 0.14);
    hat.add(plumeMesh);
  }
  head.add(hat);

  const styleHandle = applyMainStreetStyleToSceneGraph(rootGroup, {
    smoothOrganicCharacter: true,
  });

  const updateAtFrame = (params: ThreeCharacterEvaluationParams) => {
    const fps = params.fps ?? 60;
    const localFrame =
      Math.max(0, (params.frame - (options.startFrame ?? 0)) * (options.speed ?? 1));
    const activePose = params.pose ?? options.pose ?? 'head-rotation';
    const activeExpr = params.expression ?? options.expression ?? 'stoic';
    const seed = options.seed ?? 'nutcracker';

    const joints = evaluatePoseJointAngles(activePose, localFrame, {
      fps,
      seed,
    });
    const faceState = evaluateExpressionFaceState(
      activeExpr,
      activePose,
      localFrame,
      seed
    );

    rootGroup.scale.setScalar(options.scale ?? 1.0);
    rootGroup.rotation.y =
      (params.facing ?? options.facing ?? 'right') === 'left' ? -0.35 : 0.35;

    pelvis.position.x = joints.rootX * 0.0045;
    pelvis.position.y = 0.72 - joints.rootY * 0.0045;
    torso.rotation.z = THREE.MathUtils.degToRad(-joints.torsoRotate * 0.6);

    // Detachable head spring arc or head rotation
    head.position.set(
      (joints.headOffsetX + joints.headDetachX) * 0.005,
      0.56 - (joints.headOffsetY + joints.headDetachY) * 0.006,
      0
    );
    head.rotation.y = THREE.MathUtils.degToRad(joints.headRotate * 1.4);
    head.rotation.z = THREE.MathUtils.degToRad(
      -(joints.headRotate * 0.4 + joints.headDetachRotate)
    );

    jaw.position.y =
      0.06 - Math.max(faceState.jawDropExtraPx, joints.jawDropPx) * 0.0035;
    hat.rotation.z = THREE.MathUtils.degToRad(-joints.hatTasselSwing * 0.4);

    updateThreeFaceRig(faceRig, faceState, 0.195, joints.jawDropPx);
  };

  updateAtFrame({ frame: 0 });

  return {
    characterId: 'nutcracker-doll',
    rootGroup,
    parts: {
      pelvis,
      torso,
      head,
      jaw,
      hat,
      hair: head,
      eyes: faceRig.eyesGroup,
      brows: faceRig.browsGroup,
      mouth: jaw,
      accessories: hat,
      upperArmL: armL.upperArm,
      lowerArmL: armL.lowerArm,
      handL: armL.hand,
      upperArmR: armR.upperArm,
      lowerArmR: armR.lowerArm,
      handR: armR.hand,
      upperLegL: legL.upperLeg,
      lowerLegL: legL.lowerLeg,
      footL: legL.foot,
      upperLegR: legR.upperLeg,
      lowerLegR: legR.lowerLeg,
      footR: legR.foot,
    },
    updateAtFrame,
    dispose: () => {
      styleHandle.disposeStyleResources();
    },
  };
}

/**
 * 9. Builds the Smooth 3D MALE DOG Rig
 * - Animations: `idle`, `tail-tuck`, `startled-expression`, `bolt-away-run`.
 */
function buildThreeMaleDogRig(
  options: ThreeCharacterRigOptions
): ThreeCharacterRigHandle {
  const pal = CHARACTER_OUTFIT_PALETTES.maleDog;
  const coatMat = createMat(pal.coat.base, 0.54, 0.05);
  const bellyMat = createMat(pal.belly.base, 0.56, 0.05);
  const earMat = createMat(pal.ears.base, 0.52, 0.05);
  const collarMat = createMat(pal.collar.base, 0.38, 0.12);
  const goldMat = createMat('#FACC15', 0.25, 0.72);
  const darkMat = createMat('#0A0812', 0.2, 0.1);
  const whiteMat = createMat('#FFFFFF', 0.2, 0.05);

  const rootGroup = new THREE.Group();
  rootGroup.name = 'char3d-male-dog';
  rootGroup.userData.__isSmoothCharacterRig = true;

  const pelvis = new THREE.Group();
  pelvis.name = 'pelvis';
  pelvis.position.set(0, 0.42, 0);
  rootGroup.add(pelvis);

  const torso = new THREE.Group();
  torso.name = 'torso';
  pelvis.add(torso);

  const bodyMesh = createSmoothCharMesh(
    new THREE.CapsuleGeometry(0.175, 0.4, 20, 32),
    coatMat,
    true,
    1.011
  );
  bodyMesh.rotation.z = Math.PI / 2;
  torso.add(bodyMesh);

  // Red Collar & Gold Dog Tag
  const collarMesh = createSmoothCharMesh(
    new THREE.TorusGeometry(0.168, 0.03, 14, 28),
    collarMat,
    false
  );
  collarMesh.rotation.y = Math.PI / 2;
  collarMesh.position.set(0.22, 0.06, 0);
  const tagMesh = createSmoothCharMesh(
    new THREE.SphereGeometry(0.04, 16, 14),
    goldMat,
    false
  );
  tagMesh.position.set(0.26, -0.1, 0);
  torso.add(collarMesh, tagMesh);

  // Smooth Tail
  const tailGroup = new THREE.Group();
  tailGroup.name = 'accessories';
  tailGroup.position.set(-0.34, 0.08, 0);
  const tailMesh = createSmoothCharMesh(
    new THREE.CapsuleGeometry(0.036, 0.2, 12, 22),
    coatMat,
    true,
    1.01
  );
  tailMesh.position.set(-0.08, 0.1, 0);
  tailMesh.rotation.z = 0.55;
  tailGroup.add(tailMesh);
  torso.add(tailGroup);

  // 4 Articulated Smooth Capsule Dog Legs
  const makeDogLeg = (lx: number, lz: number, name: string) => {
    const leg = new THREE.Group();
    leg.name = name;
    leg.position.set(lx, -0.1, lz);
    const shin = createSmoothCharMesh(
      new THREE.CapsuleGeometry(0.044, 0.2, 14, 24),
      coatMat,
      true,
      1.01
    );
    shin.position.y = -0.14;
    const paw = createSmoothCharMesh(
      new THREE.SphereGeometry(0.054, 18, 14),
      bellyMat,
      false
    );
    paw.scale.set(1.28, 0.65, 1.0);
    paw.position.set(0.02, -0.28, 0);
    leg.add(shin, paw);
    torso.add(leg);
    return leg;
  };
  const backLegL = makeDogLeg(-0.22, -0.1, 'upper-leg-l');
  const backLegR = makeDogLeg(-0.22, 0.1, 'upper-leg-r');
  const frontLegL = makeDogLeg(0.22, -0.1, 'upper-arm-l');
  const frontLegR = makeDogLeg(0.22, 0.1, 'upper-arm-r');

  // Smooth Dog Head, Sculpted Capsule Snout, Ears & Eyes
  const head = new THREE.Group();
  head.name = 'head';
  head.position.set(0.32, 0.18, 0);
  torso.add(head);

  const skull = createSmoothCharMesh(
    new THREE.SphereGeometry(0.18, 28, 24),
    coatMat,
    true,
    1.011
  );
  const snoutGeo = new THREE.CapsuleGeometry(0.072, 0.12, 16, 24);
  snoutGeo.rotateZ(Math.PI / 2);
  snoutGeo.scale(1.0, 0.86, 1.05);
  const snout = createSmoothCharMesh(snoutGeo, bellyMat, false);
  snout.position.set(0.15, -0.03, 0);
  const nose = createSmoothCharMesh(
    new THREE.SphereGeometry(0.044, 16, 14),
    darkMat,
    false
  );
  nose.position.set(0.265, 0.02, 0);
  head.add(skull, snout, nose);

  // Expressive 3D Dog Eyes
  const eyeL = createSmoothCharMesh(
    new THREE.SphereGeometry(0.048, 18, 16),
    whiteMat,
    false
  );
  eyeL.position.set(0.12, 0.07, 0.11);
  const pupL = createSmoothCharMesh(
    new THREE.SphereGeometry(0.026, 14, 12),
    darkMat,
    false
  );
  pupL.position.set(0.035, 0, 0.02);
  eyeL.add(pupL);
  const eyeR = eyeL.clone();
  eyeR.position.z = -0.11;
  head.add(eyeL, eyeR);

  // Smooth Floppy Capsule 3D Ears (tucked cleanly behind eyes at x = -0.05)
  const earGroup = new THREE.Group();
  earGroup.name = 'hair';
  for (const ez of [-0.155, 0.155]) {
    const earGeo = new THREE.CapsuleGeometry(0.045, 0.14, 14, 22);
    earGeo.scale(0.9, 1.0, 0.48);
    const ear = createSmoothCharMesh(earGeo, earMat, false);
    ear.position.set(-0.05, -0.06, ez);
    earGroup.add(ear);
  }
  head.add(earGroup);

  const jaw = new THREE.Group();
  jaw.name = 'jaw';
  jaw.position.set(0.14, -0.095, 0);
  const jawGeo = new THREE.CapsuleGeometry(0.035, 0.1, 12, 20);
  jawGeo.rotateZ(Math.PI / 2);
  const jawMesh = createSmoothCharMesh(jawGeo, bellyMat, false);
  jaw.add(jawMesh);
  head.add(jaw);

  const styleHandle = applyMainStreetStyleToSceneGraph(rootGroup, {
    smoothOrganicCharacter: true,
  });

  // Load and attach the rigged dog.glb model (`/models/characters/dog.glb`)
  let glbInstance: GlbCharacterInstanceHandle | null = null;
  let isDisposed = false;
  let lastEvalParams: ThreeCharacterEvaluationParams = { frame: 0 };
  const dogGlbEntry = getGlbAssetEntryForCharacter('male-dog', {
    modelIdOverride: options.glbModelIdOverride,
  });

  if (typeof window !== 'undefined' && dogGlbEntry) {
    loadCachedGlbAsset(dogGlbEntry.modelId)
      .then((gltf) => {
        if (isDisposed) return;
        glbInstance = instantiatePreparedGlbCharacter(dogGlbEntry, gltf);
        rootGroup.add(glbInstance.wrapperGroup);
        pelvis.visible = false;
        glbInstance.evaluateAtFrame({
          frame: lastEvalParams.frame,
          fps: lastEvalParams.fps ?? 60,
          pose: lastEvalParams.pose ?? options.pose ?? 'idle',
          expression:
            lastEvalParams.expression ?? options.expression ?? 'neutral',
          facing: lastEvalParams.facing ?? options.facing ?? 'right',
          seed: options.seed ?? 'male-dog',
          speed: options.speed ?? 1,
          startFrame: options.startFrame ?? 0,
        });
        notifyGlbCharacterMounted();
      })
      .catch(() => {
        // Keep procedural fallback dog visible if GLB fetch fails in offline test environment
      });
  }

  const updateAtFrame = (params: ThreeCharacterEvaluationParams) => {
    lastEvalParams = params;
    const fps = params.fps ?? 60;
    const localFrame =
      Math.max(0, (params.frame - (options.startFrame ?? 0)) * (options.speed ?? 1));
    const activePose = params.pose ?? options.pose ?? 'idle';
    const seed = options.seed ?? 'male-dog';

    const joints = evaluatePoseJointAngles(activePose, localFrame, {
      fps,
      seed,
    });
    const isStartled = activePose === 'startled-expression';

    rootGroup.scale.setScalar(options.scale ?? 1.0);
    rootGroup.rotation.y =
      (params.facing ?? options.facing ?? 'right') === 'left'
        ? Math.PI - 0.25
        : -0.25;

    if (glbInstance) {
      glbInstance.evaluateAtFrame({
        frame: params.frame,
        fps,
        pose: activePose,
        expression: params.expression ?? options.expression ?? 'neutral',
        facing: params.facing ?? options.facing ?? 'right',
        seed,
        speed: options.speed ?? 1,
        startFrame: options.startFrame ?? 0,
      });
    }

    pelvis.position.x = joints.rootX * 0.005;
    pelvis.position.y = 0.42 - joints.rootY * 0.005;
    torso.rotation.z = THREE.MathUtils.degToRad(-joints.torsoRotate * 0.6);

    head.rotation.z = THREE.MathUtils.degToRad(-joints.headRotate * 0.6);
    earGroup.rotation.z = THREE.MathUtils.degToRad(joints.earFlop * 0.8);
    tailGroup.rotation.z = THREE.MathUtils.degToRad(-joints.tailWag * 0.85);

    eyeL.scale.setScalar(isStartled ? 1.45 : 1.0);
    eyeR.scale.setScalar(isStartled ? 1.45 : 1.0);

    backLegL.rotation.z = THREE.MathUtils.degToRad(joints.hipL * 0.8);
    backLegR.rotation.z = THREE.MathUtils.degToRad(joints.hipR * 0.8);
    frontLegL.rotation.z = THREE.MathUtils.degToRad(joints.shoulderL * 0.8);
    frontLegR.rotation.z = THREE.MathUtils.degToRad(joints.shoulderR * 0.8);
  };

  updateAtFrame({ frame: 0 });

  return {
    characterId: 'male-dog',
    rootGroup,
    parts: {
      pelvis,
      torso,
      head,
      jaw,
      hat: earGroup,
      hair: earGroup,
      eyes: head,
      brows: head,
      mouth: jaw,
      accessories: tailGroup,
      upperArmL: frontLegL,
      lowerArmL: frontLegL,
      handL: frontLegL,
      upperArmR: frontLegR,
      lowerArmR: frontLegR,
      handR: frontLegR,
      upperLegL: backLegL,
      lowerLegL: backLegL,
      footL: backLegL,
      upperLegR: backLegR,
      lowerLegR: backLegR,
      footR: backLegR,
    },
    updateAtFrame,
    dispose: () => {
      isDisposed = true;
      if (glbInstance) {
        glbInstance.dispose();
        glbInstance = null;
      }
      styleHandle.disposeStyleResources();
    },
  };
}

/**
 * 10. Builds the Smooth 3D PIGEON Rig (`/models/characters/pigeon.glb` & `/models/characters/peigon.glb`)
 * - Animations: `perch`, `head-turn`, `wing-flap`, `takeoff`.
 */
function buildThreePigeonRig(
  options: ThreeCharacterRigOptions
): ThreeCharacterRigHandle {
  const pal = CHARACTER_OUTFIT_PALETTES.pigeon;
  const bodyMat = createMat(pal.body.base, 0.48, 0.08);
  const wingMat = createMat(pal.wing.base, 0.52, 0.08);
  const neckMat = createMat(pal.iridescentNeck.base, 0.25, 0.42);
  const beakMat = createMat(pal.beakAndFeet.base, 0.38, 0.08);

  const rootGroup = new THREE.Group();
  rootGroup.name = 'char3d-pigeon';
  rootGroup.userData.__isSmoothCharacterRig = true;

  const pelvis = new THREE.Group();
  pelvis.name = 'pelvis';
  pelvis.position.set(0, 0.2, 0);
  rootGroup.add(pelvis);

  const torso = new THREE.Group();
  torso.name = 'torso';
  pelvis.add(torso);

  const bodyMesh = createSmoothCharMesh(
    new THREE.SphereGeometry(0.16, 28, 24),
    bodyMat,
    true,
    1.011
  );
  bodyMesh.scale.set(1.35, 1.0, 0.9);
  torso.add(bodyMesh);

  // Smooth Iridescent Neck & Head
  const head = new THREE.Group();
  head.name = 'head';
  head.position.set(0.14, 0.14, 0);
  const neckRing = createSmoothCharMesh(
    new THREE.CylinderGeometry(0.082, 0.098, 0.1, 24),
    neckMat,
    false
  );
  const skull = createSmoothCharMesh(
    new THREE.SphereGeometry(0.095, 24, 20),
    bodyMat,
    true,
    1.01
  );
  skull.position.y = 0.08;
  const beak = createSmoothCharMesh(
    new THREE.ConeGeometry(0.032, 0.1, 18),
    beakMat,
    false
  );
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.11, 0.08, 0);
  head.add(neckRing, skull, beak);
  torso.add(head);

  // Smooth Articulated 3D Capsule Wings
  const wingGeo = new THREE.SphereGeometry(0.14, 24, 18);
  wingGeo.scale(1.15, 0.22, 0.85);

  const wingL = new THREE.Group();
  wingL.name = 'upper-arm-l';
  wingL.position.set(0, 0.06, -0.13);
  const wingMeshL = createSmoothCharMesh(wingGeo, wingMat, false);
  wingMeshL.position.set(-0.03, 0, -0.06);
  wingL.add(wingMeshL);

  const wingR = new THREE.Group();
  wingR.name = 'upper-arm-r';
  wingR.position.set(0, 0.06, 0.13);
  const wingMeshR = createSmoothCharMesh(wingGeo, wingMat, false);
  wingMeshR.position.set(-0.03, 0, 0.06);
  wingR.add(wingMeshR);
  torso.add(wingL, wingR);

  // Smooth Feet
  const footL = new THREE.Group();
  footL.name = 'foot-l';
  footL.position.set(0, -0.16, -0.05);
  footL.add(
    createSmoothCharMesh(
      new THREE.CapsuleGeometry(0.018, 0.05, 10, 16),
      beakMat,
      false
    )
  );
  const footR = footL.clone();
  footR.name = 'foot-r';
  footR.position.z = 0.05;
  torso.add(footL, footR);

  const styleHandle = applyMainStreetStyleToSceneGraph(rootGroup, {
    smoothOrganicCharacter: true,
  });

  // Load and attach the rigged pigeon.glb / peigon.glb model
  let glbInstance: GlbCharacterInstanceHandle | null = null;
  let isDisposed = false;
  let lastEvalParams: ThreeCharacterEvaluationParams = { frame: 0 };
  const pigeonGlbEntry = getGlbAssetEntryForCharacter('pigeon', {
    modelIdOverride: options.glbModelIdOverride,
  });

  if (typeof window !== 'undefined' && pigeonGlbEntry) {
    loadCachedGlbAsset(pigeonGlbEntry.modelId)
      .then((gltf) => {
        if (isDisposed) return;
        glbInstance = instantiatePreparedGlbCharacter(pigeonGlbEntry, gltf);
        rootGroup.add(glbInstance.wrapperGroup);
        pelvis.visible = false;
        glbInstance.evaluateAtFrame({
          frame: lastEvalParams.frame,
          fps: lastEvalParams.fps ?? 60,
          pose: lastEvalParams.pose ?? options.pose ?? 'perch',
          expression:
            lastEvalParams.expression ?? options.expression ?? 'neutral',
          facing: lastEvalParams.facing ?? options.facing ?? 'right',
          seed: options.seed ?? 'pigeon',
          speed: options.speed ?? 1,
          startFrame: options.startFrame ?? 0,
        });
        notifyGlbCharacterMounted();
      })
      .catch(() => {
        // Keep procedural fallback pigeon visible if GLB fetch fails in offline test environment
      });
  }

  const updateAtFrame = (params: ThreeCharacterEvaluationParams) => {
    lastEvalParams = params;
    const fps = params.fps ?? 60;
    const localFrame =
      Math.max(0, (params.frame - (options.startFrame ?? 0)) * (options.speed ?? 1));
    const activePose = params.pose ?? options.pose ?? 'perch';
    const seed = options.seed ?? 'pigeon';

    const joints = evaluatePoseJointAngles(activePose, localFrame, {
      fps,
      seed,
    });
    rootGroup.scale.setScalar(options.scale ?? 1.0);
    rootGroup.rotation.y =
      (params.facing ?? options.facing ?? 'right') === 'left'
        ? Math.PI - 0.3
        : -0.3;

    if (glbInstance) {
      glbInstance.evaluateAtFrame({
        frame: params.frame,
        fps,
        pose: activePose,
        expression: params.expression ?? options.expression ?? 'neutral',
        facing: params.facing ?? options.facing ?? 'right',
        seed,
        speed: options.speed ?? 1,
        startFrame: options.startFrame ?? 0,
      });
    }

    pelvis.position.x = joints.rootX * 0.005;
    pelvis.position.y = 0.2 - joints.rootY * 0.005;
    torso.rotation.z = THREE.MathUtils.degToRad(-joints.torsoRotate * 0.6);

    head.rotation.y = THREE.MathUtils.degToRad(joints.headRotate * 1.4);
    head.position.x = 0.14 + joints.headOffsetX * 0.004;

    wingL.rotation.x = THREE.MathUtils.degToRad(-joints.wingFlapDeg * 0.8);
    wingR.rotation.x = THREE.MathUtils.degToRad(joints.wingFlapDeg * 0.8);
  };

  updateAtFrame({ frame: 0 });

  return {
    characterId: 'pigeon',
    rootGroup,
    parts: {
      pelvis,
      torso,
      head,
      jaw: head,
      hat: head,
      hair: head,
      eyes: head,
      brows: head,
      mouth: head,
      accessories: wingL,
      upperArmL: wingL,
      lowerArmL: wingL,
      handL: wingL,
      upperArmR: wingR,
      lowerArmR: wingR,
      handR: wingR,
      upperLegL: footL,
      lowerLegL: footL,
      footL,
      upperLegR: footR,
      lowerLegR: footR,
      footR,
    },
    updateAtFrame,
    dispose: () => {
      isDisposed = true;
      if (glbInstance) {
        glbInstance.dispose();
        glbInstance = null;
      }
      styleHandle.disposeStyleResources();
    },
  };
}

/**
 * Master Factory: Builds any of the 10 3D Character Rigs by `characterId`.
 */
export function buildThreeCharacterRig(
  options: ThreeCharacterRigOptions
): ThreeCharacterRigHandle {
  if (options.characterId === 'nutcracker-doll') {
    return buildThreeNutcrackerRig(options);
  }
  if (options.characterId === 'male-dog') {
    return buildThreeMaleDogRig(options);
  }
  if (options.characterId === 'pigeon') {
    return buildThreePigeonRig(options);
  }
  return buildThreeHumanoidCharacterRig(options);
}

export interface ThreeCrowdGroupHandle {
  rootGroup: THREE.Group;
  members: {
    spec: CrowdMemberSeededSpec;
    rig: ThreeCharacterRigHandle;
    baseZ: number;
    sideX: number;
    laneType: 'sidewalk-ns' | 'crosswalk-ew';
    crosswalkZ: number;
  }[];
  updateAtFrame: (frame: number, fps?: number) => void;
  dispose: () => void;
}

const CROWD_GLB_MODEL_POOL: readonly GlbModelId[] = [
  'basic-walk-female-loop',
  'casual-male-tpose',
  'low-poly-man',
  'idle-male-loop',
  'police-man-rigged',
  'nathan-walking-man',
];

function buildCelShadedTownCarryProp(
  propType: 'shopping-bag' | 'coffee-cup' | 'briefcase' | 'none',
  accentColorHex: string
): THREE.Group | null {
  if (propType === 'none') return null;
  const g = new THREE.Group();
  g.name = `town-carry-prop-${propType}`;

  if (propType === 'shopping-bag') {
    const bagBody = createSmoothCharMesh(
      new THREE.BoxGeometry(0.22, 0.28, 0.1),
      createMat(accentColorHex, 0.45, 0.05)
    );
    bagBody.position.set(0, -0.14, 0);
    const bagTrim = createSmoothCharMesh(
      new THREE.BoxGeometry(0.23, 0.05, 0.11),
      createMat('#FACC15', 0.35, 0.25)
    );
    bagTrim.position.set(0, -0.03, 0);
    const handle = createSmoothCharMesh(
      new THREE.TorusGeometry(0.055, 0.01, 8, 16, Math.PI),
      createMat('#0F172A', 0.4, 0.1)
    );
    handle.position.set(0, 0.0, 0);
    g.add(bagBody, bagTrim, handle);
    g.position.set(0.26, 0.86, 0.12);
  } else if (propType === 'coffee-cup') {
    const cup = createSmoothCharMesh(
      new THREE.CylinderGeometry(0.042, 0.032, 0.12, 14),
      createMat('#F8FAFC', 0.4, 0.05)
    );
    const sleeve = createSmoothCharMesh(
      new THREE.CylinderGeometry(0.044, 0.038, 0.05, 14),
      createMat('#B45309', 0.55, 0.04)
    );
    const lid = createSmoothCharMesh(
      new THREE.CylinderGeometry(0.046, 0.044, 0.022, 14),
      createMat('#0F172A', 0.3, 0.1)
    );
    lid.position.y = 0.068;
    g.add(cup, sleeve, lid);
    g.position.set(-0.24, 1.04, 0.18);
  } else if (propType === 'briefcase') {
    const caseMesh = createSmoothCharMesh(
      new THREE.BoxGeometry(0.28, 0.21, 0.075),
      createMat('#451A03', 0.42, 0.15)
    );
    caseMesh.position.set(0, -0.12, 0);
    const clasp = createSmoothCharMesh(
      new THREE.BoxGeometry(0.06, 0.03, 0.085),
      createMat('#FACC15', 0.25, 0.65)
    );
    clasp.position.set(0, -0.02, 0);
    g.add(caseMesh, clasp);
    g.position.set(0.27, 0.84, 0.08);
  }

  applyMainStreetStyleToSceneGraph(g, { smoothOrganicCharacter: true });
  return g;
}

/**
 * 3D `<Crowd />` Spawner: Spawns N 3D Pedestrian characters with deterministic Remotion
 * `random(seed)` variation in rigged `.glb` models, cel-shaded clothes, hair, skin tone,
 * carry props (shopping bags, coffee cups, briefcases), walking speed, and phase offset.
 */
export function buildThreeCrowdGroup(options: {
  count?: number;
  seed?: string;
  pose?: PedestrianAnimation;
  baseScale?: number;
  zSpan?: number;
  sidewalkXPositions?: readonly [number, number];
  includeCrosswalkWalkers?: boolean;
}): ThreeCrowdGroupHandle {
  const count = options.count ?? 8;
  const seed = options.seed ?? 'three-city-crowd';
  const pose: PedestrianAnimation = options.pose ?? 'walk';
  const baseScale = options.baseScale ?? 1.05;
  const zSpan = options.zSpan ?? 32;
  const sidewalks = options.sidewalkXPositions ?? [-9.6, 9.6];
  const includeCrosswalkWalkers = options.includeCrosswalkWalkers ?? false;

  const specs = generateSeededCrowdSpecs(count, seed, pose);
  const rootGroup = new THREE.Group();
  rootGroup.name = 'three-crowd-group';

  const propChoices: readonly ('shopping-bag' | 'coffee-cup' | 'briefcase' | 'none')[] = [
    'shopping-bag',
    'coffee-cup',
    'briefcase',
    'shopping-bag',
    'none',
  ];
  const bagColors = ['#DC2626', '#059669', '#2563EB', '#D97706', '#9333EA', '#E11D48'];

  const members = specs.map((spec, idx) => {
    const glbModelId = CROWD_GLB_MODEL_POOL[idx % CROWD_GLB_MODEL_POOL.length];
    const rig = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: spec.archetype,
      pose,
      facing: spec.facing,
      scale: baseScale * spec.heightScale,
      seed: spec.seed,
      startFrame: -spec.phaseOffsetFrames,
      speed: spec.walkSpeed,
      skinToneOverride: spec.skinTone,
      topColorOverride: spec.topColor,
      bottomColorOverride: spec.bottomColor,
      hairColorOverride: spec.hairColor,
      glbModelIdOverride: glbModelId,
    });

    const carryProp = buildCelShadedTownCarryProp(
      propChoices[idx % propChoices.length],
      bagColors[idx % bagColors.length]
    );
    if (carryProp) {
      rig.rootGroup.add(carryProp);
    }

    const isCrosswalk =
      includeCrosswalkWalkers && idx >= Math.max(4, count - 6);
    const laneType: 'sidewalk-ns' | 'crosswalk-ew' = isCrosswalk
      ? 'crosswalk-ew'
      : 'sidewalk-ns';
    const crosswalkZ = idx % 2 === 0 ? -11.25 : 11.25;

    const sideX =
      sidewalks[idx % sidewalks.length] +
      (idx % 3 === 0 ? -0.52 : idx % 3 === 1 ? 0.48 : 0.0);
    const baseZ = ((spec.xPercent / 100) - 0.5) * zSpan;

    if (laneType === 'crosswalk-ew') {
      rig.rootGroup.position.set(baseZ * 0.45, 0.29, crosswalkZ + (idx % 2 === 0 ? -0.45 : 0.45));
    } else {
      rig.rootGroup.position.set(sideX, 0.18, baseZ);
    }

    rig.rootGroup.userData.inspectableItem = {
      id: `crowd-pedestrian-${seed}-${idx}`,
      label: `Town Pedestrian #${idx + 1} (${spec.archetype} • ${glbModelId})`,
      category: 'Busy Town Walking Pedestrians (Cel-Shaded GLB)',
      target: [
        rig.rootGroup.position.x,
        rig.rootGroup.position.y + 0.95,
        rig.rootGroup.position.z,
      ] as [number, number, number],
      optimalDistance: 3.2,
    };

    rootGroup.add(rig.rootGroup);

    return { spec, rig, baseZ, sideX, laneType, crosswalkZ };
  });

  const updateAtFrame = (frame: number, fps = 60) => {
    for (const m of members) {
      m.rig.updateAtFrame({ frame, fps, pose });
      const dir = m.spec.facing === 'right' ? 1 : -1;

      if (m.laneType === 'crosswalk-ew') {
        const xSpan = 19.0;
        const halfX = xSpan * 0.5;
        const travelX =
          ((m.baseZ * 0.45 +
            halfX +
            dir * ((frame + m.spec.phaseOffsetFrames) * 0.028 * m.spec.walkSpeed)) %
            xSpan +
            xSpan) %
            xSpan -
          halfX;
        m.rig.rootGroup.position.set(travelX, 0.29, m.crosswalkZ);
        m.rig.rootGroup.rotation.y = dir > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
      } else {
        const halfSpan = zSpan * 0.5;
        const travel =
          ((m.baseZ +
            halfSpan +
            dir * ((frame + m.spec.phaseOffsetFrames) * 0.032 * m.spec.walkSpeed)) %
            zSpan +
            zSpan) %
            zSpan -
          halfSpan;
        m.rig.rootGroup.position.set(m.sideX, 0.18, travel);
        // Orient walking along the North/South sidewalk
        m.rig.rootGroup.rotation.y = dir > 0 ? 0 : Math.PI;
      }
    }
  };

  updateAtFrame(0);

  return {
    rootGroup,
    members,
    updateAtFrame,
    dispose: () => {
      for (const m of members) m.rig.dispose();
    },
  };
}

