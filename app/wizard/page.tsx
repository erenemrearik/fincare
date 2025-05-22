import { Separator } from "@/components/ui/separator";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Logo from "@/components/Logo";
import CurrencyComboBox from "@/components/CurrencyComboBox";

async function WizardPage() {

    const user = await currentUser()

    if (!user) {
        redirect("sign-in");
    }

    return (
        <div className=" container flex flex-col max-w-2xl items-center justify-center gap-4">
            <div>
                <h1 className=" text-center text-3xl">
                    Hoş geldin, <span className=" ml-2 font-bold">{user.firstName}! 👋</span>
                </h1>
                <h2 className=" mt-4 text-center text-base text-muted-foreground">
                    Para biriminizi ayarlayarak başlayalım
                </h2>
                <h3 className=" mt-2 text-center text-sm text-muted-foreground">
                    Bu ayarları istediğiniz zaman değiştirebilirsiniz
                </h3>
            </div>
            <Separator />
            <Card className=" w-full">
                <CardHeader>
                    <CardTitle>Para Birimi</CardTitle>
                    <CardDescription>
                        İşlemler için varsayılan para biriminizi ayarlayın
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CurrencyComboBox />
                </CardContent>
            </Card>
            <Separator />
            <Button className=" w-full" asChild>
                <Link href={"/"}>
                    Hazırım! Beni panele götür
                </Link>
            </Button>
            <div className=" mt-8">
                <Logo />
            </div>
        </div>
    )
}

export default WizardPage;