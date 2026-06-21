"use client";

import { AttemptType } from "../../../types/prisma";
import { Descriptions, Flex, Tag, Typography } from "antd";
import type { DescriptionsProps } from "antd";
import { AttemptStatus } from "@prisma/client";
import UserImage from "../auth/UserImage";
import dayjs from "dayjs";

const attemptStatusColor: Partial<Record<AttemptStatus, string>> = {
  [AttemptStatus.Created]: "default",
  [AttemptStatus.InProgress]: "processing",
  [AttemptStatus.InReview]: "warning",
  [AttemptStatus.Assessed]: "success",
  [AttemptStatus.Elapsed]: "error",
};

export default function StudentAttemptDetails({
  attempt,
}: {
  attempt: AttemptType;
}) {
  const { user } = attempt;

  const items: DescriptionsProps["items"] = [
    {
      key: "name",
      label: "Name",
      children: (
        <Flex align="center" gap={8}>
          <UserImage name={user.name} avatar={user.avatar ?? undefined} />
          <Typography.Text>{user.name}</Typography.Text>
        </Flex>
      ),
    },
    { key: "email", label: "Email", children: user.email || "—" },
    { key: "phone", label: "Phone", children: user.phone || "—" },
    { key: "address", label: "Address", children: user.address || "—" },
    { key: "occupation", label: "Occupation", children: user.occupation || "—" },
    {
      key: "status",
      label: "Attempt status",
      children: (
        <Tag color={attemptStatusColor[attempt.status] ?? "default"}>
          {attempt.status}
        </Tag>
      ),
    },
    {
      key: "started",
      label: "Started",
      children: attempt.startTime
        ? dayjs(attempt.startTime).format("DD MMM YYYY, hh:mm A")
        : "—",
    },
    {
      key: "submitted",
      label: "Last updated",
      children: dayjs(attempt.updatedAt).format("DD MMM YYYY, hh:mm A"),
    },
    {
      key: "tabSwitches",
      label: "Tab switches",
      children: attempt.deviatedCount ?? 0,
    },
  ];

  return (
    <Descriptions
      bordered
      size="small"
      column={1}
      title="Student details"
      items={items}
    />
  );
}
