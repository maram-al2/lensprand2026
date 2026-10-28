'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-luxury flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/30">
          <ShoppingBag className="h-12 w-12 text-primary/50" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-primary">سلة التسوق فارغة</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          لم تقم بإضافة أي منتجات بعد. تصفح تشكيلتنا واختر ما يناسبك
        </p>
        <Link href="/products">
          <Button className="mt-6 gap-2 rounded-full px-8 shadow-luxury">
            تسوق الآن
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxury py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold text-primary md:text-4xl">سلة التسوق</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-luxury"
              >
                {/* Image */}
                <Link
                  href={`/products/${item.product.id}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted/20"
                >
                  {item.product.images && item.product.images.length > 0 ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      لا توجد صورة
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="text-sm font-semibold text-foreground hover:text-primary">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.product.color} · {item.product.category}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    {/* Quantity */}
                    <div className="flex items-center rounded-full border border-border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="text-sm font-bold text-primary">
                      {formatPrice(item.product.price * item.quantity)}ر.ع 
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              تفريغ السلة
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-luxury">
            <h2 className="mb-4 text-lg font-bold text-primary">ملخص الطلب</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد المنتجات</span>
                <span className="font-semibold">{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-semibold">{formatPrice(totalPrice)} ر.ع</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الشحن</span>
                <span className="font-semibold text-green-600">يحدد لاحقاً</span>
              </div>

              <div className="my-3 h-px bg-border" />

              <div className="flex justify-between text-base">
                <span className="font-bold text-foreground">المجموع النهائي</span>
                <span className="font-bold text-primary">
                  {formatPrice(totalPrice)} ر.ع
                </span>
              </div>
            </div>

            <Link href="/checkout">
              <Button className="mt-6 w-full gap-2 rounded-full shadow-luxury hover:shadow-luxury-lg" size="lg">
                متابعة الطلب
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/products">
              <Button variant="ghost" className="mt-3 w-full gap-2 rounded-full text-muted-foreground">
                متابعة التسوق
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
