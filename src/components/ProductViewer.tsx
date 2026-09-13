import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { PublicProduct } from '../types';
import { supabase, productImageUrl } from '../lib/supabaseClient';

interface Props {
  products: PublicProduct[];
  startIndex: number;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 50;

export function ProductViewer({ products, startIndex, onClose }: Props) {
  const [productIndex, setProductIndex] = useState(startIndex);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [, forceRender] = useState(0);
  const imageCache = useRef<Record<string, { url: string; isSold: boolean; colorLabel: string | null }[]>>({});
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const product = products[productIndex];

  useEffect(() => {
    setPhotoIndex(0);
  }, [productIndex]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!product || imageCache.current[product.id]) return;
    let cancelled = false;
    supabase
      .from('product_images')
      .select('storage_path, is_sold, color_label')
      .eq('product_id', product.id)
      .order('sort_order')
      .then(({ data }) => {
        if (cancelled) return;
        imageCache.current[product.id] = (data ?? []).map((row) => ({
          url: productImageUrl(row.storage_path),
          isSold: row.is_sold,
          colorLabel: row.color_label,
        }));
        forceRender((n) => n + 1);
      });
    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  if (!product) return null;

  const photos = imageCache.current[product.id] ?? [];
  const currentPhoto = photos[photoIndex];

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    dragStart.current = { x: e.clientX, y: e.clientY };
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = null;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) < SWIPE_THRESHOLD) return;
      if (dx < 0) {
        setPhotoIndex((i) => Math.min(i + 1, Math.max(photos.length - 1, 0)));
      } else {
        setPhotoIndex((i) => Math.max(i - 1, 0));
      }
    } else {
      if (Math.abs(dy) < SWIPE_THRESHOLD) return;
      if (dy < 0) {
        setProductIndex((i) => Math.min(i + 1, products.length - 1));
      } else {
        setProductIndex((i) => Math.max(i - 1, 0));
      }
    }
  }

  return (
    <div className="viewer-overlay" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
      <button className="viewer-back" onClick={onClose} aria-label="Back to catalog">
        ←
      </button>

      {photos.length > 1 && (
        <div className="viewer-dots">
          {photos.map((_, i) => (
            <span key={i} className={i === photoIndex ? 'viewer-dot active' : 'viewer-dot'} />
          ))}
        </div>
      )}

      <div className="viewer-media">
        {currentPhoto ? (
          <img src={currentPhoto.url} alt={product.name} draggable={false} />
        ) : (
          <div className="viewer-media-placeholder">No photo</div>
        )}
        {currentPhoto?.isSold && <span className="viewer-photo-sold-badge">Sold</span>}
      </div>

      <div className="viewer-details">
        {!product.in_stock && <span className="viewer-badge-out">Out of Stock</span>}
        <span className="product-code">{product.product_code}</span>
        <span className="product-name">{product.name}</span>
        {currentPhoto?.colorLabel && <span className="viewer-color-label">Color: {currentPhoto.colorLabel}</span>}
        <div className="product-price-row">
          <span className="product-price">₹{product.price_selling.toLocaleString('en-IN')}</span>
          <span className="product-qty">Qty: {product.quantity}</span>
        </div>
      </div>
    </div>
  );
}
