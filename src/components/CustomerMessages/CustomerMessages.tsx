'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { animate, stagger } from 'animejs';
import styles from './CustomerMessages.module.css';

interface Message {
  sender: 'client' | 'supply';
  text?: string;
  time: string;
  isAudio?: boolean;
  audioDuration?: string;
  isReceipt?: boolean;
  receiptData?: {
    bank: string;
    amount?: string;
    ref?: string;
  };
  isImage?: boolean;
  imageSrc?: string;
  imageCaption?: string;
}

interface Conversation {
  id: string;
  name: string;
  tag: string;
  location: string;
  avatar: string;
  date: string;
  preview: string;
  screenshot: string;
  messages: Message[];
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 'samuel',
    name: 'Samuel Vivas',
    tag: 'Cliente Satisfecho',
    location: 'Mérida • Retiro Personal',
    avatar: 'SV',
    date: 'HOY',
    preview: 'Listo mi viejito gracias son los mejores ustedes SUPLYMAX',
    screenshot: '/whatsapp-reviews/chat-5.jpg',
    messages: [
      { sender: 'client', text: 'Listo mi viejo', time: '10:50 a.m.' },
      { sender: 'supply', text: 'Jenas amigo me avisa cuando esté allá', time: '2:59 p.m.' },
      { sender: 'client', text: 'Listo mi viejito ya estoy aquí', time: '3:15 p.m.' },
      { sender: 'supply', text: 'Perfecto le aviso cuando esté por ahí', time: '4:18 p.m.' },
      { sender: 'client', text: 'Listo mi viejo yo estoy en la puerta de salida', time: '4:18 p.m.' },
      {
        sender: 'supply',
        isImage: true,
        imageCaption: 'Cupón 3 Días de Entrenamiento Gratis en Fuerza Fitness con tu compra',
        time: '6:46 p.m.',
      },
      { sender: 'supply', isAudio: true, audioDuration: '0:24', time: '6:47 p.m.' },
      { sender: 'client', text: 'Listo mi viejito gracias son los mejores ustedes SUPLYMAX', time: '6:52 p.m.' },
    ],
  },
  {
    id: 'alfredo',
    name: 'Alfredo Ferreira',
    tag: 'Entrega Humbolt',
    location: 'Mérida • Humbolt',
    avatar: 'AF',
    date: 'AYER',
    preview: 'Ya estoy abajii ok bro, gracias 🙏',
    screenshot: '/whatsapp-reviews/chat-1.jpg',
    messages: [
      {
        sender: 'client',
        isReceipt: true,
        receiptData: { bank: 'Banco de Venezuela', ref: '007222765216' },
        time: '5:17 p.m.',
      },
      { sender: 'client', text: 'Listo', time: '5:17 p.m.' },
      { sender: 'supply', text: 'Listo, ¿estás ahí en la humbolt?', time: '5:17 p.m.' },
      { sender: 'client', text: 'Sip aquí estaré', time: '5:17 p.m.' },
      { sender: 'supply', text: 'Te aviso cuando esté ahí abajo entonces', time: '5:27 p.m.' },
      { sender: 'client', text: 'Ok', time: '5:40 p.m.' },
      { sender: 'supply', text: 'Ya estoy abajii ok bro', time: '5:59 p.m.' },
      { sender: 'client', text: 'Perdón, no me había llegado el mensaje', time: '6:03 p.m.' },
      { sender: 'supply', text: 'Tranqui', time: '6:04 p.m.' },
      { sender: 'client', text: 'Gracias 🙏', time: '6:06 p.m.' },
    ],
  },
  {
    id: 'yerzon',
    name: 'Yerzon (Envío MRW)',
    tag: 'Envío Nacional',
    location: 'Venezuela • MRW',
    avatar: 'YZ',
    date: '16/09/2026',
    preview: 'Listo manito, recibido por MRW',
    screenshot: '/whatsapp-reviews/chat-2.jpg',
    messages: [
      {
        sender: 'client',
        isReceipt: true,
        receiptData: { bank: 'BDV Pago Móvil', amount: '21.162,75 Bs', ref: '007352623188' },
        time: '1:08 p.m.',
      },
      {
        sender: 'supply',
        text: 'Perfecto amigo, en el transcurso de la tarde que vaya a la agencia le paso la guía',
        time: '1:10 p.m.',
      },
      { sender: 'client', text: 'Listo manito', time: '1:10 p.m.' },
      { sender: 'client', text: 'Epa mano, ¿qué precio un colágeno?', time: '1:10 p.m.' },
      { sender: 'supply', isAudio: true, audioDuration: '0:13', time: '1:30 p.m.' },
    ],
  },
  {
    id: 'alberth',
    name: 'Alberth Peña',
    tag: 'Suplementos Nutrex',
    location: 'Mérida • Retiro',
    avatar: 'AP',
    date: 'RECIENTE',
    preview: 'Comienzo a entrenar esos 3 días gratis Bro',
    screenshot: '/whatsapp-reviews/chat-3.jpg',
    messages: [
      {
        sender: 'client',
        isReceipt: true,
        receiptData: { bank: 'Pago Móvil BDV', amount: 'Nutrex Alberth' },
        time: '5:52 p.m.',
      },
      { sender: 'supply', text: 'Sí ya lo confirmé bro. ¿A qué hora pasarás para estar pendiente?', time: '5:52 p.m.' },
      { sender: 'client', text: 'No bro, hoy no puedo buscarla por el trabajo', time: '5:53 p.m.' },
      {
        sender: 'client',
        text: 'Si puedo mañana te digo, sino el Lunes como te había dicho y comienzo a entrenar esos 3 días gratis Bro',
        time: '5:53 p.m.',
      },
      { sender: 'supply', text: 'Ahh chévere, está bien el lunes', time: '5:54 p.m.' },
    ],
  },
];

