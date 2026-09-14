import { useEffect, useState } from 'react';
import { supabase, PRODUCT_IMAGES_BUCKET } from '../lib/supabaseClient';
import { AdminNav } from '../components/AdminNav';
import { StatCard } from '../components/StatCard';
import { RankedList } from '../components/RankedList';
import { useLanguage } from '../lib/i18n';

const FREE_TIER_STORAGE_BYTES = 1024 * 1024 * 1024; // Supabase free tier: 1 GB
const LOW_STOCK_THRESHOLD = 3;
const TOP_SELLERS_WINDOW_DAYS = 30;

interface CategoryStat {
  id: string;
  name: string;
  productCount: number;
  quantityRemaining: number;
}

interface TopSeller {
  productId: string;
  name: string;
  productCode: string;
  quantitySold: number;
}

interface Stats {
  totalProducts: number;
  quantityRemaining: number;
  addedToday: number;
  soldToday: number;
  revenueToday: number;
  profitToday: number;
  revenueTotal: number;
  profitTotal: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  storageUsedBytes: number;
  topSellers: TopSeller[];
  categories: CategoryStat[];
}

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function storagePct(bytes: number): number {
  return Math.min((bytes / FREE_TIER_STORAGE_BYTES) * 100, 100);
}

function formatCurrency(n: number): string {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? '-' : '';
  return `${sign}₹${Math.abs(rounded).toLocaleString('en-IN')}`;
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
        const sellersSince = daysAgo(TOP_SELLERS_WINDOW_DAYS);

        const [productsRes, typesRes, categoriesRes, salesRes, storageUsedBytes] = await Promise.all([
          supabase
            .from('products')
            .select('id, type_id, product_code, name, quantity, price_acquired, is_active, created_at'),
          supabase.from('product_types').select('id, category_id'),
          supabase.from('product_categories').select('id, name, sort_order').order('sort_order'),
          supabase.from('stock_transactions').select('product_id, quantity_sold, revenue, created_at'),
          getStorageUsedBytes(),
        ]);

        const firstError = productsRes.error ?? typesRes.error ?? categoriesRes.error ?? salesRes.error;
        if (firstError) {
          setError(firstError.message ?? t('dashboard.failedToLoad'));
          return;
        }

        const allProducts = productsRes.data ?? [];
        const activeProducts = allProducts.filter((p) => p.is_active);
        const productById = new Map(allProducts.map((p) => [p.id, p]));

        const addedToday = activeProducts.filter((p) => p.created_at >= todayStart).length;
        const quantityRemaining = activeProducts.reduce((sum, p) => sum + p.quantity, 0);

        const outOfStockCount = activeProducts.filter((p) => p.quantity === 0).length;
        const lowStockCount = activeProducts.filter(
          (p) => p.quantity > 0 && p.quantity <= LOW_STOCK_THRESHOLD
        ).length;
        const inStockCount = activeProducts.length - outOfStockCount - lowStockCount;

        function profitOf(productId: string, quantitySold: number, revenue: number): number {
          const cost = (productById.get(productId)?.price_acquired ?? 0) * quantitySold;
          return revenue - cost;
        }

        const allSales = salesRes.data ?? [];
        const revenueTotal = allSales.reduce((sum, s) => sum + Number(s.revenue), 0);
        const profitTotal = allSales.reduce(
          (sum, s) => sum + profitOf(s.product_id, s.quantity_sold, Number(s.revenue)),
          0
        );

        const salesToday = allSales.filter((s) => s.created_at >= todayStart);
        const soldToday = salesToday.reduce((sum, s) => sum + s.quantity_sold, 0);
        const revenueToday = salesToday.reduce((sum, s) => sum + Number(s.revenue), 0);
        const profitToday = salesToday.reduce(
          (sum, s) => sum + profitOf(s.product_id, s.quantity_sold, Number(s.revenue)),
          0
        );

        const sellerTotals = new Map<string, number>();
        for (const s of allSales) {
          if (s.created_at < sellersSince) continue;
          sellerTotals.set(s.product_id, (sellerTotals.get(s.product_id) ?? 0) + s.quantity_sold);
        }
        const topSellers: TopSeller[] = [...sellerTotals.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([productId, quantitySold]) => {
            const product = productById.get(productId);
            return {
              productId,
              name: product?.name ?? '—',
              productCode: product?.product_code ?? '',
              quantitySold,
            };
          });

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
          soldToday,
          revenueToday,
          profitToday,
          revenueTotal,
          profitTotal,
          inStockCount,
          lowStockCount,
          outOfStockCount,
          storageUsedBytes,
          topSellers,
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
            <h2>{t('dashboard.section.today')}</h2>
            <div className="stat-grid">
              <StatCard label={t('dashboard.addedToday')} value={stats.addedToday.toString()} />
              <StatCard label={t('dashboard.soldToday')} value={stats.soldToday.toString()} />
              <StatCard label={t('dashboard.revenueToday')} value={formatCurrency(stats.revenueToday)} />
              <StatCard
                label={t('dashboard.profitToday')}
                value={formatCurrency(stats.profitToday)}
                tone={stats.profitToday >= 0 ? 'success' : 'danger'}
              />
            </div>
          </section>

          <section className="dashboard-section">
            <h2>{t('dashboard.section.overall')}</h2>
            <div className="stat-grid">
              <StatCard label={t('dashboard.totalProducts')} value={stats.totalProducts.toString()} />
              <StatCard label={t('dashboard.quantityRemaining')} value={stats.quantityRemaining.toString()} />
              <StatCard label={t('dashboard.revenueGenerated')} value={formatCurrency(stats.revenueTotal)} />
              <StatCard
                label={t('dashboard.profitGenerated')}
                value={formatCurrency(stats.profitTotal)}
                tone={stats.profitTotal >= 0 ? 'success' : 'danger'}
              />
            </div>
            <p className="hint-text">{t('dashboard.profitHint')}</p>
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
            <h2>{t('dashboard.section.topSellers')}</h2>
            <RankedList
              emptyText={t('dashboard.noSales')}
              items={stats.topSellers.map((s) => ({
                key: s.productId,
                title: s.name,
                subtitle: s.productCode,
                value: t('dashboard.unitsSold', { n: s.quantitySold }),
              }))}
            />
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
