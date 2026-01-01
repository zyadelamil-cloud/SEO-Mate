
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LibraryItem } from '../types';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuthShim';

interface ContentContextProps {
  items: LibraryItem[];
  addItem: (item: LibraryItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  stats: {
    totalArticles: number;
    totalEmails: number;
    totalWords: number;
  };
  isLoading: boolean;
  dbReady: boolean;
}

const ContentContext = createContext<ContentContextProps | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbReady, setDbReady] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          setDbReady(false);
          setItems([]);
          return;
        }
        throw error;
      }
      
      const libraryItems: LibraryItem[] = data.map(dbItem => ({
        ...dbItem.data,
        id: dbItem.id,
        createdAt: dbItem.created_at,
        type: dbItem.type
      }));

      setItems(libraryItems);
      setDbReady(true);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (item: LibraryItem) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('items')
        .insert([{
          user_id: session.user.id,
          type: item.type,
          data: item,
          created_at: item.createdAt
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '42P01') {
          throw new Error('DATABASE_SETUP_REQUIRED');
        }
        throw error;
      }
      
      const newItem: LibraryItem = {
        ...item,
        id: data.id 
      };
      
      setItems(prev => [newItem, ...prev]);
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  };

  const removeItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
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
    <ContentContext.Provider value={{ items, addItem, removeItem, stats, isLoading, dbReady }}>
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
