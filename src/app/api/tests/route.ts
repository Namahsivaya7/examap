import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  //const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const tests = await prisma.test.findMany({
    where: {
      name: {
        contains: q,
        mode: "insensitive",
      },
    },
  });

  return NextResponse.json(tests);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const data = await request.json();
  const { name, examId } = data;
  const test = await prisma.test.create({
    data: {
      name,
      owner: {
        connect: {
          id: session?.user.id,
        },
      },
      exam: {
        connect: {
          id: examId,
        },
      },
    },
  });

  return NextResponse.json(test);
}
