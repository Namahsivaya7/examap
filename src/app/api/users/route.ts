import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const users = await prisma.user.findMany({
    where: {
      name: {
        contains: q,
        mode: "insensitive",
      },
    },
  });

  const usersSecure = users.map((user) => {
    const { password: _, ...userSecure } = user;
    return userSecure;
  });

  return NextResponse.json(usersSecure);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const data = await request.json();
  const user = await prisma.user.create({
    data,
  });

  const { password: _, ...userSecure } = user;

  return NextResponse.json(userSecure);
}
