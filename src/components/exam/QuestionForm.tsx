"use client";

import React, { useEffect, useState } from "react";
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
  Segmented,
  Checkbox,
  Radio,
  Divider,
  Switch,
  Space,
} from "antd";
import {
  CloseOutlined,
  EyeFilled,
  EyeInvisibleFilled,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import {
  AnswerType,
  Option,
  Question,
  QuestionStatus,
  Subject,
} from "@prisma/client";
import SubmitButton from "../SubmitButton";
import QuestionCard from "./QuestionCard";
import SubjectSelect from "../SubjectSelect";
import { ExamType } from "../../../types/prisma";
import { useToast } from "@/store/toastStore";
import Image from "next/image";
import Link from "next/link";

type DefaultValues = Partial<Question>;

interface QuestionFormProps {
  onSubmit: (d: Partial<Question>) => void;
  submitText: string;
  exam?: ExamType;
  defaultValues?: DefaultValues;
  fullWidth?: boolean;
}

const answerTypeOptions = [
  {
    value: AnswerType.Essay,
    label: "Essay",
  },
  {
    value: AnswerType.Single,
    label: "Choice (Single)",
  },
  {
    value: AnswerType.Multi,
    label: "Choice (Multiple)",
  },
];

const visibilityOptions = [
  {
    value: QuestionStatus.Public,
    label: "Public",
  },
  {
    value: QuestionStatus.Private,
    label: "Private",
  },
];

const toId = (i: number) => i + 1 + "";

export default function QuestionForm({
  exam,
  onSubmit,
  defaultValues,
  submitText,
  fullWidth,
}: QuestionFormProps) {
  const [form] = Form.useForm();
  const { data: session, status } = useSession();
  const {
    token: { padding },
  } = theme.useToken();
  const error = useToast((state) => state.error);

  const [showPreview, setShowPreview] = useState(true);
  const [formValues, setFormValues] = useState(
    defaultValues ?? {
      title: "",
      marks: 1,
      answerType: AnswerType.Essay,
      subjectId: exam?.subjectId,
      status: QuestionStatus.Public,
    }
  );

  const onFinish = async (values: any) => {
    const { options, answers, ...rest } = values;
    if (answerType !== AnswerType.Essay && options.length < 2) {
      error("Multiple choice question should have at least two options");
      return;
    }
    if (answerType === AnswerType.Multi) {
      if (options.filter((o: Option) => o.isAnswer).length <= 1) {
        error("Should have at least two answers");
        return;
      }
    } else if (answerType === AnswerType.Single) {
      if (options.filter((o: Option) => o.isAnswer).length !== 1) {
        error("Should have at least one answer");
        return;
      }
    }

    const questionBody = {
      ...rest,
      options,
      userId: session?.user.id,
      examId: exam?.id,
    };
    onSubmit(questionBody);
  };

  useEffect(() => {
    form.resetFields();
    const initialValues = defaultValues ?? {
      title: "",
      marks: 1,
      answerType: AnswerType.Essay,
      subjectId: exam?.subjectId,
      status: QuestionStatus.Public,
      options: [],
    };
    form.setFieldsValue(initialValues);
    setFormValues(initialValues);
  }, [exam, form, defaultValues]);

  const answerType = form.getFieldValue("answerType");

  return (
    <Flex vertical flex={1}>
      <Form
        form={form}
        name="question"
        className="question-form"
        initialValues={
          defaultValues ?? {
            title: "",
            marks: 1,
            answerType: AnswerType.Essay,
            subjectId: exam?.subjectId,
            status: QuestionStatus.Public,
          }
        }
        onFinish={onFinish}
        layout="vertical"
        onValuesChange={(a, b) => setFormValues(b)}
        size="middle"
        preserve
      >
        <Row gutter={padding / 2}>
          <Col xs={24} lg={fullWidth ? 24 : showPreview ? 12 : 24}>
            <Flex vertical gap={padding}>
              <Card
                title="Question"
                extra={
                  <Switch
                    checkedChildren={
                      <Typography style={{ color: "white" }}>
                        <EyeInvisibleFilled style={{ color: "white" }} />{" "}
                      </Typography>
                    }
                    unCheckedChildren={
                      <Typography>
                        <EyeFilled style={{ color: "white" }} />
                      </Typography>
                    }
                    defaultChecked
                    onChange={setShowPreview}
                    checked={showPreview}
                  />
                }
              >
                <Row gutter={padding}>
                  <Col xs={24}>
                    <Form.Item
                      label="Question"
                      name="title"
                      rules={[
                        {
                          required: true,
                          message: "Please enter title of the question!",
                        },
                      ]}
                      help={
                        <Flex
                          align="center"
                          gap={padding / 4}
                          justify="flex-end"
                        >
                          <Image
                            src="/md.svg"
                            width={25}
                            height={15}
                            alt="md"
                            style={{ opacity: 0.5 }}
                          />
                          <Link
                            href="https://www.markdownguide.org/basic-syntax/"
                            target="_blank"
                          >
                            supported
                          </Link>
                        </Flex>
                      }
                    >
                      <Input.TextArea placeholder="Enter question" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={padding}>
                  <Col xs={24} sm={12} xxl={4}>
                    <Form.Item
                      label="Points/Marks"
                      name="marks"
                      rules={[
                        {
                          required: true,
                          message: "Please enter points for the question!",
                        },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        placeholder="Enter points for this question"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} xxl={8}>
                    <Form.Item
                      label="Visibility"
                      name="status"
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                      required
                      tooltip="Public means anyone can add your question to their exam."
                    >
                      <Segmented
                        options={visibilityOptions}
                        size="middle"
                        block
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} xxl={12}>
                    <Form.Item
                      label="Topic/Subject"
                      name="subjectId"
                      rules={[
                        {
                          required: true,
                          message: "Please select subject of the question!",
                        },
                      ]}
                    >
                      <SubjectSelect
                        placeholder="JavaScript"
                        options={[
                          {
                            value: exam?.subjectId,
                            label: exam?.subject?.name,
                          },
                        ]}
                        disabled={exam?.subjectId != null}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Divider></Divider>
                <Row gutter={padding}>
                  <Col xs={24}>
                    <Form.Item
                      name="answerType"
                      label="Select answer type"
                      required
                      shouldUpdate
                    >
                      <Segmented
                        options={answerTypeOptions}
                        size="middle"
                        block
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    {answerType === AnswerType.Essay && (
                      <Form.Item
                        label="Essay answer"
                        name={"answer"}
                        rules={[
                          {
                            required: true,
                            message: "Please enter answer for the question!",
                          },
                        ]}
                      >
                        <Input.TextArea
                          placeholder="Enter answer"
                          style={{ resize: "none" }}
                        />
                      </Form.Item>
                    )}
                    {answerType !== AnswerType.Essay && (
                      <Form.Item
                        label="Add choices"
                        name={["answers", 0]}
                        rules={[
                          {
                            required: answerType === AnswerType.Single,
                          },
                        ]}
                      >
                        <Radio.Group style={{ width: "100%" }}>
                          <Form.List
                            name="options"
                            initialValue={[
                              {
                                id: "1",
                                label: "",
                              },
                            ]}
                          >
                            {(fields, { add, remove }) => (
                              <>
                                {fields.map(
                                  ({ key, name, ...restField }, i) => {
                                    const id = toId(i);
                                    return (
                                      <Flex
                                        gap={padding}
                                        key={key}
                                        align="center"
                                        justify="space-between"
                                      >
                                        <Form.Item
                                          {...restField}
                                          name={[name, "id"]}
                                          rules={[
                                            {
                                              required: true,
                                            },
                                          ]}
                                          initialValue={id}
                                          hidden
                                        >
                                          <Input value={id} />
                                        </Form.Item>

                                        <Form.Item
                                          style={{ alignSelf: "flex-end" }}
                                        >
                                          <Typography>{id}.</Typography>
                                        </Form.Item>

                                        <Form.Item
                                          {...restField}
                                          name={[name, "label"]}
                                          rules={[
                                            {
                                              required: true,
                                              message:
                                                "Choice label is required.",
                                            },
                                          ]}
                                          label="Choice label"
                                          style={{ flex: 1 }}
                                        >
                                          <Input />
                                        </Form.Item>

                                        <Form.Item
                                          {...restField}
                                          name={[name, "isAnswer"]}
                                          valuePropName="checked"
                                          label="Is answer?"
                                        >
                                          {answerType === AnswerType.Multi ? (
                                            <Checkbox />
                                          ) : (
                                            <Radio
                                              value={id}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  const options =
                                                    form.getFieldValue(
                                                      "options"
                                                    );
                                                  form.setFieldValue(
                                                    "options",
                                                    options.map(
                                                      (o: Option) => ({
                                                        ...o,
                                                        isAnswer: o.id === id,
                                                      })
                                                    )
                                                  );
                                                }
                                              }}
                                            />
                                          )}
                                        </Form.Item>

                                        <Button
                                          danger
                                          type="link"
                                          icon={<CloseOutlined />}
                                          onClick={() => {
                                            if (
                                              form
                                                .getFieldValue("answers")
                                                ?.includes(id)
                                            ) {
                                              form.setFieldValue("answers", []);
                                            }
                                            remove(name);
                                          }}
                                        ></Button>
                                      </Flex>
                                    );
                                  }
                                )}
                                <Form.Item>
                                  <Button
                                    type="dashed"
                                    onClick={() =>
                                      add({
                                        id: toId(fields.length),
                                        label: "",
                                      })
                                    }
                                    icon="+"
                                    block
                                    size="middle"
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    Add another option
                                  </Button>
                                </Form.Item>
                              </>
                            )}
                          </Form.List>
                        </Radio.Group>
                      </Form.Item>
                    )}
                  </Col>
                </Row>
              </Card>

              <Form.Item style={{ textAlign: "right" }}>
                <SubmitButton form={form}>{submitText}</SubmitButton>
              </Form.Item>
            </Flex>
          </Col>
          {showPreview && (
            <Col
              xs={24}
              lg={fullWidth ? 24 : 12}
              style={{ pointerEvents: "none" }}
            >
              <Form.Item noStyle dependencies={[defaultValues]}>
                {() => (
                  <>
                    <Typography.Title level={5}>
                      Question Preview
                    </Typography.Title>

                    <QuestionCard
                      index={0}
                      {...formValues}
                      id="q-id"
                      handleChange={onFinish}
                      showResult={false}
                      response={[]}
                      answer={formValues?.answer ?? ""}
                      notInExam
                    />
                  </>
                )}
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Flex>
  );
}
