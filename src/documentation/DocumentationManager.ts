import * as fs from 'fs';
import * as path from 'path';
import { Documentation, DocumentationMetadata } from './types.js';
import { logger } from '../logger/JsonLogger.js';

export class DocumentationManager {
  private baseDocsDir: string;
  private registry: Map<string, Documentation> = new Map();
  private isInitialized: boolean = false;

  // تغییر: به جای docs/security، کل پوشه docs را می‌گیرد
  constructor(baseDocsDir: string = path.join(process.cwd(), 'docs')) {
    this.baseDocsDir = baseDocsDir;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    logger.info('documentation.scan.started', { directory: this.baseDocsDir });

    try {
      if (!fs.existsSync(this.baseDocsDir)) {
        fs.mkdirSync(this.baseDocsDir, { recursive: true });
        logger.warn('documentation.directory.created', { directory: this.baseDocsDir });
        this.isInitialized = true;
        return;
      }

      // خواندن تمام پوشه‌های دسته‌بندی (مثل security, linux, git)
      const categories = fs.readdirSync(this.baseDocsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      let totalCount = 0;

      for (const category of categories) {
        const categoryPath = path.join(this.baseDocsDir, category);
        const files = fs.readdirSync(categoryPath);
        let categoryCount = 0;

        for (const file of files) {
          if (file.endsWith('.md')) {
            const filePath = path.join(categoryPath, file);
            const id = file.replace(/\.md$/, '');
            
            // تغییر مهم: URI حالا شامل نام دسته‌بندی است (مثلاً security://docs/ffuf)
            const uri = `${category}://docs/${id}`;

            try {
              const content = fs.readFileSync(filePath, 'utf-8');
              const title = this.extractTitle(content) || id;

              const doc: Documentation = {
                id,
                title,
                uri,
                filePath,
                content,
                category
              };

              if (this.registry.has(uri)) {
                logger.warn('documentation.duplicate.uri', { uri, filePath });
                continue;
              }

              this.registry.set(uri, doc);
              logger.info('documentation.discovered', { category, id, title });
              categoryCount++;
            } catch (error: any) {
              logger.error('documentation.load.failed', { file, category, error: error.message });
            }
          }
        }
        
        if (categoryCount > 0) {
          logger.info('documentation.category.completed', { category, count: categoryCount });
          totalCount += categoryCount;
        }
      }

      logger.info('documentation.scan.completed', { totalDocuments: totalCount, categories: categories.length });
      this.isInitialized = true;

    } catch (error: any) {
      logger.error('documentation.scan.failed', { error: error.message });
    }
  }

  private extractTitle(content: string): string | null {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  public listMetadata(): DocumentationMetadata[] {
    return Array.from(this.registry.values()).map(({ id, title, uri }) => ({
      id,
      title,
      uri
    }));
  }

  public getByUri(uri: string): Documentation | undefined {
    return this.registry.get(uri);
  }

  // متد کمکی برای گرفتن لیست بر اساس دسته‌بندی خاص (اختیاری اما مفید)
  public listByCategory(category: string): DocumentationMetadata[] {
    return Array.from(this.registry.values())
      .filter(doc => doc.uri.startsWith(`${category}://docs/`))
      .map(({ id, title, uri }) => ({ id, title, uri }));
  }
}