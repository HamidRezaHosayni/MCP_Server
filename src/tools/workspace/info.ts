import { z } from 'zod';
import { Tool, ToolMetadata } from '../../shared/types.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { workspaceManager } from '../../workspace/WorkspaceManager.js';

const infoArgsSchema = z.object({}).optional();
type InfoArgs = z.infer<typeof infoArgsSchema>;

export class WorkspaceInfoTool implements Tool<InfoArgs> {
 public readonly metadata: ToolMetadata = {
    name: 'workspace_get_info',
    description: 'Returns information about the currently active workspace session.',
    version: '1.0.0',
    group: 'workspace',
  };

  public readonly inputSchema = infoArgsSchema as unknown as z.ZodType<InfoArgs>;

  public async execute(): Promise<CallToolResult> {
    try {
      const session = workspaceManager.getSession();
      return {
        content: [{ 
          type: 'text', 
          text: `📂 Active Workspace Info:\n- Name: ${session.name}\n- Root: ${session.root}\n- Created: ${session.createdAt}\n- Status: active` 
        }],
        isError: false,
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `⚠️ No active workspace. Please use workspace_select first. (${error.message})` }],
        isError: true,
      };
    }
  }
}