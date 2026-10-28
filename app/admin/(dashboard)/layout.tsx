'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Glasses,
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Menu,
  Loader2,
} from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/admin',
    label: 'لوحة التحكم',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/products',
    label: 'المنتجات',
    icon: Package,
  },
  {
    href: '/admin/orders',
    label: 'الطلبات',
    icon: ShoppingCart,
  },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    profile,
    loading,
    isAdmin,
    signOut,
  } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user || !isAdmin) {
      router.replace('/admin/login');
    }
  }, [loading, user, isAdmin, router]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);

      await signOut();

      router.replace('/admin/login');
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <Link
        href="/admin"
        className="flex h-20 items-center gap-2 border-b border-border px-6"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Glasses className="h-5 w-5" />
        </div>

        <div className="flex flex-col">
          <span className="text-lg font-bold text-primary">
            Lens Brand
          </span>

          <span className="text-[9px] font-medium tracking-widest text-muted-foreground">
            ADMIN PANEL
          </span>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-luxury'
                  : 'text-foreground/70 hover:bg-accent/50 hover:text-primary'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 rounded-xl bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            مرحباً،
          </p>

          <p className="truncate text-sm font-semibold text-foreground">
            {profile?.full_name ||
              user.email ||
              'مدير'}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full gap-2 rounded-xl border-primary/20 hover:bg-destructive/5 hover:text-destructive"
        >
          {isSigningOut ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري تسجيل الخروج...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-l border-border bg-card md:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile layout */}
      <Sheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden">
            <Link
              href="/admin"
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Glasses className="h-5 w-5" />
              </div>

              <span className="text-lg font-bold text-primary">
                Lens Brand
              </span>
            </Link>

            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </div>

          <SheetContent
            side="right"
            className="w-64 p-0 md:hidden"
          >
            <SidebarContent />
          </SheetContent>

          <main className="min-w-0 flex-1 overflow-x-hidden">
            {children}
          </main>
        </div>
      </Sheet>
    </div>
  );
}