import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { isAdminEmail } from "@/utils/admin";
import { Exam, ExamStatus } from "@prisma/client";
import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export interface ExamRequestParams {
  params: { examId: string };
}

export async function GET(request: NextRequest, { params }: ExamRequestParams) {
  const session = await getServerSession(authOptions);
  const examId = params.examId;
  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
    include: {
      subject: true,
      owner: true,
      questions: true,
    },
  });

  if (
    ExamStatus.Draft === exam?.status ||
    ExamStatus.Archived === exam?.status
  ) {
    if (session?.user.id && session?.user.id !== exam.ownerId) {
      return NextResponse.json(
        {
          error: `Exam is not available at the moment, reach out to the creator ${exam.owner.name}`,
        },
        { status: 403 }
      );
    }
  }

  return NextResponse.json(exam);
}

export async function PUT(request: Request, { params }: ExamRequestParams) {
  const session = await getServerSession(authOptions);

  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const examId = params.examId;
  const update = await request.json();
  const { ownerId, subjectId, ...rest } = update;
  const data = { ...rest };

  const examOpt = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
  });

  if (!examOpt) {
    return NextResponse.json(
      {
        error: "Exam not found.",
      },
      { status: 404 }
    );
  }

  if (subjectId != null) {
    data.subject = {
      connect: {
        id: subjectId,
      },
    };
  }

  if (ownerId != null) {
    data.owner = {
      connect: {
        id: ownerId,
      },
    };
  }

  const exam = await prisma.exam.update({
    data,
    where: {
      id: examId,
    },
  });

  return NextResponse.json(exam);
}
