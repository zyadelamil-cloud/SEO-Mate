
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PlanType } from '../types';

interface WordCountLimits {
  article: number;
  email: number;
}

interface PlanContextProps {
  plan: PlanType;
  setPlan: (plan: PlanType) => void;
  isLanguageAvailable: (lang: string) => boolean;
  getPlanRequirement: (lang: string) => PlanType | null;
  getWordCountLimits: () => WordCountLimits;
  absoluteMax: WordCountLimits;
}

const PlanContext = createContext<PlanContextProps | undefined>(undefined);

// Fix: Remove React.FC and use explicit children prop type to resolve TS errors in consumers
export const PlanProvider = ({ children }: { children: ReactNode }) => {
  // Initialized to BASIC for testing as requested by the user
  const [plan, setPlan] = useState<PlanType>(PlanType.BASIC);

  const absoluteMax: WordCountLimits = {
    article: 6000,
    email: 2400
  };

  const languageRules: Record<string, PlanType> = {
    'English': PlanType.BASIC,
    'French': PlanType.BASIC,
    'Spanish': PlanType.PRO,
    'Chinese': PlanType.PRO,
    'Arabic': PlanType.PRO,
    'Hindi': PlanType.PREMIUM,
    'Bengali': PlanType.PREMIUM,
    'Russian': PlanType.PREMIUM,
    'Portuguese': PlanType.PREMIUM,
    'German': PlanType.PRO,
  };

  const getPlanRequirement = (lang: string): PlanType | null => {
    return languageRules[lang] || PlanType.PREMIUM;
  };

  const isLanguageAvailable = (lang: string): boolean => {
    const required = getPlanRequirement(lang);
    if (!required) return true;
    
    if (plan === PlanType.PREMIUM) return true;
    if (plan === PlanType.PRO) return required === PlanType.BASIC || required === PlanType.PRO;
    return required === PlanType.BASIC;
  };

  const getWordCountLimits = (): WordCountLimits => {
    switch (plan) {
      case PlanType.PREMIUM:
        return { article: 6000, email: 2400 };
      case PlanType.PRO:
        return { article: 2400, email: 1200 };
      case PlanType.BASIC:
      default:
        return { article: 1200, email: 500 };
    }
  };

  return (
    <PlanContext.Provider value={{ plan, setPlan, isLanguageAvailable, getPlanRequirement, getWordCountLimits, absoluteMax }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};
