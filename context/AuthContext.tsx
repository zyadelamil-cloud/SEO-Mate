
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
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
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('seo-mate-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const accounts = JSON.parse(localStorage.getItem('seo-mate-accounts') || '[]');
    const found = accounts.find((a: any) => a.email === email && a.password === password);
    
    if (found) {
      const userData = { 
        email: found.email, 
        name: found.name, 
        createdAt: found.createdAt || new Date().toISOString() 
      };
      setUser(userData);
      localStorage.setItem('seo-mate-user', JSON.stringify(userData));
    } else {
      throw new Error('Identifiants incorrects');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const accounts = JSON.parse(localStorage.getItem('seo-mate-accounts') || '[]');
    if (accounts.find((a: any) => a.email === email)) {
      throw new Error('Cet email est déjà utilisé');
    }

    const createdAt = new Date().toISOString();
    const newAccount = { name, email, password, createdAt };
    accounts.push(newAccount);
    localStorage.setItem('seo-mate-accounts', JSON.stringify(accounts));
    
    const userData = { email, name, createdAt };
    setUser(userData);
    localStorage.setItem('seo-mate-user', JSON.stringify(userData));
  };

  const updateProfile = async (newName: string) => {
    if (!user) return;
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedUser = { ...user, name: newName };
    setUser(updatedUser);
    localStorage.setItem('seo-mate-user', JSON.stringify(updatedUser));
    
    const accounts = JSON.parse(localStorage.getItem('seo-mate-accounts') || '[]');
    const updatedAccounts = accounts.map((a: any) => a.email === user.email ? { ...a, name: newName } : a);
    localStorage.setItem('seo-mate-accounts', JSON.stringify(updatedAccounts));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('seo-mate-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, updateProfile, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
