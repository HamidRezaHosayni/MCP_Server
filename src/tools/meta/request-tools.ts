import { z } from 'zod';
import { Tool, ToolMetadata } from '../../shared/types.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { SessionToolRegistry } from '../../registry/SessionToolRegistry.js';
import { CapabilityRegistry } from '../../capability/CapabilityRegistry.js';
import { logger } from '../../logger/JsonLogger.js';

// ایجاد نمونه Registry برای دسترسی به لیست IDها و توضیحات
const capabilityRegistry = new CapabilityRegistry();
const validCapabilityIds = capabilityRegistry.getAllIds() as [string, ...string[]];

// استفاده از z.enum برای مجبور کردن مدل به انتخاب دقیقاً یکی از IDهای معتبر
const requestToolsSchema = z.object({
  selected_capability_id: z.enum(validCapabilityIds)
    .describe('You MUST choose the EXACT ID of the capability you need from the available list.'),
  reason: z.string().min(10).describe('Why you need this capability based on the user request.')
});

type RequestToolsArgs = z.infer<typeof requestToolsSchema>;

export class RequestToolsMetaTool implements Tool<RequestToolsArgs> {
    public readonly metadata: ToolMetadata = {
    name: 'workspace_request_tools',
    description: `CRITICAL INSTRUCTION: Use this tool ONLY when you need a capability that is NOT in your current tool list. 

        AVAILABLE CAPABILITIES TO UNLOCK:
        1. "web-search": Unlocks the 'web_search' tool. Use this when the user asks to search the internet.
        2. "terminal-execution": Unlocks shell command execution.
        3. "full-file-access": Unlocks complete file system operations.

        HOW TO USE (STRICT):
        You MUST call THIS tool (workspace_request_tools) with the following exact JSON arguments.
        DO NOT try to call "web-search" or "google_search" directly as a tool. Call THIS tool first to unlock them.

        ${capabilityRegistry.getCapabilitiesPrompt()}

        Example JSON arguments you MUST provide:
        {
          "selected_capability_id": "web-search",
          "reason": "The user explicitly asked me to search the internet for information about Security Engineering."
        }

        📚 SECURITY DOCUMENTATION ACCESS:
        If you need documentation for security tools (like ffuf, nuclei, sqlmap, etc.), use the MCP Resource system:
        1. Call \`list_resources\` to see available resources
        2. Look for URIs starting with \`security://docs\`
        3. Call \`read_resource\` with the URI (e.g., \`security://docs/ffuf\`) to read the documentation
        4. The documentation will guide you on how to use the CLI tool via \`workspace_terminal_execute\``,
        version: '1.0.0',
        group: 'system',
      };

  public readonly inputSchema = requestToolsSchema as unknown as z.ZodType<RequestToolsArgs>;

  constructor(
    private sessionRegistry: SessionToolRegistry,
    private sessionId: string,
    private notifyToolsChanged: () => void
  ) {}

  public async execute(args: RequestToolsArgs): Promise<CallToolResult> {
    try {
      const capability = capabilityRegistry.getById(args.selected_capability_id);

      if (!capability) {
        // این خط به دلیل z.enum هرگز نباید اجرا شود، اما برای ایمنی است
        return {
          content: [{ type: 'text', text: `❌ Invalid capability ID: ${args.selected_capability_id}` }],
          isError: true,
        };
      }

      // فعال‌سازی گروه
      this.sessionRegistry.addGroupToSession(this.sessionId, capability.internalGroup);
      this.notifyToolsChanged();

      logger.info('Capability granted via Model Selection', {
        selectedId: args.selected_capability_id,
        grantedGroup: capability.internalGroup,
        tools: capability.tools.join(', '),
        reason: args.reason
      });

      return {
        content: [{ 
          type: 'text', 
          text: `✅ CAPABILITY GRANTED: "${capability.name}" is now active.\n\n` +
                `⚠️ CRITICAL INSTRUCTION FOR AGENT: You MUST STOP generating right now. ` +
                `Do NOT attempt to call the newly unlocked tools in this current response. ` +
                `Wait for the system to update your tool list. ` +
                `In your NEXT turn, you will be able to use: [ ${capability.tools.join(', ')} ].`
        }],
        isError: false,
      };
      
    } catch (error: any) {
      logger.error('Capability request failed', { error: error.message });
      return {
        content: [{ type: 'text', text: `❌ Internal Error: ${error.message}` }],
        isError: true,
      };
    }
  }
}