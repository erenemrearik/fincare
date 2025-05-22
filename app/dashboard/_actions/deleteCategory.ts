"use server";

import prisma from "@/lib/db";
import { DeleteCategorySchema, DeleteCategorySchemaType } from "@/schema/categories";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function DeleteCategory(categoryData: DeleteCategorySchemaType) {
    const parsedBody = DeleteCategorySchema.safeParse(categoryData);
    if (!parsedBody.success) {
        throw new Error("bad request");
    }

    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const { name, type } = parsedBody.data;

    try {
        const res = await prisma.category.delete({
            where: {
                name_type_userId: {
                    name,
                    type,
                    userId: user.id
                }
            },
        });
        return res;
    } catch (error) {
        throw new Error("db updation error");
    }
}