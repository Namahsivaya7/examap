import {
  createQuestion,
  getAttempts,
  getExam,
  unlinkQuestion,
  updateExam,
  updateQuestion,
} from "@/app/lib/api";
import { create } from "zustand";
import { AttemptType, ExamType, QuestionType } from "../../types/prisma";
import { useToast } from "./toastStore";
import { Question } from "@prisma/client";

interface ExamState {
  loading: boolean;
  exam?: ExamType;
  attempts?: AttemptType[];

  fetchExam: (id: string) => void;
  reset: () => void;
  editExam: (q: Partial<ExamType>) => void;
  addQuestion: (q: Partial<QuestionType>) => void;
  editQuestion: (
    qId: string,
    q: Partial<QuestionType>
  ) => Promise<QuestionType | null>;
  fetchAttempts: (userId?: string) => void;
  unlinkQuestion: (qId: string) => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  loading: false,
  exam: undefined,

  fetchExam: async (examId: string) => {
    set({ loading: true });
    const exam = await getExam(examId);
    if (exam) {
      set({ exam });
    } else {
      useToast.getState().error("Failed to fetch exam.");
    }
    set({ loading: false });
  },

  reset: () => {
    set({ exam: undefined });
  },

  editExam: async (examBody: Partial<ExamType>) => {
    const exam = get().exam;
    if (!exam?.id) return;
    set({ loading: true });
    const examOpt = await updateExam(exam.id, examBody);
    const { success, error } = useToast.getState();
    if (examOpt) {
      set({ exam: { ...exam, ...examOpt } });
      success("Updated successfully.");
    } else {
      error("Update failed.");
    }
    set({ loading: false });
  },

  addQuestion: async (questionBody: Partial<QuestionType>) => {
    const exam = get().exam;
    if (!exam?.id) return;
    set({ loading: true });
    const question = await createQuestion(exam.id, questionBody);
    const { success, error } = useToast.getState();
    if (question) {
      const questionIds = [...exam.questionIds, question.id];
      const questions = [...exam.questions, question];
      set({ exam: { ...exam, questionIds, questions } });
      success("Question added.");
    } else {
      error("Failed to add question.");
    }
    set({ loading: false });
  },

  editQuestion: async (
    questionId: string,
    questionBody: Partial<QuestionType>
  ): Promise<QuestionType | null> => {
    const exam = get().exam;
    if (!exam?.id) return null;
    set({ loading: true });
    const questionOpt = await updateQuestion(exam.id, questionId, questionBody);
    const { success, error } = useToast.getState();
    if (questionOpt) {
      const questionIndex = exam.questions.findIndex(
        (q) => q.id === questionOpt.id
      );
      if (questionIndex > -1) {
        const questions = [
          ...exam.questions.slice(0, questionIndex),
          questionOpt,
          ...exam.questions.slice(questionIndex + 1),
        ];
        set({ exam: { ...exam, questions } });
        success("Question updated.");
      }
    }
    set({ loading: false });
    return questionOpt;
  },

  unlinkQuestion: async (questionId: string) => {
    const exam = get().exam;
    if (!exam?.id) return;
    set({ loading: true });
    const questionOpt = await unlinkQuestion(exam.id, questionId);
    const { success, error } = useToast.getState();
    if (questionOpt) {
      const questionIndex = exam.questions.findIndex(
        (q) => q.id === questionOpt.id
      );
      if (questionIndex > -1) {
        const questions = [
          ...exam.questions.slice(0, questionIndex),
          ...exam.questions.slice(questionIndex + 1),
        ];
        set({ exam: { ...exam, questions } });
        success("Question removed from the exam.");
      }
    }
    set({ loading: false });
  },

  fetchAttempts: async (userId?: string) => {
    const exam = get().exam;
    if (!exam?.id) return;
    set({ loading: true });
    const attempts = await getAttempts(exam.id, userId);
    if (attempts) {
      set({ attempts });
    } else {
      useToast.getState().error("Failed to fetch attempts.");
    }
    set({ loading: false });
  },
}));
