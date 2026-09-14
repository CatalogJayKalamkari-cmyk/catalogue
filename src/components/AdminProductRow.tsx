import { useState } from 'react';
import { supabase, productImageUrl } from '../lib/supabaseClient';
import type { AdminProduct } from '../types';
import { AdminProductPhotos } from './AdminProductPhotos';
import { useLanguage } from '../lib/i18n';
import { computeSaleTotal, isBelowCost, parseSalePrice } from '../lib/sale';
import type { PrintType } from '../types';

interface Props {
  product: AdminProduct;
  imagePath: string | null;
  onChanged: () => void;
}

export function AdminProductRow({ product, imagePath, onChanged }: Props) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'view' | 'edit' | 'sell' | 'restock' | 'colors-sale' | 'colors-acquire'>(
    'view'
  );
  const [name, setName] = useState(product.name);
  const [printType, setPrintType] = useState<PrintType>(product.print_type ?? 'screen');
  const [priceSelling, setPriceSelling] = useState(String(product.price_selling));
  const [priceAcquired, setPriceAcquired] = useState(String(product.price_acquired));
  const [sellQty, setSellQty] = useState('1');
  const [sellPrice, setSellPrice] = useState(String(product.price_selling));
  const [restockQty, setRestockQty] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sellQtyNum = Number(sellQty);
  const sellPriceNum = Number(sellPrice);
  const saleTotal = computeSaleTotal(sellQtyNum, sellPriceNum);
  const saleBelowCost = isBelowCost(sellPriceNum, product.price_acquired);

  async function saveEdit() {
    setError(null);
    const sellingNum = Number(priceSelling);
    const acquiredNum = Number(priceAcquired);
    if (!name.trim() || !Number.isFinite(sellingNum) || sellingNum < 0 || !Number.isFinite(acquiredNum) || acquiredNum < 0) {
      setError(t('row.checkValues'));
      return;
    }
    if (sellingNum < acquiredNum) {
      setError(t('row.priceError'));
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('products')
      .update({ name: name.trim(), price_selling: sellingNum, price_acquired: acquiredNum, print_type: printType })
      .eq('id', product.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMode('view');
    onChanged();
  }

  async function confirmSale() {
    setError(null);
    const qty = Number(sellQty);
    if (!Number.isInteger(qty) || qty <= 0) {
      setError(t('row.invalidQty'));
      return;
    }
    if (qty > product.quantity) {
      setError(t('row.onlyInStock', { n: product.quantity }));
      return;
    }
    const price = parseSalePrice(sellPrice);
    if (price === null) {
      setError(t('sale.invalidPrice'));
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc('record_sale', {
      p_product_id: product.id,
      p_quantity: qty,
      p_price_selling: price,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMode('view');
    onChanged();
  }

  async function confirmRestock() {
    setError(null);
    const qty = Number(restockQty);
    if (!Number.isInteger(qty) || qty <= 0) {
      setError(t('row.invalidQty'));
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc('restock_product', {
      p_product_id: product.id,
      p_quantity: qty,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMode('view');
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
            <input value={name} onChange={(e) => setName(e.target.value)} />
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
            <div className="row-inline">
              <div className="field-group">
                <span className="field-label">{t('addProduct.sellingPrice')}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceSelling}
                  onChange={(e) => setPriceSelling(e.target.value)}
                  placeholder={t('row.pricePlaceholderSelling')}
                />
              </div>
              <div className="field-group">
                <span className="field-label">{t('addProduct.acquiredPrice')}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceAcquired}
                  onChange={(e) => setPriceAcquired(e.target.value)}
                  placeholder={t('row.pricePlaceholderAcquired')}
                />
              </div>
            </div>
            <AdminProductPhotos
              productId={product.id}
              productCode={product.product_code}
              isMultiColor={product.is_multi_color}
              priceSelling={product.price_selling}
              priceAcquired={product.price_acquired}
              view="edit"
            />
          </>
        ) : (
          <>
            <span className="product-name">{product.name}</span>
            {product.print_type && (
              <span className="hint-text">
                {product.print_type === 'screen' ? t('addProduct.screenPrinted') : t('addProduct.blockPrinted')}
              </span>
            )}
            <span className="hint-text">
              {t('row.sellLabel')} ₹{product.price_selling.toLocaleString('en-IN')} · {t('row.costLabel')} ₹
              {product.price_acquired.toLocaleString('en-IN')}
            </span>
          </>
        )}

        <span className="hint-text">
          {t('row.qty')}: {product.quantity} {!product.is_active && `· ${t('row.archived')}`}
        </span>

        {mode === 'sell' && (
          <>
            <div className="row-inline">
              <div className="field-group">
                <span className="field-label">{t('row.qty')}</span>
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={sellQty}
                  onChange={(e) => setSellQty(e.target.value)}
                />
              </div>
              <div className="field-group">
                <span className="field-label">{t('sale.priceLabel')}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                />
              </div>
            </div>
            {saleBelowCost && (
              <p className="error-text">
                {t('sale.belowCost', { acquired: product.price_acquired.toLocaleString('en-IN') })}
              </p>
            )}
            <p className="hint-text">{t('sale.total', { amount: `₹${saleTotal.toLocaleString('en-IN')}` })}</p>
            <div className="row-inline">
              <button className="btn btn-primary" disabled={saving} onClick={confirmSale}>
                {t('row.confirmSale')}
              </button>
              <button className="btn btn-secondary" onClick={() => setMode('view')}>
                {t('row.cancel')}
              </button>
            </div>
          </>
        )}

        {mode === 'restock' && (
          <div className="row-inline">
            <input
              type="number"
              min="1"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
            />
            <button className="btn btn-primary" disabled={saving} onClick={confirmRestock}>
              {t('row.confirmAcquired')}
            </button>
            <button className="btn btn-secondary" onClick={() => setMode('view')}>
              {t('row.cancel')}
            </button>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        {(mode === 'colors-sale' || mode === 'colors-acquire') && (
          <AdminProductPhotos
            productId={product.id}
            productCode={product.product_code}
            isMultiColor={product.is_multi_color}
            priceSelling={product.price_selling}
            priceAcquired={product.price_acquired}
            view={mode === 'colors-sale' ? 'sale' : 'acquire'}
          />
        )}

        {mode === 'view' && product.is_multi_color && (
          <p className="hint-text">{t('row.perColorHint')}</p>
        )}

        {mode === 'view' && (
          <div className="row-actions">
            <button className="btn btn-secondary" onClick={() => setMode('edit')}>
              {t('row.edit')}
            </button>
            {product.is_multi_color ? (
              <>
                <button className="btn btn-primary" onClick={() => setMode('colors-sale')}>
                  {t('row.sale')}
                </button>
                <button className="btn btn-secondary" onClick={() => setMode('colors-acquire')}>
                  {t('row.acquired')}
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-primary"
                  disabled={product.quantity === 0}
                  onClick={() => {
                    setSellPrice(String(product.price_selling));
                    setMode('sell');
                  }}
                >
                  {t('row.sale')}
                </button>
                <button className="btn btn-secondary" onClick={() => setMode('restock')}>
                  {t('row.acquired')}
                </button>
              </>
            )}
            <button className="btn btn-secondary" disabled={saving} onClick={toggleArchive}>
              {product.is_active ? t('row.archive') : t('row.unarchive')}
            </button>
          </div>
        )}

        {(mode === 'colors-sale' || mode === 'colors-acquire') && (
          <div className="row-actions">
            <button className="btn btn-secondary" onClick={() => setMode('view')}>
              {t('row.done')}
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
