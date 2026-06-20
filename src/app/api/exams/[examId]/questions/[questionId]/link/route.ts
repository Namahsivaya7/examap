import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { isAdminEmail } from "@/utils/admin";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ExamRequestParams } from "../route";

export async function PATCH(request: Request, { params }: ExamRequestParams) {
  const session = await getServerSession(authOptions);

  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const examOpt = await prisma.exam.findUnique({
    where: {
      id: params.examId,
      NOT: {
        questionIds: {
          has: params.questionId,
        },
      },
    },
  });

  if (!examOpt) {
    return NextResponse.json(
      { error: "Unauthorised operation" },
      { status: 401 }
    );
  }

  const question = await prisma.question.update({
    data: {
      exams: {
        connect: {
          id: params.examId,
        },
      },
    },
    where: {
      id: params.questionId,
    },
  });

  return NextResponse.json(question);
}
