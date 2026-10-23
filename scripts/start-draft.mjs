import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
const child = spawn(
  process.execPath,
  [
    'node_modules/next/dist/bin/next',
    'dev',
    '-p',
    process.env.PORT || '3001',
    '-H',
    '127.0.0.1',
  ],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_PUBLIC_DESIGN_PREVIEW: 'true',
      JWT_SECRET: process.env.JWT_SECRET || randomBytes(32).toString('hex'),
    },
  },
);
child.on('exit', (code) => process.exit(code || 0));
