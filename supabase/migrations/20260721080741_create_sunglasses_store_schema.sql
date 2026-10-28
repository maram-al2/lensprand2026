/*
# متجر النظارات الشمسية - إنشاء قاعدة البيانات

1. الجداول الجديدة
- `profiles`: ملفات المستخدمين (id, full_name, role, phone, created_at). role إما 'user' أو 'admin'.
- `products`: المنتجات (id, name, description, price, category, color, images, available, created_at).
- `orders`: الطلبات (id, customer_name, phone, email, notes, is_gift, gift_message, status, user_id, created_at).
- `order_items`: عناصر الطلب (id, order_id, product_id, product_name, product_price, quantity).

2. الأمان (RLS)
- profiles: المستخدم يقرأ/يعدل ملفه فقط. الأدمن يقرأ كل الملفات.
- products: القراءة عامة (anon + authenticated). الكتابة (insert/update/delete) للأدمن فقط.
- orders: المستخدم يقرأ/ينشئ طلباته فقط. الأدمن يقرأ/يعدل/يحذف كل الطلبات.
- order_items: يتبع نفس قواعد orders عبر علاقة order_id.

3. التخزين
- إنشاء bucket باسم 'products' للصور (عام للقراءة).

4. ملاحظات
- role في profiles يحدد الصلاحيات (admin/user).
- order_items يخزن بيانات المنتج وقت الطلب (product_name, product_price) للحفاظ على سجل الطلب.
- status في orders: 'new' (افتراضي)، 'contacting'، 'completed'، 'cancelled'.
*/

-- ==================== profiles ====================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  phone text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ==================== products ====================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  category text NOT NULL DEFAULT 'رجالي',
  color text NOT NULL DEFAULT 'أسود',
  images text[] NOT NULL DEFAULT '{}',
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- القراءة عامة (anon + authenticated)
DROP POLICY IF EXISTS "products_select_public" ON public.products;
CREATE POLICY "products_select_public"
ON public.products FOR SELECT
TO anon, authenticated
USING (true);

-- الكتابة للأدمن فقط
DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
CREATE POLICY "products_insert_admin"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "products_update_admin" ON public.products;
CREATE POLICY "products_update_admin"
ON public.products FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
CREATE POLICY "products_delete_admin"
ON public.products FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_color ON public.products(color);

-- ==================== orders ====================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text DEFAULT '',
  notes text DEFAULT '',
  is_gift boolean NOT NULL DEFAULT false,
  gift_message text DEFAULT '',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacting', 'completed', 'cancelled')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- المستخدم يقرأ طلباته فقط، الأدمن يقرأ الكل
DROP POLICY IF EXISTS "orders_select_own_or_admin" ON public.orders;
CREATE POLICY "orders_select_own_or_admin"
ON public.orders FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- المستخدم ينشئ طلباته، الأدمن أيضاً
DROP POLICY IF EXISTS "orders_insert_own_or_admin" ON public.orders;
CREATE POLICY "orders_insert_own_or_admin"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- الأدمن فقط يعدل
DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
CREATE POLICY "orders_update_admin"
ON public.orders FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- الأدمن فقط يحذف
DROP POLICY IF EXISTS "orders_delete_admin" ON public.orders;
CREATE POLICY "orders_delete_admin"
ON public.orders FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ==================== order_items ====================
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_price numeric(10, 2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- يتبع قواعد orders
DROP POLICY IF EXISTS "order_items_select_own_or_admin" ON public.order_items;
CREATE POLICY "order_items_select_own_or_admin"
ON public.order_items FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "order_items_insert_own_or_admin" ON public.order_items;
CREATE POLICY "order_items_insert_own_or_admin"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
);

DROP POLICY IF EXISTS "order_items_delete_admin" ON public.order_items;
CREATE POLICY "order_items_delete_admin"
ON public.order_items FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ==================== Storage Bucket ====================
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- سياسات التخزين: القراءة عامة، الرفع/الحذف للأدمن
DROP POLICY IF EXISTS "storage_products_read_public" ON storage.objects;
CREATE POLICY "storage_products_read_public"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "storage_products_insert_admin" ON storage.objects;
CREATE POLICY "storage_products_insert_admin"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products'
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "storage_products_update_admin" ON storage.objects;
CREATE POLICY "storage_products_update_admin"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products'
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
  bucket_id = 'products'
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "storage_products_delete_admin" ON storage.objects;
CREATE POLICY "storage_products_delete_admin"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'products'
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ==================== Trigger: إنشاء profile تلقائياً عند تسجيل مستخدم جديد ====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
