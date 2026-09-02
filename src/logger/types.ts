import { any } from "zod/v4";

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  tool?: string;
  message: string;
  command?: string;
  exitCode?: number | null;
  executionTime?: number;
  error?: string;
  reason?: string;
  type?: string;
  
  url?: string;
  urls?: string[];
  uri?: string;        // <--- این خط را اضافه کنید (برای URI تک Resource)
  uris?: string;       // <--- این خط را اضافه کنید (برای لیست URIها در لاگ)
  outputPath?: string;
  stderr?: string;
  stdout?: string;
  toolDir?: string;
  filesCount?: number;
  
  path?: string;
  sessionId?: string;
  workspace?: string;

  // فیلدهای آنالیز Phase 1 و 2
  totalTools?: number;
  totalSizeBytes?: number;
  activeTools?: number;
  activeGroups?: string;
  filteredSizeBytes?: number;
  reductionPercentage?: string;
  
  count?: number;
  groups?: string;

  //  (Diagnostic)
  phase?: string;
  event?: string;
  toolName?: string;
  toolNames?: string; 
  totalRegisteredTools?: number;
  filteredToolsCount?: number;
  toolsExposedCount?: number;
  filteredToolNames?: string;
  allToolNames?: string;
  toolsExposedNames?: string;


 // WEB SEARCH 
  query?: string;
  maxResults?: number;
  totalResults?: number;
  successfulResults?: number;
  requestedResults?: number; 
  totalFound?: number;       
  hasApiKey?: boolean;
  hasCx?: boolean;
  status?: number;
  returned?:any;
  instance?:any;


  //  Duplicate Detector
  duplicateCount?: number;
  remainingParagraphs?: number;
  paragraphLength?: number;
  
  //  Content Limiter
  totalTextChars?: number;
  totalCodeBlocks?: number;
  totalCodeChars?: number;
  originalLength?: number;
  truncatedLength?: number;
  maxTextLimit?: number;
  maxCodeBlocks?: number;
  maxCodeChars?: number;

  apiKeyStart?:string;
  currentWorkingDirectory?:string;
  arguments?:any;

  //Capability Discovery - PHASE 12
  requested?: string;
  capability?: string;
  granted?: string;
  tools?: string;
  highestScore?: number;
  resolved?: string;
  confidence?: number;
  selectedId?: string;      // <--- این خط را اضافه کنید
  grantedGroup?: string;    // <--- این خط را هم اضافه کنید


  // Documentation Manager
  directory?: string;  // <--- اضافه شد
  id?: string;         // <--- اضافه شد
  file?: string;       // <--- اضافه شد
  title?: string; 
  filePath?: string;  
  category?: string;        // <--- این خط اضافه شد
  totalDocuments?: number;   
  categories?: number; 


    // فیلدهای جدید برای مدیریت وضعیت Agent
  taskId?: string;
  taskType?: string;
  agentStatus?: string;
  step?: string;


}