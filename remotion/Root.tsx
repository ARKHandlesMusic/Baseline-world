import React from 'react';
import {Composition, Folder} from 'remotion';
import {
  MainStreetAssetComposition,
  mainStreetCompositionSchema,
} from './MainStreetAssetComposition';
import {
  CrackAndSonsInteriorComposition,
  crackAndSonsInteriorSchema,
} from './CrackAndSonsInteriorComposition';
import {
  DarkRoomBedroomComposition,
  darkRoomBedroomSchema,
} from './DarkRoomBedroomComposition';
import {
  GarageNuclearLaunchComposition,
  garageNuclearLaunchSchema,
} from './GarageNuclearLaunchComposition';
import {
  CharacterCastShowcaseComposition,
  characterCastShowcaseSchema,
} from './CharacterCastShowcaseComposition';
import {MAIN_STREET_SECTION_1_MANIFEST} from '../lib/omniframe/asset-manifest';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="00-Character-Cast-And-Rig-Showcase-4K60">
        <Composition
          id="CharacterCastShowcase"
          component={CharacterCastShowcaseComposition}
          schema={characterCastShowcaseSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            initialViewMode: 'full-cast',
            crowdCount: 14,
            crowdSeed: 'omniframe-crowd-42',
          }}
        />
        <Composition
          id="MainHeroesPreviewGridPhase2"
          component={CharacterCastShowcaseComposition}
          schema={characterCastShowcaseSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            initialViewMode: 'heroes-grid',
            crowdCount: 14,
            crowdSeed: 'omniframe-crowd-42',
          }}
        />
        <Composition
          id="CharacterRigChecklistPhase7"
          component={CharacterCastShowcaseComposition}
          schema={characterCastShowcaseSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            initialViewMode: 'checklist',
            crowdCount: 14,
            crowdSeed: 'omniframe-crowd-42',
          }}
        />
      </Folder>
      <Folder name="01-Garage-And-Nuclear-Launch-Setup-4K60">
        <Composition
          id="GarageNuclearLaunch"
          component={GarageNuclearLaunchComposition}
          schema={garageNuclearLaunchSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'garage-choreographed-tour',
            doorMode: 'timeline-animated',
            launchMode: 'timeline-cycle',
            lightRevealMode: 'dramatic-3-bulb-reveal',
            vfxIntensity: 1.0,
            inkOutlinesEnabled: true,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="CartoonNukeAndTrolleyHero"
          component={GarageNuclearLaunchComposition}
          schema={garageNuclearLaunchSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'nuke-and-trolley-hero-closeup',
            doorMode: 'timeline-animated',
            launchMode: 'full-ignition-blast',
            lightRevealMode: 'dramatic-3-bulb-reveal',
            vfxIntensity: 1.15,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="AnimatedGarageDoorAndTracks"
          component={GarageNuclearLaunchComposition}
          schema={garageNuclearLaunchSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'garage-door-and-tracks-closeup',
            doorMode: 'timeline-animated',
            launchMode: 'timeline-cycle',
            lightRevealMode: 'dramatic-3-bulb-reveal',
            vfxIntensity: 1.0,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="CountdownSignsAndLaunchVFX"
          component={GarageNuclearLaunchComposition}
          schema={garageNuclearLaunchSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'countdown-signs-and-fx-closeup',
            doorMode: 'timeline-animated',
            launchMode: 'full-ignition-blast',
            lightRevealMode: 'dramatic-3-bulb-reveal',
            vfxIntensity: 1.2,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="GarageClutterShelvesAndTools"
          component={GarageNuclearLaunchComposition}
          schema={garageNuclearLaunchSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'clutter-shelves-tools-closeup',
            doorMode: 'timeline-animated',
            launchMode: 'timeline-cycle',
            lightRevealMode: 'all-lamps-full-bright',
            vfxIntensity: 1.0,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
      </Folder>
      <Folder name="02-Dark-Room-Phone-Glow-Bedroom-4K60">
        <Composition
          id="DarkRoomBedroom"
          component={DarkRoomBedroomComposition}
          schema={darkRoomBedroomSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'dark-room-choreographed-tour',
            lightMode: 'full-bedroom-lit',
            phoneGlowColorMode: 'auto-ui-sync',
            phoneGlowMultiplier: 1.25,
            doorControlMode: 'timeline-auto',
            dustIntensity: 1.0,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="SofaNewsTvAndWindowShowcase"
          component={DarkRoomBedroomComposition}
          schema={darkRoomBedroomSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'sofa-news-tv-window-closeup',
            lightMode: 'full-bedroom-lit',
            phoneGlowColorMode: 'auto-ui-sync',
            phoneGlowMultiplier: 1.25,
            doorControlMode: 'timeline-auto',
            dustIntensity: 1.0,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="PhoneGlowHeroCloseup"
          component={DarkRoomBedroomComposition}
          schema={darkRoomBedroomSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'phone-glow-hero-closeup',
            lightMode: 'full-bedroom-lit',
            phoneGlowColorMode: 'electric-cyan',
            phoneGlowMultiplier: 1.45,
            doorControlMode: 'timeline-auto',
            dustIntensity: 1.15,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="DeskSetupDetail"
          component={DarkRoomBedroomComposition}
          schema={darkRoomBedroomSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'desk-setup-closeup',
            lightMode: 'full-bedroom-lit',
            phoneGlowColorMode: 'auto-ui-sync',
            phoneGlowMultiplier: 1.3,
            doorControlMode: 'timeline-auto',
            dustIntensity: 1.0,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="BedWindowAndPostersOverview"
          component={DarkRoomBedroomComposition}
          schema={darkRoomBedroomSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'bed-window-posters-overview',
            lightMode: 'full-bedroom-lit',
            phoneGlowColorMode: 'neon-magenta',
            phoneGlowMultiplier: 1.35,
            doorControlMode: 'timeline-auto',
            dustIntensity: 1.0,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="RiggedBedroomDoorShowcase"
          component={DarkRoomBedroomComposition}
          schema={darkRoomBedroomSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'rigged-bedroom-door-closeup',
            lightMode: 'full-bedroom-lit',
            phoneGlowColorMode: 'auto-ui-sync',
            phoneGlowMultiplier: 1.25,
            doorControlMode: 'timeline-auto',
            dustIntensity: 1.0,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
      </Folder>
      <Folder name="02-Crack-And-Sons-Shop-Interior-4K60">
        <Composition
          id="CrackAndSonsShopInterior"
          component={CrackAndSonsInteriorComposition}
          schema={crackAndSonsInteriorSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'interior-choreographed-tour',
            lightMood: 'warm-boutique',
            doorControlMode: 'timeline-auto',
            manualDoorOpenProgress: 1,
            inkOutlinesEnabled: true,
            dustIntensity: 1.0,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="HeroNutcrackerMasterpieceCloseUp"
          component={CrackAndSonsInteriorComposition}
          schema={crackAndSonsInteriorSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'hero-nutcracker-closeup',
            lightMood: 'festive-golden',
            doorControlMode: 'timeline-auto',
            manualDoorOpenProgress: 1,
            inkOutlinesEnabled: true,
            dustIntensity: 1.15,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="StoreTvAdvertisementShowcase"
          component={CrackAndSonsInteriorComposition}
          schema={crackAndSonsInteriorSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'tv-commercial-showcase',
            lightMood: 'warm-boutique',
            doorControlMode: 'timeline-auto',
            manualDoorOpenProgress: 1,
            inkOutlinesEnabled: true,
            dustIntensity: 1.0,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="CounterAndCashRegisterDetail"
          component={CrackAndSonsInteriorComposition}
          schema={crackAndSonsInteriorSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'counter-and-register-closeup',
            lightMood: 'warm-boutique',
            doorControlMode: 'timeline-auto',
            manualDoorOpenProgress: 1,
            inkOutlinesEnabled: true,
            dustIntensity: 1.0,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="ShelvesAndOrnamentsDetail"
          component={CrackAndSonsInteriorComposition}
          schema={crackAndSonsInteriorSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'shelves-and-ornaments-closeup',
            lightMood: 'festive-golden',
            doorControlMode: 'timeline-auto',
            manualDoorOpenProgress: 1,
            inkOutlinesEnabled: true,
            dustIntensity: 1.0,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="RiggedShopDoorAndHandleShowcase"
          component={CrackAndSonsInteriorComposition}
          schema={crackAndSonsInteriorSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            cameraPreset: 'rigged-door-handle-closeup',
            lightMood: 'warm-boutique',
            doorControlMode: 'timeline-auto',
            manualDoorOpenProgress: 1,
            inkOutlinesEnabled: true,
            dustIntensity: 1.0,
            wireframeMode: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
      </Folder>
      <Folder name="02-Main-Street-Section-1-4K60">
        <Composition
          id="MainStreetRoadSection1"
          component={MainStreetAssetComposition}
          schema={mainStreetCompositionSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            styleMood: 'lofi-night',
            timeOfDayMode: 'day',
            cameraPreset: 'remotion-choreographed',
            explodeFactor: 0,
            inkOutlinesEnabled: true,
            halftoneIntensity: 0.75,
            isolatedSubPartId: 'ALL',
            wireframeMode: false,
            showComicCallout: true,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="StorefrontHeroAsset"
          component={MainStreetAssetComposition}
          schema={mainStreetCompositionSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            styleMood: 'lofi-night',
            timeOfDayMode: 'day',
            cameraPreset: 'storefront-hero-closeup',
            explodeFactor: 0,
            inkOutlinesEnabled: true,
            halftoneIntensity: 0.75,
            isolatedSubPartId: 'ALL',
            wireframeMode: false,
            showComicCallout: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="AnimeLoFiCarAsset"
          component={MainStreetAssetComposition}
          schema={mainStreetCompositionSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            styleMood: 'lofi-night',
            timeOfDayMode: 'day',
            cameraPreset: 'car-hero-showcase',
            explodeFactor: 0,
            inkOutlinesEnabled: true,
            halftoneIntensity: 0.75,
            isolatedSubPartId: 'ALL',
            wireframeMode: false,
            showComicCallout: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="AnimeStreetLampAsset"
          component={MainStreetAssetComposition}
          schema={mainStreetCompositionSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            styleMood: 'lofi-night',
            timeOfDayMode: 'day',
            cameraPreset: 'street-lamp-showcase',
            explodeFactor: 0,
            inkOutlinesEnabled: true,
            halftoneIntensity: 0.75,
            isolatedSubPartId: 'ALL',
            wireframeMode: false,
            showComicCallout: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="CurbsAndDrainageDetail"
          component={MainStreetAssetComposition}
          schema={mainStreetCompositionSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            styleMood: 'lofi-night',
            timeOfDayMode: 'day',
            cameraPreset: 'curb-drainage-closeup',
            explodeFactor: 0,
            inkOutlinesEnabled: true,
            halftoneIntensity: 0.65,
            isolatedSubPartId: 'ALL',
            wireframeMode: false,
            showComicCallout: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="ManholeAndLaneLinesDetail"
          component={MainStreetAssetComposition}
          schema={mainStreetCompositionSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            styleMood: 'lofi-night',
            timeOfDayMode: 'day',
            cameraPreset: 'low-hero-street',
            explodeFactor: 0,
            inkOutlinesEnabled: true,
            halftoneIntensity: 0.7,
            isolatedSubPartId: 'ALL',
            wireframeMode: false,
            showComicCallout: false,
            manualOrbitAzimuthRad: 0.15,
            manualOrbitPolarRad: -0.08,
            manualZoomDistance: 0.78,
          }}
        />
        <Composition
          id="HalftonePopArtBurstBackdrop"
          component={MainStreetAssetComposition}
          schema={mainStreetCompositionSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            styleMood: 'pop-halftone',
            timeOfDayMode: 'day',
            cameraPreset: 'low-hero-street',
            explodeFactor: 0,
            inkOutlinesEnabled: true,
            halftoneIntensity: 1.0,
            isolatedSubPartId: 'ALL',
            wireframeMode: false,
            showComicCallout: true,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
        <Composition
          id="Exploded12PartGroundPlane"
          component={MainStreetAssetComposition}
          schema={mainStreetCompositionSchema}
          durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
          fps={60}
          width={3840}
          height={2160}
          defaultProps={{
            styleMood: 'neutral-anime',
            timeOfDayMode: 'day',
            cameraPreset: 'isometric-blueprint',
            explodeFactor: 0.65,
            inkOutlinesEnabled: true,
            halftoneIntensity: 0.45,
            isolatedSubPartId: 'ALL',
            wireframeMode: false,
            showComicCallout: false,
            manualOrbitAzimuthRad: 0,
            manualOrbitPolarRad: 0,
            manualZoomDistance: 1,
          }}
        />
      </Folder>
    </>
  );
};
