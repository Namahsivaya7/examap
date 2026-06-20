import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { siteAddress } from "@/utils/config";

declare module "jsonwebtoken" {
  export interface JwtPayload {
    email: string;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token;

  if (!token) {
    return NextResponse.json({ error: "Token not found." }, { status: 404 });
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

    const user = await prisma.user.update({
      data: {
        emailVerified: true,
      },
      where: {
        id: userOpt.id,
      },
    });

    if (user.emailVerified) {
      return NextResponse.redirect(`${siteAddress}/signin?emailVerified=1`);
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        error: (err.name = "TokenExpiredError"
          ? "Reset password link expired, try verification again?"
          : "Failed to verify the password"),
      },
      { status: 400 }
    );
  }
}
