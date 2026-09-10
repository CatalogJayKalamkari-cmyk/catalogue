import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ProductType, PublicProduct } from '../types';
import { ProductCard } from '../components/ProductCard';

// V1 keeps this un-paginated — fine for a small/medium manufacturer catalog.
// If the list grows into the thousands, switch to keyset pagination here.
const CATALOG_LIMIT = 500;

export default function Catalog() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [productsRes, typesRes] = await Promise.all([
          supabase
            .from('products_public')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(CATALOG_LIMIT),
          supabase.from('product_types').select('id, name, prefix'),
        ]);

        if (productsRes.error) {
          setError(productsRes.error.message);
          return;
        }

        const productList = productsRes.data ?? [];
        setProducts(productList);
        setTypes(typesRes.data ?? []);

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
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (typeFilter !== 'all' && p.type_id !== typeFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return p.name.toLowerCase().includes(q) || p.product_code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, typeFilter, search]);

  return (
    <div className="page">
      <header className="catalog-header">
        <h1>Catalog</h1>
        <input
          className="search-input"
          type="search"
          placeholder="Search name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {types.length > 0 && (
          <div className="type-chips">
            <button
              className={typeFilter === 'all' ? 'chip chip-active' : 'chip'}
              onClick={() => setTypeFilter('all')}
            >
              All
            </button>
            {types.map((t) => (
              <button
                key={t.id}
                className={typeFilter === t.id ? 'chip chip-active' : 'chip'}
                onClick={() => setTypeFilter(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {loading && <p className="page-center">Loading catalog…</p>}
      {error && <p className="page-center error-text">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="page-center">No products found.</p>
      )}

      <div className="product-grid">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} imagePath={thumbnails[p.id] ?? null} />
        ))}
      </div>
    </div>
  );
}
