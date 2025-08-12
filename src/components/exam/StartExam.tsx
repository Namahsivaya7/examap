"use client";

import { useState } from "react";
import { ExamType } from "../../../types/prisma";
import { RightCircleOutlined, ReadOutlined } from "@ant-design/icons";
import { Button, theme, Typography, Result, Space, Flex } from "antd";
import { createAttempt } from "@/app/lib/api";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { appName } from "@/utils/config";
import CreateTest from "@/components/exam/CreateTest";
import SocialShare from "@/components/SocialShare";
import Link from "next/link";
import { PATHS } from "@/utils/constants";

const { Paragraph, Text } = Typography;

export default function StartExam({ exam }: { exam: ExamType }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    token: { padding, colorBgContainer, colorText },
  } = theme.useToken();

  const handleStart = async () => {
    if (!exam?.id) return;
    setLoading(true);
    const testId = searchParams.get("testId") ?? undefined;
    const attempt = await createAttempt(exam?.id, {
      userId: session?.user.id,
      examId: exam?.id,
      testId,
    });

    if (attempt?.id) {
      router.push(`/exams/${exam.id}/attempts/${attempt.id}`);
    } else {
      setLoading(false);
    }
  };

  const hasQuestions = !!exam?.questions?.length;
  const isExamOwner = session?.user.id === exam?.ownerId;
  const isLoggedin = !!session?.user.id;

  return (
    <Result
      icon={<ReadOutlined />}
      style={{ maxWidth: 720, alignSelf: "center" }}
      title={exam.title}
      subTitle={exam.description}
      extra={
        <Space direction="vertical" split="-">
          {isExamOwner && (
            <Flex align="center" wrap="wrap" justify="center" gap={padding * 2}>
              <Typography.Text
                copyable={{ text: window.location.href, tooltips: true }}
              >
                Copy sharable link
              </Typography.Text>
              <SocialShare
                key="social"
                url={window.location.href}
                title={`${appName} - ${exam.title}`}
                description={exam.description ?? ""}
              />

              <CreateTest key="create-test" exam={exam} />
            </Flex>
          )}
          {isLoggedin && (
            <Button
              size="large"
              type={isExamOwner ? "default" : "primary"}
              key="start"
              onClick={handleStart}
              loading={loading}
              disabled={loading || !hasQuestions}
            >
              Start
            </Button>
          )}
        </Space>
      }
    >
      {!isLoggedin && (
        <Paragraph
          style={{
            fontSize: 18,
            textAlign: "center",
            marginBottom: 0,
          }}
          strong
        >
          <Link href={PATHS.SIGNIN}>Login to write the exam</Link>
        </Paragraph>
      )}
      {isLoggedin && hasQuestions && (
        <div className="desc">
          <Paragraph>
            <Text
              strong
              style={{
                fontSize: 16,
              }}
            >
              By clicking on start, you agree that you have read the following
              instructions:
            </Text>
          </Paragraph>
          <Paragraph>
            <RightCircleOutlined className="site-result-demo-error-icon" />{" "}
            Please make sure you have good internet connectivity.
          </Paragraph>
          <Paragraph>
            <RightCircleOutlined className="site-result-demo-error-icon" />{" "}
            Responses will be auto submitted.
          </Paragraph>

          <Paragraph>
            <RightCircleOutlined className="site-result-demo-error-icon" /> Exam
            will be auto submitted if time lapses. Even without explicitly
            clicking the submit button.
          </Paragraph>
          <Paragraph>
            <RightCircleOutlined className="site-result-demo-error-icon" />{" "}
            Result will be displayed after submitting the exam.
          </Paragraph>
        </div>
      )}
      {isLoggedin && !hasQuestions && (
        <div>
          <Paragraph>Oops, Exam {"doesn't"} have any questions.</Paragraph>
          <Paragraph>
            Please check with the author <b>{exam.owner.name}</b>
          </Paragraph>
        </div>
      )}
    </Result>
  );
}
