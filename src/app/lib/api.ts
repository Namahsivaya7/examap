import { Attempt, Exam, Test, Subject, User } from "@prisma/client";
import api from "./axios";
import {
  AttemptType,
  ExamType,
  QuestionType,
  TestType,
  UserType,
} from "../../../types/prisma";
import { UserData } from "@/utils/constants";
import { cache } from "react";

/**
 * Users
 */
export const updateUser = async (
  id: string,
  body: Partial<UserType>
): Promise<UserType> => {
  const res = await api.put<UserType>(`users/${id}`, body);
  return res.data;
};

export const getUser = async (id: string): Promise<UserType> => {
  const res = await api.get<UserType>(`users/${id}`);
  return res.data;
};

export const verifyUser = async (id: string): Promise<string> => {
  const res = await api.post<string>(`users/${id}/verify-account`);
  return res.data;
};

export const requestForgetPassword = async (email: string): Promise<string> => {
  const res = await api.post<string>(`auth/reset-password`, { email });
  return res.data;
};

export const updatePassword = async (
  token: string,
  password: string
): Promise<string> => {
  const res = await api.patch<string>(`auth/update-password`, {
    password,
    token,
  });
  return res.data;
};

/**
 *
 * @param id
 * @returns
 */
export const getUserData = async (
  id: string,
  dataType?: UserData,
  cursor?: string
): Promise<UserType> => {
  const searchParams = new URLSearchParams({});
  if (dataType) {
    searchParams.append(dataType, "true");
  } else {
    Object.values(UserData).forEach((d) => {
      searchParams.append(d, "true");
    });
  }

  if (cursor) {
    searchParams.append("cursor", cursor);
  }

  const res = await api.get<UserType>(`users/${id}`, {
    params: searchParams,
  });

  return res.data;
};

export const getUserExams = async (userId: string): Promise<ExamType[]> => {
  const res = await api.get<ExamType[]>(
    `users/${userId}?${UserData.EXAMS}=true`
  );
  return res.data;
};

export const getUserAttempts = async (
  userId: string
): Promise<AttemptType[]> => {
  const res = await api.get<AttemptType[]>(
    `users/${userId}?${UserData.ATTEMPTS}=true`
  );
  return res.data;
};

export const getUserQuestions = async (
  userId: string
): Promise<QuestionType[]> => {
  const res = await api.get<QuestionType[]>(
    `users/${userId}?${UserData.QUESTIONS}=true`
  );
  return res.data;
};

export const getUserTests = async (userId: string): Promise<TestType[]> => {
  const res = await api.get<TestType[]>(
    `users/${userId}?${UserData.TESTS}=true`
  );
  return res.data;
};

/**
 * Subjects
 * @param q
 * @returns
 */
export const getSubjectsWithKeyword = async (q: string): Promise<Subject[]> => {
  const res = await api.get<Subject[]>("subjects", {
    params: {
      q,
    },
  });
  return res.data;
};

export const createSubject = async (
  body: Partial<Subject>
): Promise<Subject> => {
  const res = await api.post<Subject>("subjects", body);
  return res.data;
};

/**
 * Tests
 * @param q
 * @returns
 */
export const getTestsWithKeyword = async (q: string): Promise<Test[]> => {
  const res = await api.get<Test[]>("tests", {
    params: {
      q,
    },
  });
  return res.data;
};

export const createTest = async (body: Partial<Test>): Promise<Test> => {
  const res = await api.post<Test>("tests", body);
  return res.data;
};

export const getTest = async (testId: string): Promise<TestType> => {
  const res = await api.get<TestType>(`tests/${testId}`);
  return res.data;
};

/**
 * Exam
 */
export const createExam = async (body: Partial<Exam>): Promise<Exam> => {
  const res = await api.post<Exam>(`exams`, body);
  return res.data;
};

export const getExam = async (id: string): Promise<ExamType> => {
  const res = await api.get<ExamType>(`exams/${id}`);
  return res.data;
};

export const getExams = async (
  tags?: string[],
  q?: string
): Promise<ExamType[]> => {
  const searchParams = new URLSearchParams();
  tags?.forEach((tag) => {
    searchParams.append("tag", tag);
  });
  if (q) {
    searchParams.append("q", q);
  }
  const res = await api.get<ExamType[]>(`/exams?`, {
    params: searchParams,
  });
  return res.data;
};

