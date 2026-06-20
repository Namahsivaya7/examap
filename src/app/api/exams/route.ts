import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { isAdminEmail } from "@/utils/admin";
import { ExamStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const status = request.nextUrl.searchParams.get("status") ?? undefined;
  const tags = request.nextUrl.searchParams.getAll("tag") ?? [];
  const q = request.nextUrl.searchParams.get("q") ?? "";
  let tagsQuery = {};
  if (Array.isArray(tags) && tags.length > 0) {
    tagsQuery = {
      tags: {
        hasSome: tags,
      },
    };
  }
  const exams = await prisma.exam.findMany({
    where: {
      OR: [
        {
          status: ExamStatus.Published,
        },
        {
          ownerId: session?.user.id,
          status: Array.isArray(status)
            ? {
                in: status,
              }
            : (status as ExamStatus),
        },
      ],
      title: {
        contains: q,
        mode: "insensitive",
      },
      ...tagsQuery,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      subject: true,
      owner: true,
    },
  });

  return NextResponse.json(exams);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const data = await request.json();
  const { subjectId, ownerId, ...rest } = data;
  const exam = await prisma.exam.create({
    data: {
      ...rest,
      subject: {
        connect: {
          id: subjectId,
        },
      },
      owner: {
        connect: {
          id: ownerId,
        },
      },
    },
    include: {
      subject: true,
    },
  });

  return NextResponse.json(exam);
}
