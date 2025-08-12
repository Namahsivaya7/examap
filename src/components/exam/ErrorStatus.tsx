import { Button, Result } from "antd";
import { SmileOutlined } from "@ant-design/icons";

interface ErrorStatusProps {
  onAction: () => void;
}

export function AnsweredAllQuestions({ onAction }: ErrorStatusProps) {
  return (
    <Result
      icon={<SmileOutlined />}
      title="Looks like you have answered all the questions!"
      extra={
        <Button type="primary" onClick={onAction}>
          Show all
        </Button>
      }
    />
  );
}

export function QuestionsNotFound({ onAction }: ErrorStatusProps) {
  return (
    <Result
      status="404"
      title="Looks like nothing here."
      subTitle="Sorry, check back some other time."
      extra={
        <Button type="primary" onClick={onAction}>
          Back
        </Button>
      }
    />
  );
}
