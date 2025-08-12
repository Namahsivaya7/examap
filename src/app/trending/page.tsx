import React from "react";
import { getTrendingExams } from "../lib/api";
import { appName } from "@/utils/config";
import Exams from "@/components/exam/Exams";

export const dynamic = "force-dynamic"; // 👈🏽

export function generateMetadata() {
  return {
    title: `${appName} | Trending Exams`,
  };
}

export const revalidate = 3600; // revalidate at most every hour

export default async function Trending() {
  const exams = await getTrendingExams();

  return <Exams data={exams} loading={!exams} />;
}
