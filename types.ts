
export enum AIModelType {
  FAST = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview'
}

export interface UserSubscription {
  planName: string;
  level: number; // 0: Starter, 1: Pro, 2: Expert, 3: Elite
  articlesLimit: number;
  usedArticles: number;
  firstName: string; 
  features: {
    heroImages: boolean;
    socialPack: boolean;
    bulkMode: boolean;
    prioritySupport: boolean;
  };
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
  title: string;
  content: string;
  metaDescription: string;
  hashtags: string[];
  status: 'draft' | 'published';
  createdAt: string; // Affichage
  timestamp: number; // Tri précis
  seoScore: number;
  lang: string;
}

export interface APIConfig {
  defaultModel: AIModelType;
  autoKeywords: boolean;
  devMode: boolean;
}
