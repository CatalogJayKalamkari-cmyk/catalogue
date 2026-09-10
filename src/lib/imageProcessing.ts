// Client-side image prep: every product photo is center-cropped to a fixed
// aspect ratio (so the mobile catalog grid looks uniform no matter how the
// owner framed the photo) and re-encoded as WebP, keeping ~1000+ images
// well inside Supabase Storage's free 1GB tier.

const TARGET_WIDTH = 960;
const TARGET_HEIGHT = 1200; // 4:5 portrait, matches typical phone product shots
const WEBP_QUALITY = 0.8;

export async function processImageToWebp(file: File): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const targetRatio = TARGET_WIDTH / TARGET_HEIGHT;
    const sourceRatio = img.width / img.height;

    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;

    if (sourceRatio > targetRatio) {
      // source is wider than target: crop the sides
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
    } else if (sourceRatio < targetRatio) {
      // source is taller than target: crop top/bottom
      sh = img.width / targetRatio;
      sy = (img.height - sh) / 2;
    }

    const canvas = document.createElement('canvas');
    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY)
    );
    if (!blob) throw new Error('Image compression failed');
    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read image file'));
    img.src = src;
  });
}
