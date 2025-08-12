import React, { useState } from "react";
import {
  Button,
  Drawer,
  Input,
  Form,
  Empty,
  Typography,
  Alert,
  theme,
  Space,
  Tooltip,
  Flex,
} from "antd";
import { createTest } from "@/app/lib/api";
import { useSession } from "next-auth/react";
import { Test } from "@prisma/client";
import { useToast } from "@/store/toastStore";
import { ExamType } from "../../../types/prisma";
import { PATHS, UserData } from "@/utils/constants";
import Link from "next/link";
import SocialShare from "../SocialShare";
import { appName } from "@/utils/config";

type FieldType = {
  name?: string;
};

interface CreateGrupProps {
  exam: ExamType;
  children?: React.ReactNode;
}

export default function CreateTest({ exam, children }: CreateGrupProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [test, setTest] = useState<Test>();
  const error = useToast((state) => state.error);
  const {
    token: { padding },
  } = theme.useToken();

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onFinish = async (values: any) => {
    if (!session?.user.id) return;
    const test = await createTest({
      name: values.name,
      ownerId: session?.user.id,
      examId: exam.id,
    });
    if (test) {
      setTest(test);
    } else {
      error(`Failed to create Test: ${values.name}`);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const testLink = `${location.origin}${PATHS.EXAMS}${exam.id}?testId=${test?.id}`;

  return (
    <>
      <Tooltip title="If you want to conduct test for a selected group of people.">
        <Button type="primary" onClick={showDrawer} size="large">
          {children || "Create Test"}
        </Button>
      </Tooltip>

      <Drawer
        title="Create Test"
        placement="right"
        onClose={onClose}
        open={open}
      >
        {!test && (
          <Form
            name="basic"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
          >
            <Form.Item<FieldType>
              label="Test Name"
              name="name"
              rules={[{ required: true, message: "Please input test name!" }]}
              help="Name should be relevant to the exam and easy to recall. Test name only visible to you/owner of the test."
            >
              <Input.TextArea placeholder="Basic JS Test for CSE Section 1" />
            </Form.Item>

            <Form.Item style={{ textAlign: "right" }}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        )}
        {test && (
          <Alert
            message={<Typography.Title level={3}>{test.name}</Typography.Title>}
            description={
              <Flex vertical gap={padding}>
                <Typography.Paragraph
                  copyable={{
                    text: testLink,
                    tooltips: true,
                  }}
                >
                  Test created! Share the below link with anyone who needs to
                  take the test.
                  <pre style={{ marginTop: padding }}>{testLink}</pre>
                  Copy sharable link.
                </Typography.Paragraph>
                <SocialShare
                  key="social"
                  url={testLink}
                  title={`${appName} - ${exam.title}`}
                  description={exam.description ?? ""}
                />
                <Typography.Paragraph>
                  You can find the test responses{" "}
                  <Link
                    href={`${PATHS.EXAMS}${exam.id}/attempts?testId=${test?.id}`}
                  >
                    here
                  </Link>{" "}
                  or in{" "}
                  <Link
                    href={`${PATHS.USERS}${session?.user.id}?active=${UserData.TESTS}`}
                  >
                    My Space
                  </Link>
                </Typography.Paragraph>
              </Flex>
            }
            type="info"
          />
        )}
      </Drawer>
    </>
  );
}
