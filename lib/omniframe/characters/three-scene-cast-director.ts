import * as THREE from 'three';
import {
  buildThreeCharacterRig,
  buildThreeCrowdGroup,
  type ThreeCharacterRigHandle,
  type ThreeCrowdGroupHandle,
} from './three-character-rigs-builder';
import { applyMainStreetStyleToSceneGraph } from '../main-street-style-engine';

export type ThreeSceneCastContext =
  | 'main-street'
  | 'crack-and-sons-shop'
  | 'dark-room-bedroom'
  | 'garage-nuclear-launch';

export interface ThreeSceneCastDirectorHandle {
  rootGroup: THREE.Group;
  rigs: ThreeCharacterRigHandle[];
  crowd: ThreeCrowdGroupHandle | null;
  updateAtFrame: (frame: number, fps?: number, visible?: boolean) => void;
  dispose: () => void;
}

/**
 * Builds a Cel-Shaded Shopkeeper / Cashier Apron, Gold Bowtie & Name Badge overlay
 * that attaches to a 3D character rig and is styled with Main Street Toon + Ink Outlines.
 */
function attachCashierApronAndBadge(
  rig: ThreeCharacterRigHandle,
  options: {
    apronColorHex: string;
    trimColorHex: string;
  }
): void {
  const g = new THREE.Group();
  g.name = 'cashier-apron-and-badge';

  const apronMat = new THREE.MeshStandardMaterial({
    color: options.apronColorHex,
    roughness: 0.48,
    metalness: 0.06,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: options.trimColorHex,
    roughness: 0.3,
    metalness: 0.45,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: '#0F172A',
    roughness: 0.35,
    metalness: 0.1,
  });

  // Chest bib & lower waist apron
  const bibMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.32, 0.045),
    apronMat
  );
  bibMesh.position.set(0, 1.16, 0.16);
  const skirtApron = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.38, 0.05),
    apronMat
  );
  skirtApron.position.set(0, 0.82, 0.165);

  // Gold front pocket trim & name badge ("CASHIER")
  const pocketTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.035, 0.055),
    trimMat
  );
  pocketTrim.position.set(0, 0.92, 0.17);

  const badgePlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.095, 0.042, 0.055),
    trimMat
  );
  badgePlate.position.set(-0.075, 1.24, 0.175);

  // Classic shopkeeper bow-tie at collar
  const bowTie = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.042, 0.05),
    trimMat
  );
  bowTie.position.set(0, 1.36, 0.165);

  const strapL = new THREE.Mesh(
    new THREE.BoxGeometry(0.038, 0.22, 0.045),
    darkMat
  );
  strapL.position.set(-0.1, 1.32, 0.15);
  const strapR = strapL.clone();
  strapR.position.x = 0.1;

  g.add(bibMesh, skirtApron, pocketTrim, badgePlate, bowTie, strapL, strapR);
  applyMainStreetStyleToSceneGraph(g, { smoothOrganicCharacter: true });
  rig.rootGroup.add(g);
}

/**
 * Attaches a Cel-Shaded Shopping Bag or Coffee Cup prop to a customer/shopper rig.
 */
function attachShopperBagProp(
  rig: ThreeCharacterRigHandle,
  bagColorHex: string,
  side: 'left' | 'right' = 'right'
): void {
  const g = new THREE.Group();
  g.name = 'shopper-bag-prop';
  const signX = side === 'right' ? 1 : -1;

  const bagBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.3, 0.11),
    new THREE.MeshStandardMaterial({
      color: bagColorHex,
      roughness: 0.45,
      metalness: 0.05,
    })
  );
  bagBody.position.set(0, -0.15, 0);

  const goldRibbon = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.055, 0.12),
    new THREE.MeshStandardMaterial({
      color: '#FACC15',
      roughness: 0.3,
      metalness: 0.5,
    })
  );
  goldRibbon.position.set(0, -0.04, 0);

  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.4 })
  );
  g.add(bagBody, goldRibbon, handle);
  g.position.set(signX * 0.27, 0.88, 0.14);

  applyMainStreetStyleToSceneGraph(g, { smoothOrganicCharacter: true });
  rig.rootGroup.add(g);
}

/**
 * Builds the Cel-Shaded Checkout Counter Accessories (Contactless Card Reader,
 * Holiday Shopping Bag & Receipt Tray) on the Crack & Sons Shop Counter.
 */
