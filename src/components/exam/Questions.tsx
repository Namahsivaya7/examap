"use client";

import { Grid, List, theme } from "antd";
import QuestionCard from "@/components/exam/QuestionCard";
import { QuestionType } from "../../../types/prisma";

type Responses = Record<string, string[]>;
interface QuestionsProps {
  data: QuestionType[];
  loading?: boolean;
}

export default function Questions({ data, loading }: QuestionsProps) {
  const {
    token: { padding },
  } = theme.useToken();
  const { md } = Grid.useBreakpoint();

  return (
    <List
      size={md ? "large" : "small"}
      style={{
        padding,
        //marginBottom: 4 * padding,
        flex: 1,
        overflow: "auto",
      }}
      pagination={{
        onChange: (page) => {
          console.log(page);
        },
        pageSize: 5,
        hideOnSinglePage: true,
      }}
      dataSource={data}
      renderItem={(question, questionIndex) => (
        <QuestionCard
          key={question.id + "q-" + questionIndex}
          {...question}
          index={questionIndex}
          showResult={false}
          response={[]}
          notInExam
        />
      )}
    ></List>
  );
}
