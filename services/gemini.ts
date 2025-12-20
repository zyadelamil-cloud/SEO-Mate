
import { GoogleGenAI, Type } from "@google/genai";
import { AIModelType, SEOConfig } from "../types";

// Always use process.env.API_KEY directly as specified in the guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSEOArticle = async (
  topic: string,
  config: SEOConfig,
  modelType: AIModelType = AIModelType.PRO
) => {
  const ai = getAI();
  
  // Clean keywords to be hashtags without spaces
  const cleanKeywords = config.targetKeywords.map(kw => kw.startsWith('#') ? kw.replace(/\s+/g, '') : `#${kw.replace(/\s+/g, '')}`);

  const systemPrompt = `You are a world-class SEO content specialist. 
  Generate a high-quality, long-form article optimized for Google ranking. 
  Target language: ${config.language}. 
  Tone: ${config.tone}. 
  Target Audience: ${config.audience}.
  Requirements:
  - EXACT WORD COUNT: Aim for approximately ${config.wordCount} words. This is critical.
  - KEYWORDS: You MUST use these hashtags naturally within the text or at the end: ${cleanKeywords.join(' ')}. 
  - IMPORTANT: Treat keywords as hashtags (no spaces, prefixed with #).
  - Structure: Include relevant H1, H2, and H3 headers.
  - Optimization: Focus on high readability and keyword density.
  - Provide a compelling SEO Meta Description.`;

  const response = await ai.models.generateContent({
    model: modelType,
    contents: `Write an article about: ${topic}. Targeted length is ${config.wordCount} words.`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING, description: 'Markdown formatted article content.' },
          metaDescription: { type: Type.STRING },
          seoScore: { type: Type.NUMBER },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "content", "metaDescription", "seoScore", "hashtags"],
      }
    }
  });

  // Access the .text property directly as per GenAI SDK documentation
  return JSON.parse(response.text);
};

export const generateHeroImage = async (topic: string, title: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A professional, ultra-high quality cinematic hero image for a blog post titled "${title}". Style: Minimalist 3D or high-end photography. Topic: ${topic}` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  // Iterate through parts to locate the inlineData containing the base64 image
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const remixForSocial = async (articleContent: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: AIModelType.FAST,
    contents: `Based on this article, create a viral social media pack. 
    1. A Twitter Thread (5 tweets).
    2. A LinkedIn Post.
    3. An Instagram Post (Caption + 5 trending hashtags + visual description).
    Article content: ${articleContent.substring(0, 2000)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          twitterThread: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          linkedinPost: { type: Type.STRING },
          instagram: {
            type: Type.OBJECT,
            properties: {
              caption: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              visualConcept: { type: Type.STRING }
            },
            required: ["caption", "hashtags", "visualConcept"]
          }
        },
        required: ["twitterThread", "linkedinPost", "instagram"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const suggestKeywords = async (topic: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: AIModelType.FAST,
    contents: `Suggest 5 trending hashtags (no spaces, starting with #) for the topic: ${topic}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  return JSON.parse(response.text);
};
