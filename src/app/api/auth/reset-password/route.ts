import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { sendEmailToUser } from "@/app/lib/mailer";
import jwt from "jsonwebtoken";
import { appName, siteAddress } from "@/utils/config";

export interface UserRequestParams {
  params: { userId: string };
}

export async function POST(request: Request, { params }: UserRequestParams) {
  const body = await request.json();
  const { email } = body;

  const userOpt = await prisma.user.findUnique({
    where: { email },
  });

  if (!userOpt?.id) {
    return NextResponse.json(
      { error: "User with email not found." },
      { status: 404 }
    );
  }

  const token = jwt.sign(
    {
      email: email,
    },
    process.env.NEXTAUTH_SECRET ?? "",
    { expiresIn: "1h" }
  );

  const emailHTML = `
    <p>Hi ${userOpt.name},</p>
    
    <p>Please click the below link to reset your password, links expires with in an hour.</p>

    <button><a href="${siteAddress}/reset-password?token=${token}">Reset Password</a></button>

    <p>If you're not able to click the link, copy the below URL into your browser to reset your password.</p>

    <p>${siteAddress}/reset-password?token=${token}<p>


    <p>Regards</p>
    <p>${appName}</p>
  `;

  const emailText = `
    Hi ${userOpt.name},

    Please open the following link in your browser to reset your password. ${siteAddress}/reset-password/${token}


    Regards
    ${appName}
  `;

  try {
    const emailSent = await sendEmailToUser(email, emailHTML);
    return NextResponse.json(
      "Please follow instructions sent to your registered email."
    );
  } catch (e) {
    return NextResponse.json("Failed to sent reset password link.", {
      status: 400,
    });
  }
}
