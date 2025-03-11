// import prisma from "@/lib/prisma";
// import { currentUser } from "@clerk/nextjs/server";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

// export async function GET(request: Request) {
//   const user = await currentUser();

//   if (!user) {
//     redirect("/sign-in");
//   }

//   let userSettings = await prisma.userSettings.findUnique({
//     where: {
//       userId: user.id,
//     },
//   });

//   if (!userSettings) {
//     userSettings = await prisma.userSettings.create({
//       data: {
//         userId: user.id,
//         currency: "USD",
//       },
//     });
//   }

//   // Revalidate the home page that uses the user currency
//   revalidatePath("/");
//   return Response.json(userSettings);
// }
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  try {
    // Use upsert instead of findUnique + create
    const userSettings = await prisma.userSettings.upsert({
      where: {
        userId: user.id,
      },
      update: {}, // No update needed, just return existing record
      create: {
        userId: user.id,
        currency: "USD",
      },
    });

    // Only revalidate when needed, not on every GET request
    // revalidatePath("/");

    return Response.json(userSettings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return Response.json(
      { message: "Failed to fetch user settings" },
      { status: 500 }
    );
  }
}
