import { WorkspaceGuard } from './WorkspaceGuard.js';
import { AppError } from '../shared/errors.js';
import { WorkspaceErrorCodes } from '../shared/errors.js';
import fs from 'fs/promises';
import path from 'path';

export interface WorkspaceSession {
  id: string;
  root: string;
  name: string;
  createdAt: string;
}

export class WorkspaceManager {
  private activeSession: WorkspaceSession | null = null;
  private guard: WorkspaceGuard | null = null;

  public async selectWorkspace(rootPath: string): Promise<WorkspaceSession> {
    let realRoot: string;
    try {
      const stat = await fs.stat(rootPath);
      if (!stat.isDirectory()) {
        throw new AppError(WorkspaceErrorCodes.WORKSPACE_NOT_FOUND, 'Path is not a directory');
      }
      realRoot = await fs.realpath(rootPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(rootPath, { recursive: true });
        realRoot = await fs.realpath(rootPath);
      } else {
        throw error;
      }
    }

    this.activeSession = {
      id: `ws_${Date.now()}`,
      root: realRoot,
      name: path.basename(realRoot),
      createdAt: new Date().toISOString()
    };
    this.guard = new WorkspaceGuard(realRoot);
    return this.activeSession;
  }

  public getGuard(): WorkspaceGuard {
    if (!this.guard) throw new AppError(WorkspaceErrorCodes.WORKSPACE_NOT_SELECTED, 'No workspace selected');
    return this.guard;
  }

  public getSession(): WorkspaceSession {
    if (!this.activeSession) throw new AppError(WorkspaceErrorCodes.WORKSPACE_NOT_SELECTED, 'No workspace selected');
    return this.activeSession;
  }
}

export const workspaceManager = new WorkspaceManager();