export interface ApprovalProvider {
  isAvailable(): Promise<boolean>;
  askPermission(message: string): Promise<boolean>;
}