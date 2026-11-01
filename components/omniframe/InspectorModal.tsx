'use client';

import React from 'react';
import {X, Layers, Film, Code2, CheckCircle2} from 'lucide-react';
import {
  MAIN_STREET_SECTION_1_MANIFEST,
  SHOT_MANIFEST,
} from '@/lib/omniframe/asset-manifest';

export type InspectorTabId = 'manifest' | 'shots' | 'remotion';

interface InspectorModalProps {
  openTab: InspectorTabId | null;
  onClose: () => void;
  onSelectTab: (tab: InspectorTabId) => void;
  isolatedSubPartId: string | null;
  onIsolateSubPart: (id: string | null) => void;
  onJumpToFrame: (frame: number) => void;
}

export const InspectorModal: React.FC<InspectorModalProps> = ({
  openTab,
  onClose,
  onSelectTab,
  isolatedSubPartId,
  onIsolateSubPart,
  onJumpToFrame,
}) => {
  if (!openTab) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Asset and Remotion Specification Inspector"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 md:p-8"
    >
      <div className="w-full max-w-5xl max-h-[86vh] flex flex-col bg-[#141122] border border-[#2D2646] rounded-xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#26203B]">
          <div className="flex items-center gap-6">
            <h2
              style={{fontFamily: 'var(--font-display)'}}
              className="text-lg font-bold text-[#F3EFFA] tracking-tight"
            >
              Asset 01 Specification & Remotion Blueprint
            </h2>
            <div className="flex items-center gap-1 p-1 bg-[#0D0B14] rounded-lg border border-[#26203B]">
              <button
                type="button"
                onClick={() => onSelectTab('manifest')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  openTab === 'manifest'
                    ? 'bg-[#A855F7] text-white'
                    : 'text-[#A39BB8] hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>12-Part Manifest</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('shots')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  openTab === 'shots'
                    ? 'bg-[#A855F7] text-white'
                    : 'text-[#A39BB8] hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Shot Blueprint</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('remotion')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  openTab === 'remotion'
                    ? 'bg-[#A855F7] text-white'
                    : 'text-[#A39BB8] hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Remotion Spec</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close specification inspector"
            className="p-2 text-[#A39BB8] hover:text-white rounded-lg hover:bg-[#231D36] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#D6CFE6]">
          {openTab === 'manifest' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#26203B]">
                <div>
                  <p className="text-xs text-[#9E95B5]">
                    Asset ID: {MAIN_STREET_SECTION_1_MANIFEST.assetId} · Footprint: 24.0m × 40.0m · Ground Pivot: (0, 0, 0)
                  </p>
                </div>
                {isolatedSubPartId && (
                  <button
                    type="button"
                    onClick={() => onIsolateSubPart(null)}
                    className="px-3 py-1.5 text-xs font-medium bg-[#26203B] text-white rounded-md hover:bg-[#342C50] transition-colors whitespace-nowrap shrink-0"
                  >
                    Show All 12 Parts
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#26203B] text-xs text-[#9E95B5]">
                      <th className="py-2.5 pr-3 font-medium">#</th>
                      <th className="py-2.5 px-3 font-medium">Sub-Part Component</th>
                      <th className="py-2.5 px-3 font-medium">Silhouette Tier</th>
                      <th className="py-2.5 px-3 font-medium">Dimensions (W×H×L)</th>
                      <th className="py-2.5 px-3 font-medium">Base Y</th>
                      <th className="py-2.5 px-3 font-medium">Cel Bands</th>
                      <th className="py-2.5 pl-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1A30] text-xs tabular-nums">
                    {MAIN_STREET_SECTION_1_MANIFEST.subParts.map((part) => {
                      const isIsolated = isolatedSubPartId === part.id;
                      return (
                        <tr
                          key={part.id}
                          className={`${
                            isIsolated ? 'bg-[#A855F7]/15' : 'hover:bg-[#1B162B]'
                          } transition-colors`}
                        >
                          <td className="py-3 pr-3 font-mono text-[#9E95B5]">
                            {String(part.index).padStart(2, '0')}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-[#F3EFFA]">
                              {part.name}
                            </div>
                            <div className="text-[#9E95B5] mt-0.5">
                              {part.description}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[#C4BBD9] whitespace-nowrap">
                            {part.silhouetteScale}
                          </td>
                          <td className="py-3 px-3 font-mono text-[#C4BBD9] whitespace-nowrap">
                            {part.dimensionsMeters[0].toFixed(1)}m ×{' '}
                            {part.dimensionsMeters[1].toFixed(2)}m ×{' '}
                            {part.dimensionsMeters[2].toFixed(1)}m
                          </td>
                          <td className="py-3 px-3 font-mono text-[#38BDF8] whitespace-nowrap">
                            +{part.baseElevationY.toFixed(3)}m
                          </td>
                          <td className="py-3 px-3 font-mono text-[#C4BBD9] whitespace-nowrap">
                            {part.celBands}-Step Toon
                          </td>
                          <td className="py-3 pl-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                onIsolateSubPart(isIsolated ? null : part.id);
                                onClose();
                              }}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                                isIsolated
                                  ? 'bg-[#A855F7] text-white'
                                  : 'bg-[#231D36] text-[#E2D9F3] hover:bg-[#32294D]'
                              }`}
                            >
                              {isIsolated ? 'Restore All' : 'Isolate in 3D'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {openTab === 'shots' && (
            <div className="space-y-4">
              <p className="text-xs text-[#9E95B5]">
                Deterministic 240-frame (8.00s @ 30fps, 120 BPM) Remotion camera & halftone burst timeline for Asset #01 verification.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SHOT_MANIFEST.map((shot) => (
                  <div
                    key={shot.shotId}
                    className="p-4 rounded-lg bg-[#1A152B] border border-[#2B2442] flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#9E95B5] font-mono tabular-nums">
                        <span>{shot.shotId}</span>
                        <span>
                          Frames {shot.startFrame}–{shot.endFrame} · {shot.fov}° FOV
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-[#F3EFFA]">
                        {shot.title}
                      </h3>
                      <p className="text-xs text-[#38BDF8]">{shot.musicalAnchor}</p>
                      <p className="text-xs text-[#BDB4D4] leading-relaxed">
                        {shot.narrativePurpose}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#26203B]">
                      <span className="text-xs font-mono text-[#9E95B5] tabular-nums">
                        Halftone Boost: {Math.round(shot.halftonePulseBoost * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onJumpToFrame(shot.startFrame);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-[#A855F7] text-white rounded-md hover:bg-[#9333EA] transition-colors whitespace-nowrap shrink-0"
                      >
                        Cue Frame {shot.startFrame}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {openTab === 'remotion' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#1A152B] border border-[#2B2442]">
                  <div className="text-xs text-[#9E95B5]">Composition ID</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-[#F3EFFA]">
                    {MAIN_STREET_SECTION_1_MANIFEST.compositionId}
                  </div>
                  <div className="mt-1 text-xs text-[#9E95B5]">
                    1920×1080 · 30 FPS · 240 Frames
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[#1A152B] border border-[#2B2442]">
                  <div className="text-xs text-[#9E95B5]">Cel & Ink Pipeline</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-[#F3EFFA]">
                    3/4-Step NearestFilter Toon
                  </div>
                  <div className="mt-1 text-xs text-[#9E95B5]">
                    EdgesGeometry + BackSide Hull Outlines
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[#1A152B] border border-[#2B2442]">
                  <div className="text-xs text-[#9E95B5]">Halftone Burst Shader</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-[#F3EFFA]">
                    Radial Dot + Manga Spikes
                  </div>
                  <div className="mt-1 text-xs text-[#9E95B5]">
                    Larger inward (r→0), smaller outward (r→1)
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#0D0B14] border border-[#26203B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#E2D9F3]">
                  <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                  <span>Deterministic Remotion Timeline Evaluation (t = n / F)</span>
                </div>
                <p className="text-xs text-[#9E95B5] leading-relaxed">
                  Every frame in this studio is rendered through Remotion&apos;s{' '}
                  <code className="font-mono text-[#E2D9F3]">@remotion/player</code>{' '}
                  and <code className="font-mono text-[#E2D9F3]">useCurrentFrame()</code>{' '}
                  hook. Camera splines, halftone dot radii, speed-line spike phases, and crosswalk beacon pulses are pure functions of the frame index with zero non-deterministic timers.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
