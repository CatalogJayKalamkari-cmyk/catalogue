import type { PublicProduct } from '../types';
import { productImageUrl } from '../lib/supabaseClient';
import { useLanguage } from '../lib/i18n';

interface Props {
  product: PublicProduct;
  imagePath: string | null;
  onClick?: () => void;
}

export function ProductCard({ product, imagePath, onClick }: Props) {
  const { t } = useLanguage();
  return (
    <div
      className={`product-card${product.in_stock ? '' : ' out-of-stock'}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick?.();
      }}
    >
      <div className="product-card-image">
        {imagePath ? (
          <img src={productImageUrl(imagePath)} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-image-placeholder">{t('catalog.noPhoto')}</div>
        )}
        {!product.in_stock && <span className="badge badge-out">{t('catalog.outOfStock')}</span>}
      </div>
      <div className="product-card-body">
        <span className="product-code">{product.product_code}</span>
        <span className="product-name">{product.name}</span>
        <div className="product-price-row">
          <span className="product-price">₹{product.price_selling.toLocaleString('en-IN')}</span>
          <span className="product-qty">
            {t('catalog.qty')}: {product.quantity}
          </span>
        </div>
      </div>
    </div>
  );
}
