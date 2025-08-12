"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Typography,
  Flex,
  theme,
  Badge,
  Tag,
  Table,
  Tooltip,
  Space,
  Button,
} from "antd";
import Link from "next/link";
import { ExportOutlined, FileTextOutlined } from "@ant-design/icons";
import { PATHS } from "@/utils/constants";
import { AttemptType, ExamType } from "../../../types/prisma";
import UserImage from "../auth/UserImage";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ResultStatus } from "@prisma/client";
import { ColumnsType } from "antd/es/table";
import ExamResult, { Assessment } from "./ExamResult";
import { useSearchParams } from "next/navigation";
import { submitAssessment } from "@/app/lib/api";
dayjs.extend(relativeTime);

interface AttemptsProps {
  data: AttemptType[];
  withoutUser?: boolean;
  exam?: ExamType;
}

const examColumns: ColumnsType<AttemptType> = [
  {
    title: "Exam",
    dataIndex: "exam.name",
    ellipsis: true,
    key: "name",
    render: (_, d) => (
      <Space>
        <UserImage name={d.exam.title} avatar={d.exam.avatar ?? undefined} />
        <Typography>{d.exam.title}</Typography>
      </Space>
    ),
  },
  {
    title: "Subject",
    dataIndex: "exam.subject",
    ellipsis: true,
    key: "email",
    render: (_, d) => <Typography>{d.exam.subject.name}</Typography>,
  },
];

const userColumns: ColumnsType<AttemptType> = [
  {
    title: "Name",
    dataIndex: "user.name",
    ellipsis: true,
    key: "name",
    render: (_, d) => (
      <Space>
        <UserImage name={d.user.name} avatar={d.user.avatar ?? undefined} />
        <Typography>{d.user.name}</Typography>
      </Space>
    ),
  },
  {
    title: "Email",
    dataIndex: "user.email",
    ellipsis: true,
    key: "email",
    render: (_, d) => <Typography>{d.user.email}</Typography>,
  },
  {
    title: "Address",
    dataIndex: "user.address",
    ellipsis: true,
    key: "address",
    render: (_, d) => <Typography>{d.user.address}</Typography>,
  },
];

export default function Attempts({
  data,
  withoutUser = false,
  exam,
}: AttemptsProps) {
  const {
    token: { padding },
  } = theme.useToken();

  const searchParams = useSearchParams();
  const attemptId = searchParams.get("id") ?? undefined;

  const [attempt, setAttempt] = useState<AttemptType | undefined>();

  const columns: ColumnsType<AttemptType> = useMemo(
    () => [
      ...(withoutUser ? examColumns : userColumns),
      {
        title: `Marks`,
        dataIndex: "result.score",
        ellipsis: true,
        key: "score",
        render: (_, d) => (
          <Space split="/">
            <Badge
              key="score"
              count={d.result?.score}
              color={d.result?.status === ResultStatus.Passed ? "green" : "red"}
              showZero
            />
            <Typography>{d.result?.total}</Typography>
          </Space>
        ),
        sorter: (a, b) => (a.result?.score ?? 0) - (b.result?.score ?? 0),
      },
      {
        title: "Status",
        ellipsis: true,
        dataIndex: "result.status",
        key: "status",
        render: (_, d) => (
          <Tag
            key="status"
            color={d.result?.status === ResultStatus.Passed ? "green" : "red"}
          >
            {d.result?.status}
          </Tag>
        ),
      },
      {
        title: "Submitted",
        dataIndex: "updatedAt",
        key: "updatedAt",
        render: (_, d) => (
          <Tooltip title={dayjs(d.updatedAt).format()}>
            <Typography.Text>{dayjs(d.updatedAt).fromNow()}</Typography.Text>
          </Tooltip>
        ),
        sorter: (a, b) => +new Date(a.updatedAt) - +new Date(b.updatedAt),
        ellipsis: true,
      },
      {
        title: "",
        dataIndex: "actions",
        key: "actions",
        render: (_, d) => (
          <Space>
            {exam && (
              <Tooltip>
                <Button
                  icon={<FileTextOutlined />}
                  type="link"
                  onClick={() => setAttempt(d)}
                />
              </Tooltip>
            )}
            {!exam && (
              <Link
                target="_blank"
                href={`${PATHS.EXAMS}${d?.examId}${PATHS.ATTEMPTS}${d?.id}`}
              >
                <Button type="link" icon={<ExportOutlined />} />
              </Link>
            )}
          </Space>
        ),
      },
    ],
    [exam, withoutUser]
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    if (attempt) {
      url.searchParams.set("id", attempt.id);
    } else {
      url.searchParams.delete("id");
    }
    window.history.pushState({}, "", url);
  }, [attempt]);

  useEffect(() => {
    if (data && attemptId) {
      const attemptOpt = data.find((d) => d.id === attemptId);
      setAttempt(attemptOpt);
    }
  }, [attemptId, data]);

  const handleAssessment = async (assessment: Assessment) => {
    if (!exam || !attempt) return;
    const attemptOpt = await submitAssessment(exam.id, attempt?.id, assessment);
    if (attemptOpt) {
      const attemptOpt = data.find((d) => d.id === attemptId);
      setAttempt(attemptOpt);
    }
  };

  const handleClose = () => {
    setAttempt(undefined);
  };

  return (
    <Flex vertical style={{ padding }}>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          pageSize: 10,
          hideOnSinglePage: true,
        }}
        showHeader
      />
      {exam && (
        <ExamResult
          exam={exam}
          attempt={attempt}
          onClose={handleClose}
          onAssessmentSubmit={handleAssessment}
        />
      )}
    </Flex>
  );
}
