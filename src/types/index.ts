export interface ProductCategory {
  id: string;
  name: string;
  sort_order: number;
}

export interface ProductType {
  id: string;
  name: string;
  prefix: string;
  category_id: string | null;
}

export type PrintType = 'screen' | 'block';

export interface PublicProduct {
  id: string;
  product_code: string;
  name: string;
  type_id: string;
  quantity: number;
  is_multi_color: boolean;
  print_type: PrintType | null;
  in_stock: boolean;
  created_at: string;
}

export interface AdminProduct {
  id: string;
  type_id: string;
  product_code: string;
  name: string;
  quantity: number;
  is_active: boolean;
  is_multi_color: boolean;
  print_type: PrintType | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  sort_order: number;
  quantity: number;
  initial_quantity: number;
  color_label: string | null;
}
