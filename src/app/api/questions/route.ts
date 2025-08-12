import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

//
export async function GET(request: Request) {
  //const session = await getServerSession(authOptions);
  const questions = await prisma.question.findMany({});

  return NextResponse.json(questions);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const data = await request.json();
  const { userId, subjectId, ...rest } = data;

  if (session?.user.id !== userId) {
    return NextResponse.json(
      { error: "Unauthorised operation" },
      { status: 401 }
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
    },
    include: {
      user: true,
      subject: true,
    },
  });

  return NextResponse.json(question);
}
