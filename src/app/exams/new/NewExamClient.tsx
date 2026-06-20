"use client";
import { createExam } from "@/app/lib/api";
import ExamForm from "@/components/exam/ExamForm";
import { isAdminEmail } from "@/utils/admin";
import { PATHS } from "@/utils/constants";
import { appName } from "@/utils/config";
import { Exam } from "@prisma/client";
import { Flex, Spin, Typography, theme } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Helmet } from "react-helmet";

export default function NewExamClient() {
  const {
    token: { padding },
  } = theme.useToken();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAdmin = isAdminEmail(session?.user?.email);

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) {
      router.replace(PATHS.HOME);
    }
  }, [status, isAdmin, router]);

  const handleSubmit = async (examBody: Partial<Exam>) => {
    const newExam = await createExam(examBody);
    if (newExam.id) {
      router.push(`${PATHS.EXAMS}${newExam.id}/edit#add-new-question`);
    }
  };

  if (status === "loading" || !isAdmin) {
    return (
      <Flex justify="center" align="center" style={{ padding, minHeight: 200 }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <Flex vertical style={{ padding }}>
      <Helmet title={`${appName} | Create New Exam`} />
      <Typography.Title level={4}>Create New Exam</Typography.Title>
      <ExamForm submitText="Proceed to add questions" onSubmit={handleSubmit} />
    </Flex>
  );
}
