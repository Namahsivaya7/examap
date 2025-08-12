import ExamDetails from "@/components/exam/ExamDetails";
import { ExamType } from "../../../../types/prisma";
import { Button, Skeleton, theme, Result } from "antd";
import { getExam } from "@/app/lib/api";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { Helmet } from "react-helmet";
import { appLogo, appName, siteAddress } from "@/utils/config";
import StartExam from "@/components/exam/StartExam";
import { Metadata, ResolvingMetadata } from "next";
import { PATHS } from "@/utils/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { ExamStatus } from "@prisma/client";

type Props = {
  params: { examId: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // fetch data
  const exam = await getExam(params.examId);

  if (!exam) {
    return {};
  }

  return {
    title: `${appName} | ${exam.title}`,
    description:
      "Welcome to our comprehensive online exam platform! Our user-friendly system simplifies exam creation for educators and seamless assessment-taking for students under their tutor's guidance. Our platform empowers educators to craft exams effortlessly, while students find ease in taking assessments provided by their tutors. Join us to experience a streamlined process that enhances the learning and assessment journey for both educators and students!",
    openGraph: {
      type: "article",
      title: `${appName} | ${exam.title}`,
      description:
        exam?.description ??
        "Welcome to our comprehensive online exam platform! Our user-friendly system simplifies exam creation for educators and seamless assessment-taking for students under their tutor's guidance. Our platform empowers educators to craft exams effortlessly, while students find ease in taking assessments provided by their tutors. Join us to experience a streamlined process that enhances the learning and assessment journey for both educators and students!",
      url: `${siteAddress}${PATHS.EXAMS}${exam.id}`,
      images: exam.avatar ?? appLogo,
      authors: exam.owner.name,
      publishedTime: exam.createdAt && new Date(exam.createdAt)?.toUTCString(),
      modifiedTime: exam.updatedAt && new Date(exam.updatedAt)?.toUTCString(),
      section: exam.subject.name,
      tags: exam.tags,
    },
  };
}

export default async function Exam({ params }: Props) {
  const session = await getServerSession(authOptions);

  const exam = await getExam(params.examId);

  if (
    !exam ||
    ((ExamStatus.Draft === exam?.status ||
      ExamStatus.Archived === exam?.status) &&
      session?.user.id !== exam?.ownerId)
  ) {
    return (
      <Result
        status="404"
        title="Looks like nothing here!"
        extra={
          <Link href="/">
            <Button type="primary">Back Home</Button>
          </Link>
        }
      ></Result>
    );
  }

  return (
    <>
      <ExamDetails exam={exam} />
      <StartExam exam={exam} />
    </>
  );
}
