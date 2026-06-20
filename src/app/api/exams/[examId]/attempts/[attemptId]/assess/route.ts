import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { isAdminEmail } from "@/utils/admin";
import {
  AnswerType,
  AttemptStatus,
  ExamResult,
  Prisma,
  ResultStatus,
} from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ExamType } from "../../../../../../../../types/prisma";

export interface AttemptRequestParams {
  params: { examId: string; attemptId: string };
}

const calculateResult = (
  examOpt: ExamType,
  assessment: any
): Prisma.JsonObject => {
  const result: ExamResult = {
    status: ResultStatus.Failed,
    score: 0,
    total: 0,
    each: assessment,
  };

  examOpt.questions.forEach(({ id, marks = 1 }) => {
    result.total += marks;
    if (!isNaN(assessment[id])) {
      result.score += assessment[id];
    }
  });

  if (result.score >= (examOpt.benchmark / 100) * result.total) {
    result.status = ResultStatus.Passed;
  }

  return result as Prisma.JsonObject;
};

/**
 * To submit the exam where we calculate the result
 */
export async function PATCH(
  request: Request,
  { params }: AttemptRequestParams
) {
  const session = await getServerSession(authOptions);
  const update = await request.json();
  const { assessment } = update;

  const attemptOpt = await prisma.attempt.findUnique({
    where: { id: params.attemptId, examId: params.examId },
    include: {
      test: true,
    },
  });

  if (!attemptOpt?.result) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  const examOpt = await prisma.exam.findUnique({
    where: { id: params.examId },
    include: { questions: true },
  });

  if (!examOpt?.manualAssess) {
    return NextResponse.json(
      { error: "Exam doesn't need manual evaluation." },
      { status: 400 }
    );
  }

  const isOwner = session?.user.id === examOpt?.ownerId;
  const isAdmin = isAdminEmail(session?.user?.email);
  const isTestOwner =
    !!attemptOpt.test && session?.user.id === attemptOpt.test?.ownerId;

  if (!isOwner && !isAdmin && !isTestOwner) {
    return NextResponse.json(
      { error: "User doesn't have previlage." },
      { status: 403 }
    );
  }

  const finalAssessment = {
    ...((attemptOpt.result?.each ?? {}) as JsonObject),
    ...assessment,
  };

  const result = calculateResult(examOpt as ExamType, finalAssessment);

  const attempt = await prisma.attempt.update({
    data: {
      result,
      status: AttemptStatus.Assessed,
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
