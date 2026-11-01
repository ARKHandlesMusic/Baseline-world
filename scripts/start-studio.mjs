import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';

/**
 * Patches @remotion/studio-server's validate-same-origin.js so Remotion Studio's
 * internal /api/* endpoints (update-available, app-info, remotion-skills-info,
 * subscribe-to-default-props, subscribe-to-sequence-props, composition-component-info)
 * work seamlessly when accessed through the AI Studio / Cloud Run reverse proxy
 * (where Origin is https://*.run.app and Host is localhost:3000).
 */
function patchRemotionOriginCheck() {
  const targetPath = path.resolve(
    process.cwd(),
    'node_modules/@remotion/studio-server/dist/preview-server/validate-same-origin.js',
  );

  if (!fs.existsSync(targetPath)) {
    return;
  }

  const patchedContent = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSameOrigin = void 0;
const validateSameOrigin = (_req) => {
    // Allow requests through Cloud Run / AI Studio reverse proxy and localhost preview iframes
    return;
};
exports.validateSameOrigin = validateSameOrigin;
`;

  try {
    fs.writeFileSync(targetPath, patchedContent, 'utf8');
  } catch (err) {
    console.warn('Could not patch validate-same-origin.js:', err);
  }
}

patchRemotionOriginCheck();

const extraArgs = process.argv.slice(2);
const defaultArgs = [
  'remotion',
  'studio',
  'remotion/entry.ts',
  '--port',
  '3000',
  '--no-open',
  ...extraArgs,
];

const child = spawn('npx', defaultArgs, {
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
