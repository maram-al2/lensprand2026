'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Eye,
  Filter,
  ShoppingBag,
  Trash2,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';

import type {
  Order,
  OrderItem,
  OrderStatus,
} from '@/lib/types';

import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from '@/lib/types';

import { formatDate, formatPrice } from '@/lib/format';

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

import { toast } from 'sonner';

const STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] =
    useState<'all' | OrderStatus>('all');

  const {
    data: orders = [],
    isLoading,
    error: ordersError,
  } = useQuery<Order[]>({
    queryKey: ['admin-orders', statusFilter],

    queryFn: async (): Promise<Order[]> => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', {
          ascending: false,
        });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data ?? []) as Order[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: OrderStatus;
    }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin-orders'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['admin-recent-orders'],
      });

      toast.success('تم تحديث حالة الطلب');
    },

    onError: (error: Error) => {
      toast.error(`حدث خطأ: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      /*
       * نحذف عناصر الطلب أولًا لتجنب مشكلة
       * الـ Foreign Key إذا لم يكن ON DELETE CASCADE مفعّلًا.
       */
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

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin-orders'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['admin-recent-orders'],
      });

      toast.success('تم حذف الطلب');
    },

    onError: (error: Error) => {
      toast.error(`حدث خطأ: ${error.message}`);
    },
  });

  const handleDelete = (order: Order) => {
    const customerName =
      order.shipping_name || 'بدون اسم';

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف طلب "${customerName}"؟`
    );

    if (confirmed) {
      deleteMutation.mutate(order.id);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary md:text-3xl">
            إدارة الطلبات
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length} طلب
          </p>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(
                value as 'all' | OrderStatus
              )
            }
          >
            <SelectTrigger className="w-44 rounded-full">
              <SelectValue placeholder="اختر حالة الطلب" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                جميع الطلبات
              </SelectItem>

              {STATUSES.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                >
                  {ORDER_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Query error */}
      {ordersError && (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center">
          <p className="text-sm font-medium text-destructive">
            حدث خطأ أثناء تحميل الطلبات
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {ordersError instanceof Error
              ? ordersError.message
              : 'حاولي إعادة تحميل الصفحة'}
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <Skeleton
                key={index}
                className="h-24 rounded-xl"
              />
            )
          )}
        </div>
      ) : orders.length > 0 ? (
        /* Orders list */
        <div className="space-y-3">
          {orders.map((order: Order) => {
            const total =
              order.order_items?.reduce(
                (
                  sum: number,
                  item: OrderItem
                ) => {
                  const price = Number(
                    item.product_price ?? 0
                  );

                  const quantity = Number(
                    item.quantity ?? 0
                  );

                  return sum + price * quantity;
                },
                0
              ) ?? Number(order.total ?? 0);

            const status =
              order.status as OrderStatus;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-luxury transition-colors hover:bg-accent/5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Customer info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-bold text-foreground">
                        {order.shipping_name ||
                          'عميل بدون اسم'}
                      </h2>

                      <Badge
                        className={
                          ORDER_STATUS_COLORS[
                            status
                          ] ?? ''
                        }
                      >
                        {ORDER_STATUS_LABELS[
                          status
                        ] ?? status}
                      </Badge>

                      {order.is_gift && (
                        <Badge
                          variant="outline"
                          className="gap-1"
                        >
                          هدية
                        </Badge>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span dir="ltr">
                        {order.shipping_phone ||
                          'لا يوجد رقم'}
                      </span>

                      {order.shipping_email && (
                        <span dir="ltr">
                          {order.shipping_email}
                        </span>
                      )}

                      <span>
                        {formatDate(
                          order.created_at
                        )}
                      </span>

                      <span>
                        {order.order_items?.length ??
                          0}{' '}
                        منتج
                      </span>

                      {order.order_number && (
                        <span dir="ltr">
                          {order.order_number}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="sm:text-left">
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(total)} ر.ع
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={status}
                      disabled={
                        updateStatusMutation.isPending
                      }
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({
                          id: order.id,
                          status:
                            value as OrderStatus,
                        })
                      }
                    >
                      <SelectTrigger className="h-9 w-36 rounded-full text-xs">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {STATUSES.map(
                          (statusItem) => (
                            <SelectItem
                              key={statusItem}
                              value={statusItem}
                            >
                              {
                                ORDER_STATUS_LABELS[
                                  statusItem
                                ]
                              }
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>

                    <Link
                      href={`/admin/orders/${order.id}`}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-accent/50"
                        aria-label="عرض تفاصيل الطلب"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={
                        deleteMutation.isPending
                      }
                      onClick={() =>
                        handleDelete(order)
                      }
                      className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                      aria-label="حذف الطلب"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />

          <p className="mt-4 text-lg font-medium text-foreground">
            لا توجد طلبات
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {statusFilter !== 'all'
              ? 'لا توجد طلبات بهذه الحالة'
              : 'لم يتم استقبال أي طلبات بعد'}
          </p>
        </div>
      )}
    </div>
  );
}