import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export interface ExamRequestParams {
  params: { testId: string };
}

export async function GET(request: NextRequest, { params }: ExamRequestParams) {
  const testId = params.testId;
  const test = await prisma.test.findUnique({
    where: {
      id: testId,
    },
    include: {
      owner: true,
    },
  });

  return NextResponse.json(test);
}
