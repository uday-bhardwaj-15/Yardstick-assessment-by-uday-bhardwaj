// import prisma from "@/lib/prisma";
// import { currentUser } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";
// import { z } from "zod";

// export async function GET(request: Request) {
//   const user = await currentUser();
//   if (!user) {
//     redirect("/sign-in");
//   }

//   const { searchParams } = new URL(request.url);
//   const paramType = searchParams.get("type");

//   const validator = z.enum(["expense", "income"]).nullable();

//   const queryParams = validator.safeParse(paramType);
//   if (!queryParams.success) {
//     return Response.json(queryParams.error, {
//       status: 400,
//     });
//   }

//   const type = queryParams.data;
//   const categories = await prisma.category.findMany({
//     where: {
//       userId: user.id,
//       ...(type && { type }), // include type in the filters if it's defined
//     },
//     orderBy: {
//       name: "asc",
//     },
//   });

//   return Response.json(categories);
// }
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    const { searchParams } = new URL(request.url);
    const paramType = searchParams.get("type");

    const validator = z.enum(["expense", "income"]).nullable();

    const queryParams = validator.safeParse(paramType);
    if (!queryParams.success) {
      return Response.json(queryParams.error, {
        status: 400,
      });
    }

    const type = queryParams.data;
    const categories = await prisma.category.findMany({
      where: {
        userId: user.id,
        ...(type && { type }), // include type in the filters if it's defined
      },
      orderBy: {
        name: "asc",
      },
      // Only select fields that are actually needed
      select: {
        id: true,
        name: true,
        type: true,
        icon: true,
        // Add other fields you need, but avoid selecting everything if possible
      },
    });

    return Response.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
