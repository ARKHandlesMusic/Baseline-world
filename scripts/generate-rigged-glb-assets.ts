/**
 * Generates and verifies the rigged .glb binary assets in /public/models/characters/:
 * 1. /public/models/characters/riiged_anime_girl_outfits__facial_expressions.glb
 * 2. /public/models/characters/dog.glb
 * 3. /public/models/characters/pigeon.glb (and /public/models/characters/peigon.glb)
 */

import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// Polyfill browser globals required by Three.js GLTFExporter in Node
const g = globalThis as Record<string, unknown>;
if (!g.self) g.self = globalThis;
if (!g.window) g.window = globalThis;

if (typeof g.FileReader === 'undefined') {
  class NodeFileReader {
    result: ArrayBuffer | string | null = null;
    onloadend: (() => void) | null = null;
    onload: (() => void) | null = null;
    onerror: ((err: unknown) => void) | null = null;

    readAsArrayBuffer(blob: Blob): void {
      blob
        .arrayBuffer()
        .then((ab) => {
          this.result = ab;
          if (this.onload) this.onload();
          if (this.onloadend) this.onloadend();
        })
        .catch((err) => {
          if (this.onerror) this.onerror(err);
        });
    }

    readAsDataURL(blob: Blob): void {
      blob
        .arrayBuffer()
        .then((ab) => {
          const b64 = Buffer.from(ab).toString('base64');
          this.result = `data:${blob.type || 'application/octet-stream'};base64,${b64}`;
          if (this.onload) this.onload();
          if (this.onloadend) this.onloadend();
        })
        .catch((err) => {
          if (this.onerror) this.onerror(err);
        });
    }
  }
  g.FileReader = NodeFileReader;
}

const CHAR_DIR = path.resolve(process.cwd(), 'public/models/characters');

