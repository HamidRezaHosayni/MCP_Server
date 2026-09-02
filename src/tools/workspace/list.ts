import { z } from 'zod';
import { Tool, ToolMetadata } from '../../shared/types.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { workspaceManager } from '../../workspace/WorkspaceManager.js';
import fs from 'fs/promises';
import path from 'path';

const listArgsSchema = z.object({
  targetPath: z.string().default('.'),
});

type ListArgs = z.infer<typeof listArgsSchema>;

export class WorkspaceListTool implements Tool<ListArgs> {
  public readonly metadata: ToolMetadata = {
    name: 'workspace_list',
    description: 'Lists files and directories inside the active workspace.',
    version: '1.0.0',
    group: 'workspace', // <--- اضافه شد
  };

  public readonly inputSchema = listArgsSchema as unknown as z.ZodType<ListArgs>;

  public async execute(args: ListArgs): Promise<CallToolResult> {
    try {
      const guard = workspaceManager.getGuard();
      const safePath = await guard.assertInsideWorkspace(args.targetPath);
      
      const stats = await fs.stat(safePath);
      if (!stats.isDirectory()) {
        return {
          content: [{ type: 'text', text: `❌ Path is not a directory: ${args.targetPath}` }],
          isError: true,
        };
      }

      const entries = await fs.readdir(safePath, { withFileTypes: true });
      const formatted = entries.map(entry => {
        const type = entry.isDirectory() ? '📁' : '📄';
        return `${type} ${entry.name}`;
      }).join('\n');

      return {
        content: [{ type: 'text', text: `Contents of ${args.targetPath}:\n\n${formatted || '(Empty directory)'}` }],
        isError: false,
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `❌ Failed to list directory: ${error.message}` }],
        isError: true,
      };
    }
  }
}