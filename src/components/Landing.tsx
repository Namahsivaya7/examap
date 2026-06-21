"use client";

import { PATHS } from "@/utils/constants";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Row,
  Space,
  Typography,
  theme,
} from "antd";
import Image from "next/image";
import Link from "next/link";
import {
  EditOutlined,
  ReadOutlined,
  ToolTwoTone,
  ApiTwoTone,
  CustomerServiceTwoTone,
  DashboardTwoTone,
  PictureTwoTone,
  SettingTwoTone,
  SafetyCertificateTwoTone,
  CalculatorTwoTone,
  CloudTwoTone,
  ProfileTwoTone,
  ProjectTwoTone,
  FundTwoTone,
} from "@ant-design/icons";
import {
  green,
  red,
  blue,
  purple,
  yellow,
  orange,
  magenta,
  geekblue,
  cyan,
  volcano,
  gold,
} from "@ant-design/colors";
import { appName } from "@/utils/config";
import { isAdminEmail } from "@/utils/admin";
import { useSession } from "next-auth/react";

const FEATURES = [
  {
    title: "User-Friendly Interface",
    description:
      "An intuitive and easy-to-navigate interface for both exam takers and creators.",
    icon: (
      <PictureTwoTone style={{ fontSize: 64 }} twoToneColor={green.primary} />
    ),
  },
  {
    title: "Exam Creation Tools",
    description:
      "Ability to create various types of exams (multiple-choice, essay, etc.) with options for time limits.",
    icon: <ToolTwoTone style={{ fontSize: 64 }} />,
  },
  {
    title: "Instant Grading",
    description:
      "Automatic grading for objective questions and quick evaluation tools for subjective answers.",
    icon: (
      <CalculatorTwoTone
        style={{ fontSize: 64 }}
        twoToneColor={purple.primary}
      />
    ),
  },
  {
    title: "Remote Accessibility",
    description:
      "Accessibility from any location with an internet connection, enabling remote exam participation.",
    icon: (
      <CloudTwoTone style={{ fontSize: 64 }} twoToneColor={geekblue.primary} />
    ),
  },
  {
    title: "Scalability",
    description:
      "Ability to handle multiple users simultaneously without compromising the performance and speed.",
    icon: (
      <ProjectTwoTone style={{ fontSize: 64 }} twoToneColor={magenta.primary} />
    ),
  },
  {
    title: "Feedback and Analytics",
    description:
      "Detailed performance reports and analytics to understand strengths, weaknesses, and areas for improvement.",
    icon: (
      <FundTwoTone style={{ fontSize: 64 }} twoToneColor={yellow.primary} />
    ),
  },
  {
    title: "Real-Time Monitoring",
    description:
      "Monitoring tools for administrators to oversee exams in progress and identify any irregularities or issues.",
    icon: (
      <DashboardTwoTone
        style={{ fontSize: 64 }}
        twoToneColor={orange.primary}
      />
    ),
  },
  {
    title: "Secure Authentication",
    description:
      "Robust user authentication and authorization protocols to ensure the security and integrity of exams and user data.",
    icon: (
      <SafetyCertificateTwoTone
        style={{ fontSize: 64 }}
        twoToneColor={cyan.primary}
      />
    ),
  },
  {
    title: "Support and Help Center",
    description:
      "Accessible customer support and a comprehensive help center for troubleshooting and guidance.",
    icon: (
      <CustomerServiceTwoTone
        style={{ fontSize: 64 }}
        twoToneColor={volcano.primary}
      />
    ),
  },
  {
    title: "User Profiles",
    description:
      "Individual profiles for exam takers and creators, allowing tracking of progress, history, and performance.",
    icon: (
      <ProfileTwoTone style={{ fontSize: 64 }} twoToneColor={gold.primary} />
    ),
  },
  {
    title: "Customization Options",
    description:
      "Customizable settings for individual exams, including layout, instructions, and grading criteria.",
    icon: (
      <SettingTwoTone style={{ fontSize: 64 }} twoToneColor={blue.primary} />
    ),
  },
  {
    title: "Resource Integration",
    description:
      "Integration of multimedia elements (images, videos, etc.) to enhance exam questions or provide additional context.",
    icon: <ApiTwoTone style={{ fontSize: 64 }} twoToneColor={red.primary} />,
  },
];

export default function Landing() {
  const {
    token: { padding },
  } = theme.useToken();
  const { data: session } = useSession();
  const canCreateExam = isAdminEmail(session?.user?.email);

  return (
    <Flex vertical>
      <Flex className="banner">
        <div className="banner-text">
          <Typography.Title level={1}>
            Empowering Learning Experience
          </Typography.Title>
          <Typography.Title level={5} style={{ marginBottom: 32 }}>
            Maximize your learning journey effortlessly with us. Whether
            you&apos;re an educator crafting exams or a student taking
            assessments shared by your tutor, our platform simplifies the
            process for both.
          </Typography.Title>

          <Space split>
            <Link href={PATHS.TRENDING}>
              <Button
                size="large"
                type="default"
                shape="round"
                icon={<EditOutlined />}
              >
                Take Exam
              </Button>
            </Link>
            {canCreateExam && (
              <Link href={PATHS.NEW_EXAM} rel="nofollow">
                <Button
                  size="large"
                  type="primary"
                  shape="round"
                  icon={<ReadOutlined />}
                >
                  Create Exam
                </Button>
              </Link>
            )}
          </Space>
        </div>
        <Image
          className="banner-image"
          src="/banner-img.png"
          alt="monitoring"
          width={587}
          height={500}
        />
      </Flex>

      <Flex
        style={{
          alignContent: "center",
          alignSelf: "center",
          padding: padding * 2,
        }}
        id="features"
      >
        <Row gutter={[32, 32]} style={{ padding: padding * 2 }}>
          {FEATURES.map(({ title, description, icon }, i) => (
            <Col key={i} xl={6} lg={8} sm={12} xs={24}>
              <Card
                cover={icon}
                style={{ padding: padding * 2, background: geekblue[1] }}
                className="feature-card"
              >
                <Card.Meta title={title} description={description} />
              </Card>
            </Col>
          ))}
        </Row>
      </Flex>

      <Flex
        style={{
          alignContent: "center",
          alignSelf: "center",
          padding: padding * 2,
          background: geekblue[1],
        }}
      >
        <Row style={{ padding: `0 ${padding * 2}px` }} gutter={padding * 2}>
          <Col xs={24} md={16}>
            <Descriptions column={1}>
              <Descriptions.Item>
                <Typography.Title level={3}>{appName}</Typography.Title>
              </Descriptions.Item>
              <Descriptions.Item>
                <Typography.Paragraph>
                  Welcome to our comprehensive online exam platform! Our
                  innovative platform offers a seamless experience for both exam
                  creators and participants. Featuring a user-friendly
                  interface, it empowers educators, institutions, and
                  organizations to effortlessly design, administer, and manage a
                  wide range of exams.
                  <br />
                  Our platform aims to enhance the learning and assessment
                  experience, fostering an environment conducive to success and
                  growth.
                </Typography.Paragraph>
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={8}>
            <Descriptions column={1}>
              <Descriptions.Item>
                <Typography.Title level={3}>Contact Us</Typography.Title>
              </Descriptions.Item>
              <Descriptions.Item>
                <b>{appName}</b>
              </Descriptions.Item>
              <Descriptions.Item>
                <Link href="mailto:contact@examap.in">contact@examap.in</Link>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Flex>
    </Flex>
  );
}