function buildShopCounterCheckoutProps(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'shop-counter-checkout-props';

  const darkMat = new THREE.MeshStandardMaterial({
    color: '#1E293B',
    roughness: 0.35,
    metalness: 0.2,
  });
  const screenMat = new THREE.MeshBasicMaterial({ color: '#4ADE80' });
  const brassMat = new THREE.MeshStandardMaterial({
    color: '#FACC15',
    roughness: 0.28,
    metalness: 0.65,
  });
  const bagMat = new THREE.MeshStandardMaterial({
    color: '#DC2626',
    roughness: 0.45,
    metalness: 0.05,
  });

  // Card terminal next to cash register at x = -0.46, y = 1.03, z = -1.72
  const cardTerminal = new THREE.Group();
  cardTerminal.position.set(-0.46, 1.03, -1.72);
  const termStand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.05, 0.09, 12),
    brassMat
  );
  termStand.position.y = 0.045;
  const termBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.035, 0.16),
    darkMat
  );
  termBody.position.set(0, 0.1, 0.02);
  termBody.rotation.x = 0.42;
  const termScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.08, 0.075),
    screenMat
  );
  termScreen.position.set(0, 0.122, 0.01);
  termScreen.rotation.x = -Math.PI * 0.5 + 0.42;
  cardTerminal.add(termStand, termBody, termScreen);
  g.add(cardTerminal);

  // Ready-to-hand-over Crack & Sons Gift Bag on the counter at x = -0.05, y = 1.03, z = -1.75
  const counterBag = new THREE.Group();
  counterBag.position.set(-0.05, 1.03, -1.75);
  counterBag.rotation.y = 0.22;
  const bagMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.28, 0.12),
    bagMat
  );
  bagMesh.position.y = 0.14;
  const bagGoldBand = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.045, 0.13),
    brassMat
  );
  bagGoldBand.position.y = 0.24;
  counterBag.add(bagMesh, bagGoldBand);
  g.add(counterBag);

  applyMainStreetStyleToSceneGraph(g);
  return g;
}

/**
 * Builds a Cel-Shaded Street Espresso & Pastry Kiosk Cart on the East Sidewalk
 * outside Velvet Bean Café (`[10.35, 0.18, 2.2]`) for the Street Barista Cashier.
 */
function buildStreetEspressoKioskStall(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'street-espresso-kiosk-stall';
  g.position.set(10.25, 0.18, 2.2);
  g.rotation.y = -Math.PI * 0.5;

  const woodMat = new THREE.MeshStandardMaterial({
    color: '#6B4226',
    roughness: 0.55,
  });
  const emeraldMat = new THREE.MeshStandardMaterial({
    color: '#059669',
    roughness: 0.45,
  });
  const creamMat = new THREE.MeshStandardMaterial({
    color: '#FEF3C7',
    roughness: 0.45,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: '#FACC15',
    roughness: 0.28,
    metalness: 0.6,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: '#1E293B',
    roughness: 0.35,
  });

  // Cart body & oak counter top
  const cartBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.92, 0.68),
    emeraldMat
  );
  cartBody.position.set(0, 0.48, 0);
  const cartTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.56, 0.07, 0.78),
    woodMat
  );
  cartTop.position.set(0, 0.96, 0);
  g.add(cartBody, cartTop);

  // Brass espresso machine + cash register on cart counter
  const espressoMachine = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.34, 0.32),
    brassMat
  );
  espressoMachine.position.set(-0.35, 1.16, -0.05);
  const miniRegister = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.24, 0.26),
    darkMat
  );
  miniRegister.position.set(0.38, 1.11, 0.04);
  g.add(espressoMachine, miniRegister);

  // Canopy posts & striped awning roof
  for (const sx of [-0.66, 0.66]) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 1.25, 10),
      brassMat
    );
    post.position.set(sx, 1.58, -0.24);
    g.add(post);
  }
  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.09, 0.92),
      i % 2 === 0 ? emeraldMat : creamMat
    );
    stripe.position.set(-0.64 + i * 0.32, 2.22, 0);
    stripe.rotation.x = 0.18;
    g.add(stripe);
  }

  g.userData.inspectableItem = {
    id: 'street-kiosk-espresso-cart',
    label: 'Sidewalk Espresso & Pastry Kiosk Cart (with Street Cashier & Register)',
    category: 'Busy Town Street Kiosk & Cashier',
    target: [10.25, 1.25, 2.2] as [number, number, number],
    optimalDistance: 3.4,
  };

  applyMainStreetStyleToSceneGraph(g);
  return g;
}

/**
 * Builds and places the 3D Three.js Character Cast, Cashiers, Shoppers, Dogs, Pigeons,
 * and Busy Town Walking Crowds directly inside each of the 4 interconnected 3D scenes!
 */
