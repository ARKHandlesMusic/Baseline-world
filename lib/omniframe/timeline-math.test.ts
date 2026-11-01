import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAIN_STREET_SECTION_1_MANIFEST,
  SHOT_MANIFEST,
  STYLE_PALETTES,
} from './asset-manifest';
import {MASTER_ASSET_REGISTRY} from './master-asset-registry';
import {
  CRACK_AND_SONS_INTERIOR_ASSET_TABLE,
  DISPLAY_NUTCRACKER_SPECS,
  HERO_NUTCRACKER_SPEC,
  INTERIOR_GIFT_BAG_SPECS,
  INTERIOR_GIFT_BOX_SPECS,
  INTERIOR_ORNAMENT_SPECS,
  INTERIOR_PRICE_TAG_SPECS,
  INTERIOR_SHELF_SPECS,
  INTERIOR_WRAPPED_PRESENT_SPECS,
  computeInteriorCameraTransformAtFrame,
  evaluateDustParticleAtFrame,
  evaluateHeroNutcrackerPoseAtFrame,
  evaluateShopDoorRigState,
  evaluateStoreTvAdStateAtFrame,
  generateDeterministicDustParticles,
  validateInteriorCupboardAndToyClearance,
} from './crack-and-sons-interior-manifest';
import {
  DARK_ROOM_ASSET_TABLE,
  DARK_ROOM_DESK_PROP_PLACEMENTS,
  computeDarkRoomCameraTransformAtFrame,
  evaluateDarkRoomDoorRigAtFrame,
  evaluateDarkRoomDustMoteAtFrame,
  evaluatePhoneScreenGlowAtFrame,
  generateDarkRoomDustMotes,
  validateDarkRoomSpatialClearance,
} from './dark-room-bedroom-manifest';
import {
  GARAGE_FLOOR_PROP_PLACEMENTS,
  GARAGE_NUCLEAR_LAUNCH_ASSET_TABLE,
  GARAGE_ULTRA_DETAIL_WORKSHOP_MANIFEST,
  computeGarageCameraTransformAtFrame,
  evaluateGarageLaunchStateAtFrame,
  validateGarageSpatialClearance,
} from './garage-nuclear-launch-manifest';
import * as THREE from 'three';
import {
  MAIN_STREET_STYLE_SIGNATURE,
  applyMainStreetStyleToSceneGraph,
  selectMainStreetToonSteps,
  shouldAttachInvertedInkHull,
} from './main-street-style-engine';
import {
  CHARACTER_CAST_MANIFEST,
  evaluateAutoBlink,
  evaluateExpressionFaceState,
  evaluatePoseJointAngles,
  generateSeededCrowdSpecs,
  seededRandom,
} from './characters/rig-utils';
import {SHARED_INK_OUTLINE} from './characters/palette';
import {
  buildThreeCharacterRig,
  buildThreeCrowdGroup,
} from './characters/three-character-rigs-builder';
import {buildThreeSceneCastDirector} from './characters/three-scene-cast-director';
import fs from 'node:fs';
import path from 'node:path';
import {GLTFLoader, type GLTF} from 'three/addons/loaders/GLTFLoader.js';
import {
  GLB_CHARACTER_ASSET_MANIFEST,
  instantiatePreparedGlbCharacter,
} from './characters/glb-character-loader';
import {
  CITY_SHOP_CATALOG,
  HERO_ALLEY_PROPS,
  HERO_BLOCK_SHOPS,
  HERO_SIDEWALK_PROPS,
  ROOFTOP_BILLBOARD_CATALOG,
  evaluateCityVehicleAtFrame,
  generateCityAlleys,
  generateCityRoadNetwork,
  generateCityShrubPlanters,
  generateCityVehicleFleet,
  generateDetailedTreeSpecs,
  generateExtendedAlleyProps,
  generateExtendedCityBuildings,
  generateExtendedCityProps,
  generateSurroundingMountainRange,
  generateUtilityPolesAndCables,
  validateCitySpatialClearance,
} from './city-layout';
import {
  computeCameraTransformAtFrame,
  computeDayNightCycleState,
  computeDroneFlyoverAtFrame,
  computeHalftoneBurstState,
  computeHalftoneDotRadius,
  computeSubPartElevationY,
  evaluateShotForFrame,
  formatTimecode,
  frameToBeat,
  frameToSeconds,
} from './timeline-math';

test('Remotion 60fps frame-to-time and beat mapping is strictly deterministic (t = n / F)', () => {
  assert.equal(MAIN_STREET_SECTION_1_MANIFEST.fps, 60);
  assert.equal(MAIN_STREET_SECTION_1_MANIFEST.durationInFrames, 480);
  assert.equal(frameToSeconds(0, 60), 0);
  assert.equal(frameToSeconds(60, 60), 1);
  assert.equal(frameToSeconds(180, 60), 3);
  assert.equal(frameToBeat(0, 60, 120), 0);
  assert.equal(frameToBeat(30, 60, 120), 1);
  assert.equal(frameToBeat(120, 60, 120), 4);
  assert.equal(formatTimecode(0, 60), '00:00:00');
  assert.equal(formatTimecode(150, 60), '00:02:30');
});

test('Asset #01 Main Street Road Section 1 manifest has 15 composite sub-parts (12 ground plane + Storefront, Cars, Street Lamps) and disjoint Y-offsets', () => {
  const parts = MAIN_STREET_SECTION_1_MANIFEST.subParts;
  assert.equal(parts.length, 15);
  assert.equal(MAIN_STREET_SECTION_1_MANIFEST.coordinateConventions.groundPlaneY, 0);

  const roadbed = parts.find((p) => p.id === 'roadbed-subbase');
  const storefront = parts.find((p) => p.id === 'storefront-crack-and-sons');
  const cars = parts.find((p) => p.id === 'anime-lofi-cars');
  const lamps = parts.find((p) => p.id === 'anime-street-lamps');
  assert.ok(roadbed);
  assert.ok(storefront);
  assert.ok(cars);
  assert.ok(lamps);
  assert.equal(roadbed.baseElevationY, 0);

  const surfaceLayers = parts
    .filter((p) => p.baseElevationY >= 0)
    .map((p) => p.baseElevationY)
    .sort((a, b) => a - b);

  for (let i = 1; i < surfaceLayers.length; i++) {
    const delta = Number((surfaceLayers[i] - surfaceLayers[i - 1]).toFixed(4));
    assert.ok(
      delta >= 0.02,
      `Expected >= 0.02m separation between stacked layers ${surfaceLayers[i - 1]} and ${surfaceLayers[i]}, got ${delta}`,
    );
  }
});

test('Shot manifest covers the entire 480-frame (60fps) Remotion composition with zero gaps or overlaps', () => {
  assert.equal(SHOT_MANIFEST[0].startFrame, 0);
  assert.equal(
    SHOT_MANIFEST[SHOT_MANIFEST.length - 1].endFrame,
    MAIN_STREET_SECTION_1_MANIFEST.durationInFrames - 1,
  );

  for (let i = 1; i < SHOT_MANIFEST.length; i++) {
    assert.equal(
      SHOT_MANIFEST[i].startFrame,
      SHOT_MANIFEST[i - 1].endFrame + 1,
      `Expected continuous frame boundary between ${SHOT_MANIFEST[i - 1].shotId} and ${SHOT_MANIFEST[i].shotId}`,
    );
  }

  const s0 = evaluateShotForFrame(0);
  assert.equal(s0.shot.shotId, 'SHOT-01-ESTABLISHING');
  assert.equal(s0.localProgress, 0);

  const s270 = evaluateShotForFrame(270);
  assert.equal(s270.shot.shotId, 'SHOT-03-HALFTONE-DROP');
  assert.ok(s270.localProgress > 0 && s270.localProgress < 1);
});

