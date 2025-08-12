import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
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
  responses: any
): Prisma.JsonObject => {
  const result: ExamResult = {
    status: ResultStatus.Failed,
    score: 0,
    total: 0,
    each: {},
  };

  const resultEach: Record<string, number> = {};

  examOpt.questions.forEach(
    ({ id, answer, options = [], marks = 1, answerType }) => {
      const response = responses?.[id] ?? [];
      let isCorrectAnswer = false;
      if (answerType === AnswerType.Essay) {
        if (examOpt.manualAssess) {
          return;
        }
        isCorrectAnswer = response.includes(answer ?? "");
      } else {
        const answers = options.filter((opt) => opt.isAnswer);
        if (
          response.length === answers.length &&
          answers.every((ansOpt) => response.includes(ansOpt.id))
        ) {
          isCorrectAnswer = true;
        }
      }
      resultEach[id] = isCorrectAnswer ? marks : 0;
      result.total += marks;
      if (isCorrectAnswer) {
        result.score += marks;
      }
    }
  );

  result.each = resultEach as JsonObject;

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
  const { responses } = update;

  const examOpt = await prisma.exam.findUnique({
    where: { id: params.examId },
    include: { questions: true },
  });

  const attemptOpt = await prisma.attempt.findUnique({
    where: { id: params.attemptId, examId: params.examId },
  });

  if (examOpt && params.examId !== attemptOpt?.examId) {
    return NextResponse.json({ error: "Mismatch in exams!" }, { status: 417 });
  }

  if (session?.user.id !== attemptOpt?.userId) {
    return NextResponse.json(
      { error: "Unauthorised operation" },
      { status: 401 }
    );
  }

  const result = calculateResult(examOpt as ExamType, responses);
  let status: AttemptStatus = AttemptStatus.InReview;

  if (!examOpt?.manualAssess) {
    status = AttemptStatus.Assessed;
  }

  const attempt = await prisma.attempt.update({
    data: {
      responses,
      result,
      status,
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
