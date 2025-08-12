"use client";

import { QuestionCircleOutlined, ReadOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  List,
  Space,
  Typography,
  Skeleton,
  Flex,
  theme,
  Tag,
  Grid,
} from "antd";
import Link from "next/link";
import { PATHS, UserData } from "@/utils/constants";
import { ExamTypeWithoutQuestions } from "../../../types/prisma";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/userStore";

const IconText = ({
  icon,
  text,
  title,
}: {
  icon: React.FC;
  text: string;
  title: string;
}) => (
  <Space title={title}>
    {React.createElement(icon)}
    {text}
  </Space>
);

interface ExamsProps {
  data: ExamTypeWithoutQuestions[];
  loading?: boolean;
}

export default function Exams({ data, loading }: ExamsProps) {
  const {
    token: { padding, colorLink },
  } = theme.useToken();

  const { md } = Grid.useBreakpoint();

  return (
    <Flex vertical style={{ padding }}>
      <Skeleton title={false} active paragraph={{ rows: 6 }} loading={loading}>
        <List
          itemLayout="vertical"
          size={md ? "large" : "small"}
          dataSource={data}
          renderItem={(exam) => (
            <List.Item
              key={exam.id}
              actions={[
                <IconText
                  icon={QuestionCircleOutlined}
                  text={exam.questionIds.length.toString()}
                  key="list-vertical-question-count"
                  title="questions"
                />,
                <IconText
                  icon={ReadOutlined}
                  text={exam.attempt_count.toString()}
                  key="list-vertical-star-o"
                  title="attempts"
                />,
              ]}
              extra={<Typography.Text>{exam.timer} mins</Typography.Text>}
            >
              <List.Item.Meta
                avatar={<Avatar src={exam.avatar} />}
                title={
                  <Link
                    style={{ color: colorLink }}
                    href={`${PATHS.EXAMS}${exam.id}`}
                  >
                    {exam.title}
                  </Link>
                }
                description={
                  <Link
                    style={{ color: colorLink }}
                    href={`${PATHS.SEARCH}?author=${exam.ownerId}`}
                  >
                    {exam.owner.name}
                  </Link>
                }
              />

              <Flex
                align="center"
                justify="space-between"
                wrap="wrap"
                gap={padding}
              >
                <Space>
                  {exam.tags.map((tag, i) => (
                    <Tag key={tag + i} color="geekblue">
                      <Link href={`${PATHS.SEARCH}?tagged=${tag}`}>{tag}</Link>
                    </Tag>
                  ))}
                </Space>

                <Typography.Text>
                  <b>{exam.org.name}</b> {exam.org.address}
                </Typography.Text>
              </Flex>
            </List.Item>
          )}
        />
      </Skeleton>
    </Flex>
  );
}

export function ExamsC() {
  const { data: session } = useSession();
  const { exams, questions, tests, attempts, loading, fetchUserData } =
    useUserStore((state) => state);
  const [data, setData] = useState(exams);
  const [cursor, setCursor] = useState();

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) return;
    fetchUserData(userId, UserData.EXAMS, cursor);
  }, [session?.user.id]);

  return <Exams data={data} loading={loading} />;
}
