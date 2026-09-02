import { z } from 'zod';
import { Tool, ToolMetadata } from '../../shared/types.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { workspaceManager } from '../../workspace/WorkspaceManager.js';
import { logger } from '../../logger/JsonLogger.js';

const selectArgsSchema = z.object({
  path: z.string().min(1, 'Workspace path is required'),
});

type SelectArgs = z.infer<typeof selectArgsSchema>;

export class WorkspaceSelectTool implements Tool<SelectArgs> {
  public readonly metadata: ToolMetadata = {
    name: 'workspace_select',
    description: 'Selects or creates a new workspace directory.',
    version: '1.0.0',
    group: 'workspace', 
  };

  public readonly inputSchema = selectArgsSchema as unknown as z.ZodType<SelectArgs>;

  public async execute(args: SelectArgs): Promise<CallToolResult> {
    try {
      const session = await workspaceManager.selectWorkspace(args.path);
      logger.info('Workspace selected', { path: session.root, sessionId: session.id });
      
      return {
        content: [{ 
          type: 'text', 
          text: `✅ Workspace successfully selected/created.\n\nRoot: ${session.root}\nName: ${session.name}\nSession ID: ${session.id}` 
        }],
        isError: false,
      };
    } catch (error: any) {
      logger.error('Failed to select workspace', { path: args.path, error: error.message });
      return {
        content: [{ type: 'text', text: `❌ Failed to select workspace: ${error.message}` }],
        isError: true,
      };
    }
  }
}