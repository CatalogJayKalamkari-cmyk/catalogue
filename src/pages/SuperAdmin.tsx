import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { isSuperAdminEmail } from '../lib/superAdmin';
import { getStorageUsedBytes, storagePct } from '../lib/storageUsage';
import { runFullExport, downloadBlob } from '../lib/exportData';
import { TypeToConfirmButton } from '../components/TypeToConfirmButton';
import { AdminNav } from '../components/AdminNav';
import type { SiteStatus } from '../types';

const DB_SIZE_LIMIT_BYTES = 500 * 1024 * 1024; // Supabase free tier: 500 MB
const SUPABASE_USAGE_URL = 'https://supabase.com/dashboard/project/erxmasxpqhyzxmqaynrv/settings/billing/usage';

interface Usage {
  dbSizeBytes: number;
  storageBytes: number;
  monthlyActiveUsers: number;
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SuperAdmin() {
  const { session } = useAuth();
  const email = session?.user?.email;
  const allowed = isSuperAdminEmail(email);

  const [status, setStatus] = useState<SiteStatus | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [confirmingRestore, setConfirmingRestore] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [statusRes, dbSizeRes, mauRes, storageBytes] = await Promise.all([
        supabase.from('site_status').select('*').eq('id', true).maybeSingle(),
        supabase.rpc('get_database_size_bytes'),
        supabase.rpc('get_monthly_active_users'),
        getStorageUsedBytes(),
      ]);

      if (statusRes.error) throw new Error(statusRes.error.message);
      setStatus(statusRes.data);

      setUsage({
        dbSizeBytes: Number(dbSizeRes.data ?? 0),
        storageBytes,
        monthlyActiveUsers: Number(mauRes.data ?? 0),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status.');
    }
  }, []);

  useEffect(() => {
    if (allowed) load();
  }, [allowed, load]);

  async function handleLockdown() {
    setWorking(true);
    setError(null);
    const { data, error } = await supabase.rpc('emergency_lockdown').single();
    setWorking(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStatus(data as SiteStatus);
  }

  async function handleRestore() {
    setWorking(true);
    setError(null);
    const { data, error } = await supabase.rpc('restore_public_access').single();
    setWorking(false);
    setConfirmingRestore(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStatus(data as SiteStatus);
  }

  async function handleExport() {
    if (!email) return;
    setExporting(true);
    setExportProgress('Starting export…');
    setError(null);
    try {
      const blob = await runFullExport(email, setExportProgress);
      downloadBlob(blob, `catalog-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.zip`);
      setExportProgress('Done — check your downloads.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
      setExportProgress(null);
    } finally {
      setExporting(false);
    }
  }

  if (!allowed) {
    return (
      <div className="page admin-page super-admin-page">
        <h1>Super Admin</h1>
        <p className="error-text">Access denied. This page is restricted to the site owner.</p>
        <AdminNav />
      </div>
    );
  }

  return (
    <div className="page admin-page super-admin-page">
      <h1>Super Admin</h1>
      {error && <p className="error-text">{error}</p>}

      {status && (
        <section className={status.is_locked_down ? 'status-banner status-banner-locked' : 'status-banner status-banner-live'}>
          <strong>{status.is_locked_down ? 'LOCKED DOWN — public access is blocked' : 'Live — public catalog is accessible'}</strong>
          {status.changed_at && (
            <span className="hint-text">Last changed {new Date(status.changed_at).toLocaleString()}</span>
          )}
        </section>
      )}

      <section className="dashboard-section">
        <h2>Free Plan Usage</h2>
        {usage && (
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-value">{formatBytes(usage.dbSizeBytes)}</span>
              <span className="stat-label">Database size / 500 MB ({storagePctOf(usage.dbSizeBytes, DB_SIZE_LIMIT_BYTES)}%)</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{formatBytes(usage.storageBytes)}</span>
              <span className="stat-label">File storage / 1 GB ({storagePct(usage.storageBytes).toFixed(1)}%)</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{usage.monthlyActiveUsers}</span>
              <span className="stat-label">Monthly active users</span>
            </div>
          </div>
        )}
        <p className="hint-text">
          Egress/bandwidth can't be safely shown here (Supabase only exposes it via an account-wide token).{' '}
          <a href={SUPABASE_USAGE_URL} target="_blank" rel="noreferrer">
            Check egress usage on Supabase →
          </a>
        </p>
      </section>

      <section className="dashboard-section danger-zone">
        <h2>Danger Zone</h2>
        {status?.is_locked_down ? (
          <>
            <p className="hint-text">The public catalog is currently locked down. Restore access when it's safe to do so.</p>
            {confirmingRestore ? (
              <div className="row-inline">
                <button className="btn btn-primary" disabled={working} onClick={handleRestore}>
                  {working ? 'Restoring…' : 'Confirm restore'}
                </button>
                <button className="btn btn-secondary" onClick={() => setConfirmingRestore(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setConfirmingRestore(true)}>
                Restore public access
              </button>
            )}
          </>
        ) : (
          <>
            <p className="hint-text">
              This immediately blocks all public read access to the catalog (data and photos) in case of an
              attack or abuse. The website itself stays online but shows a "temporarily unavailable" message.
            </p>
            <TypeToConfirmButton
              confirmWord="SHUTDOWN"
              label="Shut down public access"
              busy={working}
              danger
              onConfirm={handleLockdown}
            />
          </>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Export Complete Data</h2>
        <p className="hint-text">
          Downloads every table (including legacy price/sales data) and every product photo as a single ZIP
          file, so you can migrate to a different backend later.
        </p>
        <button className="btn btn-secondary" disabled={exporting} onClick={handleExport}>
          {exporting ? 'Exporting…' : 'Download complete backup'}
        </button>
        {exportProgress && <p className="hint-text">{exportProgress}</p>}
      </section>

      <AdminNav />
    </div>
  );
}

function storagePctOf(used: number, limit: number): string {
  return Math.min((used / limit) * 100, 100).toFixed(1);
}