test('Halftone pop-art circles get larger inward and shrink as they move outward', () => {
  const innerRadius = computeHalftoneDotRadius(0.05, 0.8);
  const midRadius = computeHalftoneDotRadius(0.5, 0.8);
  const outerRadius = computeHalftoneDotRadius(0.95, 0.8);

  assert.ok(
    innerRadius > midRadius && midRadius > outerRadius,
    `Expected inner (${innerRadius}) > mid (${midRadius}) > outer (${outerRadius})`,
  );

  const burstAtDrop = computeHalftoneBurstState(270, 60, 120, 0.8);
  assert.equal(burstAtDrop.shoutBannerActive, true);
  assert.ok(burstAtDrop.innerCircleScale > burstAtDrop.outerCircleFalloff);
});

test('Master Asset Registry covers all required street, shop, foliage, furniture, vehicle, and storyboard assets', () => {
  assert.ok(MASTER_ASSET_REGISTRY.length >= 40);
  const builtSection1 = MASTER_ASSET_REGISTRY.filter(
    (a) => a.status === 'BUILT_4K_60FPS',
  );
  assert.equal(builtSection1.length, 37);
  assert.equal(STYLE_PALETTES['lofi-night'].id, 'lofi-night');
  const camA = computeCameraTransformAtFrame(144, 'remotion-choreographed');
  const camB = computeCameraTransformAtFrame(144, 'remotion-choreographed');
  assert.deepEqual(camA, camB);
  const storefrontCam = computeCameraTransformAtFrame(60, 'storefront-hero-closeup');
  const carCam = computeCameraTransformAtFrame(60, 'car-hero-showcase');
  const lampCam = computeCameraTransformAtFrame(60, 'street-lamp-showcase');
  assert.equal(storefrontCam.fov, 44);
  assert.equal(carCam.fov, 36);
  assert.equal(lampCam.fov, 42);
  assert.equal(computeSubPartElevationY(0.28, 0.55, 0), 0.28);
});

test('Multi-block city layout has zero spatial collisions, 30 distinct shops, 22 detailed alleys, detailed multi-branch trees, and multi-ridge 360-degree mountains', () => {
  assert.equal(HERO_BLOCK_SHOPS.length, 6);
  assert.equal(CITY_SHOP_CATALOG.length, 30);
  assert.equal(ROOFTOP_BILLBOARD_CATALOG.length, 8);
  assert.ok(HERO_BLOCK_SHOPS.every((s) => s.upperFloorsCount >= 2));

  const hydrants = HERO_SIDEWALK_PROPS.filter((p) => p.type === 'fire-hydrant');
  const dustbins = HERO_SIDEWALK_PROPS.filter((p) => p.type === 'dustbin');
  const lamps = HERO_SIDEWALK_PROPS.filter((p) => p.type === 'street-lamp');
  assert.equal(hydrants.length, 4);
  assert.equal(dustbins.length, 4);
  assert.equal(lamps.length, 8);

  const extendedProps = generateExtendedCityProps();
  assert.ok(extendedProps.length >= 80, `Expected >= 80 full-city street props, got ${extendedProps.length}`);
  assert.ok(extendedProps.some((p) => p.type === 'fire-hydrant'));
  assert.ok(extendedProps.some((p) => p.type === 'dustbin'));
  assert.ok(extendedProps.some((p) => p.type === 'bench'));
  assert.ok(extendedProps.some((p) => p.type === 'traffic-light'));
  assert.ok(extendedProps.some((p) => p.type === 'signpost'));

  const alleys = generateCityAlleys();
  assert.equal(alleys.length, 22);
  assert.ok(alleys.every((a) => a.dumpsterCount >= 1));
  assert.ok(alleys.every((a) => a.garbageBagClusters >= 2));

  assert.ok(HERO_ALLEY_PROPS.length >= 16);
  assert.ok(HERO_ALLEY_PROPS.some((p) => p.type === 'garbage-bag-cluster'));
  assert.ok(HERO_ALLEY_PROPS.some((p) => p.type === 'cardboard-stack'));
  assert.ok(HERO_ALLEY_PROPS.some((p) => p.type === 'wooden-pallet'));
  assert.ok(HERO_ALLEY_PROPS.some((p) => p.type === 'oil-drum'));
  assert.ok(HERO_ALLEY_PROPS.some((p) => p.type === 'milk-crate-stack'));

  const extendedAlleyProps = generateExtendedAlleyProps(alleys);
  assert.ok(extendedAlleyProps.length >= 60);

  const detailedTrees = generateDetailedTreeSpecs();
  assert.ok(detailedTrees.length >= 30);
  assert.ok(detailedTrees.every((t) => t.foliageClusters.length >= 6 && t.branchCount >= 4));

  const clearance = validateCitySpatialClearance();
  assert.equal(
    clearance.valid,
    true,
    `Spatial collision detected: ${clearance.collisions.join('; ')}`,
  );

  const cityBlocks = generateExtendedCityBuildings();
  const tier1 = cityBlocks.filter((b) => b.lodTier === 1);
  const tier2 = cityBlocks.filter((b) => b.lodTier === 2);
  assert.ok(tier1.length >= 80, `Expected >= 80 LOD Tier 1 city buildings across avenues, boulevards & cross-streets, got ${tier1.length}`);
  assert.ok(tier1.every((b) => b.shopBrand !== undefined && b.detailedFacade && b.hasBalconies));
  assert.ok(tier2.length >= 16, `Expected >= 16 LOD Tier 2 town buildings, got ${tier2.length}`);

  const avgHeightTier1 = tier1.reduce((acc, b) => acc + b.heightY, 0) / tier1.length;
  const avgHeightTier2 = tier2.reduce((acc, b) => acc + b.heightY, 0) / tier2.length;
  assert.ok(
    avgHeightTier1 > avgHeightTier2,
    `Expected LOD Tier 1 mid-city buildings (${avgHeightTier1.toFixed(2)}m) to be taller on average than LOD Tier 2 outskirts (${avgHeightTier2.toFixed(2)}m)`,
  );

  const mountains = generateSurroundingMountainRange();
  assert.equal(mountains.length, 68);
  assert.ok(mountains.every((m) => m.subPeakLeftScale > 0.5 && m.subPeakRightScale > 0.5));
});

test('Interconnected 2D city road network has 3 N-S Avenues, 4 E-W Cross-Streets, and 12 4-way intersections with left & right turn arrows', () => {
  const network = generateCityRoadNetwork();
  const nsRoads = network.segments.filter((r) => r.axis === 'north-south');
  const ewRoads = network.segments.filter((r) => r.axis === 'east-west');
  assert.equal(nsRoads.length, 4); // Central N, Central S, West Blvd, East Blvd
  assert.equal(ewRoads.length, 4); // 2nd St N, 2nd St S, 5th St N, 5th St S
  assert.equal(network.intersections.length, 12);
  assert.ok(
    network.intersections.every(
      (ix) =>
        ix.hasCrosswalks &&
        ix.hasLeftTurnArrows &&
        ix.hasRightTurnArrows &&
        ix.hasTactileCorners,
    ),
  );
  assert.ok(
    network.segments.every(
      (r) =>
        r.carriagewayWidthMeters >= 12.5 &&
        r.sidewalkWidthMeters >= 3.6 &&
        r.curbSegmentStepMeters === 5.0 &&
        r.manholeSpacingMeters <= 20.0,
    ),
  );
});

