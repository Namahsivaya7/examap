"use client";

import { UserOutlined } from "@ant-design/icons";
import React from "react";
import {
  Avatar,
  List,
  Space,
  Typography,
  Skeleton,
  Flex,
  theme,
  Tooltip,
  Grid,
} from "antd";
import Link from "next/link";
import { PATHS } from "@/utils/constants";
import { TestType } from "../../../types/prisma";
import dayjs from "dayjs";

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

interface TestsProps {
  data: TestType[];
  loading?: boolean;
}

export default function Tests({ data, loading }: TestsProps) {
  const {
    token: { padding, colorLink },
  } = theme.useToken();
  const { md } = Grid.useBreakpoint();

  return (
    <Flex vertical style={{ padding }}>
      <Skeleton title={false} active paragraph={{ rows: 6 }} loading={loading}>
        <List
          itemLayout="horizontal"
          size={md ? "large" : "small"}
          pagination={{
            onChange: (page) => {
              console.log(page);
            },
            pageSize: 5,
            hideOnSinglePage: true,
          }}
          dataSource={data}
          renderItem={(test) => (
            <List.Item
              key={test.id}
              actions={[
                <IconText
                  icon={UserOutlined}
                  text={test.attempt_count.toString()}
                  key="list-vertical-message"
                />,
              ]}
              extra={
                <Tooltip title={dayjs(test.createdAt).format()}>
                  <Typography.Text type="secondary">
                    {dayjs(test.createdAt).fromNow()}
                  </Typography.Text>
                </Tooltip>
              }
            >
              <List.Item.Meta
                avatar={<Avatar src={test.exam.avatar} />}
                title={
                  <Link
                    href={`${PATHS.EXAMS}${test.examId}/attempts?testId=${test.id}`}
                    style={{ color: colorLink }}
                  >
                    {test.name}
                  </Link>
                }
                description={test.exam.title}
              />

              <Typography.Text>{test.exam.description}</Typography.Text>
            </List.Item>
          )}
        />
      </Skeleton>
    </Flex>
  );
}
