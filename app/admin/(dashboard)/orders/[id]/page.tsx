'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { OrderItem } from '@/lib/types';
import {
  ArrowRight,
  Trash2,
  Phone,
  Mail,
  Gift,
  MessageSquare,
  ShoppingBag,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/lib/types';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { formatPrice, formatDate } from '@/lib/format';
import { toast } from 'sonner';

const STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const id = params.id as string;

  const {
    data: order,
    isLoading,
    error: orderQueryError,
  } = useQuery({
    queryKey: ['admin-order', id],

    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as Order | null;
    },

    enabled: Boolean(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: OrderStatus) => {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-order', id],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-orders'],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-recent-orders'],
      });

      toast.success('تم تحديث حالة الطلب');
    },

    onError: (error: Error) => {
      toast.error(`حدث خطأ: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      if (itemsError) {
        throw itemsError;
      }

      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (orderError) {
        throw orderError;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-orders'],
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-recent-orders'],
      });

      toast.success('تم حذف الطلب');

      router.push('/admin/orders');
    },

    onError: (error: Error) => {
      toast.error(`حدث خطأ: ${error.message}`);
    },
  });

  const handleDelete = () => {
    const confirmed = window.confirm(
      'هل أنت متأكد من حذف هذا الطلب؟'
    );

    if (confirmed) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <Skeleton className="h-8 w-48" />

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl md:col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (orderQueryError) {
    return (
      <div className="p-4 text-center md:p-8">
        <p className="text-lg font-medium text-destructive">
          حدث خطأ أثناء تحميل الطلب
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          {(orderQueryError as Error).message}
        </p>

        <Link href="/admin/orders">
          <Button
            variant="outline"
            className="mt-4 gap-2 rounded-full"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للطلبات
          </Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 text-center md:p-8">
        <p className="text-lg font-medium text-foreground">
          الطلب غير موجود
        </p>

        <Link href="/admin/orders">
          <Button
            variant="outline"
            className="mt-4 gap-2 rounded-full"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للطلبات
          </Button>
        </Link>
      </div>
    );
  }

const total =
  order.order_items?.reduce(
    (sum: number, item: OrderItem) =>
      sum +
      Number(item.product_price ?? 0) *
      Number(item.quantity ?? 0),
    0
  ) ?? 0;
  const statusLabel =
    ORDER_STATUS_LABELS[
      order.status as OrderStatus
    ] ?? order.status;

  const statusColor =
    ORDER_STATUS_COLORS[
      order.status as OrderStatus
    ] ?? '';

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-primary">
              تفاصيل الطلب
            </h1>

            <p className="mt-0.5 text-xs text-muted-foreground">
              رقم الطلب:{' '}
              <span dir="ltr">
                {order.order_number || 'غير متوفر'}
              </span>
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={statusColor}>
            {statusLabel}
          </Badge>

          <Button
            variant="outline"
            size="icon"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="rounded-full border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer and Status */}
        <div className="space-y-6 lg:col-span-1">
          {/* Customer Info */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-luxury">
            <h2 className="mb-4 text-lg font-bold text-primary">
              بيانات العميل
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  الاسم
                </p>

                <p className="mt-1 text-sm font-semibold text-foreground">
                  {order.shipping_name || 'غير متوفر'}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  رقم الهاتف
                </p>

                {order.shipping_phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />

                    <a
                      href={`tel:${order.shipping_phone}`}
                      className="text-sm text-foreground hover:text-primary"
                      dir="ltr"
                    >
                      {order.shipping_phone}
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    غير متوفر
                  </p>
                )}
              </div>

              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  البريد الإلكتروني
                </p>

                {order.shipping_email ? (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />

                    <a
                      href={`mailto:${order.shipping_email}`}
                      className="break-all text-sm text-foreground hover:text-primary"
                      dir="ltr"
                    >
                      {order.shipping_email}
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    غير متوفر
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Gift Info */}
          {order.is_gift && (
            <div className="rounded-2xl border border-accent/40 bg-accent/10 p-6 shadow-luxury">
              <div className="mb-3 flex items-center gap-2">
                <Gift className="h-5 w-5 text-secondary" />

                <h2 className="text-lg font-bold text-primary">
                  طلب هدية
                </h2>
              </div>

              {order.gift_message ? (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    رسالة الإهداء
                  </p>

                  <p className="rounded-xl bg-card p-3 text-sm italic text-foreground">
                    {order.gift_message}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  لا توجد رسالة إهداء
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-luxury">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />

              <h2 className="text-lg font-bold text-primary">
                ملاحظات
              </h2>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {order.notes || 'لا توجد ملاحظات'}
            </p>
          </div>

          {/* Status Control */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-luxury">
            <h2 className="mb-4 text-lg font-bold text-primary">
              حالة الطلب
            </h2>

            <Select
              value={order.status}
              onValueChange={(value) =>
                updateStatusMutation.mutate(
                  value as OrderStatus
                )
              }
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="rounded-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                  >
                    {ORDER_STATUS_LABELS[status] ??
                      status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-luxury">
            <div className="mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-secondary" />

              <h2 className="text-lg font-bold text-primary">
                المنتجات المطلوبة
              </h2>
            </div>

            {order.order_items &&
            order.order_items.length > 0 ? (
              <div className="space-y-3">
                {order.order_items.map((item: OrderItem) => {
                  const price = Number(
                    item.product_price ?? 0
                  );

                  const quantity = Number(
                    item.quantity ?? 0
                  );

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={
                              item.product_name ||
                              'صورة المنتج'
                            }
                            className="h-16 w-16 rounded-xl border border-border object-cover"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          {item.product_id ? (
                            <Link
                              href={`/products/${item.product_id}`}
                              className="text-sm font-semibold text-foreground hover:text-primary"
                            >
                              {item.product_name ||
                                'منتج بدون اسم'}
                            </Link>
                          ) : (
                            <span className="text-sm font-semibold text-foreground">
                              {item.product_name ||
                                'منتج بدون اسم'}
                            </span>
                          )}

                          <p className="mt-1 text-xs text-muted-foreground">
                            الكمية: {quantity} ×{' '}
                            {formatPrice(price)} ر.ع
                          </p>

                          {item.color && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              اللون: {item.color}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="whitespace-nowrap text-sm font-bold text-primary">
                        {formatPrice(
                          price * quantity
                        )}{' '}
                        ر.ع
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  لا توجد منتجات مرتبطة بهذا الطلب
                </p>
              </div>
            )}

            <div className="mt-4 border-t border-border pt-4">
              <div className="flex justify-between text-base">
                <span className="font-bold text-foreground">
                  المجموع الكلي
                </span>

                <span className="font-bold text-primary">
                  {formatPrice(total)} ر.ع
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}