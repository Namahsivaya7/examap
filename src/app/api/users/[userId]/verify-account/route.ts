import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import { appName, siteAddress } from "@/utils/config";
import { sendEmailToUser } from "@/app/lib/mailer";

export interface UserRequestParams {
  params: { userId: string };
}

export async function POST(request: Request, { params }: UserRequestParams) {
  const session = await getServerSession(authOptions);

  const userOpt = await prisma.user.findUnique({
    where: { id: params.userId },
  });

  if (session?.user.id !== userOpt?.id) {
    return NextResponse.json(
      { error: "Unauthorised operation" },
      { status: 401 }
    );
  }

  if (!userOpt?.email) {
    return NextResponse.json(
      { error: "Registered email not found" },
      { status: 404 }
    );
  }

  const token = jwt.sign(
    {
      email: userOpt.email,
    },
    process.env.NEXTAUTH_SECRET ?? "",
    { expiresIn: "1h" }
  );

  const emailHTML = `
    <p>Hi ${userOpt.name},</p>
    
    <p>Please click the below link to verify your account, links expires with in an hour.</p>

    <button><a href="${siteAddress}/api/auth/verify-account/${token}">Verify Account</a></button>

    <p>If you're not able to click the link, copy the below URL into your browser to verify your account.</p>

    <p>${siteAddress}/api/auth/verify-account/${token}</p>


    <p>Regards</p>
    <p>${appName}</p>
  `;

  const emailText = `
    Hi ${userOpt.name},
    
    Please open the following URL into your browser to verify your account. ${siteAddress}/api/auth/verify-account/${token}

    Regards
    ${appName}
  `;

  try {
    const emailSent = await sendEmailToUser(
      userOpt.email,
      emailHTML,
      emailText
    );
    return NextResponse.json("Sent verification link to registered email.");
  } catch (e) {
    return NextResponse.json("Failed to sent verification email", {
      status: 400,
    });
  }
}
