import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

declare module "jsonwebtoken" {
  export interface JwtPayload {
    email: string;
  }
}

export async function PATCH(request: Request) {
  const update = await request.json();
  const { password, token } = update;

  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: "Not a strong password" },
      { status: 417 }
    );
  }

  try {
    const decoded = <JwtPayload>(
      jwt.verify(token, process.env.NEXTAUTH_SECRET ?? "")
    );

    const userOpt = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!userOpt) {
      return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const user = await prisma.user.update({
      data: {
        password: hashedPassword,
      },
      where: {
        id: userOpt.id,
      },
    });

    if (user.password === hashedPassword) {
      return NextResponse.json("Password updated");
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        error: (err.name = "TokenExpiredError"
          ? "Reset password link expired, try forget password again?"
          : "Failed to update the password"),
      },
      { status: 400 }
    );
  }
}
