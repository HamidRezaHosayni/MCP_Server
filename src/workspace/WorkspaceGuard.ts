import { PathResolver } from './PathResolver.js';
import { AppError } from '../shared/errors.js';
import { WorkspaceErrorCodes } from '../shared/errors.js';
import path from 'path';

export class WorkspaceGuard {
  private readonly resolver: PathResolver;
  private readonly rootRealPath: string;

  constructor(workspaceRoot: string) {
    this.resolver = new PathResolver(workspaceRoot);
    this.rootRealPath = workspaceRoot; // فرض بر این است که root خودش resolve شده است
  }

  public async assertInsideWorkspace(userPath: string): Promise<string> {
    const resolved = await this.resolver.resolve(userPath);
    
    const normalizedResolved = path.normalize(resolved);
    const normalizedRoot = path.normalize(this.rootRealPath);

    // بررسی دقیق پیشوند برای جلوگیری از فرار
    if (normalizedResolved !== normalizedRoot && 
        !normalizedResolved.startsWith(normalizedRoot + path.sep)) {
      throw new AppError(
        WorkspaceErrorCodes.PATH_OUTSIDE_WORKSPACE, 
        `Path '${userPath}' resolves outside workspace boundary.`
      );
    }
    
    return normalizedResolved;
  }
}