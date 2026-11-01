# OMNIFRAME 10-Character SVG Puppet Cast — Architecture, Usage Guide & Checklist

## Overview
All 10 cartoon character types are built as deterministic, layered SVG puppet rigs for Remotion + React + TypeScript. They share a single world color palette (`/lib/omniframe/characters/palette.ts`), a deterministic joint-pivot and pose-blending engine (`/lib/omniframe/characters/rig-utils.ts`), and an independent facial expression & automatic blinking system (`/components/omniframe/characters/FaceSystem.tsx`).

---

## Shared Props API (`CharacterRigProps`)

Every character component accepts the following props:

```tsx
import {
  MainBoyRig,
  MainGirlRig,
  HackerFriendRig,
  HypeManRig,
  SquadMemberARig,
  SquadMemberBRig,
  PedestrianRig,
  Crowd,
  NutcrackerDollRig,
  NutcrackerShopWindowRow,
  MaleDogRig,
  PigeonRig,
} from '@/components/omniframe/characters';

// Example 1: Main Boy walking while blending a point gesture, wearing sunglasses
<MainBoyRig
  pose="walk"
  secondaryPose="point"
  poseBlend={0.4}
  expression="determined"
  facing="right"
  scale={1}
  outfit="casual"
  sunglasses={true}
  seed="hero-boy-shot-1"
  startFrame={0}
  speed={1}
/>

// Example 2: Hype Man holding swappable countdown sign ("10" .. "1" or "BOOM!")
<HypeManRig
  pose="countdown-gestures"
  expression="excited"
  countdownValue="BOOM!"
  facing="left"
  scale={1}
/>

// Example 3: Spawn 12 deterministic unique background pedestrians with <Crowd />
<Crowd
  count={12}
  seed="main-street-crowd-shot-4"
  pose="hurry-away"
  baseScale={0.55}
/>
```

---

## Phase-by-Phase Implementation Checklist

| # | Character / System | Required Outfits & Parts | Required Expressions | Required Animations & Poses | Status |
|---|---|---|---|---|---|
| **Phase 1** | **Palette, Rig Utilities & Shared Face System** (`palette.ts`, `rig-utils.ts`, `FaceSystem.tsx`) | Shared `<defs>`, pivot transforms, pose blending, deterministic `random(seed)` | Eyes (`open`, `squint`, `wide`, pupil look, seeded blink), Brows, Mouths (`smile`, `frown`, `o-mouth`, `gritted-teeth`, `gulp`, `flat-line`, `jaw-drop`) | Automatic seeded blinking + subtle idle breathing on all rigs | **IMPLEMENTED** |
| **1 (Phase 2)** | **Main Boy** (`MainBoyRig.tsx`) | Casual varsity jacket, jeans, shoes, spiky hairstyle, **Sunglasses toggle** | `happy`, `nervous`, `terrified`, `determined`, `shocked`, `guilty` (6/6) | `walk`, `hand-holding-walk`, `sprint`, `point`, `salute`, `dance`, `freeze`, `mouth-drop` (8/8) | **IMPLEMENTED** |
| **2 (Phase 2)** | **Main Girl** (`MainGirlRig.tsx`) | Casual jacket, pleated skirt, boots, hairstyle, Christmas doll prop | `happy`, `confused`, `neutral`, `soot-covered` (blackened face & messy hair) (4/4) | `walk`, `point-at-shop`, `shrug`, `browse-shelves`, `walk-out-of-rubble`, `hand-holding`, `holding-christmas-doll` (7/7) | **IMPLEMENTED** |
| **3 (Phase 3)** | **Hacker Friend** (`HackerFriendRig.tsx`) | Distinctive oversized hoodie silhouette, snack bag, glowing smartphone | `unbothered`, `confused`, `deadpan` (3/3) | `eating`, `tapping-phone`, `shrugging`, `throwing-snack` (4/4) | **IMPLEMENTED** |
| **4 (Phase 3)** | **Hype Man** (`HypeManRig.tsx`) | Gold tracksuit, visor cap, swappable cardboard sign (`10`..`1` & `"BOOM!"`) | `excited`, `happy`, `shocked` | `countdown-gestures`, `jumping`, `cheering`, `dancing` (4/4) | **IMPLEMENTED** |
| **5 (Phase 3)** | **Squad Member A** (`SquadMemberARig.tsx`) | Tactical olive vest, cargo pants, beret | `happy`, `determined`, `excited` | `salute`, `point`, `cheer`, `high-five`, `dance` (5/5) | **IMPLEMENTED** |
| **6 (Phase 3)** | **Squad Member B** (`SquadMemberBRig.tsx`) | Visibly distinct purple puffer jacket, curly hair & pom-pom beanie | `happy`, `shocked`, `excited` | `salute`, `cheer`, `dance`, `shocked-reaction` (4/4) | **IMPLEMENTED** |
| **7 (Phase 4)** | **Pedestrian Archetypes & `<Crowd />`** (`PedestrianAndCrowdRigs.tsx`) | 3 Male Base Designs (`business-commuter`, `jogger-hoodie`, `elder-coat`), recolorable & scalable | `neutral`, `wince`, `terrified`, `shocked` | `walk`, `wince`, `cross-legs`, `hurry-away` (4/4) + `<Crowd />` seeded spawner | **IMPLEMENTED** |
| **8 (Phase 5)** | **Nutcracker Doll** (`NutcrackerAndAnimalsRigs.tsx`) | Hero ornate uniform + simplified `shop-window` variant (3-6 copies); separate `head`, `jaw`, `hat`, `body` | `stoic`, `shocked`, `terrified` | `head-rotation`, `eye-movement`, `gulp`, `trembling`, `detachable-head` (spring arc) (5/5) | **IMPLEMENTED** |
| **9 (Phase 6)** | **Male Dog** (`NutcrackerAndAnimalsRigs.tsx`) | Tawny coat, floppy ears, red collar & gold tag, articulated tail | `happy`, `startled`, `terrified` | `idle`, `tail-tuck`, `startled-expression`, `bolt-away-run` (4/4) | **IMPLEMENTED** |
| **10 (Phase 6)** | **Pigeon** (`NutcrackerAndAnimalsRigs.tsx`) | Slate plumage, iridescent neck, wings, beak & feet | `neutral`, `startled` | `perch`, `head-turn`, `wing-flap`, `takeoff` (4/4) | **IMPLEMENTED** |
