'use client';

import { memo } from 'react';

export type SceneCharacterStageContext =
  | 'main-street'
  | 'crack-and-sons-shop'
  | 'dark-room-bedroom'
  | 'garage-nuclear-launch';

/**
 * All 10 characters are now rendered as real 3D Three.js articulated character rigs
 * directly inside the WebGL scene graph via `buildThreeSceneCastDirector(sceneContext)`!
 * This overlay returns null so no flat 2D SVG sprites cover the 3D scenes.
 */
export const SceneCharacterStageOverlay = memo(function SceneCharacterStageOverlay(_props: {
  sceneContext: SceneCharacterStageContext;
  visible?: boolean;
}) {
  return null;
});
