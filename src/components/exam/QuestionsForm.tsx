"use client";

import {
  List,
  Button,
  Popconfirm,
  theme,
  Flex,
  Row,
  Col,
  Pagination,
  Typography,
  Watermark,
  Affix,
  Grid,
} from "antd";
import {
  FilterOutlined,
  SendOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import QuestionCard from "@/components/exam/QuestionCard";
import { hasResponse } from "@/utils/util";
import {
  AnsweredAllQuestions,
  QuestionsNotFound,
} from "@/components/exam/ErrorStatus";
import Timer from "./Timer";
import { AttemptType, ExamType } from "../../../types/prisma";
import { AttemptStatus, ExamResult, Question } from "@prisma/client";
import { appName } from "@/utils/config";
import { submitAttempt, updateAttempt } from "@/app/lib/api";

type Responses = Record<string, string[]>;
interface QuestionsProps {
  exam: ExamType;
  onSubmit: (responses: Responses) => void;
  attempt: AttemptType;
  inProgress: boolean;
}

export default function QuestionsForm({
  exam,
  attempt,
  onSubmit,
  inProgress,
}: QuestionsProps) {
  const allQuestions: Question[] = useMemo(() => exam.questions ?? [], [exam]);

  const [questions, setQuestions] = useState<Question[]>(allQuestions);

  const [responses, setResponses] = useState<Responses>(
    (attempt.responses as Responses) ?? {}
  );

  const responseRef = useRef(responses);

  const [showUnanswered, setShowUnanswered] = useState(false);

  const [answeredCount, setAnsweredCount] = useState(0);

  const {
    token: { colorBgContainer, padding, boxShadow },
  } = theme.useToken();

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { md } = Grid.useBreakpoint();

  const handlePagination = (page: number, pageSize: number) => {
    setPageSize(pageSize);
    setCurrentPage(page);
  };

  const handleChange =
    ({ id, options }: Question) =>
    (value: string[]) => {
      if (!inProgress) return;
      if (options.length === 0 && value[0].trim().length === 0) {
        value = [];
      }
      const newResponses = { ...responses, [id]: value };
      responseRef.current = newResponses;
      setResponses(newResponses);
    };

  const showUnansweredQuestions = () => {
    const filteredQuestions = questions.filter(
      (q, i) => !hasResponse(responses[q.id])
    );
    setQuestions(filteredQuestions);
    setShowUnanswered(true);
  };

  const showAllQuestions = () => {
    setQuestions(allQuestions);
    setShowUnanswered(false);
  };

  const handleSubmit = () => {
    setQuestions(allQuestions);
    setShowUnanswered(false);
    setResponses((responses) => {
      onSubmit?.(responses);
      return responses;
    });
  };

  useEffect(() => {
    if (inProgress) {
      // Paginated data
      const startIndex = Math.max(currentPage - 1, 0) * pageSize;
      setQuestions(allQuestions.slice(startIndex, startIndex + pageSize));
    }
  }, [currentPage, pageSize, allQuestions]);

  useEffect(() => {
    const answeredCount = allQuestions.filter((q, i) =>
      hasResponse(responses[q.id])
    ).length;
    setAnsweredCount(answeredCount);
  }, [responses, setAnsweredCount, allQuestions]);

  const isQuestionsEmpty = questions?.length === 0;
  const isAssessed = attempt.status === AttemptStatus.Assessed;

  useEffect(() => {
    function confirmExit() {
      if (inProgress) {
        updateAttempt(attempt.examId, attempt.id, {
          responses: responseRef.current,
        });
        return "You haven't submit the exam, please submit before closing the window.";
      }
    }

    if (inProgress) {
      window.onbeforeunload = confirmExit;
    }

    return () => {
      if (inProgress && attempt) {
        updateAttempt(attempt.examId, attempt.id, {
          responses: responseRef.current,
        });
      }
      window.onbeforeunload = null;
    };
  }, [inProgress, responseRef, attempt]);

  return (
    <Flex vertical style={{ gap: padding }}>
      {inProgress && (
        <Affix offsetTop={padding * 4}>
          <Row
            style={{
              boxShadow,
              padding: `${padding / 2}px ${2 * padding}px`,
              background: colorBgContainer,
            }}
          >
            <Col span={12}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {answeredCount} of {allQuestions.length} answered
              </Typography.Title>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {attempt.startTime && (
                  <Timer
                    duration={exam.timer}
                    startTime={attempt.startTime}
                    onFinish={handleSubmit}
                  />
                )}
              </Typography.Title>
            </Col>
          </Row>
        </Affix>
      )}

      <Watermark content={appName} font={{ color: "rgba(0, 0, 0, 0.05)" }}>
        <List
          size={md ? "large" : "small"}
          style={{
            padding,
            //marginBottom: 4 * padding,
            flex: 1,
            overflow: "auto",
          }}
        >
          {questions.map((question, questionIndex) => (
            <QuestionCard
              key={"q-" + questionIndex}
              {...question}
              handleChange={handleChange(question)}
              index={questionIndex}
              showResult={isAssessed}
              response={responses[question.id]}
              /*@ts-ignore FIXME*/
              isCorrectAnswer={!!attempt.result?.each?.[question.id] > 0}
            />
          ))}
          {showUnanswered && isQuestionsEmpty && (
            <AnsweredAllQuestions onAction={showAllQuestions} />
          )}
          {!showUnanswered && isQuestionsEmpty && (
            <QuestionsNotFound onAction={showAllQuestions} />
          )}
        </List>
      </Watermark>

      {inProgress && (
        <Row
          style={{
            paddingTop: padding,
            paddingBottom: padding,
            position: "fixed",
            bottom: 0,
            left: 0,
            padding,
            width: "100%",
            boxShadow,
            zIndex: 10,
            background: colorBgContainer,
          }}
        >
          <Col span={12}>
            <Pagination
              current={currentPage}
              onChange={handlePagination}
              total={allQuestions?.length}
              pageSize={pageSize}
              showSizeChanger
              pageSizeOptions={[1, 2, 5, 10, 15, 20, 50, 100]}
            />
          </Col>
          <Col span={12}>
            <Flex justify="flex-end" gap={padding}>
              {showUnanswered && (
                <Button
                  onClick={showAllQuestions}
                  icon={<UnorderedListOutlined />}
                  size="large"
                >
                  Show all
                </Button>
              )}
              {!showUnanswered && (
                <Button
                  onClick={showUnansweredQuestions}
                  icon={<FilterOutlined />}
                  size="large"
                  disabled={isQuestionsEmpty}
                >
                  Show unanswered
                </Button>
              )}
              <Popconfirm
                title="Are you sure want to submit the exam?"
                okText="Yes"
                cancelText="No"
                onConfirm={handleSubmit}
              >
                <Button
                  icon={<SendOutlined />}
                  type="primary"
                  size="large"
                  disabled={isQuestionsEmpty}
                >
                  Submit
                </Button>
              </Popconfirm>
            </Flex>
          </Col>
        </Row>
      )}
    </Flex>
  );
}
