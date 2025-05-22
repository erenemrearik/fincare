import { MarketingHeader } from "@/components/marketing-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Sparkles, BarChart3, ShieldCheck, Wallet, TrendingUp, Activity } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await currentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 dark:from-background dark:via-background dark:to-background">
      <MarketingHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center gap-12">
        <section className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-5xl">
          <div className="flex-1 flex flex-col items-start md:items-start gap-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-2 text-primary text-left w-full animate-fade-in">
              FINCARE ile Finansal Geleceğini Yönlendir
            </h1>
            <p className="text-lg md:text-2xl mb-4 max-w-xl text-muted-foreground text-left animate-fade-in delay-100">
              Gelir ve giderlerinizi kolayca takip edin, hedefler belirleyin ve finansal sağlığınızı güçlendirin. Fincare, akıllı asistanınız olarak bütçenizi yönetmenize yardımcı olur.
            </p>
            <div className="flex flex-col md:flex-row gap-4 animate-fade-in delay-200">
              <Link href="/sign-up">
                <Button size="lg">Hemen Kaydol</Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" size="lg">Giriş Yap</Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center animate-float">
            <Image
              src="/logos/fincare-mockup.png"
              alt="Fincare Hero Illustration"
              width={820}
              height={720}
              className="w-full h-auto max-w-[820px] md:max-h-[720px] object-contain"
              priority
            />
          </div>
        </section>

        <section className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
          <Card className="hover:shadow-2xl transition-shadow border-2 border-transparent hover:border-primary/30 bg-white/80 dark:bg-card/80">
            <CardHeader className="flex flex-row items-center gap-3">
              <Wallet className="w-8 h-8 text-emerald-500" />
              <CardTitle>Bütçe Takibi</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gelir ve giderlerinizi kolayca kaydedin, bütçenizi anlık olarak takip edin.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="hover:shadow-2xl transition-shadow border-2 border-transparent hover:border-primary/30 bg-white/80 dark:bg-card/80">
            <CardHeader className="flex flex-row items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              <CardTitle>Gelişmiş Raporlar</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Harcamalarınızı grafiklerle analiz edin, kategorilere göre detaylı raporlar alın.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="hover:shadow-2xl transition-shadow border-2 border-transparent hover:border-primary/30 bg-white/80 dark:bg-card/80">
            <CardHeader className="flex flex-row items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <CardTitle>Hedef Belirleme</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Finansal hedefler koyun, ilerlemenizi takip edin ve motivasyonunuzu artırın.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="hover:shadow-2xl transition-shadow border-2 border-transparent hover:border-primary/30 bg-white/80 dark:bg-card/80">
            <CardHeader className="flex flex-row items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-purple-500" />
              <CardTitle>Güvenli ve Gizli</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Verileriniz güvenli bir şekilde saklanır, gizliliğiniz her zaman ön planda tutulur.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="hover:shadow-2xl transition-shadow border-2 border-transparent hover:border-primary/30 bg-white/80 dark:bg-card/80">
            <CardHeader className="flex flex-row items-center gap-3">
              <Sparkles className="w-8 h-8 text-pink-500" />
              <CardTitle>Yapay Zeka Destekli</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Akıllı öneriler ve analizlerle finansal kararlarınızı kolaylaştırın.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="hover:shadow-2xl transition-shadow border-2 border-transparent hover:border-primary/30 bg-white/80 dark:bg-card/80">
            <CardHeader className="flex flex-row items-center gap-3">
              <Activity className="w-8 h-8 text-purple-500" />
              <CardTitle>Kullanıcı Dostu Tasarım</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Modern ve sade arayüz ile tüm işlemlerinizi kolayca yönetin.
              </CardDescription>
            </CardContent>
          </Card>
        </section>
      </main>
      <footer className="w-full py-6 text-center text-muted-foreground border-t mt-auto bg-white/70 dark:bg-background/80">
        © {new Date().getFullYear()} Fincare. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
