import { CheckSquareOutlined, CloseSquareOutlined } from "@ant-design/icons";
import { green, red } from "@ant-design/colors";

interface AnswerStateIconProps {
  showResult: boolean;
  isResponse?: boolean;
  isAnswer?: boolean | null;
}

export default function AnswerStateIcon({
  showResult,
  isAnswer,
  isResponse,
}: AnswerStateIconProps) {
  return (
    <div>
      {showResult &&
        (isAnswer ? (
          <CheckSquareOutlined style={{ fontSize: 20, color: green.primary }} />
        ) : (
          isResponse && (
            <CloseSquareOutlined style={{ fontSize: 20, color: red.primary }} />
          )
        ))}
    </div>
  );
}
