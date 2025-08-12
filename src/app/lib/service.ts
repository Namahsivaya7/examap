import { ExamStatus, User } from "@prisma/client";
import prisma from "./prisma";
import { ExamType, ExamTypeWithoutQuestions } from "../../../types/prisma";

interface GetExamProps {
  status?: ExamStatus[];
  q?: string;
  tags?: string[];
  userId?: string;
  cursor?: string;
  author?: string;
}

export const getExams = async (
  props: GetExamProps
): Promise<ExamTypeWithoutQuestions[]> => {
  console.log(props);
  const {
    status = Object.keys(ExamStatus),
    tags = [],
    q = "",
    userId,
    cursor,
    author,
  } = props;
  let tagsQuery = {};
  if (Array.isArray(tags) && tags.length > 0) {
    tagsQuery = {
      tags: {
        hasSome: tags,
      },
    };
  }

  const paginationQuery = cursor && {
    skip: 1,
    cursor: {
      id: cursor,
    },
  };
  const exams = await prisma.exam.findMany({
    where: {
      OR: [
        {
          status: ExamStatus.Published,
          ownerId: author,
        },
        userId
          ? {
              ownerId: userId,
              status: {
                in: status as ExamStatus[],
              },
            }
          : {},
      ],
      title: {
        contains: q,
        mode: "insensitive",
      },
      ...tagsQuery,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      subject: true,
      owner: true,
    },
    take: 10,
    ...(paginationQuery || {}),
  });

  return exams;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  return user;
};
