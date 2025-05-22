import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcherBtn } from "@/components/ThemeSwitcherBtn";
import Logo from "@/components/Logo";

export function MarketingHeader() {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost">Giriş Yap</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Kaydol</Button>
          </Link>
          <ThemeSwitcherBtn />
        </div>
      </div>
    </header>
  );
}