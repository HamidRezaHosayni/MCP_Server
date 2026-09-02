import path from 'path';
import fs from 'fs/promises';

export class PathResolver {
  constructor(private readonly workspaceRoot: string) {}

  public async resolve(userPath: string): Promise<string> {
    // 1. Resolve relative to workspace root
    const resolved = path.resolve(this.workspaceRoot, userPath);
    let current = resolved;
    
    // 2. Find the first existing ancestor to handle non-existing files safely
    while (current !== path.dirname(current)) {
      try {
        const realAncestor = await fs.realpath(current);
        const relative = path.relative(current, resolved);
        return path.join(realAncestor, relative);
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          current = path.dirname(current);
        } else {
          throw error;
        }
      }
    }
    return resolved;
  }
}