'use client';

import { useEffect, useRef, useState } from 'react';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Bike, MapPin, Pause, Play } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { ShowroomVehicle } from '@/lib/showroom';
import { formatCurrency } from '@/lib/utils';
import './rotating-hero.css';

const brandOrder = ['TVS', 'Honda', 'Suzuki', 'Hero', 'Bajaj'];
const HOLD_MS = 2000;
const IMAGE_SIZES = '(max-width: 700px) 88vw, 650px';

export default function RotatingHero({ vehicles }: { vehicles: ShowroomVehicle[] }) {
  const { openEnquiry } = useModal();
  const slides = brandOrder.flatMap((brand) => {
    const vehicle = vehicles.find((item) => item.brand === brand && item.category === 'NEW' && item.imageUrl);
    return vehicle ? [vehicle] : [];
  });
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'hold' | 'exit' | 'enter'>('hold');
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const root = useRef<HTMLElement>(null);
  const vehicle = slides[index % Math.max(slides.length, 1)];
  const brandHref = vehicle ? '/vehicles?brand=' + encodeURIComponent(vehicle.brand) : '/vehicles';
  const running = !paused && !hovered && !reducedMotion && inView && pageVisible && slides.length > 1;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    if (root.current) observer.observe(root.current);
    return () => {
      media.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!running || phase !== 'hold') return;
    const timer = window.setTimeout(() => setPhase('exit'), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [running, phase, index]);

  // Match the displayed responsive source so phones do not preload full-size files.
  const imageSources = slides.map((item) => item.imageUrl).join('|');
  useEffect(() => {
    if (!inView) return;
    imageSources.split('|').filter(Boolean).forEach((src) => {
      const image = new window.Image();
      const { props } = getImageProps({ src, alt: '', width: 1038, height: 638, sizes: IMAGE_SIZES });
      image.sizes = props.sizes || '';
      image.srcset = props.srcSet || '';
      image.src = props.src;
    });
  }, [inView, imageSources]);

  const select = (next: number) => {
    setPaused(true);
    setPhase('hold');
    setIndex((next + slides.length) % slides.length);
  };
  const togglePlayback = () => {
    setPhase('hold');
    setPaused(!paused);
  };

  return (
    <section className="rotating-hero" ref={root} aria-label="Gurudev Motors vehicle showcase">
      <div className="site-container hero-trial-inner">
        <div className="hero-trial-heading">
          <span className="eyebrow"><span className="red-tick" /> YOUR LOCAL SHOWROOM IN RAIPUR</span>
          <h1>Gurudev Motors<span className="red-period">.</span></h1>
          <p>New bikes. More choice. Easy monthly payments.</p>
        </div>

        <div
          className="hero-showcase"
          onFocusCapture={(event) => { if (!(event.target as HTMLElement).closest('[data-playback]')) setPaused(true); }}
          aria-roledescription="carousel"
          aria-label="New vehicles from five brands"
        >
          <div className="hero-vehicle-info" aria-live={paused || reducedMotion ? 'polite' : 'off'}>
            <span className="hero-brand-name">{vehicle?.brand || 'Five brands. One showroom.'}</span>
            <h2><Link href={brandHref} title={vehicle ? `See all ${vehicle.brand} vehicles` : 'See all vehicles'}>{vehicle?.model || 'Find your next ride'} <ArrowUpRight size={16} aria-hidden="true" /></Link></h2>
            <div className="hero-vehicle-price"><span>Sample price</span><strong>{vehicle ? formatCurrency(vehicle.price) : 'Ask for price'}</strong></div>
          </div>
          <Link
            className="hero-vehicle-stage"
            href={brandHref}
            aria-label={vehicle ? `See all ${vehicle.brand} vehicles` : 'See all vehicles'}
            title={vehicle ? `See all ${vehicle.brand} vehicles` : 'See all vehicles'}
            onPointerEnter={(event) => { if (event.pointerType === 'mouse') { setHovered(true); setPhase('hold'); } }}
            onPointerLeave={() => setHovered(false)}
          >
            {vehicle && !failedImages.includes(vehicle.id) ? (
              <div
                key={vehicle.id}
                className={'hero-moving-vehicle hero-phase-' + phase}
                style={{ animationPlayState: running ? 'running' : 'paused' }}
                onAnimationEnd={(event) => {
                  if (event.target !== event.currentTarget) return;
                  if (phase === 'exit') {
                    setIndex((current) => (current + 1) % slides.length);
                    setPhase('enter');
                  } else if (phase === 'enter') setPhase('hold');
                }}
              >
                <Image
                  src={vehicle.imageUrl!}
                  alt={`${vehicle.brand} ${vehicle.model}, side view`}
                  width={1038}
                  height={638}
                  className="hero-vehicle-image"
                  sizes={IMAGE_SIZES}
                  priority
                  onError={() => setFailedImages((current) => [...current, vehicle.id])}
                />
              </div>
            ) : (
              <div className="hero-image-fallback"><Bike size={64} /><span>{vehicle ? 'Photo unavailable' : 'TVS, Honda, Suzuki, Hero and Bajaj'}</span></div>
            )}
          </Link>
          <dl className="hero-vehicle-facts" aria-label="Vehicle details">
            <div><dt>Engine</dt><dd>{vehicle?.engineCC ? `${vehicle.engineCC} cc` : '-'}</dd></div>
            <div><dt>Fuel</dt><dd>{vehicle?.fuel || '-'}</dd></div>
            <div><dt>Gears</dt><dd>{vehicle?.transmission || '-'}</dd></div>
          </dl>
          <div className="hero-playback">
            <span className="hero-sample-note">Sample model. Ask us for stock and price.</span>
            {slides.length > 1 && <div className="hero-arrow-controls">
              <button type="button" title="Previous vehicle" aria-label="Previous vehicle" onClick={() => select(index - 1)}><ArrowLeft size={18} /></button>
              {!reducedMotion && <button type="button" data-playback title={paused ? 'Play vehicle rotation' : 'Pause vehicle rotation'} aria-label={paused ? 'Play vehicle rotation' : 'Pause vehicle rotation'} onClick={togglePlayback}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}
              <button type="button" title="Next vehicle" aria-label="Next vehicle" onClick={() => select(index + 1)}><ArrowRight size={18} /></button>
            </div>}
          </div>
          <div className="hero-brand-choices" aria-label="Choose a vehicle brand">
            {slides.map((item, itemIndex) => <button key={item.id} type="button" aria-pressed={item.id === vehicle?.id} onClick={() => select(itemIndex)}>{item.brand}</button>)}
          </div>
        </div>

        <div className="hero-quick-actions">
          <Link className="button button-primary" href="/vehicles">Explore vehicles <ArrowRight size={18} /></Link>
          <Link className="button button-secondary" href="/contact"><MapPin size={17} /> Visit showroom</Link>
          <button className="button hero-enquiry" onClick={() => { setPaused(true); setPhase('hold'); openEnquiry(vehicle ? `${vehicle.brand} ${vehicle.model}` : undefined); }}>Ask for price <ArrowUpRight size={17} /></button>
        </div>
      </div>
    </section>
  );
}
