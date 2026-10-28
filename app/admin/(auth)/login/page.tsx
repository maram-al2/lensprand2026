'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (loading) return;

    if (user && profile?.role === 'admin') {
      router.replace('/admin');
    }
  }, [loading, user, profile?.role, router]);

  const onSubmit = async (values: LoginForm) => {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

      if (authError) {
        throw authError;
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!userProfile) {
        await supabase.auth.signOut();
        throw new Error('لم يتم العثور على ملف المستخدم');
      }

      if (userProfile.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('هذا الحساب لا يملك صلاحية الدخول إلى لوحة الإدارة');
      }

      toast.success('تم تسجيل الدخول بنجاح');
      router.replace('/admin');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'حدث خطأ أثناء تسجيل الدخول';

      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/10 to-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <Image
            src="/logoo.png"
            alt="Lens Brand"
            width={160}
            height={160}
            priority
            className="h-16 w-auto"
          />
        </Link>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-bold">
              لوحة الإدارة
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              تسجيل دخول المدير
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                البريد الإلكتروني
              </label>

              <Input
                type="email"
                dir="ltr"
                placeholder="admin@example.com"
                autoComplete="email"
                {...register('email')}
              />

              {errors.email && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                كلمة المرور
              </label>

              <Input
                type="password"
                dir="ltr"
                placeholder="********"
                autoComplete="current-password"
                {...register('password')}
              />

              {errors.password && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'دخول لوحة الإدارة'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                العودة إلى المتجر
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}