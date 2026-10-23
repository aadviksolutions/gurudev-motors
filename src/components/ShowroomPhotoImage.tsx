'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import './showroom-photos.css';

export default function ShowroomPhotoImage({
  src,
  alt,
  sizes,
}: {
  src: string;
  alt: string;
  sizes: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  return failed ? (
    <span className="showroom-photo-unavailable" role="img" aria-label={`${alt}: photo unavailable`}>
      <ImageOff size={22} aria-hidden="true" />
      <span>Photo unavailable</span>
    </span>
  ) : (
    <Image src={src} alt={alt} fill sizes={sizes} onError={() => setFailed(true)} />
  );
}
