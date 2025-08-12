import React, { useState } from "react";
import { Button, Drawer } from "antd";
import QuestionForm from "./QuestionForm";
import { ExamType, QuestionType } from "../../../types/prisma";
import { EditOutlined } from "@ant-design/icons";
import { useExamStore } from "@/store/examStore";

interface EditQuestionProps {
  exam: ExamType;
  question: QuestionType;
  editText?: React.ReactNode;
}

export default function EditQuestion({
  question,
  editText,
}: EditQuestionProps) {
  const [open, setOpen] = useState(false);
  const exam = useExamStore((state) => state.exam);
  const editQuestion = useExamStore((state) => state.editQuestion);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const handleSubmit = (questionBody: Partial<QuestionType>) => {
    if (!question.id) return;
    editQuestion(question.id, questionBody);
  };

  return (
    <>
      <Button icon={<EditOutlined />} type="primary" onClick={showDrawer}>
        {editText}
      </Button>
      <Drawer
        title="Edit Question"
        placement="right"
        onClose={onClose}
        open={open}
      >
        <QuestionForm
          exam={exam}
          onSubmit={handleSubmit}
          submitText="Add question"
        />
      </Drawer>
    </>
  );
}
