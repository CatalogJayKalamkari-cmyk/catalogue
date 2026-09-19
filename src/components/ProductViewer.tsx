import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { PublicProduct } from '../types';
import { supabase, productImageUrl } from '../lib/supabaseClient';
import { useLanguage } from '../lib/i18n';

interface Props {
  products: PublicProduct[];
  startIndex: number;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 50;

export function ProductViewer({ products, startIndex, onClose }: Props) {
  const { t } = useLanguage();
  const [productIndex, setProductIndex] = useState(startIndex);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [, forceRender] = useState(0);
  const imageCache = useRef<Record<string, { url: string; quantity: number; colorLabel: string | null }[]>>({});
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const product = products[productIndex];

  useEffect(() => {
    setPhotoIndex(0);
    setIsFavorite(false);
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
      .select('storage_path, quantity, color_label')
      .eq('product_id', product.id)
      .order('sort_order')
      .then(({ data }) => {
        if (cancelled) return;
        imageCache.current[product.id] = (data ?? []).map((row) => ({
          url: productImageUrl(row.storage_path),
          quantity: row.quantity,
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
      if (photos.length === 0) return;
      if (dx < 0) {
        setPhotoIndex((i) => (i + 1) % photos.length);
      } else {
        setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
      }
    } else {
      if (Math.abs(dy) < SWIPE_THRESHOLD) return;
      if (dy < 0) {
        setProductIndex((i) => (i + 1) % products.length);
      } else {
        setProductIndex((i) => (i - 1 + products.length) % products.length);
      }
    }
  }

  return (
    <div className="viewer-overlay" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
      <div className="viewer-topbar">
        <button className="viewer-back" onClick={onClose} aria-label={t('viewer.back')}>
          ←
        </button>
        {photos.length > 0 && (
          <div className="viewer-dots" aria-label={`${photoIndex + 1} of ${photos.length}`}>
            {photos.map((_, i) => (
              <button
                key={i}
                className={i === photoIndex ? 'viewer-dot active' : 'viewer-dot'}
                onClick={() => setPhotoIndex(i)}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="viewer-media">
        <div className="viewer-media-shade" />
        {currentPhoto ? (
          <img src={currentPhoto.url} alt={product.name} draggable={false} />
        ) : (
          <div className="viewer-media-placeholder">{t('catalog.noPhoto')}</div>
        )}
        {photos.length > 1 && (
          <div className="viewer-photo-nav">
            <button
              className="viewer-photo-control viewer-photo-control-prev"
              onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              className="viewer-photo-control viewer-photo-control-next"
              onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
              aria-label="Next photo"
            >
              ›
            </button>
          </div>
        )}
        {product.is_multi_color && currentPhoto?.quantity === 0 && (
          <span className="viewer-photo-sold-badge">{t('viewer.sold')}</span>
        )}
      </div>

      <div className="viewer-details">
        <div className="viewer-details-main">
          <div className="viewer-product-copy">
            {!product.in_stock && <span className="viewer-badge-out">{t('catalog.outOfStock')}</span>}
            <span className="product-code">{product.product_code}</span>
            <span className="product-name">{product.name}</span>
            {product.print_type && (
              <span className="viewer-color-label">
                {product.print_type === 'screen' ? t('addProduct.screenPrinted') : t('addProduct.blockPrinted')}
              </span>
            )}
            {currentPhoto?.colorLabel && (
              <span className="viewer-color-label">
                {t('viewer.color')}: {currentPhoto.colorLabel}
              </span>
            )}
          </div>
          <div className="viewer-product-meta">
            <span className="product-price">₹{product.price_selling.toLocaleString('en-IN')}</span>
            <span className="product-qty">
              {t('catalog.qty')}: {product.is_multi_color ? (currentPhoto?.quantity ?? 0) : product.quantity}
            </span>
          </div>
        </div>
        <div className="viewer-actions">
          <button
            className={isFavorite ? 'viewer-action active' : 'viewer-action'}
            onClick={() => setIsFavorite((value) => !value)}
            aria-label="Add to favorites"
          >
            {isFavorite ? '♥' : '♡'}
          </button>
          <button className="viewer-action" onClick={() => navigator.share?.({ title: product.name })} aria-label="Share product">
            ↗
          </button>
        </div>
      </div>
    </div>
  );
}
