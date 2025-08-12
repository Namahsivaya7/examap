import React, { useState } from "react";
import { Button, Input, Form, Typography, theme, Space, Flex } from "antd";
import { createSubject } from "@/app/lib/api";
import { Subject } from "@prisma/client";
import { useToast } from "@/store/toastStore";

type FieldType = {
  name?: string;
  description?: string;
};

interface CreateSubjectProps {
  onCreate?: (subject: Subject) => void;
}

export default function CreateSubject({ onCreate }: CreateSubjectProps) {
  const [form] = Form.useForm();
  const [name, setName] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const error = useToast((state) => state.error);
  const {
    token: { padding },
  } = theme.useToken();

  const onFinish = async (values: any) => {
    const subject = await createSubject(values);
    if (subject) {
      onCreate?.(subject);
      form.resetFields();
    } else {
      error(`Failed to create Subject: ${values.name}`);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      name="basic"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      layout="vertical"
      form={form}
      style={{ padding: padding / 2 }}
      title="Create New Subject"
    >
      <Typography.Text style={{ marginBottom: padding }} strong>
        Create New Subject
      </Typography.Text>

      <Form.Item<FieldType>
        label="Subject Name"
        name="name"
        rules={[{ required: true, message: "Please input subject name!" }]}
      >
        <Input
          placeholder="JavaScript"
          onChange={(e) => setName(e.target.value)}
          autoFocus
          onClick={(e: React.MouseEvent<HTMLInputElement>) =>
            e.currentTarget.focus()
          }
        />
      </Form.Item>

      <Form.Item<FieldType>
        label="Description"
        name="description"
        rules={[
          {
            message: "Please input subject description!",
          },
        ]}
        help={
          showHelp && (
            <Typography.Link
              target="_blank"
              href={`https://en.wikipedia.org/wiki/${name}`}
            >
              See Wiki for description.
            </Typography.Link>
          )
        }
      >
        <Input.TextArea
          placeholder="JavaScript is a programming language..."
          onFocus={() => {
            setShowHelp(name.trim().length > 0);
          }}
          maxLength={500}
          showCount
          rows={6}
          onClick={(e: React.MouseEvent<HTMLTextAreaElement>) =>
            e.currentTarget.focus()
          }
        />
      </Form.Item>

      <Flex justify="flex-end">
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Flex>
    </Form>
  );
}
