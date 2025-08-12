"use client";

import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Flex,
  theme,
  Typography,
  Col,
  Row,
  Card,
  InputNumber,
  Avatar,
  Space,
  Select,
  Switch,
} from "antd";
import {
  FileTextOutlined,
  FileImageOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import TagEditor from "../TagEditor";
import SubjectSelect from "../SubjectSelect";
import { Exam, ExamStatus, Subject } from "@prisma/client";
import CreateSubject from "../CreateSubject";

interface DefaultValues extends Partial<Exam> {
  subject: Subject;
}

interface ExamFormProps {
  onSubmit: (d: Partial<Exam>) => void;
  submitText: string;
  defaultValues?: DefaultValues;
  fullWidth?: boolean;
}

const StatusOptions = Object.keys(ExamStatus).map((k) => ({
  label: k,
  value: k,
}));

export default function ExamForm({
  onSubmit,
  defaultValues,
  submitText,
  fullWidth,
}: ExamFormProps) {
  const { data: session, status } = useSession();
  const [avatar, setAvatar] = useState(defaultValues?.avatar ?? "");
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const {
    token: { padding },
  } = theme.useToken();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const examBody = {
      ...values,
      tags,
      ownerId: session?.user.id,
    };
    onSubmit(examBody);
  };

  return (
    <Flex vertical flex={1}>
      <Form
        name="exam"
        className="exam-form"
        initialValues={
          defaultValues
            ? defaultValues
            : { status: ExamStatus.Draft, manualAssess: false, benchmark: 40.0 }
        }
        layout="vertical"
        onFinish={onFinish}
        form={form}
      >
        <Row>
          <Col xs={24} md={fullWidth ? 24 : 16}>
            <Flex vertical gap={padding}>
              <Card
                title="Basic"
                extra={
                  <Form.Item
                    name="status"
                    rules={[
                      {
                        required: true,
                        message: "Please enter the status of the exam!",
                      },
                    ]}
                    noStyle
                  >
                    <Select style={{ width: 120 }} options={StatusOptions} />
                  </Form.Item>
                }
              >
                <Row gutter={padding}>
                  <Col md={12} xs={24}>
                    <Form.Item
                      name="title"
                      label="Exam Title"
                      rules={[
                        {
                          required: true,
                          message: "Please enter title of the exam!",
                        },
                      ]}
                    >
                      <Input
                        prefix={
                          <FileTextOutlined className="site-form-item-icon" />
                        }
                        placeholder="Exam Title"
                      />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item
                      name="subjectId"
                      label="Subject / Topic"
                      rules={[
                        {
                          required: true,
                          message: "Please enter subject or topic of the exam",
                        },
                      ]}
                    >
                      <SubjectSelect
                        placeholder="Subject/Topic"
                        style={{ width: "100%" }}
                        defaultValue={defaultValues?.subjectId}
                        options={[
                          {
                            value: defaultValues?.subjectId,
                            label: defaultValues?.subject?.name,
                          },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item
                      name="timer"
                      label="Duration"
                      rules={[
                        {
                          required: true,
                          message: "Please enter exam duration in minutes",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        prefix={
                          <ClockCircleOutlined className="site-form-item-icon" />
                        }
                        addonAfter="minutes"
                        type="number"
                        placeholder="Exam duration in mins"
                        min={1}
                      />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item name="benchmark" label="Benchmark / Pass Marks">
                      <InputNumber
                        style={{ width: "100%" }}
                        prefix={
                          <PercentageOutlined className="site-form-item-icon" />
                        }
                        placeholder="Percentage of marks needed to pass"
                        max={100}
                        min={0}
                        addonAfter="Percent"
                        type="number"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Flex gap={padding / 2}>
                      <Form.Item
                        label="Avatar / Icon URL"
                        name="avatar"
                        rules={[
                          {
                            required: false,
                            message:
                              "Please enter avatar url (Icon) for the exam if any!",
                          },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <Input
                          prefix={
                            <FileImageOutlined className="site-form-item-icon" />
                          }
                          placeholder="Avatar / Icon / Image URL"
                          onChange={(e) => setAvatar(e.target.value)}
                        />
                      </Form.Item>
                      {avatar && avatar.length > 0 && (
                        <Avatar style={{ alignSelf: "center" }} src={avatar} />
                      )}
                    </Flex>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item
                      label="Evaluation / Assessment Mode"
                      name="manualAssess"
                      rules={[
                        {
                          required: true,
                          message: "Please enter evaluation mode",
                        },
                      ]}
                      help="If Exam has Essay type question(s), go for Manual if not single word answers"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Manual"
                        unCheckedChildren="Automatic"
                        size="default"
                      />
                    </Form.Item>
                  </Col>

                  <Col md={12} xs={24}>
                    <Form.Item name="description" label="Description">
                      <Input.TextArea
                        placeholder="Describe what this exam for..."
                        rows={3}
                        maxLength={200}
                        showCount
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card title="Organisation (Optional)">
                <Row gutter={padding}>
                  <Col md={12} xs={24}>
                    <Form.Item
                      name={["org", "name"]}
                      label="Name of Organisation/School/College"
                      rules={[
                        {
                          required: false,
                          message: "Please enter Organisation name!",
                        },
                      ]}
                    >
                      <Input
                        prefix={
                          <BankOutlined className="site-form-item-icon" />
                        }
                        placeholder="Organisation Name"
                      />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item
                      name={["org", "address"]}
                      label="Address/City/Location"
                      rules={[
                        {
                          required: false,
                          message: "Please enter your organisation address!",
                        },
                      ]}
                    >
                      <Input
                        prefix={
                          <EnvironmentOutlined className="site-form-item-icon" />
                        }
                        placeholder="Organisation Address"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card title="Tags">
                <TagEditor onChange={setTags} initialValue={tags} />
              </Card>

              <Form.Item style={{ textAlign: "right" }}>
                <Button
                  style={{ width: "auto" }}
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                >
                  {submitText}
                </Button>
              </Form.Item>
            </Flex>
          </Col>
        </Row>
      </Form>
    </Flex>
  );
}
