export type ToolSubGroup =
  | 'file-read'
  | 'file-write'
  | 'file-full'
  | 'terminal'
  // | 'web';  بعدا استفاده میشود 

export interface RoutingContext {
  sessionId: string;
  activeWorkspace?: string;
  lastGroup?: ToolSubGroup;
  recentTools: string[];
}