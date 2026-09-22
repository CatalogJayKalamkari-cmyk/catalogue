import { useEffect, useState } from 'react';
import { supabase, PRODUCT_IMAGES_BUCKET } from '../lib/supabaseClient';
import { AdminNav } from '../components/AdminNav';
import { StatCard } from '../components/StatCard';
import { RankedList } from '../components/RankedList';
import { useLanguage } from '../lib/i18n';

const FREE_TIER_STORAGE_BYTES = 1024 * 1024 * 1024; // Supabase free tier: 1 GB
const LOW_STOCK_THRESHOLD = 3;

interface CategoryStat {
  id: string;
  name: string;
  productCount: number;
  quantityRemaining: number;
}

interface Stats {
  totalProducts: number;
  quantityRemaining: number;
  addedToday: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  storageUsedBytes: number;
  categories: CategoryStat[];
}

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function storagePct(bytes: number): number {
  return Math.min((bytes / FREE_TIER_STORAGE_BYTES) * 100, 100);
}

async function getStorageUsedBytes(): Promise<number> {
  const { data: images } = await supabase.from('product_images').select('storage_path');
  const folders = [...new Set((images ?? []).map((img) => img.storage_path.split('/')[0]))];

  const listings = await Promise.all(
    folders.map((folder) => supabase.storage.from(PRODUCT_IMAGES_BUCKET).list(folder))
  );

  return listings.reduce(
    (total, { data: files }) => total + (files ?? []).reduce((sum, f) => sum + (f.metadata?.size ?? 0), 0),
    0
  );
}

export default function AdminDashboard() {
  const { t, tc } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const todayStart = startOfToday();

        const [productsRes, typesRes, categoriesRes, storageUsedBytes] = await Promise.all([
          supabase.from('products').select('id, type_id, quantity, is_active, created_at'),
          supabase.from('product_types').select('id, category_id'),
          supabase.from('product_categories').select('id, name, sort_order').order('sort_order'),
          getStorageUsedBytes(),
        ]);

        const firstError = productsRes.error ?? typesRes.error ?? categoriesRes.error;
        if (firstError) {
          setError(firstError.message ?? t('dashboard.failedToLoad'));
          return;
        }

        const allProducts = productsRes.data ?? [];
        const activeProducts = allProducts.filter((p) => p.is_active);

        const addedToday = activeProducts.filter((p) => p.created_at >= todayStart).length;
        const quantityRemaining = activeProducts.reduce((sum, p) => sum + p.quantity, 0);

        const outOfStockCount = activeProducts.filter((p) => p.quantity === 0).length;
        const lowStockCount = activeProducts.filter(
          (p) => p.quantity > 0 && p.quantity <= LOW_STOCK_THRESHOLD
        ).length;
        const inStockCount = activeProducts.length - outOfStockCount - lowStockCount;

        const categoryIdByTypeId = new Map((typesRes.data ?? []).map((pt) => [pt.id, pt.category_id]));
        const categoryTotals = new Map<string, { productCount: number; quantityRemaining: number }>();
        for (const p of activeProducts) {
          const categoryId = categoryIdByTypeId.get(p.type_id);
          if (!categoryId) continue;
          const entry = categoryTotals.get(categoryId) ?? { productCount: 0, quantityRemaining: 0 };
          entry.productCount += 1;
          entry.quantityRemaining += p.quantity;
          categoryTotals.set(categoryId, entry);
        }
        const categories: CategoryStat[] = (categoriesRes.data ?? [])
          .map((c) => ({
            id: c.id,
            name: c.name,
            productCount: categoryTotals.get(c.id)?.productCount ?? 0,
            quantityRemaining: categoryTotals.get(c.id)?.quantityRemaining ?? 0,
          }))
          .filter((c) => c.productCount > 0);

        setStats({
          totalProducts: activeProducts.length,
          quantityRemaining,
          addedToday,
          inStockCount,
          lowStockCount,
          outOfStockCount,
          storageUsedBytes,
          categories,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : t('error.network'));
      }
    }

    load();
  }, [t]);

  return (
    <div className="page admin-page">
      <h1>{t('dashboard.title')}</h1>
      {error && <p className="error-text">{error}</p>}
      {!stats && !error && <p>{t('dashboard.loading')}</p>}
      {stats && (
        <>
          <section className="dashboard-section">
            <h2>{t('dashboard.section.overall')}</h2>
            <div className="stat-grid">
              <StatCard label={t('dashboard.totalProducts')} value={stats.totalProducts.toString()} />
              <StatCard label={t('dashboard.quantityRemaining')} value={stats.quantityRemaining.toString()} />
              <StatCard label={t('dashboard.addedToday')} value={stats.addedToday.toString()} />
            </div>
          </section>

          <section className="dashboard-section">
            <h2>{t('dashboard.section.stockHealth')}</h2>
            <div className="stat-grid">
              <StatCard label={t('dashboard.inStock')} value={stats.inStockCount.toString()} tone="success" />
              <StatCard
                label={t('dashboard.lowStock', { n: LOW_STOCK_THRESHOLD })}
                value={stats.lowStockCount.toString()}
                tone="warning"
              />
              <StatCard label={t('dashboard.outOfStock')} value={stats.outOfStockCount.toString()} tone="danger" />
            </div>
          </section>

          <section className="dashboard-section">
            <h2>{t('dashboard.section.byCategory')}</h2>
            <RankedList
              emptyText={t('dashboard.noCategories')}
              items={stats.categories.map((c) => ({
                key: c.id,
                title: tc(c.name),
                subtitle: t('dashboard.productsCount', { n: c.productCount }),
                value: t('dashboard.unitsLeft', { n: c.quantityRemaining }),
              }))}
            />
          </section>

          <section className="dashboard-section">
            <h2>{t('dashboard.section.storage')}</h2>
            <div className="storage-bar">
              <div className="storage-bar-fill" style={{ width: `${storagePct(stats.storageUsedBytes)}%` }} />
            </div>
            <p className="hint-text">
              {storagePct(stats.storageUsedBytes).toFixed(1)}% — {t('dashboard.storageHint')}
            </p>
          </section>
        </>
      )}
      <AdminNav />
    </div>
  );
}
