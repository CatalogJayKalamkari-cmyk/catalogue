// One-off dev tool: generates placeholder test products (10 per product
// type) so the catalog can be exercised at realistic scale, then cleaned
// up later. There's no way to source real per-type product photography
// here, so each type gets 2 small generated placeholder images (its name
// rendered on a color swatch) - shared across all 10 products of that
// type, so storage cost stays tiny (2 images per type, not per product).

import { supabase, PRODUCT_IMAGES_BUCKET } from './supabaseClient';

const IMG_WIDTH = 480;
const IMG_HEIGHT = 600;
const IMAGES_PER_TYPE = 2;
const PRODUCTS_PER_TYPE = 10;
const TYPE_CONCURRENCY = 6;

interface ProductTypeRow {
  id: string;
  name: string;
  prefix: string;
}

export interface SeedResult {
  startedAt: string;
  typesProcessed: number;
  productsCreated: number;
  cleanupSql: string;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function generatePlaceholderImage(label: string, variant: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = IMG_WIDTH;
  canvas.height = IMG_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const hue = (hashString(label) + variant * 47) % 360;
  ctx.fillStyle = `hsl(${hue}, 40%, 90%)`;
  ctx.fillRect(0, 0, IMG_WIDTH, IMG_HEIGHT);

  ctx.fillStyle = `hsl(${hue}, 45%, 40%)`;
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = wrapText(ctx, label, IMG_WIDTH - 60);
  const lineHeight = 32;
  const startY = IMG_HEIGHT / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, IMG_WIDTH / 2, startY + i * lineHeight));

  ctx.font = '16px sans-serif';
  ctx.fillText(`TEST DATA ${variant + 1}`, IMG_WIDTH / 2, IMG_HEIGHT - 30);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.7));
  if (!blob) throw new Error('Placeholder generation failed');
  return blob;
}

async function seedOneType(type: ProductTypeRow): Promise<number> {
  const imagePaths: string[] = [];
  for (let i = 0; i < IMAGES_PER_TYPE; i++) {
    const blob = await generatePlaceholderImage(type.name, i);
    const path = `_test/${type.prefix}/${i}.webp`;
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, blob, { contentType: 'image/webp', upsert: true });
    if (error) throw new Error(`Image upload failed for ${type.name}: ${error.message}`);
    imagePaths.push(path);
  }

  let created = 0;
  for (let n = 0; n < PRODUCTS_PER_TYPE; n++) {
    const { data: product, error: createError } = await supabase
      .rpc('create_product', {
        p_type_id: type.id,
        p_quantity: 5,
        p_is_multi_color: false,
        p_print_type: n % 2 === 0 ? 'screen' : 'block',
      })
      .single();
    if (createError || !product) throw new Error(`create_product failed for ${type.name}: ${createError?.message}`);

    const productId = (product as { id: string }).id;
    const { error: imgError } = await supabase.from('product_images').insert(
      imagePaths.map((path, sortOrder) => ({
        product_id: productId,
        storage_path: path,
        sort_order: sortOrder,
        quantity: 1,
        initial_quantity: 1,
      }))
    );
    if (imgError) throw new Error(`product_images insert failed for ${type.name}: ${imgError.message}`);
    created += 1;
  }
  return created;
}

async function mapWithConcurrency<T>(items: T[], limit: number, fn: (item: T, index: number) => Promise<void>) {
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

export async function runSeedTestData(onProgress?: (msg: string) => void): Promise<SeedResult> {
  const startedAt = new Date().toISOString();

  const { data: types, error } = await supabase.from('product_types').select('id, name, prefix');
  if (error) throw new Error(error.message);
  const typeList = (types ?? []) as ProductTypeRow[];

  let typesProcessed = 0;
  let productsCreated = 0;

  await mapWithConcurrency(typeList, TYPE_CONCURRENCY, async (type) => {
    const created = await seedOneType(type);
    typesProcessed += 1;
    productsCreated += created;
    onProgress?.(`${typesProcessed}/${typeList.length} types done (${productsCreated} products created)…`);
  });

  return {
    startedAt,
    typesProcessed,
    productsCreated,
    cleanupSql: `delete from products where created_at >= '${startedAt}';`,
  };
}
