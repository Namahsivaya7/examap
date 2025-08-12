import {
  getUser,
  getUserAttempts,
  getUserData,
  getUserExams,
  getUserQuestions,
  getUserTests,
  updateUser,
} from "@/app/lib/api";
import { create } from "zustand";
import {
  UserType,
  QuestionType,
  ExamType,
  AttemptType,
  TestType,
} from "../../types/prisma";
import { useToast } from "./toastStore";
import { UserData } from "@/utils/constants";

interface UserState {
  loading: boolean;
  user?: UserType;
  exams: ExamType[];
  attempts: AttemptType[];
  questions: QuestionType[];
  tests: TestType[];
  fetchUser: (id: string) => void;
  fetchUserData: (id: string, dataType?: UserData, cursor?: string) => void;
  reset: () => void;
  editUser: (q: Partial<UserType>) => void;
  fetchExams: () => void;
  fetchAttempts: () => void;
  fetchQuestions: () => void;
  fetchTests: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  loading: false,
  user: undefined,
  exams: [],
  attempts: [],
  questions: [],
  tests: [],

  fetchUser: async (userId: string) => {
    const userIdOpt = get().user?.id;
    if (userIdOpt) return;
    set({ loading: true });
    const user = await getUser(userId);
    if (user) {
      set({
        user,
      });
    } else {
      useToast.getState().error("Failed to fetch user.");
    }
    set({ loading: false });
  },

  fetchUserData: async (
    userId: string,
    dataType?: UserData,
    cursor?: string
  ) => {
    set({ loading: true });
    const user = await getUserData(userId, dataType, cursor);
    if (user) {
      const {
        attempts = get().attempts,
        exams = get().exams,
        questions = get().questions,
        tests = get().tests,
        ...restUser
      } = user;
      const attemptsWithUser = attempts.map((attempt) => ({
        ...attempt,
        user: restUser,
      }));
      const examsWithUser = exams.map((exam) => ({
        ...exam,
        owner: restUser,
      }));
      const testsWithUser = tests.map((test) => ({
        ...test,
        owner: restUser,
      }));
      const questionsWithUser = questions.map((question) => ({
        ...question,
        user: restUser,
      }));

      const data = {
        attempts: attemptsWithUser,
        exams: examsWithUser,
        questions: questionsWithUser,
        tests: testsWithUser,
      };

      set({
        user: { ...user, ...data },
        ...data,
      });
    } else {
      useToast.getState().error("Failed to fetch user data.");
    }
    set({ loading: false });
  },

  fetchExams: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    set({ loading: true });
    const exams = await getUserExams(userId);
    if (exams) {
      set({ exams });
    } else {
      useToast.getState().error("Failed to fetch exams.");
    }
    set({ loading: false });
  },

  fetchAttempts: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    set({ loading: true });
    const attempts = await getUserAttempts(userId);
    if (attempts) {
      set({ attempts });
    } else {
      useToast.getState().error("Failed to fetch attempts.");
    }
    set({ loading: false });
  },

  fetchQuestions: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    set({ loading: true });
    const questions = await getUserQuestions(userId);
    if (questions) {
      set({ questions });
    } else {
      useToast.getState().error("Failed to fetch questions.");
    }
    set({ loading: false });
  },

  fetchTests: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    set({ loading: true });
    const tests = await getUserTests(userId);
    if (tests) {
      set({ tests });
    } else {
      useToast.getState().error("Failed to fetch tests.");
    }
    set({ loading: false });
  },

  reset: () => {
    set({ user: undefined, loading: false });
  },

  editUser: async (userBody: Partial<UserType>) => {
    const user = get().user;
    if (!user?.id) return;
    set({ loading: true });
    const userOpt = await updateUser(user.id, userBody);
    const { success, error } = useToast.getState();
    if (userOpt) {
      set({ user: { ...user, ...userOpt } });
      success("Updated successfully.");
    } else {
      error("Update failed.");
    }
    set({ loading: false });
  },
}));
