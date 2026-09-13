import { useCallback, useEffect, useState } from 'react';
import { supabase, productImageUrl, PRODUCT_IMAGES_BUCKET } from '../lib/supabaseClient';
import { processImageToWebp } from '../lib/imageProcessing';
import { useLanguage } from '../lib/i18n';
import type { ProductImage } from '../types';

interface Props {
  productId: string;
  productCode: string;
  isMultiColor: boolean;
  view: 'sale' | 'acquire' | 'edit';
}

const MAX_PHOTOS = 10;

export function AdminProductPhotos({ productId, productCode, isMultiColor, view }: Props) {
  const { t } = useLanguage();
  const showSale = view === 'sale';
  const showAcquire = view === 'acquire';
  const showAddPhoto = view === 'acquire' || view === 'edit';
  const [images, setImages] = useState<ProductImage[]>([]);
  const [saleQty, setSaleQty] = useState<Record<string, string>>({});
  const [acquireQty, setAcquireQty] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingColor, setPendingColor] = useState('');
  const [pendingQty, setPendingQty] = useState('1');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order');
    if (error) setError(error.message);
    setImages(data ?? []);
    const defaults: Record<string, string> = {};
    for (const img of data ?? []) defaults[img.id] = '0';
    setSaleQty(defaults);
    setAcquireQty(defaults);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveSale(img: ProductImage) {
    const qty = Number(saleQty[img.id]);
    if (!Number.isInteger(qty) || qty <= 0) {
      setError(t('photos.invalidSaleQty'));
      return;
    }
    if (qty > img.quantity) {
      setError(t('photos.onlyColorInStock', { n: img.quantity }));
      return;
    }
    setError(null);
    const { error } = await supabase.rpc('sell_photo', { p_image_id: img.id, p_quantity: qty });
    if (error) {
      setError(error.message);
      return;
    }
    load();
  }

  async function saveAcquire(img: ProductImage) {
    const qty = Number(acquireQty[img.id]);
    if (!Number.isInteger(qty) || qty <= 0) {
      setError(t('photos.invalidAcquireQty'));
      return;
    }
    setError(null);
    const { error } = await supabase.rpc('acquire_photo', { p_image_id: img.id, p_quantity: qty });
    if (error) {
      setError(error.message);
      return;
    }
    load();
  }

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = '';
  }

  async function confirmAddPhoto() {
    if (!pendingFile) return;
    if (isMultiColor && (!Number.isInteger(Number(pendingQty)) || Number(pendingQty) < 0)) {
      setError(t('photos.invalidColorQty'));
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const nextSortOrder = images.length > 0 ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;
      const webp = await processImageToWebp(pendingFile);
      const storagePath = `${productCode}/${nextSortOrder}.webp`;
      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(storagePath, webp, { contentType: 'image/webp', upsert: true });
      if (uploadError) throw new Error(uploadError.message);

      const newQty = isMultiColor ? Number(pendingQty) : 1;
      const { error: insertError } = await supabase.from('product_images').insert({
        product_id: productId,
        storage_path: storagePath,
        sort_order: nextSortOrder,
        color_label: pendingColor.trim() || null,
        quantity: newQty,
        initial_quantity: newQty,
      });
      if (insertError) throw new Error(insertError.message);

      setPendingFile(null);
      setPendingColor('');
      setPendingQty('1');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('photos.couldNotAdd'));
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <p className="hint-text">{t('photos.loading')}</p>;

  return (
    <div className="admin-photo-list">
      {error && <p className="error-text">{error}</p>}
      {images.map((img) => (
        <div key={img.id} className="admin-photo-item">
          <div className="admin-photo-thumb">
            <img src={productImageUrl(img.storage_path)} alt="" />
            {isMultiColor && img.quantity === 0 && <span className="badge badge-out">{t('photos.sold')}</span>}
          </div>
          {img.color_label && <span className="hint-text">{img.color_label}</span>}
          {isMultiColor && (
            <span className="hint-text">
              {t('photos.initial')}: {img.initial_quantity} · {t('photos.current')}: {img.quantity}
            </span>
          )}

          {isMultiColor && showSale && (
            <>
              <span className="hint-text">{t('photos.sale')}</span>
              <div className="row-inline">
                <input
                  type="number"
                  min="0"
                  value={saleQty[img.id] ?? '0'}
                  onChange={(e) => setSaleQty((prev) => ({ ...prev, [img.id]: e.target.value }))}
                />
                <button className="btn btn-primary" disabled={img.quantity === 0} onClick={() => saveSale(img)}>
                  {t('photos.save')}
                </button>
              </div>
            </>
          )}

          {isMultiColor && showAcquire && (
            <>
              <span className="hint-text">{t('photos.acquired')}</span>
              <div className="row-inline">
                <input
                  type="number"
                  min="0"
                  value={acquireQty[img.id] ?? '0'}
                  onChange={(e) => setAcquireQty((prev) => ({ ...prev, [img.id]: e.target.value }))}
                />
                <button className="btn btn-secondary" onClick={() => saveAcquire(img)}>
                  {t('photos.save')}
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {images.length === 0 && <p className="hint-text">{t('photos.none')}</p>}

      {showAddPhoto && images.length < MAX_PHOTOS && !pendingFile && (
        <label className="image-add-tile">
          <input type="file" accept="image/*" capture="environment" onChange={handlePick} hidden />
          {t('photos.addPhoto')}
        </label>
      )}

      {showAddPhoto && pendingFile && (
        <div className="admin-photo-item">
          <div className="admin-photo-thumb">
            <img src={URL.createObjectURL(pendingFile)} alt="New photo preview" />
          </div>
          <input
            className="image-color-input"
            type="text"
            placeholder={t('photos.colorNameOptional')}
            value={pendingColor}
            onChange={(e) => setPendingColor(e.target.value)}
          />
          {isMultiColor && (
            <input
              className="image-color-input"
              type="number"
              min="0"
              step="1"
              placeholder={t('photos.qty')}
              value={pendingQty}
              onChange={(e) => setPendingQty(e.target.value)}
            />
          )}
          <div className="row-inline">
            <button className="btn btn-primary" disabled={uploading} onClick={confirmAddPhoto}>
              {uploading ? t('photos.adding') : t('photos.add')}
            </button>
            <button className="btn btn-secondary" onClick={() => setPendingFile(null)}>
              {t('photos.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