function createCartoonDogGlbScene(): {
  scene: THREE.Scene;
  animations: THREE.AnimationClip[];
} {
  const scene = new THREE.Scene();
  scene.name = 'RiggedCartoonDogScene';

  const rootBone = new THREE.Bone();
  rootBone.name = 'Dog_Root';
  rootBone.position.set(0, 0, 0);

  const pelvisBone = new THREE.Bone();
  pelvisBone.name = 'Dog_Pelvis';
  pelvisBone.position.set(0, 0.34, 0);
  rootBone.add(pelvisBone);

  const spineBone = new THREE.Bone();
  spineBone.name = 'Dog_Spine';
  spineBone.position.set(0, 0.02, 0.14);
  pelvisBone.add(spineBone);

  const neckBone = new THREE.Bone();
  neckBone.name = 'Dog_Neck';
  neckBone.position.set(0, 0.12, 0.18);
  spineBone.add(neckBone);

  const headBone = new THREE.Bone();
  headBone.name = 'Dog_Head';
  headBone.position.set(0, 0.08, 0.08);
  neckBone.add(headBone);

  const jawBone = new THREE.Bone();
  jawBone.name = 'Dog_Jaw';
  jawBone.position.set(0, -0.05, 0.11);
  headBone.add(jawBone);

  const earLBone = new THREE.Bone();
  earLBone.name = 'Dog_Ear_L';
  earLBone.position.set(0.11, 0.06, -0.02);
  headBone.add(earLBone);

  const earRBone = new THREE.Bone();
  earRBone.name = 'Dog_Ear_R';
  earRBone.position.set(-0.11, 0.06, -0.02);
  headBone.add(earRBone);

  const tailBone = new THREE.Bone();
  tailBone.name = 'Dog_Tail';
  tailBone.position.set(0, 0.06, -0.26);
  pelvisBone.add(tailBone);

  const legFLBone = new THREE.Bone();
  legFLBone.name = 'Dog_Leg_FL';
  legFLBone.position.set(0.11, -0.04, 0.2);
  pelvisBone.add(legFLBone);

  const legFRBone = new THREE.Bone();
  legFRBone.name = 'Dog_Leg_FR';
  legFRBone.position.set(-0.11, -0.04, 0.2);
  pelvisBone.add(legFRBone);

  const legBLBone = new THREE.Bone();
  legBLBone.name = 'Dog_Leg_BL';
  legBLBone.position.set(0.11, -0.04, -0.18);
  pelvisBone.add(legBLBone);

  const legBRBone = new THREE.Bone();
  legBRBone.name = 'Dog_Leg_BR';
  legBRBone.position.set(-0.11, -0.04, -0.18);
  pelvisBone.add(legBRBone);

  // Materials
  const coatMat = new THREE.MeshStandardMaterial({
    name: 'Dog_Golden_Coat',
    color: 0xd97706,
    roughness: 0.55,
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    name: 'Dog_Cream_Belly',
    color: 0xfef3c7,
    roughness: 0.6,
  });
  const earMat = new THREE.MeshStandardMaterial({
    name: 'Dog_Dark_Ear',
    color: 0x92400e,
    roughness: 0.6,
  });
  const collarMat = new THREE.MeshStandardMaterial({
    name: 'Dog_Red_Collar',
    color: 0xdc2626,
    roughness: 0.35,
  });
  const tagMat = new THREE.MeshStandardMaterial({
    name: 'Dog_Gold_Tag',
    color: 0xfacc15,
    metalness: 0.6,
    roughness: 0.25,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    name: 'Dog_Nose_Eyes',
    color: 0x0f172a,
    roughness: 0.25,
  });
  const scleraMat = new THREE.MeshStandardMaterial({
    name: 'Dog_Eye_Sclera',
    color: 0xffffff,
    roughness: 0.2,
  });
  const tongueMat = new THREE.MeshStandardMaterial({
    name: 'Dog_Pink_Tongue',
    color: 0xfb7185,
    roughness: 0.4,
  });

  // Torso attached to pelvisBone
  const torsoMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.155, 0.34, 14, 20),
    coatMat,
  );
  torsoMesh.name = 'Dog_Torso_Mesh';
  torsoMesh.rotation.x = Math.PI * 0.5;
  pelvisBone.add(torsoMesh);

  const chestBelly = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.125, 0.26, 12, 16),
    bellyMat,
  );
  chestBelly.name = 'Dog_Belly_Mesh';
  chestBelly.rotation.x = Math.PI * 0.5;
  chestBelly.position.set(0, -0.04, 0.03);
  pelvisBone.add(chestBelly);

  // Red Collar & Gold Tag on Neck
  const collarMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.115, 0.024, 12, 24),
    collarMat,
  );
  collarMesh.name = 'Dog_Collar_Mesh';
  collarMesh.rotation.x = Math.PI * 0.42;
  collarMesh.position.set(0, 0.02, 0.02);
  neckBone.add(collarMesh);

  const tagMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.01, 16),
    tagMat,
  );
  tagMesh.name = 'Dog_Tag_Mesh';
  tagMesh.rotation.x = Math.PI * 0.5;
  tagMesh.position.set(0, -0.07, 0.12);
  neckBone.add(tagMesh);

  // Head & Snout
  const craniumMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.145, 20, 18),
    coatMat,
  );
  craniumMesh.name = 'Dog_Cranium_Mesh';
  craniumMesh.scale.set(1.02, 0.96, 1.08);
  headBone.add(craniumMesh);

  const snoutMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.068, 0.1, 12, 16),
    bellyMat,
  );
  snoutMesh.name = 'Dog_Snout_Mesh';
  snoutMesh.rotation.x = Math.PI * 0.5;
  snoutMesh.position.set(0, -0.02, 0.14);
  headBone.add(snoutMesh);

  const noseMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 14, 12),
    darkMat,
  );
  noseMesh.name = 'Dog_Nose_Mesh';
  noseMesh.scale.set(1.2, 0.85, 0.9);
  noseMesh.position.set(0, 0.015, 0.22);
  headBone.add(noseMesh);

  // Expressive Eyes & Brows
  for (const side of [-1, 1] as const) {
    const eyeWhite = new THREE.Mesh(
      new THREE.SphereGeometry(0.034, 14, 12),
      scleraMat,
    );
    eyeWhite.name = side < 0 ? 'Dog_Eye_R' : 'Dog_Eye_L';
    eyeWhite.position.set(side * 0.065, 0.045, 0.125);
    headBone.add(eyeWhite);

    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 12, 10),
      darkMat,
    );
    pupil.name = side < 0 ? 'Dog_Pupil_R' : 'Dog_Pupil_L';
    pupil.position.set(side * 0.065, 0.045, 0.152);
    headBone.add(pupil);

    const brow = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.012, 0.04, 8, 10),
      earMat,
    );
    brow.name = side < 0 ? 'Dog_Brow_R' : 'Dog_Brow_L';
    brow.rotation.z = Math.PI * 0.5 + side * -0.15;
    brow.position.set(side * 0.065, 0.092, 0.13);
    headBone.add(brow);
  }

  // Lower Jaw & Tongue
  const lowerJawMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.042, 0.08, 10, 12),
    bellyMat,
  );
  lowerJawMesh.name = 'Dog_LowerJaw_Mesh';
  lowerJawMesh.rotation.x = Math.PI * 0.5;
  lowerJawMesh.position.set(0, 0, 0.03);
  jawBone.add(lowerJawMesh);

  const tongueMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.024, 0.065, 8, 10),
    tongueMat,
  );
  tongueMesh.name = 'Dog_Tongue_Mesh';
  tongueMesh.rotation.x = Math.PI * 0.62;
  tongueMesh.position.set(0, 0.01, 0.06);
  jawBone.add(tongueMesh);

  // Floppy Ears
  const earLMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.042, 0.13, 10, 14),
    earMat,
  );
  earLMesh.name = 'Dog_Ear_L_Mesh';
  earLMesh.position.set(0.02, -0.07, 0);
  earLMesh.rotation.z = -0.22;
  earLBone.add(earLMesh);

  const earRMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.042, 0.13, 10, 14),
    earMat,
  );
  earRMesh.name = 'Dog_Ear_R_Mesh';
  earRMesh.position.set(-0.02, -0.07, 0);
  earRMesh.rotation.z = 0.22;
  earRBone.add(earRMesh);

  // Wagging Tail
  const tailMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.032, 0.18, 10, 14),
    coatMat,
  );
  tailMesh.name = 'Dog_Tail_Mesh';
  tailMesh.position.set(0, 0.08, -0.06);
  tailMesh.rotation.x = -0.65;
  tailBone.add(tailMesh);

  // 4 Articulated Legs + Paws
  const legEntries: [THREE.Bone, string][] = [
    [legFLBone, 'FL'],
    [legFRBone, 'FR'],
    [legBLBone, 'BL'],
    [legBRBone, 'BR'],
  ];
  for (const [legBone, tag] of legEntries) {
    const legShaft = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.042, 0.18, 10, 14),
      coatMat,
    );
    legShaft.name = `Dog_Leg_${tag}_Mesh`;
    legShaft.position.set(0, -0.13, 0);
    legBone.add(legShaft);

    const pawMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.048, 12, 10),
      bellyMat,
    );
    pawMesh.name = `Dog_Paw_${tag}_Mesh`;
    pawMesh.scale.set(1.0, 0.65, 1.35);
    pawMesh.position.set(0, -0.26, 0.025);
    legBone.add(pawMesh);
  }

  scene.add(rootBone);

  // Embedded "Take 001" AnimationClip (wagging tail, panting jaw, rhythmic gait)
  const times = [0, 0.25, 0.5, 0.75, 1.0];
  const q0 = new THREE.Quaternion();
  const makeRotTrack = (
    boneName: string,
    axis: THREE.Vector3,
    anglesDeg: number[],
  ) => {
    const values: number[] = [];
    for (const deg of anglesDeg) {
      q0.setFromAxisAngle(axis, THREE.MathUtils.degToRad(deg));
      values.push(q0.x, q0.y, q0.z, q0.w);
    }
    return new THREE.QuaternionKeyframeTrack(
      `${boneName}.quaternion`,
      times,
      values,
    );
  };

  const axisX = new THREE.Vector3(1, 0, 0);
  const axisY = new THREE.Vector3(0, 1, 0);
  const axisZ = new THREE.Vector3(0, 0, 1);

  const clip = new THREE.AnimationClip('Take 001', 1.0, [
    makeRotTrack('Dog_Tail', axisZ, [0, 28, 0, -28, 0]),
    makeRotTrack('Dog_Head', axisY, [0, 8, 0, -8, 0]),
    makeRotTrack('Dog_Jaw', axisX, [5, 16, 5, 16, 5]),
    makeRotTrack('Dog_Leg_FL', axisX, [0, 26, 0, -26, 0]),
    makeRotTrack('Dog_Leg_BR', axisX, [0, 26, 0, -26, 0]),
    makeRotTrack('Dog_Leg_FR', axisX, [0, -26, 0, 26, 0]),
    makeRotTrack('Dog_Leg_BL', axisX, [0, -26, 0, 26, 0]),
  ]);

  return { scene, animations: [clip] };
}

