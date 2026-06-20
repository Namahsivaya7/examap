import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { isAdminEmail } from "@/utils/admin";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ExamRequestParams } from "../route";
import { AttemptStatus, ExamStatus } from "@prisma/client";
import { minutesToMillis } from "@/utils/util";

//
export async function GET(request: NextRequest, { params }: ExamRequestParams) {
  const session = await getServerSession(authOptions);
  // TODO: filters and pagination
  const examId = params.examId;
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("user") ?? undefined;
  const testId = searchParams.get("testId") ?? undefined;
  if (!userId) {
    const exam = await prisma.exam.findUnique({
      where: {
        id: examId,
      },
    });
    const isOwner = exam?.ownerId === session?.user.id;
    const isAdmin = isAdminEmail(session?.user?.email);
    if (!exam || (!isOwner && !isAdmin)) {
      return NextResponse.json(
        { error: "Not allowed to see this result." },
        { status: 403 }
      );
    }
  }
  const attempts = await prisma.attempt.findMany({
    where: {
      examId,
      ...(userId ? { userId } : {}),
      ...(testId ? { testId } : {}),
    },
    include: {
      user: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json(attempts);
}

export async function POST(request: Request, { params }: ExamRequestParams) {
  const session = await getServerSession(authOptions);
  const data = await request.json();
  const { examId, userId, testId, ...rest } = data;

  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
  });

  if (params.examId !== examId || !exam) {
    return NextResponse.json({ error: "Exam not found!" }, { status: 417 });
  }

  const existingAttempt = await prisma.attempt.findFirst({
    where: {
      userId: userId,
      examId: examId,
      status: {
        in: [AttemptStatus.Created, AttemptStatus.InProgress],
      },
      OR: [
        {
          startTime: null,
        },
        {
          startTime: {
            gt: new Date(Date.now() - minutesToMillis(exam?.timer)),
          },
        },
      ],
    },
    include: {
      user: true,
      exam: true,
      test: true,
    },
  });

  if (existingAttempt != null) {
    return NextResponse.json(existingAttempt);
  }

  const attempt = await prisma.attempt.create({
    data: {
      ...rest,
      user: {
        connect: {
          id: userId,
        },
      },
      exam: {
        connect: {
          id: examId,
        },
      },
      ...(testId
        ? {
            test: {
              connect: {
                id: testId,
              },
            },
          }
        : {}),
    },
    include: {
      user: true,
      exam: true,
      test: true,
    },
  });

  if (attempt?.examId && exam.status !== ExamStatus.Draft) {
    await prisma.exam.update({
      data: {
        attempt_count: {
          increment: 1,
        },
      },
      where: {
        id: attempt.examId,
      },
    });
  }

  return NextResponse.json(attempt);
}
