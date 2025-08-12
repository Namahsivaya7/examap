"use client";
import ExamForm from "@/components/exam/ExamForm";
import {
  Skeleton,
  Collapse,
  theme,
  Row,
  Col,
  Image,
  Flex,
  Divider,
  Typography,
  Result,
  Button,
  Space,
  Spin,
  Tag,
  Tooltip,
  Drawer,
  Popconfirm,
} from "antd";
import { useEffect, useState } from "react";
import {
  CaretRightOutlined,
  ReadOutlined,
  UnorderedListOutlined,
  DeleteOutlined,
  EditOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { red, geekblue } from "@ant-design/colors";
import QuestionForm from "@/components/exam/QuestionForm";
import QuestionCard from "@/components/exam/QuestionCard";
import { Helmet } from "react-helmet";
import { appName } from "@/utils/config";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PATHS } from "@/utils/constants";
import { useExamStore } from "@/store/examStore";
import { ExamStatusColorMap } from "@/utils/util";
import { ExamStatus, Question } from "@prisma/client";
import EditQuestion from "@/components/exam/EditQuestion";
import { QuestionType } from "../../../../../types/prisma";

export default function EditExam({ params }: { params: { examId: string } }) {
  const { data: session } = useSession();
  const {
    token: {
      padding,
      colorBgContainer,
      borderRadiusLG,
      colorBorder,
      borderRadiusXS,
      borderRadiusSM,
    },
  } = theme.useToken();

  const loading = useExamStore((state) => state.loading);
  const exam = useExamStore((state) => state.exam);

  const resetExam = useExamStore((state) => state.reset);
  const editExam = useExamStore((state) => state.editExam);
  const fetchExam = useExamStore((state) => state.fetchExam);
  const addQuestion = useExamStore((state) => state.addQuestion);
  const unlinkQuestion = useExamStore((state) => state.unlinkQuestion);
  const editQuestion = useExamStore((state) => state.editQuestion);

  const [question, setQuestion] = useState<Question | undefined>();

  const handleClose = () => {
    setQuestion(undefined);
  };

  const handleSubmit = async (questionBody: Partial<Question>) => {
    if (!question?.id) return;
    const questionOpt = await editQuestion(question.id, questionBody);
    if (questionOpt != null) {
      setQuestion(questionOpt);
    }
  };

  useEffect(() => {
    if (params.examId) {
      fetchExam(params.examId);
    }
    return resetExam;
  }, [params.examId, fetchExam, resetExam]);

  const isAuthorised =
    exam && session?.user.id && session?.user.id === exam?.ownerId;

  if (exam && session?.user.id && !isAuthorised) {
    return (
      <Result
        status="warning"
        title="You don't have access to this page"
        extra={
          <Link href="/">
            <Button type="primary" key="home">
              Back Home
            </Button>
          </Link>
        }
      />
    );
  }

  const panelStyle: React.CSSProperties = {
    borderRadius: borderRadiusSM,
    border: `1px solid ${colorBorder}`,
    margin: padding / 2,
  };

  const examPanelItem = {
    key: "1",
    label: (
      <Row>
        <Col md={12} xs={24}>
          <Space>
            <Typography.Title level={4}>{exam?.title}</Typography.Title>
            <Tag color={ExamStatusColorMap[exam?.status ?? ExamStatus.Draft]}>
              {exam?.status ?? ExamStatus.Draft}
            </Tag>
          </Space>
        </Col>
        <Col
          md={12}
          xs={24}
          style={{ alignSelf: "center", textAlign: "right" }}
        >
          <Space split="|">
            <Link key="edit" href={`${PATHS.EXAMS}${exam?.id}`}>
              <ReadOutlined /> Go to Exam Page
            </Link>
            <Link key="attempts" href={`${PATHS.EXAMS}${exam?.id}/attempts`}>
              <UnorderedListOutlined /> Responses
            </Link>
          </Space>
        </Col>
      </Row>
    ),
    children: (
      <Row gutter={padding}>
        <Col xs={24} lg={16}>
          <ExamForm
            submitText="Update"
            onSubmit={editExam}
            defaultValues={exam}
            fullWidth
          />
        </Col>
        <Col xs={0} lg={8}>
          <Flex justify="center" align="center">
            <Image
              src={`https://picsum.photos/seed/${exam?.id}/500`}
              alt={exam?.title}
              preview={false}
            />
          </Flex>
        </Col>
      </Row>
    ),
    style: panelStyle,
  };

  const hasQuestions = !!exam?.questions?.length;

  const questionItems = exam?.questions?.map((question, i) => ({
    key: i + 1,
    label: (
      <Flex justify="space-between" align="center">
        <Typography>
          {i + 1}. {question?.title}
        </Typography>
        <Space split>
          {question.userId === session?.user.id && (
            <Tooltip title="Edit this question">
              <Button
                icon={<EditOutlined />}
                style={{ color: geekblue.primary }}
                size="small"
                onClick={() => setQuestion(question)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Are you sure want to unlink this question?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => unlinkQuestion(question.id)}
          >
            <Tooltip title="Unlink this question">
              <Button
                icon={<DeleteOutlined />}
                style={{ color: red.primary }}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      </Flex>
    ),
    children: (
      <Row gutter={padding}>
        <Col xs={24}>
          <QuestionCard
            {...question}
            index={i}
            response={[]}
            showResult={false}
            notInExam
          />
        </Col>
      </Row>
    ),
    style: panelStyle,
  }));

  const addQuestionPanelItem = {
    key: "1",
    label: (
      <Flex justify="space-between">
        <Typography.Title level={4} id="add-new-question">
          Add New Question
        </Typography.Title>
      </Flex>
    ),
    children: (
      <QuestionForm
        exam={exam}
        onSubmit={addQuestion}
        submitText="Add question"
      />
    ),
    style: panelStyle,
  };

  const expandIcon = ({ isActive }: any) => (
    <CaretRightOutlined
      rotate={isActive ? 90 : 0}
      style={{ fontSize: "20px" }}
    />
  );

  return (
    <>
      <Helmet title={`${appName} | Edit Exam`} />
      <Spin spinning={loading} fullscreen />
      <Skeleton loading={!exam} paragraph={{ rows: 8 }}>
        <Collapse
          ghost
          expandIcon={expandIcon}
          items={[examPanelItem]}
          style={{ background: colorBgContainer }}
          collapsible="icon"
          className="edit-exam-collapse"
        />

        <Collapse
          ghost
          defaultActiveKey={1}
          expandIcon={expandIcon}
          items={[addQuestionPanelItem]}
          style={{ background: colorBgContainer }}
          collapsible="header"
          className="edit-exam-collapse"
        />

        {hasQuestions && (
          <>
            <Divider>
              <Typography.Title level={5}>
                Questions ({questionItems?.length})
              </Typography.Title>
            </Divider>
            <Collapse
              ghost
              defaultActiveKey={[exam.questions[0].id]}
              expandIcon={({ isActive }: any) => (
                <CaretRightOutlined rotate={isActive ? 90 : 0} />
              )}
              items={questionItems ?? []}
              style={{ background: colorBgContainer }}
              collapsible="icon"
            />
          </>
        )}
      </Skeleton>
      <Drawer
        title="Edit Question"
        placement="right"
        onClose={handleClose}
        open={!!question}
        width={640}
      >
        {question && (
          <QuestionForm
            exam={exam}
            defaultValues={question}
            onSubmit={handleSubmit}
            submitText="Update"
            fullWidth
          />
        )}
      </Drawer>
    </>
  );
}
