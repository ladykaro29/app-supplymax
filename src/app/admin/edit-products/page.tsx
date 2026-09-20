'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import styles from './EditProducts.module.css';

interface Product {
  id: number;
  name: string;
  category: string;
  goal?: string | null;
  price: number;
  purchasePrice?: number | null;
  image: string;
  images?: string | string[] | null;
  description: string;
  portions?: string | null;
  flavor?: string | null;
  weight?: string | null;
  sizes?: string | string[] | null;
  isFeatured: boolean;
  isOffer: boolean;
  discount?: number | null;
  durationInDays?: string | null;
  stock: number;
  supplierName?: string | null;
  purchaseType?: 'CONTADO' | 'CREDITO' | null;
  creditDueDate?: string | null;
  creditDebt?: number | null;
  creditPaid?: boolean | null;
}

const BLANK_PRODUCT: Product = {
  id: 0,
  name: '',
  category: 'Proteínas',
  goal: '',
  price: 0,
  purchasePrice: 0,
  image: '/protein.png',
  images: ['/protein.png'],
  description: '',
  portions: '',
  flavor: '',
  weight: '',
  sizes: [],
  isFeatured: false,
  isOffer: false,
  discount: 0,
  stock: 10,
  supplierName: '',
  purchaseType: 'CONTADO',
  creditDueDate: '',
  creditDebt: null,
  creditPaid: false,
};

const CATEGORIES = ['Todos', 'Proteínas', 'Creatinas', 'Pre-Entrenos', 'Aminoácidos/BCAA', 'Quemadores/Otros', 'Ropa'];

const PRESET_FLAVORS = [
  'Vainilla',
  'Chocolate',
  'Fresa',
  'Cookies & Cream',
  'Frutos Rojos',
  'Banana',
  'Blue Raspberry',
  'Fruit Punch',
  'Manzana Verde',
  'Neutro / Sin Sabor',
];

const PRESET_WEIGHTS = [
  '300g',
  '500g',
  '1 kg',
  '2 kg',
  '2 lbs',
  '5 lbs',
  '10 lbs',
  '30 Servicios',
  '60 Servicios',
  '60 Cápsulas',
  '120 Cápsulas',
];

const MARGIN_PRESETS = [30, 40, 50, 75, 100];