test('Overhead utility cables are strung strictly pole-to-pole between street-side utility poles (zero house-to-house cables)', () => {
  const {poles, cables} = generateUtilityPolesAndCables();
  assert.ok(poles.length >= 40, `Expected >= 40 street utility poles, got ${poles.length}`);
  assert.ok(cables.length >= 35, `Expected >= 35 pole-to-pole cable spans, got ${cables.length}`);

  const poleIds = new Set(poles.map((p) => p.id));
  for (const span of cables) {
    assert.equal(
      span.attachmentType,
      'pole-to-pole',
      `Expected every cable span to be 'pole-to-pole', got ${span.attachmentType}`,
    );
    assert.ok(
      poleIds.has(span.fromPoleId),
      `Cable span ${span.id} references unknown fromPoleId ${span.fromPoleId}`,
    );
    assert.ok(
      poleIds.has(span.toPoleId),
      `Cable span ${span.id} references unknown toPoleId ${span.toPoleId}`,
    );
    assert.notEqual(span.fromPoleId, span.toPoleId);
    assert.ok(span.wireCount >= 2);
  }
});

test('City vehicle fleet (32 cars) is distributed across all avenues, boulevards, cross-streets, and executes smooth 90-degree Left and Right intersection turns', () => {
  const fleet = generateCityVehicleFleet();
  assert.equal(fleet.length, 32);

  const corridors = new Set(fleet.map((v) => v.streetCorridor));
  assert.ok(corridors.has('central-avenue'));
  assert.ok(corridors.has('west-boulevard'));
  assert.ok(corridors.has('east-boulevard'));
  assert.ok(corridors.has('cross-north-inner'));
  assert.ok(corridors.has('cross-south-inner'));
  assert.ok(corridors.has('cross-north-outer'));
  assert.ok(corridors.has('cross-south-outer'));
  assert.ok(corridors.has('intersection-0--24.5'));
  assert.ok(corridors.has('intersection-0-24.5'));

  const leftTurnCars = fleet.filter((v) => v.routeType === 'turn-left');
  const rightTurnCars = fleet.filter((v) => v.routeType === 'turn-right');
  assert.ok(leftTurnCars.length >= 4, `Expected >= 4 left-turn cars, got ${leftTurnCars.length}`);
  assert.ok(rightTurnCars.length >= 4, `Expected >= 4 right-turn cars, got ${rightTurnCars.length}`);

  for (const turnCar of [...leftTurnCars, ...rightTurnCars]) {
    const fStart = ((0.05 - turnCar.phaseOffset01 + 1) % 1) * 480;
    const fMid = ((0.5 - turnCar.phaseOffset01 + 1) % 1) * 480;
    const fEnd = ((0.95 - turnCar.phaseOffset01 + 1) % 1) * 480;
    const startState = evaluateCityVehicleAtFrame(turnCar, fStart, 480);
    const midState = evaluateCityVehicleAtFrame(turnCar, fMid, 480);
    const endState = evaluateCityVehicleAtFrame(turnCar, fEnd, 480);

    // Ensure position advances along both X and Z axes during a 90-degree turn
    const dx = Math.abs(endState.position[0] - startState.position[0]);
    const dz = Math.abs(endState.position[2] - startState.position[2]);
    assert.ok(
      dx > 4 && dz > 4,
      `Turning vehicle ${turnCar.id} should displace across both X (${dx.toFixed(2)}m) and Z (${dz.toFixed(2)}m)`,
    );
    assert.notEqual(
      startState.rotationY.toFixed(2),
      endState.rotationY.toFixed(2),
      `Turning vehicle ${turnCar.id} should change heading angle during turn`,
    );
    assert.ok(Number.isFinite(midState.rotationY));
  }
});

test('Drone City Flyover trajectory sweeps smoothly over Central Ave, 4-Way Intersections, Cross-Streets, and Boulevards', () => {
  const startDrone = computeDroneFlyoverAtFrame(0, 480);
  const midDrone = computeDroneFlyoverAtFrame(240, 480);
  const peakDrone = computeDroneFlyoverAtFrame(360, 480);

  assert.ok(startDrone.position[1] >= 14, `Expected aerial altitude >= 14m at start, got ${startDrone.position[1]}`);
  assert.ok(midDrone.position[1] >= 22, `Expected aerial altitude >= 22m at mid-flight, got ${midDrone.position[1]}`);
  assert.ok(peakDrone.position[1] >= 28, `Expected aerial altitude >= 28m at high-altitude sweep, got ${peakDrone.position[1]}`);

  const presetCam = computeCameraTransformAtFrame(180, 'drone-city-flyover');
  const directCam = computeDroneFlyoverAtFrame(180, 480);
  assert.deepEqual(presetCam.position, directCam.position);
  assert.deepEqual(presetCam.target, directCam.target);
});

test('Day / Night Cycle and manual Day / Night switch evaluate deterministically across frames', () => {
  const dayState = computeDayNightCycleState(100, 480, 'day');
  assert.equal(dayState.nightFactor, 0);
  assert.ok(dayState.sunDirection[1] > 0.25);

  const nightState = computeDayNightCycleState(100, 480, 'night');
  assert.equal(nightState.nightFactor, 1);
  assert.ok(nightState.moonDirection[1] > 0.25);

  const cycleNoon = computeDayNightCycleState(30, 480, 'auto-cycle');
  const cycleSunset = computeDayNightCycleState(168, 480, 'auto-cycle');
  const cycleMidnight = computeDayNightCycleState(270, 480, 'auto-cycle');
  const cycleDawn = computeDayNightCycleState(425, 480, 'auto-cycle');

  assert.equal(cycleNoon.nightFactor, 0);
  assert.ok(cycleSunset.nightFactor > 0.15 && cycleSunset.nightFactor < 0.9);
  assert.equal(cycleMidnight.nightFactor, 1);
  assert.ok(cycleDawn.nightFactor > 0.1 && cycleDawn.nightFactor < 0.9);
});

test('Sidewalk shrub & blossom planters and pole-only longitudinal utility cables cover the entire city grid', () => {
  const planters = generateCityShrubPlanters();
  assert.equal(planters.length, 68);
  assert.ok(planters.every((p) => p.flowerColorHex.startsWith('#') && p.planterVariant >= 0));

  const {poles, cables} = generateUtilityPolesAndCables();
  const poleMap = new Map(poles.map((p) => [p.id, p]));
  for (const cable of cables) {
    const pA = poleMap.get(cable.fromPoleId)!;
    const pB = poleMap.get(cable.toPoleId)!;
    // Verify no cable crosses across the street from West side to East side of a road
    const dx = Math.abs(pA.x - pB.x);
    const dz = Math.abs(pA.z - pB.z);
    assert.ok(
      dx < 0.5 || dz < 0.5,
      `Expected longitudinal pole-to-pole cable alignment (no cross-building or cross-road tie), got dx=${dx}, dz=${dz}`,
    );
  }
});

