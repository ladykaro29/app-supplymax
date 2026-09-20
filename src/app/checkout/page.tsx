'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { useAppContext } from '@/context/AppContext';
import styles from './Checkout.module.css';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const {
    cart,
    cartTotal,
    formatPrice,
    exchangeRate,
    bcvInfo,
    user,
    login,
    logout,
    completeOrder,
    setCartOpen,
  } = useAppContext();

  const router = useRouter();

  // Auth / Registration state in checkout
  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Registration Form
  const [regForm, setRegForm] = useState({
    name: '',
    idType: 'V',
    idNumber: '',
    phone: '',
    email: '',
    password: '',
    newsletter: true,
  });

  // Login Form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Extra customer info update (if user already logged in but missing phone/cédula)
  const [profileIdType, setProfileIdType] = useState('V');
  const [profileIdNum, setProfileIdNum] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Shipping State
  const [shippingLevel, setShippingLevel] = useState<1 | 2 | 3>(1);
  const [agency, setAgency] = useState<string>('MRW');
  const [localAddress, setLocalAddress] = useState('');
  const [localTime, setLocalTime] = useState('');
  const [muniLocation, setMuniLocation] = useState('');
  const [nationalState, setNationalState] = useState('');
  const [nationalAgency, setNationalAgency] = useState('');

  // Payment & Discount State
  const [paymentRef, setPaymentRef] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ val: number; type: string } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize missing profile fields if user logged in
  useEffect(() => {
    if (user) {
      if (user.phone && !profilePhone) setProfilePhone(user.phone);
      if (user.idNumber && !profileIdNum) {
        const parts = user.idNumber.split('-');
        if (parts.length > 1) {
          setProfileIdType(parts[0]);
          setProfileIdNum(parts.slice(1).join('-'));
        } else {
          setProfileIdNum(user.idNumber);
        }
      }
    }
  }, [user]);

  // Discount coupon validation
  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    setIsValidating(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedDiscount({ val: data.discount, type: data.discountType });
        alert(
          `Código aplicado con éxito: ${
            data.discountType === 'PERCENT' ? data.discount * 100 + '%' : '$' + data.discount
          } de descuento.`
        );
      } else {
        setAppliedDiscount(null);
        alert(data.error || 'Código no válido');
      }
    } catch (err) {
      alert('Error al validar código');
    } finally {
      setIsValidating(false);
    }
  };

  const calculateFinalTotal = () => {
    if (!appliedDiscount) return cartTotal;
    if (appliedDiscount.type === 'PERCENT') {
      return cartTotal * (1 - appliedDiscount.val);
    }
    return Math.max(0, cartTotal - appliedDiscount.val);
  };

  const finalTotal = calculateFinalTotal();
  const activeRate = bcvInfo?.rate || exchangeRate || 60;
  const finalTotalInVES = finalTotal * activeRate;

  // Handle in-checkout registration
  const handleCheckoutRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!regForm.name.trim()) {
      setAuthError('Por favor ingresa tu Nombre y Apellido');
      return;
    }
    if (!regForm.idNumber.trim()) {
      setAuthError('Por favor ingresa tu Cédula de Identidad o RIF');
      return;
    }
    if (!regForm.phone.trim()) {
      setAuthError('Por favor ingresa tu número telefónico / WhatsApp');
      return;
    }
    if (!regForm.email.trim()) {
      setAuthError('Por favor ingresa tu correo electrónico');
      return;
    }
    if (!regForm.password || regForm.password.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setAuthLoading(true);
    try {
      const fullId = `${regForm.idType}-${regForm.idNumber.trim()}`;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regForm.name.trim(),
          email: regForm.email.trim(),
          password: regForm.password,
          phone: regForm.phone.trim(),
          idNumber: fullId,
          newsletter: regForm.newsletter,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      login(data);
    } catch (err: any) {
      setAuthError(err.message || 'Error de conexión al registrarse');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle in-checkout login
  const handleCheckoutLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

      login(data);
    } catch (err: any) {
      setAuthError(err.message || 'Error al iniciar sesión');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle saving missing customer details for logged in user
  const handleSaveMissingDetails = async () => {
    if (!user) return;
    if (!profileIdNum.trim() || !profilePhone.trim()) {
      alert('Debes ingresar tu cédula y teléfono para continuar.');
      return;
    }

    setSavingProfile(true);
    try {
      const fullId = `${profileIdType}-${profileIdNum.trim()}`;
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phone: profilePhone.trim(),
          idNumber: fullId,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        login(updated);
        alert('Datos de cliente guardados correctamente.');
      } else {
        alert('No se pudieron actualizar los datos.');
      }
    } catch (e) {
      alert('Error de conexión al actualizar datos.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Order submission
  const handleOrder = async () => {
    if (!user) {
      alert('Debes registrarte o iniciar sesión para completar tu compra.');
      return;
    }

    const currentId = user.idNumber || (profileIdNum ? `${profileIdType}-${profileIdNum.trim()}` : null);
    const currentPhone = user.phone || profilePhone.trim();

    if (!currentId || !currentPhone) {
      alert('Por favor completa tu Cédula y Teléfono de contacto antes de continuar.');
      return;
    }

    if (!paymentRef.trim() && !fileUploaded) {
      alert('Por favor ingresa la referencia de tu pago o sube el comprobante.');
      return;
    }

    setLoading(true);

    const shippingInfo =
      shippingLevel === 1
        ? `Local Mérida: ${localAddress || 'Sin dirección especificada'} (${localTime || 'Horario regular'})`
        : shippingLevel === 2
        ? `Municipio: ${muniLocation || 'Mérida interior'} via ${agency}`
        : `Nacional: ${nationalState || 'Estado'} - ${nationalAgency || 'Oficina'} via ${agency}`;

    try {
      const res = await completeOrder({
        referralCode: discountCode,
        agency: shippingInfo,
        paymentRef: paymentRef.trim() || (fileUploaded ? 'COMPROBANTE SUBIDO' : 'VERIFICACIÓN PENDIENTE'),
        total: finalTotal,
        totalVes: finalTotalInVES,
        bcvRate: activeRate,
        customerName: user.name,
        customerIdNumber: currentId,
        customerPhone: currentPhone,
        customerEmail: user.email,
      });

      if (res) {
        alert('¡Excelente! Tu pedido ha sido registrado con éxito a la tasa oficial del BCV.');
        router.push('/profile/orders');
      } else {
        alert('Hubo un error al procesar tu pedido. Intenta nuevamente.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al procesar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  const statesOfVenezuelaByAgency = [
    'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes',
    'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'Lara', 'Mérida', 'Miranda',
    'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
  ];

  if (cart.length === 0) {
    if (typeof window !== 'undefined') router.push('/catalog');
    return null;
  }

  const hasCompleteCustomerData = user && (user.idNumber || profileIdNum) && (user.phone || profilePhone);

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.layout}>
        <div className={styles.content}>
          {/* STEP 1: CUSTOMER IDENTIFICATION / REGISTRATION */}
          <section className={styles.section}>
            <h2>1. DATOS DEL CLIENTE</h2>

            {!user ? (
              <div className={styles.authBox}>
                <div className={styles.authTabs}>
                  <button
                    type="button"
                    className={`${styles.authTab} ${authTab === 'register' ? styles.activeAuthTab : ''}`}
                    onClick={() => {
                      setAuthTab('register');
                      setAuthError('');
                    }}
                  >
                    📝 Crear Cuenta Nueva
                  </button>
                  <button
                    type="button"
                    className={`${styles.authTab} ${authTab === 'login' ? styles.activeAuthTab : ''}`}
                    onClick={() => {
                      setAuthTab('login');
                      setAuthError('');
                    }}
                  >
                    🔑 Ya Tengo Cuenta
                  </button>
                </div>

                <div className={styles.authContent}>
                  {authError && <div className={styles.authError}>{authError}</div>}

                  {authTab === 'register' ? (
                    <form onSubmit={handleCheckoutRegister}>
                      <div className={styles.authHeaderMsg}>
                        🔒 <strong>Registro obligatorio para facturación y despacho:</strong> Ingresa tus datos para registrar tu pedido y recibir notificaciones de envío.
                      </div>

                      <div className={styles.authGrid}>
                        <div className={styles.formGroup}>
                          <label>Nombre y Apellido *</label>
                          <input
                            type="text"
                            placeholder="Ej. Carlos Mendoza"
                            className={styles.input}
                            required
                            value={regForm.name}
                            onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Cédula de Identidad / RIF *</label>
                          <div className={styles.idInputWrap}>
                            <select
                              className={styles.idTypeSelect}
                              value={regForm.idType}
                              onChange={(e) => setRegForm({ ...regForm, idType: e.target.value })}
                            >
                              <option value="V">V-</option>
                              <option value="E">E-</option>
                              <option value="J">J-</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Ej. 18992345"
                              className={styles.input}
                              required
                              value={regForm.idNumber}
                              onChange={(e) => setRegForm({ ...regForm, idNumber: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Teléfono Móvil / WhatsApp *</label>
                          <input
                            type="tel"
                            placeholder="Ej. 0414-7221133"
                            className={styles.input}
                            required
                            value={regForm.phone}
                            onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Correo Electrónico *</label>
                          <input
                            type="email"
                            placeholder="tucorreo@email.com"
                            className={styles.input}
                            required
                            value={regForm.email}
                            onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                          />
                        </div>

                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                          <label>Contraseña de tu Cuenta *</label>
                          <input
                            type="password"
                            placeholder="Crea una contraseña segura (mín. 6 caracteres)"
                            className={styles.input}
                            required
                            value={regForm.password}
                            onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          marginTop: '8px',
                          marginBottom: '16px',
                        }}
                      >
                        <input
                          type="checkbox"
                          id="checkoutNewsletter"
                          checked={regForm.newsletter}
                          onChange={(e) => setRegForm({ ...regForm, newsletter: e.target.checked })}
                          style={{
                            width: '18px',
                            height: '18px',
                            accentColor: 'var(--color-primary, #e2fd52)',
                            marginTop: '2px',
                            cursor: 'pointer',
                          }}
                        />
                        <label
                          htmlFor="checkoutNewsletter"
                          style={{ fontSize: '0.85rem', color: '#ccc', cursor: 'pointer', lineHeight: 1.4 }}
                        >
                          Deseo suscribirme al boletín informativo de SupplyMax para recibir promociones exclusivas, nuevos lanzamientos y consejos de entrenamiento.
                        </label>
                      </div>

                      <button type="submit" className={styles.authActionBtn} disabled={authLoading}>
                        {authLoading ? 'CREANDO CUENTA...' : 'CREAR CUENTA Y CONTINUAR'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleCheckoutLogin}>
                      <div className={styles.authHeaderMsg}>
                        👋 Si ya tienes cuenta registrada en SupplyMax, inicia sesión para autocompletar tus datos.
                      </div>

                      <div className={styles.formGroup}>
                        <label>Correo Electrónico</label>
                        <input
                          type="email"
                          placeholder="tu@email.com"
                          className={styles.input}
                          required
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Contraseña</label>
                        <input
                          type="password"
                          placeholder="Tu contraseña"
                          className={styles.input}
                          required
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        />
                      </div>

                      <button type="submit" className={styles.authActionBtn} disabled={authLoading}>
                        {authLoading ? 'VERIFICANDO...' : 'INICIAR SESIÓN'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.verifiedUserCard}>
                <div className={styles.verifiedHeader}>
                  <div className={styles.verifiedTitle}>
                    <span>✅ CLIENTE REGISTRADO:</span>
                    <strong>{user.name}</strong>
                  </div>
                  <button type="button" className={styles.switchAccountBtn} onClick={() => logout()}>
                    Cambiar de cuenta
                  </button>
                </div>

                <div className={styles.customerDetailsGrid}>
                  <div className={styles.detailItem}>
                    <span>Cédula / RIF:</span>
                    <strong>{user.idNumber || profileIdNum ? (user.idNumber || `${profileIdType}-${profileIdNum}`) : 'Pendiente'}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Teléfono / WhatsApp:</span>
                    <strong>{user.phone || profilePhone || 'Pendiente'}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Correo Electrónico:</span>
                    <strong>{user.email}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Boletín Informativo:</span>
                    <strong>{user.newsletter !== false ? '✅ Suscrito' : 'No suscrito'}</strong>
                  </div>
                </div>

                {/* If missing phone or idNumber, prompt user to complete */}
                {(!user.phone || !user.idNumber) && (
                  <div className={styles.missingDataAlert}>
                    <strong>⚠️ Por favor completa tu identificación para despachar tu compra:</strong>
                    <div className={styles.authGrid} style={{ marginTop: '10px' }}>
                      {!user.idNumber && (
                        <div>
                          <label style={{ fontSize: '0.8rem', color: '#ffea79' }}>Cédula de Identidad *</label>
                          <div className={styles.idInputWrap}>
                            <select
                              className={styles.idTypeSelect}
                              value={profileIdType}
                              onChange={(e) => setProfileIdType(e.target.value)}
                            >
                              <option value="V">V-</option>
                              <option value="E">E-</option>
                              <option value="J">J-</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Número de cédula"
                              className={styles.input}
                              value={profileIdNum}
                              onChange={(e) => setProfileIdNum(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {!user.phone && (
                        <div>
                          <label style={{ fontSize: '0.8rem', color: '#ffea79' }}>Teléfono Móvil *</label>
                          <input
                            type="tel"
                            placeholder="Ej. 0414-1234567"
                            className={styles.input}
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className={styles.applyBtn}
                      style={{ marginTop: '8px', padding: '8px 16px' }}
                      onClick={handleSaveMissingDetails}
                      disabled={savingProfile}
                    >
                      {savingProfile ? 'GUARDANDO...' : 'GUARDAR DATOS'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* STEP 2: SHIPPING / ENTREGA */}
          <section className={styles.section}>
            <h2>2. MÉTODO DE ENTREGA</h2>

            <div className={styles.shippingToggles}>
              <button
                type="button"
                className={`${styles.shippingBtn} ${shippingLevel === 1 ? styles.active : ''}`}
                onClick={() => setShippingLevel(1)}
              >
                Entrega Personal
                <span>Mérida - Libertador</span>
              </button>
              <button
                type="button"
                className={`${styles.shippingBtn} ${shippingLevel === 2 ? styles.active : ''}`}
                onClick={() => setShippingLevel(2)}
              >
                Otros Municipios
                <span>Envío por Agencia</span>
              </button>
              <button
                type="button"
                className={`${styles.shippingBtn} ${shippingLevel === 3 ? styles.active : ''}`}
                onClick={() => setShippingLevel(3)}
              >
                Envíos Nacionales
                <span>Resto de Venezuela</span>
              </button>
            </div>

            {/* Level 1: Entrega Personal */}
            {shippingLevel === 1 && (
              <div className={`${styles.agencyData} glass`}>
                <div className={styles.localNotice}>
                  <strong>⚡ HORARIO DE ENTREGAS PERSONALES:</strong>
                  De 3:00 PM a 7:00 PM en la ciudad de Mérida (Municipio Libertador).
                </div>
                <div className={styles.formGroup}>
                  <label>Dirección exacta de entrega</label>
                  <textarea
                    placeholder="Punto de referencia, calle, edificio o residencia..."
                    className={styles.input}
                    value={localAddress}
                    onChange={(e) => setLocalAddress(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Hora preferida de entrega (3:00 PM - 7:00 PM)</label>
                  <input
                    type="text"
                    placeholder="Ej: 4:30 PM"
                    className={styles.input}
                    value={localTime}
                    onChange={(e) => setLocalTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Level 2: Otros Municipios */}
            {shippingLevel === 2 && (
              <div className={`${styles.agencyData} glass`}>
                <h4>AGENCIA DE ENCOMIENDA</h4>
                <div className={styles.agencySelect}>
                  {['MRW', 'ZOOM', 'TEALCA'].map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={agency === a ? styles.activeAgency : ''}
                      onClick={() => setAgency(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div className={styles.formGroup}>
                  <label>Municipio / Población</label>
                  <input
                    type="text"
                    placeholder="Ej. Ejido, El Vigía, Tovar..."
                    className={styles.input}
                    value={muniLocation}
                    onChange={(e) => setMuniLocation(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Level 3: Envíos Nacionales */}
            {shippingLevel === 3 && (
              <div className={`${styles.agencyData} glass`}>
                <h4>ENVÍO NACIONAL (COBRO EN DESTINO)</h4>
                <div className={styles.agencySelect}>
                  {['MRW', 'ZOOM', 'TEALCA'].map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={agency === a ? styles.activeAgency : ''}
                      onClick={() => setAgency(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div className={styles.formGroup}>
                  <label>Seleccionar Estado</label>
                  <select
                    className={styles.input}
                    value={nationalState}
                    onChange={(e) => setNationalState(e.target.value)}
                  >
                    <option value="">-- Elige un estado --</option>
                    {statesOfVenezuelaByAgency.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Dirección o código de la agencia receptora</label>
                  <input
                    type="text"
                    placeholder="Oficina receptora para retirar..."
                    className={styles.input}
                    value={nationalAgency}
                    onChange={(e) => setNationalAgency(e.target.value)}
                  />
                </div>
              </div>
            )}
          </section>

          {/* STEP 3: PAYMENT & BCV RATE */}
          <section className={styles.section}>
            <h2>3. PAGO SUJETO A TASA OFICIAL BCV</h2>

            {/* Official BCV Rate Badge */}
            <div className={styles.bcvRateBanner}>
              <div className={styles.bcvBadgeInfo}>
                <div className={styles.bcvIcon}>🏛️</div>
                <div className={styles.bcvText}>
                  <h4>TASA OFICIAL BANCO CENTRAL DE VENEZUELA (BCV)</h4>
                  <p>
                    Fecha valor oficial: <strong>{bcvInfo?.date || 'Actualizada'}</strong> • Fuente:{' '}
                    <strong>bcv.org.ve</strong>
                  </p>
                </div>
              </div>
              <div className={styles.bcvRateDisplay}>
                <div className={styles.rateAmount}>
                  Bs. {activeRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={styles.rateLabel}>Por cada 1 USD</div>
              </div>
            </div>

            <div className={`${styles.paymentBlock} glass`}>
              <div
                style={{
                  background: 'rgba(226, 253, 82, 0.08)',
                  border: '1px solid rgba(226, 253, 82, 0.25)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase' }}>
                    MONTO EXACTO A TRANSFERIR EN BOLÍVARES:
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#e2fd52', fontFamily: 'Oswald, sans-serif' }}>
                    Bs. {finalTotalInVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Equivalente en Divisas:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>${finalTotal.toFixed(2)} USD</div>
                </div>
              </div>

              <div className={styles.bankData}>
                <p>
                  <strong>Pago Móvil:</strong> Banesco (0134)
                </p>
                <p>
                  <strong>Teléfono:</strong> 0414-7221133
                </p>
                <p>
                  <strong>RIF:</strong> J-50428912-3
                </p>
                <p>
                  <strong>Beneficiario:</strong> Inversiones SupplyMax C.A.
                </p>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                <label>Número de Referencia Bancaria (Últimos 4 o 6 dígitos) *</label>
                <input
                  type="text"
                  placeholder="Ej. 849302"
                  className={styles.input}
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                />
              </div>

              <div className={styles.uploadArea}>
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => setFileUploaded(!fileUploaded)}
                >
                  {fileUploaded ? '✅ COMPROBANTE LISTO' : 'SUBIR CAPTURA DEL COMPROBANTE (OPCIONAL)'}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ORDER SUMMARY */}
        <aside className={styles.summary}>
          <h3>RESUMEN DE ORDEN</h3>
          <div className={styles.summaryList}>
            {cart.map((i) => (
              <div key={i.id} className={styles.summaryItem}>
                <span>
                  {i.name} x{i.quantity}
                </span>
                <strong>{formatPrice(i.price * i.quantity)}</strong>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#aaa',
              margin: '1.5rem 0',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Tasa Oficial BCV:</span>
              <strong style={{ color: '#00e5ff' }}>
                Bs. {activeRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>
            {bcvInfo?.date && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#777' }}>
                <span>Fecha Valor:</span>
                <span>{bcvInfo.date}</span>
              </div>
            )}
          </div>

          <div className={styles.finalTotal}>
            <span>TOTAL DE LA ORDEN</span>
            <div className={styles.amount}>
              ${finalTotal.toFixed(2)} USD
              <div style={{ fontSize: '1.2rem', color: '#ffea79', marginTop: '6px' }}>
                Bs. {finalTotalInVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            {appliedDiscount && (
              <div className={styles.savings}>
                ¡Ahorraste {formatPrice(cartTotal - finalTotal)}!
              </div>
            )}
          </div>

          <div className={styles.summaryActions}>
            <div className={styles.discountRow}>
              <div className={styles.inputWrap}>
                <input
                  type="text"
                  placeholder="Código de descuento..."
                  className={styles.discountInput}
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.applyBtn}
                  onClick={applyDiscount}
                  disabled={isValidating}
                >
                  {isValidating ? '...' : 'APLICAR'}
                </button>
              </div>
              <button
                type="button"
                className={styles.modifyCartBtn}
                onClick={() => setCartOpen(true)}
              >
                MODIFICAR CARRITO
              </button>
            </div>
          </div>

          {!user ? (
            <button
              type="button"
              className={styles.finishBtn}
              onClick={() => {
                window.scrollTo({ top: 100, behavior: 'smooth' });
                alert('Debes completar el registro de cliente en el paso 1 antes de finalizar tu pedido.');
              }}
            >
              🔒 REGÍSTRATE PARA FINALIZAR COMPRA
            </button>
          ) : !hasCompleteCustomerData ? (
            <button
              type="button"
              className={styles.finishBtn}
              onClick={() => {
                window.scrollTo({ top: 100, behavior: 'smooth' });
                alert('Por favor completa tu cédula y teléfono en el paso 1 para continuar.');
              }}
            >
              ⚠️ COMPLETA TU CÉDULA Y TELÉFONO
            </button>
          ) : (
            <button
              type="button"
              className={styles.finishBtn}
              disabled={loading || (!paymentRef.trim() && !fileUploaded)}
              onClick={handleOrder}
            >
              {loading
                ? 'PROCESANDO ORDEN...'
                : !paymentRef.trim() && !fileUploaded
                ? 'INGRESA LA REFERENCIA DE PAGO'
                : 'FINALIZAR PEDIDO Y ENVIAR'}
            </button>
          )}
        </aside>
      </div>
      <Footer />
    </div>
  );
}
