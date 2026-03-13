'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'USD' | 'VES';
type UserRole = 'Guest' | 'User' | 'Influencer' | 'Coach' | 'Admin';

interface User {
  id: string;
  name: string;
  role: UserRole;
  tokens?: number;
  level?: 'Bronce' | 'Plata' | 'Oro';
  influencerCode?: string;
}

interface AppContextType {
  currency: Currency;
  exchangeRate: number;
  user: User | null;
  toggleCurrency: () => void;
  setExchangeRate: (rate: number) => void;
  formatPrice: (usdPrice: number) => string;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(60);
  const [user, setUser] = useState<User | null>(null);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'USD' ? 'VES' : 'USD'));
  };

  const login = (role: UserRole) => {
    // Mock login for demonstration
    setUser({
      id: '123',
      name: role === 'Influencer' ? 'Alex Trainer' : 'Juan Perez',
      role: role,
      tokens: role === 'Influencer' ? 4500 : 0,
      level: role === 'Influencer' ? 'Plata' : undefined,
      influencerCode: role === 'Influencer' ? 'ALEX10' : undefined
    });
  };

  const logout = () => setUser(null);

  const formatPrice = (usdPrice: number) => {
    if (currency === 'USD') {
      return `$${usdPrice.toFixed(2)}`;
    } else {
      const vesPrice = usdPrice * exchangeRate;
      return `Bs. ${vesPrice.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`;
    }
  };

  return (
    <AppContext.Provider 
      value={{ 
        currency, 
        exchangeRate, 
        user,
        toggleCurrency, 
        setExchangeRate,
        formatPrice,
        login,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
