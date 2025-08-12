"use client";
import ExamDetails from "@/components/exam/ExamDetails";
import { useEffect, useState } from "react";
import { Flex, Skeleton, Space, Typography, theme } from "antd";
import { getAttempts, getExam, getTest } from "@/app/lib/api";
import { AttemptType, ExamType, TestType } from "../../../../../types/prisma";
import { Attempt } from "@prisma/client";
import { Helmet } from "react-helmet";
import { appName } from "@/utils/config";
import { useSession } from "next-auth/react";
import Attempts from "@/components/exam/Attempts";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/store/toastStore";

export default function Attempt({ params }: { params: { examId: string } }) {
  const { data: session } = useSession();
  const [exam, setExam] = useState<ExamType | undefined>();
  const [test, setTest] = useState<TestType | undefined>();
  const [attempts, setAttempts] = useState<AttemptType[]>([]);
  const [examLoading, setExamLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const error = useToast((_) => _.error);
  const testId = searchParams.get("testId") ?? undefined;

  const {
    token: { padding, colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    if (!testId) return;
    getTest(testId)
      .then(setTest)
      .catch((e) => {
        error("Failed to get Test details.");
      });
  }, [testId, session?.user.id, error]);

  useEffect(() => {
    if (!params.examId || !session?.user.id) return;
    setExamLoading(true);
    setLoading(true);
    getExam(params.examId)
      .then((res) => {
        if (!session?.user.id) return;
        setExam(res);
        setExamLoading(false);
        // Get attemps based on exam result:
        let userId;
        if (res.ownerId !== session?.user.id) {
          // If not exam owner, bring attempts of logged in user.
          userId = session.user.id;
        }
        getAttempts(params.examId, userId, testId)
          .then((attempts) => {
            setAttempts(attempts);
          })
          .catch((err) => {
            setAttempts([]);
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch(() => {
        setExam(undefined);
        setExamLoading(false);
      });
  }, [params.examId, session?.user.id, testId]);

  return (
    <>
      <Helmet title={`${appName} | Exam | ${exam?.title} | Attempts`} />
      <Flex style={{ padding, paddingBottom: 0 }} justify="space-between">
        <Typography.Title level={4}>Responses</Typography.Title>
        <span></span>
        <Typography.Title level={4} type="secondary">
          {test?.name}
        </Typography.Title>
      </Flex>

      <Skeleton loading={examLoading}>
        {exam && <ExamDetails exam={exam} />}
      </Skeleton>

      <Skeleton loading={loading}>
        <Attempts data={attempts} exam={exam} />
      </Skeleton>
    </>
  );
}
