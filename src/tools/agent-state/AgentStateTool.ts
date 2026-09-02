import { z } from 'zod';
import { Tool, ToolMetadata } from '../../shared/types.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { AgentStateManager, AgentState } from './AgentStateManager.js';
import { logger } from '../../logger/JsonLogger.js';

const agentStateSchema = z.object({
  action: z.enum(['init', 'load', 'update', 'complete', 'clear'])
    .describe('Action to perform: init (create new), load (read existing), update (modify), complete (mark done), clear (delete)'),
  taskId: z.string().optional()
    .describe('Unique identifier for this task (required for init)'),
  taskType: z.string().optional()
    .describe('Type of task (e.g., "pentest", "recon", "scan", "build", "development")'),
  target: z.string().optional()
    .describe('Target URL, system, or project being worked on'),
  currentStep: z.string().optional()
    .describe('Current step being executed'),
  nextAction: z.string().optional()
    .describe('What should be done next'),
  status: z.enum(['running', 'completed', 'failed', 'paused']).optional()
    .describe('Overall status of the task'),
  completedStep: z.string().optional()
    .describe('Step that was just completed (for update action)'),
  output: z.string().optional()
    .describe('Output or result from the completed step')
});

type AgentStateArgs = z.infer<typeof agentStateSchema>;

export class AgentStateTool implements Tool<AgentStateArgs> {
  public readonly metadata: ToolMetadata = {
    name: 'agent_state',
    description: `Manage persistent state for long-running tasks. This tool allows you to save and resume work even if the connection is interrupted.

USE WHEN:
- Starting a multi-step task that might take a long time
- You need to save progress between steps
- Connection might be interrupted and you need to resume later
- Building a project, website, or application
- Running security tests or penetration tests

ACTIONS:
- init: Create a new task state (provide taskId, taskType, target)
- load: Read the current saved state
- update: Mark a step as completed and move to next step
- complete: Mark the entire task as completed
- clear: Delete the state file (use after task is fully done)

EXAMPLE WORKFLOW:
1. init with taskId="pentest-1", taskType="pentest", target="http://example.com"
2. Execute step 1 (e.g., install tool)
3. update with completedStep="installation", nextAction="run scan"
4. Execute step 2 (e.g., run scan)
5. update with completedStep="scan", nextAction="analyze results"
6. complete when all done

STATE IS SAVED IN: .agent/current_state.json`,
    version: '1.0.0',
    group: 'system',
  };

  public readonly inputSchema = agentStateSchema as unknown as z.ZodType<AgentStateArgs>;

  constructor(private workspacePath: string) {}

  public async execute(args: AgentStateArgs): Promise<CallToolResult> {
    try {
      const manager = new AgentStateManager(this.workspacePath);

      switch (args.action) {
        case 'init': {
          if (!args.taskId || !args.taskType) {
            return {
              content: [{ type: 'text', text: '❌ Error: taskId and taskType are required for init action' }],
              isError: true,
            };
          }

          const initialState: AgentState = {
            taskId: args.taskId,
            taskType: args.taskType,
            target: args.target,
            currentStep: args.currentStep || 'initialization',
            status: 'running',
            lastUpdate: new Date().toISOString(),
            completedSteps: [],
            nextAction: args.nextAction || 'Begin first step'
          };

          manager.saveState(initialState);

          return {
            content: [{ 
              type: 'text', 
              text: `✅ Task state initialized successfully.\n\nTask ID: ${args.taskId}\nType: ${args.taskType}\nTarget: ${args.target || 'N/A'}\nCurrent Step: ${initialState.currentStep}\n\nState saved to: .agent/current_state.json` 
            }],
            isError: false,
          };
        }

        case 'load': {
          const state = manager.loadState();
          
          if (!state) {
            return {
              content: [{ type: 'text', text: '⚠️ No saved state found. Use "init" action to create a new task.' }],
              isError: false,
            };
          }

          const summary = `📋 Current Task State:

Task ID: ${state.taskId}
Type: ${state.taskType}
Target: ${state.target || 'N/A'}
Status: ${state.status}
Current Step: ${state.currentStep}
Next Action: ${state.nextAction}

Completed Steps (${state.completedSteps.length}):
${state.completedSteps.map((s, i) => `${i + 1}. ${s}`).join('\n') || 'None yet'}

Last Update: ${state.lastUpdate}
${state.lastOutput ? `\nLast Output:\n${state.lastOutput}` : ''}`;

          return {
            content: [{ type: 'text', text: summary }],
            isError: false,
          };
        }

        case 'update': {
          if (!args.completedStep) {
            return {
              content: [{ type: 'text', text: '❌ Error: completedStep is required for update action' }],
              isError: true,
            };
          }

          manager.addCompletedStep(args.completedStep, args.output);
          
          if (args.currentStep && args.nextAction) {
            manager.setCurrentStep(args.currentStep, args.nextAction);
          }

          return {
            content: [{ 
              type: 'text', 
              text: `✅ Step completed and state updated.\n\nCompleted: ${args.completedStep}\n${args.currentStep ? `Now at: ${args.currentStep}` : ''}\n${args.nextAction ? `Next: ${args.nextAction}` : ''}` 
            }],
            isError: false,
          };
        }

        case 'complete': {
          manager.setStatus('completed');
          
          return {
            content: [{ 
              type: 'text', 
              text: '✅ Task marked as completed. State file preserved for reference.\n\nUse "clear" action to delete the state file when no longer needed.' 
            }],
            isError: false,
          };
        }

        case 'clear': {
          manager.clearState();
          
          return {
            content: [{ 
              type: 'text', 
              text: '✅ State file cleared successfully.' 
            }],
            isError: false,
          };
        }

        default:
          return {
            content: [{ type: 'text', text: `❌ Unknown action: ${args.action}` }],
            isError: true,
          };
      }

    } catch (error: any) {
      logger.error('agent_state tool failed', { error: error.message });
      return {
        content: [{ type: 'text', text: `❌ Error: ${error.message}` }],
        isError: true,
      };
    }
  }
}