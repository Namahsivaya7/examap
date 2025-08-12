"use client";

import {
  List,
  Button,
  Popconfirm,
  theme,
  Flex,
  Tooltip,
  Drawer,
  Space,
  Slider,
  Typography,
} from "antd";
import {
  SecurityScanOutlined,
  FileSearchOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import QuestionCard from "@/components/exam/QuestionCard";
import { QuestionsNotFound } from "@/components/exam/ErrorStatus";

import { AttemptType, ExamType } from "../../../types/prisma";
import { AnswerType, AttemptStatus, Question } from "@prisma/client";
import ResultCard from "./ResultCard";
import Link from "next/link";
import { PATHS } from "@/utils/constants";
import { useSession } from "next-auth/react";

export type Assessment = Record<string, number>;
interface ExamResultProps {
  exam: ExamType;
  attempt?: AttemptType;
  onClose: () => void;
  onAssessmentSubmit?: (assessment: Assessment) => void;
}

export default function ExamResult({
  exam,
  attempt,
  onClose,
  onAssessmentSubmit,
}: ExamResultProps) {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState(exam.questions);

  const [assessment, setAssessment] = useState<Assessment>(
    (attempt?.result?.each as Assessment) ?? {}
  );

  const assessmentRef = useRef(assessment);

  const [assessedCount, setAssessedCount] = useState(0);

  const [isAssessing, setIsAssessing] = useState(false);

  const {
    token: { colorBgContainer, padding, boxShadow },
  } = theme.useToken();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!!attempt);
    setAssessment((attempt?.result?.each as Assessment) ?? {});
    setAssessedCount(0);
  }, [attempt]);

  const handleChange =
    ({ id }: Question) =>
    (value: number) => {
      const newResponses = { ...assessment, [id]: value };
      assessmentRef.current = newResponses;
      setAssessment(newResponses);
    };

  const handleSubmit = () => {
    setAssessment((assessment) => {
      onAssessmentSubmit?.(assessment);
      return assessment;
    });
    setIsAssessing(false);
    setAssessedCount(0);
    setQuestions(exam.questions);
  };

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    const assessedCount = questions.filter(
      (q, i) => assessment[q.id] != null
    ).length;
    setAssessedCount(assessedCount);
  }, [assessment, setAssessedCount, questions]);

  const isQuestionsEmpty = questions?.length === 0;
  const isAssessed = attempt?.status === AttemptStatus.Assessed;

  const isExamOwner = exam.ownerId === session?.user.id;

  return (
    <Drawer
      title={attempt?.user?.name}
      placement="right"
      onClose={handleClose}
      open={open}
      width={640}
      extra={
        <Link
          target="_blank"
          href={`${PATHS.EXAMS}${exam.id}${PATHS.ATTEMPTS}${attempt?.id}`}
        >
          <Button type="link" icon={<ExportOutlined />}>
            Open in new page
          </Button>
        </Link>
      }
    >
      {attempt && (
        <Flex vertical style={{ gap: padding }}>
          <ResultCard attempt={attempt} />
          {isExamOwner && (
            <Flex
              style={{ padding: padding / 2, paddingBottom: 0 }}
              gap={padding}
              justify="flex-end"
              align="center"
            >
              {!isAssessed && !isAssessing && (
                <Button
                  icon={<FileSearchOutlined />}
                  type="primary"
                  onClick={() => {
                    setIsAssessing(true);
                    setQuestions(
                      questions.filter((q) => q.answerType === AnswerType.Essay)
                    );
                  }}
                >
                  Evaluate
                </Button>
              )}
              {isAssessed && !isAssessing && (
                <>
                  {attempt.deviatedCount && (
                    <Typography.Text type="secondary">
                      Deviated <b>{attempt.deviatedCount}</b> time(s)
                    </Typography.Text>
                  )}
                  <Button
                    icon={<FileSearchOutlined />}
                    type="dashed"
                    onClick={() => {
                      setIsAssessing(true);
                      setQuestions(
                        questions.filter(
                          (q) => q.answerType === AnswerType.Essay
                        )
                      );
                    }}
                  >
                    Revaluate
                  </Button>
                </>
              )}
              {isAssessing && (
                <Typography>
                  {assessedCount} of {questions.length} assessed{" "}
                </Typography>
              )}
            </Flex>
          )}
          <List
            size="small"
            style={{
              padding: padding / 2,
              //marginBottom: 4 * padding,
              flex: 1,
              overflow: "auto",
            }}
            pagination={{
              pageSize: 5,
              hideOnSinglePage: true,
            }}
          >
            {questions.map((question, questionIndex) => (
              <>
                <QuestionCard
                  key={"q-" + questionIndex}
                  {...question}
                  index={questionIndex}
                  showResult={true}
                  response={
                    /*@ts-ignore FIXME*/
                    (attempt.responses?.[question.id] ?? []) as string[]
                  }
                  isCorrectAnswer={
                    /*@ts-ignore FIXME*/
                    attempt.result?.each?.[question.id] > exam.benchmark / 100
                  }
                  /*@ts-ignore FIXME*/
                  score={attempt.result?.each?.[question.id]}
                />

                {isAssessing && (
                  <div
                    style={{ width: "100%", padding, paddingTop: padding / 2 }}
                  >
                    <Slider
                      min={0}
                      step={question.marks / 10}
                      max={question.marks}
                      dots
                      value={assessment[question.id]}
                      onChange={handleChange(question)}
                      onAfterChange={handleChange(question)}
                      disabled={question.answerType !== AnswerType.Essay}
                      marks={{ 0: "0 %", [question.marks]: "100 %" }}
                    />
                  </div>
                )}
              </>
            ))}
            {isQuestionsEmpty && <QuestionsNotFound onAction={handleClose} />}
          </List>
          {isAssessing && (
            <Button
              icon={<FileDoneOutlined />}
              type="primary"
              onClick={handleSubmit}
              disabled={assessedCount !== questions.length}
            >
              Submit
            </Button>
          )}
        </Flex>
      )}
    </Drawer>
  );
}
