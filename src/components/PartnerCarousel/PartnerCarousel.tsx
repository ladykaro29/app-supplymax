'use client';

import React from 'react';
import Image from 'next/image';
import styles from './PartnerCarousel.module.css';

interface Partner {
  id: string;
  name: string;
  role_id: string;
  image: string | null;
}

interface PartnerCarouselProps {
  partners: Partner[];
}

export default function PartnerCarousel({ partners }: PartnerCarouselProps) {
  if (partners.length === 0) return null;

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.track}>
        {partners.map((partner) => (
          <div key={partner.id} className={styles.partnerCard}>
            <div className={styles.imageWrap}>
               <Image 
                src={partner.image || '/partners/placeholder.jpg'} 
                alt={partner.name} 
                width={200} 
                height={200} 
                className={styles.partnerImage}
               />
            </div>
            <div className={styles.partnerInfo}>
              <h3>{partner.name}</h3>
              <span className={partner.role_id === 'Coach' ? styles.coachTag : styles.influencerTag}>
                {partner.role_id === 'Coach' ? 'COACH' : 'INFLUENCER'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
