import path from 'node:path';

export class WorkspacePolicy {
  private static readonly FORBIDDEN_COMMANDS = new Set([
    'shutdown', 'reboot', 'poweroff', 'halt', 'init',
    'mkfs', 'format', 'userdel', 'usermod', 'passwd',
    'mount', 'umount', 'iptables', 'ufw', 'firewall-cmd',
    'sudo', 'su', 'pkexec'
  ]);

  private static readonly FORBIDDEN_PATTERNS = [
    /rm\s+-rf\s+\//,
    /dd\s+if=.*of=\/dev\//,
    /chmod\s+-R\s+777\s+\//,
    /:\(\)\s*\{\s*:\|:\s*&\s*\}\s*;/, // Fork bomb
    /\b(wget|curl)\s+.*\|\s*(sh|bash)\b/i // Pipe download to shell
  ];

  public static validate(command: string): { allowed: boolean; reason?: string } {
    const trimmed = command.trim();
    if (!trimmed) return { allowed: false, reason: 'Empty command' };

    // استخراج نام دستور اصلی
    const cmdMatch = trimmed.match(/^(?:[A-Za-z_][A-Za-z0-9_]*=[^\s]*\s+)*([^\s]+)/);
    const baseCmd = cmdMatch ? cmdMatch[1].toLowerCase() : trimmed.split(/\s+/)[0].toLowerCase();
    
    // حذف مسیر اگر وجود دارد
    const cmdName = path.basename(baseCmd);

    if (this.FORBIDDEN_COMMANDS.has(cmdName)) {
      return { allowed: false, reason: `Command '${cmdName}' is forbidden in workspace.` };
    }

    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(trimmed)) {
        return { allowed: false, reason: 'Command matches forbidden security pattern.' };
      }
    }

    return { allowed: true };
  }
}