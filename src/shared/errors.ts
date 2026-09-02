export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}


// اضافه شدن به انتهای فایل
export const WorkspaceErrorCodes = {
  WORKSPACE_NOT_SELECTED: 'WORKSPACE_NOT_SELECTED',
  WORKSPACE_NOT_FOUND: 'WORKSPACE_NOT_FOUND',
  PATH_OUTSIDE_WORKSPACE: 'PATH_OUTSIDE_WORKSPACE',
  SYMLINK_ESCAPE: 'SYMLINK_ESCAPE',
  COMMAND_REJECTED: 'COMMAND_REJECTED',
  COMMAND_TIMEOUT: 'COMMAND_TIMEOUT',
} as const;