export const getTrendingExams = cache(async (): Promise<ExamType[]> => {
  const res = await api.post<ExamType[]>("exams/trending");
  return res.data;
});

export const updateExam = async (
  id: string,
  body: Partial<ExamType>
): Promise<ExamType> => {
  const res = await api.put<ExamType>(`exams/${id}`, body);
  return res.data;
};

/**
 * Question
 */
export const createQuestion = async (
  examId: string,
  body: Partial<QuestionType>
): Promise<QuestionType> => {
  const res = await api.post<QuestionType>(`exams/${examId}/questions`, body);
  return res.data;
};

export const getQuestion = async (
  examId: string,
  questionId: string
): Promise<QuestionType> => {
  const res = await api.get<QuestionType>(
    `exams/${examId}/questions/${questionId}`
  );
  return res.data;
};

export const unlinkQuestion = async (
  examId: string,
  questionId: string
): Promise<QuestionType> => {
  const res = await api.delete<QuestionType>(
    `exams/${examId}/questions/${questionId}`
  );
  return res.data;
};

export const getQuestions = async (examId: string): Promise<QuestionType[]> => {
  const res = await api.get<QuestionType[]>(`exams/${examId}/questions`);
  return res.data;
};

export const updateQuestion = async (
  examId: string,
  questionId: string,
  body: Partial<QuestionType>
): Promise<QuestionType> => {
  const res = await api.put<QuestionType>(
    `exams/${examId}/questions/${questionId}`,
    body
  );
  return res.data;
};

/**
 * Attempts
 */
export const createAttempt = async (
  examId: string,
  body: Partial<Attempt>
): Promise<Attempt> => {
  const res = await api.post<Attempt>(`exams/${examId}/attempts`, body);
  return res.data;
};

export const getAttempt = async (
  examId: string,
  attemptId: string
): Promise<AttemptType> => {
  const res = await api.get<AttemptType>(
    `exams/${examId}/attempts/${attemptId}`
  );
  return res.data;
};

export const deleteAttempt = async (
  examId: string,
  attemptId: string
): Promise<AttemptType> => {
  const res = await api.delete<AttemptType>(
    `exams/${examId}/attempts/${attemptId}`
  );
  return res.data;
};

export const getAttempts = async (
  examId: string,
  userId?: string,
  testId?: string
): Promise<AttemptType[]> => {
  const searchParams = new URLSearchParams({});
  if (userId) {
    searchParams.set("user", userId);
  }
  if (testId) {
    searchParams.set("testId", testId);
  }
  const res = await api.get<AttemptType[]>(`exams/${examId}/attempts`, {
    params: searchParams,
  });
  return res.data;
};

export const updateAttempt = async (
  examId: string,
  attemptId: string,
  body: Partial<Attempt>
): Promise<Attempt> => {
  const res = await api.put<Attempt>(
    `exams/${examId}/attempts/${attemptId}`,
    body
  );
  return res.data;
};

export const startAttempt = async (
  examId: string,
  attemptId: string
): Promise<Attempt> => {
  const res = await api.patch<Attempt>(
    `exams/${examId}/attempts/${attemptId}/start`,
    {
      startTime: new Date(),
    }
  );
  return res.data;
};

export const submitAttempt = async (
  examId: string,
  attemptId: string,
  body: Partial<Attempt>
): Promise<Attempt> => {
  const res = await api.patch<Attempt>(
    `exams/${examId}/attempts/${attemptId}/submit`,
    body
  );
  return res.data;
};

export const submitAssessment = async (
  examId: string,
  attemptId: string,
  assessment: Record<string, number>
): Promise<AttemptType> => {
  const res = await api.patch<AttemptType>(
    `exams/${examId}/attempts/${attemptId}/assess`,
    { assessment }
  );
  return res.data;
};

export const updateDeviatedAttempt = async (
  examId: string,
  attemptId: string
): Promise<Attempt> => {
  const res = await api.patch<Attempt>(
    `exams/${examId}/attempts/${attemptId}/deviated`
  );
  return res.data;
};
