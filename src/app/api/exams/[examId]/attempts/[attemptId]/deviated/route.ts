import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { AttemptStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export interface AttemptRequestParams {
  params: { examId: string; attemptId: string };
}

/**
 * To update deviated count
 * @param request
 * @param param1
 * @returns
 */
export async function PATCH(
  request: Request,
  { params }: AttemptRequestParams
) {
  const session = await getServerSession(authOptions);

  const attemptOpt = await prisma.attempt.findUnique({
    where: { id: params.attemptId, examId: params.examId },
  });

  if (params.examId !== attemptOpt?.examId) {
    return NextResponse.json({ error: "Mismatch in exams!" }, { status: 417 });
  }

  if (session?.user.id !== attemptOpt?.userId) {
    return NextResponse.json(
      { error: "Unauthorised operation" },
      { status: 401 }
    );
  }

  const attempt = await prisma.attempt.update({
    data: {
      deviatedCount: {
        increment: 1,
      },
    },
    where: {
      id: params.attemptId,
    },
  });

  return NextResponse.json(attempt);
}
