'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  User,
  Package,
  LogOut,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

import type {
  Order,
  OrderItem,
  OrderStatus,
} from '@/lib/types';

import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/lib/types';

import { formatPrice, formatDate } from '@/lib/format';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'الاسم مطلوب'),

  phone: z
    .string()
    .optional()
    .or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
  } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery<Order[]>({
    queryKey: ['my-orders', user?.id],

    queryFn: async (): Promise<Order[]> => {
      if (!user?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      return (data ?? []) as Order[];
    },

    enabled: Boolean(user?.id),
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),

    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
    },
  });

  useEffect(() => {
    if (!profile) return;

    form.reset({
      full_name: profile.full_name ?? '',
      phone: profile.phone ?? '',
    });
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: async (
      data: ProfileForm
    ): Promise<void> => {
      if (!user?.id) {
        throw new Error(
          'يجب تسجيل الدخول أولاً'
        );
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone || null,
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }
    },

    onSuccess: async () => {
      await refreshProfile();

      await queryClient.invalidateQueries({
        queryKey: ['profile'],
      });

      toast.success(
        'تم تحديث البيانات بنجاح'
      );
    },

    onError: (error: Error) => {
      toast.error(
        `حدث خطأ: ${error.message}`
      );
    },
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'حدث خطأ أثناء تسجيل الخروج';

      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="container-luxury py-12">
        <Skeleton className="h-12 w-48" />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container-luxury py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary md:text-4xl">
            حسابي
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            مرحباً،{' '}
            {profile?.full_name ||
              user.email ||
              'المستخدم'}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleSignOut}
          className="gap-2 rounded-full border-primary/20 hover:bg-destructive/5 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Profile */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-luxury">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-primary">
              <User className="h-5 w-5" />
            </div>

            <h2 className="text-lg font-bold text-primary">
              البيانات الشخصية
            </h2>
          </div>

          <form
            onSubmit={form.handleSubmit(
              (data) =>
                updateMutation.mutate(data)
            )}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="full_name"
                className="text-sm font-medium text-foreground"
              >
                الاسم الكامل
              </label>

              <Input
                id="full_name"
                {...form.register('full_name')}
                className="rounded-xl"
                placeholder="اسمك الكامل"
              />

              {form.formState.errors
                .full_name && (
                <p className="text-xs text-destructive">
                  {
                    form.formState.errors
                      .full_name.message
                  }
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                البريد الإلكتروني
              </label>

              <Input
                id="email"
                value={user.email ?? ''}
                disabled
                className="rounded-xl bg-muted/50"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-foreground"
              >
                رقم الهاتف
              </label>

              <Input
                id="phone"
                {...form.register('phone')}
                className="rounded-xl"
                placeholder="9xxxxxxx"
                dir="ltr"
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2 rounded-full shadow-luxury"
              disabled={
                updateMutation.isPending
              }
            >
              {updateMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              حفظ التغييرات
            </Button>
          </form>
        </div>

        {/* Orders */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-luxury">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-primary">
              <Package className="h-5 w-5" />
            </div>

            <h2 className="text-lg font-bold text-primary">
              طلباتي السابقة
            </h2>
          </div>

          {ordersError && (
            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
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

          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({
                length: 3,
              }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-20 rounded-xl"
                />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {orders.map(
                (order: Order) => {
                  const orderStatus =
                    order.status as OrderStatus;

                  return (
                    <div
                      key={order.id}
                      className="rounded-xl border border-border p-4 transition-colors hover:bg-accent/20"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          {order.order_number && (
                            <p
                              className="text-xs font-medium text-foreground"
                              dir="ltr"
                            >
                              {
                                order.order_number
                              }
                            </p>
                          )}

                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDate(
                              order.created_at
                            )}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {order.order_items
                              ?.length ?? 0}{' '}
                            منتج
                          </p>
                        </div>

                        <Badge
                          className={
                            ORDER_STATUS_COLORS[
                              orderStatus
                            ] ?? ''
                          }
                        >
                          {ORDER_STATUS_LABELS[
                            orderStatus
                          ] ?? orderStatus}
                        </Badge>
                      </div>

                      <div className="mt-3 space-y-2">
                        {order.order_items &&
                        order.order_items
                          .length > 0 ? (
                          order.order_items.map(
                            (
                              item: OrderItem
                            ) => {
                              const quantity =
                                Number(
                                  item.quantity ??
                                    0
                                );

                              const price =
                                Number(
                                  item.product_price ??
                                    0
                                );

                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between gap-3 text-xs text-muted-foreground"
                                >
                                  <span className="min-w-0 truncate">
                                    {item.product_name ||
                                      'منتج'}{' '}
                                    × {quantity}
                                  </span>

                                  <span className="whitespace-nowrap">
                                    {formatPrice(
                                      price *
                                        quantity
                                    )}{' '}
                                    ر.ع
                                  </span>
                                </div>
                              );
                            }
                          )
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            لا توجد منتجات مرتبطة
                            بهذا الطلب
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex justify-between border-t border-border pt-3">
                        <span className="text-xs font-medium text-foreground">
                          المجموع
                        </span>

                        <span className="text-sm font-bold text-primary">
                          {formatPrice(
                            Number(
                              order.total ?? 0
                            )
                          )}{' '}
                          ر.ع
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />

              <p className="mt-4 text-sm text-muted-foreground">
                لا توجد طلبات سابقة
              </p>

              <Link href="/products">
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-full"
                >
                  ابدأ التسوق
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}