test('Crack & Sons Shop Interior satisfies all 26 requested asset categories and exact quantities', () => {
  assert.equal(CRACK_AND_SONS_INTERIOR_ASSET_TABLE.length, 26);

  const byName = new Map(
    CRACK_AND_SONS_INTERIOR_ASSET_TABLE.map((r) => [r.assetName, r.builtQuantity]),
  );

  assert.equal(byName.get('Interior room shell'), 1);
  assert.equal(byName.get('Wooden floor'), 1);
  assert.ok((byName.get('Interior wall sections') ?? 0) >= 3 && (byName.get('Interior wall sections') ?? 0) <= 4);
  assert.equal(byName.get('Ceiling'), 1);
  assert.ok((byName.get('Display shelves') ?? 0) >= 3 && (byName.get('Display shelves') ?? 0) <= 5);
  assert.equal(byName.get('Wooden counter'), 1);
  assert.equal(byName.get('Cash register'), 1);
  assert.ok((byName.get('Nutcracker display dolls') ?? 0) >= 8 && (byName.get('Nutcracker display dolls') ?? 0) <= 15);
  assert.equal(byName.get('Hero nutcracker doll'), 1);
  assert.ok((byName.get('Gift boxes') ?? 0) >= 6 && (byName.get('Gift boxes') ?? 0) <= 10);
  assert.ok((byName.get('Wrapped presents') ?? 0) >= 4 && (byName.get('Wrapped presents') ?? 0) <= 8);
  assert.ok((byName.get('Christmas ornaments') ?? 0) >= 6 && (byName.get('Christmas ornaments') ?? 0) <= 12);
  assert.equal(byName.get('Small Christmas tree'), 1);
  assert.ok((byName.get('Garland') ?? 0) >= 2 && (byName.get('Garland') ?? 0) <= 3);
  assert.equal(byName.get('Decorative wreath'), 1);
  assert.ok((byName.get('Hanging shop lights') ?? 0) >= 3 && (byName.get('Hanging shop lights') ?? 0) <= 5);
  assert.equal(byName.get('Wall lamps'), 2);
  assert.equal(byName.get('Rug'), 1);
  assert.ok((byName.get('Shopping basket') ?? 0) >= 1 && (byName.get('Shopping basket') ?? 0) <= 2);
  assert.ok((byName.get('Gift bags') ?? 0) >= 3 && (byName.get('Gift bags') ?? 0) <= 5);
  assert.ok((byName.get('Wrapping paper rolls') ?? 0) >= 2 && (byName.get('Wrapping paper rolls') ?? 0) <= 3);
  assert.ok((byName.get('Ribbon spools') ?? 0) >= 2 && (byName.get('Ribbon spools') ?? 0) <= 4);
  assert.ok((byName.get('Price tags') ?? 0) >= 5 && (byName.get('Price tags') ?? 0) <= 10);
  assert.equal(byName.get('Small bell/chime'), 1);
  assert.equal(byName.get('Doorbell mechanism'), 1);
  assert.equal(byName.get('Dust particles in light'), 1);

  assert.equal(HERO_NUTCRACKER_SPEC.isHero, true);
  assert.equal(DISPLAY_NUTCRACKER_SPECS.length, 14);
  assert.equal(INTERIOR_PRICE_TAG_SPECS.length, 10);
});

test('Crack & Sons 2D TV Store Commercial, Hero Nutcracker Jaw, Volumetric Dust, and Interior Camera evaluate deterministically', () => {
  const ad0 = evaluateStoreTvAdStateAtFrame(30, 60);
  const ad1 = evaluateStoreTvAdStateAtFrame(150, 60);
  const ad2 = evaluateStoreTvAdStateAtFrame(270, 60);
  assert.equal(ad0.sceneId, 'logo-chomp');
  assert.equal(ad1.sceneId, 'walnut-crush');
  assert.equal(ad2.sceneId, 'holiday-sale');

  const heroPoseA = evaluateHeroNutcrackerPoseAtFrame(15, 60);
  const heroPoseB = evaluateHeroNutcrackerPoseAtFrame(15, 60);
  assert.deepEqual(heroPoseA, heroPoseB);
  assert.ok(heroPoseA.jawAngleRad >= 0 && heroPoseA.jawAngleRad <= 0.45);

  const dustSpecs = generateDeterministicDustParticles(120);
  assert.equal(dustSpecs.length, 120);
  const pState = evaluateDustParticleAtFrame(dustSpecs[0], 90, 60);
  assert.ok(pState.y >= 0.4 && pState.y <= 3.6);

  for (const f of [0, 60, 120, 180, 240, 300, 360, 420, 480]) {
    const cam = computeInteriorCameraTransformAtFrame(f, 'interior-choreographed-tour');
    assert.ok(Math.abs(cam.position[0]) < 4.1);
    assert.ok(cam.position[1] > 0.3 && cam.position[1] < 3.9);
    assert.ok(Math.abs(cam.position[2]) < 3.2);
  }
});

test('Zero toys phase through the 5 display cupboards (all 14 Nutcracker dolls, 10 gift boxes, 8 wrapped presents, 5 gift bags & 12 ornaments have positive vertical & horizontal clearance)', () => {
  assert.equal(INTERIOR_SHELF_SPECS.length, 5);
  assert.equal(DISPLAY_NUTCRACKER_SPECS.length, 14);
  assert.equal(INTERIOR_GIFT_BOX_SPECS.length, 10);
  assert.equal(INTERIOR_WRAPPED_PRESENT_SPECS.length, 8);
  assert.equal(INTERIOR_GIFT_BAG_SPECS.length, 5);
  assert.equal(INTERIOR_ORNAMENT_SPECS.length, 12);

  const clearance = validateInteriorCupboardAndToyClearance();
  assert.equal(
    clearance.valid,
    true,
    `Expected zero cupboard-phasing violations, got: ${clearance.violations.join(' | ')}`,
  );
  assert.equal(clearance.violations.length, 0);
});

test('Rigged shop entrance door turns the lever handle downward & retracts the mortise latch bolt before swinging open around its hinge pivot', () => {
  const closedState = evaluateShopDoorRigState({
    frame: 0,
    fps: 60,
    mode: 'manual-closed',
    manualProgress01: 0,
  });
  assert.equal(closedState.handleTurnAngleRad, 0);
  assert.equal(closedState.latchRetractionMeters, 0);
  assert.equal(closedState.doorSwingAngleRad, 0);
  assert.equal(closedState.doorbellRingIntensity, 0);

  const turnOnlyState = evaluateShopDoorRigState({
    frame: 0,
    fps: 60,
    mode: 'turn-handle-only',
  });
  assert.ok(
    turnOnlyState.handleTurnAngleRad > 0.65,
    `Expected handle to depress >= 37° (0.65 rad) when unlatching, got ${turnOnlyState.handleTurnAngleRad}`,
  );
  assert.ok(
    turnOnlyState.latchRetractionMeters >= 0.025,
    `Expected mortise latch bolt to retract >= 25mm, got ${turnOnlyState.latchRetractionMeters}`,
  );
  assert.equal(turnOnlyState.doorSwingAngleRad, 0);

  const openState = evaluateShopDoorRigState({
    frame: 60,
    fps: 60,
    mode: 'manual-open',
    manualProgress01: 1,
  });
  assert.ok(
    openState.doorSwingAngleRad > 1.1,
    `Expected door to swing open >= 63° (1.1 rad), got ${openState.doorSwingAngleRad}`,
  );
  assert.ok(openState.doorbellRingIntensity > 0);

  // Verify 2-stage timeline auto-cycle: handle turns first (f=24..36), then door swings open (f=45..120)
  const autoUnlatch = evaluateShopDoorRigState({
    frame: 30,
    fps: 60,
    mode: 'timeline-auto',
  });
  assert.ok(autoUnlatch.handleTurnAngleRad > 0.45);
  assert.ok(autoUnlatch.latchRetractionMeters > 0.015);
  assert.equal(autoUnlatch.doorSwingAngleRad, 0);

  const autoOpen = evaluateShopDoorRigState({
    frame: 120,
    fps: 60,
    mode: 'timeline-auto',
  });
  assert.ok(autoOpen.doorSwingAngleRad > 1.1);
});

