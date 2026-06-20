import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export interface UserRequestParams {
  params: { userId: string };
}

export async function GET(request: NextRequest, { params }: UserRequestParams) {
  const { searchParams } = request.nextUrl;
  const exams = searchParams.get("exams");
  const attempts = searchParams.get("attempts");
  const questions = searchParams.get("questions");
  const tests = searchParams.get("tests");
  const user = await prisma.user.findUnique({
    where: {
      id: params.userId,
    },
    include: {
      exams:
        exams === "true"
          ? {
              include: {
                subject: true,
              },
            }
          : false,
      attempts:
        attempts === "true"
          ? {
              include: {
                exam: {
                  include: {
                    subject: true,
                  },
                },
              },
            }
          : false,
      questions:
        questions === "true"
          ? {
              include: {
                subject: true,
              },
            }
          : false,
      tests:
        tests === "true"
          ? {
              include: {
                exam: true,
              },
            }
          : false,
    },
  });

  if (user) {
    const { password: _, ...userSecure } = user;
    return NextResponse.json(userSecure);
  }

  return NextResponse.json(null);
}

export async function PUT(request: Request, { params }: UserRequestParams) {
  const session = await getServerSession(authOptions);
  const update = await request.json();
  const { userId, subjectId, password, email, ...rest } = update;
  const data = { ...rest };
  if (password != null) {
    const hashedPassword = await bcrypt.hash(password, 5);
    data.password = hashedPassword;
  }

  const userOpt = await prisma.user.findUnique({
    where: { id: params.userId },
  });

  if (session?.user.id !== userOpt?.id) {
    return NextResponse.json(
      { error: "Unauthorised operation" },
      { status: 401 }
    );
  }

  if (email && email !== userOpt?.email) {
    data.email = email;
    data.emailVerified = false;
  }

  const user = await prisma.user.update({
    data,
    where: {
      id: params.userId,
    },
  });

  const { password: _, ...userSecure } = user;

  return NextResponse.json(userSecure);
}
