'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
}

const BLANK_PRODUCT: Product = {
  id: 0,
  name: '',
  category: 'Proteínas',
  goal: '',
  price: 0,
  purchasePrice: 0,
  image: '/protein.png',
  description: '',
  portions: '',
  flavor: '',
  weight: '',
  sizes: [],
  isFeatured: false,
  isOffer: false,
  discount: 0,
  stock: 10,
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

  // Filter products based on search term and category pills
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (p.flavor && p.flavor.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (p.weight && p.weight.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/products');
      if (!res.ok) {
        throw new Error('No se pudieron obtener los productos de la base de datos.');
      }
      const data = await res.json();
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
    }
  }, [isMounted]);

  // Allowed Roles
  const allowedRoles = ['Admin', 'Subgerente', 'Administrador de inventarios'];
  
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

  if (!user || !allowedRoles.includes(user.role_id)) {
    return (
      <div className={styles.unauthorized}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1>Acceso Restringido</h1>
          <p>Solo personal del staff con permisos de inventario puede acceder a este panel.</p>
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
      
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
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
    const cost = editingProduct.purchasePrice || 0;
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
    const cost = editingProduct.purchasePrice || 0;
    if (cost > 0 && price > cost) {
      const effectiveMarkup = Math.round(((price - cost) / cost) * 100);
      setSelectedMargin(effectiveMarkup);
    }
    setEditingProduct({
      ...editingProduct,
      price,
    });
  };

  // Flavor Variation Tag Helpers
  const currentFlavorsList = useMemo(() => {
    if (!editingProduct || !editingProduct.flavor) return [];
    return editingProduct.flavor
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);
  }, [editingProduct?.flavor]);

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

  // Weight / Presentation Variation Tag Helpers
  const currentWeightsList = useMemo(() => {
    if (!editingProduct || !editingProduct.weight) return [];
    return editingProduct.weight
      .split(',')
      .map(w => w.trim())
      .filter(Boolean);
  }, [editingProduct?.weight]);

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
  const costVal = editingProduct?.purchasePrice || 0;
  const priceVal = editingProduct?.price || 0;
  const stockVal = editingProduct?.stock || 0;
  const unitProfitVal = Math.max(0, priceVal - costVal);
  const marginPctVal = priceVal > 0 ? Math.round((unitProfitVal / priceVal) * 100) : 0;
  const totalProjectedProfitVal = unitProfitVal * stockVal;

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Header Title & Actions */}
        <header className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <span className={styles.sectionBadge}>Gestión de Stock & Rentabilidad</span>
            <h1>Inventario de <span>Productos</span></h1>
            <p>Control de costos de compra, cálculo de precios de venta, stock en tiempo real y variaciones</p>
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
            
            <button className={styles.createNewBtn} onClick={handleCreateNew}>
              <span className={styles.plusIcon}>+</span> Registrar Producto
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
            <span className={styles.statVal}>{products.length} productos</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Disponibles</span>
            <span className={`${styles.statVal} ${styles.statGreen}`}>
              {products.filter(p => p.stock > 5).length}
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Stock Bajo</span>
            <span className={`${styles.statVal} ${styles.statYellow}`}>
              {products.filter(p => p.stock > 0 && p.stock <= 5).length}
            </span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Agotados</span>
            <span className={`${styles.statVal} ${styles.statRed}`}>
              {products.filter(p => p.stock === 0).length}
            </span>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Conectando con base de datos...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>⚠️ {error}</p>
            <button onClick={loadProducts} className={styles.retryBtn}>Reintentar Sincronización</button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No se encontraron productos en esta categoría o con el término buscado.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredProducts.map(product => {
              const cost = product.purchasePrice || 0;
              const profit = Math.max(0, product.price - cost);
              const finalPrice = product.isOffer && product.discount 
                ? product.price - product.discount 
                : product.price;

              return (
                <div key={product.id} className={styles.productCard} onClick={() => handleEdit(product)}>
                  
                  {/* Floating Action Overlay on Hover */}
                  <div className={styles.cardHoverOverlay}>
                    <button 
                      className={styles.floatingEditBtn}
                      onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                      title="Editar Producto y Variaciones"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className={styles.floatingDeleteBtn}
                      onClick={(e) => { e.stopPropagation(); handleDelete(product.id, product.name); }}
                      title="Eliminar de DB"
                    >
                      🗑️
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
                          {product.weight.split(',')[0]}
                        </span>
                      )}
                    </div>

                    <h3 className={styles.name}>{product.name}</h3>
                    
                    {/* Price and Cost Row */}
                    <div className={styles.priceRow}>
                      <span className={styles.currentPrice}>{formatPrice(finalPrice)}</span>
                      {product.isOffer && (
                        <span className={styles.oldPrice}>{formatPrice(product.price)}</span>
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
                      }
                      setEditingProduct({...editingProduct, category: cat, image: defaultImg});
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
                      +${unitProfitVal.toFixed(2)} USD
                    </span>
                  </div>

                  <div className={styles.profitMetricBox}>
                    <span className={styles.metricLabel}>Margen Comercial</span>
                    <span className={`${styles.metricValue} ${styles.metricValueCyan}`}>
                      {marginPctVal}% <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>(+{selectedMargin}%)</span>
                    </span>
                  </div>

                  <div className={styles.profitMetricBox}>
                    <span className={styles.metricLabel}>Ganancia Total del Lote</span>
                    <span className={`${styles.metricValue} ${styles.metricValuePositive}`}>
                      +${totalProjectedProfitVal.toFixed(2)} USD
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

              {/* Image Route and Presets */}
              <div className={styles.formGroup}>
                <label>URL o Ruta de la Imagen</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                  placeholder="Ej: /brand-photos/Suplementos/IMG-20260513-WA0017.jpg"
                />
                <div className={styles.imagePresets}>
                  {['/protein.png', '/creatine.png', '/amino.png', '/hoodie.png'].map(img => (
                    <button 
                      key={img} 
                      type="button" 
                      onClick={() => setEditingProduct({...editingProduct, image: img})}
                      className={`${styles.presetBtn} ${editingProduct.image === img ? styles.presetActive : ''}`}
                    >
                      {img}
                    </button>
                  ))}
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
