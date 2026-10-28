export type ProductCategory =
  | 'رجالي'
  | 'نسائي'
  | 'لابال';

export type ProductColor =
  | 'بني'
  | 'بني غامق'
  | 'بيج'
  | 'أسود'
  | 'ذهبي'
  | 'فضي';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: ProductCategory;
  color: ProductColor;
  images: string[];
  available: boolean;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  paid: 'تم الدفع',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
  refunded: 'مسترجع',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending:
    'border-yellow-200 bg-yellow-100 text-yellow-800',
  paid:
    'border-blue-200 bg-blue-100 text-blue-800',
  shipped:
    'border-purple-200 bg-purple-100 text-purple-800',
  delivered:
    'border-green-200 bg-green-100 text-green-800',
  cancelled:
    'border-red-200 bg-red-100 text-red-800',
  refunded:
    'border-gray-200 bg-gray-100 text-gray-800',
};

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;

  product_name: string;
  product_price: number;

  quantity: number;

  image_url?: string | null;
  color?: string | null;
}

export interface Order {
  id: string;

  order_number: string;

  user_id: string | null;
  status: OrderStatus;

  subtotal: number;
  discount: number;
  shipping: number;
  total: number;

  coupon_code: string | null;

  shipping_name: string;
  shipping_email: string | null;
  shipping_phone: string;

  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string | null;

  tracking_number: string | null;

  notes: string | null;

  is_gift: boolean;
  gift_message: string | null;

  created_at: string;

  order_items?: OrderItem[];
}

export type UserRole =
  | 'admin'
  | 'user';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  created_at: string;
}