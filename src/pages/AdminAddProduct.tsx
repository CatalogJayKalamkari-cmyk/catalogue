import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, PRODUCT_IMAGES_BUCKET } from '../lib/supabaseClient';
import { processImageToWebp } from '../lib/imageProcessing';
import { AdminNav } from '../components/AdminNav';
import { ImageUploader } from '../components/ImageUploader';
import { TypeSelect } from '../components/TypeSelect';
import type { AdminProduct } from '../types';

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState('');
  const [priceSelling, setPriceSelling] = useState('');
  const [priceAcquired, setPriceAcquired] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setName('');
    setTypeId('');
    setPriceSelling('');
    setPriceAcquired('');
    setQuantity('1');
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
    const sellingNum = Number(priceSelling);
    const acquiredNum = Number(priceAcquired);
    const quantityNum = Number(quantity);
    if (!Number.isFinite(sellingNum) || sellingNum < 0) {
      setError('Enter a valid selling price.');
      return;
    }
    if (!Number.isFinite(acquiredNum) || acquiredNum < 0) {
      setError('Enter a valid acquired price.');
      return;
    }
    if (!Number.isInteger(quantityNum) || quantityNum < 0) {
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
        })
        .single();

      if (createError || !rpcData) {
        throw new Error(createError?.message ?? 'Could not create product');
      }
      const product = rpcData as AdminProduct;

      for (let i = 0; i < images.length; i++) {
        const webp = await processImageToWebp(images[i]);
        const storagePath = `${product.product_code}/${i}.webp`;
        const { error: uploadError } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(storagePath, webp, { contentType: 'image/webp', upsert: true });
        if (uploadError) throw new Error(uploadError.message);

        const { error: imageRowError } = await supabase
          .from('product_images')
          .insert({ product_id: product.id, storage_path: storagePath, sort_order: i });
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
          Photos
          <ImageUploader files={images} onChange={setImages} max={3} />
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
          <input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
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
