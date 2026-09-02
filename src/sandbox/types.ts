export interface SandboxConfig {
  command: string;
  cwd: string;
  env?: Record<string, string>;
  timeout?: number;
  maxOutputSize?: number;
}

export interface SandboxResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTime: number;
  timedOut: boolean;
}