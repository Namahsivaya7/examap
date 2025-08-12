import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { AttemptStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export interface AttemptRequestParams {
  params: { examId: string; attemptId: string };
}

/**
 * To update starttime and status
 * @param request
 * @param param1
 * @returns
 */
export async function PATCH(
  request: Request,
  { params }: AttemptRequestParams
) {
  const session = await getServerSession(authOptions);
  const update = await request.json();
  const { startTime } = update;

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

  if (attemptOpt?.startTime != null) {
    return NextResponse.json(
      { error: "Exam already started" },
      { status: 417 }
    );
  }

  const attempt = await prisma.attempt.update({
    data: {
      startTime,
      status: AttemptStatus.InProgress,
    },
    where: {
      id: params.attemptId,
    },
    include: {
      user: true,
    },
  });

  return NextResponse.json(attempt);
}
