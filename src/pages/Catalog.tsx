import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ProductCategory, ProductType, PublicProduct } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductViewer } from '../components/ProductViewer';

// V1 keeps this un-paginated — fine for a small/medium manufacturer catalog.
// If the list grows into the thousands, switch to keyset pagination here.
const CATALOG_LIMIT = 500;

export default function Catalog() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [productsRes, typesRes, categoriesRes] = await Promise.all([
          supabase
            .from('products_public')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(CATALOG_LIMIT),
          supabase.from('product_types').select('id, name, prefix, category_id'),
          supabase.from('product_categories').select('id, name, sort_order').order('sort_order'),
        ]);

        if (productsRes.error) {
          setError(productsRes.error.message);
          return;
        }

        const productList = productsRes.data ?? [];
        setProducts(productList);
        setTypes(typesRes.data ?? []);
        setCategories(categoriesRes.data ?? []);

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

  const typeIdToCategoryId = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const t of types) map[t.id] = t.category_id;
    return map;
  }, [types]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'all' && typeIdToCategoryId[p.type_id] !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return p.name.toLowerCase().includes(q) || p.product_code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, categoryFilter, typeIdToCategoryId, search]);

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
        {categories.length > 0 && (
          <div className="type-chips">
            <button
              className={categoryFilter === 'all' ? 'chip chip-active' : 'chip'}
              onClick={() => setCategoryFilter('all')}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={categoryFilter === c.id ? 'chip chip-active' : 'chip'}
                onClick={() => setCategoryFilter(c.id)}
              >
                {c.name}
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
        {filtered.map((p, idx) => (
          <ProductCard
            key={p.id}
            product={p}
            imagePath={thumbnails[p.id] ?? null}
            onClick={() => setViewerIndex(idx)}
          />
        ))}
      </div>

      {viewerIndex !== null && (
        <ProductViewer products={filtered} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
      )}
    </div>
  );
}
