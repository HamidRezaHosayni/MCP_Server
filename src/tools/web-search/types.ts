import { z } from 'zod';

export const searchInputSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  maxResults: z.number().int().min(1).max(5).optional().default(3)
    .describe('Number of top results to process (max 5).')
});

export type SearchInput = z.infer<typeof searchInputSchema>;

export interface WebSearchRawResult {
  title: string;
  link: string;
  snippet: string;
}

export interface FetchedPage {
  url: string;
  title: string;
  status: 'success' | 'failed';
  html?: string;
  errorReason?: string;
}

export interface ExtractedContent {
  text: string;
  code: string;
}

export interface ProcessedPageResult {
  url: string;
  title: string;
  status: 'success' | 'failed';
  text?: string;
  code?: string;
  errorReason?: string;
}

export interface SearchToolOutput {
  query: string;
  results: ProcessedPageResult[];
}