export default function EditProductsPage() {
  const { user, formatPrice, authLoading } = useAppContext();
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Profit & Margin state
  const [selectedMargin, setSelectedMargin] = useState<number>(50);
  const [customFlavor, setCustomFlavor] = useState('');
  const [customWeight, setCustomWeight] = useState('');
  const [manualImageUrl, setManualImageUrl] = useState('');

  // Filter products based on search term and category pills
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const search = (searchTerm || '').toLowerCase();
      const matchesSearch = (p.name || '').toLowerCase().includes(search) ||
                            (p.category || '').toLowerCase().includes(search) ||
                            (p.flavor && String(p.flavor).toLowerCase().includes(search)) ||
                            (p.weight && String(p.weight).toLowerCase().includes(search));
      
      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/products');
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudieron obtener los productos de la base de datos.');
      }
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) {
      loadProducts();
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('new') === 'true' || window.location.hash === '#new') {
          setSelectedMargin(50);
          setCustomFlavor('');
          setCustomWeight('');
          setEditingProduct({ ...BLANK_PRODUCT });
        }
      }
    }
  }, [isMounted]);

  // Allowed Roles (case-insensitive check)
  const allowedRoles = ['admin', 'administrador', 'subgerente', 'administrador de inventarios'];
  
  if (authLoading || !isMounted) {
    return (
      <div className={styles.premiumLoaderContainer}>
        <div className={styles.premiumLoader}>
          <div className={styles.doublePulse}></div>
        </div>
        <p className={styles.loadingText}>Verificando credenciales...</p>
      </div>
    );
  }

  const userRole = (user?.role_id || '').toLowerCase().trim();
  if (!user || !allowedRoles.includes(userRole)) {
    return (
      <div className={styles.unauthorized}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1>Acceso Restringido</h1>
          <p>Solo personal del staff con permisos de inventario puede acceder a este panel.</p>
          <a href="/login" className={styles.retryBtn} style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
            Iniciar Sesión como Administrador
          </a>
        </div>
      </div>
    );
  }

  const handleCreateNew = () => {
    setSelectedMargin(50);
    setCustomFlavor('');
    setCustomWeight('');
    setEditingProduct({ ...BLANK_PRODUCT });
  };

  const handleEdit = (product: Product) => {
    // Parse sizes array if needed
    let parsedSizes: string[] = [];
    if (Array.isArray(product.sizes)) {
      parsedSizes = product.sizes;
    } else if (typeof product.sizes === 'string') {
      parsedSizes = product.sizes.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Parse images array if needed (up to 10 images)
    let parsedImages: string[] = [];
    if (Array.isArray(product.images)) {
      parsedImages = product.images.filter(Boolean);
    } else if (typeof product.images === 'string' && product.images.trim()) {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) parsedImages = parsed.filter(Boolean);
      } catch {
        parsedImages = product.images.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    if (parsedImages.length === 0 && product.image) {
      parsedImages = [product.image];
    }

    // Calculate effective margin if cost is present
    const cost = product.purchasePrice || 0;
    const price = product.price || 0;
    if (cost > 0 && price > cost) {
      const calcMargin = Math.round(((price - cost) / cost) * 100);
      setSelectedMargin(calcMargin);
    } else {
      setSelectedMargin(50);
    }

    setCustomFlavor('');
    setCustomWeight('');
    setEditingProduct({
      ...product,
      image: parsedImages[0] || product.image || '/protein.png',
      images: parsedImages.length > 0 ? parsedImages : [product.image || '/protein.png'],
      sizes: parsedSizes,
    });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente "${name}" del inventario?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'No se pudo eliminar el producto.');
      }

      alert(result.message || 'Producto eliminado con éxito.');
      loadProducts();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const closeModal = () => {
    setEditingProduct(null);
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    if (!editingProduct.name.trim()) {
      alert('El nombre del producto es requerido.');
      return;
    }
    if (editingProduct.price <= 0) {
      alert('El precio de venta debe ser mayor a 0.');
      return;
    }

    try {
      const isCreation = editingProduct.id === 0;
      const method = isCreation ? 'POST' : 'PUT';
      
      const payload = {
        ...editingProduct,
        goal: editingProduct.goal ? editingProduct.goal.trim() : '',
      };

      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Error al guardar los cambios.');
      }

      alert(isCreation ? `Producto "${result.name}" registrado con éxito.` : `Producto "${result.name}" actualizado.`);
      closeModal();
      loadProducts();
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    }
  };

  // Quick Stock increment / decrement from product card
  const handleQuickStock = async (product: Product, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStock = Math.max(0, product.stock + delta);
    try {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, stock: newStock }),
      });
    } catch (err) {
      console.error('Error quick updating stock:', err);
      loadProducts();
    }
  };

  // Pricing & Margin calculation handlers
  const handleCostChange = (newCost: number) => {
    if (!editingProduct) return;
    const cost = Math.max(0, newCost);
    const calculatedPrice = selectedMargin > 0
      ? Math.round((cost * (1 + selectedMargin / 100)) * 100) / 100
      : cost;
    
    setEditingProduct({
      ...editingProduct,
      purchasePrice: cost,
      price: calculatedPrice,
    });
  };

  const handleMarginPresetClick = (margin: number) => {
    setSelectedMargin(margin);
    if (!editingProduct) return;
    const cost = Number(editingProduct.purchasePrice) || 0;
    if (cost > 0) {
      const calculatedPrice = Math.round((cost * (1 + margin / 100)) * 100) / 100;
      setEditingProduct({
        ...editingProduct,
        price: calculatedPrice,
      });
    }
  };

  const handleSellingPriceChange = (newPrice: number) => {
    if (!editingProduct) return;
    const price = Math.max(0, newPrice);
    const cost = Number(editingProduct.purchasePrice) || 0;
    if (cost > 0 && price > cost) {
      const effectiveMarkup = Math.round(((price - cost) / cost) * 100);
      setSelectedMargin(effectiveMarkup);
    }
    setEditingProduct({
      ...editingProduct,
      price,
    });
  };

  // Plain parser for active images list (no React hooks)
  const currentImagesList: string[] = (() => {
    if (!editingProduct) return [];
    if (Array.isArray(editingProduct.images)) {
      const arr = editingProduct.images.filter(Boolean);
      if (arr.length > 0) return arr;
    }
    if (typeof editingProduct.images === 'string' && editingProduct.images.trim()) {
      try {
        const parsed = JSON.parse(editingProduct.images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter(Boolean);
      } catch {
        const split = editingProduct.images.split(',').map(s => s.trim()).filter(Boolean);
        if (split.length > 0) return split;
      }
    }
    return editingProduct.image ? [editingProduct.image] : [];
  })();

  // Multi-Image File Upload Handler (Up to 10 images)
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !editingProduct) return;

    const remainingSlots = Math.max(0, 10 - currentImagesList.length);
    if (remainingSlots <= 0) {
      alert('Ya has alcanzado el límite máximo de 10 imágenes para este producto. Elimina una imagen para agregar otra.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const filesToUpload = Array.from(fileList).slice(0, remainingSlots);
    if (fileList.length > remainingSlots) {
      alert(`Solo se cargarán ${remainingSlots} imagen(es) para no exceder el máximo de 10.`);
    }

    setUploadingImage(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      filesToUpload.forEach(file => {
        formData.append('files', file);
      });

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al subir las imágenes.');
      }

      const uploadedUrls: string[] = Array.isArray(data.urls) ? data.urls : (data.url ? [data.url] : []);
      if (uploadedUrls.length === 0) {
        throw new Error('No se recibió ninguna URL de imagen.');
      }

      const mergedImages = [...currentImagesList, ...uploadedUrls].slice(0, 10);
      setEditingProduct(prev => prev ? ({
        ...prev,
        image: mergedImages[0] || prev.image,
        images: mergedImages,
      }) : null);

      setUploadSuccess(`¡${uploadedUrls.length} imagen(es) subida(s) con éxito! (${mergedImages.length}/10 fotos)`);
      setTimeout(() => setUploadSuccess(''), 4500);
    } catch (err: any) {
      console.warn('Upload API fallback:', err);
      // Fallback: read locally with FileReader
      try {
        const base64List: string[] = [];
        for (const file of filesToUpload) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result && typeof reader.result === 'string') resolve(reader.result);
              else reject(new Error('No se pudo convertir a Base64'));
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          base64List.push(base64);
        }

        const merged = [...currentImagesList, ...base64List].slice(0, 10);
        setEditingProduct(prev => prev ? ({
          ...prev,
          image: merged[0] || prev.image,
          images: merged,
        }) : null);
        setUploadSuccess(`Imágenes cargadas en memoria local (${merged.length}/10 fotos).`);
        setTimeout(() => setUploadSuccess(''), 4500);
      } catch (fallbackErr) {
        setUploadError(err.message || 'Error al procesar las imágenes.');
      }
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (!editingProduct) return;
    const updated = currentImagesList.filter((_, idx) => idx !== indexToRemove);
    setEditingProduct({
      ...editingProduct,
      image: updated[0] || '',
      images: updated,
    });
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    if (!editingProduct || indexToPrimary === 0) return;
    const primaryImg = currentImagesList[indexToPrimary];
    const rest = currentImagesList.filter((_, idx) => idx !== indexToPrimary);
    const updated = [primaryImg, ...rest];
    setEditingProduct({
      ...editingProduct,
      image: updated[0],
      images: updated,
    });
  };

  const handleAddManualImageUrl = (urlToAdd: string) => {
    if (!editingProduct || !urlToAdd.trim()) return;
    const cleaned = urlToAdd.trim();
    if (currentImagesList.length >= 10) {
      alert('Ya has alcanzado el límite de 10 imágenes para este producto.');
      return;
    }
    if (currentImagesList.includes(cleaned)) {
      alert('Esta imagen ya está en la galería del producto.');
      return;
    }
    const updated = [...currentImagesList, cleaned].slice(0, 10);
    setEditingProduct({
      ...editingProduct,
      image: updated[0],
      images: updated,
    });
  };

  // Plain string parsers for active product (no React hooks)
  const currentFlavorsList = editingProduct?.flavor
    ? String(editingProduct.flavor).split(',').map(f => f.trim()).filter(Boolean)
    : [];

  const currentWeightsList = editingProduct?.weight
    ? String(editingProduct.weight).split(',').map(w => w.trim()).filter(Boolean)
    : [];

  const handleAddFlavor = (flavorToAdd: string) => {
    if (!editingProduct || !flavorToAdd.trim()) return;
    const cleaned = flavorToAdd.trim();
    if (currentFlavorsList.includes(cleaned)) return;
    const updated = [...currentFlavorsList, cleaned].join(', ');
    setEditingProduct({ ...editingProduct, flavor: updated });
    setCustomFlavor('');
  };

  const handleRemoveFlavor = (flavorToRemove: string) => {
    if (!editingProduct) return;
    const updated = currentFlavorsList.filter(f => f !== flavorToRemove).join(', ');
    setEditingProduct({ ...editingProduct, flavor: updated });
  };

  const handleAddWeight = (weightToAdd: string) => {
    if (!editingProduct || !weightToAdd.trim()) return;
    const cleaned = weightToAdd.trim();
    if (currentWeightsList.includes(cleaned)) return;
    const updated = [...currentWeightsList, cleaned].join(', ');
    setEditingProduct({ ...editingProduct, weight: updated });
    setCustomWeight('');
  };

  const handleRemoveWeight = (weightToRemove: string) => {
    if (!editingProduct) return;
    const updated = currentWeightsList.filter(w => w !== weightToRemove).join(', ');
    setEditingProduct({ ...editingProduct, weight: updated });
  };

  const toggleSize = (size: string) => {
    if (!editingProduct) return;
    const currentSizes = (editingProduct.sizes as string[]) || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    setEditingProduct({ ...editingProduct, sizes: newSizes });
  };

  // Profitability calculations for the active editing product
  const costVal = Number(editingProduct?.purchasePrice) || 0;
  const priceVal = Number(editingProduct?.price) || 0;
  const stockVal = Number(editingProduct?.stock) || 0;
  const unitProfitVal = Math.max(0, priceVal - costVal);
  const marginPctVal = priceVal > 0 ? Math.round((unitProfitVal / priceVal) * 100) : 0;
  const totalProjectedProfitVal = unitProfitVal * stockVal;

  // Credit & Break-even calculations
  const isCredit = editingProduct?.purchaseType === 'CREDITO';
  const effectiveDebt = isCredit 
    ? (editingProduct?.creditDebt !== null && editingProduct?.creditDebt !== undefined 
        ? Number(editingProduct.creditDebt) 
        : costVal * stockVal)
    : 0;
  
  // Break-even units: how many units must be sold to cover provider debt
  const breakEvenUnits = priceVal > 0 && effectiveDebt > 0 
    ? Math.min(stockVal, Math.ceil(effectiveDebt / priceVal)) 
    : 0;
  
  // Remaining units that represent 100% free net profit
  const freeProfitUnits = Math.max(0, stockVal - breakEvenUnits);
  const projectedFreeProfitUSD = Math.max(0, (stockVal * priceVal) - effectiveDebt);

  // Helper to add days to today and return YYYY-MM-DD
  const setDueDaysFromToday = (days: number) => {
    if (!editingProduct) return;
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setEditingProduct({
      ...editingProduct,
      creditDueDate: `${yyyy}-${mm}-${dd}`
    });
  };

  // Helper for credit days remaining
  const getCreditDaysDiff = (dueDateStr?: string | null) => {
    if (!dueDateStr) return null;
    const parts = dueDateStr.split('-');
    if (parts.length !== 3) return null;
    const due = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Header Title & Actions */}
        <header className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <span className={styles.sectionBadge}>Catálogo & Control de Stock</span>
            <h1><span>Productos</span></h1>
            <p>Control de inventario, costos de compra, cálculo de precios de venta y variaciones</p>
          </div>
          
          <div className={styles.headerActions}>
            <div className={styles.searchBar}>
              <div className={styles.searchIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <input 
                type="text" 
                placeholder="Buscar por nombre, sabor, peso o categoría..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button className={styles.clearSearch} onClick={() => setSearchTerm('')}>✕</button>
              )}
            </div>
            
            <button className={styles.addBtn} onClick={handleCreateNew} id="btn-add-product">
              <span className={styles.plusIcon}>+</span> Agregar Productos
            </button>
          </div>
        </header>

        {/* Category Pills Filter */}
        <div className={styles.categoryPills}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`${styles.catPill} ${activeCategory === cat ? styles.catPillActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Inventory Statistics Bar */}
        <div className={styles.stockSummaryBar}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Total en Catálogo</span>
            <span className={styles.statVal}>
              {products.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>productos</span>
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Disponibles</span>
            <span className={`${styles.statVal} ${styles.statGreen}`}>
              {products.filter(p => p.stock > 5).length} <span style={{ fontSize: '0.85rem', fontWeight: 500, opacity: 0.85 }}>unid.</span>
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Stock Bajo</span>
            <span className={`${styles.statVal} ${styles.statYellow}`}>
              {products.filter(p => p.stock > 0 && p.stock <= 5).length} <span style={{ fontSize: '0.85rem', fontWeight: 500, opacity: 0.85 }}>unid.</span>
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Agotados</span>
            <span className={`${styles.statVal} ${styles.statRed}`}>
              {products.filter(p => p.stock <= 0).length} <span style={{ fontSize: '0.85rem', fontWeight: 500, opacity: 0.85 }}>unid.</span>
            </span>
          </div>
        </div>

        {/* Product Catalog Grid */}
        {loading ? (
          <div className={styles.loaderWrap}>
            <div className={styles.spinner}></div>
            <p>Sincronizando inventario...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>⚠️ {error}</p>
            <button onClick={loadProducts} className={styles.retryBtn}>Reintentar Sincronización</button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.85 }}>📦</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              No se encontraron productos
            </h3>
            <p>
              {searchTerm 
                ? `No hay coincidencias para "${searchTerm}". Intenta con otro término o categoría.` 
                : 'Aún no hay productos registrados en esta categoría o tu inventario está sincronizándose.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className={styles.retryBtn}
                >
                  Limpiar Búsqueda
                </button>
              )}
              <button 
                className={styles.addBtn} 
                onClick={handleCreateNew}
              >
                <span className={styles.plusIcon}>+</span> Registrar Nuevo Producto
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredProducts.map(product => {
              const cost = Number(product.purchasePrice) || 0;
              const numPrice = Number(product.price) || 0;
              const numDiscount = Number(product.discount) || 0;
              const profit = Math.max(0, numPrice - cost);
              const finalPrice = product.isOffer && numDiscount 
                ? Math.max(0, numPrice - numDiscount) 
                : numPrice;

              return (
                <div key={product.id} className={styles.productCard} onClick={() => handleEdit(product)}>
                  
                  {/* Floating Action Overlay on Hover */}
                  <div className={styles.cardHoverOverlay}>
                    <button 
                      type="button"
                      className={styles.floatingEditBtn}
                      onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                      title="Editar Producto y Variaciones"
                    >
                      <span>✏️</span>
                      <span>Editar</span>
                    </button>
                    <button 
                      type="button"
                      className={styles.floatingDeleteBtn}
                      onClick={(e) => { e.stopPropagation(); handleDelete(product.id, product.name); }}
                      title="Eliminar Producto"
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                  
                  <div className={styles.imageWrapper}>
                    <img 
                      src={product.image || '/protein.png'} 
                      alt={product.name} 
                      className={styles.productImage} 
                      onError={(e) => { (e.target as HTMLImageElement).src = '/protein.png'; }} 
                    />
                    
                    {/* Stock Alert Badge */}
                    <div className={styles.stockStatusBadge}>
                      {product.stock <= 0 ? (
                        <span className={styles.stockBadgeOut}>🔴 Agotado</span>
                      ) : product.stock <= 5 ? (
                        <span className={styles.stockBadgeLow}>🟡 Stock Bajo ({product.stock})</span>
                      ) : (
                        <span className={styles.stockBadgeAvailable}>🟢 Stock: {product.stock}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.info}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={styles.cardCategory}>{product.category}</span>
                      {product.weight && (
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                          {String(product.weight).split(',')[0]}
                        </span>
                      )}
                    </div>

                    <h3 className={styles.name}>{product.name}</h3>
                    
                    {/* Price and Cost Row */}
                    <div className={styles.priceRow}>
                      <span className={styles.currentPrice}>{formatPrice(finalPrice)}</span>
                      {product.isOffer && (
                        <span className={styles.oldPrice}>{formatPrice(numPrice)}</span>
                      )}
                    </div>

                    {/* Cost and Profit Metrics */}
                    <div className={styles.cardProfitInfo}>
                      <span className={styles.costText}>
                        Costo: {cost > 0 ? `$${cost.toFixed(2)}` : 'Sin definir'}
                      </span>
                      <span className={styles.profitBadge}>
                        Ganancia: +${profit.toFixed(2)}
                      </span>
                    </div>

                    {/* Supplier & Credit Acquisition Tag */}
                    {product.purchaseType === 'CREDITO' && (
                      <div className={styles.cardCreditBox}>
                        {product.creditPaid ? (
                          <span className={styles.creditStatusPaid}>
                            ✅ Factura Proveedor Liquidada
                          </span>
                        ) : (
                          (() => {
                            const daysDiff = getCreditDaysDiff(product.creditDueDate);
                            const isOverdue = daysDiff !== null && daysDiff < 0;
                            const isWarning = daysDiff !== null && daysDiff >= 0 && daysDiff <= 7;
                            return (
                              <div className={styles.creditStatusPending}>
                                <span className={isOverdue ? styles.badgeOverdue : isWarning ? styles.badgeWarning : styles.badgeNormal}>
                                  {isOverdue 
                                    ? `🚨 Factura Vencida (${Math.abs(daysDiff!)}d)` 
                                    : daysDiff === 0 
                                      ? `🚨 Vence Hoy` 
                                      : daysDiff !== null 
                                        ? `⏳ Pagar en ${daysDiff}d` 
                                        : '🟣 A Crédito'}
                                </span>
                                {product.supplierName && (
                                  <span className={styles.creditSupplierName} title={`Proveedor: ${product.supplierName}`}>
                                    🏢 {product.supplierName}
                                  </span>
                                )}
                              </div>
                            );
                          })()
                        )}
                      </div>
                    )}

                    {/* Quick Stock Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Ajustar Stock Rápido:</span>
                      <div className={styles.quickStockControl}>
                        <button 
                          className={styles.stockBtn} 
                          onClick={(e) => handleQuickStock(product, -1, e)}
                          title="Restar 1 unidad"
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', minWidth: '24px', textAlign: 'center' }}>
                          {product.stock}
                        </span>
                        <button 
                          className={styles.stockBtn} 
                          onClick={(e) => handleQuickStock(product, 1, e)}
                          title="Sumar 1 unidad"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    {/* Flavors preview if exists */}
                    {product.flavor && (
                      <div style={{ fontSize: '0.7rem', color: '#00F0FF', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        🍓 Sabores: {product.flavor}
                      </div>
                    )}

                    <div className={styles.badges}>
                      {product.isFeatured && <span className={`${styles.badge} ${styles.featuredBadge}`}>Destacado</span>}
                      {product.isOffer && <span className={`${styles.badge} ${styles.offerBadge}`}>Oferta -${product.discount}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Unified Edit & Creation Modal */}
      {editingProduct && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingProduct.id === 0 ? 'Registrar Nuevo Producto' : `Editar Ficha de Producto`}</h2>
              <button className={styles.closeModal} onClick={closeModal}>✕</button>
            </div>
            
            <div className={styles.modalBody}>
              {/* Product Basic Info */}
              <div className={styles.formGroup}>
                <label>Nombre del Producto *</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  placeholder="Ej: Creatina Micronizada 100% Pura Creapure"
                  required
                />
              </div>

              <div className={styles.priceGrid}>
                <div className={styles.formGroup}>
                  <label>Categoría</label>
                  <select 
                    className={styles.formSelect} 
                    value={editingProduct.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      let defaultImg = editingProduct.image;
                      if (editingProduct.id === 0) {
                        if (cat === 'Ropa') defaultImg = '/hoodie.png';
                        else if (cat === 'Creatinas') defaultImg = '/creatine.png';
                        else if (cat === 'Aminoácidos/BCAA') defaultImg = '/amino.png';
                        else defaultImg = '/protein.png';
                        setEditingProduct({...editingProduct, category: cat, image: defaultImg, images: [defaultImg]});
                      } else {
                        setEditingProduct({...editingProduct, category: cat});
                      }
                    }}
                  >
                    <option value="Proteínas">Proteínas</option>
                    <option value="Creatinas">Creatinas</option>
                    <option value="Pre-Entrenos">Pre-Entrenos</option>
                    <option value="Aminoácidos/BCAA">Aminoácidos/BCAA</option>
                    <option value="Quemadores/Otros">Quemadores/Otros</option>
                    <option value="Ropa">Ropa</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Meta / Tag Destacado</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    value={editingProduct.goal || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, goal: e.target.value})}
                    placeholder="Ej: FUERZA, PREMIUM, OFERTA, TOP"
                  />
                </div>
              </div>

              {/* ======================================================== */}
              {/* CALCULADORA DE COSTO, MARGEN Y PRECIO DE VENTA          */}
              {/* ======================================================== */}
              <div className={styles.profitCalculatorCard}>
                <div className={styles.calcHeader}>
                  <span className={styles.calcTitle}>
                    💰 Calculadora de Rentabilidad & Precio de Venta
                  </span>
                  <div className={styles.marginSelector}>
                    <span className={styles.marginLabel}>Margen:</span>
                    {MARGIN_PRESETS.map(m => (
                      <button
                        key={m}
                        type="button"
                        className={`${styles.marginPresetBtn} ${selectedMargin === m ? styles.marginPresetActive : ''}`}
                        onClick={() => handleMarginPresetClick(m)}
                      >
                        +{m}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.priceGrid}>
                  <div className={styles.formGroup}>
                    <label style={{ color: '#00F0FF' }}>Costo de Compra ($ USD)</label>
                    <input 
                      type="number" 
                      className={styles.formInput} 
                      value={editingProduct.purchasePrice || 0}
                      onChange={(e) => handleCostChange(parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      placeholder="Costo unitario del proveedor"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label style={{ color: '#25D366' }}>Precio de Venta Sugerido ($ USD) *</label>
                    <input 
                      type="number" 
                      className={styles.formInput} 
                      value={editingProduct.price || 0}
                      onChange={(e) => handleSellingPriceChange(parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Real-time Profitability Metrics */}
                <div className={styles.profitMetricsGrid}>
                  <div className={styles.profitMetricBox}>
                    <span className={styles.metricLabel}>Ganancia Neta / Unidad</span>
                    <span className={`${styles.metricValue} ${styles.metricValuePositive}`}>
                      +${(Number(unitProfitVal) || 0).toFixed(2)} USD
                    </span>
                  </div>

                  <div className={styles.profitMetricBox}>
                    <span className={styles.metricLabel}>Margen Comercial</span>
                    <span className={`${styles.metricValue} ${styles.metricValueCyan}`}>
                      {Number(marginPctVal) || 0}% <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>(+{selectedMargin}%)</span>
                    </span>
                  </div>

                  <div className={styles.profitMetricBox}>
                    <span className={styles.metricLabel}>Ganancia Total del Lote</span>
                    <span className={`${styles.metricValue} ${styles.metricValuePositive}`}>
                      +${(Number(totalProjectedProfitVal) || 0).toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock and Discount */}
              <div className={styles.priceGrid}>
                <div className={styles.formGroup}>
                  <label>Stock Físico en Inventario *</label>
                  <input 
                    type="number" 
                    className={styles.formInput} 
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                    min="0"
                    required
                  />
                </div>

                {editingProduct.isOffer && (
                  <div className={styles.formGroup}>
                    <label>Monto de Descuento ($ USD)</label>
                    <input 
                      type="number" 
                      className={styles.formInput} 
                      placeholder="Restar al precio final"
                      value={editingProduct.discount || 0}
                      onChange={(e) => setEditingProduct({...editingProduct, discount: parseFloat(e.target.value) || 0})}
                      step="0.01"
                      min="0"
                    />
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* MODALIDAD DE ADQUISICIÓN: CONTADO VS CRÉDITO PROVEEDOR   */}
              {/* ======================================================== */}
              <div className={styles.creditManagerCard}>
                <div className={styles.creditCardHeader}>
                  <span className={styles.creditTitle}>
                    🏢 Modalidad de Adquisición & Proveedor
                  </span>
                  
                  {/* Selector de Modalidad */}
                  <div className={styles.purchaseTypeToggle}>
                    <button
                      type="button"
                      className={`${styles.typeToggleBtn} ${!isCredit ? styles.typeToggleActiveCash : ''}`}
                      onClick={() => setEditingProduct({ ...editingProduct, purchaseType: 'CONTADO' })}
                    >
                      🟢 Contado (Pagado)
                    </button>
                    <button
                      type="button"
                      className={`${styles.typeToggleBtn} ${isCredit ? styles.typeToggleActiveCredit : ''}`}
                      onClick={() => {
                        const defaultDebt = effectiveDebt > 0 ? effectiveDebt : costVal * stockVal;
                        setEditingProduct({ 
                          ...editingProduct, 
                          purchaseType: 'CREDITO',
                          creditDebt: defaultDebt > 0 ? defaultDebt : null,
                        });
                      }}
                    >
                      🟣 A Crédito (Por Pagar)
                    </button>
                  </div>
                </div>

                {isCredit && (
                  <div className={styles.creditFormBody}>
                    <div className={styles.priceGrid}>
                      <div className={styles.formGroup}>
                        <label>Proveedor o Distribuidor Comercial</label>
                        <input 
                          type="text" 
                          className={styles.formInput} 
                          placeholder="Ej: Distribuidor ProSupps Mérida"
                          value={editingProduct.supplierName || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, supplierName: e.target.value })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label>Fecha Límite de Pago de Factura</label>
                          <div className={styles.dueQuickPresets}>
                            <button type="button" onClick={() => setDueDaysFromToday(15)} className={styles.presetDayBtn}>+15d</button>
                            <button type="button" onClick={() => setDueDaysFromToday(30)} className={styles.presetDayBtn}>+30d</button>
                            <button type="button" onClick={() => setDueDaysFromToday(45)} className={styles.presetDayBtn}>+45d</button>
                          </div>
                        </div>
                        <input 
                          type="date" 
                          className={styles.formInput} 
                          value={editingProduct.creditDueDate || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, creditDueDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className={styles.priceGrid} style={{ marginTop: '10px' }}>
                      <div className={styles.formGroup}>
                        <label>Deuda Total con el Proveedor ($ USD)</label>
                        <input 
                          type="number" 
                          className={styles.formInput} 
                          step="0.01"
                          min="0"
                          placeholder={`Por defecto: $${(costVal * stockVal).toFixed(2)}`}
                          value={editingProduct.creditDebt !== null && editingProduct.creditDebt !== undefined ? editingProduct.creditDebt : ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, creditDebt: parseFloat(e.target.value) || 0 })}
                        />
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', display: 'block' }}>
                          Base sugerida: Costo (${costVal.toFixed(2)}) × Stock ({stockVal}) = ${(costVal * stockVal).toFixed(2)} USD
                        </span>
                      </div>

                      <div className={styles.formGroup} style={{ justifyContent: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '1.2rem' }}>
                          <input 
                            type="checkbox" 
                            checked={!!editingProduct.creditPaid} 
                            onChange={(e) => setEditingProduct({ ...editingProduct, creditPaid: e.target.checked })}
                            style={{ width: '18px', height: '18px', accentColor: '#00F0FF' }}
                          />
                          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: editingProduct.creditPaid ? '#25D366' : 'white' }}>
                            {editingProduct.creditPaid ? '✅ Factura Cancelada al 100%' : '⏳ Factura Pendiente por Pagar'}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* TARJETA DE ANÁLISIS DE PUNTO DE EQUILIBRIO (BREAK-EVEN) */}
                    <div className={styles.breakEvenCard}>
                      <div className={styles.breakEvenHeader}>
                        <span className={styles.breakEvenTitle}>🎯 Análisis de Retorno & Punto de Equilibrio</span>
                        {(() => {
                          const days = getCreditDaysDiff(editingProduct.creditDueDate);
                          if (days === null) return null;
                          if (days < 0) return <span className={styles.badgeAlertRed}>🚨 Factura Vencida hace {Math.abs(days)} días</span>;
                          if (days === 0) return <span className={styles.badgeAlertRed}>🚨 Vence HOY</span>;
                          if (days <= 7) return <span className={styles.badgeAlertYellow}>⚠️ Vence en {days} días (¡Prioridad Rotación!)</span>;
                          return <span className={styles.badgeAlertGreen}>🟢 {days} días restantes de crédito</span>;
                        })()}
                      </div>

                      <div className={styles.breakEvenGrid}>
                        <div className={styles.breakEvenBox}>
                          <span className={styles.beLabel}>1. Unidades para Pagar Deuda</span>
                          <span className={`${styles.beVal} ${styles.beValDebt}`}>
                            {breakEvenUnits} unid.
                          </span>
                          <span className={styles.beSub}>
                            Recaudan ${((breakEvenUnits * priceVal) || 0).toFixed(2)} USD (cubren deuda de ${effectiveDebt.toFixed(2)})
                          </span>
                        </div>

                        <div className={styles.breakEvenBox}>
                          <span className={styles.beLabel}>2. Unidades de Ganancia Neta</span>
                          <span className={`${styles.beVal} ${styles.beValProfit}`}>
                            {freeProfitUnits} unid.
                          </span>
                          <span className={styles.beSub}>
                            +{formatPrice(projectedFreeProfitUSD)} USD libres para tu cuenta
                          </span>
                        </div>

                        <div className={styles.breakEvenBox}>
                          <span className={styles.beLabel}>3. Fondo Requerido Proveedor</span>
                          <span className={`${styles.beVal} ${styles.beValCyan}`}>
                            ${effectiveDebt.toFixed(2)} USD
                          </span>
                          <span className={styles.beSub}>
                            ≈ {formatPrice(effectiveDebt)} intocables para el proveedor
                          </span>
                        </div>
                      </div>

                      <div className={styles.breakEvenAdvice}>
                        💡 <strong>Regla Financiera:</strong> Los primeros <strong>${effectiveDebt.toFixed(2)} USD</strong> cobrados por las primeras <strong>{breakEvenUnits} unidades</strong> vendidas deben apartarse exclusivamente para pagar la factura del proveedor antes del {editingProduct.creditDueDate || 'vencimiento'}. A partir de la <strong>unidad {breakEvenUnits + 1}</strong>, todo el dinero cobrado es ganancia líquida pura.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* GESTIÓN DE VARIACIONES: SABORES Y PESO / PRESENTACIONES   */}
              {/* ======================================================== */}
              {editingProduct.category !== 'Ropa' ? (
                <>
                  {/* 1. Variación de Sabores */}
                  <div className={styles.variationManager}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      🍓 Variaciones de Sabores
                    </label>
                    
                    {/* Active selected flavor tags */}
                    <div className={styles.activeTagsList}>
                      {currentFlavorsList.length === 0 ? (
                        <span className={styles.noTagsMsg}>Sin sabores asignados aún (haz clic en los preajustes abajo o escribe uno nuevo).</span>
                      ) : (
                        currentFlavorsList.map(flavor => (
                          <span key={flavor} className={styles.tagChip}>
                            {flavor}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveFlavor(flavor)}
                              className={styles.tagRemoveBtn}
                              title={`Eliminar sabor ${flavor}`}
                            >
                              ✕
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Add custom flavor input */}
                    <div className={styles.addTagRow}>
                      <input 
                        type="text" 
                        className={styles.addTagInput}
                        value={customFlavor}
                        onChange={(e) => setCustomFlavor(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddFlavor(customFlavor);
                          }
                        }}
                        placeholder="Escribe un sabor personalizado..."
                      />
                      <button 
                        type="button" 
                        className={styles.addTagBtn}
                        onClick={() => handleAddFlavor(customFlavor)}
                      >
                        + Agregar Sabor
                      </button>
                    </div>

                    {/* Preset quick pills */}
                    <div className={styles.quickPillsLabel}>Sugerencias Rápidas:</div>
                    <div className={styles.quickPillsGrid}>
                      {PRESET_FLAVORS.map(fl => {
                        const isAdded = currentFlavorsList.includes(fl);
                        return (
                          <button
                            key={fl}
                            type="button"
                            className={`${styles.quickPillBtn} ${isAdded ? styles.quickPillActive : ''}`}
                            onClick={() => isAdded ? handleRemoveFlavor(fl) : handleAddFlavor(fl)}
                          >
                            {isAdded ? '✓ ' : '+ '} {fl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Variación de Peso o Presentaciones */}
                  <div className={styles.variationManager}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      ⚖️ Peso o Presentaciones
                    </label>
                    
                    {/* Active selected weight/presentation tags */}
                    <div className={styles.activeTagsList}>
                      {currentWeightsList.length === 0 ? (
                        <span className={styles.noTagsMsg}>Sin presentaciones asignadas aún.</span>
                      ) : (
                        currentWeightsList.map(weight => (
                          <span key={weight} className={styles.tagChip} style={{ borderColor: 'rgba(37, 211, 102, 0.4)', color: '#25D366', background: 'rgba(37, 211, 102, 0.1)' }}>
                            {weight}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveWeight(weight)}
                              className={styles.tagRemoveBtn}
                              title={`Eliminar presentación ${weight}`}
                            >
                              ✕
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Add custom weight input */}
                    <div className={styles.addTagRow}>
                      <input 
                        type="text" 
                        className={styles.addTagInput}
                        value={customWeight}
                        onChange={(e) => setCustomWeight(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddWeight(customWeight);
                          }
                        }}
                        placeholder="Ej: 300g, 5 lbs, 60 cápsulas, 1 Galón..."
                      />
                      <button 
                        type="button" 
                        className={styles.addTagBtn}
                        onClick={() => handleAddWeight(customWeight)}
                      >
                        + Agregar Presentación
                      </button>
                    </div>

                    {/* Preset weight quick pills */}
                    <div className={styles.quickPillsLabel}>Presentaciones Habituales:</div>
                    <div className={styles.quickPillsGrid}>
                      {PRESET_WEIGHTS.map(wt => {
                        const isAdded = currentWeightsList.includes(wt);
                        return (
                          <button
                            key={wt}
                            type="button"
                            className={`${styles.quickPillBtn} ${isAdded ? styles.quickPillActive : ''}`}
                            onClick={() => isAdded ? handleRemoveWeight(wt) : handleAddWeight(wt)}
                          >
                            {isAdded ? '✓ ' : '+ '} {wt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Porciones y Recompra */}
                  <div className={styles.priceGrid}>
                    <div className={styles.formGroup}>
                      <label>Servicios / Porciones Estimadas</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={editingProduct.portions || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, portions: e.target.value})}
                        placeholder="Ej: 30 servicios o 60 scoops"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Días de Ciclo Sugeridos (Recompra)</label>
                      <input 
                        type="number" 
                        className={styles.formInput} 
                        value={editingProduct.durationInDays || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, durationInDays: e.target.value})}
                        placeholder="Ej: 30"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Clothing Sizes Selector */
                <div className={styles.formGroup}>
                  <label>Tallas Disponibles (Ropa Deportiva)</label>
                  <div className={styles.sizesGrid}>
                    {['S', 'M', 'L', 'XL', 'XXL', 'Talla Única'].map(size => (
                      <button 
                        key={size}
                        type="button"
                        className={`${styles.sizeBtn} ${(editingProduct.sizes as string[])?.includes(size) ? styles.sizeBtnActive : ''}`}
                        onClick={() => toggleSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Upload, Multi-Image Gallery (Up to 10 photos) */}
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem' }}>
                    📸 Galería de Imágenes ({currentImagesList.length}/10 fotos) *
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#00F0FF', fontWeight: 600 }}>
                    ⭐ La 1ª imagen es la Portada principal
                  </span>
                </div>
                
                <div className={styles.imageUploadCard}>
                  {/* Upload Action Button & Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageFileUpload} 
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/avif" 
                      multiple 
                      style={{ display: 'none' }} 
                    />
                    <button 
                      type="button" 
                      className={`${styles.uploadFileBtn} ${uploadingImage ? styles.uploadFileBtnLoading : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage || currentImagesList.length >= 10}
                    >
                      {uploadingImage 
                        ? '⏳ Subiendo fotos al servidor...' 
                        : currentImagesList.length >= 10 
                          ? '✅ Límite alcanzado (10 fotos)' 
                          : '📁 Subir Fotos desde tu Dispositivo (Hasta 10)'}
                    </button>

                    {uploadSuccess && (
                      <span className={styles.uploadStatusMsg}>
                        ✓ {uploadSuccess}
                      </span>
                    )}

                    {uploadError && (
                      <span className={styles.uploadErrorMsg}>
                        ⚠️ {uploadError}
                      </span>
                    )}

                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
                      Puedes seleccionar varias fotos a la vez (PNG, JPG, WEBP). Se admiten hasta 10 fotos por producto.
                    </span>
                  </div>

                  {/* Multi-Image Gallery Grid (10 slots max) */}
                  <div className={styles.multiImageGalleryGrid}>
                    {currentImagesList.map((imgUrl, index) => {
                      const isMain = index === 0;
                      return (
                        <div 
                          key={`${imgUrl}-${index}`} 
                          className={`${styles.galleryThumbSlot} ${isMain ? styles.galleryThumbMain : ''}`}
                          onClick={() => {
                            if (!isMain) handleSetPrimaryImage(index);
                          }}
                          title={isMain ? 'Foto de Portada' : 'Haz clic para hacerla Portada principal'}
                        >
                          <img 
                            src={imgUrl} 
                            alt={`Foto ${index + 1}`} 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/protein.png';
                            }}
                          />
                          {isMain ? (
                            <span className={styles.mainThumbBadge}>⭐ Portada</span>
                          ) : (
                            <span style={{ 
                              position: 'absolute', 
                              bottom: '2px', 
                              left: '2px', 
                              right: '2px', 
                              fontSize: '0.58rem', 
                              background: 'rgba(0,0,0,0.7)', 
                              color: '#FFFFFF', 
                              textAlign: 'center', 
                              borderRadius: '3px',
                              padding: '1px'
                            }}>
                              Hacer Portada
                            </span>
                          )}
                          <button
                            type="button"
                            className={styles.removeImgBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                            title="Eliminar foto"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}

                    {/* Add Photo Slot Button if < 10 */}
                    {currentImagesList.length < 10 && (
                      <button
                        type="button"
                        className={styles.addSlotBtn}
                        onClick={() => fileInputRef.current?.click()}
                        title="Subir otra foto"
                      >
                        <span style={{ fontSize: '1.3rem', fontWeight: 300 }}>+</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Añadir</span>
                        <span style={{ fontSize: '0.58rem', opacity: 0.6 }}>({10 - currentImagesList.length} lib.)</span>
                      </button>
                    )}
                  </div>

                  {/* Manual URL Input */}
                  <div style={{ marginTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.8rem' }}>
                    <label style={{ fontSize: '0.74rem', marginBottom: '4px', display: 'block', color: 'rgba(255,255,255,0.7)' }}>
                      O introduce una URL / Ruta de foto para agregar a la galería:
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (manualImageUrl.trim()) {
                              handleAddManualImageUrl(manualImageUrl);
                              setManualImageUrl('');
                            }
                          }
                        }}
                        placeholder="Ej: /brand-photos/Suplementos/IMG-20260513-WA0017.jpg"
                        style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem', flex: 1 }}
                      />
                      <button 
                        type="button"
                        className={styles.presetBtn}
                        style={{ borderColor: '#00F0FF', color: '#00F0FF', whiteSpace: 'nowrap', padding: '0 1rem' }}
                        onClick={() => {
                          if (manualImageUrl.trim()) {
                            handleAddManualImageUrl(manualImageUrl);
                            setManualImageUrl('');
                          }
                        }}
                        disabled={!manualImageUrl.trim() || currentImagesList.length >= 10}
                      >
                        + Agregar a Galería
                      </button>
                    </div>
                  </div>

                  {/* Default Quick Presets */}
                  <div className={styles.imagePresets} style={{ marginTop: '0.6rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', alignSelf: 'center' }}>Preajustes rápidos:</span>
                    {['/protein.png', '/creatine.png', '/amino.png', '/hoodie.png'].map(img => (
                      <button 
                        key={img} 
                        type="button" 
                        onClick={() => handleAddManualImageUrl(img)}
                        className={`${styles.presetBtn} ${currentImagesList.includes(img) ? styles.presetActive : ''}`}
                        title="Agregar imagen predeterminada a la galería"
                      >
                        {currentImagesList.includes(img) ? `✓ ${img}` : `+ ${img}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label>Descripción Comercial / Ficha de Uso</label>
                <textarea 
                  className={styles.formTextarea}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  placeholder="Describe los beneficios, modo de uso y pureza científica del producto..."
                  rows={3}
                />
              </div>

              {/* Switches */}
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={!!editingProduct.isFeatured}
                    onChange={(e) => setEditingProduct({...editingProduct, isFeatured: e.target.checked})}
                    className={styles.realCheckbox}
                  />
                  <span className={styles.customToggle}></span>
                  Destacar en Portada
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={!!editingProduct.isOffer}
                    onChange={(e) => setEditingProduct({...editingProduct, isOffer: e.target.checked})}
                    className={styles.realCheckbox}
                  />
                  <span className={styles.customToggle}></span>
                  Marcar como Oferta Especial
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal} type="button">Cancelar</button>
              <button className={styles.saveBtn} onClick={handleSave} type="button">
                {editingProduct.id === 0 ? 'Registrar Producto' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
