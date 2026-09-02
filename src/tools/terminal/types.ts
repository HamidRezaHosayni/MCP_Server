export interface TerminalCommandArgs {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTime: number;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}