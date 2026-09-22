import { useCallback, useEffect, useState } from 'react';
import { supabase, productImageUrl, PRODUCT_IMAGES_BUCKET } from '../lib/supabaseClient';
import { processImageToWebp } from '../lib/imageProcessing';
import { useLanguage } from '../lib/i18n';
import type { ProductImage } from '../types';

interface Props {
  productId: string;
  productCode: string;
  isMultiColor: boolean;
}

const MAX_PHOTOS = 10;

export function AdminProductPhotos({ productId, productCode, isMultiColor }: Props) {
  const { t } = useLanguage();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [qty, setQty] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingColor, setPendingColor] = useState('');
  const [pendingQty, setPendingQty] = useState('1');
  const [uploading, setUploading] = useState(false);
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);
  const [savingImageId, setSavingImageId] = useState<string | null>(null);

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
    for (const img of data ?? []) defaults[img.id] = String(img.quantity);
    setQty(defaults);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveQuantity(img: ProductImage) {
    const newQty = Number(qty[img.id]);
    if (!Number.isInteger(newQty) || newQty < 0) {
      setError(t('photos.invalidColorQty'));
      return;
    }
    setError(null);
    setSavingImageId(img.id);
    const { error } = await supabase.from('product_images').update({ quantity: newQty }).eq('id', img.id);
    setSavingImageId(null);
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

  async function replacePhoto(img: ProductImage, file: File) {
    setError(null);
    setReplacingImageId(img.id);
    try {
      const webp = await processImageToWebp(file);
      // Upload to a brand-new path rather than overwriting img.storage_path:
      // the old path's URL is already cached (browser + CDN) everywhere it's
      // been shown (catalog cards, viewer, admin list), and overwriting the
      // same file at the same URL never invalidates those caches, so the
      // stale photo keeps showing everywhere except this one screen. A new
      // path means a new URL, which sidesteps every cache automatically.
      const newPath = `${productCode}/${img.sort_order}-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(newPath, webp, { contentType: 'image/webp' });
      if (uploadError) throw new Error(uploadError.message);

      const { error: updateError } = await supabase
        .from('product_images')
        .update({ storage_path: newPath })
        .eq('id', img.id);
      if (updateError) throw new Error(updateError.message);

      const oldPath = img.storage_path;
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([oldPath]);

      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('photos.couldNotReplace'));
    } finally {
      setReplacingImageId(null);
    }
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
          <label className="image-replace-control">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) replacePhoto(img, file);
                e.target.value = '';
              }}
              disabled={replacingImageId !== null}
              hidden
            />
            {replacingImageId === img.id ? t('photos.replacing') : t('photos.replace')}
          </label>
          <span className="hint-text">{img.color_label || '--'}</span>

          {isMultiColor && (
            <>
              <span className="hint-text">{t('photos.initial')}: {img.initial_quantity}</span>
              <div className="row-inline">
                <div className="field-group">
                  <span className="field-label">{t('row.qty')}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={qty[img.id] ?? '0'}
                    onChange={(e) => setQty((prev) => ({ ...prev, [img.id]: e.target.value }))}
                  />
                </div>
                <button
                  className="btn btn-secondary"
                  disabled={savingImageId === img.id}
                  onClick={() => saveQuantity(img)}
                >
                  {t('photos.save')}
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {images.length === 0 && <p className="hint-text">{t('photos.none')}</p>}

      {images.length < MAX_PHOTOS && !pendingFile && (
        <label className="image-add-tile">
          <input type="file" accept="image/*" capture="environment" onChange={handlePick} hidden />
          {t('photos.addPhoto')}
        </label>
      )}

      {pendingFile && (
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