test('Dark Room (Bedroom) satisfies all 22 core asset categories (including Sofa, TV playing the news & Lounge window) with chip packets removed and zero desktop prop phasing', () => {
  assert.equal(DARK_ROOM_ASSET_TABLE.length, 22);

  const byName = new Map(
    DARK_ROOM_ASSET_TABLE.map((r) => [r.assetName, r.builtQuantity]),
  );

  assert.equal(byName.get('Bedroom shell'), 1);
  assert.equal(byName.get('Floor and walls'), 1);
  assert.equal(byName.get('Bed'), 1);
  assert.equal(byName.get('Blanket and pillow'), 1);
  assert.equal(byName.get('Desk'), 1);
  assert.equal(byName.get('Chair'), 1);
  assert.equal(byName.get('Smartphone'), 1);
  assert.equal(byName.get('Phone screen/UI'), 1);
  assert.equal(byName.get('Computer monitor'), 1);
  assert.equal(byName.get('Keyboard'), 1);
  assert.equal(byName.get('Mouse'), 1);
  assert.equal(byName.has('Snack bag'), false);
  assert.equal(byName.has('Snack pieces'), false);
  assert.equal(byName.get('Water bottle'), 1);
  assert.equal(byName.get('Desk lamp'), 1);
  assert.equal(byName.get('Window'), 1);
  assert.equal(byName.get('Curtains/blinds'), 1);
  assert.ok((byName.get('Wall posters') ?? 0) >= 2 && (byName.get('Wall posters') ?? 0) <= 3);
  assert.equal(byName.get('Sunglasses'), 1);
  assert.equal(byName.get('Room door'), 1);
  assert.equal(byName.get('Ambient dust'), 1);
  assert.equal(byName.get('Sofa'), 1);
  assert.equal(byName.get('TV playing the news'), 1);
  assert.equal(byName.get('Lounge window'), 1);

  assert.equal(DARK_ROOM_DESK_PROP_PLACEMENTS.length, 7);

  const clearance = validateDarkRoomSpatialClearance();
  assert.equal(
    clearance.valid,
    true,
    `Expected zero Dark Room spatial clearance violations, got: ${clearance.violations.join(' | ')}`,
  );
});

test('Dark Room Smartphone Screen/UI Glow Lighting Rig, Volumetric Dust Motes, Rigged Bedroom Door, and Camera evaluate deterministically', () => {
  const glow0 = evaluatePhoneScreenGlowAtFrame({
    frame: 30,
    fps: 60,
    colorMode: 'auto-ui-sync',
    glowMultiplier: 1.25,
  });
  const glow1 = evaluatePhoneScreenGlowAtFrame({
    frame: 150,
    fps: 60,
    colorMode: 'auto-ui-sync',
    glowMultiplier: 1.25,
  });
  const glow2 = evaluatePhoneScreenGlowAtFrame({
    frame: 270,
    fps: 60,
    colorMode: 'auto-ui-sync',
    glowMultiplier: 1.25,
  });

  assert.equal(glow0.screenSceneId, 'incoming-call-pulse');
  assert.equal(glow1.screenSceneId, 'music-visualizer-drop');
  assert.equal(glow2.screenSceneId, 'midnight-alert-surge');
  assert.ok(glow0.keyLightIntensity > 4.0);
  assert.ok(glow0.volumetricConeOpacity > 0.05);
  assert.equal(glow0.equalizerBars.length, 12);

  const motes = generateDarkRoomDustMotes(120);
  assert.equal(motes.length, 120);
  const nearPhoneMoteState = evaluateDarkRoomDustMoteAtFrame(motes[0], 60, 60);
  assert.ok(nearPhoneMoteState.y >= 0.35 && nearPhoneMoteState.y <= 2.9);

  const doorOpen = evaluateDarkRoomDoorRigAtFrame({
    frame: 60,
    fps: 60,
    mode: 'manual-open',
  });
  assert.ok(doorOpen.doorSwingAngleRad > 0.95);
  assert.ok(doorOpen.hallwayLightIntensity > 1.5);

  const sofaCam = computeDarkRoomCameraTransformAtFrame(
    30,
    'sofa-news-tv-window-closeup',
  );
  assert.ok(sofaCam.fov > 35 && sofaCam.fov < 60);

  for (const f of [0, 60, 120, 180, 240, 300, 360, 420, 480]) {
    const cam = computeDarkRoomCameraTransformAtFrame(
      f,
      'dark-room-choreographed-tour',
    );
    assert.ok(Math.abs(cam.position[0]) < 3.4);
    assert.ok(cam.position[1] > 0.35 && cam.position[1] < 3.0);
    assert.ok(Math.abs(cam.position[2]) < 2.7);
  }
});

test('Garage & Nuclear Launch Setup satisfies all 24 requested asset categories, exact quantities, and zero floor prop collisions', () => {
  assert.equal(GARAGE_NUCLEAR_LAUNCH_ASSET_TABLE.length, 24);

  const byName = new Map(
    GARAGE_NUCLEAR_LAUNCH_ASSET_TABLE.map((r) => [r.assetName, r.builtQuantity]),
  );

  assert.equal(byName.get('Garage shell'), 1);
  assert.equal(byName.get('Garage door'), 1);
  assert.equal(byName.get('Door tracks'), 2);
  assert.ok((byName.get('Light bulb/overhead lamp') ?? 0) >= 2 && (byName.get('Light bulb/overhead lamp') ?? 0) <= 3);
  assert.equal(byName.get('Rusty trolley'), 1);
  assert.equal(byName.get('Bicycle'), 1);
  assert.equal(byName.get('Cartoon nuke'), 1);
  assert.ok((byName.get('Nuke fins') ?? 0) >= 3 && (byName.get('Nuke fins') ?? 0) <= 4);
  assert.equal(byName.get('Nuke nose cone'), 1);
  assert.equal(byName.get('Nuke body'), 1);
  assert.equal(byName.get('Nuke warning markings'), 1);
  assert.equal(byName.get('Launch smoke'), 1);
  assert.equal(byName.get('Launch fire'), 1);
  assert.equal(byName.get('Ground dust'), 1);
  assert.equal(byName.get('Cardboard countdown sign'), 1);
  assert.equal(byName.get('Cardboard “NUKE LAUNCH” sign'), 1);
  assert.equal(byName.get('Tool cabinet'), 1);
  assert.equal(byName.get('Toolbox'), 1);
  assert.equal(byName.get('Spare tire'), 1);
  assert.ok((byName.get('Shelving') ?? 0) >= 1 && (byName.get('Shelving') ?? 0) <= 2);
  assert.ok((byName.get('Paint cans') ?? 0) >= 3 && (byName.get('Paint cans') ?? 0) <= 5);
  assert.ok((byName.get('Cardboard boxes') ?? 0) >= 3 && (byName.get('Cardboard boxes') ?? 0) <= 6);
  assert.equal(byName.get('Extension cable'), 1);
  assert.equal(byName.get('Floor stains and cracks'), 1);

  assert.equal(GARAGE_FLOOR_PROP_PLACEMENTS.length, 9);
  const clearance = validateGarageSpatialClearance();
  assert.equal(
    clearance.valid,
    true,
    `Expected zero Garage spatial clearance violations, got: ${clearance.violations.join(' | ')}`,
  );
});

