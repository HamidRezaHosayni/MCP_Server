import { z } from 'zod';
import { Tool, ToolMetadata } from '../../shared/types.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { workspaceManager } from '../../workspace/WorkspaceManager.js';
import { approvalManager } from '../../approval/ApprovalManager.js';
import fs from 'fs/promises';
import { logger } from '../../logger/JsonLogger.js';

const deleteArgsSchema = z.object({
  targetPath: z.string().min(1, 'Target path is required'),
  isDirectory: z.boolean().default(false),
  reason: z.string().min(10, 'Reason must be at least 10 characters')
    .describe('Explanation of why this file/directory should be deleted'),
});

type DeleteArgs = z.infer<typeof deleteArgsSchema>;

export class WorkspaceDeleteTool implements Tool<DeleteArgs> {
 public readonly metadata: ToolMetadata = {
    name: 'workspace_delete',
    description: 'Deletes a file or directory inside the active workspace. Requires user approval.',
    version: '2.0.0',
    group: 'workspace',
  };

  public readonly inputSchema = deleteArgsSchema as unknown as z.ZodType<DeleteArgs>;

  public async execute(args: DeleteArgs): Promise<CallToolResult> {
    try {
      const guard = workspaceManager.getGuard();
      const safePath = await guard.assertInsideWorkspace(args.targetPath);

      // بررسی وجود فایل/دایرکتوری
      let stats;
      try {
        stats = await fs.stat(safePath);
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          return {
            content: [{ type: 'text', text: `⚠️ Target does not exist: ${args.targetPath}` }],
            isError: false,
          };
        }
        throw error;
      }

      const type = stats.isDirectory() ? 'Directory' : 'File';
      const size = stats.isDirectory() ? '(directory)' : `${stats.size} bytes`;

      // نمایش پیام تایید در GUI
      const approvalMessage = [
        `️ حذف ${type} در Workspace`,
        ``,
        `مسیر: ${args.targetPath}`,
        `اندازه: ${size}`,
        ``,
        `دلیل حذف:`,
        `${args.reason}`,
        ``,
        `آیا از حذف این مورد اطمینان دارید؟`,
      ].join('\n');

      logger.info('Delete approval requested', { 
        path: args.targetPath, 
        type, 
        reason: args.reason 
      });

      const approved = await approvalManager.askPermission(approvalMessage);

      if (!approved) {
        logger.warn('Delete operation canceled by user', { path: args.targetPath });
        return {
          content: [{ 
            type: 'text', 
            text: `❌ Delete operation CANCELED by user.\n\nThe ${type.toLowerCase()} was NOT deleted.` 
          }],
          isError: false,
        };
      }

      // اعمال حذف
      if (args.isDirectory) {
        await fs.rm(safePath, { recursive: true, force: true });
      } else {
        await fs.unlink(safePath);
      }

      logger.info('Delete operation completed', { 
        path: args.targetPath, 
        type,
        reason: args.reason 
      });

      return {
        content: [{ 
          type: 'text', 
          text: `✅ Successfully deleted ${type.toLowerCase()}: ${args.targetPath}\n\nReason: ${args.reason}` 
        }],
        isError: false,
      };

    } catch (error: any) {
      logger.error('Delete operation failed', { 
        path: args.targetPath, 
        error: error.message 
      });
      return {
        content: [{ type: 'text', text: `❌ Failed to delete: ${error.message}` }],
        isError: true,
      };
    }
  }
}