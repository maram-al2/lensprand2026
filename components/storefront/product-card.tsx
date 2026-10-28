'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.available) {
      toast.error('هذا المنتج غير متوفر حالياً');
      return;
    }
    addItem(product);
    toast.success('تمت إضافة المنتج إلى السلة');
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-luxury transition-all duration-300 hover:shadow-luxury-lg">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
              لا توجد صورة
            </div>
          )}

          {/* Badges */}
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur">
              {product.category}
            </Badge>
            {!product.available && (
              <Badge variant="destructive" className="bg-destructive/90 backdrop-blur">
                غير متوفر
              </Badge>
            )}
          </div>

   
          {/* Hover actions */}
          <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-gradient-to-t from-black/40 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">

            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 bg-white text-foreground shadow-md hover:bg-white hover:text-primary"
              onClick={handleAddToCart}
              disabled={!product.available}
            >
              <ShoppingBag className="h-4 w-4" />
              أضف للسلة
            </Button>

            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 bg-[#6B4F3A] text-white shadow-md hover:bg-[#5A4030] hover:text-white"
              asChild
            >
              <span>
                <Eye className="h-4 w-4" />
                عرض
              </span>
            </Button>

          </div>
        </div>


        {/* Info */}
        <div className="p-4">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{product.color}</span>
          </div>
          <h3 className="mb-1 truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          <p className="text-base font-bold text-primary">
            {formatPrice(product.price)} <span className="text-xs font-normal">ر.ع</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
