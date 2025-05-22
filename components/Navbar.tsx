"use client"

import { usePathname } from "next/navigation";
import Logo, { LogoMobile } from "./Logo"
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { ThemeSwitcherBtn } from "./ThemeSwitcherBtn";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

function Navbar() {
    return (
        <>
            <DesktopNavbar />
            <MobileNavbar />
        </>
    )
}

const items = [
    { label: "Pano", link: "/dashboard" },
    { label: "İşlemler", link: "/dashboard/transactions" },
    { label: "Ödemeler", link: "/dashboard/bills" },
    { label: "Hedefler", link: "/dashboard/goals" },
    { label: "Raporlar", link: "/dashboard/reports" },
    { label: "Ayarlar", link: "/dashboard/manage" },
]

function MobileNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="block md:hidden border-separate border-b bg-background">
            <nav className=" container flex items-center justify-between px-8">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant={"ghost"} size={"icon"}>
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className=" w-[400px] sm:w-[540px]"
                        side={"left"}
                    >
                        <Logo />
                        <div className="flex flex-col gap-1 pt-4">
                            {items.map((item) => (
                                <NavbarItem
                                    key={item.label}
                                    link={item.link}
                                    label={item.label}
                                    clickCallBack={() => setIsOpen(prev => !prev)}
                                />
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
                <div className=" flex h-[80px] min-h-[60px] items-center gap-x-4 ">
                    <LogoMobile />
                </div>
                <div className=" flex items-center gap-2 ml-2">
                    <ThemeSwitcherBtn />
                    <UserButton afterSignOutUrl="sign-in" />
                </div>

            </nav>
        </div>
    )
}

function DesktopNavbar() {
    return (
        <div className="hidden md:block border-separate border-b bg-background">
            <nav className=" container flex items-center justify-between px-8">
                <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
                    <Logo />
                    <div className=" flex h-full">
                        {items.map((item) => (
                            <NavbarItem
                                key={item.label}
                                link={item.link}
                                label={item.label}
                            />
                        ))}
                    </div>
                </div>
                <div className=" flex items-center gap-2">
                    <ThemeSwitcherBtn />
                    <UserButton afterSignOutUrl="sign-in" />
                </div>
            </nav>
        </div>
    )
}

function NavbarItem({ link, label, clickCallBack }: { link: string, label: string, clickCallBack?: () => void }) {
    const pathname = usePathname();
    const isActive = pathname === link;
    return (
        <div className="relative flex items-center">
            <Link
                href={link}
                className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-full justify-start text-lg text-muted-foreground hover:text-foreground",
                    isActive && "text-foreground"
                )}
                onClick={() => {
                    if (clickCallBack) clickCallBack()
                }}
            >
                {label}
            </Link>
            {
                isActive && (
                    <div className=" absolute -bottom-[2px] left-1/2
                    hidden h-[2px] w-[80%] -translate-x-1/2 rounded-xl bg-foreground md:block"></div>
                )
            }
        </div>
    )
}

export default Navbar