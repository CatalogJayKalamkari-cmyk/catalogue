import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, PRODUCT_IMAGES_BUCKET } from '../lib/supabaseClient';
import { processImageToWebp } from '../lib/imageProcessing';
import { AdminNav } from '../components/AdminNav';
import { ImageUploader, type ImageEntry } from '../components/ImageUploader';
import { TypeSelect } from '../components/TypeSelect';
import type { AdminProduct } from '../types';

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState('');
  const [priceSelling, setPriceSelling] = useState('');
  const [priceAcquired, setPriceAcquired] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [colorMode, setColorMode] = useState<'single' | 'multi-color'>('single');
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setName('');
    setTypeId('');
    setPriceSelling('');
    setPriceAcquired('');
    setQuantity('1');
    setColorMode('single');
    setImages([]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!typeId) {
      setError('Please select a product type.');
      return;
    }
    if (images.length === 0) {
      setError('Please add at least one photo.');
      return;
    }
    const isMultiColor = colorMode === 'multi-color';
    if (isMultiColor && images.some((img) => !img.color.trim())) {
      setError('Enter a color name for each photo.');
      return;
    }
    if (isMultiColor && images.some((img) => !Number.isInteger(Number(img.quantity)) || Number(img.quantity) < 0)) {
      setError('Enter a valid quantity for each color.');
      return;
    }
    const sellingNum = Number(priceSelling);
    const acquiredNum = Number(priceAcquired);
    const quantityNum = isMultiColor
      ? images.reduce((sum, img) => sum + Number(img.quantity), 0)
      : Number(quantity);
    if (!Number.isFinite(sellingNum) || sellingNum < 0) {
      setError('Enter a valid selling price.');
      return;
    }
    if (!Number.isFinite(acquiredNum) || acquiredNum < 0) {
      setError('Enter a valid acquired price.');
      return;
    }
    if (sellingNum < acquiredNum) {
      setError('Selling price cannot be less than acquired price.');
      return;
    }
    if (!isMultiColor && (!Number.isInteger(quantityNum) || quantityNum < 0)) {
      setError('Enter a valid quantity.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: rpcData, error: createError } = await supabase
        .rpc('create_product', {
          p_type_id: typeId,
          p_name: name,
          p_price_selling: sellingNum,
          p_price_acquired: acquiredNum,
          p_quantity: quantityNum,
          p_is_multi_color: isMultiColor,
        })
        .single();

      if (createError || !rpcData) {
        throw new Error(createError?.message ?? 'Could not create product');
      }
      const product = rpcData as AdminProduct;

      for (let i = 0; i < images.length; i++) {
        const webp = await processImageToWebp(images[i].file);
        const storagePath = `${product.product_code}/${i}.webp`;
        const { error: uploadError } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(storagePath, webp, { contentType: 'image/webp', upsert: true });
        if (uploadError) throw new Error(uploadError.message);

        const imgQty = isMultiColor ? Number(images[i].quantity) : 1;
        const { error: imageRowError } = await supabase.from('product_images').insert({
          product_id: product.id,
          storage_path: storagePath,
          sort_order: i,
          color_label: isMultiColor ? images[i].color.trim() : null,
          quantity: imgQty,
          initial_quantity: imgQty,
        });
        if (imageRowError) throw new Error(imageRowError.message);
      }

      setSuccess(`Saved as ${product.product_code}.`);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page admin-page">
      <h1>Add Product</h1>
      <form className="product-form" onSubmit={handleSubmit}>
        <label>
          Color Mode
          <select value={colorMode} onChange={(e) => setColorMode(e.target.value as 'single' | 'multi-color')}>
            <option value="single">Single product</option>
            <option value="multi-color">Multi-color (each photo is a different color)</option>
          </select>
        </label>

        <label>
          Photos
          <ImageUploader
            entries={images}
            onChange={setImages}
            max={10}
            showColorInput={colorMode === 'multi-color'}
          />
        </label>

        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Type
          <TypeSelect value={typeId} onChange={setTypeId} />
        </label>

        <label>
          Selling Price (₹)
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={priceSelling}
            onChange={(e) => setPriceSelling(e.target.value)}
            required
          />
        </label>

        <label>
          Acquired Price (₹)
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={priceAcquired}
            onChange={(e) => setPriceAcquired(e.target.value)}
            required
          />
        </label>

        <label>
          Quantity
          {colorMode === 'multi-color' ? (
            <input
              type="number"
              value={images.reduce((sum, img) => sum + (Number(img.quantity) || 0), 0)}
              disabled
              readOnly
            />
          ) : (
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          )}
          {colorMode === 'multi-color' && <span className="hint-text">Sum of each color's quantity above.</span>}
        </label>

        {error && <p className="error-text">{error}</p>}
        {success && (
          <p className="success-text">
            {success}{' '}
            <button type="button" className="link-btn" onClick={() => navigate('/admin/products')}>
              View products
            </button>
          </p>
        )}

        <button className="btn btn-primary btn-large" type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Product'}
        </button>
      </form>
      <AdminNav />
    </div>
  );
}
