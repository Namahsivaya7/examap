import prisma from "@/app/lib/prisma";
import { ExamStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { cache } from "react";

const getTrendingExams = cache(async () => {
  const exams = await prisma.exam.findMany({
    where: {
      status: ExamStatus.Published,
    },
    include: {
      owner: true,
    },
    take: 10, // TODO: add pagination later
    orderBy: {
      updatedAt: "desc",
    },
  });
  return exams;
});

export const revalidate = 3600; // revalidate the data at most every hour

/**
 * @param request
 * @returns
 */
export async function POST(request: NextRequest) {
  // TODO: trending logic?
  const trendingExams = await getTrendingExams();
  return NextResponse.json(trendingExams);
}
