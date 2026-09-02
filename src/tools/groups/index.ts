import { ToolSubGroup } from '../../router/types.js';

export const TOOL_GROUPS: Record<ToolSubGroup, string[]> = {
  'file-read': ['workspace_get_info', 'workspace_list', 'workspace_read_file'],
  'file-write': ['workspace_create_file', 'workspace_apply_patch', 'workspace_delete'],
  'file-full': [
    'workspace_select', 'workspace_get_info', 'workspace_list', 
    'workspace_read_file', 'workspace_create_file', 'workspace_apply_patch', 'workspace_delete',
    'agent_state' // <--- فقط این خط اضافه شد
  ],
  'terminal': ['workspace_terminal_execute'],
  // 'web': ['web_search'], // بعدا استفاده میشود  
};

export const CORE_TOOLS = [
  'workspace_request_tools',
  'workspace_select',
  'workspace_get_info'
];