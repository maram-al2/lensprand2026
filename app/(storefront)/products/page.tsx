'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';

import { ProductCard } from '@/components/storefront/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';

const CATEGORIES = [
  'الكل',
  'رجالي',
  'نسائي',
  'لابال',
];

const COLORS = [
  'الكل',
  'بني',
  'بني غامق',
  'بيج',
  'أسود',
  'ذهبي',
  'فضي',
];

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('الكل');
  const [color, setColor] = useState('الكل');
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ['products'],

    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      return (data ?? []) as Product[];
    },
  });

  const filtered = useMemo<Product[]>(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return products.filter((product: Product) => {
      const productName =
        product.name?.toLowerCase() ?? '';

      const matchSearch =
        normalizedSearch.length === 0 ||
        productName.includes(normalizedSearch);

      const matchCategory =
        category === 'الكل' ||
        product.category === category;

      const matchColor =
        color === 'الكل' ||
        product.color === color;

      return (
        matchSearch &&
        matchCategory &&
        matchColor
      );
    });
  }, [
    products,
    search,
    category,
    color,
  ]);

  const clearFilters = () => {
    setSearch('');
    setCategory('الكل');
    setColor('الكل');
  };

  const hasFilters =
    search.trim().length > 0 ||
    category !== 'الكل' ||
    color !== 'الكل';

  return (
    <div className="container-luxury py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">
          جميع المنتجات
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          استكشف تشكيلتنا الكاملة من النظارات الشمسية
          الفاخرة
        </p>
      </div>

      {/* Search and mobile filter button */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="ابحث عن نظارة..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="rounded-full border-border bg-card pr-10"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setShowFilters((current) => !current)
          }
          className="gap-2 rounded-full border-primary/20 sm:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />

          {showFilters
            ? 'إخفاء الفلاتر'
            : 'فلترة'}
        </Button>
      </div>

      {/* Filters */}
      <div
        className={cn(
          'mb-8 space-y-4',
          !showFilters && 'hidden sm:block'
        )}
      >
        <div className="rounded-2xl border border-border bg-card p-4">
          {/* Categories */}
          <div className="mb-4">
            <h2 className="mb-2 text-sm font-semibold text-foreground">
              الفئة
            </h2>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((categoryItem) => (
                <button
                  key={categoryItem}
                  type="button"
                  onClick={() =>
                    setCategory(categoryItem)
                  }
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                    category === categoryItem
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent/50'
                  )}
                >
                  {categoryItem}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h2 className="mb-2 text-sm font-semibold text-foreground">
              اللون
            </h2>

            <div className="flex flex-wrap gap-2">
              {COLORS.map((colorItem) => (
                <button
                  key={colorItem}
                  type="button"
                  onClick={() =>
                    setColor(colorItem)
                  }
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                    color === colorItem
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent/50'
                  )}
                >
                  {colorItem}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">
                {filtered.length} منتج
              </span>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
                مسح الفلاتر
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Query error */}
      {error && (
        <div className="mb-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center">
          <p className="text-sm font-medium text-destructive">
            حدث خطأ أثناء تحميل المنتجات
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {error instanceof Error
              ? error.message
              : 'حاولي إعادة تحميل الصفحة'}
          </p>
        </div>
      )}

      {/* Products */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {Array.from({
            length: 8,
          }).map((_, index) => (
            <div
              key={index}
              className="space-y-3"
            >
              <Skeleton className="aspect-square rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-lg font-medium text-foreground">
            لا توجد منتجات مطابقة
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            جربي تغيير الفلاتر أو البحث بكلمة أخرى
          </p>

          {hasFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="mt-4 gap-2 rounded-full"
            >
              <X className="h-4 w-4" />
              مسح الفلاتر
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}