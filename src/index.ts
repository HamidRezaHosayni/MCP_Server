import 'dotenv/config';

import { ToolRegistry } from './registry/ToolRegistry.js';
import { MCPServer } from './server/server.js';
import { logger } from './logger/JsonLogger.js';

import { createTerminalTool } from './tools/terminal/index.js';
import { 
  WorkspaceSelectTool, WorkspaceInfoTool, WorkspaceListTool, 
  WorkspaceReadTool, WorkspacePatchTool, WorkspaceCreateFileTool, 
  WorkspaceDeleteTool, WorkspaceTerminalTool 
} from './tools/workspace/index.js';
import { AgentStateTool } from './tools/agent-state/AgentStateTool.js'; // <--- فقط این ایمپورت اضافه شد
// import { WebSearchTool } from './tools/web-search/index.js';  // این بعدا استفاده میشود فقط اینجا کامنت شده است 

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception in process', { error: error.message });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection in process', { reason: String(reason) });
  process.exit(1);
});

async function main(): Promise<void> {
  try {
    logger.info('Starting Personal MCP Toolkit', { tool: 'system' });

    const globalRegistry = new ToolRegistry();
    
    // ابزار ترمینال سیستمی
    globalRegistry.register(createTerminalTool());

    // ابزارهای Workspace
    globalRegistry.register(new WorkspaceSelectTool());
    globalRegistry.register(new WorkspaceInfoTool());
    globalRegistry.register(new WorkspaceListTool());
    globalRegistry.register(new WorkspaceReadTool());
    globalRegistry.register(new WorkspacePatchTool());
    globalRegistry.register(new WorkspaceCreateFileTool());
    globalRegistry.register(new WorkspaceDeleteTool());
    globalRegistry.register(new WorkspaceTerminalTool());

    // ابزار مدیریت وضعیت Agent (اضافه شده بدون تغییر در بقیه ساختار)
    globalRegistry.register(new AgentStateTool(process.cwd()));

    // ابزار Web Search  این مورد برای ابزار سرچ هست و بعدا استفاده میشود 
    // globalRegistry.register(new WebSearchTool());

    const server = new MCPServer(globalRegistry);
    await server.start();

    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start MCP Server', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

main();