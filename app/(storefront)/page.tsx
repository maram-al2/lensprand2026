'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ShieldCheck, Truck, Sparkles, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/storefront/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false })
        .limit(4);
      if (error) throw error;
      return data as Product[];
    },
  });

  const features = [
    {
      icon: Award,
      title: 'جودة فاخرة',
      desc: 'أجود الخامات وأرقى التصاميم العالمية',
    },
    {
      icon: ShieldCheck,
      title: 'ضمان الحماية',
      desc: 'عدسات مستقطبة توفر حماية كاملة من الأشعة',
    },
    {
      icon: Truck,
      title: 'توصيل سريع',
      desc: 'نوصل طلبك إلى باب منزلك بأسرع وقت',
    },
    {
      icon: Sparkles,
      title: 'تصاميم حصرية',
      desc: 'تشكيلة مختارة بعناية تناسب جميع الأذواق',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/30 via-background to-background">
        <div className="container-luxury py-16 md:py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="animate-fade-in-up space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-medium text-secondary backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                تشكيلة 2026 الجديدة
              </div>
              <h1 className="text-balance text-4xl font-bold leading-tight text-primary md:text-5xl lg:text-6xl">
             Lens Brand

              </h1>
              <p className="max-w-md text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
                اكتشف مجموعتنا الحصرية من النظارات الشمسية مصممة لتعكس
                شخصيتك وتضيف لمسة من الرقي لإطلالتك.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/products">
                  <Button size="lg" className="gap-2 rounded-full px-8 shadow-luxury hover:shadow-luxury-lg">
                    تسوق الآن
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="rounded-full px-8 border-primary/20 hover:bg-accent/50">
                    تعرف علينا
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fade-in-up">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-luxury-lg">
              <Image
              src="/hero.png"
              alt="Lens Brand"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              /> 


                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -right-4 hidden rounded-2xl border border-border bg-card/95 p-4 shadow-luxury-lg backdrop-blur md:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/50">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">+500 عميل</p>
                    <p className="text-xs text-muted-foreground">يثقون بنا</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-card/50">
        <div className="container-luxury py-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 rounded-2xl p-4 transition-colors hover:bg-accent/30"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-luxury py-16 md:py-20">
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="mb-2 text-sm font-medium text-secondary">تشكيلة مختارة</span>
          <h2 className="text-3xl font-bold text-primary md:text-4xl">المنتجات المميزة</h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            أبرز قطعنا من النظارات الشمسية الفاخرة، مختارة بعناية لتلبي ذوقك الرفيع
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {products?.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link href="/products">
            <Button size="lg" variant="outline" className="gap-2 rounded-full px-8 border-primary/20 hover:bg-accent/50">
              عرض جميع المنتجات
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container-luxury pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-primary to-secondary p-8 md:p-12">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
              انضم إلينا
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
              سجل حسابك الآن واستمتع بتجربة تسوق مميزة، تابع طلباتك واحصل على عروض حصرية
            </p>
            <Link href="/login">
              <Button className="mt-6 gap-2 bg-card text-primary hover:bg-card/90">
                إنشاء حساب
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        </div>
      </section>
    </div>
  );
}
