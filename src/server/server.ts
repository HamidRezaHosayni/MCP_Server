import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ToolRegistry } from '../registry/ToolRegistry.js';
import { SessionToolRegistry } from '../registry/SessionToolRegistry.js';
import { RequestToolsMetaTool } from '../tools/meta/request-tools.js';
import { CapabilityRegistry } from '../capability/CapabilityRegistry.js';
import { DocumentationManager } from '../documentation/DocumentationManager.js';
import { logger } from '../logger/JsonLogger.js';

export class MCPServer {
  private server: Server;
  private sessionRegistry: SessionToolRegistry;
  private globalRegistry: ToolRegistry;
  private capabilityRegistry: CapabilityRegistry;
  private documentationManager: DocumentationManager;
  private metaTool: RequestToolsMetaTool;
  private readonly sessionId = 'default-session';

  constructor(globalRegistry: ToolRegistry) {
    this.globalRegistry = globalRegistry;
    this.sessionRegistry = new SessionToolRegistry(globalRegistry);
    this.capabilityRegistry = new CapabilityRegistry();
    this.documentationManager = new DocumentationManager();

    this.server = new Server(
      { name: 'personal-mcp-toolkit', version: '1.0.0' },
      { 
        capabilities: { 
          tools: { listChanged: true },
          resources: {}  // اعلام پشتیبانی از Resources
        } 
      }
    );

    // ساخت Meta-Tool با تزریق وابستگی‌ها
    this.metaTool = new RequestToolsMetaTool(
      this.sessionRegistry,
      this.sessionId,
      () => this.notifyToolsChanged()
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // ===== Tool Handlers =====
    
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const sessionTools = this.sessionRegistry.getSessionTools(this.sessionId);
      
      const metaToolDefinition = {
        name: this.metaTool.metadata.name,
        description: this.metaTool.metadata.description,
        inputSchema: this.metaTool.inputSchema,
      };
      
      const allTools = [...sessionTools, metaToolDefinition];
      
      logger.info('Serving session tools', { 
        sessionId: this.sessionId,
        count: allTools.length,
        toolNames: allTools.map(t => t.name).join(', ')
      });
      
      return { tools: allTools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      logger.info('BLACKBOX: Incoming Tool Call Attempt', {
        toolName: name,
        arguments: args,
        timestamp: new Date().toISOString()
      });

      if (name === 'workspace_request_tools') {
        try {
          return await this.metaTool.execute(args as any);
        } catch (error: any) {
          logger.error('Meta-tool execution failed', { error: error.message });
          return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
        }
      }

      const tool = this.globalRegistry.get(name);

      if (!tool) {
        logger.error('BLACKBOX: Tool requested but NOT FOUND in registry', { toolName: name });
        return { 
          content: [{ type: 'text', text: `Error: Tool '${name}' is not available or not recognized.` }], 
          isError: true 
        };
      }

      try {
        logger.info('BLACKBOX: Executing tool', { toolName: name });
        return await tool.execute(args as any);
      } catch (error: any) {
        logger.error(`BLACKBOX: Tool execution failed: ${name}`, { error: error.message });
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    });

    // ===== Resource Handlers =====

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const resources: any[] = [];

      // ۱. اضافه کردن Indexهای داینامیک برای هر دسته‌بندی (مثلاً security://docs, linux://docs)
      const categories = new Set<string>();
      for (const doc of this.documentationManager.listMetadata()) {
        const category = doc.uri.split('://')[0];
        categories.add(category);
      }

      for (const category of categories) {
        resources.push({
          uri: `${category}://docs`,
          name: `${category.charAt(0).toUpperCase() + category.slice(1)} Documentation Index`,
          description: `List of all available ${category} tool documentations`,
          mimeType: 'application/json'
        });
      }

      // ۲. اضافه کردن تمام داکیومنت‌های تکی
      const docMetadata = this.documentationManager.listMetadata();
      for (const doc of docMetadata) {
        resources.push({
          uri: doc.uri,
          name: doc.title,
          description: `Documentation for ${doc.title} (${doc.uri.split('://')[0]})`,
          mimeType: 'text/markdown'
        });
      }

      // ۳. اضافه کردن Capability Index (اگر هنوز استفاده می‌کنید)
      resources.push({
        uri: 'capability://index',
        name: 'Capability Index',
        description: 'List of all available capabilities',
        mimeType: 'text/plain'
      });

      const capUris = this.capabilityRegistry.getAllUris();
      for (const uri of capUris) {
        const cap = this.capabilityRegistry.getByUri(uri);
        resources.push({
          uri,
          name: cap?.name || uri,
          description: cap?.description || '',
          mimeType: 'text/plain'
        });
      }

      logger.info('Serving resources list', {
        count: resources.length,
        uris: resources.map(r => r.uri).join(', ')
      });

      return { resources };
    });

    
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      logger.info('Reading resource', { uri });

      // ۱. مدیریت Security Documentation Index
      if (uri === 'security://docs') {
        const docsList = this.documentationManager.listMetadata();
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({ documents: docsList }, null, 2)
          }]
        };
      }

      // ۲. مدیریت Individual Security Documentation
      const doc = this.documentationManager.getByUri(uri);
      if (doc) {
        return {
          contents: [{
            uri,
            mimeType: 'text/markdown',
            text: doc.content
          }]
        };
      }

      // ۳. مدیریت Capability Index
      if (uri === 'capability://index') {
        const content = this.capabilityRegistry.getIndexContent();
        return {
          contents: [{
            uri,
            mimeType: 'text/plain',
            text: content
          }]
        };
      }

      // ۴. مدیریت Individual Capability
      const cap = this.capabilityRegistry.getByUri(uri);
      if (cap) {
        const content = this.capabilityRegistry.getCapabilityContent(cap.id);
        if (!content) {
          throw new Error(`Failed to generate content for: ${uri}`);
        }
        return {
          contents: [{
            uri,
            mimeType: 'text/plain',
            text: content
          }]
        };
      }

      // اگر هیچ‌کدام مطابقت نداشت
      logger.warn('Resource not found', { uri });
      throw new Error(`Resource not found: ${uri}`);
    });
  }

  private notifyToolsChanged(): void {
    this.server.notification({
      method: "notifications/tools/list_changed"
    });
    logger.info('Sent tools/list_changed notification to client');
  }

  public async start(): Promise<void> {
    // بارگذاری داینامیک داکیومنت‌ها قبل از شروع سرور
    await this.documentationManager.initialize();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('MCP Server started and connected to stdio');
  }
}