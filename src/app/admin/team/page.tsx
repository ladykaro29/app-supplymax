'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import styles from './Team.module.css';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role_id: string;
  status: 'Active' | 'Pending' | 'Suspended';
  createdAt?: string;
  phone?: string | null;
  idNumber?: string | null;
}

export default function TeamPage() {
  const { user } = useAppContext();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  // Form state
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    password: '',
    role_id: 'Empleado',
    status: 'Active' as 'Active' | 'Pending',
  });

  const [showPassword, setShowPassword] = useState(false);

  // Fetch real team members from backend
  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/team');
      if (res.ok) {
        const data = await res.json();
        setTeam(data.users || []);
      } else {
        console.error('Error fetching team');
      }
    } catch (err) {
      console.error('Network error loading team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  // Quick password generator
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Suppli';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewMember((prev) => ({ ...prev, password: pass }));
    setShowPassword(true);
  };

  // Only Admin / Subgerente can manage team
  const userRole = (user?.role_id || '').toLowerCase().trim();
  const isAuthorized = !user || ['admin', 'administrador', 'subgerente'].includes(userRole);

  if (!isAuthorized) {
    return (
      <div className={styles.unauthorized}>
        <h1 style={{ color: 'white' }}>Acceso Restringido</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          Solo el administrador principal o directores pueden gestionar el equipo de trabajo.
        </p>
      </div>
    );
  }

  // Handle create user
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'No se pudo crear el usuario.');
        setIsSubmitting(false);
        return;
      }

      // Add to list and close modal
      setTeam((prev) => [data, ...prev]);
      setIsModalOpen(false);
      setNewMember({
        name: '',
        email: '',
        password: '',
        role_id: 'Empleado',
        status: 'Active',
      });
      setShowPassword(false);
      setSuccessToast(`¡Usuario ${data.name} creado exitosamente con rol ${data.role_id}!`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión al guardar el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle remove user
  const removeMember = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${name}" del sistema? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/team?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'No se pudo eliminar el usuario.');
        return;
      }

      setTeam((prev) => prev.filter((m) => m.id !== id));
      setSuccessToast(`Usuario "${name}" eliminado correctamente.`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  // Filter team
  const filteredTeam = team.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.role_id && m.role_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRoleFilter === 'ALL' ||
      m.role_id.toLowerCase() === selectedRoleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  // Calculate statistics
  const totalCount = team.length;
  const adminCount = team.filter((m) => ['admin', 'subgerente'].includes(m.role_id.toLowerCase())).length;
  const staffCount = team.filter((m) => !['admin', 'subgerente', 'user'].includes(m.role_id.toLowerCase())).length;

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.titleWrapper}>
            <h1>Equipo de <span>Trabajo</span></h1>
            <p className={styles.subtitle}>Gestión de personal interno, permisos y asignación de rangos corporativos</p>
          </div>

          <button 
            type="button" 
            className={styles.addBtn} 
            onClick={() => {
              setErrorMessage('');
              setIsModalOpen(true);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>+ Crear Usuario</span>
          </button>
        </header>

        {/* Success Toast */}
        {successToast && (
          <div className={styles.successToast}>
            ✓ {successToast}
          </div>
        )}

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statData}>
              <span className={styles.statValue}>{totalCount}</span>
              <span className={styles.statLabel}>Usuarios Registrados</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>👑</div>
            <div className={styles.statData}>
              <span className={styles.statValue}>{adminCount}</span>
              <span className={styles.statLabel}>Directiva & Admins</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⚙️</div>
            <div className={styles.statData}>
              <span className={styles.statValue}>{staffCount}</span>
              <span className={styles.statLabel}>Personal Operativo</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre, correo o rol..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={styles.roleFilterSelect}
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
          >
            <option value="ALL">Todos los Rangos</option>
            <option value="Admin">Administrador</option>
            <option value="Subgerente">Subgerente</option>
            <option value="Administrador de inventarios">Inventarios</option>
            <option value="Repartidor">Repartidor (Delivery)</option>
            <option value="Empleado">Empleado</option>
            <option value="Coach">Coach</option>
            <option value="Influencer">Influencer / Atleta</option>
            <option value="User">Cliente (User)</option>
          </select>
        </div>

        {/* Table Section */}
        <section className={styles.section}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>USUARIO</th>
                  <th>CORREO ELECTRÓNICO</th>
                  <th>RANGO / ROL</th>
                  <th>ESTADO</th>
                  <th>FECHA</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
                      Cargando equipo de trabajo...
                    </td>
                  </tr>
                ) : filteredTeam.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>
                      No se encontraron usuarios con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredTeam.map((member) => {
                    const firstLetter = member.name ? member.name.charAt(0).toUpperCase() : 'U';
                    const roleClass = styles['role_' + (member.role_id ? member.role_id.split(' ')[0] : 'User')] || styles.role_User;

                    return (
                      <tr key={member.id}>
                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.userAvatar}>{firstLetter}</div>
                            <span className={styles.userNameText}>{member.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.emailText}>{member.email}</span>
                        </td>
                        <td>
                          <span className={`${styles.roleBadge} ${roleClass}`}>
                            {member.role_id || 'User'}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles['status_' + (member.status || 'Active')]}`}>
                            {member.status === 'Active' ? 'Activo' : (member.status === 'Pending' ? 'Pendiente' : 'Suspendido')}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
                            {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}
                          </span>
                        </td>
                        <td>
                          {member.email.toLowerCase() === 'admin@supplymax.app' || member.email.toLowerCase() === 'admin@supplymax.com' ? (
                            <span style={{ fontSize: '0.72rem', color: '#ffd700', fontWeight: 800 }}>
                              PROTEGIDO
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => removeMember(member.id, member.name)}
                              className={styles.deleteBtn}
                              title="Eliminar usuario"
                            >
                              Eliminar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modal: Crear Nuevo Usuario con Rol */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Crear Nuevo Usuario</h2>
              <button 
                type="button" 
                className={styles.modalCloseBtn}
                onClick={() => !isSubmitting && setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className={styles.errorAlert}>
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddMember}>
              {/* Nombre Completo */}
              <div className={styles.formGroup}>
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  className={styles.input}
                  required
                  placeholder="Ej: Carlos Silva"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>

              {/* Correo Electrónico */}
              <div className={styles.formGroup}>
                <label>Correo Electrónico (Acceso al Sistema) *</label>
                <input
                  type="email"
                  className={styles.input}
                  required
                  placeholder="ejemplo@supplymax.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>

              {/* Contraseña */}
              <div className={styles.formGroup}>
                <label>Contraseña de Acceso *</label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={styles.input}
                    required
                    minLength={4}
                    placeholder="Mínimo 4 caracteres"
                    value={newMember.password}
                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className={styles.generateBtn}
                    onClick={generateRandomPassword}
                    title="Generar contraseña segura"
                  >
                    🎲 Generar
                  </button>
                </div>
              </div>

              {/* Rango / Rol */}
              <div className={styles.formGroup}>
                <label>Rango / Rol Corporativo *</label>
                <select
                  className={styles.select}
                  value={newMember.role_id}
                  onChange={(e) => setNewMember({ ...newMember, role_id: e.target.value })}
                >
                  <option value="Admin">Administrador (Acceso Total)</option>
                  <option value="Subgerente">Subgerente</option>
                  <option value="Administrador de inventarios">Administrador de Inventarios</option>
                  <option value="Repartidor">Repartidor (Delivery)</option>
                  <option value="Empleado">Empleado / Staff</option>
                  <option value="Coach">Coach Asociado</option>
                  <option value="Influencer">Influencer / Embajador</option>
                  <option value="User">Cliente (Usuario Regular)</option>
                </select>
              </div>

              {/* Estado */}
              <div className={styles.formGroup}>
                <label>Estado de Cuenta</label>
                <select
                  className={styles.select}
                  value={newMember.status}
                  onChange={(e) => setNewMember({ ...newMember, status: e.target.value as any })}
                >
                  <option value="Active">Activo (Inmediato)</option>
                  <option value="Pending">Pendiente de Verificación</option>
                </select>
              </div>

              {/* Actions */}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
