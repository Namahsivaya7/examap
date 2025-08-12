import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export interface ExamRequestParams {
  params: { examId: string; questionId: string };
}

export async function GET(request: NextRequest, { params }: ExamRequestParams) {
  const examId = params.examId;
  const exam = await prisma.question.findUnique({
    where: {
      id: params.questionId,
    },
    include: {
      subject: true,
      user: true,
      exams: {
        where: {
          id: examId,
        },
      },
    },
  });

  return NextResponse.json(exam);
}

export async function PUT(request: Request, { params }: ExamRequestParams) {
  const session = await getServerSession(authOptions);
  const update = await request.json();
  const { userId, subjectId, examId, ...rest } = update;
  const data = { ...rest };

  const questionOpt = await prisma.question.findUnique({
    where: {
      id: params.questionId,
      examIds: {
        has: params.examId,
      },
    },
  });

  if (!questionOpt || questionOpt.userId !== userId) {
    return NextResponse.json(
      { error: "Unauthorised operation" },
      { status: 401 }
    );
  }

  const attemptOpt = await prisma.attempt.findFirst({
    where: {
      examId: {
        in: questionOpt.examIds,
      },
    },
  });

  if (attemptOpt) {
    return NextResponse.json(
      { error: "Question with a response cannot be modified" },
      { status: 403 }
    );
  }

  if (subjectId) {
    // Update subject
    data.subject = {
      connect: {
        id: subjectId,
      },
    };
  }

  const question = await prisma.question.update({
    data,
    where: {
      id: params.questionId,
      userId: session?.user.id,
    },
  });

  return NextResponse.json(question);
}

export async function DELETE(request: Request, { params }: ExamRequestParams) {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;

  const examOpt = await prisma.exam.findUnique({
    where: {
      id: params.examId,
      questionIds: {
        has: params.questionId,
      },
    },
  });

  if (!examOpt || examOpt.ownerId !== userId) {
    return NextResponse.json(
      { error: "Unauthorised operation" },
      { status: 401 }
    );
  }

  const attemptOpt = await prisma.attempt.findFirst({
    where: {
      examId: params.examId,
    },
  });

  if (attemptOpt) {
    return NextResponse.json(
      { error: "Exam/Question with a response cannot be modified" },
      { status: 403 }
    );
  }

  const question = await prisma.question.update({
    data: {
      exams: {
        disconnect: {
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
