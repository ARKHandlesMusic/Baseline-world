'use client';

import React, {useState} from 'react';
import {Player} from '@remotion/player';
import {MainStreetAssetComposition} from '@/remotion/MainStreetAssetComposition';
import {CharacterCastShowcaseComposition} from '@/remotion/CharacterCastShowcaseComposition';
import {CrackAndSonsInteriorComposition} from '@/remotion/CrackAndSonsInteriorComposition';
import {DarkRoomBedroomComposition} from '@/remotion/DarkRoomBedroomComposition';
import {GarageNuclearLaunchComposition} from '@/remotion/GarageNuclearLaunchComposition';
import {MAIN_STREET_SECTION_1_MANIFEST} from '@/lib/omniframe/asset-manifest';

export type StudioSceneTabId =
  | 'main-street-connected'
  | 'character-cast-showcase'
  | 'crack-and-sons-shop'
  | 'dark-room-bedroom'
  | 'garage-nuclear-launch';

export const OmniframeStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudioSceneTabId>(
    'main-street-connected',
  );

  return (
    <div className="w-screen h-screen bg-[#070B14] flex flex-col overflow-hidden select-none">
      {/* Persistent Top Studio Switcher Bar */}
      <header
        data-testid="omniframe-studio-switcher-bar"
        className="w-full bg-[#0F172A] border-b-2 border-[#38BDF8] px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-50 shrink-0"
      >
        <div className="flex items-center gap-2">
          <span className="bg-[#FACC15] text-[#0A0812] font-black text-xs px-2.5 py-1 rounded border-2 border-[#0A0812] tracking-wider">
            OMNIFRAME ∞.1
          </span>
          <span className="text-white font-extrabold text-sm tracking-wide hidden sm:inline">
            CONNECTED 3D CITY + 10 LAYERED SVG CHARACTER PUPPET RIGS
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            data-testid="studio-tab-main-street"
            onClick={() => setActiveTab('main-street-connected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition cursor-pointer ${
              activeTab === 'main-street-connected'
                ? 'bg-[#38BDF8] text-[#0A0812] border-[#0A0812]'
                : 'bg-[#1E293B] text-[#E2E8F0] border-[#475569] hover:border-[#38BDF8]'
            }`}
          >
            🏙️ Connected City &amp; All 10 Characters
          </button>

          <button
            type="button"
            data-testid="studio-tab-character-cast"
            onClick={() => setActiveTab('character-cast-showcase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition cursor-pointer ${
              activeTab === 'character-cast-showcase'
                ? 'bg-[#FACC15] text-[#0A0812] border-[#0A0812]'
                : 'bg-[#1E293B] text-[#FEF08A] border-[#FACC15] hover:bg-[#334155]'
            }`}
          >
            🎭 10-Character SVG Rig Showcase (Phases 1–7)
          </button>

          <button
            type="button"
            data-testid="studio-tab-crack-shop"
            onClick={() => setActiveTab('crack-and-sons-shop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition cursor-pointer ${
              activeTab === 'crack-and-sons-shop'
                ? 'bg-[#EF4444] text-white border-[#FACC15]'
                : 'bg-[#1E293B] text-[#FCA5A5] border-[#EF4444] hover:bg-[#334155]'
            }`}
          >
            🎄 Crack &amp; Sons Shop + Cast
          </button>

          <button
            type="button"
            data-testid="studio-tab-dark-room"
            onClick={() => setActiveTab('dark-room-bedroom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition cursor-pointer ${
              activeTab === 'dark-room-bedroom'
                ? 'bg-[#06B6D4] text-[#0A0812] border-[#0A0812]'
                : 'bg-[#1E293B] text-[#67E8F9] border-[#06B6D4] hover:bg-[#334155]'
            }`}
          >
            🛏️ Bedroom (City Window Gateway) + Cast
          </button>

          <button
            type="button"
            data-testid="studio-tab-garage-nuke"
            onClick={() => setActiveTab('garage-nuclear-launch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition cursor-pointer ${
              activeTab === 'garage-nuclear-launch'
                ? 'bg-[#F97316] text-[#0A0812] border-[#0A0812]'
                : 'bg-[#1E293B] text-[#FDBA74] border-[#F97316] hover:bg-[#334155]'
            }`}
          >
            🚀 Garage &amp; Nuclear Launch + Cast
          </button>
        </div>
      </header>

      {/* Main Remotion 4K Player Viewport */}
      <div className="flex-1 w-full relative overflow-hidden bg-black flex items-center justify-center">
        {activeTab === 'main-street-connected' && (
          <Player
            key="player-main-street"
            component={MainStreetAssetComposition}
            inputProps={{
              styleMood: 'lofi-night',
              timeOfDayMode: 'day',
              cameraPreset: 'remotion-choreographed',
              explodeFactor: 0,
              inkOutlinesEnabled: true,
              halftoneIntensity: 0.7,
              isolatedSubPartId: 'ALL',
              wireframeMode: false,
              showComicCallout: true,
              manualOrbitAzimuthRad: 0,
              manualOrbitPolarRad: 0,
              manualZoomDistance: 1,
            }}
            durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
            compositionWidth={3840}
            compositionHeight={2160}
            fps={MAIN_STREET_SECTION_1_MANIFEST.fps}
            style={{width: '100%', height: '100%'}}
            controls
            loop
            acknowledgeRemotionLicense
          />
        )}

        {activeTab === 'character-cast-showcase' && (
          <Player
            key="player-character-cast"
            component={CharacterCastShowcaseComposition}
            inputProps={{
              initialViewMode: 'full-cast' as const,
              crowdCount: 14,
              crowdSeed: 'omniframe-crowd-42',
            }}
            durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
            compositionWidth={3840}
            compositionHeight={2160}
            fps={MAIN_STREET_SECTION_1_MANIFEST.fps}
            style={{width: '100%', height: '100%'}}
            controls
            loop
            acknowledgeRemotionLicense
          />
        )}

        {activeTab === 'crack-and-sons-shop' && (
          <Player
            key="player-crack-shop"
            component={CrackAndSonsInteriorComposition}
            inputProps={{
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
            durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
            compositionWidth={3840}
            compositionHeight={2160}
            fps={MAIN_STREET_SECTION_1_MANIFEST.fps}
            style={{width: '100%', height: '100%'}}
            controls
            loop
            acknowledgeRemotionLicense
          />
        )}

        {activeTab === 'dark-room-bedroom' && (
          <Player
            key="player-dark-room"
            component={DarkRoomBedroomComposition}
            inputProps={{
              cameraPreset: 'dark-room-choreographed-tour',
              lightMode: 'full-bedroom-lit',
              phoneGlowColorMode: 'auto-ui-sync',
              phoneGlowMultiplier: 1.25,
              doorControlMode: 'timeline-auto',
              dustIntensity: 1.0,
              inkOutlinesEnabled: true,
              wireframeMode: false,
              manualOrbitAzimuthRad: 0,
              manualOrbitPolarRad: 0,
              manualZoomDistance: 1,
            }}
            durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
            compositionWidth={3840}
            compositionHeight={2160}
            fps={MAIN_STREET_SECTION_1_MANIFEST.fps}
            style={{width: '100%', height: '100%'}}
            controls
            loop
            acknowledgeRemotionLicense
          />
        )}

        {activeTab === 'garage-nuclear-launch' && (
          <Player
            key="player-garage-nuke"
            component={GarageNuclearLaunchComposition}
            inputProps={{
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
            durationInFrames={MAIN_STREET_SECTION_1_MANIFEST.durationInFrames}
            compositionWidth={3840}
            compositionHeight={2160}
            fps={MAIN_STREET_SECTION_1_MANIFEST.fps}
            style={{width: '100%', height: '100%'}}
            controls
            loop
            acknowledgeRemotionLicense
          />
        )}
      </div>
    </div>
  );
};
