"use client";
import ExamDetails from "@/components/exam/ExamDetails";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Skeleton, theme } from "antd";
import {
  getAttempt,
  getExam,
  startAttempt,
  submitAttempt,
  updateDeviatedAttempt,
} from "@/app/lib/api";
import QuestionsForm from "@/components/exam/QuestionsForm";
import { AttemptType, ExamType } from "../../../../../../types/prisma";
import { Attempt, AttemptStatus } from "@prisma/client";
import { Helmet } from "react-helmet";
import { appName } from "@/utils/config";
import { isExamElapsed } from "@/utils/util";
import VisibilityCheck from "@/components/VisibilityCheck";
import { useToast } from "@/store/toastStore";
import ResultCard, { StaleResultCard } from "@/components/exam/ResultCard";
import { useSession } from "next-auth/react";

export default function Attempt({
  params,
}: {
  params: { examId: string; attemptId: string };
}) {
  const { data: session } = useSession();
  const [exam, setExam] = useState<ExamType | undefined>();
  const [attempt, setAttempt] = useState<AttemptType | undefined>();
  const [examLoading, setExamLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const examRef = useRef(null);
  const error = useToast((state) => state.error);

  const {
    token: { padding, colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleAttemptChange = useCallback(
    (attemptOpt?: Partial<AttemptType> | AttemptType) => {
      if (!attemptOpt) {
        setAttempt(undefined);
      }
      setAttempt({ ...(attempt || {}), ...attemptOpt } as AttemptType);
    },
    [attempt]
  );

  useEffect(() => {
    if (!params?.examId || !params.attemptId) return;
    setLoading(true);
    getAttempt(params.examId, params.attemptId)
      .then((attempt) => {
        // if has startTime, came here in reload
        if (
          attempt.status === AttemptStatus.Created &&
          attempt.userId === session?.user.id
        ) {
          setLoading(true);
          startAttempt(attempt.examId, attempt.id)
            .then(handleAttemptChange)
            .catch(() => {
              error("Failed to start the exam!");
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          handleAttemptChange(attempt);
        }
      })
      .catch((err) => {
        error("Attempt not found.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.examId, params.attemptId]);

  useEffect(() => {
    if (!params.examId) return;
    setExamLoading(true);
    getExam(params.examId)
      .then((res) => {
        setExam(res);
        setExamLoading(false);
      })
      .catch(() => {
        setExam(undefined);
        setExamLoading(false);
      });
  }, [params.examId]);

  const handleSubmit = async (responses: Record<string, string[]>) => {
    if (!exam?.id || !attempt?.id) return;
    setLoading(true);
    const attemptOpt = await submitAttempt(exam?.id, attempt?.id, {
      responses,
    });
    if (attemptOpt?.result) {
      handleAttemptChange(attemptOpt);
    } else {
      error("Failed to submit the exam.");
    }
    setLoading(false);
  };

  const handleElapsedSubmit = async () => {
    handleSubmit(attempt?.responses as Record<string, string[]>);
  };

  const handleSwitch = async () => {
    if (!attempt?.examId || !attempt.id) return;
    updateDeviatedAttempt(attempt.examId, attempt.id);
  };

  const isElapsed = isExamElapsed(attempt, exam);
  const inProgress = useMemo(
    () => !isElapsed && attempt?.status === AttemptStatus.InProgress,
    [isElapsed, attempt?.status]
  );

  useEffect(() => {
    if (inProgress && examRef.current) {
      // openFullscreen(examRef.current);
    }
  }, [examRef, inProgress]);

  return (
    <>
      <Helmet title={`${appName} | Exam | ${exam?.title}`} />

      {inProgress && <VisibilityCheck onEvent={handleSwitch} />}

      <Skeleton loading={examLoading}>
        {exam && <ExamDetails exam={exam} />}
      </Skeleton>

      <Skeleton loading={loading}>
        {attempt && exam && (
          <>
            {isElapsed && (
              <StaleResultCard
                attempt={attempt}
                handleSubmit={handleElapsedSubmit}
              />
            )}
            {!isElapsed && <ResultCard attempt={attempt} />}
            <Skeleton loading={!attempt?.startTime}>
              <div
                className="test-screen"
                ref={examRef}
                style={{ background: colorBgContainer }}
              >
                <QuestionsForm
                  exam={exam}
                  attempt={attempt}
                  onSubmit={handleSubmit}
                  inProgress={inProgress}
                />
              </div>
            </Skeleton>
          </>
        )}
      </Skeleton>
    </>
  );
}
