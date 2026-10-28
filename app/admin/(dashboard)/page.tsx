'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Package, ShoppingCart, Users, TrendingUp, ArrowLeft, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/format';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      return {
        productsCount: productsRes.count || 0,
        ordersCount: ordersRes.count || 0,
        usersCount: usersRes.count || 0,
      };
    },
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as Order[];
    },
  });

  const statCards = [
    {
      label: 'المنتجات',
      value: stats?.productsCount ?? 0,
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'الطلبات',
      value: stats?.ordersCount ?? 0,
      icon: ShoppingCart,
      color: 'bg-green-50 text-green-600',
      href: '/admin/orders',
    },
    {
      label: 'المستخدمين',
      value: stats?.usersCount ?? 0,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary md:text-3xl">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-muted-foreground">نظرة عامة على أداء المتجر</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-6 shadow-luxury"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {isLoading ? (
                    <Skeleton className="mt-2 h-8 w-16" />
                  ) : (
                    <p className="mt-1 text-3xl font-bold text-primary">{stat.value}</p>
                  )}
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              {stat.href && (
                <Link
                  href={stat.href}
                  className="mt-4 flex items-center gap-1 text-xs font-medium text-secondary hover:text-primary"
                >
                  عرض التفاصيل
                  <ArrowLeft className="h-3 w-3" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-luxury">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-bold text-primary">آخر الطلبات</h2>
          </div>
          <Link href="/admin/orders">
            <span className="flex items-center gap-1 text-xs font-medium text-secondary hover:text-primary">
              عرض الكل
              <ArrowLeft className="h-3 w-3" />
            </span>
          </Link>
        </div>

        {ordersLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : recentOrders && recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order: Order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-accent/20"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {order.shipping_name}
                    </p>
                    <Badge className={ORDER_STATUS_COLORS[order.status as OrderStatus]}>
                      {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(order.created_at)} · {order.order_items?.length || 0} منتج
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-primary">
                    {formatPrice(
                      order.order_items?.reduce(
                        (sum, item) => sum + item.product_price * item.quantity,
                        0
                      ) || 0
                    )} ر.ع
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">لا توجد طلبات بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
