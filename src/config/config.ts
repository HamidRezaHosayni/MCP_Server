import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  defaultTimeout: 30000,
  defaultCwd: process.cwd(),
  loggerPath: path.join(__dirname, '../../logs/server.json'),
  blockedCommands: [
    'shutdown', 'reboot', 'poweroff', 'halt', 'init',
    'mkfs', 'format', 'userdel', 'usermod', 'passwd'
  ],
  dangerousPatterns: [
    /rm\s+-rf\s+\//,
    /rm\s+-rf\s+\*/,
    /rm\s+-rf\s+~/,
    /dd\s+if=.*of=\/dev\/[sh]d/,
    />\s*\/dev\/[sh]d/
  ]
};