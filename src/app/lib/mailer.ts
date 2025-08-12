import { appName } from "@/utils/config";
import nodemailer from "nodemailer";

console.log("ENV", process.env);

const mailer = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  secure: true,
  port: Number(process.env.EMAIL_PORT) || 465,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

mailer.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

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
