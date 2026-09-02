import { Tool, ToolGroup } from '../shared/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  public register(tool: Tool): void {
    if (this.tools.has(tool.metadata.name)) {
      throw new Error(`Tool '${tool.metadata.name}' is already registered.`);
    }
    this.tools.set(tool.metadata.name, tool);
  }

  public get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  public getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  public getByGroup(group: ToolGroup): Tool[] {
    return this.getAll().filter(tool => tool.metadata.group === group);
  }

  public getByGroups(groups: ToolGroup[]): Tool[] {
    return this.getAll().filter(tool => groups.includes(tool.metadata.group));
  }

  public getMcpToolsList(): McpToolDefinition[] {
    return this.getAll().map(tool => ({
      name: tool.metadata.name,
      description: tool.metadata.description,
      inputSchema: zodToJsonSchema(tool.inputSchema) as Record<string, unknown>,
    }));
  }

  public getFilteredMcpToolsList(activeGroups: ToolGroup[]): McpToolDefinition[] {
    return this.getByGroups(activeGroups).map(tool => ({
      name: tool.metadata.name,
      description: tool.metadata.description,
      inputSchema: zodToJsonSchema(tool.inputSchema) as Record<string, unknown>,
    }));
  }
}