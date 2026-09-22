import { supabase, PRODUCT_IMAGES_BUCKET } from './supabaseClient';

export const FREE_TIER_STORAGE_BYTES = 1024 * 1024 * 1024; // Supabase free tier: 1 GB

export function storagePct(bytes: number): number {
  return Math.min((bytes / FREE_TIER_STORAGE_BYTES) * 100, 100);
}

export async function getStorageUsedBytes(): Promise<number> {
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
