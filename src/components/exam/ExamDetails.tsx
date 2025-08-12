"use client";

import type { DescriptionsProps } from "antd";
import { ExamType } from "../../../types/prisma";
import {
  Avatar,
  Card,
  Col,
  Descriptions,
  Row,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  EditOutlined,
  UnorderedListOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PATHS } from "@/utils/constants";
import { usePathname } from "next/navigation";
import { ExamStatus } from "@prisma/client";
import { ExamStatusColorMap } from "@/utils/util";

interface ExamDetailsProps {
  exam: ExamType;
}

export default function ExamDetails({ exam }: ExamDetailsProps) {
  const { data: session } = useSession();
  const {
    token: { padding, colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const pathname = usePathname();

  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Author",
      children: exam.owner.name,
    },
    {
      key: "2",
      label: "Subject",
      children: exam.subject.name,
    },
    {
      key: "3",
      label: "Organisation",
      children: exam.org.name || "--",
    },
    {
      key: "4",
      label: "Questions",
      children: exam.questionIds.length,
    },
    {
      key: "5",
      label: "Duration",
      children: `${exam.timer} mins`,
    },
    {
      key: "6",
      label: "Benchmark",
      children: `${exam.benchmark}%`,
    },
  ];
  const isLoggedIn = !!session?.user.id;
  const isExamOwner = session?.user.email === exam.owner.email;
  const examPath = `${PATHS.EXAMS}${exam.id}`;
  const attemptsPath = `${examPath}/attempts`;

  return (
    <Card>
      <Card.Meta
        avatar={<Avatar src={exam.avatar} />}
        title={
          <Row>
            <Col xs={24} md={12}>
              <Space style={{ alignItems: "flex-start" }}>
                <Typography.Title level={5}>{exam.title}</Typography.Title>
                <Tag
                  color={ExamStatusColorMap[exam.status ?? ExamStatus.Draft]}
                >
                  {exam.status ?? ExamStatus.Draft}
                </Tag>
              </Space>
            </Col>
            <Col
              xs={24}
              md={12}
              style={{ alignSelf: "flex-start", textAlign: "right" }}
            >
              {isLoggedIn && (
                <Space split="|">
                  {isExamOwner && pathname !== examPath && (
                    <Link key="home" href={`${PATHS.EXAMS}${exam.id}`}>
                      <HomeOutlined /> Go to Exam
                    </Link>
                  )}
                  {isExamOwner && (
                    <Link key="edit" href={`${PATHS.EXAMS}${exam.id}/edit`}>
                      <EditOutlined /> Edit Exam
                    </Link>
                  )}
                  {pathname !== attemptsPath && (
                    <Link key="attempts" href={attemptsPath}>
                      <UnorderedListOutlined />{" "}
                      {isExamOwner ? "Responses" : "Previous Attempts"}
                    </Link>
                  )}
                </Space>
              )}
            </Col>
          </Row>
        }
        description={exam.description || exam.subject.description}
      />
      <Descriptions items={items} style={{ marginTop: padding }} />
    </Card>
  );
}
