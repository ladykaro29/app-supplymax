'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/products';

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

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  status: 'Pendiente' | 'Verificado' | 'Preparando' | 'Enviado' | 'Entregado';
  items: CartItem[];
  total: number;
}

interface AppContextType {
  currency: Currency;
  exchangeRate: number;
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  toggleCurrency: () => void;
  setExchangeRate: (rate: number) => void;
  formatPrice: (usdPrice: number) => string;
  login: (role: UserRole) => void;
  logout: () => void;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: number, amount: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  completeOrder: () => void;
  cartTotal: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(60);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Local Storage Persistence
  useEffect(() => {
    const savedCart = localStorage.getItem('supplymax_cart');
    const savedOrders = localStorage.getItem('supplymax_orders');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  useEffect(() => {
    localStorage.setItem('supplymax_cart', JSON.stringify(cart));
    localStorage.setItem('supplymax_orders', JSON.stringify(orders));
  }, [cart, orders]);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'USD' ? 'VES' : 'USD'));
  };

  const login = (role: UserRole) => {
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

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, amount: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + amount;
          // Floor validation: remove if <= 0
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const completeOrder = () => {
    if (cart.length === 0) return;
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      status: 'Pendiente',
      items: [...cart],
      total: cartTotal
    };
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
  };

  const [isCartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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
        cart,
        orders,
        toggleCurrency, 
        setExchangeRate,
        formatPrice,
        login,
        logout,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        completeOrder,
        cartTotal,
        isCartOpen,
        setCartOpen,
        isMenuOpen,
        setMenuOpen,
        isChatOpen,
        setChatOpen
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
