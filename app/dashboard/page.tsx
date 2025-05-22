import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CreateTransactionDialog from "./_components/CreateTransactionDialog";
import Overview from "./_components/Overview";
import History from "./_components/History";


async function DashboardPage() {

  const user = await currentUser()
  if (!user) {
    redirect("sign-in");
  }

  const userSettings = await prisma.userSettings.findFirst({
    where: {
      userId: user.id
    }
  })
  if (!userSettings) {
    redirect("/wizard");
  }


  return (
    <div className=" h-full bg-background">
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">

          <p className=" text-3xl font-bold">
            Merhaba, {user.firstName}! 👋
          </p>

          <div className=" flex items-center gap-3">
            <CreateTransactionDialog
              type={"income"}
              trigger={
                <Button variant={"outline"}
                  className=" border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700"
                >
                  Gelir Ekle
                </Button>
              }
            />

            <CreateTransactionDialog
              type={"expense"}
              trigger={
                <Button variant={"outline"}
                  className=" border-rose-500 bg-rose-950 text-white hover:bg-rose-700"
                >
                  Gider Ekle
                </Button>
              }
            />
          </div>
        </div>
      </div>
      <Overview userSettings={userSettings} />
      <History userSettings={userSettings} />
    </div>
  );
}

export default DashboardPage;