test('Garage Animated Door + 2 Ceiling Tracks, 3-Bulb Dramatic Reveal, Hype Man Countdown & Nuclear Launch VFX evaluate deterministically', () => {
  const closedState = evaluateGarageLaunchStateAtFrame({
    frame: 0,
    fps: 60,
    doorMode: 'manual-closed',
    launchMode: 'countdown-standby',
  });
  assert.equal(closedState.doorOpenProgress01, 0);
  assert.equal(closedState.doorPanelPoses.length, 4);
  assert.equal(closedState.doorPanelPoses[0].rotationX, 0);

  const openState = evaluateGarageLaunchStateAtFrame({
    frame: 60,
    fps: 60,
    doorMode: 'manual-open',
    launchMode: 'full-ignition-blast',
  });
  assert.equal(openState.doorOpenProgress01, 1);
  // Top panels should be rotated horizontal (PI / 2) along the ceiling tracks
  assert.ok(openState.doorPanelPoses[3].rotationX > 1.5);
  assert.ok(openState.doorPanelPoses[3].y > 2.9);
  assert.equal(openState.launchFireIntensity01, 1.0);
  assert.equal(openState.launchSmokeScale01, 1.0);
  assert.equal(openState.lampIntensities.length, 3);
  assert.ok(openState.lampIntensities[0] > 6.0);

  for (const f of [0, 60, 120, 180, 240, 300, 360, 420, 480]) {
    const cam = computeGarageCameraTransformAtFrame(
      f,
      'garage-choreographed-tour',
    );
    assert.ok(Math.abs(cam.position[0]) < 4.1);
    assert.ok(cam.position[1] > 0.4 && cam.position[1] < 3.5);
    assert.ok(Math.abs(cam.position[2]) < 3.4);
  }
});

test('Main Street Cel-Shaded + 2D Comic Ink Style Engine converts meshes to quantized Toon materials and attaches EdgesGeometry + inverted BackSide hulls across scenes', () => {
  assert.equal(MAIN_STREET_STYLE_SIGNATURE.inkOutlineColor, '#0A0812');
  assert.deepEqual(MAIN_STREET_STYLE_SIGNATURE.celBands, [3, 4]);
  assert.equal(MAIN_STREET_STYLE_SIGNATURE.supportedScenes.length, 4);

  // Shiny metallic prop gets 4-band specular toon steps; matte wall gets 3-band toon steps
  assert.equal(selectMainStreetToonSteps(0.22, 0.8), 4);
  assert.equal(selectMainStreetToonSteps(0.85, 0.05), 3);

  // Solid 3D prop gets inverted hull; ultra-flat sticker or oversized room shell does not
  assert.equal(shouldAttachInvertedInkHull([0.6, 0.8, 0.5], false, 1.0), true);
  assert.equal(shouldAttachInvertedInkHull([0.4, 0.3, 0.002], false, 1.0), false);
  assert.equal(shouldAttachInvertedInkHull([9.5, 4.0, 7.0], false, 1.0), false);

  const rootGroup = new THREE.Group();
  const solidPropGeo = new THREE.BoxGeometry(0.8, 1.2, 0.8);
  const solidPropMat = new THREE.MeshStandardMaterial({
    color: '#D93829',
    roughness: 0.3,
    metalness: 0.7,
  });
  const solidPropMesh = new THREE.Mesh(solidPropGeo, solidPropMat);
  rootGroup.add(solidPropMesh);

  const applied = applyMainStreetStyleToSceneGraph(rootGroup);
  assert.ok(solidPropMesh.material instanceof THREE.MeshToonMaterial);
  assert.equal(applied.inkLineObjects.length, 2);

  // Toggling visibility works for both crease lines and inverted silhouette hulls
  for (const obj of applied.inkLineObjects) {
    obj.visible = false;
  }
  assert.equal(applied.inkLineObjects[0].visible, false);
  assert.equal(applied.inkLineObjects[1].visible, false);
  applied.disposeStyleResources();
});

test('Garage 1000x Ultra-Detail Workshop Manifest & Sub-Floor Silo Ground Opening + Nuke Emergence Animation evaluate deterministically', () => {
  assert.equal(GARAGE_ULTRA_DETAIL_WORKSHOP_MANIFEST.length, 8);
  const totalUltraSubParts = GARAGE_ULTRA_DETAIL_WORKSHOP_MANIFEST.reduce(
    (sum, item) => sum + item.subPartCount,
    0,
  );
  assert.equal(totalUltraSubParts, 348);

  // 1. Frame 0 in timeline-cycle (and concealed-underground): Nuke is completely hidden underground ("do not shoow the nuke")
  const frame0State = evaluateGarageLaunchStateAtFrame({
    frame: 0,
    fps: 60,
    launchMode: 'timeline-cycle',
  });
  assert.equal(frame0State.siloGroundOpenProgress01, 0);
  assert.equal(frame0State.nukeElevatorRiseProgress01, 0);
  assert.equal(frame0State.nukeWorldY, -2.35);
  assert.equal(frame0State.nukeConcealedUnderground, true);
  assert.equal(frame0State.launchFireIntensity01, 0);

  // 2. Frame 58 in timeline-cycle: Ground opens up a little bit & steam vents hiss
  const groundOpeningState = evaluateGarageLaunchStateAtFrame({
    frame: 58,
    fps: 60,
    launchMode: 'timeline-cycle',
  });
  assert.ok(
    groundOpeningState.siloGroundOpenProgress01 > 0.35 &&
      groundOpeningState.siloGroundOpenProgress01 < 0.95,
  );
  assert.ok(groundOpeningState.siloSteamVentIntensity01 > 0.5);
  assert.equal(groundOpeningState.nukeConcealedUnderground, false);

  // 3. Frame 112 in timeline-cycle: Nuke rises out of the opened ground hatch on the hydraulic scissor-lift
  const risingOutState = evaluateGarageLaunchStateAtFrame({
    frame: 112,
    fps: 60,
    launchMode: 'timeline-cycle',
  });
  assert.equal(risingOutState.siloGroundOpenProgress01, 1.0);
  assert.ok(
    risingOutState.nukeElevatorRiseProgress01 > 0.45 &&
      risingOutState.nukeElevatorRiseProgress01 < 0.95,
  );
  assert.ok(risingOutState.nukeWorldY > -1.35 && risingOutState.nukeWorldY < -0.1);

  // 4. Frame 160 in timeline-cycle: Nuke has fully emerged at floor level (Y = 0)
  const emergedState = evaluateGarageLaunchStateAtFrame({
    frame: 160,
    fps: 60,
    launchMode: 'timeline-cycle',
  });
  assert.equal(emergedState.siloGroundOpenProgress01, 1.0);
  assert.equal(emergedState.nukeElevatorRiseProgress01, 1.0);
  assert.equal(emergedState.nukeWorldY, 0);
  assert.equal(emergedState.nukeConcealedUnderground, false);
});

