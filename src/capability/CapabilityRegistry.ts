import { Capability } from './types.js';

export class CapabilityRegistry {
  private capabilities: Map<string, Capability> = new Map();

  constructor() {
    this.registerDefaultCapabilities();
  }

  private registerDefaultCapabilities(): void {
    // this.register({
    //   id: 'web-search',
    //   uri: 'capability://web-search',
    //   name: 'Web Search',
    //   description: 'Search the web and extract clean text and code from relevant pages.',
    //   internalGroup: 'web',
    //   tools: ['web_search']
    // });

    this.register({
      id: 'terminal-execution',
      uri: 'capability://terminal-execution',
      name: 'Terminal Execution',
      description: 'Execute shell commands in the active workspace.',
      internalGroup: 'terminal',
      tools: ['workspace_terminal_execute']
    });

    this.register({
      id: 'full-file-access',
      uri: 'capability://full-file-access',
      name: 'Full File Access',
      description: 'Complete file system operations (read, write, delete, patch).',
      internalGroup: 'file-full',
      tools: [
        'workspace_select', 'workspace_get_info', 'workspace_list',
        'workspace_read_file', 'workspace_create_file',
        'workspace_apply_patch', 'workspace_delete'
      ]
    });
  }

  public register(capability: Capability): void {
    this.capabilities.set(capability.id, capability);
  }

  public getById(id: string): Capability | undefined {
    return this.capabilities.get(id);
  }

  public getByUri(uri: string): Capability | undefined {
    for (const cap of this.capabilities.values()) {
      if (cap.uri === uri) return cap;
    }
    return undefined;
  }

  public getAllIds(): string[] {
    return Array.from(this.capabilities.keys());
  }

  public getAllUris(): string[] {
    return Array.from(this.capabilities.values()).map(c => c.uri);
  }

  public getIndexContent(): string {
    const lines = ['Available Capabilities (Read capability://<id> for details):', ''];
    for (const cap of this.capabilities.values()) {
      lines.push(`- ${cap.id}: ${cap.name}`);
    }
    return lines.join('\n');
  }

  public getCapabilityContent(id: string): string | null {
    const cap = this.getById(id);
    if (!cap) return null;

    return [
      `ID: ${cap.id}`,
      `Name: ${cap.name}`,
      `Description: ${cap.description}`,
      `Tools Unlocked: ${cap.tools.join(', ')}`,
      '',
      'Usage: Call the `workspace_request_tools` tool with `selected_capability_id` set to this ID.'
    ].join('\n');
  }

  public getCapabilitiesPrompt(): string {
    const lines = ['Available Capabilities (You MUST reply with the exact ID):'];
    for (const cap of this.capabilities.values()) {
      lines.push(`- "${cap.id}": ${cap.description}`);
    }
    return lines.join('\n');
  }
}