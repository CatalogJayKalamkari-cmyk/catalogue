import JSZip from 'jszip';
import { supabase, PRODUCT_IMAGES_BUCKET } from './supabaseClient';

const EXPORT_TABLES = ['products', 'product_types', 'product_images', 'product_categories', 'stock_transactions'] as const;

const IMAGE_DOWNLOAD_CONCURRENCY = 8;

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function listAllImagePaths(): Promise<string[]> {
  const { data: images } = await supabase.from('product_images').select('storage_path');
  const folders = [...new Set((images ?? []).map((img) => img.storage_path.split('/')[0]))];

  const listings = await Promise.all(
    folders.map((folder) => supabase.storage.from(PRODUCT_IMAGES_BUCKET).list(folder))
  );

  return listings.flatMap(({ data: files }, i) =>
    (files ?? []).map((f) => `${folders[i]}/${f.name}`)
  );
}

export async function runFullExport(adminEmail: string, onProgress?: (msg: string) => void): Promise<Blob> {
  const zip = new JSZip();
  const tableCounts: Record<string, number> = {};

  for (const table of EXPORT_TABLES) {
    onProgress?.(`Exporting ${table}…`);
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw new Error(`Failed to export ${table}: ${error.message}`);
    tableCounts[table] = data?.length ?? 0;
    zip.file(`${table}.json`, JSON.stringify(data ?? [], null, 2));
  }

  onProgress?.('Listing photos…');
  const imagePaths = await listAllImagePaths();

  let downloaded = 0;
  await mapWithConcurrency(imagePaths, IMAGE_DOWNLOAD_CONCURRENCY, async (path) => {
    const { data, error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).download(path);
    if (error || !data) {
      onProgress?.(`Warning: could not fetch ${path}`);
      return;
    }
    zip.file(`images/${path}`, data);
    downloaded += 1;
    onProgress?.(`Fetched ${downloaded}/${imagePaths.length} photos…`);
  });

  zip.file(
    'manifest.json',
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        exportedBy: adminEmail,
        tables: tableCounts,
        imageCount: downloaded,
      },
      null,
      2
    )
  );

  onProgress?.('Building zip…');
  return zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
