
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LibraryItem } from '../types';

interface ContentContextProps {
  items: LibraryItem[];
  addItem: (item: LibraryItem) => void;
  removeItem: (id: string) => void;
  stats: {
    totalArticles: number;
    totalEmails: number;
    totalWords: number;
  };
}

const ContentContext = createContext<ContentContextProps | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<LibraryItem[]>(() => {
    const saved = localStorage.getItem('seo-mate-history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('seo-mate-history', JSON.stringify(items));
  }, [items]);

  const addItem = (item: LibraryItem) => {
    setItems(prev => [item, ...prev]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const stats = {
    totalArticles: items.filter(i => i.type === 'article').length,
    totalEmails: items.filter(i => i.type === 'email').length,
    totalWords: items.reduce((acc, item) => {
      const content = item.type === 'article' ? item.content : item.body;
      return acc + (content?.split(/\s+/).length || 0);
    }, 0)
  };

  return (
    <ContentContext.Provider value={{ items, addItem, removeItem, stats }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
