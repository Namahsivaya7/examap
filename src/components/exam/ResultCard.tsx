import { AttemptStatus, ResultStatus } from "@prisma/client";
import { Button, Flex, Rate, Result, Space, Statistic, Typography } from "antd";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AttemptType, ExamType } from "../../../types/prisma";
import { deleteAttempt } from "@/app/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PATHS, UserData } from "@/utils/constants";

interface ResultCardProps {
  attempt: AttemptType;
  handleSubmit?: () => void;
}

export default function ResultCard(props: ResultCardProps) {
  const { data: session } = useSession();
  const {
    attempt: { result, user },
    attempt,
  } = props;

  const isMyResult = user.id === session?.user.id;

  const userDetails = (
    <Flex vertical>
      <Typography.Title level={3}>{user.name}</Typography.Title>
      <Typography.Text type="secondary">{user.email}</Typography.Text>
    </Flex>
  );

  const resultTitle = isMyResult ? "You have completed the exam!" : userDetails;
  const attempsLink = `${PATHS.USERS}${session?.user.id}?active=${UserData.ATTEMPTS}`;

  switch (attempt.status) {
    case AttemptStatus.Assessed:
      const isPassed = result?.status === ResultStatus.Passed;
      return (
        <Result
          status={isPassed ? "success" : "error"}
          title={resultTitle}
          subTitle={
            <Space direction="vertical">
              <Statistic
                title="Score"
                prefix={result?.score}
                value={"/"}
                suffix={result?.total}
              />
              <Rate
                disabled
                defaultValue={
                  (((result?.score || 0) / (result?.total || 1)) * 100) / 20
                }
                allowHalf
              />
            </Space>
          }
          extra={
            isMyResult
              ? [
                  <Button
                    type={!isPassed ? "primary" : "default"}
                    key="my-space"
                  >
                    <Link href={attempsLink}>My Space</Link>
                  </Button>,
                  <Button
                    type={isPassed ? "primary" : "default"}
                    key="try-again"
                  >
                    <Link href={`${PATHS.EXAMS}${attempt.examId}`}>
                      Try again
                    </Link>
                  </Button>,
                ]
              : []
          }
        />
      );
    case AttemptStatus.InReview:
      return (
        <Result
          status="info"
          title={resultTitle}
          subTitle={
            <Typography.Title level={5}>
              {isMyResult
                ? "Exam is being evaluated, please check again later."
                : "Exam needs evaluation."}
            </Typography.Title>
          }
          extra={
            isMyResult
              ? [
                  <Button type="primary" key="my-space">
                    <Link href={attempsLink}>My Attempts</Link>
                  </Button>,
                ]
              : []
          }
        />
      );
    default:
      return <></>;
  }
}

export function StaleResultCard(props: ResultCardProps) {
  const { data: session } = useSession();
  const [deletePending, setDeletePending] = useState(false);
  const router = useRouter();
  const {
    attempt: { user },
    attempt,
  } = props;

  const handleDeleteAndTryAgain = async () => {
    setDeletePending(true);
    const deletedAttempt = await deleteAttempt(attempt.examId, attempt.id);
    if (deletedAttempt?.id) {
      let examPath = `${PATHS.EXAMS}${attempt.examId}`;
      if (attempt.testId) {
        examPath += `?testId=${attempt.testId}`;
      }
      router.push(examPath);
    } else {
      setDeletePending(false);
    }
  };

  const isMyResult = user.id === session?.user.id;

  const userDetails = (
    <Flex vertical>
      <Typography.Title level={3}>{user.name}</Typography.Title>
      <Typography.Text type="secondary">{user.email}</Typography.Text>
    </Flex>
  );

  return (
    <Result
      status="warning"
      title={isMyResult ? "Stale attempt!" : userDetails}
      subTitle={
        <Typography.Title level={5} type="secondary">
          Looks like failed to submit the exam before the timer.
        </Typography.Title>
      }
      extra={
        isMyResult
          ? [
              <Button type="link" key="my-space">
                <Link
                  href={`${PATHS.USERS}${session.user.id}?active=${UserData.ATTEMPTS}`}
                >
                  My Space
                </Link>
              </Button>,

              <Button
                type="default"
                key="delete"
                onClick={handleDeleteAndTryAgain}
                loading={deletePending}
              >
                Delete this and try again
              </Button>,
              <Button type="primary" key="submit" onClick={props.handleSubmit}>
                Submit Now!
              </Button>,
            ]
          : []
      }
    />
  );
}
