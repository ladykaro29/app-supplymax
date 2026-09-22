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
  phone?: string | null;
  idNumber?: string | null;
  newsletter?: boolean;
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

export interface CartItem extends Product {
  cartItemId?: string;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  status: 'Pendiente' | 'Verificado' | 'Preparando' | 'Enviado' | 'Entregado';
  items: CartItem[];
  total: number;
  totalVes?: number;
  bcvRate?: number;
}

export interface BcvRateInfo {
  rate: number;
  date: string;
  formatted: string;
  source?: string;
}

interface AppContextType {
  currency: Currency;
  exchangeRate: number;
  bcvInfo: BcvRateInfo | null;
  fetchBcvRate: (force?: boolean) => Promise<void>;
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  toggleCurrency: () => void;
  setExchangeRate: (rate: number) => void;
  formatPrice: (usdPrice: number) => string;
  login: (userData: any) => void;
  logout: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (idOrCartItemId: number | string, amount: number) => void;
  removeFromCart: (idOrCartItemId: number | string) => void;
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
  authLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [exchangeRate, setExchangeRateInternal] = useState<number>(60);
  const [bcvInfo, setBcvInfo] = useState<BcvRateInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchBcvRate = async (force: boolean = false) => {
    try {
      const res = await fetch(`/api/bcv${force ? '?force=true' : ''}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.rate) {
          setBcvInfo(data);
          setExchangeRateInternal(data.rate);
          if (typeof window !== 'undefined') {
            localStorage.setItem('supplymax_exchange_rate', data.rate.toString());
            localStorage.setItem('supplymax_bcv_info', JSON.stringify(data));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching BCV rate:', err);
    }
  };

  // Local Storage Persistence
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('supplymax_cart');
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch (e) { console.error('Invalid cart in storage:', e); }
      }

      const savedOrders = localStorage.getItem('supplymax_orders');
      if (savedOrders) {
        try { setOrders(JSON.parse(savedOrders)); } catch (e) { console.error('Invalid orders in storage:', e); }
      }

      const savedBcv = localStorage.getItem('supplymax_bcv_info');
      if (savedBcv) {
        try { setBcvInfo(JSON.parse(savedBcv)); } catch (e) {}
      }

      const savedRate = localStorage.getItem('supplymax_exchange_rate');
      if (savedRate) {
        const parsedRate = parseFloat(savedRate);
        if (!isNaN(parsedRate) && parsedRate > 0) {
          setExchangeRateInternal(parsedRate);
        }
      }

      const savedUser = localStorage.getItem('supplymax_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && typeof parsed === 'object') {
            setUser(parsed);
            if (parsed.id) fetchOrders(parsed.id);
          }
        } catch (e) {
          console.error('Invalid user in storage:', e);
          localStorage.removeItem('supplymax_user');
        }
      }
    } catch (storageErr) {
      console.error('Error accessing localStorage:', storageErr);
    } finally {
      setAuthLoading(false);
    }

    // Fetch official live BCV rate
    fetchBcvRate();
  }, []);

  const setExchangeRate = async (rate: number) => {
    const numRate = parseFloat(String(rate));
    if (isNaN(numRate) || numRate <= 0) return;

    setExchangeRateInternal(numRate);
    if (typeof window !== 'undefined') {
      localStorage.setItem('supplymax_exchange_rate', numRate.toString());
    }

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'exchange_rate', value: numRate.toString() }),
        cache: 'no-store'
      });
    } catch (err) {
      console.error('Error saving exchange rate to database:', err);
    }
  };

  useEffect(() => {
    localStorage.setItem('supplymax_cart', JSON.stringify(cart));
    localStorage.setItem('supplymax_orders', JSON.stringify(orders));
  }, [cart, orders]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('supplymax_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('supplymax_user');
    }
  }, [user]);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'USD' ? 'VES' : 'USD'));
  };

  async function fetchOrders(userId: string) {
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
  }

  const login = (userData: any) => {
    // Normalizing the JSON object received from "server"
    const userObj: User = {
      id: userData.id || '123',
      name: userData.name || 'Usuario Supply',
      email: userData.email || 'user@email.com',
      role_id: userData.role_id || 'User',
      phone: userData.phone || null,
      idNumber: userData.idNumber || null,
      newsletter: userData.newsletter !== undefined ? userData.newsletter : true,
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

  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    const qty = Math.max(1, quantityToAdd);
    // Generate unique key based on id, variant name, and price
    const uniqueKey = (product as any).cartItemId || `${product.id}-${product.name}-${product.price}`;

    setCart(prev => {
      const existing = prev.find(item => (item.cartItemId || `${item.id}-${item.name}-${item.price}`) === uniqueKey);
      if (existing) {
        return prev.map(item => {
          const itemKey = item.cartItemId || `${item.id}-${item.name}-${item.price}`;
          return itemKey === uniqueKey ? { ...item, quantity: item.quantity + qty } : item;
        });
      }
      return [...prev, { ...product, cartItemId: uniqueKey, quantity: qty }];
    });
  };

  const updateQuantity = (idOrCartItemId: number | string, amount: number) => {
    setCart(prev => {
      return prev.map(item => {
        const itemKey = item.cartItemId || `${item.id}-${item.name}-${item.price}`;
        const matches = typeof idOrCartItemId === 'string'
          ? (item.cartItemId === idOrCartItemId || itemKey === idOrCartItemId)
          : (item.id === idOrCartItemId);

        if (matches) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (idOrCartItemId: number | string) => {
    setCart(prev => prev.filter(item => {
      const itemKey = item.cartItemId || `${item.id}-${item.name}-${item.price}`;
      if (typeof idOrCartItemId === 'string') {
        return item.cartItemId !== idOrCartItemId && itemKey !== idOrCartItemId;
      }
      return item.id !== idOrCartItemId;
    }));
  };

  const clearCart = () => setCart([]);

  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          if (data.exchange_rate) {
            const parsed = parseFloat(data.exchange_rate);
            if (!isNaN(parsed) && parsed > 0) {
              setExchangeRateInternal(parsed);
              if (typeof window !== 'undefined') {
                localStorage.setItem('supplymax_exchange_rate', parsed.toString());
              }
            }
          }
        }
      } catch (err) {
        console.error('Settings fetch error:', err);
      }
    };
    fetchSettings();
  }, []);

  const completeOrder = async (orderData?: any) => {
    if (cart.length === 0 || !user) return;

    try {
      const orderUsdTotal = orderData?.total ?? cartTotal;
      const orderVesTotal = orderUsdTotal * exchangeRate;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items: cart,
          total: orderUsdTotal,
          totalVes: orderVesTotal,
          bcvRate: exchangeRate,
          customerName: orderData?.customerName || user.name,
          customerIdNumber: orderData?.customerIdNumber || user.idNumber,
          customerPhone: orderData?.customerPhone || user.phone,
          customerEmail: orderData?.customerEmail || user.email,
          ...orderData
        }),
      });

      if (res.ok) {
        const newOrder = await res.json();
        setOrders(prev => [newOrder, ...prev]);
        clearCart();
        
        // Refresh user data if tokens were used or profile updated
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

  const formatPrice = (usdPrice: any) => {
    const num = typeof usdPrice === 'number' ? usdPrice : (parseFloat(String(usdPrice)) || 0);
    if (currency === 'USD') {
      return `$${num.toFixed(2)}`;
    } else {
      const rate = typeof exchangeRate === 'number' ? exchangeRate : (parseFloat(String(exchangeRate)) || 60);
      const vesPrice = num * rate;
      return `Bs. ${vesPrice.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  return (
    <AppContext.Provider 
      value={{ 
        currency, 
        exchangeRate, 
        bcvInfo,
        fetchBcvRate,
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
        setChatOpen,
        authLoading
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
