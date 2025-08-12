import {
  AnswerType,
  AttemptStatus,
  ExamStatus,
  Question,
} from "@prisma/client";
import { PATHS, PUBLIC_PATHS } from "./constants";
import { AttemptType, ExamType } from "../../types/prisma";

export const hasResponse = (response: string[]) => {
  return Array.isArray(response) && response[0] && response[0].length > 0;
};

export const hasAdequateResponse = (
  response: string[],
  { options, answerType }: Question
) => {
  return (
    Array.isArray(response) &&
    (answerType === AnswerType.Essay
      ? response.length === 1
      : response.length === options.filter((opt) => opt.isAnswer).length)
  );
};

export const isAuthenticationPath = (pathname: string) => {
  return pathname.startsWith(PATHS.SIGNIN) || pathname.startsWith(PATHS.SIGNUP);
};

export const toInitials = (name: string = "") =>
  name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const openFullscreen = (elem: HTMLElement) => {
  try {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
      /*@ts-ignore */
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      /*@ts-ignore */
      elem.webkitRequestFullscreen();
      /*@ts-ignore */
    } else if (elem.msRequestFullscreen) {
      /* IE11 */
      /*@ts-ignore */
      elem.msRequestFullscreen();
    }
  } catch (err) {
    console.log(err);
  }
};

export const minutesToMillis = (mins: number) => mins * 60 * 1000;

export const isExamElapsed = (attempt?: AttemptType, exam?: ExamType) => {
  if (!attempt || !exam) return false;
  if (attempt.status === AttemptStatus.Elapsed) return true;
  if (
    attempt.status === AttemptStatus.InProgress && // Attempt should be in progress
    attempt.startTime && // should have startTime
    +new Date(attempt.startTime) + minutesToMillis(exam.timer) < +new Date() // current time should be less the the duration of exam
  ) {
    return true;
  }
  return false;
};

export const ExamStatusColorMap = {
  [ExamStatus.Archived]: "red",
  [ExamStatus.Draft]: "gold",
  [ExamStatus.Private]: "purple",
  [ExamStatus.Published]: "green",
};

export function debounce<Params extends any[]>(
  func: (...args: Params) => any,
  timeout: number
): (...args: Params) => void {
  let timer: NodeJS.Timeout;
  return (...args: Params) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}

export const isPathPublicPage = (pathname: string) => {
  const includes = PUBLIC_PATHS.includes(pathname);
  if (includes) return true;
  if (pathname.includes(PATHS.EXAMS)) {
    if (
      pathname.includes(PATHS.ATTEMPTS.slice(0, -1)) ||
      pathname === PATHS.NEW_EXAM
    ) {
      return false;
    }
    return true;
  }
  return false;
};
