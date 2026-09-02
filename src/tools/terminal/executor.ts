// src/tools/terminal/executor.ts
import { spawn } from 'child_process';
import { ExecutionResult, TerminalCommandArgs } from './types.js';
import { config } from '../../config/config.js';

export class TerminalExecutor {
  public async execute(args: TerminalCommandArgs): Promise<ExecutionResult> {
    const {
      command,
      args: cmdArgs = [],
      cwd = config.defaultCwd,
      env = {},
      timeout = config.defaultTimeout,
    } = args;

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      const startTime = Date.now();
      let timeoutId: NodeJS.Timeout;

      // بازسازی کامل دستور به صورت یک رشته واحد برای ارسال به bash
      const fullCommand = cmdArgs.length > 0 
        ? `${command} ${cmdArgs.join(' ')}` 
        : command;

      // اجرای دستور از طریق /bin/bash برای پشتیبانی از قابلیت‌های شل (مثل ||, &&, ~, *)
      // امنیت این روش توسط TerminalValidator که قبل از این مرحله اجرا می‌شود، تضمین می‌گردد.
      const child = spawn('/bin/bash', ['-c', fullCommand], {
        cwd,
        env: { ...process.env, ...env },
        shell: false, // خود bash به عنوان برنامه اصلی اجرا می‌شود، نه شل پیش‌فرض سیستم
      });

      timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        setTimeout(() => {
          if (!child.killed) child.kill('SIGKILL');
        }, 5000);
      }, timeout);

      if (child.stdout) {
        child.stdout.on('data', (data) => { 
          stdout += data.toString(); 
        });
      }
      
      if (child.stderr) {
        child.stderr.on('data', (data) => { 
          stderr += data.toString(); 
        });
      }

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code,
          executionTime: Date.now() - startTime,
        });
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        resolve({
          stdout: stdout.trim(),
          stderr: error.message,
          exitCode: 1,
          executionTime: Date.now() - startTime,
        });
      });
    });
  }
}