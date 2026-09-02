import { spawn } from 'child_process';
import { ApprovalProvider } from './ApprovalProvider.js';

export class ZenityProvider implements ApprovalProvider {
  public async isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn('which', ['zenity'], { stdio: 'ignore' });
      child.on('close', (code) => resolve(code === 0));
    });
  }

  public async askPermission(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const args = [
        '--question',
        '--title=Hermes Agent - تایید امنیتی',
        `--text=${message}`,
        '--width=450',
        '--ok-label=بله',
        '--cancel-label=خیر',
      ];
      
      const child = spawn('zenity', args, {
        env: { ...process.env, DISPLAY: process.env.DISPLAY || ':0' },
        stdio: 'ignore',
      });

      child.on('close', (code) => resolve(code === 0));
      child.on('error', () => resolve(false));
      
      setTimeout(() => { child.kill(); resolve(false); }, 60000);
    });
  }
}