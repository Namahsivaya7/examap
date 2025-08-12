import { Prisma } from "@prisma/client";

type ExamType = Prisma.ExamGetPayload<{
  include: {
    owner: true;
    subject: true;
    questions: true;
  };
}>;

type ExamTypeWithoutQuestions = Prisma.ExamGetPayload<{
  include: {
    owner: true;
    subject: true;
  };
}>;

type QuestionType = Prisma.QuestionGetPayload<{
  include: { subject: true; exams: true; user: true };
}>;

type UserType = Prisma.UserGetPayload<{
  include: {
    exams: {
      include: {
        owner: true;
        subject: true;
        questions: true;
      };
    };
    questions: {
      include: {
        subject: true;
        exams: true;
        user: true;
      };
    };
    attempts: {
      include: {
        user: true;
        exam: {
          include: {
            subject: true;
          };
        };
      };
    };
    tests: {
      include: {
        owner: true;
        exam: true;
        attempts: true;
      };
    };
  };
}>;

type AttemptType = Prisma.AttemptGetPayload<{
  include: {
    user: true;
    exam: {
      include: {
        subject: true;
      };
    };
  };
}>;

type TestType = Prisma.TestGetPayload<{
  include: {
    owner: true;
    exam: true;
    attempts: true;
  };
}>;

type SecureUser = Omit<User, "password">;
