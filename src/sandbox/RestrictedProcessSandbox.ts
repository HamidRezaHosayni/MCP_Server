import { spawn } from 'child_process';
import { SandboxConfig, SandboxResult } from './types.js';
import { SandboxProvider } from './SandboxProvider.js';

export class RestrictedProcessSandbox implements SandboxProvider {
  public async execute(config: SandboxConfig): Promise<SandboxResult> {
    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      const startTime = Date.now();
      let timedOut = false;
      
      const timeout = config.timeout || 30000;
      const maxOutput = config.maxOutputSize || 1024 * 1024; // 1MB

      // تعریف صریح type برای env
      const env: Record<string, string> = {
        ...process.env as Record<string, string>,
        ...config.env,
        PATH: '/usr/local/bin:/usr/bin:/bin',
      };
      
      // حذف متغیرهای حساس
      delete env.SSH_AUTH_SOCK;
      delete env.GPG_AGENT_INFO;

      const child = spawn('/bin/bash', ['-c', config.command], {
        cwd: config.cwd,
        env,
        shell: false,
      });

      const timeoutId = setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');
        setTimeout(() => {
          if (!child.killed) child.kill('SIGKILL');
        }, 5000);
      }, timeout);

      child.stdout.on('data', (data) => {
        if (stdout.length < maxOutput) stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        if (stderr.length < maxOutput) stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code,
          executionTime: Date.now() - startTime,
          timedOut
        });
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        resolve({
          stdout: stdout.trim(),
          stderr: error.message,
          exitCode: 1,
          executionTime: Date.now() - startTime,
          timedOut
        });
      });
    });
  }
}

export const sandboxProvider = new RestrictedProcessSandbox();