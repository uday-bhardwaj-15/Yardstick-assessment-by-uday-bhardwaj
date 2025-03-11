// import { GetFormatterForCurrency } from "@/lib/helpers";
// import prisma from "@/lib/prisma";
// import { OverviewQuerySchema } from "@/schema/overview";
// import { currentUser } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";

// export async function GET(request: Request) {
//   const user = await currentUser();
//   if (!user) {
//     redirect("/sign-in");
//   }

//   const { searchParams } = new URL(request.url);
//   const from = searchParams.get("from");
//   const to = searchParams.get("to");

//   const queryParams = OverviewQuerySchema.safeParse({
//     from,
//     to,
//   });

//   if (!queryParams.success) {
//     return Response.json(queryParams.error.message, {
//       status: 400,
//     });
//   }

//   const transactions = await getTransactionsHistory(
//     user.id,
//     queryParams.data.from,
//     queryParams.data.to
//   );

//   return Response.json(transactions);
// }

// export type GetTransactionHistoryResponseType = Awaited<
//   ReturnType<typeof getTransactionsHistory>
// >;

// async function getTransactionsHistory(userId: string, from: Date, to: Date) {
//   const userSettings = await prisma.userSettings.findUnique({
//     where: {
//       userId,
//     },
//   });
//   if (!userSettings) {
//     throw new Error("user settings not found");
//   }

//   const formatter = GetFormatterForCurrency(userSettings.currency);

//   const transactions = await prisma.transaction.findMany({
//     where: {
//       userId,
//       date: {
//         gte: from,
//         lte: to,
//       },
//     },
//     orderBy: {
//       date: "desc",
//     },
//   });

//   return transactions.map((transaction) => ({
//     ...transaction,
//     // lets format the amount with the user currency
//     formattedAmount: formatter.format(transaction.amount),
//   }));
// }
import { GetFormatterForCurrency } from "@/lib/helpers";
import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const queryParams = OverviewQuerySchema.safeParse({
      from,
      to,
    });

    if (!queryParams.success) {
      return Response.json(queryParams.error.message, {
        status: 400,
      });
    }

    const transactions = await getTransactionsHistory(
      user.id,
      queryParams.data.from,
      queryParams.data.to
    );

    return Response.json(transactions);
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return Response.json(
      { message: "Failed to fetch transaction history" },
      { status: 500 }
    );
  }
}

export type GetTransactionHistoryResponseType = Awaited<
  ReturnType<typeof getTransactionsHistory>
>;

async function getTransactionsHistory(userId: string, from: Date, to: Date) {
  // Execute both queries in parallel for better performance
  const [userSettings, transactions] = await Promise.all([
    prisma.userSettings.findUnique({
      where: {
        userId,
      },
      select: {
        currency: true, // Only select the needed field
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: from,
          lte: to,
        },
      },
      orderBy: {
        date: "desc",
      },
    }),
  ]);

  if (!userSettings) {
    throw new Error("User settings not found");
  }

  const formatter = GetFormatterForCurrency(userSettings.currency);

  // Process in batches to avoid memory issues with large datasets
  const batchSize = 100;
  const formattedTransactions = [];

  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize).map((transaction) => ({
      ...transaction,
      formattedAmount: formatter.format(transaction.amount),
    }));

    formattedTransactions.push(...batch);
  }

  return formattedTransactions;
}