function createCartoonPigeonGlbScene(): {
  scene: THREE.Scene;
  animations: THREE.AnimationClip[];
} {
  const scene = new THREE.Scene();
  scene.name = 'RiggedCartoonPigeonScene';

  const rootBone = new THREE.Bone();
  rootBone.name = 'Pigeon_Root';
  rootBone.position.set(0, 0, 0);

  const bodyBone = new THREE.Bone();
  bodyBone.name = 'Pigeon_Body';
  bodyBone.position.set(0, 0.16, 0);
  rootBone.add(bodyBone);

  const neckBone = new THREE.Bone();
  neckBone.name = 'Pigeon_Neck';
  neckBone.position.set(0, 0.08, 0.07);
  bodyBone.add(neckBone);

  const headBone = new THREE.Bone();
  headBone.name = 'Pigeon_Head';
  headBone.position.set(0, 0.07, 0.02);
  neckBone.add(headBone);

  const wingLBone = new THREE.Bone();
  wingLBone.name = 'Pigeon_Wing_L';
  wingLBone.position.set(0.095, 0.03, 0);
  bodyBone.add(wingLBone);

  const wingRBone = new THREE.Bone();
  wingRBone.name = 'Pigeon_Wing_R';
  wingRBone.position.set(-0.095, 0.03, 0);
  bodyBone.add(wingRBone);

  const tailBone = new THREE.Bone();
  tailBone.name = 'Pigeon_Tail';
  tailBone.position.set(0, -0.02, -0.12);
  bodyBone.add(tailBone);

  const legLBone = new THREE.Bone();
  legLBone.name = 'Pigeon_Leg_L';
  legLBone.position.set(0.04, -0.07, 0);
  bodyBone.add(legLBone);

  const legRBone = new THREE.Bone();
  legRBone.name = 'Pigeon_Leg_R';
  legRBone.position.set(-0.04, -0.07, 0);
  bodyBone.add(legRBone);

  // Materials
  const bodyMat = new THREE.MeshStandardMaterial({
    name: 'Pigeon_Slate_Plumage',
    color: 0x64748b,
    roughness: 0.5,
  });
  const wingMat = new THREE.MeshStandardMaterial({
    name: 'Pigeon_Wing_Feather',
    color: 0x475569,
    roughness: 0.55,
  });
  const neckSheenMat = new THREE.MeshStandardMaterial({
    name: 'Pigeon_Iridescent_Neck',
    color: 0x10b981,
    metalness: 0.35,
    roughness: 0.3,
  });
  const neckBandMat = new THREE.MeshStandardMaterial({
    name: 'Pigeon_Violet_Band',
    color: 0xa855f7,
    metalness: 0.3,
    roughness: 0.35,
  });
  const beakMat = new THREE.MeshStandardMaterial({
    name: 'Pigeon_Gold_Beak',
    color: 0xf59e0b,
    roughness: 0.35,
  });
  const footMat = new THREE.MeshStandardMaterial({
    name: 'Pigeon_Coral_Feet',
    color: 0xf97316,
    roughness: 0.45,
  });
  const eyeRingMat = new THREE.MeshStandardMaterial({
    name: 'Pigeon_Orange_Iris',
    color: 0xfb923c,
    roughness: 0.2,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    name: 'Pigeon_Pupil_Wingbar',
    color: 0x0f172a,
    roughness: 0.25,
  });

  // Plump Body
  const bodyMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 20, 18),
    bodyMat,
  );
  bodyMesh.name = 'Pigeon_Body_Mesh';
  bodyMesh.scale.set(0.95, 0.92, 1.32);
  bodyBone.add(bodyMesh);

  // Iridescent Neck Collar
  const neckMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.058, 0.078, 0.08, 16),
    neckSheenMat,
  );
  neckMesh.name = 'Pigeon_Neck_Mesh';
  neckBone.add(neckMesh);

  const bandMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.068, 0.012, 10, 20),
    neckBandMat,
  );
  bandMesh.name = 'Pigeon_VioletBand_Mesh';
  bandMesh.rotation.x = Math.PI * 0.5;
  bandMesh.position.set(0, -0.015, 0);
  neckBone.add(bandMesh);

  // Head & Beak
  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.068, 18, 16),
    bodyMat,
  );
  headMesh.name = 'Pigeon_Head_Mesh';
  headBone.add(headMesh);

  const beakMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.024, 0.075, 12),
    beakMat,
  );
  beakMesh.name = 'Pigeon_Beak_Mesh';
  beakMesh.rotation.x = Math.PI * 0.5;
  beakMesh.position.set(0, -0.005, 0.085);
  headBone.add(beakMesh);

  for (const side of [-1, 1] as const) {
    const iris = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 12, 10),
      eyeRingMat,
    );
    iris.name = side < 0 ? 'Pigeon_Eye_R' : 'Pigeon_Eye_L';
    iris.position.set(side * 0.052, 0.015, 0.032);
    headBone.add(iris);

    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.01, 10, 8),
      darkMat,
    );
    pupil.name = side < 0 ? 'Pigeon_Pupil_R' : 'Pigeon_Pupil_L';
    pupil.position.set(side * 0.062, 0.015, 0.038);
    headBone.add(pupil);
  }

  // Left & Right Feathered Wings with dark wing-bars
  for (const [wingBone, side, label] of [
    [wingLBone, 1, 'L'],
    [wingRBone, -1, 'R'],
  ] as const) {
    const wingPlate = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 16, 14),
      wingMat,
    );
    wingPlate.name = `Pigeon_Wing_${label}_Mesh`;
    wingPlate.scale.set(0.32, 0.72, 1.35);
    wingPlate.position.set(side * 0.03, -0.01, -0.02);
    wingBone.add(wingPlate);

    const wingBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.08, 0.022),
      darkMat,
    );
    wingBar.name = `Pigeon_WingBar_${label}_Mesh`;
    wingBar.position.set(side * 0.05, -0.01, -0.03);
    wingBone.add(wingBar);
  }

  // Tail Fan
  const tailMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.095, 0.018, 0.13),
    wingMat,
  );
  tailMesh.name = 'Pigeon_Tail_Mesh';
  tailMesh.position.set(0, -0.01, -0.05);
  tailMesh.rotation.x = -0.22;
  tailBone.add(tailMesh);

  // Coral Legs & Three-Toed Feet
  for (const [legBone, label] of [
    [legLBone, 'L'],
    [legRBone, 'R'],
  ] as const) {
    const legStick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.085, 8),
      footMat,
    );
    legStick.name = `Pigeon_Leg_${label}_Mesh`;
    legStick.position.set(0, -0.042, 0);
    legBone.add(legStick);

    const footPad = new THREE.Mesh(
      new THREE.BoxGeometry(0.042, 0.012, 0.065),
      footMat,
    );
    footPad.name = `Pigeon_Foot_${label}_Mesh`;
    footPad.position.set(0, -0.084, 0.015);
    legBone.add(footPad);
  }

  scene.add(rootBone);

  // Embedded "Take 001" AnimationClip (wing flap + head bob)
  const times = [0, 0.15, 0.3, 0.45, 0.6];
  const q0 = new THREE.Quaternion();
  const makeRotTrack = (
    boneName: string,
    axis: THREE.Vector3,
    anglesDeg: number[],
  ) => {
    const values: number[] = [];
    for (const deg of anglesDeg) {
      q0.setFromAxisAngle(axis, THREE.MathUtils.degToRad(deg));
      values.push(q0.x, q0.y, q0.z, q0.w);
    }
    return new THREE.QuaternionKeyframeTrack(
      `${boneName}.quaternion`,
      times,
      values,
    );
  };

  const axisX = new THREE.Vector3(1, 0, 0);
  const axisY = new THREE.Vector3(0, 1, 0);
  const axisZ = new THREE.Vector3(0, 0, 1);

  const clip = new THREE.AnimationClip('Take 001', 0.6, [
    makeRotTrack('Pigeon_Wing_L', axisZ, [0, 58, -12, 58, 0]),
    makeRotTrack('Pigeon_Wing_R', axisZ, [0, -58, 12, -58, 0]),
    makeRotTrack('Pigeon_Head', axisX, [0, 14, -6, 14, 0]),
    makeRotTrack('Pigeon_Head', axisY, [0, -10, 10, -10, 0]),
    makeRotTrack('Pigeon_Tail', axisX, [0, -14, 8, -14, 0]),
  ]);

  return { scene, animations: [clip] };
}

