import { useState } from 'react';
import { supabase, productImageUrl } from '../lib/supabaseClient';
import type { AdminProduct } from '../types';

interface Props {
  product: AdminProduct;
  imagePath: string | null;
  onChanged: () => void;
}

export function AdminProductRow({ product, imagePath, onChanged }: Props) {
  const [mode, setMode] = useState<'view' | 'edit' | 'sell'>('view');
  const [name, setName] = useState(product.name);
  const [priceSelling, setPriceSelling] = useState(String(product.price_selling));
  const [priceAcquired, setPriceAcquired] = useState(String(product.price_acquired));
  const [sellQty, setSellQty] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveEdit() {
    setError(null);
    const sellingNum = Number(priceSelling);
    const acquiredNum = Number(priceAcquired);
    if (!name.trim() || !Number.isFinite(sellingNum) || sellingNum < 0 || !Number.isFinite(acquiredNum) || acquiredNum < 0) {
      setError('Check the values entered.');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('products')
      .update({ name: name.trim(), price_selling: sellingNum, price_acquired: acquiredNum })
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
      setError('Enter a valid quantity.');
      return;
    }
    if (qty > product.quantity) {
      setError(`Only ${product.quantity} in stock.`);
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc('record_sale', {
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
          <div className="product-card-image-placeholder">No photo</div>
        )}
      </div>

      <div className="admin-product-row-body">
        <span className="product-code">{product.product_code}</span>

        {mode === 'edit' ? (
          <>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <div className="row-inline">
              <input
                type="number"
                min="0"
                step="0.01"
                value={priceSelling}
                onChange={(e) => setPriceSelling(e.target.value)}
                placeholder="Selling"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={priceAcquired}
                onChange={(e) => setPriceAcquired(e.target.value)}
                placeholder="Acquired"
              />
            </div>
          </>
        ) : (
          <>
            <span className="product-name">{product.name}</span>
            <span className="hint-text">
              Sell ₹{product.price_selling.toLocaleString('en-IN')} · Cost ₹
              {product.price_acquired.toLocaleString('en-IN')}
            </span>
          </>
        )}

        <span className="hint-text">
          Qty: {product.quantity} {!product.is_active && '· Archived'}
        </span>

        {mode === 'sell' && (
          <div className="row-inline">
            <input
              type="number"
              min="1"
              max={product.quantity}
              value={sellQty}
              onChange={(e) => setSellQty(e.target.value)}
            />
            <button className="btn btn-primary" disabled={saving} onClick={confirmSale}>
              Confirm Sale
            </button>
            <button className="btn btn-secondary" onClick={() => setMode('view')}>
              Cancel
            </button>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        {mode === 'view' && (
          <div className="row-actions">
            <button className="btn btn-secondary" onClick={() => setMode('edit')}>
              Edit
            </button>
            <button
              className="btn btn-primary"
              disabled={product.quantity === 0}
              onClick={() => setMode('sell')}
            >
              Record Sale
            </button>
            <button className="btn btn-secondary" disabled={saving} onClick={toggleArchive}>
              {product.is_active ? 'Archive' : 'Unarchive'}
            </button>
          </div>
        )}

        {mode === 'edit' && (
          <div className="row-actions">
            <button className="btn btn-primary" disabled={saving} onClick={saveEdit}>
              Save
            </button>
            <button className="btn btn-secondary" onClick={() => setMode('view')}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
