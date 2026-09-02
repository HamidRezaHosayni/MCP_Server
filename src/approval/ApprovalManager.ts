import { ApprovalProvider } from './ApprovalProvider.js';
import { ZenityProvider } from './ZenityProvider.js';
// import { YadProvider } from './YadProvider.js';
// import { KDialogProvider } from './KDialogProvider.js';

export class ApprovalManager {
  private provider: ApprovalProvider | null = null;

  constructor() {
    this.detectProvider();
  }

  private async detectProvider(): Promise<void> {
    const providers = [new ZenityProvider()]; // اضافه کردن Yad و KDialog در آینده
    for (const p of providers) {
      if (await p.isAvailable()) {
        this.provider = p;
        return;
      }
    }
  }

  public async askPermission(message: string): Promise<boolean> {
    if (!this.provider) {
      // تلاش مجدد برای تشخیص اگر بار اول شکست خورد
      await this.detectProvider();
      if (!this.provider) return false;
    }
    return this.provider.askPermission(message);
  }
}

export const approvalManager = new ApprovalManager();