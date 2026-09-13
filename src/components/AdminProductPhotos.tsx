import { useCallback, useEffect, useState } from 'react';
import { supabase, productImageUrl, PRODUCT_IMAGES_BUCKET } from '../lib/supabaseClient';
import { processImageToWebp } from '../lib/imageProcessing';
import type { ProductImage } from '../types';

interface Props {
  productId: string;
  productCode: string;
}

const MAX_PHOTOS = 10;

export function AdminProductPhotos({ productId, productCode }: Props) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingColor, setPendingColor] = useState('');
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
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleSold(img: ProductImage) {
    setError(null);
    const { error } = await supabase
      .from('product_images')
      .update({ is_sold: !img.is_sold })
      .eq('id', img.id);
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

      const { error: insertError } = await supabase.from('product_images').insert({
        product_id: productId,
        storage_path: storagePath,
        sort_order: nextSortOrder,
        color_label: pendingColor.trim() || null,
      });
      if (insertError) throw new Error(insertError.message);

      setPendingFile(null);
      setPendingColor('');
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
            {img.is_sold && <span className="badge badge-out">Sold</span>}
          </div>
          {img.color_label && <span className="hint-text">{img.color_label}</span>}
          <button
            className={img.is_sold ? 'btn btn-secondary' : 'btn btn-primary'}
            onClick={() => toggleSold(img)}
          >
            {img.is_sold ? 'Mark Available' : 'Mark Sold'}
          </button>
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
