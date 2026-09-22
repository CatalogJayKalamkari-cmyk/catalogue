import { useState } from 'react';
import { supabase, productImageUrl, PRODUCT_IMAGES_BUCKET } from '../lib/supabaseClient';
import type { AdminProduct } from '../types';
import { AdminProductPhotos } from './AdminProductPhotos';
import { useLanguage } from '../lib/i18n';
import type { PrintType } from '../types';

interface Props {
  product: AdminProduct;
  imagePath: string | null;
  onChanged: () => void;
}

export function AdminProductRow({ product, imagePath, onChanged }: Props) {
  const { t, tt } = useLanguage();
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [printType, setPrintType] = useState<PrintType>(product.print_type ?? 'screen');
  const [quantity, setQuantity] = useState(String(product.quantity));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function saveEdit() {
    setError(null);
    const update: { print_type: PrintType; quantity?: number } = {
      print_type: printType,
    };
    if (!product.is_multi_color) {
      const quantityNum = Number(quantity);
      if (!Number.isInteger(quantityNum) || quantityNum < 0) {
        setError(t('row.invalidQty'));
        return;
      }
      update.quantity = quantityNum;
    }
    setSaving(true);
    const { error } = await supabase.from('products').update(update).eq('id', product.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMode('view');
    onChanged();
  }

  async function deleteProduct() {
    setSaving(true);
    // Grab the photo paths before the DB row (and its product_images rows,
    // via cascade) disappear - deleting the product never touches Storage
    // on its own, so without this the actual photo files would leak
    // forever even though nothing references them any more.
    const { data: images } = await supabase
      .from('product_images')
      .select('storage_path')
      .eq('product_id', product.id);

    const { error } = await supabase.rpc('delete_product', { p_product_id: product.id });
    setSaving(false);
    if (error) {
      setError(error.message);
      setConfirmingDelete(false);
      return;
    }

    // Only remove files nothing else still references - bulk test-data
    // products intentionally share the same placeholder image across many
    // rows, so blindly deleting every path here would break the siblings.
    const paths = [...new Set((images ?? []).map((img) => img.storage_path))];
    if (paths.length > 0) {
      const { data: stillReferenced } = await supabase
        .from('product_images')
        .select('storage_path')
        .in('storage_path', paths);
      const stillUsed = new Set((stillReferenced ?? []).map((img) => img.storage_path));
      const orphaned = paths.filter((p) => !stillUsed.has(p));
      if (orphaned.length > 0) {
        await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(orphaned);
      }
    }
    onChanged();
  }

  async function toggleArchive() {
    setSaving(true);
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    onChanged();
  }

  return (
    <div className={`admin-product-row${product.is_active ? '' : ' archived'}`}>
      <div className="admin-product-row-image">
        {imagePath ? (
          <img src={productImageUrl(imagePath)} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-image-placeholder">{t('row.noPhoto')}</div>
        )}
      </div>

      <div className="admin-product-row-body">
        <span className="product-code">{product.product_code}</span>

        {mode === 'edit' ? (
          <>
            <span className="product-name">{tt(product.name)}</span>
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
            {!product.is_multi_color && (
              <div className="field-group">
                <span className="field-label">{t('addProduct.quantity')}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            )}
            {product.is_multi_color && <p className="hint-text">{t('row.perColorHint')}</p>}
            <AdminProductPhotos
              productId={product.id}
              productCode={product.product_code}
              isMultiColor={product.is_multi_color}
            />
          </>
        ) : (
          <>
            <span className="product-name">{tt(product.name)}</span>
            {product.print_type && (
              <span className="hint-text">
                {product.print_type === 'screen' ? t('addProduct.screenPrinted') : t('addProduct.blockPrinted')}
              </span>
            )}
          </>
        )}

        <span className="hint-text">
          {t('row.qty')}: {product.quantity} {!product.is_active && `· ${t('row.archived')}`}
        </span>

        {error && <p className="error-text">{error}</p>}

        {mode === 'view' && !confirmingDelete && (
          <div className="row-actions">
            <button className="btn btn-secondary" onClick={() => setMode('edit')}>
              {t('row.edit')}
            </button>
            <button className="btn btn-secondary" disabled={saving} onClick={toggleArchive}>
              {product.is_active ? t('row.archive') : t('row.unarchive')}
            </button>
            <button className="btn btn-danger" disabled={saving} onClick={() => setConfirmingDelete(true)}>
              {t('row.delete')}
            </button>
          </div>
        )}

        {confirmingDelete && (
          <div className="row-actions">
            <span className="hint-text">{t('row.deleteConfirm')}</span>
            <button className="btn btn-danger" disabled={saving} onClick={deleteProduct}>
              {t('row.delete')}
            </button>
            <button className="btn btn-secondary" onClick={() => setConfirmingDelete(false)}>
              {t('row.cancel')}
            </button>
          </div>
        )}

        {mode === 'edit' && (
          <div className="row-actions">
            <button className="btn btn-primary" disabled={saving} onClick={saveEdit}>
              {t('row.save')}
            </button>
            <button className="btn btn-secondary" onClick={() => setMode('view')}>
              {t('row.cancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
