import { z } from 'zod';
import { Tool, ToolMetadata } from '../../shared/types.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { workspaceManager } from '../../workspace/WorkspaceManager.js';
import fs from 'fs/promises';
import path from 'path';

const createArgsSchema = z.object({
  filePath: z.string().min(1, 'File path is required'),
  content: z.string().default(''),
});

type CreateArgs = z.infer<typeof createArgsSchema>;

export class WorkspaceCreateFileTool implements Tool<CreateArgs> {
   public readonly metadata: ToolMetadata = {
    name: 'workspace_create_file',
    description: 'Creates a new file inside the active workspace.',
    version: '1.0.0',
    group: 'workspace', // <--- اضافه شد
  };

  public readonly inputSchema = createArgsSchema as unknown as z.ZodType<CreateArgs>;

  public async execute(args: CreateArgs): Promise<CallToolResult> {
    try {
      const guard = workspaceManager.getGuard();
      const safePath = await guard.assertInsideWorkspace(args.filePath);

      // بررسی وجود نداشتن فایل برای جلوگیری از بازنویسی تصادفی
      try {
        await fs.access(safePath);
        return {
          content: [{ type: 'text', text: `❌ File already exists: ${args.filePath}. Use workspace_apply_patch or workspace_write_file to modify it.` }],
          isError: true,
        };
      } catch (error: any) {
        if (error.code !== 'ENOENT') throw error;
      }

      // اطمینان از وجود دایرکتوری والد
      const dir = path.dirname(safePath);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(safePath, args.content, 'utf-8');

      return {
        content: [{ type: 'text', text: `✅ File created successfully at: ${args.filePath}` }],
        isError: false,
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `❌ Failed to create file: ${error.message}` }],
        isError: true,
      };
    }
  }
}