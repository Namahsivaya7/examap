"use client";
import Exams from "@/components/exam/Exams";
import { Helmet } from "react-helmet";
import { appName } from "@/utils/config";
import React, { useEffect, useMemo, useState } from "react";
import { Flex, theme } from "antd";
import { useSearchParams } from "next/navigation";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useUserStore } from "@/store/userStore";
import { UserData } from "@/utils/constants";
import { useSession } from "next-auth/react";
import Attempts from "@/components/exam/Attempts";
import Questions from "@/components/exam/Questions";
import Tests from "@/components/exam/Tests";

export default function UserProfile() {
  const { data: session } = useSession();
  const { user, exams, questions, tests, attempts, loading, fetchUserData } =
    useUserStore((state) => state);
  const searchParams = useSearchParams();
  const active = (searchParams.get("active") as UserData) ?? UserData.EXAMS;

  const {
    token: { padding },
  } = theme.useToken();

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) return;
    fetchUserData(userId, active);
  }, [session?.user.id, active]);

  const onChange = (key: UserData) => {
    var url = new URL(window.location.href);
    url.searchParams.set("active", key);
    window.history.pushState({}, "", url);
    if (session?.user.id) {
      if (!user || !user[key] || user[key].length === 0) {
        fetchUserData(session?.user.id, key as UserData);
      }
    }
  };

  const items: TabsProps["items"] = [
    {
      key: UserData.EXAMS,
      label: "My Exams",
      children: exams && <Exams data={exams} loading={loading} />,
    },
    {
      key: UserData.ATTEMPTS,
      label: "My Attempts",
      children: attempts && <Attempts data={attempts} withoutUser />,
    },
    {
      key: UserData.QUESTIONS,
      label: "My Questions",
      children: questions && <Questions data={questions} loading={loading} />,
    },
    {
      key: UserData.TESTS,
      label: "My Tests",
      children: tests && <Tests data={tests} loading={loading} />,
    },
  ];

  return (
    <Flex style={{ padding }} vertical>
      <Helmet title={`${appName} | ${session?.user.name}`} />
      <Tabs
        defaultActiveKey={active}
        items={items}
        onChange={(k) => onChange(k as UserData)}
      />
    </Flex>
  );
}
