import Link from 'next/link';
import Image from 'next/image';
import { Glasses, Mail, Phone, Instagram, Facebook, Twitter } from 'lucide-react';

const footerLinks = [
  { href: '/', label: 'الرئيسية' },
  { href: '/products', label: 'المنتجات' },
  { href: '/about', label: 'من نحن' },
  { href: '/login', label: 'تسجيل الدخول' },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="container-luxury py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
<Link href="/" className="flex items-center">
  <Image
    src="/logoo.png"
    alt="Logo"
    width={140}
    height={140}
    className="h-14 w-auto"
  />
</Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              علامة عُمانية للنظارات نصنع نظاراتنا الخاصة بعناية،بجودة عالية وتصاميم راقية تُرتدى بثقة
للطلب والاستفسار، يسعدنا تواصلكم معنا عبر الإنستغرام أو الواتساب
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.instagram.com/lens_s.tore?igsh=MXZtdjUwdHdkNDl3Mg=="
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-accent/50 hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </a>
       
         
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-primary">روابط سريعة</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-primary">تواصل معنا</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@optique.com"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Mail className="h-4 w-4" />
                  lensprand@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+966500000000"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Phone className="h-4 w-4" />
                  95873139
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} All Rights Reserved  Lens Brand
          </p>
        </div>
      </div>
    </footer>
  );
}
