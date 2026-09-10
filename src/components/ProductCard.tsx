import type { PublicProduct } from '../types';
import { productImageUrl } from '../lib/supabaseClient';

interface Props {
  product: PublicProduct;
  imagePath: string | null;
}

export function ProductCard({ product, imagePath }: Props) {
  return (
    <div className={`product-card${product.in_stock ? '' : ' out-of-stock'}`}>
      <div className="product-card-image">
        {imagePath ? (
          <img src={productImageUrl(imagePath)} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-image-placeholder">No photo</div>
        )}
        {!product.in_stock && <span className="badge badge-out">Out of Stock</span>}
      </div>
      <div className="product-card-body">
        <span className="product-code">{product.product_code}</span>
        <span className="product-name">{product.name}</span>
        <span className="product-price">₹{product.price_selling.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}
