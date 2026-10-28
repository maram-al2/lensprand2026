import Link from 'next/link';
import { Eye, Heart, Award, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/30 to-background py-16 md:py-24">
        <div className="container-luxury text-center">
          <span className="mb-3 inline-block text-sm font-medium text-secondary">تعرّف علينا</span>
          <h1 className="text-balance text-4xl font-bold text-primary md:text-5xl">من نحن</h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground">
            علامة عمانية للنظارات نؤمن أن الجودة تبدأ من التفاصيل لذلك صممت نظاراتنا لتدوم وترتد بثقة وجودة عالية
          
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="container-luxury py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-primary md:text-3xl">نبذة عن المتجر</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
 متجر متخصص في تقديم نظارات عصرية تجمع بين الأناقة والجودة، 
 
 حيث نختار كل تصميم بعناية ليلائم مختلف الأذواق ويمنحك الراحة والثقة في كل استخدام. نحرص على توفير عدسات  (Polarized + UV400) لحماية العين، وإطارات متينة وخفيفة،
 مع اهتمام بأدق التفاصيل بدءًا من التصميم وحتى التغليف الفاخر، لنضمن لك تجربة مميزة ومنتجًا يعكس جودة تحمل اسمنا.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="border-y border-border bg-card/50">
        <div className="container-luxury py-16">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-luxury">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/50 text-primary">
                <Eye className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-primary">رؤيتنا</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                أن نكون الوجهة الأولى للنظارات الشمسية الفاخرة في المنطقة، وأن نُعرف
                بالجودة والأناقة والتميز في خدمة العملاء، لنصبح العلامة المفضلة لكل من
                يبحث عن التميز.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-luxury">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/50 text-primary">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-primary">رسالتنا</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                تقديم نظارات شمسية فاخرة بأعلى معايير الجودة، مع تجربة تسوق استثنائية
                تجمع بين الأناقة والراحة. نلتزم بتقديم منتجات أصلية بأسعار عادلة وخدمة
                عملاء متميزة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-luxury py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary md:text-3xl">قيمنا</h2>
          <p className="mt-3 text-sm text-muted-foreground">المبادئ التي نلتزم بها</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Award, title: 'الجودة', desc: 'نختار أجود الخامات وأرقى التصاميم' },
            { icon: Heart, title: 'العميل أولاً', desc: 'رضا عملائنا هو أولويتنا القصوى' },
            { icon: Eye, title: 'الأناقة', desc: 'نقدم تصاميم عصرية تواكب أحدث الصيحات' },
          ].map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-border bg-card p-6 text-center shadow-luxury transition-transform hover:scale-105"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/50 text-primary">
                <value.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-primary">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="container-luxury pb-16">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-luxury md:p-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary md:text-3xl">معلومات التواصل</h2>
            <p className="mt-3 text-sm text-muted-foreground">نحن هنا للإجابة على استفساراتك</p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/50 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">البريد الإلكتروني</h3>
                <a href="mailto:info@optique.com" className="mt-1 block text-sm text-muted-foreground hover:text-primary">
                  lensprand@gmail.com
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/50 text-primary">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">الهاتف</h3>
                <a href="tel:+966500000000" className="mt-1 block text-sm text-muted-foreground hover:text-primary" dir="ltr">
                  95873139
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/50 text-primary">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">الموقع</h3>
                <p className="mt-1 text-sm text-muted-foreground">  سلطنة عمان </p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href="/products">
              <Button size="lg" className="gap-2 rounded-full px-8 shadow-luxury hover:shadow-luxury-lg">
                تصفح منتجاتنا
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
