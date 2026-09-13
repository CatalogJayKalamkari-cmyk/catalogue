import { useCallback, useEffect, useState } from 'react';
import { supabase, productImageUrl } from '../lib/supabaseClient';
import type { ProductImage } from '../types';

interface Props {
  productId: string;
}

export function AdminProductPhotos({ productId }: Props) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <p className="hint-text">Loading photos…</p>;
  if (images.length === 0) return <p className="hint-text">No photos on this product.</p>;

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
    </div>
  );
}
