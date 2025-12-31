
export enum AIModelType {
  FAST = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview'
}

export enum PlanType {
  BASIC = 'BASIC',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM'
}

export interface SEOConfig {
  targetKeywords: string[];
  language: string;
  tone: string;
  wordCount: number;
  includeMeta: boolean;
  audience: string;
}

export interface GeneratedArticle {
  id: string;
  type: 'article';
  title: string;
  content: string;
  metaDescription: string;
  keywords: string[];
  status: 'draft' | 'published';
  createdAt: string;
  seoScore: number;
  model: AIModelType;
  language: string;
}

export interface GeneratedEmail {
  id: string;
  type: 'email';
  target: string;
  context: string;
  subjects: string[];
  body: string;
  createdAt: string;
  language: string;
  tone: string;
}

export type LibraryItem = GeneratedArticle | GeneratedEmail;

export interface BulkJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalArticles: number;
  completedArticles: number;
  topic: string;
  createdAt: string;
}

export interface WPSettings {
  url: string;
  username: string;
  apiKey: string;
  connected: boolean;
}