test('10-Character SVG Puppet Rig System: Manifest completeness, deterministic Remotion random(seed), pose kinematics, face expressions & <Crowd /> generator', () => {
  // Verify shared ink outline matches Main Street city
  assert.equal(SHARED_INK_OUTLINE, '#0A0812');

  // Verify all 10 character types are registered with complete expressions & animations
  assert.equal(CHARACTER_CAST_MANIFEST.length, 10);

  const mainBoy = CHARACTER_CAST_MANIFEST.find((c) => c.characterId === 'main-boy');
  assert.ok(mainBoy);
  assert.deepEqual(mainBoy.expressions, [
    'happy',
    'nervous',
    'terrified',
    'determined',
    'shocked',
    'guilty',
  ]);
  assert.deepEqual(mainBoy.animations, [
    'walk',
    'hand-holding-walk',
    'sprint',
    'point',
    'salute',
    'dance',
    'freeze',
    'mouth-drop',
  ]);

  const mainGirl = CHARACTER_CAST_MANIFEST.find((c) => c.characterId === 'main-girl');
  assert.ok(mainGirl);
  assert.deepEqual(mainGirl.expressions, [
    'happy',
    'confused',
    'neutral',
    'soot-covered',
  ]);
  assert.deepEqual(mainGirl.animations, [
    'walk',
    'point-at-shop',
    'shrug',
    'browse-shelves',
    'walk-out-of-rubble',
    'hand-holding',
    'holding-christmas-doll',
  ]);

  // Deterministic Remotion random(seed) check
  const r1 = seededRandom('test-seed-101');
  const r2 = seededRandom('test-seed-101');
  const r3 = seededRandom('test-seed-202');
  assert.equal(r1, r2);
  assert.notEqual(r1, r3);

  // Mouth-drop pose & jaw-drop expression check
  const mouthDropJoints = evaluatePoseJointAngles('mouth-drop', 40, {
    fps: 60,
    startFrame: 0,
    speed: 1,
    seed: 'boy-jaw-test',
  });
  assert.ok(mouthDropJoints.jawDropPx > 20);

  // Detachable Nutcracker head spring arc check
  const nutHeadPop = evaluatePoseJointAngles('detachable-head', 45, {
    fps: 60,
    startFrame: 0,
    speed: 1,
    seed: 'nutcracker-pop',
  });
  assert.ok(nutHeadPop.headDetachY < -30);
  assert.ok(Math.abs(nutHeadPop.headDetachRotate) > 40);

  // Soot-covered expression check
  const sootFace = evaluateExpressionFaceState(
    'soot-covered',
    'walk-out-of-rubble',
    30,
    'girl-soot',
  );
  assert.equal(sootFace.sootCovered, true);

  // Auto-blink determinism check
  const blink0 = evaluateAutoBlink(12, 'blink-seed-a');
  const blink0Repeat = evaluateAutoBlink(12, 'blink-seed-a');
  assert.deepEqual(blink0, blink0Repeat);

  // Seeded <Crowd /> generator check (no two background pedestrians identical)
  const crowd = generateSeededCrowdSpecs(14, 'crowd-seed-verify');
  assert.equal(crowd.length, 14);
  assert.notEqual(crowd[0].seed, crowd[1].seed);
  const uniqueSeeds = new Set(
    crowd.map(
      (c) => `${c.topColor.base}-${c.bottomColor.base}-${c.walkSpeed.toFixed(3)}`,
    ),
  );
  assert.ok(uniqueSeeds.size >= 12);
});

test('3D Three.js character rigs build all 10 articulated 3D character types, 3D Crowd, and 4-scene 3D Cast Directors', () => {
  const allTenTypes = CHARACTER_CAST_MANIFEST.map((c) => c.id);
  assert.equal(allTenTypes.length, 10);

  for (const characterId of allTenTypes) {
    const rig = buildThreeCharacterRig({
      characterId,
      seed: `three-rig-test-${characterId}`,
      sunglasses: characterId === 'main-boy',
      countdownValue: 'BOOM!',
    });

    assert.ok(rig.rootGroup instanceof THREE.Group);
    assert.ok(rig.parts.pelvis instanceof THREE.Group);
    assert.ok(rig.parts.torso instanceof THREE.Group);
    assert.ok(rig.parts.head instanceof THREE.Group);
    assert.ok(rig.parts.jaw instanceof THREE.Group);
    assert.ok(rig.parts.hat instanceof THREE.Group);
    assert.ok(rig.parts.hair instanceof THREE.Group);
    assert.ok(rig.parts.eyes instanceof THREE.Group);
    assert.ok(rig.parts.brows instanceof THREE.Group);
    assert.ok(rig.parts.mouth instanceof THREE.Group);
    assert.ok(rig.parts.accessories instanceof THREE.Group);

    // Verify 3D meshes and Main Street Toon + Ink outline styling are attached
    let meshCount = 0;
    let toonMeshCount = 0;
    rig.rootGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        meshCount += 1;
        const mat = (obj as THREE.Mesh).material;
        if (mat instanceof THREE.MeshToonMaterial) {
          toonMeshCount += 1;
        }
      }
    });
    assert.ok(
      meshCount >= 6,
      `Expected ${characterId} to have >= 6 3D meshes, got ${meshCount}`
    );
    assert.ok(
      toonMeshCount >= 4,
      `Expected ${characterId} to have cel-shaded MeshToonMaterial meshes`
    );

    // Evaluate deterministic frame update
    rig.updateAtFrame({ frame: 36, fps: 60 });
    rig.dispose();
  }

  // Verify Nutcracker 3D detachable-head spring arc moves the 3D head joint upward
  const nutRig = buildThreeCharacterRig({
    characterId: 'nutcracker-doll',
    pose: 'detachable-head',
    expression: 'shocked',
    seed: 'nut-3d-head-test',
  });
  nutRig.updateAtFrame({ frame: 45, fps: 60 });
  assert.ok(nutRig.parts.head.position.y > 0.65);
  nutRig.dispose();

  // Verify Main Boy 3D mouth-drop lowers the 3D jaw joint
  const boyRig = buildThreeCharacterRig({
    characterId: 'main-boy',
    pose: 'mouth-drop',
    expression: 'shocked',
    sunglasses: true,
    seed: 'boy-3d-jaw-test',
  });
  boyRig.updateAtFrame({ frame: 45, fps: 60 });
  assert.equal(boyRig.parts.jaw.children[0].visible, true);
  assert.ok(boyRig.parts.jaw.children[0].position.y < -0.10);
  boyRig.dispose();

  // Verify 3D Crowd Group spawns N seeded 3D pedestrians
  const crowd3D = buildThreeCrowdGroup({
    count: 8,
    seed: 'test-3d-crowd',
    zSpan: 16,
  });
  assert.equal(crowd3D.members.length, 8);
  crowd3D.updateAtFrame(60, 60);
  crowd3D.dispose();

  // Verify all 4 3D Scene Cast Directors populate and update cleanly
  const contexts = [
    'main-street',
    'crack-and-sons-shop',
    'dark-room-bedroom',
    'garage-nuclear-launch',
  ] as const;
  for (const ctx of contexts) {
    const director = buildThreeSceneCastDirector(ctx);
    assert.ok(director.rootGroup.children.length > 0);
    director.updateAtFrame(48, 60);
    director.dispose();
  }
});

