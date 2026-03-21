'use client';

import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import { useAppContext } from '@/context/AppContext';
import styles from './Team.module.css';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Pending';
}

const INITIAL_TEAM: TeamMember[] = [
  { id: '1', name: 'Admin Principal', email: 'admin@supplymax.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Juan Perez', email: 'juan.p@supplymax.com', role: 'Subgerente', status: 'Active' },
  { id: '3', name: 'Maria Lopez', email: 'maria.l@supplymax.com', role: 'Administrador de inventarios', status: 'Active' },
];

export default function TeamPage() {
  const { user } = useAppContext();
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Empleado' });

  // Only Admin can manage team
  if (!user || user.role_id !== 'Admin') {
    return (
      <div className={styles.unauthorized}>
        <Header />
        <h1 style={{ color: 'white' }}>Acceso Restringido</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Solo el administrador principal puede gestionar el equipo de trabajo.</p>
      </div>
    );
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const member: TeamMember = {
      id: Date.now().toString(),
      ...newMember,
      status: 'Pending'
    };
    setTeam([...team, member]);
    setIsModalOpen(false);
    setNewMember({ name: '', email: '', role: 'Empleado' });
    alert(`Se ha enviado una invitación a ${member.email}`);
  };

  const removeMember = (id: string) => {
    if (confirm('¿Estás seguro de eliminar a este miembro del equipo?')) {
      setTeam(team.filter(m => m.id !== id));
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 style={{ color: 'white' }}>Equipo de <span>Trabajo</span></h1>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Crear Usuario
          </button>
        </header>

        <section className={styles.section}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NOMBRE</th>
                <th>CORREO ELECTRÓNICO</th>
                <th>RANGO / ROL</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {team.map(member => (
                <tr key={member.id}>
                  <td><strong>{member.name}</strong></td>
                  <td>{member.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles['role_' + member.role.split(' ')[0]]}`}>
                      {member.role}
                    </span>
                  </td>
                  <td>
                    <span className={styles['status_' + member.status]}>{member.status}</span>
                  </td>
                  <td>
                    <button 
                      onClick={() => removeMember(member.id)}
                      style={{ background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Crear Nuevo Usuario</h2>
            <form onSubmit={handleAddMember}>
              <div className={styles.formGroup}>
                <label>Nombre Completo</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  required
                  value={newMember.name}
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  className={styles.input} 
                  required
                  value={newMember.email}
                  onChange={e => setNewMember({...newMember, email: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Rango en la Empresa</label>
                <select 
                  className={styles.select}
                  value={newMember.role}
                  onChange={e => setNewMember({...newMember, role: e.target.value})}
                >
                  <option value="Administrador de inventarios">Administrador de inventarios</option>
                  <option value="Repartidor">Repartidor</option>
                  <option value="Empleado">Empleado</option>
                  <option value="Subgerente">Subgerente</option>
                  <option value="Admin">Administrador (Total)</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className={styles.saveBtn}>Crear Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
