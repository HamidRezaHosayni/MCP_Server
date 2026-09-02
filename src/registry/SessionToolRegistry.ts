import { ToolRegistry, McpToolDefinition } from './ToolRegistry.js';
import { TOOL_GROUPS, CORE_TOOLS } from '../tools/groups/index.js';
import { ToolSubGroup } from '../router/types.js';

export class SessionToolRegistry {
  private globalRegistry: ToolRegistry;
  private sessionGroups: Map<string, Set<ToolSubGroup>> = new Map();

  constructor(globalRegistry: ToolRegistry) {
    this.globalRegistry = globalRegistry;
    // مقداردهی اولیه برای session پیش‌فرض (در حالت stdio معمولاً یک session داریم)
    this.sessionGroups.set('default-session', new Set(['file-full', 'terminal']));
  }

  public setActiveGroups(sessionId: string, groups: ToolSubGroup[]): void {
    this.sessionGroups.set(sessionId, new Set(groups));
  }

  public addGroupToSession(sessionId: string, group: ToolSubGroup): void {
    const groups = this.sessionGroups.get(sessionId) || new Set();
    groups.add(group);
    this.sessionGroups.set(sessionId, groups);
  }

  public getSessionTools(sessionId: string): McpToolDefinition[] {
    const activeGroups = this.sessionGroups.get(sessionId) || new Set();
    const activeToolNames = new Set<string>(CORE_TOOLS);

    for (const group of activeGroups) {
      const toolsInGroup = TOOL_GROUPS[group] || [];
      toolsInGroup.forEach(name => activeToolNames.add(name));
    }

    const allTools = this.globalRegistry.getMcpToolsList();
    return allTools.filter(tool => activeToolNames.has(tool.name));
  }

  public clearSession(sessionId: string): void {
    this.sessionGroups.delete(sessionId);
  }
}