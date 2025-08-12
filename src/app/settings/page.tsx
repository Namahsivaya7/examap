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
  Skeleton,
} from "antd";
import {
  EditOutlined,
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import UserImage from "@/components/auth/UserImage";
import { Helmet } from "react-helmet";
import { appName } from "@/utils/config";
import { UserType } from "../../../types/prisma";
import { useUserStore } from "@/store/userStore";
import VerifyAccount from "@/components/VerifyAccount";

const renderTab = (icon: React.ReactNode, label: string) => (
  <Row>
    <Col sm={8}>{icon}</Col>
    <Col xs={0} sm={16}>
      {label}
    </Col>
  </Row>
);

const tabList = [
  // {
  //   key: "settings",
  //   tab: renderTab(<SettingOutlined />, "Settings"),
  // },
  {
    key: "edit",
    tab: renderTab(<EditOutlined />, "Edit Profile"),
  },
  // {
  //   key: "ellipsis",
  //   tab: renderTab(<EllipsisOutlined />, "More"),
  // },
];

export default function Login() {
  const { data: session, status } = useSession();
  const [activeTabKey, setActiveTabKey] = useState<string>("edit");
  const {
    token: { padding },
  } = theme.useToken();
  const { user, editUser } = useUserStore((_) => _);

  const onFinish = async (values: any) => {
    if (!session?.user?.id) return;
    const userRecord: Record<string, any> = user ?? {};
    const changedValues = Object.keys(values).reduce(
      (acc: Record<string, any>, key: string) => {
        if (values[key] && userRecord[key] !== values[key]) {
          acc[key] = values[key];
        }
        return acc;
      },
      {}
    ) as Partial<UserType>;

    editUser(changedValues);
  };

  const { name, email, avatar, occupation, emailVerified } = user ?? {};
  return (
    <Flex vertical flex={1} style={{ padding }}>
      <Helmet title={`${appName} | Settings`} />
      <Card
        title={
          <Card.Meta
            avatar={
              <UserImage name={name} avatar={avatar ?? session?.user?.avatar} />
            }
            title={name}
            description={occupation ?? "--"}
          />
        }
        style={{ width: "100%" }}
        tabList={tabList}
        activeTabKey={activeTabKey}
        onTabChange={setActiveTabKey}
        tabProps={{
          size: "large",
        }}
      >
        <Skeleton loading={false} avatar active>
          <Row style={{ marginTop: padding }}>
            <Col xs={24}>
              <Typography.Title level={4}>Settings</Typography.Title>
              {user && (
                <Form
                  name="settings"
                  className="settings-form"
                  initialValues={user}
                  onFinish={onFinish}
                  layout="vertical"
                >
                  <Row gutter={padding}>
                    <Col md={12} xs={24}>
                      <Form.Item
                        name="name"
                        label="Name"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your Name!",
                          },
                        ]}
                      >
                        <Input
                          prefix={
                            <UserOutlined className="site-form-item-icon" />
                          }
                          placeholder="Full Name"
                        />
                      </Form.Item>
                    </Col>
                    <Col md={12} xs={0}></Col>
                  </Row>

                  <Row gutter={padding}>
                    <Col md={12} xs={24}>
                      <Flex gap={padding / 2} align="center">
                        <Form.Item
                          name="email"
                          label="Email"
                          rules={[
                            {
                              required: true,
                              message: "Please input your Email!",
                            },
                          ]}
                          style={{ flex: 1 }}
                        >
                          <Input
                            prefix={
                              <UserOutlined className="site-form-item-icon" />
                            }
                            placeholder="Email"
                          />
                        </Form.Item>
                        {!emailVerified && <VerifyAccount />}
                      </Flex>
                    </Col>
                    <Col md={12} xs={24}>
                      <Form.Item
                        name="phone"
                        label="Phone"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your Phone number!",
                          },
                        ]}
                      >
                        <Input
                          prefix={
                            <PhoneOutlined className="site-form-item-icon" />
                          }
                          placeholder="+91 9533162006"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={padding}>
                    <Col md={12} xs={24}>
                      <Form.Item
                        name="occupation"
                        label="Occupation"
                        rules={[
                          {
                            required: true,
                            message: "Please input your occupation!",
                          },
                        ]}
                      >
                        <Input
                          prefix={
                            <UserOutlined className="site-form-item-icon" />
                          }
                          placeholder="Student/Tutor"
                        />
                      </Form.Item>
                    </Col>

                    <Col md={12} xs={24}>
                      <Form.Item
                        name="address"
                        label="Address"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your location!",
                          },
                        ]}
                      >
                        <Input.TextArea placeholder="Hyderabad, India" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={padding}>
                    <Col md={12} xs={24}>
                      <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                          {
                            message: "Please input your Password!",
                          },
                        ]}
                      >
                        <Input
                          prefix={
                            <LockOutlined className="site-form-item-icon" />
                          }
                          type="password"
                          placeholder="Password"
                        />
                      </Form.Item>
                    </Col>
                    <Col md={12}></Col>
                  </Row>
                  <Row>
                    <Col xs={0} md={20}></Col>
                    <Col md={4} xs={24}>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="login-form-button"
                        >
                          Submit
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )}
            </Col>
          </Row>
        </Skeleton>
      </Card>
    </Flex>
  );
}
