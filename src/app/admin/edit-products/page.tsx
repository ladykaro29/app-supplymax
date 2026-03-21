'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import { PRODUCTS, Product } from '@/data/products';
import styles from './EditProducts.module.css';
import Image from 'next/image';

export default function EditProductsPage() {
  const { user, formatPrice } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  // Admin and restricted role check (from prompt: Administrador de inventarios, repartidor, empleado, subgerente)
  // For now, let's allow Admin and Subgerente/Inventarios to access this.
  const allowedRoles = ['Admin', 'Subgerente', 'Administrador de inventarios'];
  
  if (!user || !allowedRoles.includes(user.role_id)) {
    return (
      <div className={styles.unauthorized}>
        <Header />
        <h1>Acceso Denegado</h1>
        <p>Solo personal autorizado puede gestionar el inventario.</p>
      </div>
    );
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleEdit = (product: Product) => {
    // Clone to avoid direct mutations
    setEditingProduct({ ...product });
  };

  const closeModal = () => {
    setEditingProduct(null);
  };

  const handleSave = () => {
    if (!editingProduct) return;
    
    setProducts(prev => prev.map(p => 
      p.id === editingProduct.id ? editingProduct : p
    ));
    
    // In a real app, this would be an API call
    alert(`Producto "${editingProduct.name}" actualizado.`);
    closeModal();
  };

  const toggleSize = (size: string) => {
    if (!editingProduct) return;
    const currentSizes = editingProduct.sizes || [];
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
        </header>

        <div className={styles.grid}>
          {filteredProducts.map(product => {
            const finalPrice = product.isOffer && product.discount 
              ? product.price - product.discount 
              : product.price;

            return (
              <div key={product.id} className={styles.productCard}>
                <button 
                  className={styles.editBtn} 
                  onClick={() => handleEdit(product)}
                  title="Editar producto"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                
                <div className={styles.imageWrapper}>
                  <img src={product.image} alt={product.name} className={styles.productImage} />
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
      </main>

      {/* Edit Modal */}
      {editingProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Editar {editingProduct.category}</h2>
              <button className={styles.closeModal} onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Nombre del Producto</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                />
              </div>

              {/* Category specific fields */}
              {editingProduct.category === 'Suplementos' ? (
                <>
                  <div className={styles.priceGrid}>
                    <div className={styles.formGroup}>
                      <label>Porciones</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={editingProduct.portions || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, portions: e.target.value})}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Sabor</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={editingProduct.flavor || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, flavor: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Peso del producto</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={editingProduct.weight || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, weight: e.target.value})}
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
                        className={`${styles.sizeBtn} ${editingProduct.sizes?.includes(size) ? styles.sizeBtnActive : ''}`}
                        onClick={() => toggleSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Descripción (Opcional)</label>
                <textarea 
                  className={styles.formTextarea}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                />
              </div>

              <div className={styles.priceGrid}>
                <div className={styles.formGroup}>
                  <label>Precio Compra ($)</label>
                  <input 
                    type="number" 
                    className={styles.formInput} 
                    value={editingProduct.purchasePrice || 0}
                    onChange={(e) => setEditingProduct({...editingProduct, purchasePrice: parseFloat(e.target.value)})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Precio Venta ($)</label>
                  <input 
                    type="number" 
                    className={styles.formInput} 
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={editingProduct.isFeatured}
                    onChange={(e) => setEditingProduct({...editingProduct, isFeatured: e.target.checked})}
                  />
                  Producto Destacado
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={editingProduct.isOffer}
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
                    placeholder="Cantidad a restar del precio normal"
                    value={editingProduct.discount || 0}
                    onChange={(e) => setEditingProduct({...editingProduct, discount: parseFloat(e.target.value)})}
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
