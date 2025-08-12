import Exams from "@/components/exam/Exams";
import React from "react";
import { Metadata } from "next";
import { appName } from "@/utils/config";
import { getExams, getUserById } from "../lib/service";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

type Props = {
  searchParams: {
    tagged?: string[];
    q?: string;
    cursor?: string;
    author?: string;
  };
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  let title = `${appName} | Exams`;
  if (searchParams.tagged) {
    title += " tagged " + searchParams.tagged;
  }
  if (searchParams.q) {
    title += " matching " + searchParams.q;
  }
  if (searchParams.author) {
    const user = await getUserById(searchParams.author);
    if (user?.name) {
      title += " by " + user.name;
    }
  }
  return {
    title,
  };
}

export default async function Search({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const { tagged, q, cursor, author } = searchParams;
  const taggedArr = tagged && (Array.isArray(tagged) ? tagged : [tagged]);

  const exams = await getExams({
    tags: taggedArr,
    q,
    userId: session?.user.id,
    cursor,
    author,
  });

  return <Exams data={exams} loading={!exams} />;
}
