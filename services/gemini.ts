
import { GoogleGenAI, Type } from "@google/genai";
import { AIModelType, SEOConfig } from "../types";

/**
 * Suggests relevant SEO keywords based on a topic.
 */
export const suggestKeywords = async (topic: string) => {
  // Always use a named parameter for the API key and do not provide a fallback value.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: AIModelType.FAST,
    contents: `Suggest 5-8 relevant SEO keywords for the topic: ${topic}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  
  const text = response.text;
  if (!text) return [];
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse keywords:", text);
    return [];
  }
};

/**
 * Generates a full SEO-optimized article.
 */
export const generateSEOArticle = async (
  topic: string,
  config: SEOConfig,
  model: AIModelType = AIModelType.PRO
) => {
  // Always use a named parameter for the API key and do not provide a fallback value.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: model,
    contents: `Write a high-quality SEO optimized article about: ${topic}. 
    Target Keywords: ${config.targetKeywords.join(', ')}.
    Language: ${config.language}.
    Tone: ${config.tone}.
    Target Word Count: ${config.wordCount}.
    Target Audience: ${config.audience}.`,
    config: {
      systemInstruction: "You are a world-class SEO content strategist and copywriter. You write engaging, factual, and highly optimized articles that rank well on search engines.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING, description: "The main body of the article in Markdown format." },
          metaDescription: { type: Type.STRING },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          seoScore: { type: Type.NUMBER, description: "A predicted SEO score from 0 to 100." }
        },
        required: ["title", "content", "metaDescription", "keywords", "seoScore"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from AI");
  return JSON.parse(text);
};

/**
 * Generates a hero image for the article using the image model.
 */
export const generateHeroImage = async (topic: string, title: string) => {
  // Always use a named parameter for the API key and do not provide a fallback value.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Create a professional, modern hero illustration for an article titled "${title}" about "${topic}". The style should be clean, corporate-friendly, and visually striking.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString: string = part.inlineData.data;
      return `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
    }
  }
  return null;
};

/**
 * Remixes article content into social media posts.
 */
export const remixForSocial = async (content: string) => {
  // Always use a named parameter for the API key and do not provide a fallback value.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: AIModelType.FAST,
    contents: `Remix the following article content into social media posts for Instagram, X (Twitter), and LinkedIn: ${content}`,
    config: {
      systemInstruction: "You are a social media growth expert. You transform long-form content into viral, engaging social media posts tailored to each platform's culture.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          instagramPost: {
            type: Type.OBJECT,
            properties: {
              visualSuggestion: { type: Type.STRING },
              caption: { type: Type.STRING }
            },
            required: ["visualSuggestion", "caption"]
          },
          twitterThread: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          linkedinPost: { type: Type.STRING }
        },
        required: ["instagramPost", "twitterThread", "linkedinPost"]
      }
    }
  });

  const text = response.text;
  if (!text) return null;
  return JSON.parse(text);
};

/**
 * Generates a professional email.
 */
export const generateProfessionalEmail = async (
  context: string,
  target: string,
  tone: string,
  goal: string,
  language: string = "English",
  wordCount: number = 150
) => {
  // Always use a named parameter for the API key and do not provide a fallback value.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: AIModelType.FAST,
    contents: `Write a professional email. Target: ${target}. Context: ${context}. Tone: ${tone}. Goal: ${goal}. Language: ${language}. Word count target: roughly ${wordCount} words.`,
    config: {
      systemInstruction: "You are an expert executive assistant and corporate communications specialist. Your emails are clear, impactful, and achieve their goals while respecting professional etiquette.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subjects: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 highly effective subject line options."
          },
          body: { type: Type.STRING },
          closingOptions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          proTips: { type: Type.STRING, description: "One expert tip to increase response rate." }
        },
        required: ["subjects", "body", "closingOptions", "proTips"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from AI");
  return JSON.parse(text);
};