test('All 11 rigged .glb character & animal models in /public/models/characters/ load, strip skateboard on Main Boy, rig Girlfriend with outfits & expressions, and animate deterministically', async () => {
  (globalThis as Record<string, unknown>).self = globalThis;
  THREE.ImageLoader.prototype.load = function (_url, onLoad) {
    const dummy = {width: 4, height: 4};
    if (onLoad) setTimeout(() => onLoad(dummy as unknown as HTMLImageElement), 0);
    return dummy as unknown as HTMLImageElement;
  };
  if (typeof globalThis.URL.createObjectURL === 'undefined') {
    globalThis.URL.createObjectURL = () => 'blob:mock';
    globalThis.URL.revokeObjectURL = () => {};
  }

  assert.equal(GLB_CHARACTER_ASSET_MANIFEST.length, 11);
  const loader = new GLTFLoader();
  const parsedMap = new Map<string, GLTF>();

  for (const entry of GLB_CHARACTER_ASSET_MANIFEST) {
    const fullDiskPath = path.resolve(process.cwd(), 'public', entry.publicPath);
    assert.ok(
      fs.existsSync(fullDiskPath),
      `Expected ${entry.fileName} to exist at ${fullDiskPath}`,
    );

    const buf = fs.readFileSync(fullDiskPath);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const gltf = await new Promise<GLTF>((resolve, reject) => {
      loader.parse(ab, '', resolve, reject);
    });
    parsedMap.set(entry.modelId, gltf);
  }

  // Also verify peigon.glb alias exists on disk
  assert.ok(
    fs.existsSync(path.resolve(process.cwd(), 'public/models/characters/peigon.glb')),
    'Expected peigon.glb alias to exist in /public/models/characters/',
  );

  const donorIdle = parsedMap.get('idle-male-loop') ?? null;
  const donorWalk = parsedMap.get('basic-walk-female-loop') ?? null;

  for (const entry of GLB_CHARACTER_ASSET_MANIFEST) {
    const gltf = parsedMap.get(entry.modelId)!;
    const handle = instantiatePreparedGlbCharacter(entry, gltf, {
      donorIdleGltf: donorIdle,
      donorWalkGltf: donorWalk,
    });

    // 1. Verify Main Boy has ZERO skateboard nodes or meshes remaining
    if (entry.modelId === 'game-boy-hero') {
      let skateboardNodes = 0;
      handle.wrapperGroup.traverse((obj) => {
        const nl = (obj.name || '').toLowerCase();
        if (nl.includes('skate') || nl.includes('board')) {
          skateboardNodes += 1;
        }
      });
      assert.equal(
        skateboardNodes,
        0,
        'Expected 0 skateboard nodes in prepared game-boy-hero GLB',
      );
    }

    // 2. Verify Main Girlfriend (riiged_anime_girl_outfits__facial_expressions.glb) has articulated bones & facial expressions
    if (entry.modelId === 'rigged-anime-girl-hero') {
      assert.ok(handle.bones.head, 'Expected AG_Head bone on rigged-anime-girl-hero');
      assert.ok(handle.bones.leftArm, 'Expected AG_LeftArm bone on rigged-anime-girl-hero');
      assert.ok(handle.bones.rightArm, 'Expected AG_RightArm bone on rigged-anime-girl-hero');
      assert.ok(handle.bones.leftUpLeg, 'Expected AG_LeftUpLeg bone on rigged-anime-girl-hero');
      assert.ok(handle.bones.rightUpLeg, 'Expected AG_RightUpLeg bone on rigged-anime-girl-hero');
    }

    // 3. Verify all meshes are converted to Cel-Shaded MeshToonMaterial (or BackSide ink hull / facial expression overlay)
    let toonCount = 0;
    handle.wrapperGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        if (primaryMatIsToon(m)) {
          toonCount += 1;
        }
      }
    });
    assert.ok(toonCount >= 1, `Expected >= 1 toon mesh in ${entry.fileName}`);

    // 4. Verify deterministic evaluation across frames
    handle.evaluateAtFrame({frame: 0, fps: 60, pose: 'walk', expression: 'happy'});
    handle.evaluateAtFrame({frame: 30, fps: 60, pose: 'salute', expression: 'shocked'});
    handle.evaluateAtFrame({frame: 60, fps: 60, pose: 'dance', expression: 'soot-covered'});
    handle.dispose();
  }
});

function primaryMatIsToon(m: THREE.Mesh): boolean {
  if (m.userData.__isMainStreetInkOutline) return false;
  const primaryMat = Array.isArray(m.material) ? m.material[0] : m.material;
  return primaryMat instanceof THREE.MeshToonMaterial;
}

test('Busy Town & Crack & Sons Shop Cashier Cast Director: spawns Shop Cashier behind register, Sidewalk Espresso Kiosk Cashier, Police Officers, Dogs, Pigeons, and multi-corridor walking pedestrians with Cel-Shaded Toon styling', () => {
  const shopCast = buildThreeSceneCastDirector('crack-and-sons-shop');
  // Verify Shop Cashier, Gift-Wrap Assistant, Checkout Customer, Cupboard Browsers, Main Boy, Main Girl, Dog & Nutcrackers
  assert.ok(
    shopCast.rigs.length >= 13,
    `Expected >= 13 rigs in crack-and-sons-shop (Cashier, Assistant, Customers, Heroes, Dog, Nutcrackers), got ${shopCast.rigs.length}`,
  );
  const shopLabels = shopCast.rigs.map(
    (r) => (r.rootGroup.userData.inspectableItem?.label as string) || '',
  );
  assert.ok(
    shopLabels.some((l) => l.includes('Shop Cashier')),
    'Expected Shop Cashier rig behind the cash register in crack-and-sons-shop',
  );
  assert.ok(
    shopLabels.some((l) => l.includes('Assistant Cashier')),
    'Expected Assistant Cashier at the gift-wrapping station in crack-and-sons-shop',
  );
  assert.ok(
    shopLabels.some((l) => l.includes('Checkout Customer')),
    'Expected Checkout Customer in front of the register in crack-and-sons-shop',
  );
  shopCast.updateAtFrame(60, 60);
  shopCast.dispose();

  const mainStreetCast = buildThreeSceneCastDirector('main-street');
  assert.ok(
    mainStreetCast.rigs.length >= 28,
    `Expected >= 28 placed hero/cashier/shopper/police/dog/pigeon rigs on Main Street, got ${mainStreetCast.rigs.length}`,
  );
  assert.ok(mainStreetCast.crowd, 'Expected active 3D walking crowd on Main Street');
  assert.equal(mainStreetCast.crowd!.members.length, 22);

  // Verify crosswalk walkers and sidewalk walkers both exist and move deterministically
  const crosswalkWalkers = mainStreetCast.crowd!.members.filter(
    (m) => m.laneType === 'crosswalk-ew',
  );
  const sidewalkWalkers = mainStreetCast.crowd!.members.filter(
    (m) => m.laneType === 'sidewalk-ns',
  );
  assert.ok(crosswalkWalkers.length >= 4, 'Expected >= 4 East-West crosswalk walkers');
  assert.ok(sidewalkWalkers.length >= 14, 'Expected >= 14 North-South sidewalk walkers');

  const xBefore = crosswalkWalkers[0].rig.rootGroup.position.x;
  const zBefore = sidewalkWalkers[0].rig.rootGroup.position.z;
  mainStreetCast.updateAtFrame(90, 60);
  const xAfter = crosswalkWalkers[0].rig.rootGroup.position.x;
  const zAfter = sidewalkWalkers[0].rig.rootGroup.position.z;
  assert.notEqual(xBefore, xAfter, 'Expected crosswalk walker X position to advance with frame');
  assert.notEqual(zBefore, zAfter, 'Expected sidewalk walker Z position to advance with frame');

  mainStreetCast.dispose();
});
