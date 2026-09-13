import { useEffect, useState } from 'react';
import { supabase, PRODUCT_IMAGES_BUCKET } from '../lib/supabaseClient';
import { AdminNav } from '../components/AdminNav';
import { StatCard } from '../components/StatCard';

interface Stats {
  totalProducts: number;
  quantityRemaining: number;
  revenueGenerated: number;
  addedToday: number;
  soldToday: number;
  storageUsedBytes: number;
}

const FREE_TIER_STORAGE_BYTES = 1024 * 1024 * 1024; // Supabase free tier: 1 GB

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function formatStorage(bytes: number): string {
  const pct = ((bytes / FREE_TIER_STORAGE_BYTES) * 100).toFixed(2);
  return `${pct}%`;
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const todayStart = startOfToday();

        const [productsRes, salesRes, salesTodayRes, storageUsedBytes] = await Promise.all([
          supabase.from('products').select('id, quantity, created_at').eq('is_active', true),
          supabase.from('stock_transactions').select('revenue'),
          supabase
            .from('stock_transactions')
            .select('quantity_sold')
            .gte('created_at', todayStart),
          getStorageUsedBytes(),
        ]);

        if (productsRes.error || salesRes.error || salesTodayRes.error) {
          setError(
            productsRes.error?.message ??
              salesRes.error?.message ??
              salesTodayRes.error?.message ??
              'Failed to load stats'
          );
          return;
        }

        const products = productsRes.data ?? [];
        const addedToday = products.filter((p) => p.created_at >= todayStart).length;
        const quantityRemaining = products.reduce((sum, p) => sum + p.quantity, 0);
        const revenueGenerated = (salesRes.data ?? []).reduce((sum, s) => sum + Number(s.revenue), 0);
        const soldToday = (salesTodayRes.data ?? []).reduce((sum, s) => sum + s.quantity_sold, 0);

        setStats({
          totalProducts: products.length,
          quantityRemaining,
          revenueGenerated,
          addedToday,
          soldToday,
          storageUsedBytes,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not reach the server. Check your connection.');
      }
    }

    load();
  }, []);

  return (
    <div className="page admin-page">
      <h1>Dashboard</h1>
      {error && <p className="error-text">{error}</p>}
      {!stats && !error && <p>Loading…</p>}
      {stats && (
        <div className="stat-grid">
          <StatCard label="Total Products" value={stats.totalProducts.toString()} />
          <StatCard label="Quantity Remaining" value={stats.quantityRemaining.toString()} />
          <StatCard
            label="Revenue Generated"
            value={`₹${stats.revenueGenerated.toLocaleString('en-IN')}`}
          />
          <StatCard label="Added Today" value={stats.addedToday.toString()} />
          <StatCard label="Sold Today" value={stats.soldToday.toString()} />
          <StatCard label="Storage Used" value={formatStorage(stats.storageUsedBytes)} />
        </div>
      )}
      <AdminNav />
    </div>
  );
}
