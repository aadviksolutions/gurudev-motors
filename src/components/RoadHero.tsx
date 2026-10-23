'use client';

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Bike, MapPin, Pause, Play } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import type { ShowroomVehicle } from '@/lib/showroom';
import { formatCurrency } from '@/lib/utils';
import { getRoadSlides, initialRoadState, roadReducer, ROAD_ENTER_MS, ROAD_EXIT_MS, ROAD_HOLD_MS, ROAD_IMAGE_SIZES } from '@/lib/road-hero';
import './road-hero.css';

export default function RoadHero({ vehicles }: { vehicles: ShowroomVehicle[] }) {
  const { openEnquiry } = useModal();
  const slides = useMemo(() => getRoadSlides(vehicles), [vehicles]);
  const [{ index, phase, paused }, dispatch] = useReducer(roadReducer, initialRoadState);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [imageStatus, setImageStatus] = useState<Record<string, 'ready' | 'failed'>>({});
  const [sceneFailed, setSceneFailed] = useState(false);
  const root = useRef<HTMLElement>(null);
  const vehicle = slides[index % Math.max(slides.length, 1)];
  const brandHref = vehicle ? '/vehicles?brand=' + encodeURIComponent(vehicle.brand) : '/vehicles';
  const running = !paused && !hovered && !reducedMotion && inView && pageVisible && slides.length > 1 && !!(vehicle && imageStatus[vehicle.id]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      setReducedMotion(media.matches);
      if (media.matches) dispatch({ type: 'settle' });
    };
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
    const timer = window.setTimeout(() => dispatch({ type: 'advance', count: slides.length }), ROAD_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [running, phase, index, slides.length]);

  // Use the same responsive source as the visible bike; avoid full-size phone downloads.
  useEffect(() => {
    if (!inView) return;
    slides.forEach((item) => {
      const image = new window.Image();
      const { props } = getImageProps({ src: item.imageUrl!, alt: '', width: 1000, height: 700, sizes: ROAD_IMAGE_SIZES });
      image.sizes = props.sizes || '';
      image.srcset = props.srcSet || '';
      image.src = props.src;
    });
  }, [inView, slides]);

  const select = (next: number) => dispatch({ type: 'select', index: next, count: slides.length });
  const focusPause = (event: React.FocusEvent<HTMLElement>) => {
    if (!(event.target as HTMLElement).closest('[data-road-playback]')) dispatch({ type: 'pause' });
  };

  return (
    <section className="road-hero" ref={root} aria-label="Gurudev Motors vehicle showcase" onFocusCapture={focusPause}>
      <div className={'road-scene' + (sceneFailed ? ' road-scene-unavailable' : '')}>
        {!sceneFailed && <picture className="road-backdrop">
          <source media="(max-width: 900px)" srcSet="/images/hero/raipur-road-mobile.webp" />
          {/* Art direction keeps both landmarks visible without sending desktop art to phones. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero/raipur-road-wide.webp" alt="" width="1920" height="640" fetchPriority="high" onError={() => setSceneFailed(true)} />
        </picture>}
        <header className="road-heading site-container">
          <span className="eyebrow"><span className="red-tick" /> YOUR LOCAL SHOWROOM IN RAIPUR</span>
          <h1>Gurudev Motors<span className="red-period">.</span></h1>
          <p>New bikes. More choice. Easy monthly payments.</p>
        </header>
        <div className="road-model" aria-live={paused || reducedMotion ? 'polite' : 'off'} aria-atomic="true">
          <div>
            <span className="road-brand">{vehicle?.brand || 'Five brands. One showroom.'}</span>
            <h2><Link href={brandHref}>{vehicle?.model || 'Find your next ride'} <ArrowUpRight size={16} aria-hidden="true" /></Link></h2>
          </div>
          <div className="road-price"><span>Sample price</span><strong>{vehicle ? formatCurrency(vehicle.price) : 'Ask for price'}</strong></div>
        </div>
        <Link className="road-stage" href={brandHref} aria-label={vehicle ? `See all ${vehicle.brand} vehicles` : 'See all vehicles'}
          onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(true); }}
          onPointerLeave={() => setHovered(false)}>
          <div key={vehicle?.id || 'empty'} className={'road-moving-vehicle road-phase-' + phase}
            style={{ animationPlayState: running ? 'running' : 'paused', animationDuration: (phase === 'enter' ? ROAD_ENTER_MS : ROAD_EXIT_MS) + 'ms' }}
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget && phase !== 'hold') dispatch({ type: 'advance', count: slides.length });
            }}>
            {vehicle && imageStatus[vehicle.id] !== 'failed' ? <Image
              src={vehicle.imageUrl!} alt={`${vehicle.brand} ${vehicle.model}, facing right`}
              width={1000} height={700} sizes={ROAD_IMAGE_SIZES} priority className="road-vehicle-image"
              onLoad={() => setImageStatus((current) => ({ ...current, [vehicle.id]: 'ready' }))}
              onError={() => setImageStatus((current) => ({ ...current, [vehicle.id]: 'failed' }))}
            /> : <div className="road-image-fallback"><Bike size={56} aria-hidden="true" /><span>{vehicle ? 'Photo unavailable' : 'Choose from five brands'}</span></div>}
          </div>
        </Link>
        <dl className="road-facts" aria-label="Vehicle details">
          <div><dt>Engine</dt><dd>{vehicle?.engineCC ? `${vehicle.engineCC} cc` : '-'}</dd></div>
          <div><dt>Fuel</dt><dd>{vehicle?.fuel || '-'}</dd></div>
          <div><dt>Gears</dt><dd>{vehicle?.transmission || '-'}</dd></div>
        </dl>
      </div>
      <div className="road-controls site-container" aria-roledescription="carousel" aria-label="New vehicles from five brands">
        <div className="road-brand-choices" aria-label="Choose a vehicle brand">
          {slides.map((item, itemIndex) => <button key={item.id} type="button" aria-pressed={item.id === vehicle?.id} onClick={() => select(itemIndex)}>{item.brand}</button>)}
        </div>
        <div className="road-playback">
          <span className="road-sample-note">Sample model. Ask us for stock and price.</span>
          {slides.length > 1 && <div className="road-arrows">
            <button type="button" title="Previous vehicle" aria-label="Previous vehicle" onClick={() => select(index - 1)}><ArrowLeft size={18} /></button>
            {!reducedMotion && <button type="button" data-road-playback title={paused ? 'Play vehicle rotation' : 'Pause vehicle rotation'} aria-label={paused ? 'Play vehicle rotation' : 'Pause vehicle rotation'} onClick={() => dispatch({ type: paused ? 'play' : 'pause' })}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}
            <button type="button" title="Next vehicle" aria-label="Next vehicle" onClick={() => select(index + 1)}><ArrowRight size={18} /></button>
          </div>}
        </div>
        <div className="road-quick-actions">
          <Link className="button button-primary" href="/vehicles">Explore vehicles <ArrowRight size={18} /></Link>
          <Link className="button button-secondary" href="/contact"><MapPin size={17} /> Visit showroom</Link>
          <button className="button road-enquiry" onClick={() => { dispatch({ type: 'pause' }); openEnquiry(vehicle ? `${vehicle.brand} ${vehicle.model}` : undefined); }}>Ask for price <ArrowUpRight size={17} /></button>
        </div>
      </div>
    </section>
  );
}
