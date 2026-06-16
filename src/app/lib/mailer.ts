import { appName } from "@/utils/config";
import nodemailer from "nodemailer";

const hasSmtpConfig = Boolean(
  process.env.EMAIL_HOST && process.env.EMAIL_ADDRESS && process.env.EMAIL_PASSWORD
);

const transportOptions: any = {
  host: process.env.EMAIL_HOST,
  secure: process.env.EMAIL_SECURE === "true" || true,
  port: Number(process.env.EMAIL_PORT) || 465,
};

if (hasSmtpConfig) {
  transportOptions.auth = {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  };
}

const mailer = nodemailer.createTransport(transportOptions);

if (hasSmtpConfig) {
  mailer.verify(function (error, success) {
    if (error) {
      console.warn("Mailer verify error:", error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });
} else {
  console.warn("Mailer not configured: EMAIL_HOST/EMAIL_ADDRESS/EMAIL_PASSWORD missing. Skipping verify.");
}

export const generateMailOptions = (
  to: string,
  subject: string,
  html?: string,
  text?: string
) => ({
  from: process.env.EMAIL_ADDRESS,
  to,
  subject,
  text,
  html,
});

export const sendEmailToUser = async (
  to: string,
  html: string,
  text?: string
) => {
  return new Promise((res, rej) => {
    mailer.sendMail(
      generateMailOptions(to, `${appName} | Reset Password`, html, text),
      (err, info) => {
        if (err) {
          rej(err);
          return;
        }
        if (info) {
          res(info);
        }
      }
    );
  });
};

export default mailer;
