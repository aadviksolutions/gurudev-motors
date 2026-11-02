'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Instagram, MapPin, Quote, UsersRound } from 'lucide-react';
import Dialog from './Dialog';
import ShowroomPhotoImage from './ShowroomPhotoImage';
import { SHOWROOM_INSTAGRAM_URL, SHOWROOM_PHOTOS } from '@/lib/showroom-photos';

export default function ShowroomPhotos() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activePhoto = activeIndex === null ? null : SHOWROOM_PHOTOS[activeIndex];
  const isOpen = activeIndex !== null;

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'Tab') {
        const buttons = sectionRef.current?.querySelectorAll<HTMLButtonElement>(
          '.showroom-photo-dialog button:not([disabled])',
        );
        const first = buttons?.[0];
        const last = buttons?.[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
        return;
      }
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      setActiveIndex((index) =>
        index === null ? null : (index + direction + SHOWROOM_PHOTOS.length) % SHOWROOM_PHOTOS.length,
      );
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const movePhoto = (direction: number) => {
    setActiveIndex((index) =>
      index === null ? null : (index + direction + SHOWROOM_PHOTOS.length) % SHOWROOM_PHOTOS.length,
    );
  };

  return (
    <section ref={sectionRef} className="showroom-photo-band" aria-labelledby="showroom-photo-heading">
      <div className="site-container">
        <div className="section-heading showroom-photo-heading">
          <div>
            <span className="eyebrow">INSIDE GURUDEV MOTORS</span>
            <h2 id="showroom-photo-heading">A word from our founder.</h2>
          </div>
          <Link className="text-link showroom-photos-desktop-link" href="/gallery">
            See all photos <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="showroom-founder-layout">
          <div
            className="showroom-founder-portrait"
            role="img"
            aria-label="Gurudev Motors Director and Showroom"
          >
            <Image
              src="/images/desk.jpeg"
              alt="Gurudev Motors Showroom Office Desk"
              fill
              sizes="(max-width: 768px) 100vw, 240px"
              className="object-cover rounded-xl"
            />
          </div>
          <div className="showroom-founder-message">
            <div className="showroom-founder-label">
              <Quote size={26} aria-hidden="true" />
              <span>DIRECTOR&apos;S MESSAGE</span>
            </div>
            <blockquote>
              <p>
                We want choosing a vehicle to feel simple. Tell us what you need, and we will help
                you compare your options, understand the price and find what suits you best.
              </p>
              <footer>
                <strong>Vinod Pandey</strong>
                <span>Founder &amp; Director, Gurudev Motors</span>
              </footer>
            </blockquote>
          </div>
          <div className="showroom-story-photos">
            {SHOWROOM_PHOTOS.slice(0, 2).map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                className="showroom-photo-card"
                onClick={() => setActiveIndex(index)}
                aria-label={`View photo: ${photo.title}`}
                aria-haspopup="dialog"
              >
                <span className="showroom-photo-media">
                  <ShowroomPhotoImage
                    src={photo.imageUrl}
                    alt={photo.alt}
                    sizes="(max-width: 1000px) 48vw, 300px"
                  />
                </span>
                <span className="showroom-photo-caption">
                  <span>{photo.title}</span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="showroom-team-photo" role="img" aria-label="Blank space reserved for a landscape team photo">
          <UsersRound size={28} aria-hidden="true" />
          <span>Team photo</span>
        </div>
        <div className="showroom-photo-links">
          <span className="showroom-photo-location"><MapPin size={16} aria-hidden="true" /> Raipura, Raipur</span>
          <Link className="text-link showroom-photos-mobile-link" href="/gallery">
            See all photos <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <a className="showroom-instagram-link" href={SHOWROOM_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            <Instagram size={16} aria-hidden="true" />
            Watch on Instagram <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
      <Dialog open={isOpen} onClose={() => setActiveIndex(null)} title="showroom photos" className="showroom-photo-dialog">
        {activePhoto && (
          <>
            <div className="showroom-photo-dialog-heading">
              <h2 aria-live="polite">{activePhoto.title}</h2>
            </div>
            <div className="showroom-photo-full">
              <ShowroomPhotoImage key={activePhoto.imageUrl} src={activePhoto.imageUrl} alt={activePhoto.alt} sizes="(max-width: 900px) 100vw, 900px" />
            </div>
            <div className="showroom-photo-controls">
              <span aria-live="polite">{(activeIndex ?? 0) + 1} of {SHOWROOM_PHOTOS.length}</span>
              <div>
                <button type="button" className="icon-button" onClick={() => movePhoto(-1)} aria-label="Previous photo" title="Previous photo"><ArrowLeft size={20} /></button>
                <button type="button" className="icon-button" onClick={() => movePhoto(1)} aria-label="Next photo" title="Next photo"><ArrowRight size={20} /></button>
              </div>
            </div>
          </>
        )}
      </Dialog>
    </section>
  );
}
