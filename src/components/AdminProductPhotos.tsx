import { useCallback, useEffect, useState } from 'react';
import { supabase, productImageUrl, PRODUCT_IMAGES_BUCKET } from '../lib/supabaseClient';
import { processImageToWebp } from '../lib/imageProcessing';
import type { ProductImage } from '../types';

interface Props {
  productId: string;
  productCode: string;
  isMultiColor: boolean;
}

const MAX_PHOTOS = 10;

export function AdminProductPhotos({ productId, productCode, isMultiColor }: Props) {
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
    for (const img of data ?? []) defaults[img.id] = '1';
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
      setError('Enter a valid sale quantity.');
      return;
    }
    if (qty > img.quantity) {
      setError(`Only ${img.quantity} of this color in stock.`);
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
      setError('Enter a valid acquired quantity.');
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
      setError('Enter a valid quantity for this color.');
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
      setError(err instanceof Error ? err.message : 'Could not add photo.');
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <p className="hint-text">Loading photos…</p>;

  return (
    <div className="admin-photo-list">
      {error && <p className="error-text">{error}</p>}
      {images.map((img) => (
        <div key={img.id} className="admin-photo-item">
          <div className="admin-photo-thumb">
            <img src={productImageUrl(img.storage_path)} alt="" />
            {isMultiColor && img.quantity === 0 && <span className="badge badge-out">Sold</span>}
          </div>
          {img.color_label && <span className="hint-text">{img.color_label}</span>}
          {isMultiColor && (
            <>
              <span className="hint-text">
                Initial: {img.initial_quantity} · Current: {img.quantity}
              </span>

              <span className="hint-text">Sale</span>
              <div className="row-inline">
                <input
                  type="number"
                  min="1"
                  value={saleQty[img.id] ?? '1'}
                  onChange={(e) => setSaleQty((prev) => ({ ...prev, [img.id]: e.target.value }))}
                />
                <button className="btn btn-primary" disabled={img.quantity === 0} onClick={() => saveSale(img)}>
                  Save
                </button>
              </div>

              <span className="hint-text">Acquired</span>
              <div className="row-inline">
                <input
                  type="number"
                  min="1"
                  value={acquireQty[img.id] ?? '1'}
                  onChange={(e) => setAcquireQty((prev) => ({ ...prev, [img.id]: e.target.value }))}
                />
                <button className="btn btn-secondary" onClick={() => saveAcquire(img)}>
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {images.length === 0 && <p className="hint-text">No photos on this product.</p>}

      {images.length < MAX_PHOTOS && !pendingFile && (
        <label className="image-add-tile">
          <input type="file" accept="image/*" capture="environment" onChange={handlePick} hidden />
          + Photo
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
            placeholder="Color name (optional)"
            value={pendingColor}
            onChange={(e) => setPendingColor(e.target.value)}
          />
          {isMultiColor && (
            <input
              className="image-color-input"
              type="number"
              min="0"
              step="1"
              placeholder="Qty"
              value={pendingQty}
              onChange={(e) => setPendingQty(e.target.value)}
            />
          )}
          <div className="row-inline">
            <button className="btn btn-primary" disabled={uploading} onClick={confirmAddPhoto}>
              {uploading ? 'Adding…' : 'Add'}
            </button>
            <button className="btn btn-secondary" onClick={() => setPendingFile(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
