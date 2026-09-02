import { SandboxConfig, SandboxResult } from './types.js';

export interface SandboxProvider {
  execute(config: SandboxConfig): Promise<SandboxResult>;
}