export function buildThreeSceneCastDirector(
  sceneContext: ThreeSceneCastContext
): ThreeSceneCastDirectorHandle {
  const rootGroup = new THREE.Group();
  rootGroup.name = `three-scene-cast-${sceneContext}`;

  const rigs: ThreeCharacterRigHandle[] = [];
  const baseRotationsY: number[] = [];
  const dynamicPatrolPaths: Array<{
    rigIndex: number;
    basePos: [number, number, number];
    axis: 'x' | 'z';
    amplitude: number;
    speedRadPerSec: number;
    phaseOffset: number;
  }> = [];

  let crowd: ThreeCrowdGroupHandle | null = null;

  const placeRig = (
    rig: ThreeCharacterRigHandle,
    pos: [number, number, number],
    rotY: number,
    label: string,
    patrol?: {
      axis: 'x' | 'z';
      amplitude: number;
      speedRadPerSec: number;
      phaseOffset?: number;
    }
  ) => {
    const idx = rigs.length;
    rig.rootGroup.position.set(pos[0], pos[1], pos[2]);
    rig.rootGroup.rotation.y = rotY;
    rig.rootGroup.userData.inspectableItem = {
      id: `char3d-${sceneContext}-${rig.characterId}-${idx}`,
      label,
      category: '3D Character Cast (Cel-Shaded GLB Rig)',
      target: [pos[0], pos[1] + 0.9, pos[2]] as [number, number, number],
      optimalDistance: 3.2,
    };
    rootGroup.add(rig.rootGroup);
    rigs.push(rig);
    baseRotationsY.push(rotY);

    if (patrol) {
      dynamicPatrolPaths.push({
        rigIndex: idx,
        basePos: pos,
        axis: patrol.axis,
        amplitude: patrol.amplitude,
        speedRadPerSec: patrol.speedRadPerSec,
        phaseOffset: patrol.phaseOffset ?? 0,
      });
    }
  };

  if (sceneContext === 'main-street') {
    // =========================================================================
    // A. HEROES & MAIN CHARACTERS ON CENTRAL AVENUE
    // =========================================================================
    // 1. Main Boy (free_stylized_cartoon_game_boy_character_rigged.glb — skateboard removed)
    placeRig(
      buildThreeCharacterRig({
        characterId: 'main-boy',
        pose: 'hand-holding-walk',
        secondaryPose: 'point',
        poseBlend: 0.35,
        expression: 'happy',
        scale: 1.18,
        seed: 'ms-main-boy',
      }),
      [-8.55, 0.18, -2.4],
      0.35,
      '1. Main Boy (3D Hero GLB Rig — Skateboard Removed, Walking with Girlfriend)'
    );

    // 2. Main Girlfriend (riiged_anime_girl_outfits__facial_expressions.glb)
    placeRig(
      buildThreeCharacterRig({
        characterId: 'main-girl',
        pose: 'point-at-shop',
        expression: 'happy',
        scale: 1.15,
        seed: 'ms-main-girl',
      }),
      [-7.75, 0.18, -2.1],
      -0.25,
      '2. Main Girlfriend (3D Rigged Anime Girl GLB — Pointing at Crack & Sons)'
    );

    // 3. Male Dog #1 (dog.glb) beside Main Boy & Girlfriend
    placeRig(
      buildThreeCharacterRig({
        characterId: 'male-dog',
        pose: 'idle',
        expression: 'happy',
        scale: 1.12,
        seed: 'ms-male-dog',
      }),
      [-6.95, 0.18, -1.8],
      -0.35,
      '9. Male Dog #1 (3D Rigged Dog GLB — Happy Tail Wag beside Heroes)'
    );

    // =========================================================================
    // B. CRACK & SONS STOREFRONT CASHIER / GREETER & WINDOW DISPLAY
    // =========================================================================
    const storefrontCashier = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'elder-coat',
      pose: 'salute',
      secondaryPose: 'point',
      poseBlend: 0.4,
      expression: 'happy',
      scale: 1.14,
      seed: 'ms-crack-sons-door-cashier',
      glbModelIdOverride: 'idle-male-loop',
      topColorOverride: {
        base: '#991B1B',
        shadow: '#7F1D1D',
        highlight: '#DC2626',
      },
    });
    attachCashierApronAndBadge(storefrontCashier, {
      apronColorHex: '#7F1D1D',
      trimColorHex: '#FACC15',
    });
    placeRig(
      storefrontCashier,
      [-10.45, 0.2, -3.15],
      Math.PI * 0.42,
      'Crack & Sons Shopkeeper / Cashier (Welcoming Customers at Storefront Door)'
    );

    // Exiting Crack & Sons Customer carrying Holiday Gift Bag
    const exitingShopCustomer = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'casual-shopper',
      pose: 'walk',
      expression: 'happy',
      scale: 1.1,
      seed: 'ms-exiting-shop-customer',
      glbModelIdOverride: 'basic-walk-female-loop',
      topColorOverride: {
        base: '#2563EB',
        shadow: '#1D4ED8',
        highlight: '#60A5FA',
      },
    });
    attachShopperBagProp(exitingShopCustomer, '#DC2626', 'right');
    placeRig(
      exitingShopCustomer,
      [-9.35, 0.18, -3.65],
      0.32,
      'Crack & Sons Customer (Walking Out with Holiday Nutcracker Gift Bag)'
    );

    // 4 Shop-Window 3D Nutcracker Dolls inside Crack & Sons Storefront Window
    for (let i = 0; i < 4; i++) {
      placeRig(
        buildThreeCharacterRig({
          characterId: 'nutcracker-doll',
          nutcrackerVariant: 'shop-window',
          pose: i % 2 === 0 ? 'head-rotation' : 'eye-movement',
          scale: 0.85,
          seed: `ms-window-nutcracker-${i}`,
          startFrame: i * 10,
        }),
        [-11.85, 0.55, -9.2 + i * 0.85],
        Math.PI * 0.5,
        `8. Shop-Window 3D Nutcracker Copy #${i + 1}`
      );
    }

    // 3. Hacker Friend visible inside the 2nd-floor Dark Room Bedroom window
    placeRig(
      buildThreeCharacterRig({
        characterId: 'hacker-friend',
        pose: 'tapping-phone',
        expression: 'unbothered',
        scale: 1.05,
        seed: 'ms-window-hacker',
      }),
      [-12.5, 4.22, 0.0],
      Math.PI * 0.5,
      '3. Hacker Friend (3D GLB Rig inside 2nd-Floor Bedroom Window)'
    );

    // 4. Hype Man, 5. Squad Member A & 6. Squad Member B on East sidewalk
    placeRig(
      buildThreeCharacterRig({
        characterId: 'hype-man',
        pose: 'countdown-gestures',
        expression: 'excited',
        scale: 1.18,
        seed: 'ms-hype-man',
      }),
      [8.35, 0.18, -5.8],
      -0.35,
      '4. Hype Man (3D GLB Rig with Swappable 10..1 BOOM! Sign)'
    );

    placeRig(
      buildThreeCharacterRig({
        characterId: 'squad-member-a',
        pose: 'salute',
        expression: 'determined',
        scale: 1.15,
        seed: 'ms-squad-a',
      }),
      [7.55, 0.18, -5.5],
      -0.3,
      '5. Squad Member A (3D GLB Rig — Salute)'
    );

    placeRig(
      buildThreeCharacterRig({
        characterId: 'squad-member-b',
        pose: 'dance',
        expression: 'happy',
        scale: 1.15,
        seed: 'ms-squad-b',
      }),
      [9.15, 0.18, -5.4],
      -0.4,
      '6. Squad Member B (3D GLB Rig — Dance)'
    );

    // =========================================================================
    // C. SIDEWALK ESPRESSO KIOSK CASHIER & CUSTOMERS (Outside Velvet Bean Café)
    // =========================================================================
    const espressoKiosk = buildStreetEspressoKioskStall();
    rootGroup.add(espressoKiosk);

    const kioskBaristaCashier = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'casual-shopper',
      pose: 'point',
      secondaryPose: 'cheer',
      poseBlend: 0.35,
      expression: 'happy',
      scale: 1.12,
      seed: 'ms-kiosk-barista-cashier',
      glbModelIdOverride: 'casual-male-tpose',
      topColorOverride: {
        base: '#065F46',
        shadow: '#064E3B',
        highlight: '#10B981',
      },
    });
    attachCashierApronAndBadge(kioskBaristaCashier, {
      apronColorHex: '#047857',
      trimColorHex: '#FACC15',
    });
    placeRig(
      kioskBaristaCashier,
      [10.82, 0.18, 2.2],
      -Math.PI * 0.5,
      'Velvet Bean Sidewalk Kiosk Cashier / Barista (Serving Espresso & Operating Register)'
    );

    const cafeCustomer1 = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'business-commuter',
      pose: 'point',
      expression: 'happy',
      scale: 1.1,
      seed: 'ms-cafe-customer-1',
      glbModelIdOverride: 'nathan-walking-man',
    });
    attachShopperBagProp(cafeCustomer1, '#059669', 'left');
    placeRig(
      cafeCustomer1,
      [9.42, 0.18, 1.85],
      Math.PI * 0.45,
      'Café Kiosk Customer #1 (Ordering Espresso at Sidewalk Cashier Counter)'
    );

    const cafeCustomer2 = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'casual-shopper',
      pose: 'hand-holding-walk',
      expression: 'happy',
      scale: 1.08,
      seed: 'ms-cafe-customer-2',
      glbModelIdOverride: 'basic-walk-female-loop',
    });
    placeRig(
      cafeCustomer2,
      [9.45, 0.18, 2.62],
      Math.PI * 0.38,
      'Café Kiosk Customer #2 (Waiting in Line at Sidewalk Cashier Counter)'
    );

    // =========================================================================
    // D. TRAFFIC POLICE OFFICERS, WINDOW-SHOPPERS & TOWN RESIDENTS
    // =========================================================================
    // Traffic Police Officer #1 at North Crosswalk
    placeRig(
      buildThreeCharacterRig({
        characterId: 'pedestrian',
        archetype: 'jogger-hoodie',
        pose: 'salute',
        secondaryPose: 'point',
        poseBlend: 0.45,
        expression: 'determined',
        scale: 1.16,
        seed: 'ms-police-north',
        glbModelIdOverride: 'police-man-rigged',
      }),
      [-7.55, 0.18, -9.85],
      0.28,
      'Town Police Officer #1 (police_man_rigged.glb — Directing North Crosswalk Traffic)'
    );

    // Traffic Police Officer #2 patrolling East Sidewalk near South Crosswalk
    placeRig(
      buildThreeCharacterRig({
        characterId: 'pedestrian',
        archetype: 'jogger-hoodie',
        pose: 'walk',
        expression: 'determined',
        scale: 1.15,
        seed: 'ms-police-south',
        glbModelIdOverride: 'police-man-rigged',
      }),
      [7.65, 0.18, 9.65],
      Math.PI,
      'Town Police Officer #2 (police_man_rigged.glb — Patrolling South Intersection)',
      {
        axis: 'z',
        amplitude: 2.2,
        speedRadPerSec: 1.1,
        phaseOffset: 0.5,
      }
    );

    // Window-Shoppers at Le Petit Tailor (West North Z = -13.2)
    const tailorShopperA = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'business-commuter',
      pose: 'point-at-shop',
      expression: 'happy',
      scale: 1.12,
      seed: 'ms-tailor-shopper-a',
      glbModelIdOverride: 'low-poly-man',
      topColorOverride: {
        base: '#1E40AF',
        shadow: '#1E3A8A',
        highlight: '#3B82F6',
      },
    });
    attachShopperBagProp(tailorShopperA, '#0284C7', 'right');
    placeRig(
      tailorShopperA,
      [-9.85, 0.18, -13.4],
      -Math.PI * 0.45,
      'Window-Shopper at Le Petit Tailor (Admiring Bespoke Suits)'
    );

    // Window-Shopper at Arcade Hardware (West South Z = +13.2)
    const hardwareShopper = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'elder-coat',
      pose: 'point',
      expression: 'excited',
      scale: 1.12,
      seed: 'ms-hardware-shopper',
      glbModelIdOverride: 'casual-male-tpose',
      topColorOverride: {
        base: '#D97706',
        shadow: '#B45309',
        highlight: '#FBBF24',
      },
    });
    placeRig(
      hardwareShopper,
      [-9.85, 0.18, 13.2],
      -Math.PI * 0.48,
      'Customer at Arcade Hardware (Inspecting Window Display)'
    );

    // Bookshop Patrons chatting outside Starlight Books (East North Z = -13.2)
    const bookShopperA = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'casual-shopper',
      pose: 'point',
      expression: 'happy',
      scale: 1.1,
      seed: 'ms-book-shopper-a',
      glbModelIdOverride: 'basic-walk-female-loop',
      topColorOverride: {
        base: '#7C3AED',
        shadow: '#5B21B6',
        highlight: '#A78BFA',
      },
    });
    attachShopperBagProp(bookShopperA, '#7C3AED', 'left');
    placeRig(
      bookShopperA,
      [9.75, 0.18, -13.1],
      Math.PI * 0.45,
      'Book Lover #1 outside Starlight Books (Holding Comic Book Bag)'
    );

    const bookShopperB = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'business-commuter',
      pose: 'shrug',
      expression: 'happy',
      scale: 1.12,
      seed: 'ms-book-shopper-b',
      glbModelIdOverride: 'idle-male-loop',
    });
    placeRig(
      bookShopperB,
      [9.25, 0.18, -12.3],
      -2.6,
      'Book Lover #2 Chatting outside Starlight Books'
    );

    // Pastry Shopper & Dog Walker outside Sakura Patisserie (East South Z = +13.2)
    const patisserieShopper = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'casual-shopper',
      pose: 'walk',
      expression: 'happy',
      scale: 1.11,
      seed: 'ms-patisserie-walker',
      glbModelIdOverride: 'basic-walk-female-loop',
      topColorOverride: {
        base: '#DB2777',
        shadow: '#9D174D',
        highlight: '#F472B6',
      },
    });
    attachShopperBagProp(patisserieShopper, '#EC4899', 'right');
    placeRig(
      patisserieShopper,
      [8.85, 0.18, 8.2],
      0.0,
      'Dog-Walking Town Resident on East Sidewalk',
      {
        axis: 'z',
        amplitude: 4.5,
        speedRadPerSec: 0.85,
        phaseOffset: 0.0,
      }
    );

    // =========================================================================
    // E. ADDITIONAL TOWN DOGS (`dog.glb`) & FLOCK OF PIGEONS (`pigeon.glb`)
    // =========================================================================
    // Male Dog #2 walking alongside Dog-Walker on East Sidewalk
    placeRig(
      buildThreeCharacterRig({
        characterId: 'male-dog',
        pose: 'bolt-away-run',
        expression: 'happy',
        scale: 1.08,
        seed: 'ms-male-dog-2',
      }),
      [8.25, 0.18, 8.5],
      0.0,
      '9. Male Dog #2 (dog.glb — Walking Alongside Owner on East Sidewalk)',
      {
        axis: 'z',
        amplitude: 4.5,
        speedRadPerSec: 0.85,
        phaseOffset: 0.0,
      }
    );

    // Male Dog #3 sitting excitedly outside Sakura Patisserie
    placeRig(
      buildThreeCharacterRig({
        characterId: 'male-dog',
        pose: 'idle',
        expression: 'happy',
        scale: 1.05,
        seed: 'ms-male-dog-3',
      }),
      [9.65, 0.18, 13.6],
      Math.PI * 0.45,
      '9. Male Dog #3 (dog.glb — Waiting for Pastry Treats outside Sakura Patisserie)'
    );

    // Flock of 8 Pigeons (`pigeon.glb` / `peigon.glb`) across Sidewalks, Benches & Awnings
    const pigeonPlacements: Array<{
      pos: [number, number, number];
      rotY: number;
      pose: 'perch' | 'head-turn' | 'wing-flap' | 'takeoff';
      scale: number;
      label: string;
    }> = [
      {
        pos: [-7.6, 0.18, -3.6],
        rotY: 0.4,
        pose: 'perch',
        scale: 1.15,
        label: '10. Pigeon #1 (pigeon.glb — Pecking on West Sidewalk)',
      },
      {
        pos: [-7.95, 0.18, -3.2],
        rotY: -0.6,
        pose: 'head-turn',
        scale: 1.1,
        label: '10. Pigeon #2 (pigeon.glb — Head Turn on West Sidewalk)',
      },
      {
        pos: [7.4, 0.65, -3.8],
        rotY: -0.5,
        pose: 'wing-flap',
        scale: 1.2,
        label: '10. Pigeon #3 (pigeon.glb — Wing Flap on East Curb)',
      },
      {
        pos: [8.1, 0.18, 3.4],
        rotY: 1.1,
        pose: 'perch',
        scale: 1.12,
        label: '10. Pigeon #4 (pigeon.glb — Gathering Crumbs near Espresso Kiosk)',
      },
      {
        pos: [8.45, 0.18, 3.7],
        rotY: -1.2,
        pose: 'head-turn',
        scale: 1.08,
        label: '10. Pigeon #5 (pigeon.glb — Sidewalk Flock Companion)',
      },
      {
        pos: [-8.2, 0.92, 6.4],
        rotY: 0.8,
        pose: 'perch',
        scale: 1.15,
        label: '10. Pigeon #6 (pigeon.glb — Perched on West Park Bench Backrest)',
      },
      {
        pos: [0.0, 1.85, -11.25],
        rotY: 0.2,
        pose: 'takeoff',
        scale: 1.22,
        label: '10. Pigeon #7 (pigeon.glb — Flying Across North Crosswalk)',
      },
      {
        pos: [-10.4, 4.15, 0.8],
        rotY: Math.PI * 0.5,
        pose: 'wing-flap',
        scale: 1.18,
        label: '10. Pigeon #8 (pigeon.glb — Perched on Crack & Sons Striped Awning)',
      },
    ];

    pigeonPlacements.forEach((p, idx) => {
      placeRig(
        buildThreeCharacterRig({
          characterId: 'pigeon',
          pose: p.pose,
          scale: p.scale,
          seed: `ms-pigeon-${idx + 1}`,
          startFrame: idx * 9,
        }),
        p.pos,
        p.rotY,
        p.label
      );
    });

    // =========================================================================
    // F. BUSY TOWN WALKING PEDESTRIANS (Sidewalks + Zebra Crosswalks + Outer Blocks)
    // =========================================================================
    // 22 Active Pedestrians walking along West & East Central Avenue sidewalks AND crossing North/South crosswalks
    crowd = buildThreeCrowdGroup({
      count: 22,
      seed: 'main-street-3d-crowd',
      pose: 'walk',
      baseScale: 1.06,
      zSpan: 40,
      sidewalkXPositions: [-9.25, 9.25],
      includeCrosswalkWalkers: true,
    });
    rootGroup.add(crowd.rootGroup);
  } else if (sceneContext === 'crack-and-sons-shop') {
    // =========================================================================
    // CRACK & SONS SHOP INTERIOR — THE CASHIER, GIFT-WRAP ASSISTANT & CUSTOMERS
    // =========================================================================
    // Add Cel-Shaded Checkout Counter Props (Card Reader Terminal & Gift Bag)
    rootGroup.add(buildShopCounterCheckoutProps());

    // 1. THE SHOP CASHIER (`Mr. Crack — Head Cashier behind Register Counter`)
    // Counter is at z = -1.85 (depth 0.86m: z = -2.28 to -1.42), Cash Register is at x = -0.82, y = 1.03, z = -1.80.
    // Standing at [-0.76, 0.14, -2.35] facing +Z (rotY = 0.08) places the Cashier prominently behind the register!
    const shopCashierRig = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'shop-cashier',
      pose: 'point',
      secondaryPose: 'salute',
      poseBlend: 0.42,
      expression: 'happy',
      scale: 1.2,
      seed: 'shop-head-cashier-rig',
      glbModelIdOverride: 'idle-male-loop',
      topColorOverride: {
        base: '#991B1B',
        shadow: '#7F1D1D',
        highlight: '#EF4444',
      },
      bottomColorOverride: {
        base: '#1E293B',
        shadow: '#0F172A',
        highlight: '#334155',
      },
    });
    attachCashierApronAndBadge(shopCashierRig, {
      apronColorHex: '#7F1D1D',
      trimColorHex: '#FACC15',
    });
    placeRig(
      shopCashierRig,
      [-0.76, 0.14, -2.35],
      0.08,
      'Shop Cashier — Mr. Crack (3D GLB Rig in Burgundy & Gold Apron Operating Brass Cash Register)'
    );

    // 2. GIFT-WRAPPING STATION ASSISTANT CASHIER (Behind Right Side of Counter at x = +0.88, z = -2.35)
    const giftWrapAssistantRig = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'casual-shopper',
      pose: 'hand-holding-walk',
      secondaryPose: 'point',
      poseBlend: 0.5,
      expression: 'happy',
      scale: 1.16,
      seed: 'shop-gift-wrap-assistant',
      glbModelIdOverride: 'basic-walk-female-loop',
      topColorOverride: {
        base: '#065F46',
        shadow: '#064E3B',
        highlight: '#10B981',
      },
    });
    attachCashierApronAndBadge(giftWrapAssistantRig, {
      apronColorHex: '#047857',
      trimColorHex: '#FDE047',
    });
    placeRig(
      giftWrapAssistantRig,
      [0.88, 0.14, -2.35],
      -0.12,
      'Shop Assistant Cashier (3D GLB Rig at Gift-Wrapping Rolls & Ribbon Spools Station)'
    );

    // 3. CHECKOUT COUNTER CUSTOMER (Paying at the Register to the left of the Cashier for unobstructed camera line of sight)
    const counterCustomerRig = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'business-commuter',
      pose: 'point',
      expression: 'happy',
      scale: 0.98,
      seed: 'shop-counter-customer',
      glbModelIdOverride: 'nathan-walking-man',
      topColorOverride: {
        base: '#1E40AF',
        shadow: '#1E3A8A',
        highlight: '#3B82F6',
      },
    });
    attachShopperBagProp(counterCustomerRig, '#DC2626', 'right');
    placeRig(
      counterCustomerRig,
      [-1.38, 0.02, -1.12],
      Math.PI - 0.42,
      'Checkout Customer (3D GLB Rig Paying Cashier at Register with Holiday Gift Bag)'
    );

    // 4. Main Boy jaw-drop reaction & 5. Main Girl holding Christmas doll in center shop aisle on the Victorian rug
    placeRig(
      buildThreeCharacterRig({
        characterId: 'main-boy',
        pose: 'mouth-drop',
        expression: 'shocked',
        scale: 0.98,
        seed: 'shop-3d-boy',
      }),
      [-1.08, 0.02, 0.32],
      0.32,
      '1. Main Boy (3D GLB Rig — Mouth-Drop Jaw Hits Floor)'
    );

    placeRig(
      buildThreeCharacterRig({
        characterId: 'main-girl',
        pose: 'holding-christmas-doll',
        expression: 'happy',
        scale: 0.96,
        seed: 'shop-3d-girl',
      }),
      [1.08, 0.02, 0.32],
      -0.32,
      '2. Main Girlfriend (3D Rigged Anime Girl GLB — Holding Christmas Nutcracker Doll)'
    );

    // 6. West Cupboard Browser Customer (Inspecting Bavarian King Nutcrackers)
    const westBrowserRig = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'casual-shopper',
      pose: 'point-at-shop',
      expression: 'excited',
      scale: 1.12,
      seed: 'shop-west-browser',
      glbModelIdOverride: 'casual-male-tpose',
      topColorOverride: {
        base: '#B45309',
        shadow: '#78350F',
        highlight: '#F59E0B',
      },
    });
    placeRig(
      westBrowserRig,
      [-2.55, 0.02, -0.15],
      -Math.PI * 0.42,
      'Shop Customer #2 (Browsing West Carved Walnut Nutcracker Cupboard)'
    );

    // 7. East Cupboard Browser Customer (Inspecting Ornaments & Gift Boxes)
    const eastBrowserRig = buildThreeCharacterRig({
      characterId: 'pedestrian',
      archetype: 'elder-coat',
      pose: 'point',
      expression: 'happy',
      scale: 1.11,
      seed: 'shop-east-browser',
      glbModelIdOverride: 'anime-girl-hero',
      topColorOverride: {
        base: '#7C3AED',
        shadow: '#5B21B6',
        highlight: '#A78BFA',
      },
    });
    attachShopperBagProp(eastBrowserRig, '#059669', 'left');
    placeRig(
      eastBrowserRig,
      [2.55, 0.02, 0.65],
      Math.PI * 0.38,
      'Shop Customer #3 (Browsing East Holiday Ornaments & Wrapped Presents)'
    );

    // 8. Loyal Male Dog (`dog.glb`) sitting happily near the Shop Entrance Door
    placeRig(
      buildThreeCharacterRig({
        characterId: 'male-dog',
        pose: 'idle',
        expression: 'happy',
        scale: 1.06,
        seed: 'shop-entrance-dog',
      }),
      [1.35, 0.02, 2.35],
      -0.35,
      '9. Male Dog (dog.glb — Waiting by Rigged Shop Entrance Door)'
    );

    // 9. Hero 3D Nutcracker Doll on wooden counter with detachable head spring arc
    placeRig(
      buildThreeCharacterRig({
        characterId: 'nutcracker-doll',
        nutcrackerVariant: 'hero',
        pose: 'detachable-head',
        expression: 'shocked',
        scale: 0.92,
        seed: 'shop-3d-hero-nutcracker',
      }),
      [0.35, 1.06, -1.65],
      0.0,
      '8. Hero 3D Nutcracker Doll (Detachable Head Spring Arc)'
    );

    // 4 Shop-Window 3D Nutcracker copies near front window
    for (let i = 0; i < 4; i++) {
      placeRig(
        buildThreeCharacterRig({
          characterId: 'nutcracker-doll',
          nutcrackerVariant: 'shop-window',
          pose: i % 2 === 0 ? 'head-rotation' : 'trembling',
          scale: 0.78,
          seed: `shop-3d-copy-nutcracker-${i}`,
          startFrame: i * 8,
        }),
        [-2.35 + i * 0.48, 0.02, 2.75],
        0.15,
        `8. Shop-Window 3D Nutcracker Copy #${i + 1}`
      );
    }
  } else if (sceneContext === 'dark-room-bedroom') {
    // 3. Hacker Friend eating snacks & tapping glowing OLED phone
    placeRig(
      buildThreeCharacterRig({
        characterId: 'hacker-friend',
        pose: 'tapping-phone',
        expression: 'unbothered',
        scale: 1.16,
        seed: 'bedroom-3d-hacker',
      }),
      [-0.55, 0.02, 0.75],
      0.3,
      '3. Hacker Friend (3D Hoodie GLB Rig — Tapping OLED Phone & Snack Bag)'
    );

    // 1. Main Boy pointing at News TV
    placeRig(
      buildThreeCharacterRig({
        characterId: 'main-boy',
        pose: 'point',
        expression: 'determined',
        scale: 1.16,
        seed: 'bedroom-3d-boy',
      }),
      [0.65, 0.02, 0.85],
      -0.3,
      '1. Main Boy (3D GLB Rig — Pointing at News TV)'
    );

    // 10. 3D Pigeon perched on exterior window sill outside transparent window
    placeRig(
      buildThreeCharacterRig({
        characterId: 'pigeon',
        pose: 'head-turn',
        scale: 1.15,
        seed: 'bedroom-3d-pigeon',
      }),
      [-1.75, 1.18, -2.75],
      0.2,
      '10. Pigeon (pigeon.glb Perched Outside Transparent Bedroom Window)'
    );
  } else if (sceneContext === 'garage-nuclear-launch') {
    // Left flank of sub-floor nuclear silo: Hype Man + Squad A + Squad B
    placeRig(
      buildThreeCharacterRig({
        characterId: 'hype-man',
        pose: 'countdown-gestures',
        expression: 'excited',
        scale: 1.18,
        seed: 'garage-3d-hypeman',
      }),
      [-1.35, 0.02, 1.55],
      0.28,
      '4. Hype Man (3D GLB Rig — 10..1 BOOM! Countdown Sign)'
    );

    placeRig(
      buildThreeCharacterRig({
        characterId: 'squad-member-a',
        pose: 'salute',
        expression: 'determined',
        scale: 1.15,
        seed: 'garage-3d-squad-a',
      }),
      [-2.15, 0.02, 1.85],
      0.35,
      '5. Squad Member A (3D GLB Rig — Launch Salute)'
    );

    placeRig(
      buildThreeCharacterRig({
        characterId: 'squad-member-b',
        pose: 'shocked-reaction',
        expression: 'shocked',
        scale: 1.15,
        seed: 'garage-3d-squad-b',
      }),
      [-2.85, 0.02, 2.05],
      0.42,
      '6. Squad Member B (3D GLB Rig — Shocked Reaction)'
    );

    // Right flank of sub-floor nuclear silo: Main Boy (with Sunglasses) + Startled Dog + Hurrying Pedestrian
    placeRig(
      buildThreeCharacterRig({
        characterId: 'main-boy',
        pose: 'salute',
        expression: 'determined',
        sunglasses: true,
        scale: 1.18,
        seed: 'garage-3d-boy',
      }),
      [1.35, 0.02, 1.55],
      -0.28,
      '1. Main Boy (3D GLB Rig with Sunglasses — Launch Salute)'
    );

    placeRig(
      buildThreeCharacterRig({
        characterId: 'male-dog',
        pose: 'startled-expression',
        scale: 1.15,
        seed: 'garage-3d-dog',
      }),
      [2.15, 0.02, 1.85],
      -0.35,
      '9. Male Dog (dog.glb — Startled Mid-Air Jump)'
    );

    placeRig(
      buildThreeCharacterRig({
        characterId: 'pedestrian',
        archetype: 'business-commuter',
        pose: 'hurry-away',
        expression: 'terrified',
        scale: 1.15,
        seed: 'garage-3d-pedestrian',
      }),
      [2.85, 0.02, 2.05],
      -0.42,
      '7. Pedestrian Business Commuter (3D GLB Rig — Hurrying Away)'
    );
  }

  const updateAtFrame = (frame: number, fps = 60, visible = true) => {
    rootGroup.visible = visible;
    if (!visible) return;

    const timeSec = frame / Math.max(1, fps);

    for (let i = 0; i < rigs.length; i++) {
      const rig = rigs[i];
      rig.updateAtFrame({ frame, fps });
      rig.rootGroup.rotation.y = baseRotationsY[i];
    }

    // Evaluate deterministic back-and-forth sidewalk patrol paths (Police Officer #2, Dog-Walker + Dog #2)
    for (const pat of dynamicPatrolPaths) {
      const rig = rigs[pat.rigIndex];
      if (!rig) continue;
      const phase = timeSec * pat.speedRadPerSec + pat.phaseOffset;
      const offset = Math.sin(phase) * pat.amplitude;
      const vel = Math.cos(phase);
      if (pat.axis === 'z') {
        rig.rootGroup.position.set(
          pat.basePos[0],
          pat.basePos[1],
          pat.basePos[2] + offset
        );
        rig.rootGroup.rotation.y = vel >= 0 ? 0 : Math.PI;
      } else {
        rig.rootGroup.position.set(
          pat.basePos[0] + offset,
          pat.basePos[1],
          pat.basePos[2]
        );
        rig.rootGroup.rotation.y = vel >= 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
      }
    }

    if (crowd) {
      crowd.updateAtFrame(frame, fps);
    }
  };

  updateAtFrame(0);

  return {
    rootGroup,
    rigs,
    crowd,
    updateAtFrame,
    dispose: () => {
      for (const r of rigs) r.dispose();
      if (crowd) crowd.dispose();
    },
  };
}
