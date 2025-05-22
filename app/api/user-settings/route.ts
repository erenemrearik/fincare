import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function GET(requset: Request) {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    let userSettings = await prisma.userSettings.findUnique({
        where: {
            userId: user.id
        }
    });

    if (!userSettings) {
        userSettings = await prisma.userSettings.create({
            data: {
                userId: user.id,
                currency: "USD"
            }
        })
    }

    revalidatePath("/");

    return Response.json(userSettings);
}