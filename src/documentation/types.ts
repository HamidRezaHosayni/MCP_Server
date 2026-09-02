export interface DocumentationMetadata {
  id: string;
  title: string;
  uri: string;
  category?: string;
  
}

export interface Documentation extends DocumentationMetadata {
  content: string;
  filePath: string;
}