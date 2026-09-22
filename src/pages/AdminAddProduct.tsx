import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, PRODUCT_IMAGES_BUCKET } from '../lib/supabaseClient';
import { processImageToWebp } from '../lib/imageProcessing';
import { AdminNav } from '../components/AdminNav';
import { ImageUploader, type ImageEntry } from '../components/ImageUploader';
import { TypeSelect } from '../components/TypeSelect';
import { useLanguage } from '../lib/i18n';
import type { AdminProduct, PrintType } from '../types';

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [printType, setPrintType] = useState<PrintType>('screen');
  const [typeId, setTypeId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [colorMode, setColorMode] = useState<'single' | 'multi-color'>('single');
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setPrintType('screen');
    setTypeId('');
    setQuantity('1');
    setColorMode('single');
    setImages([]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!typeId) {
      setError(t('addProduct.selectType'));
      return;
    }
    if (images.length === 0) {
      setError(t('addProduct.needPhoto'));
      return;
    }
    const isMultiColor = colorMode === 'multi-color';
    if (isMultiColor && images.some((img) => !img.color.trim())) {
      setError(t('addProduct.needColorName'));
      return;
    }
    if (isMultiColor && images.some((img) => !Number.isInteger(Number(img.quantity)) || Number(img.quantity) < 0)) {
      setError(t('addProduct.needColorQty'));
      return;
    }
    const quantityNum = isMultiColor
      ? images.reduce((sum, img) => sum + Number(img.quantity), 0)
      : Number(quantity);
    if (!isMultiColor && (!Number.isInteger(quantityNum) || quantityNum < 0)) {
      setError(t('addProduct.needQty'));
      return;
    }

    setSubmitting(true);
    try {
      const { data: rpcData, error: createError } = await supabase
        .rpc('create_product', {
          p_type_id: typeId,
          p_quantity: quantityNum,
          p_is_multi_color: isMultiColor,
          p_print_type: printType,
        })
        .single();

      if (createError || !rpcData) {
        throw new Error(createError?.message ?? t('addProduct.couldNotCreate'));
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

      setSuccess(t('addProduct.saved', { code: product.product_code }));
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('addProduct.somethingWrong'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page admin-page">
      <h1>{t('addProduct.title')}</h1>
      <form className="product-form" onSubmit={handleSubmit}>
        <label>
          {t('addProduct.colorMode')}
          <select value={colorMode} onChange={(e) => setColorMode(e.target.value as 'single' | 'multi-color')}>
            <option value="single">{t('addProduct.single')}</option>
            <option value="multi-color">{t('addProduct.multiColor')}</option>
          </select>
        </label>

        <label>
          {t('addProduct.photos')}
          <ImageUploader
            entries={images}
            onChange={setImages}
            max={10}
            showColorInput={colorMode === 'multi-color'}
          />
        </label>

        <label>
          {t('addProduct.printType')}
          <div className="row-inline">
            <button
              type="button"
              className={printType === 'screen' ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => setPrintType('screen')}
            >
              {t('addProduct.screenPrinted')}
            </button>
            <button
              type="button"
              className={printType === 'block' ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => setPrintType('block')}
            >
              {t('addProduct.blockPrinted')}
            </button>
          </div>
        </label>

        <label>
          {t('addProduct.type')}
          <TypeSelect value={typeId} onChange={setTypeId} />
        </label>

        <label>
          {t('addProduct.quantity')}
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
          {colorMode === 'multi-color' && <span className="hint-text">{t('addProduct.sumHint')}</span>}
        </label>

        {error && <p className="error-text">{error}</p>}
        {success && (
          <p className="success-text">
            {success}{' '}
            <button type="button" className="link-btn" onClick={() => navigate('/admin/products')}>
              {t('addProduct.viewProducts')}
            </button>
          </p>
        )}

        <button className="btn btn-primary btn-large" type="submit" disabled={submitting}>
          {submitting ? t('addProduct.saving') : t('addProduct.save')}
        </button>
      </form>
      <AdminNav />
    </div>
  );
}
