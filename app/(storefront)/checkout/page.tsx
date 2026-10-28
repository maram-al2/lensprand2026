'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  Gift,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  customer_name: z
    .string()
    .min(3, 'الاسم الكامل مطلوب (3 أحرف على الأقل)'),

  phone: z
    .string()
    .min(8, 'رقم هاتف صحيح مطلوب'),

  email: z
    .string()
    .email('بريد إلكتروني غير صحيح')
    .optional()
    .or(z.literal('')),

  notes: z
    .string()
    .optional()
    .or(z.literal('')),

  is_gift: z
    .boolean()
    .default(false),

  gift_message: z
    .string()
    .optional()
    .or(z.literal('')),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const {
    items,
    totalPrice,
    totalItems,
    clearCart,
  } = useCart();

  const { user } = useAuth();

  const [success, setSuccess] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),

    defaultValues: {
      customer_name: '',
      phone: '',
      email: '',
      notes: '',
      is_gift: false,
      gift_message: '',
    },
  });

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  const isGift = watch('is_gift');

  const mutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      if (items.length === 0) {
        throw new Error('سلة التسوق فارغة');
      }

      const orderNumber = `ORD-${Date.now()}`;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,

          user_id: user?.id ?? null,
          status: 'pending',

          subtotal: totalPrice,
          discount: 0,
          shipping: 0,
          total: totalPrice,

          coupon_code: null,

          shipping_name: data.customer_name,
          shipping_phone: data.phone,
          shipping_email: data.email || null,

          shipping_address: null,
          shipping_city: null,
          shipping_state: null,
          shipping_zip: null,
          shipping_country: 'Oman',

          tracking_number: null,

          notes: data.notes || null,

          is_gift: data.is_gift,

          gift_message: data.is_gift
            ? data.gift_message || null
            : null,
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      if (!orderData?.id) {
        throw new Error('لم يتم إنشاء الطلب بشكل صحيح');
      }

      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        /*
         * في حال فشل حفظ المنتجات بعد إنشاء الطلب،
         * نحذف الطلب حتى لا يبقى طلب فارغ في قاعدة البيانات.
         */
        await supabase
          .from('orders')
          .delete()
          .eq('id', orderData.id);

        throw itemsError;
      }

      return {
        ...orderData,
        order_number: orderNumber,
      };
    },

    onSuccess: (orderData) => {
      setCreatedOrderNumber(orderData.order_number);
      clearCart();
      setSuccess(true);

      toast.success('تم إرسال طلبك بنجاح!');
    },

    onError: (error: Error) => {
      console.error('Checkout error:', error);

      toast.error(
        `حدث خطأ أثناء إرسال الطلب: ${error.message}`
      );
    },
  });

  const onSubmit = (data: CheckoutForm) => {
    mutation.mutate(data);
  };

  if (success) {
    return (
      <div className="container-luxury flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-14 w-14 text-green-600" />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-primary">
          تم إرسال طلبك بنجاح!
        </h1>

        {createdOrderNumber && (
          <div className="mt-4 rounded-xl border border-border bg-card px-5 py-3">
            <p className="text-xs text-muted-foreground">
              رقم الطلب
            </p>

            <p
              className="mt-1 font-bold text-primary"
              dir="ltr"
            >
              {createdOrderNumber}
            </p>
          </div>
        )}

        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          شكراً لثقتك بنا. سيتواصل معك فريقنا قريباً
          لتأكيد طلبك وتفاصيل التوصيل.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/products">
            <Button className="gap-2 rounded-full px-8 shadow-luxury">
              متابعة التسوق
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          {user && (
            <Link href="/account">
              <Button
                variant="outline"
                className="rounded-full border-primary/20 px-8"
              >
                عرض طلباتي
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-luxury flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold text-primary">
          سلة التسوق فارغة
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          أضف منتجات إلى السلة قبل إتمام الطلب
        </p>

        <Link href="/products">
          <Button className="mt-6 gap-2 rounded-full px-8">
            تصفح المنتجات
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxury py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold text-primary md:text-4xl">
        إتمام الطلب
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-8 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-luxury">
            <h2 className="mb-4 text-lg font-bold text-primary">
              بيانات العميل
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  الاسم الكامل
                  <span className="text-destructive">
                    {' '}*
                  </span>
                </label>

                <Input
                  {...register('customer_name')}
                  placeholder="أدخل اسمك الكامل"
                  className="rounded-xl"
                />

                {errors.customer_name && (
                  <p className="text-xs text-destructive">
                    {errors.customer_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  رقم الهاتف
                  <span className="text-destructive">
                    {' '}*
                  </span>
                </label>

                <Input
                  {...register('phone')}
                  placeholder="9xxxxxxx"
                  className="rounded-xl"
                  dir="ltr"
                />

                {errors.phone && (
                  <p className="text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  البريد الإلكتروني (اختياري)
                </label>

                <Input
                  {...register('email')}
                  type="email"
                  placeholder="example@email.com"
                  className="rounded-xl"
                  dir="ltr"
                />

                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  ملاحظات (اختياري)
                </label>

                <Textarea
                  {...register('notes')}
                  placeholder="أي ملاحظات إضافية حول طلبك..."
                  className="rounded-xl"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-luxury">
            <div className="flex items-center gap-3">
              <Checkbox
                id="is_gift"
                checked={isGift}
                onCheckedChange={(checked) => {
                  const value = checked === true;

                  setValue('is_gift', value, {
                    shouldValidate: true,
                  });

                  if (!value) {
                    setValue('gift_message', '');
                  }
                }}
              />

              <label
                htmlFor="is_gift"
                className="flex cursor-pointer items-center gap-2 text-sm font-medium"
              >
                <Gift className="h-4 w-4 text-secondary" />
                هل الطلب هدية؟
              </label>
            </div>

            {isGift && (
              <div className="mt-4 space-y-2 animate-fade-in">
                <label className="text-sm font-medium text-foreground">
                  رسالة الإهداء
                </label>

                <Textarea
                  {...register('gift_message')}
                  placeholder="اكتب رسالة الإهداء هنا..."
                  className="rounded-xl"
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-luxury">
            <h2 className="mb-4 text-lg font-bold text-primary">
              ملخص الطلب
            </h2>

            <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between gap-2 text-sm"
                >
                  <span className="text-muted-foreground">
                    {item.product.name} × {item.quantity}
                  </span>

                  <span className="whitespace-nowrap font-semibold text-foreground">
                    {formatPrice(
                      item.product.price * item.quantity
                    )}{' '}
                    ر.ع
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  عدد المنتجات
                </span>

                <span className="font-semibold">
                  {totalItems}
                </span>
              </div>

              <div className="flex justify-between text-base">
                <span className="font-bold text-foreground">
                  المجموع
                </span>

                <span className="font-bold text-primary">
                  {formatPrice(totalPrice)} ر.ع
                </span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-6 w-full gap-2 rounded-full shadow-luxury hover:shadow-luxury-lg"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                'إرسال الطلب'
              )}
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              لا يوجد دفع إلكتروني — سيتم التواصل معك
              لتأكيد الطلب
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}