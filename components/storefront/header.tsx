'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, User, LogOut, Glasses } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import Image from "next/image";
const navLinks = [
  { href: '/', label: 'الرئيسية' },
  { href: '/products', label: 'المنتجات' },
  { href: '/about', label: 'من نحن' },
];

export function Header() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { user, profile, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'glass shadow-luxury border-b border-border/60'
          : 'bg-transparent'
      )}
    >
<div className="container-luxury">
  <div className="flex h-20 items-center justify-between gap-4">
    {/* Logo */}
 {/* 
<Link href="/" className="group flex items-center">

<Image
  src="/logo.jpeg"
  alt="Logoo"
  width={140}
  height={140}
  priority
  className="h-auto w-auto transition-transform duration-300 group-hover:..."
/>
</Link>
 */}
    {/* Desktop Nav */}

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/50 hover:text-primary',
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-foreground/70'
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute -bottom-px right-1/2 h-0.5 w-6 translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-accent/50"
                aria-label="السلة"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-[10px] font-bold text-secondary-foreground">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* User */}
            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/account">
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-accent/50">
                    <User className="h-4 w-4" />
                    <span className="max-w-24 truncate">
                      {profile?.full_name || 'حسابي'}
                    </span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="hover:bg-destructive/10 hover:text-destructive"
                  aria-label="تسجيل الخروج"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button variant="outline" size="sm" className="border-primary/20 hover:bg-accent/50">
                  تسجيل الدخول
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="القائمة">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex h-20 items-center justify-between border-b border-border px-6">
                  <span className="text-lg font-bold text-primary">القائمة</span>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col gap-1 p-4">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          'rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/50',
                          pathname === link.href
                            ? 'bg-accent/50 text-primary'
                            : 'text-foreground/70'
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                  <div className="my-2 h-px bg-border" />
                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/account"
                          className="rounded-lg px-4 py-3 text-sm font-medium text-foreground/70 hover:bg-accent/50"
                        >
                          حسابي
                        </Link>
                      </SheetClose>
                      <button
                        onClick={() => signOut()}
                        className="rounded-lg px-4 py-3 text-right text-sm font-medium text-destructive hover:bg-destructive/10"
                      >
                        تسجيل الخروج
                      </button>
                    </>
                  ) : (
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        تسجيل الدخول
                      </Link>
                    </SheetClose>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
