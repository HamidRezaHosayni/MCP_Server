import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { Tool, ToolMetadata } from '../../shared/types.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../../logger/JsonLogger.js';

const workspaceSelectSchema = z.object({
  path: z.string().describe('Absolute path to the workspace directory')
});

type WorkspaceSelectArgs = z.infer<typeof workspaceSelectSchema>;

export class WorkspaceSelectTool implements Tool<WorkspaceSelectArgs> {
    public readonly metadata: ToolMetadata = {
        name: 'workspace_select',
        description: 'Select or create a workspace directory. This will automatically create a .agent folder for persistent state management.',
        version: '1.0.0',
        group: 'workspace' as any, // <--- استفاده از 'workspace' برای هماهنگی با ToolGroup
    };

  public readonly inputSchema = workspaceSelectSchema as unknown as z.ZodType<WorkspaceSelectArgs>;

  private static currentWorkspace: string | null = null;

  public async execute(args: WorkspaceSelectArgs): Promise<CallToolResult> {
    try {
      const workspacePath = path.resolve(args.path);

      if (!fs.existsSync(workspacePath)) {
        fs.mkdirSync(workspacePath, { recursive: true });
        logger.info('Workspace directory created', { path: workspacePath });
      }

      // ساخت خودکار پوشه .agent برای مدیریت وضعیت
      const agentDir = path.join(workspacePath, '.agent');
      if (!fs.existsSync(agentDir)) {
        fs.mkdirSync(agentDir, { recursive: true });
        logger.info('Agent state directory created automatically', { path: agentDir });
      }

      WorkspaceSelectTool.currentWorkspace = workspacePath;

      logger.info('Workspace selected', { path: workspacePath });

      return {
        content: [{ 
          type: 'text', 
          text: `✅ Workspace selected: ${workspacePath}\n\n📁 Agent state directory is ready at: ${agentDir}` 
        }],
        isError: false,
      };
    } catch (error: any) {
      logger.error('Workspace selection failed', { error: error.message });
      return {
        content: [{ type: 'text', text: `❌ Error: ${error.message}` }],
        isError: true,
      };
    }
  }

  public static getCurrentWorkspace(): string | null {
    return WorkspaceSelectTool.currentWorkspace;
  }
}