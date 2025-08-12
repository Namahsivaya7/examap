"use client";
import { createExam } from "@/app/lib/api";
import ExamForm from "@/components/exam/ExamForm";
import { PATHS } from "@/utils/constants";
import { Exam } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Helmet } from "react-helmet";
import { appName } from "@/utils/config";
import { Flex, Typography, theme } from "antd";

export default function NewExam() {
  const {
    token: { padding },
  } = theme.useToken();
  const router = useRouter();
  const handleSubmit = async (examBody: Partial<Exam>) => {
    const newExam = await createExam(examBody);
    if (newExam.id) {
      router.push(`${PATHS.EXAMS}${newExam.id}/edit#add-new-question`);
    }
  };

  return (
    <Flex vertical style={{ padding }}>
      <Helmet title={`${appName} | Create New Exam`} />
      <Typography.Title level={4}>Create New Exam</Typography.Title>
      <ExamForm submitText="Proceed to add questions" onSubmit={handleSubmit} />
    </Flex>
  );
}
