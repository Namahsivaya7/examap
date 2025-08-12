import { green, red, blue, cyan } from "@ant-design/colors";

export enum QuestionStatus {
  Unanswered = "Unanswered",
  Answered = "Answered",
  Correct = "Correct",
  Incorrect = "Incorrect",
}

export const STATUS_COLORS = {
  [QuestionStatus.Unanswered]: blue.primary,
  [QuestionStatus.Answered]: cyan.primary,
  [QuestionStatus.Correct]: green.primary,
  [QuestionStatus.Incorrect]: red.primary,
};
