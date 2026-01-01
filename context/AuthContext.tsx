
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        if (error.code === '42P01' || error.message.includes('schema cache')) {
          throw new Error('DATABASE_SETUP_REQUIRED');
        }
        throw error;
      }

      if (data) {
        setUser({
          id,
          email,
          name: data.name || 'Utilisateur',
          createdAt: data.created_at
        });
      } else {
        // If profile doesn't exist yet (trigger delay), retry once or set temporary state
        console.warn('Profile not found for authenticated user, trigger might be lagging.');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('schema cache')) {
        throw new Error('DATABASE_SETUP_REQUIRED');
      }
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { full_name: name }
      }
    });
    
    if (error) throw error;
    
    // NOTE: Profile creation is now handled by the Database Trigger 'on_auth_user_created'.
    // We don't need to insert here, but we can set the local user state optimistically
    // if confirmation is disabled.
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email!,
        name: name,
        createdAt: new Date().toISOString()
      });
    }
  };

  const updateProfile = async (newName: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ name: newName })
      .eq('id', user.id);

    if (error) throw error;
    setUser(prev => prev ? { ...prev, name: newName } : null);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      updateProfile, 
      logout, 
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