const TOAST_MESSAGES = [
  { sender: 'Samuel Vivas', text: 'Listo mi viejito gracias son los mejores ustedes SUPLYMAX ⭐⭐⭐⭐⭐' },
  { sender: 'Alfredo Ferreira', text: 'Ya estoy abajii ok bro, entregado en Humbolt. Gracias 🙏' },
  { sender: 'Yerzon', text: 'Listo manito, pago BDV verificado y paquete enviado por MRW 📦' },
  { sender: 'Alberth Peña', text: 'Confirmado el pago de Nutrex y listo para los 3 días gratis de gimnasio 💪' },
];

export default function CustomerMessages() {
  const [activeTab, setActiveTab] = useState<string>('samuel');
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [currentToastIdx, setCurrentToastIdx] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  const currentConv = CONVERSATIONS.find((c) => c.id === activeTab) || CONVERSATIONS[0];

  // Trigger Anime.js animation when conversation changes
  const animateMessages = () => {
    if (!chatContainerRef.current) return;
    const bubbles = chatContainerRef.current.querySelectorAll(`.${styles.chatBubble}`);

    if (bubbles.length === 0) return;

    // Reset styles
    bubbles.forEach((el) => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(35px) scale(0.85)';
    });

    // Animate with anime.js elastic bounce
    animate(bubbles, {
      opacity: [0, 1],
      translateY: [35, 0],
      scale: [0.85, 1],
      delay: stagger(150, { start: 100 }),
      duration: 650,
      ease: 'outElastic(1, 0.7)',
    });
  };

  useEffect(() => {
    animateMessages();
  }, [activeTab]);

  // Floating Toast cyclical animation with anime.js
  useEffect(() => {
    if (!showToast) return;

    const interval = setInterval(() => {
      if (toastRef.current) {
        // Exit animation
        animate(toastRef.current, {
          opacity: [1, 0],
          translateY: [0, -20],
          scale: [1, 0.9],
          duration: 400,
          ease: 'inQuad',
          onComplete: () => {
            setCurrentToastIdx((prev) => (prev + 1) % TOAST_MESSAGES.length);
            if (toastRef.current) {
              // Entrance animation
              animate(toastRef.current, {
                opacity: [0, 1],
                translateY: [40, 0],
                scale: [0.85, 1],
                duration: 600,
                ease: 'outBack',
              });
            }
          },
        });
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [showToast]);

  // Audio animation
  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      animate(`.${styles.waveBar}`, {
        height: () => Math.floor(Math.random() * 18 + 6),
        direction: 'alternate',
        loop: true,
        duration: 350,
        ease: 'inOutSine',
        delay: stagger(40),
      });
    }
  };

  return (
    <section className={styles.sectionWrapper} id="comunidad-whatsapp">
      <div className={styles.sectionHeader}>
        <div className={styles.subheading}>
          <span>💬</span> CHAT EN VIVO Y EXPERIENCIAS REALES
        </div>
        <h2 className={styles.heading}>
          MENSAJES DE NUESTROS <span>CLIENTES</span>
        </h2>
        <p className={styles.description}>
          Transparencia y confianza absoluta. Mira las conversaciones reales por WhatsApp, confirmaciones de pago móvil,
          entregas personales en Mérida y envíos nacionales por MRW.
        </p>
      </div>

      <div className={styles.showcaseGrid}>
        {/* Sidebar: Conversation Selector */}
        <div className={styles.clientTabs}>
          {CONVERSATIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`${styles.clientTabBtn} ${activeTab === c.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(c.id)}
            >
              <div className={styles.tabAvatar}>{c.avatar}</div>
              <div className={styles.tabInfo}>
                <div className={styles.tabName}>
                  {c.name}
                  <span className={styles.tabBadge}>{c.tag}</span>
                </div>
                <div className={styles.tabPreview}>{c.preview}</div>
              </div>
            </button>
          ))}
        </div>

        {/* WhatsApp Mobile Chat Mockup */}
        <div className={styles.phoneMockup}>
          {/* Header */}
          <div className={styles.waHeader}>
            <div className={styles.waUserMeta}>
              <div className={styles.waAvatar}>{currentConv.avatar}</div>
              <div className={styles.waDetails}>
                <h4>{currentConv.name}</h4>
                <p>
                  <span>●</span> en línea ({currentConv.location})
                </p>
              </div>
            </div>
            <div className={styles.waActions}>
              <button
                type="button"
                className={styles.viewScreenshotBtn}
                onClick={() => setModalImage(currentConv.screenshot)}
              >
                <span>🔍</span> Ver Captura Real
              </button>
            </div>
          </div>

          {/* Chat Body with anime.js animated bubbles */}
          <div className={styles.chatBody} ref={chatContainerRef}>
            <div className={styles.dateDivider}>
              <span>{currentConv.date}</span>
            </div>

            {currentConv.messages.map((m, idx) => (
              <div
                key={idx}
                className={`${styles.chatBubble} ${
                  m.sender === 'client' ? styles.clientBubble : styles.supplyBubble
                }`}
              >
                {/* Pago Móvil Graphic Preview */}
                {m.isReceipt && (
                  <div className={styles.receiptCard}>
                    <div className={styles.receiptHeader}>
                      <span className={styles.receiptBank}>🏦 {m.receiptData?.bank}</span>
                      <span style={{ color: '#25d366', fontSize: '0.7rem', fontWeight: 700 }}>✓ CONFIRMADO</span>
                    </div>
                    {m.receiptData?.amount && (
                      <div className={styles.receiptAmount}>{m.receiptData.amount}</div>
                    )}
                    {m.receiptData?.ref && (
                      <div style={{ color: '#aaa', fontSize: '0.72rem' }}>
                        Operación: <code>{m.receiptData.ref}</code>
                      </div>
                    )}
                  </div>
                )}

                {/* Image Graphic Preview (e.g. Gym 3-day pass) */}
                {m.isImage && (
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      borderRadius: '10px',
                      padding: '8px',
                      marginBottom: '6px',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <div
                      style={{
                        background: '#e2fd52',
                        color: '#000',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        marginBottom: '6px',
                      }}
                    >
                      🎁 BENEFICIO EXCLUSIVO
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                      {m.imageCaption}
                    </div>
                  </div>
                )}

                {/* Audio Bubble */}
                {m.isAudio ? (
                  <div className={styles.audioBubble}>
                    <button type="button" className={styles.playBtn} onClick={toggleAudio}>
                      {isPlayingAudio ? '⏸' : '▶'}
                    </button>
                    <div className={styles.waveform}>
                      {[12, 18, 8, 22, 16, 10, 20, 14, 18, 12, 22, 15, 9, 17, 13, 21].map((h, i) => (
                        <div
                          key={i}
                          className={`${styles.waveBar} ${i < 6 ? styles.activeBar : ''}`}
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#89c5b6' }}>{m.audioDuration}</span>
                  </div>
                ) : (
                  m.text && <div>{m.text}</div>
                )}

                <div className={styles.bubbleMeta}>
                  <span>{m.time}</span>
                  {m.sender === 'supply' && <span className={styles.blueCheck}>✓✓</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Control Footer */}
          <div className={styles.controlFooter}>
            <button type="button" className={styles.replayBtn} onClick={animateMessages}>
              <span>✨</span> Repetir Animación Anime.js
            </button>
            <div className={styles.animBadge}>
              Animado con <strong className={styles.animeJsLogo}>Anime.js</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Real Screenshot */}
      {modalImage && (
        <div className={styles.modalOverlay} onClick={() => setModalImage(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.modalClose} onClick={() => setModalImage(null)}>
              ✕
            </button>
            <div style={{ position: 'relative', width: '380px', height: '620px', maxWidth: '85vw' }}>
              <Image
                src={modalImage}
                alt="Captura real de WhatsApp de cliente SupplyMax"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Social Proof Toast at bottom-left */}
      {showToast && (
        <div
          ref={toastRef}
          className={styles.floatingToast}
          onClick={() => {
            const el = document.getElementById('comunidad-whatsapp');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <div className={styles.toastIcon}>💬</div>
          <div className={styles.toastContent}>
            <div className={styles.toastSender}>
              <span>{TOAST_MESSAGES[currentToastIdx].sender}</span>
              <span style={{ fontSize: '0.65rem', color: '#25d366' }}>● WhatsApp verificado</span>
            </div>
            <div className={styles.toastText}>"{TOAST_MESSAGES[currentToastIdx].text}"</div>
          </div>
          <button
            type="button"
            className={styles.toastClose}
            onClick={(e) => {
              e.stopPropagation();
              setShowToast(false);
            }}
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
