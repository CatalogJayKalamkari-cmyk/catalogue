import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { AdminProduct } from '../types';
import { AdminNav } from '../components/AdminNav';
import { AdminProductRow } from '../components/AdminProductRow';

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      const productList = data ?? [];
      setProducts(productList);

      if (productList.length > 0) {
        const ids = productList.map((p) => p.id);
        const { data: images } = await supabase
          .from('product_images')
          .select('product_id, storage_path')
          .eq('sort_order', 0)
          .in('product_id', ids);

        const map: Record<string, string> = {};
        for (const img of images ?? []) {
          map[img.product_id] = img.storage_path;
        }
        setThumbnails(map);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.product_code.toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <div className="page admin-page">
      <h1>Products</h1>
      <input
        className="search-input"
        type="search"
        placeholder="Search name or code…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>Loading…</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>No products found.</p>}

      <div className="admin-product-list">
        {filtered.map((p) => (
          <AdminProductRow key={p.id} product={p} imagePath={thumbnails[p.id] ?? null} onChanged={load} />
        ))}
      </div>

      <AdminNav />
    </div>
  );
}
