'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import styles from './ChatWidget.module.css';

export default function ChatWidget() {
  const { isChatOpen, setChatOpen } = useAppContext();
  const [messages, setMessages] = useState<{ text: string, sender: 'bot' | 'user' }[]>([
    { text: '¡Hola! Bienvenido a Supply Max. ¿En qué puedo ayudarte hoy?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { text: input, sender: 'user' }]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { text: 'Entendido. Un agente de soporte te atenderá en unos minutos.', sender: 'bot' }]);
    }, 1000);
  };

  return (
    <div className={`${styles.wrapper} ${isChatOpen ? styles.active : ''}`}>
      {!isChatOpen ? (
        <button className={styles.trigger} onClick={() => setChatOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <span className={styles.triggerLabel}>SOPORTE</span>
        </button>
      ) : (
        <div className={`${styles.chatCard} glass neon-glow`}>
          <div className={styles.header}>
            <h3>Soporte Técnico</h3>
            <button className={styles.closeBtn} onClick={() => setChatOpen(false)}>×</button>
          </div>
          
          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${styles[m.sender]}`}>
                {m.text}
              </div>
            ))}
          </div>

          <form className={styles.inputArea} onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Escribe tu mensaje..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
