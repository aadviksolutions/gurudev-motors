'use client';
import { useEffect, useState } from 'react';
import { Images } from 'lucide-react';
import PageHeading from '@/components/PageHeading';
import ShowroomPhotoImage from '@/components/ShowroomPhotoImage';
import { IS_DESIGN_PREVIEW } from '@/lib/showroom';
import { SHOWROOM_PHOTOS } from '@/lib/showroom-photos';
interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
}
export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    if (IS_DESIGN_PREVIEW) {
      setItems(SHOWROOM_PHOTOS);
      setLoading(false);
      return;
    }
    fetch('/api/gallery', { signal: abort.signal })
      .then(async (res) => {
        if (!res.ok)
          throw new Error(
            'The gallery could not be loaded. Please try again later.',
          );
        const data = await res.json();
        if (!data.success) throw new Error('The gallery could not be loaded.');
        setItems(data.items);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, []);
  const filtered = items.filter(
    (item) => category === 'ALL' || item.category === category,
  );
  return (
    <>
      <PageHeading
        eyebrow="GURUDEV MOTORS GALLERY"
        title="Around the showroom."
        description="Our space, our workshop and moments from Gurudev Motors."
      />
      <section className="site-container section-space">
        <div className="segment-control">
          {[
            'ALL',
            'SHOWROOM',
            'VEHICLES',
            'WORKSHOP',
            'DELIVERY',
            'EVENTS',
          ].map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={category === item ? 'active' : ''}
              aria-pressed={category === item}
            >
              {item === 'ALL'
                ? 'All moments'
                : item[0] + item.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        {loading ? (
          <p className="result-count" role="status">
            Loading gallery...
          </p>
        ) : filtered.length ? (
          <div className="gallery-grid">
            {filtered.map((item) => (
              <article key={item.id}>
                <div className="gallery-media">
                  <ShowroomPhotoImage
                    src={item.imageUrl}
                    alt={item.title}
                    sizes="(max-width:700px) 100vw,33vw"
                  />
                </div>
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
              </article>
            ))}
          </div>
        ) : (
          <div className="inventory-state" role={error ? 'alert' : 'status'}>
            <Images size={28} />
            <h3>
              {error ? 'Gallery unavailable.' : 'No moments to show yet.'}
            </h3>
            <p>
              {error || 'Showroom updates will appear here when available.'}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
