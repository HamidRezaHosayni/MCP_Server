import { z } from 'zod';
import { Tool, ToolMetadata } from '../../shared/types.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { TerminalCommandArgs } from './types.js';
import { TerminalValidator } from './validator.js';
import { PermissionManager } from './permission.js';
import { TerminalExecutor } from './executor.js';
import { logger } from '../../logger/JsonLogger.js';

const terminalArgsSchema = z.object({
  command: z.string().min(1, 'Command is required'),
  args: z.array(z.string()).optional(),
  cwd: z.string().optional(),
  env: z.record(z.string()).optional(),
  timeout: z.number().min(1000).max(300000).optional(),
});

  export class TerminalTool implements Tool<TerminalCommandArgs> {
   public readonly metadata: ToolMetadata = {
      name: 'terminal_execute',
      description: 'Executes a system-wide terminal command. Requires graphical user approval.',
      version: '1.0.0',
      group: 'system',
    };
    

  public readonly inputSchema = terminalArgsSchema;

  private readonly validator: TerminalValidator;
  private readonly permission: PermissionManager;
  private readonly executor: TerminalExecutor;

  constructor() {
    this.validator = new TerminalValidator();
    this.permission = new PermissionManager();
    this.executor = new TerminalExecutor();
  }

  public async execute(args: TerminalCommandArgs): Promise<CallToolResult> {
    const { command, args: cmdArgs = [] } = args;
    const fullCommand = `${command} ${cmdArgs.join(' ')}`.trim();

    logger.info('Terminal tool invoked', { command: fullCommand });

    // 1. اعتبارسنجی امنیتی
    const validation = this.validator.validate(command, cmdArgs);
    if (!validation.isValid) {
      logger.warn('Command blocked by validator', { reason: validation.reason }); // اکنون reason معتبر است
      return {
        content: [{ type: 'text', text: `Security Validation Failed: ${validation.reason}` }],
        isError: true,
      };
    }

    // 2. درخواست تایید گرافیکی
    try {
      await this.permission.checkPermission(command, cmdArgs);
    } catch (error: any) {
      const message = error.message || String(error);
      
      if (message.startsWith('APPROVAL_DENIED') || message.startsWith('APPROVAL_REQUIRED')) {
        return {
          content: [{ type: 'text', text: message }],
          isError: true,
        };
      }

      logger.error('Unexpected permission error', { error: message });
      return {
        content: [{ type: 'text', text: `Permission error: ${message}` }],
        isError: true,
      };
    }

    // 3. اجرای دستور
    logger.info('Executing command', { command: fullCommand });
    const result = await this.executor.execute(args);

    logger.info('Command completed', {
      command: fullCommand,
      exitCode: result.exitCode, // اکنون null مجاز است
      executionTime: result.executionTime,
    });

    const output = [
      result.stdout && `STDOUT:\n${result.stdout}`,
      result.stderr && `STDERR:\n${result.stderr}`,
      `Exit Code: ${result.exitCode}`,
      `Execution Time: ${result.executionTime}ms`,
    ]
      .filter(Boolean)
      .join('\n\n');

    return {
      content: [{ type: 'text', text: output || '(No output)' }],
      isError: result.exitCode !== 0,
    };
  }
}