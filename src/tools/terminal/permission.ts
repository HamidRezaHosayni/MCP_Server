import { approvalManager } from '../../approval/ApprovalManager.js';
import { logger } from '../../logger/JsonLogger.js';

export class PermissionManager {
  public async checkPermission(command: string, args: string[]): Promise<void> {
    const fullCommand = `${command} ${args.join(' ')}`.trim();
    logger.warn('Permission requested for command', { command: fullCommand });

    try {
      const approved = await approvalManager.askPermission(
        `اجرای دستور زیر تایید شود؟\n\n🔹 دستور: ${fullCommand}`
      );
      
      if (!approved) {
        throw new Error(`APPROVAL_DENIED: User canceled the execution of command: ${fullCommand}`);
      }
      logger.info('Permission granted via GUI', { command: fullCommand });
    } catch (error: any) {
      if (error.message && error.message.startsWith('APPROVAL_DENIED')) throw error;
      throw new Error(`APPROVAL_REQUIRED: No graphical dialog tool found.`);
    }
  }
}