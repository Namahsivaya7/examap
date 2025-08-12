import {
  Checkbox,
  List,
  Radio,
  Typography,
  Input,
  Badge,
  Skeleton,
  Space,
  theme,
  Grid,
} from "antd";
import { green, red } from "@ant-design/colors";
import { CSSProperties } from "react";
import { QuestionStatus, STATUS_COLORS } from "../../models/Exam";
import AnswerStateIcon from "./AnswerStateIcon";
import { AnswerType, Question } from "@prisma/client";
import Markdown from "react-markdown";

const optionStyles = (
  showResult: boolean,
  isAnswer: boolean | null,
  isResponse: boolean
) => {
  const styles: CSSProperties = {
    gap: "16px",
  };
  if (showResult) {
    styles.backgroundColor = isAnswer ? green[1] : isResponse ? red[1] : "";
    //styles.borderRadius = "4px";
    // if (isAnswer || isResponse) {
    //   styles.border = `1px solid ${
    //     isAnswer ? green[2] : isResponse ? red[2] : ""
    //   }`;
    //   styles.borderRadius = "4px";
    // }
  }

  return styles;
};

const badgeProps = (
  { response = [], showResult, isCorrectAnswer, marks }: QuestionCardProps,
  score?: number
) => {
  let status = QuestionStatus.Unanswered;
  if (showResult) {
    if (isCorrectAnswer) {
      status = QuestionStatus.Correct;
    } else {
      status = QuestionStatus.Incorrect;
    }
  } else {
    if (response.length > 0) {
      status = QuestionStatus.Answered;
    }
  }

  return {
    text: [score, marks].filter((n) => n != null).join(" / "),
    color: STATUS_COLORS[status],
  };
};

function SingleAnswer(props: QuestionCardProps) {
  const { options, handleChange, response, showResult } = props;
  return (
    <Radio.Group
      onChange={(event) => handleChange?.([event.target.value])}
      buttonStyle="outline"
      style={{ display: "block" }}
      value={response?.[0]}
    >
      {options?.map(({ id, label, isAnswer }) => {
        const isResponse = response?.includes(id);
        return (
          <List.Item
            key={id}
            style={optionStyles(showResult, isAnswer, isResponse)}
          >
            <Radio disabled={showResult} value={id}>
              <Markdown>{label}</Markdown>
            </Radio>
            <AnswerStateIcon
              showResult={showResult}
              isAnswer={isAnswer}
              isResponse={isResponse}
            />
          </List.Item>
        );
      })}
    </Radio.Group>
  );
}

function MultipleAnswer(props: QuestionCardProps) {
  const { options, handleChange, response, showResult: showResult } = props;
  return (
    <Checkbox.Group
      onChange={(value) => handleChange?.(value as string[])}
      style={{ display: "block" }}
      value={response}
    >
      {options?.map(({ id, label, isAnswer }) => {
        const isResponse = response?.includes(id);
        return (
          <List.Item
            key={id}
            style={optionStyles(showResult, isAnswer, isResponse)}
          >
            <Checkbox value={id} disabled={showResult}>
              <Markdown>{label}</Markdown>
            </Checkbox>
            <AnswerStateIcon
              showResult={showResult}
              isAnswer={isAnswer}
              isResponse={isResponse}
            />
          </List.Item>
        );
      })}
    </Checkbox.Group>
  );
}

function CustomAnswer(props: QuestionCardProps) {
  const {
    handleChange,
    response,
    showResult: showResult,
    answer,
    isCorrectAnswer,
  } = props;
  return (
    <>
      <List.Item
        style={optionStyles(showResult, isCorrectAnswer ?? false, true)}
      >
        <Input.TextArea
          rows={3}
          onChange={(event) => handleChange?.([event.target.value])}
          value={response?.[0]}
          disabled={showResult}
        />
        <AnswerStateIcon
          showResult={showResult}
          isAnswer={isCorrectAnswer}
          isResponse={true}
        />
      </List.Item>
      {showResult && answer?.length && (
        <List.Item style={optionStyles(showResult, true, false)}>
          <Input.TextArea rows={3} value={answer ?? ""} />
          <AnswerStateIcon showResult={showResult} isAnswer={true} />
        </List.Item>
      )}
    </>
  );
}

interface QuestionCardProps extends Partial<Question> {
  response: string[];
  showResult: boolean;
  index?: number;
  isCorrectAnswer?: boolean;
  handleChange?: (v: string[]) => void;
  notInExam?: boolean;
  score?: number;
}

export default function QuestionCard(props: QuestionCardProps) {
  const {
    index = 0,
    title: question,
    answerType,
    isCorrectAnswer,
    showResult,
    score,
  } = props;
  const {
    token: { padding, colorError, colorSuccess },
  } = theme.useToken();
  const { md } = Grid.useBreakpoint();
  const cardStyle: CSSProperties = {
    marginBottom: padding,
  };

  if (showResult) {
    cardStyle.borderColor = isCorrectAnswer ? colorSuccess : colorError;
  }

  return (
    <Badge.Ribbon {...badgeProps(props, score)}>
      <List
        header={
          <Space align="start">
            <Typography.Text strong>{index + 1}.</Typography.Text>
            <Typography.Text strong>
              <Markdown>{question}</Markdown>
            </Typography.Text>
          </Space>
        }
        size={md ? "large" : "small"}
        bordered
        style={cardStyle}
        className="question-card"
      >
        {answerType === AnswerType.Single && <SingleAnswer {...props} />}
        {answerType === AnswerType.Multi && <MultipleAnswer {...props} />}
        {answerType === AnswerType.Essay && <CustomAnswer {...props} />}
      </List>
    </Badge.Ribbon>
  );
}
