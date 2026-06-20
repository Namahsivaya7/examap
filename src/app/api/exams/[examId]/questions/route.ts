import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { isAdminEmail } from "@/utils/admin";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ExamRequestParams } from "../route";

//
export async function GET(request: Request, { params }: ExamRequestParams) {
  //const session = await getServerSession(authOptions);
  // TODO: filters and pagination
  const examId = params.examId;
  const questions = await prisma.question.findMany({
    where: {
      examIds: {
        hasSome: [examId],
      },
    },
  });

  return NextResponse.json(questions);
}

export async function POST(request: Request, { params }: ExamRequestParams) {
  const session = await getServerSession(authOptions);

  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const data = await request.json();
  const { examId, userId, subjectId, ...rest } = data;

  const examOpt = await prisma.exam.findUnique({
    where: { id: params.examId },
  });

  if (params.examId !== examOpt?.id) {
    return NextResponse.json(
      { error: "Mismatch in examIds!" },
      { status: 417 }
    );
  }

  const question = await prisma.question.create({
    data: {
      ...rest,
      user: {
        connect: {
          id: userId,
        },
      },
      subject: {
        connect: {
          id: subjectId,
        },
      },
      exams: {
        connect: {
          id: examId,
        },
      },
    },
    include: {
      user: true,
      subject: true,
    },
  });

  return NextResponse.json(question);
}
