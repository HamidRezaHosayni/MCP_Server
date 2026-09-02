import { z } from 'zod';
import { Tool, ToolMetadata } from '../../shared/types.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { workspaceManager } from '../../workspace/WorkspaceManager.js';
import fs from 'fs/promises';
import crypto from 'crypto';

const patchArgsSchema = z.object({
  filePath: z.string().min(1, 'File path is required'),
  expectedContent: z.string().min(1, 'Expected content to find is required'),
  replacement: z.string(),
  contextLines: z.number().min(0).max(10).optional().default(2)
    .describe('Number of surrounding lines to include for uniqueness verification'),
  dryRun: z.boolean().optional().default(false)
    .describe('If true, only show what would change without applying it'),
  expectedHash: z.string().optional()
    .describe('SHA-256 hash of the file content for optimistic concurrency'),
});

type PatchArgs = z.infer<typeof patchArgsSchema>;

export class WorkspacePatchTool implements Tool<PatchArgs> {
  public readonly metadata: ToolMetadata = {
    name: 'workspace_apply_patch',
    description: 'Safely applies a precise patch to a file. Supports dry-run mode.',
    version: '2.0.0',
    group: 'workspace', // <--- اضافه شد
  };

  public readonly inputSchema = patchArgsSchema as unknown as z.ZodType<PatchArgs>;

  public async execute(args: PatchArgs): Promise<CallToolResult> {
    try {
      const guard = workspaceManager.getGuard();
      const safePath = await guard.assertInsideWorkspace(args.filePath);
      
      const currentContent = await fs.readFile(safePath, 'utf-8');
      const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');

      // ۱. بررسی Optimistic Concurrency با Hash
      if (args.expectedHash && args.expectedHash !== currentHash) {
        return {
          content: [{ 
            type: 'text', 
            text: `❌ PATCH_REJECTED: HASH_MISMATCH\n\nThe file has been modified since you last read it.\nExpected Hash: ${args.expectedHash}\nCurrent Hash: ${currentHash}\n\nPlease re-read the file and try again.` 
          }],
          isError: true,
        };
      }

      // ۲. بررسی وجود دقیق و یکتای محتوا
      const firstIndex = currentContent.indexOf(args.expectedContent);
      if (firstIndex === -1) {
        return {
          content: [{ 
            type: 'text', 
            text: `❌ PATCH_REJECTED: CONTENT_NOT_FOUND\n\nThe expected content was not found in the file.\n\nFile: ${args.filePath}\nExpected Content Length: ${args.expectedContent.length} characters\n\nPlease re-read the file and ensure your expectedContent exactly matches the current content.` 
          }],
          isError: true,
        };
      }

      const lastIndex = currentContent.lastIndexOf(args.expectedContent);
      if (firstIndex !== lastIndex) {
        // شمارش تعداد تکرار
        const occurrences = (currentContent.match(new RegExp(args.expectedContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        return {
          content: [{ 
            type: 'text', 
            text: `❌ PATCH_REJECTED: AMBIGUOUS_MATCH\n\nThe expected content appears ${occurrences} times in the file.\n\nPlease provide more surrounding context (use contextLines parameter) to make the match unique.\n\nTip: Include 2-3 lines before and after your target content.` 
          }],
          isError: true,
        };
      }

      // ۳. نمایش پیش‌نمایش تغییرات
      const newContent = currentContent.replace(args.expectedContent, args.replacement);
      const newHash = crypto.createHash('sha256').update(newContent).digest('hex');
      
      const oldLines = args.expectedContent.split('\n').length;
      const newLines = args.replacement.split('\n').length;
      const linesChanged = newLines - oldLines;

      const preview = [
        `📋 Patch Preview for: ${args.filePath}`,
        `─`.repeat(50),
        `Current Hash: ${currentHash.substring(0, 12)}...`,
        `New Hash: ${newHash.substring(0, 12)}...`,
        `Lines Change: ${linesChanged > 0 ? '+' : ''}${linesChanged}`,
        `─`.repeat(50),
        ``,
        `🔴 REMOVING (${oldLines} lines):`,
        `─`.repeat(50),
        args.expectedContent,
        ``,
        ` ADDING (${newLines} lines):`,
        `─`.repeat(50),
        args.replacement,
      ].join('\n');

      // ۴. اگر dryRun است، فقط پیش‌نمایش را برگردان
      if (args.dryRun) {
        return {
          content: [{ 
            type: 'text', 
            text: ` DRY RUN - No changes applied\n\n${preview}\n\nTo apply this patch, call again with dryRun: false` 
          }],
          isError: false,
        };
      }

      // ۵. اعمال Patch
      await fs.writeFile(safePath, newContent, 'utf-8');

      return {
        content: [{ 
          type: 'text', 
          text: `✅ PATCH_APPLIED_SUCCESSFULLY\n\n${preview}\n\nFile updated successfully.` 
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
        content: [{ type: 'text', text: `❌ Failed to apply patch: ${error.message}` }],
        isError: true,
      };
    }
  }
}