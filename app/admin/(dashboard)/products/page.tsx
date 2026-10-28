'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Loader2, X, Upload, Star } from 'lucide-react';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const CATEGORIES = ['رجالي', 'نسائي', 'لابال'];
const COLORS = ['بني', 'بني غامق', 'بيج', 'أسود', 'ذهبي', 'فضي'];

const productSchema = z.object({
  name: z.string().min(2, 'اسم المنتج مطلوب'),
  description: z.string().min(5, 'الوصف مطلوب'),
  price: z.coerce.number().min(0, 'السعر مطلوب'),
  category: z.string().min(1, 'الفئة مطلوبة'),
  color: z.string().min(1, 'اللون مطلوب'),
  available: z.boolean().default(true),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: 'رجالي',
      color: 'أسود',
      available: true,
    },
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = form;
  const available = watch('available');

  const openAddDialog = () => {
    setEditingProduct(null);
    setImageUrls([]);
    reset({
      name: '',
      description: '',
      price: 0,
      category: 'رجالي',
      color: 'أسود',
      available: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setImageUrls(product.images || []);
    reset({
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        category: product.category,
        color: product.color,
});

    
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);

        newUrls.push(urlData.publicUrl);
      }
      setImageUrls((prev) => [...prev, ...newUrls]);
      toast.success('تم رفع الصور بنجاح');
    } catch (error: any) {
      toast.error('حدث خطأ أثناء رفع الصور: ' + error.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const saveMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      if (imageUrls.length === 0) {
        throw new Error('يجب إضافة صورة واحدة على الأقل');
      }

      const payload = {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        color: data.color,
        images: imageUrls,
        available: data.available,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      toast.success(editingProduct ? 'تم تحديث المنتج' : 'تمت إضافة المنتج');
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      toast.success('تم حذف المنتج');
    },
    onError: (error: any) => {
      toast.error('حدث خطأ: ' + error.message);
    },
  });

  const handleDelete = (product: Product) => {
    if (confirm(`هل أنت متأكد من حذف "${product.name}"؟`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const onSubmit = (data: ProductForm) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary md:text-3xl">إدارة المنتجات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products?.length || 0} منتج
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2 rounded-full shadow-luxury">
          <Plus className="h-4 w-4" />
          إضافة منتج
        </Button>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-luxury">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 text-right text-xs font-semibold text-muted-foreground">المنتج</th>
                  <th className="hidden p-4 text-right text-xs font-semibold text-muted-foreground sm:table-cell">الفئة</th>
                  <th className="hidden p-4 text-right text-xs font-semibold text-muted-foreground sm:table-cell">اللون</th>
                  <th className="p-4 text-right text-xs font-semibold text-muted-foreground">السعر</th>
                  <th className="p-4 text-right text-xs font-semibold text-muted-foreground">الحالة</th>
                  <th className="p-4 text-right text-xs font-semibold text-muted-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((product: Product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-accent/10">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted/20">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                              -
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="hidden p-4 sm:table-cell">
                      <Badge variant="secondary">{product.category}</Badge>
                    </td>
                    <td className="hidden p-4 text-sm text-muted-foreground sm:table-cell">{product.color}</td>
                    <td className="p-4 text-sm font-semibold text-primary">
                      {formatPrice(product.price)} ر.ع
                    </td>
                    <td className="p-4">
                      {product.available ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">متوفر</Badge>
                      ) : (
                        <Badge variant="destructive">غير متوفر</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-accent/50"
                          onClick={() => openEditDialog(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Images */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">صور المنتج</label>
              <div className="flex flex-wrap gap-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative h-24 w-24 overflow-hidden rounded-xl border border-border">
                    <Image
                      src={url}
                      alt={`صورة ${index + 1}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] text-primary-foreground">
                        <Star className="h-2 w-2 fill-current" />
                        رئيسية
                      </div>
                    )}
                  </div>
                ))}
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span className="text-[10px]">رفع صورة</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">يمكنك رفع أكثر من صورة. الصورة الأولى هي الرئيسية.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">اسم المنتج</label>
                <Input {...register('name')} className="rounded-xl" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">السعر (ر.ع)</label>
                <Input
                  {...register('price')}
                  type="number"
                  step="0.01"
                  className="rounded-xl"
                  dir="ltr"
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">الفئة</label>
                <Select
                  defaultValue={watch('category')}
                  onValueChange={(v) => setValue('category', v)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">اللون</label>
                <Select
                  defaultValue={watch('color')}
                  onValueChange={(v) => setValue('color', v)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">الوصف</label>
              <Textarea {...register('description')} className="rounded-xl" rows={3} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={available}
                onCheckedChange={(checked) => setValue('available', checked)}
              />
              <label className="text-sm font-medium text-foreground">المنتج متوفر</label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-full"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="gap-2 rounded-full shadow-luxury"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
