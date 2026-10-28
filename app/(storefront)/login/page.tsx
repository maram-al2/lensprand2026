'use client';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Glasses, Loader2, ArrowLeft, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

const authSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
});

type AuthForm = z.infer<typeof authSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  const onSubmit = async (data: AuthForm) => {
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        await refreshProfile();
        toast.success('تم تسجيل الدخول بنجاح');
        router.push('/');
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        if (signUpData.user) {
          toast.success('تم إنشاء الحساب بنجاح');
          router.push('/');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ غير متوقع');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent/30 to-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
<Link href="/" className="mb-8 flex items-center justify-center">
  <Image
    src="/logoo.png"
    alt="Logo"
    width={300}
    height={300}
    priority
    className="h-16 w-auto"
  />
</Link>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-luxury-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/50 text-primary">
              <User className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-primary">
              {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === 'login'
                ? 'أدخل بياناتك للوصول إلى حسابك'
                : 'أنشئ حسابك للاستمتاع بتجربة تسوق مميزة'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
              <Input
                {...register('email')}
                type="email"
                placeholder="example@email.com"
                className="rounded-xl"
                dir="ltr"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">كلمة المرور</label>
              <Input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="rounded-xl"
                dir="ltr"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 rounded-full shadow-luxury hover:shadow-luxury-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري المعالجة...
                </>
              ) : mode === 'login' ? (
                'تسجيل الدخول'
              ) : (
                'إنشاء الحساب'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                ليس لديك حساب؟{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="font-semibold text-primary hover:underline"
                >
                  أنشئ حساباً جديداً
                </button>
              </>
            ) : (
              <>
                لديك حساب بالفعل؟{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-semibold text-primary hover:underline"
                >
                  سجل دخولك
                </button>
              </>
            )}
          </div>

          <div className="mt-6 border-t border-border pt-6 text-center">
            <Link
              href="/admin/login"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              دخول لوحة الإدارة
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 rounded-full text-muted-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
