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
}

const BLANK_PRODUCT: Product = {
  id: 0, // 0 signifies creation mode
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
};

export default function EditProductsPage() {
  const { user, formatPrice } = useAppContext();
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Set isMounted on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch real products from DB
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

  // Admin and restricted role check
  const allowedRoles = ['Admin', 'Subgerente', 'Administrador de inventarios'];
  
  if (!isMounted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif' }}>
        <p>Cargando panel...</p>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role_id)) {
    return (
      <div className={styles.unauthorized}>
        <Header />
        <h1>Acceso Denegado</h1>
        <p>Solo personal autorizado puede gestionar el inventario.</p>
      </div>
    );
  }

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Open modal for a new product
  const handleCreateNew = () => {
    setEditingProduct({ ...BLANK_PRODUCT });
  };

  // Open modal for editing an existing product
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
      discount: product.discount || 0
    });
  };

  // Perform safe product deletion via API
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

  // Save changes (POST for new products, PUT for updates)
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

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Gestión de <span>Productos</span></h1>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className={styles.searchBar}>
              <div className={styles.searchIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <input 
                type="text" 
                placeholder="Buscar por nombre o categoría..." 
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button className={styles.addBtn} onClick={handleCreateNew}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Registrar Producto
            </button>
          </div>
        </header>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: 'rgba(255, 255, 255, 0.6)' }}>
            <p>Cargando productos reales desde base de datos...</p>
          </div>
        ) : error ? (
          <div style={{ background: 'rgba(255, 71, 87, 0.1)', border: '1px solid #ff4757', borderRadius: '12px', padding: '20px', color: '#ff4757', marginBottom: '20px' }}>
            <p>⚠️ {error}</p>
            <button onClick={loadProducts} className={styles.cancelBtn} style={{ marginTop: '10px', fontSize: '0.9rem', padding: '6px 15px' }}>Reintentar</button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
            <p style={{ opacity: 0.6 }}>No se encontraron productos coincidentes.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredProducts.map(product => {
              const finalPrice = product.isOffer && product.discount 
                ? product.price - product.discount 
                : product.price;

              return (
                <div key={product.id} className={styles.productCard}>
                  {/* Actions Group */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className={styles.deleteBtn} 
                      onClick={() => handleDelete(product.id, product.name)}
                      title="Eliminar producto"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                    
                    <button 
                      className={styles.editBtn} 
                      onClick={() => handleEdit(product)}
                      title="Editar producto"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  </div>
                  
                  <div className={styles.imageWrapper}>
                    <img src={product.image} alt={product.name} className={styles.productImage} onError={(e) => { (e.target as HTMLImageElement).src = '/protein.png'; }} />
                  </div>
                  
                  <div className={styles.info}>
                    <h3 className={styles.name}>{product.name}</h3>
                    <div className={styles.priceRow}>
                      <span className={styles.currentPrice}>{formatPrice(finalPrice)}</span>
                      {product.isOffer && (
                        <span className={styles.oldPrice}>{formatPrice(product.price)}</span>
                      )}
                    </div>
                    <div className={styles.badges}>
                      {product.isFeatured && <span className={`${styles.badge} ${styles.featuredBadge}`}>Destacado</span>}
                      {product.isOffer && <span className={`${styles.badge} ${styles.offerBadge}`}>Oferta -{product.discount}$</span>}
                      <span className={styles.badge}>{product.category}</span>
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
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingProduct.id === 0 ? 'Registrar Nuevo Producto' : `Editar ${editingProduct.category}`}</h2>
              <button className={styles.closeModal} onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Nombre del Producto *</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  placeholder="Ej: Creatina Micronizada 100%"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Categoría</label>
                <select 
                  className={styles.formInput} 
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
                <label>Meta / Etiqueta del Producto</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={editingProduct.goal || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, goal: e.target.value})}
                  placeholder="Ej: MÁS VENDIDO, OFERTA, LIFESTYLE..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Ruta o URL de la Imagen</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                  placeholder="Ej: /protein.png o URL completa de internet"
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {['/protein.png', '/creatine.png', '/amino.png', '/hoodie.png'].map(img => (
                    <button 
                      key={img} 
                      type="button" 
                      onClick={() => setEditingProduct({...editingProduct, image: img})}
                      style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                    >
                      {img}
                    </button>
                  ))}
                </div>
              </div>

              {/* FIXED: portions, flavor, weight shown for any category that is NOT apparel (Ropa) */}
              {editingProduct.category !== 'Ropa' ? (
                <>
                  <div className={styles.priceGrid}>
                    <div className={styles.formGroup}>
                      <label>Porciones</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={editingProduct.portions || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, portions: e.target.value})}
                        placeholder="Ej: 30 servicios"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Sabor</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={editingProduct.flavor || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, flavor: e.target.value})}
                        placeholder="Ej: Vainilla Ice Cream"
                      />
                    </div>
                  </div>
                  <div className={styles.priceGrid}>
                    <div className={styles.formGroup}>
                      <label>Peso del producto</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={editingProduct.weight || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, weight: e.target.value})}
                        placeholder="Ej: 300g o 2 lbs"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Duración en Días (Re-compra)</label>
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
                <label>Descripción</label>
                <textarea 
                  className={styles.formTextarea}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  placeholder="Detalles sobre beneficios, uso recomendado..."
                />
              </div>

              <div className={styles.priceGrid}>
                <div className={styles.formGroup}>
                  <label>Precio Compra ($)</label>
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
                  <label>Precio Venta ($) *</label>
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

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={!!editingProduct.isFeatured}
                    onChange={(e) => setEditingProduct({...editingProduct, isFeatured: e.target.checked})}
                  />
                  Producto Destacado
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={!!editingProduct.isOffer}
                    onChange={(e) => setEditingProduct({...editingProduct, isOffer: e.target.checked})}
                  />
                  Producto en Oferta
                </label>
              </div>

              {editingProduct.isOffer && (
                <div className={styles.formGroup} style={{ marginTop: '15px' }}>
                  <label>Descuento del producto en oferta ($)</label>
                  <input 
                    type="number" 
                    className={styles.formInput} 
                    placeholder="Cantidad a restar al precio de venta"
                    value={editingProduct.discount || 0}
                    onChange={(e) => setEditingProduct({...editingProduct, discount: parseFloat(e.target.value) || 0})}
                    step="0.01"
                    min="0"
                  />
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancelar</button>
              <button className={styles.saveBtn} onClick={handleSave}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
