// src/tools/workspace/terminal.ts
import { z } from 'zod';
import { Tool, ToolMetadata } from '../../shared/types.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { workspaceManager } from '../../workspace/WorkspaceManager.js';
import { WorkspacePolicy } from '../../workspace/WorkspacePolicy.js';
import { sandboxProvider } from '../../sandbox/RestrictedProcessSandbox.js';
import { logger } from '../../logger/JsonLogger.js';

const terminalArgsSchema = z.object({
  command: z.string().min(1, 'Command is required'),
  timeout: z.number().min(5000).max(600000).optional().default(120000).describe('Execution time limit in milliseconds. MUST set to 300000 (5 mins) or higher for commands like "npm install" or "npm run build".'),
});

type TerminalArgs = z.infer<typeof terminalArgsSchema>;

export class WorkspaceTerminalTool implements Tool<TerminalArgs> {

  public readonly metadata: ToolMetadata = {
    name: 'workspace_terminal_execute',
    description: 'Executes a shell command inside the active workspace. Security enforced via Policy and Sandbox.',
    version: '1.0.0',
    group: 'terminal', // <--- اضافه
  };

  public readonly inputSchema = terminalArgsSchema as unknown as z.ZodType<TerminalArgs>;

  public async execute(args: TerminalArgs): Promise<CallToolResult> {
    try {
      const session = workspaceManager.getSession();
      const guard = workspaceManager.getGuard();
      
      const policyCheck = WorkspacePolicy.validate(args.command);
      if (!policyCheck.allowed) {
        return {
          content: [{ type: 'text', text: `❌ COMMAND_REJECTED: ${policyCheck.reason}\n\nThis command is forbidden in the workspace.` }],
          isError: true,
        };
      }

      await guard.assertInsideWorkspace('.');

      logger.info('Executing workspace command', { command: args.command, workspace: session.name });

      const result = await sandboxProvider.execute({
        command: args.command,
        cwd: session.root,
        timeout: args.timeout, 
        maxOutputSize: 1024 * 1024 * 5, 
      });

      const output = [
        result.stdout && `STDOUT:\n${result.stdout}`,
        result.stderr && `STDERR:\n${result.stderr}`,
        `Exit Code: ${result.exitCode}`,
        `Execution Time: ${result.executionTime}ms`,
        result.timedOut ? '⚠️ WARNING: Command timed out.' : ''
      ].filter(Boolean).join('\n\n');

      return {
        content: [{ type: 'text', text: output || '(No output)' }],
        isError: result.exitCode !== 0 || result.timedOut,
      };

    } catch (error: any) {
      logger.error('Workspace terminal execution failed', { error: error.message });
      return {
        content: [{ type: 'text', text: `❌ Execution failed: ${error.message}` }],
        isError: true,
      };
    }
  }
}