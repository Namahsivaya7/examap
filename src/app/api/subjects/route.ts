import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  //const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const subjects = await prisma.subject.findMany({
    where: {
      name: {
        contains: q,
        mode: "insensitive",
      },
    },
  });

  return NextResponse.json(subjects);
}

export async function POST(request: Request) {
  //const session = await getServerSession(authOptions);
  try {
    const data = await request.json();
    const subject = await prisma.subject.create({
      data,
    });

    return NextResponse.json(subject);
  } catch (err) {
    return NextResponse.json(
      { error: "Subject already exists" },
      { status: 400 }
    );
  }
}
