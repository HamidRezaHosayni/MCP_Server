import { z } from 'zod';
import { Tool, ToolMetadata } from '../../shared/types.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { workspaceManager } from '../../workspace/WorkspaceManager.js';
import fs from 'fs/promises';

const readArgsSchema = z.object({
  filePath: z.string().min(1, 'File path is required'),
  startLine: z.number().optional(),
  endLine: z.number().optional(),
});

type ReadArgs = z.infer<typeof readArgsSchema>;

export class WorkspaceReadTool implements Tool<ReadArgs> {
  public readonly metadata: ToolMetadata = {
    name: 'workspace_read_file',
    description: 'Reads a file inside the workspace. Supports optional line ranges.',
    version: '1.0.0',
    group: 'workspace', // <--- اضافه شد
  };

  public readonly inputSchema = readArgsSchema as unknown as z.ZodType<ReadArgs>;

  public async execute(args: ReadArgs): Promise<CallToolResult> {
    try {
      const guard = workspaceManager.getGuard();
      const safePath = await guard.assertInsideWorkspace(args.filePath);
      
      const content = await fs.readFile(safePath, 'utf-8');
      const lines = content.split('\n');

      let resultContent = content;
      if (args.startLine !== undefined || args.endLine !== undefined) {
        const start = args.startLine !== undefined ? Math.max(0, args.startLine - 1) : 0;
        const end = args.endLine !== undefined ? Math.min(lines.length, args.endLine) : lines.length;
        resultContent = lines.slice(start, end).join('\n');
      }

      return {
        content: [{ 
          type: 'text', 
          text: `📄 Content of ${args.filePath}:\n\n\`\`\`\n${resultContent}\n\`\`\`` 
        }],
        isError: false,
      };
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return {
          content: [{ type: 'text', text: `❌ File not found: ${args.filePath}` }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text', text: `❌ Failed to read file: ${error.message}` }],
        isError: true,
      };
    }
  }
}