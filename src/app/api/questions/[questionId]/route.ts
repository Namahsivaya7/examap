import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export interface QuestionRequestParams {
  params: { questionId: string };
}

export async function GET(
  request: NextRequest,
  { params }: QuestionRequestParams
) {
  const question = await prisma.question.findUnique({
    where: {
      id: params.questionId,
    },
    include: {
      subject: true,
      user: true,
      exams: true,
    },
  });

  return NextResponse.json(question);
}

export async function PUT(request: Request, { params }: QuestionRequestParams) {
  const session = await getServerSession(authOptions);
  const update = await request.json();
  const { userId, subjectId, ...rest } = update;
  const data = { ...rest };

  const questionOpt = await prisma.question.findUnique({
    where: { id: params.questionId },
  });

  if (session?.user.id !== questionOpt?.userId) {
    return NextResponse.json(
      { error: "Unauthorised operation" },
      { status: 401 }
    );
  }

  if (subjectId != null) {
    data.subject = {
      connect: {
        id: subjectId,
      },
    };
  }

  if (userId != null) {
    data.user = {
      connect: {
        id: userId,
      },
    };
  }

  const question = await prisma.question.update({
    data,
    where: {
      id: params.questionId,
    },
  });

  return NextResponse.json(question);
}