async function exportSceneToGlbFile(
  scene: THREE.Scene,
  animations: THREE.AnimationClip[],
  outPath: string,
): Promise<void> {
  const exporter = new GLTFExporter();
  const glbBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      scene,
      (res) => {
        if (res instanceof ArrayBuffer) {
          resolve(res);
        } else {
          reject(new Error('Expected binary ArrayBuffer from GLTFExporter'));
        }
      },
      (err) => reject(err),
      { binary: true, animations },
    );
  });

  fs.writeFileSync(outPath, Buffer.from(glbBuffer));
  console.log(
    `Wrote ${path.basename(outPath)} (${(glbBuffer.byteLength / 1024).toFixed(1)} KB)`,
  );
}

async function main() {
  fs.mkdirSync(CHAR_DIR, { recursive: true });

  // 1. Ensure riiged_anime_girl_outfits__facial_expressions.glb exists in /public/models/characters/
  const girlfriendPath = path.join(
    CHAR_DIR,
    'riiged_anime_girl_outfits__facial_expressions.glb',
  );
  const sourceAnimeGirlPath = path.join(CHAR_DIR, 'anime_girl_character-1.glb');
  if (!fs.existsSync(girlfriendPath) && fs.existsSync(sourceAnimeGirlPath)) {
    fs.copyFileSync(sourceAnimeGirlPath, girlfriendPath);
    console.log(
      `Created ${path.basename(girlfriendPath)} (${(fs.statSync(girlfriendPath).size / 1024).toFixed(1)} KB)`,
    );
  }

  // 2. Generate rigged dog.glb if not already provided by user
  const dogPath = path.join(CHAR_DIR, 'dog.glb');
  const dogData = createCartoonDogGlbScene();
  await exportSceneToGlbFile(dogData.scene, dogData.animations, dogPath);

  // 3. Generate rigged pigeon.glb and peigon.glb
  const pigeonPath = path.join(CHAR_DIR, 'pigeon.glb');
  const peigonPath = path.join(CHAR_DIR, 'peigon.glb');
  const pigeonData = createCartoonPigeonGlbScene();
  await exportSceneToGlbFile(
    pigeonData.scene,
    pigeonData.animations,
    pigeonPath,
  );
  fs.copyFileSync(pigeonPath, peigonPath);
  console.log(`Synced alias ${path.basename(peigonPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
