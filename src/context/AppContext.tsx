'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/products';

type Currency = 'USD' | 'VES';
type UserStatus = 'Active' | 'Pending' | 'Suspended';

interface Address {
  id: string;
  label: string; // e.g. "Casa", "Oficina"
  value: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role_id: 'User' | 'Influencer' | 'Coach' | 'Admin';
  level?: string;
  sub_level?: string; 
  status: UserStatus;
  
  // Influencer specific
  tokens?: number | null;
  affiliate_code?: string;
  
  // Coach specific
  coach_tier?: 1 | 2;
  is_featured?: boolean;

  addresses: Address[];
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
  login: (userData: any) => void;
  logout: () => void;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: number, amount: number) => void;
  removeFromCart: (productId: number) => void;
  addAddress: (label: string, value: string) => void;
  removeAddress: (id: string) => void;
  clearCart: () => void;
  completeOrder: (orderData?: any) => Promise<any>;
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

  const fetchOrders = async (userId: string) => {
    try {
      const res = await fetch(`/api/orders?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        // Map backend order structure to AppContext Order structure if needed
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const login = (userData: any) => {
    // Normalizing the JSON object received from "server"
    const userObj: User = {
      id: userData.id || '123',
      name: userData.name || 'Usuario Supply',
      email: userData.email || 'user@email.com',
      role_id: userData.role_id || 'User',
      level: userData.level,
      sub_level: userData.sub_level,
      status: userData.status || 'Active',
      tokens: userData.tokens ?? (userData.role_id === 'Influencer' ? 0 : null),
      affiliate_code: userData.affiliate_code,
      coach_tier: userData.coach_tier,
      is_featured: userData.is_featured || false,
      addresses: userData.addresses || [
        { id: '1', label: 'Principal', value: 'Av. Libertador, Mérida' }
      ]
    };
    setUser(userObj);
    fetchOrders(userObj.id);
  };

  const logout = () => {
    setUser(null);
    setOrders([]);
  };

  const addAddress = (label: string, value: string) => {
    if (!user) return;
    const newAddress: Address = { id: Date.now().toString(), label, value };
    setUser({ ...user, addresses: [...user.addresses, newAddress] });
  };

  const removeAddress = (id: string) => {
    if (!user) return;
    setUser({ ...user, addresses: user.addresses.filter(a => a.id !== id) });
  };

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

  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) setSettings(await res.json());
      } catch (err) {
        console.error('Settings fetch error:', err);
      }
    };
    fetchSettings();
  }, []);

  const completeOrder = async (orderData?: any) => {
    if (cart.length === 0 || !user) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items: cart,
          total: cartTotal,
          ...orderData
        }),
      });

      if (res.ok) {
        const newOrder = await res.json();
        setOrders(prev => [newOrder, ...prev]);
        clearCart();
        
        // Refresh user data if tokens were used or awarded
        const userRes = await fetch(`/api/auth/profile?userId=${user.id}`);
        if (userRes.ok) login(await userRes.json());
        
        return newOrder;
      }
    } catch (err) {
      console.error('Error completing order:', err);
    }
  };

  const [isCartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);

  // 3. Calculation Engine (Total) with Dynamic Settings
  const cartTotal = cart.reduce((acc, item) => {
    let itemPrice = item.price;
    
    // Coach dynamic discount
    if (user?.role_id === 'Coach') {
      const discountPercent = user.sub_level === 'Oro' 
        ? (parseInt(settings.coach_gold_discount) || 15)
        : (parseInt(settings.coach_silver_discount) || 10);
        
      itemPrice = item.price * (1 - (discountPercent / 100));
    }
    
    return acc + (itemPrice * item.quantity);
  }, 0);

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
        addAddress,
        removeAddress,
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
