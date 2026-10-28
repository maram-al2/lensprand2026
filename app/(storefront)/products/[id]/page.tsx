'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Check, X, Minus, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

  const handleAddToCart = () => {
    if (!product || !product.available) {
      toast.error('هذا المنتج غير متوفر حالياً');
      return;
    }
    addItem(product, quantity);
    toast.success('تمت إضافة المنتج إلى السلة');
  };

  const handleBuyNow = () => {
    if (!product || !product.available) {
      toast.error('هذا المنتج غير متوفر حالياً');
      return;
    }
    addItem(product, quantity);
    router.push('/cart');
  };

  if (isLoading) {
    return (
      <div className="container-luxury py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-luxury flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-foreground">المنتج غير موجود</p>
        <Link href="/products">
          <Button variant="outline" className="mt-4 gap-2 rounded-full">
            <ArrowRight className="h-4 w-4" />
            العودة للمنتجات
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxury py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">الرئيسية</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">المنتجات</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-muted/20 shadow-luxury">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                لا توجد صورة
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === idx
                      ? 'border-primary shadow-luxury'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - صورة ${idx + 1}`}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            <Badge variant="outline">{product.color}</Badge>
            {product.available ? (
              <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                <Check className="h-3 w-3" />
                متوفر
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <X className="h-3 w-3" />
                غير متوفر
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold text-primary md:text-4xl">{product.name}</h1>

          <p className="mt-4 text-2xl font-bold text-primary">
            {formatPrice(product.price)} <span className="text-sm font-normal text-muted-foreground">ر.ع</span>
          </p>

          <div className="my-6 h-px bg-border" />

          <div>
            <h2 className="mb-2 text-sm font-semibold text-foreground">الوصف</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          {/* Quantity */}
          {product.available && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold text-foreground">الكمية</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-full border border-border bg-card">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="outline"
              className="flex-1 gap-2 rounded-full border-primary/20 hover:bg-accent/50"
              onClick={handleAddToCart}
              disabled={!product.available}
            >
              <ShoppingBag className="h-5 w-5" />
              أضف إلى السلة
            </Button>
            <Button
              size="lg"
              className="flex-1 gap-2 rounded-full shadow-luxury hover:shadow-luxury-lg"
              onClick={handleBuyNow}
              disabled={!product.available}
            >
              اشترِ الآن
            </Button>
          </div>

          <Link href="/products">
            <Button variant="ghost" className="mt-4 gap-2 rounded-full text-muted-foreground hover:text-primary">
              <ArrowRight className="h-4 w-4" />
              العودة للمنتجات
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
