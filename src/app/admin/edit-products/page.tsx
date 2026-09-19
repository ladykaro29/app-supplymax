'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/Header/Header';
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
const PRESET_FLAVORS = ['Vainilla', 'Chocolate', 'Fresa', 'Cookies & Cream', 'Neutro', 'Fruit Punch', 'Limonada', 'Blue Raspberry'];

export default function EditProductsPage() {
  const { user, formatPrice, authLoading } = useAppContext();
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filter products based on search term and category pills
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchTerm.toLowerCase());
      
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
        <Header />
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1>Acceso Restringido</h1>
          <p>Solo personal del staff con permisos de inventario puede acceder a este panel.</p>
        </div>
      </div>
    );
  }

  const handleCreateNew = () => {
    setEditingProduct({ ...BLANK_PRODUCT });
  };

  const handleEdit = (product: Product) => {
    let sizesArr: string[] = [];
    if (Array.isArray(product.sizes)) {
      sizesArr = product.sizes;
    } else if (typeof product.sizes === 'string') {
      sizesArr = product.sizes.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    setEditingProduct({ 
      ...product, 
      sizes: sizesArr,
      price: product.price || 0,
      purchasePrice: product.purchasePrice || 0,
      discount: product.discount || 0,
      stock: product.stock ?? 10
    });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el producto "${name}"?`)) {
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

  const toggleSize = (size: string) => {
    if (!editingProduct) return;
    const currentSizes = (editingProduct.sizes as string[]) || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    setEditingProduct({ ...editingProduct, sizes: newSizes });
  };

  const handleFlavorToggle = (flavorName: string) => {
    if (!editingProduct) return;
    const currentFlavors = editingProduct.flavor 
      ? editingProduct.flavor.split(',').map(f => f.trim()).filter(Boolean)
      : [];
      
    let newFlavors;
    if (currentFlavors.includes(flavorName)) {
      newFlavors = currentFlavors.filter(f => f !== flavorName);
    } else {
      newFlavors = [...currentFlavors, flavorName];
    }
    setEditingProduct({ ...editingProduct, flavor: newFlavors.join(', ') });
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <span className={styles.sectionBadge}>Gestión de Stock</span>
            <h1>Catálogo de <span>Productos</span></h1>
            <p>Monitoreo de inventarios, precios y control de ofertas deportivas</p>
          </div>
          
          <div className={styles.headerActions}>
            <div className={styles.searchBar}>
              <div className={styles.searchIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button className={styles.addBtn} onClick={handleCreateNew}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Registrar Producto
            </button>
          </div>
        </header>

        {/* CATEGORY FAST PILLS */}
        <div className={styles.categoryPills}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.pillBtn} ${activeCategory === cat ? styles.activePill : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* INVENTORY VIEWS */}
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Conectando con base de datos SQLite...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>⚠️ {error}</p>
            <button onClick={loadProducts} className={styles.retryBtn}>Reintentar Sincronización</button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No se encontraron productos en esta categoría o búsqueda.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredProducts.map(product => {
              const finalPrice = product.isOffer && product.discount 
                ? product.price - product.discount 
                : product.price;

              return (
                <div key={product.id} className={styles.productCard}>
                  
                  {/* Floating Action Overlay on Hover */}
                  <div className={styles.cardHoverOverlay}>
                    <button 
                      className={styles.floatingEditBtn}
                      onClick={() => handleEdit(product)}
                      title="Editar Producto"
                    >
                      ✏️
                    </button>
                    <button 
                      className={styles.floatingDeleteBtn}
                      onClick={() => handleDelete(product.id, product.name)}
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
                        <span className={`${styles.stockBadge} ${styles.outOfStock}`}>Agotado</span>
                      ) : product.stock < 5 ? (
                        <span className={`${styles.stockBadge} ${styles.lowStock}`}>Bajo Stock ({product.stock})</span>
                      ) : (
                        <span className={`${styles.stockBadge} ${styles.okStock}`}>Stock: {product.stock}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.info}>
                    <span className={styles.cardCategory}>{product.category}</span>
                    <h3 className={styles.name}>{product.name}</h3>
                    
                    <div className={styles.priceRow}>
                      <span className={styles.currentPrice}>{formatPrice(finalPrice)}</span>
                      {product.isOffer && (
                        <span className={styles.oldPrice}>{formatPrice(product.price)}</span>
                      )}
                    </div>
                    
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
              <div className={styles.formGroup}>
                <label>Nombre del Producto *</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  placeholder="Ej: Creatina Micronizada 100% Pura"
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
                    placeholder="Ej: FUERZA, MÁS RENTABLE, TOP"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>URL o Ruta de la Imagen</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                  placeholder="Ej: /protein.png o URL completa de la imagen"
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

              {/* Nutri/Sport Details (only if not apparel/Ropa) */}
              {editingProduct.category !== 'Ropa' ? (
                <>
                  <div className={styles.priceGrid}>
                    <div className={styles.formGroup}>
                      <label>Servicios / Porciones</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={editingProduct.portions || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, portions: e.target.value})}
                        placeholder="Ej: 30 servicios"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Peso Neto</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={editingProduct.weight || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, weight: e.target.value})}
                        placeholder="Ej: 300g o 2.2 lbs"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Sabor Actual / Personalizado</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={editingProduct.flavor || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, flavor: e.target.value})}
                      placeholder="Sabores separados por comas (Ej: Vainilla, Chocolate)"
                    />
                    
                    <div className={styles.flavorChecklistTitle}>Checklist de Sabores Rápidos:</div>
                    <div className={styles.flavorsGrid}>
                      {PRESET_FLAVORS.map(fl => {
                        const currentFlavors = editingProduct.flavor 
                          ? editingProduct.flavor.split(',').map(f => f.trim())
                          : [];
                        const isChecked = currentFlavors.includes(fl);
                        
                        return (
                          <button
                            key={fl}
                            type="button"
                            className={`${styles.flavorPill} ${isChecked ? styles.flavorActive : ''}`}
                            onClick={() => handleFlavorToggle(fl)}
                          >
                            {isChecked ? '✓ ' : '+ '} {fl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Duración Sugerida de Ciclo (Días para recompra)</label>
                    <input 
                      type="number" 
                      className={styles.formInput} 
                      value={editingProduct.durationInDays || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, durationInDays: e.target.value})}
                      placeholder="Ej: 30"
                    />
                  </div>
                </>
              ) : (
                <div className={styles.formGroup}>
                  <label>Tallas Disponibles</label>
                  <div className={styles.sizesGrid}>
                    {['S', 'M', 'L', 'XL'].map(size => (
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

              <div className={styles.formGroup}>
                <label>Descripción Científica / Comercial</label>
                <textarea 
                  className={styles.formTextarea}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  placeholder="Escribe los ingredientes principales, dosis recomendadas y beneficios clave..."
                />
              </div>

              <div className={styles.priceGrid}>
                <div className={styles.formGroup}>
                  <label>Precio de Adquisición ($ USD)</label>
                  <input 
                    type="number" 
                    className={styles.formInput} 
                    value={editingProduct.purchasePrice || 0}
                    onChange={(e) => setEditingProduct({...editingProduct, purchasePrice: parseFloat(e.target.value) || 0})}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Precio de Venta ($ USD) *</label>
                  <input 
                    type="number" 
                    className={styles.formInput} 
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className={styles.priceGrid}>
                {/* Critical Stock Management Field */}
                <div className={styles.formGroup}>
                  <label>Stock en Inventario *</label>
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
                  Activar Oferta Relámpago
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Descartar</button>
              <button className={styles.saveBtn} onClick={handleSave}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
