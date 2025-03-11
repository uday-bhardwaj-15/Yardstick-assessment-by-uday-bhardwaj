// import prisma from "@/lib/prisma";
// import { Period, Timeframe } from "@/lib/types";
// import { currentUser } from "@clerk/nextjs/server";
// import { getDaysInMonth } from "date-fns";
// import { redirect } from "next/navigation";
// import { z } from "zod";

// const getHistoryDataSchema = z.object({
//   timeframe: z.enum(["month", "year"]),
//   month: z.coerce.number().min(0).max(11).default(0),
//   year: z.coerce.number().min(2000).max(3000),
// });

// export async function GET(request: Request) {
//   const user = await currentUser();
//   if (!user) {
//     redirect("/sign-in");
//   }

//   const { searchParams } = new URL(request.url);
//   const timeframe = searchParams.get("timeframe");
//   const year = searchParams.get("year");
//   const month = searchParams.get("month");

//   const queryParams = getHistoryDataSchema.safeParse({
//     timeframe,
//     month,
//     year,
//   });

//   if (!queryParams.success) {
//     return Response.json(queryParams.error.message, {
//       status: 400,
//     });
//   }

//   const data = await getHistoryData(user.id, queryParams.data.timeframe, {
//     month: queryParams.data.month,
//     year: queryParams.data.year,
//   });

//   return Response.json(data);
// }

// export type GetHistoryDataResponseType = Awaited<
//   ReturnType<typeof getHistoryData>
// >;

// async function getHistoryData(
//   userId: string,
//   timeframe: Timeframe,
//   period: Period
// ) {
//   switch (timeframe) {
//     case "year":
//       return await getYearHistoryData(userId, period.year);
//     case "month":
//       return await getMonthHistoryData(userId, period.year, period.month);
//   }
// }

// type HistoryData = {
//   expense: number;
//   income: number;
//   year: number;
//   month: number;
//   day?: number;
// };

// async function getYearHistoryData(userId: string, year: number) {
//   const result = await prisma.yearHistory.groupBy({
//     by: ["month"],
//     where: {
//       userId,
//       year,
//     },
//     _sum: {
//       expense: true,
//       income: true,
//     },
//     orderBy: [
//       {
//         month: "asc",
//       },
//     ],
//   });

//   if (!result || result.length === 0) return [];

//   const history: HistoryData[] = [];

//   for (let i = 0; i < 12; i++) {
//     let expense = 0;
//     let income = 0;

//     const month = result.find((row) => row.month === i);
//     if (month) {
//       expense = month._sum.expense || 0;
//       income = month._sum.income || 0;
//     }

//     history.push({
//       year,
//       month: i,
//       expense,
//       income,
//     });
//   }

//   return history;
// }

// async function getMonthHistoryData(
//   userId: string,
//   year: number,
//   month: number
// ) {
//   const result = await prisma.monthHistory.groupBy({
//     by: ["day"],
//     where: {
//       userId,
//       year,
//       month,
//     },
//     _sum: {
//       expense: true,
//       income: true,
//     },
//     orderBy: [
//       {
//         day: "asc",
//       },
//     ],
//   });

//   if (!result || result.length === 0) return [];

//   const history: HistoryData[] = [];
//   const daysInMonth = getDaysInMonth(new Date(year, month));
//   for (let i = 1; i <= daysInMonth; i++) {
//     let expense = 0;
//     let income = 0;

//     const day = result.find((row) => row.day === i);
//     if (day) {
//       expense = day._sum.expense || 0;
//       income = day._sum.income || 0;
//     }

//     history.push({
//       expense,
//       income,
//       year,
//       month,
//       day: i,
//     });
//   }

//   return history;
// }

import prisma from "@/lib/prisma";
import { Period, Timeframe } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import { z } from "zod";

const getHistoryDataSchema = z.object({
  timeframe: z.enum(["month", "year"]),
  month: z.coerce.number().min(0).max(11).default(0),
  year: z.coerce.number().min(2000).max(3000),
});

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  const queryParams = getHistoryDataSchema.safeParse({
    timeframe,
    month,
    year,
  });

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  try {
    const data = await getHistoryData(user.id, queryParams.data.timeframe, {
      month: queryParams.data.month,
      year: queryParams.data.year,
    });

    return Response.json(data);
  } catch (error) {
    console.error("History data fetch error:", error);
    return Response.json(
      { message: "Failed to fetch history data" },
      { status: 500 }
    );
  }
}

export type GetHistoryDataResponseType = Awaited<
  ReturnType<typeof getHistoryData>
>;

async function getHistoryData(
  userId: string,
  timeframe: Timeframe,
  period: Period
) {
  switch (timeframe) {
    case "year":
      return await getYearHistoryData(userId, period.year);
    case "month":
      return await getMonthHistoryData(userId, period.year, period.month);
  }
}

type HistoryData = {
  expense: number;
  income: number;
  year: number;
  month: number;
  day?: number;
};

async function getYearHistoryData(userId: string, year: number) {
  // Create a base array of months with zero values
  const baseHistory = Array.from({ length: 12 }, (_, i) => ({
    year,
    month: i,
    expense: 0,
    income: 0,
  }));

  // Fetch only the months that have data (more efficient query)
  const result = await prisma.yearHistory.groupBy({
    by: ["month"],
    where: {
      userId,
      year,
    },
    _sum: {
      expense: true,
      income: true,
    },
  });

  // If no data found, return the empty base array
  if (!result || result.length === 0) return baseHistory;

  // Update only the months that have data
  for (const monthData of result) {
    const monthIndex = monthData.month;
    if (monthIndex >= 0 && monthIndex < 12) {
      baseHistory[monthIndex].expense = monthData._sum.expense || 0;
      baseHistory[monthIndex].income = monthData._sum.income || 0;
    }
  }

  return baseHistory;
}

async function getMonthHistoryData(
  userId: string,
  year: number,
  month: number
) {
  const daysInMonth = getDaysInMonth(new Date(year, month));

  // Create a base array with all days and zero values
  const baseHistory = Array.from({ length: daysInMonth }, (_, i) => ({
    year,
    month,
    day: i + 1,
    expense: 0,
    income: 0,
  }));

  // Fetch only days that have data
  const result = await prisma.monthHistory.groupBy({
    by: ["day"],
    where: {
      userId,
      year,
      month,
    },
    _sum: {
      expense: true,
      income: true,
    },
  });

  // If no data found, return the empty base array
  if (!result || result.length === 0) return baseHistory;

  // Update only the days that have data
  for (const dayData of result) {
    const dayIndex = dayData.day - 1; // Adjust for 0-based array
    if (dayIndex >= 0 && dayIndex < daysInMonth) {
      baseHistory[dayIndex].expense = dayData._sum.expense || 0;
      baseHistory[dayIndex].income = dayData._sum.income || 0;
    }
  }

  return baseHistory;
}
