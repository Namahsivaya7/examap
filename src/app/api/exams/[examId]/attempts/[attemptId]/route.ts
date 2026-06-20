import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { isAdminEmail } from "@/utils/admin";
import { AttemptStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export interface AttemptRequestParams {
  params: { examId: string; attemptId: string };
}

export async function GET(request: Request, { params }: AttemptRequestParams) {
  const session = await getServerSession(authOptions);
  const examId = params.examId;
  const attempt = await prisma.attempt.findUnique({
    where: {
      id: params.attemptId,
      examId: examId,
    },
    include: {
      user: true,
      exam: {
        include: {
          subject: true,
          questions: true,
        },
      },
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  const isOwner = attempt.userId === session?.user.id;
  const isExamOwner = attempt.exam.ownerId === session?.user.id;
  const isAdmin = isAdminEmail(session?.user?.email);

  if (!isOwner && !isExamOwner && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json(attempt);
}

export async function DELETE(
  request: Request,
  { params }: AttemptRequestParams
) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorised!" }, { status: 401 });
  }

  const examId = params.examId;

  const attemptOpt = await prisma.attempt.findUnique({
    where: {
      id: params.attemptId,
      examId: examId,
    },
    include: {
      exam: true,
      test: true,
    },
  });

  if (
    attemptOpt &&
    (attemptOpt.userId === session?.user.id ||
      attemptOpt?.exam.ownerId === session?.user.id ||
      attemptOpt?.test?.ownerId === session?.user.id)
  ) {
    if (
      attemptOpt.status !== AttemptStatus.Assessed &&
      attemptOpt.status !== AttemptStatus.InReview
    ) {
      const deletedAttempt = await prisma.attempt.delete({
        where: {
          id: params.attemptId,
          examId: examId,
          userId: session.user.id,
        },
      });

      return NextResponse.json(deletedAttempt);
    } else {
      return NextResponse.json(
        {
          error: "A submitted attempt cannot be deleted",
        },
        {
          status: 403,
        }
      );
    }
  } else {
    return NextResponse.json(
      {
        error: "Not authorised to delete the attempt",
      },
      {
        status: 403,
      }
    );
  }
}

/**
 * To update responses
 * @param request
 * @param param1
 * @returns
 */
export async function PUT(request: Request, { params }: AttemptRequestParams) {
  const session = await getServerSession(authOptions);
  const update = await request.json();
  const { responses } = update;

  const examOpt = await prisma.exam.findUnique({
    where: { id: params.examId },
    include: { questions: true },
  });

  const attemptOpt = await prisma.attempt.findUnique({
    where: { id: params.attemptId },
  });

  if (params.examId !== examOpt?.id) {
    return NextResponse.json(
      { error: "Mismatch in examIds!" },
      { status: 417 }
    );
  }

  if (session?.user.id !== attemptOpt?.userId) {
    return NextResponse.json(
      { error: "Unauthorised operation" },
      { status: 403 }
    );
  }

  const attempt = await prisma.attempt.update({
    data: {
      responses,
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
