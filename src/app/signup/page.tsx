"use client";

import React from "react";
import { Form, Input, Button, Flex, Typography, Image, theme } from "antd";
import { UserOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons";
import { signIn } from "next-auth/react";
import ProviderButtons from "@/components/auth/ProviderButtons";
import { PATHS } from "@/utils/constants";
import Link from "next/link";
import { Helmet } from "react-helmet";
import { appName } from "@/utils/config";
import { useToast } from "@/store/toastStore";

export default function Signup() {
  const {
    token: { padding },
  } = theme.useToken();

  const error = useToast((t) => t.error);

  const onFinish = async (values: any) => {
    const { error: err } = (await signIn("credentials", {
      redirect: false,
      ...values,
    })) ?? { error: true };
    if (err) {
      error("Failed to create account");
    }
  };

  return (
    <Flex justify="center" align="center" vertical style={{ padding }}>
      <Helmet title={`${appName} | Signup`} />
      <Image src="/logo.png" alt={appName} preview={false} />
      <Typography.Title>Sign up</Typography.Title>

      <Form
        name="normal_login"
        className="login-form"
        initialValues={{
          remember: true,
          isRegister: true,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="name"
          rules={[
            {
              required: true,
              message: "Please input your Full Name!",
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Full Name"
          />
        </Form.Item>
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: "Please input your Email!",
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Email"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your Password!",
            },
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item
          name="phone"
          rules={[
            {
              required: false,
              message: "Please input your Phone number!",
            },
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="site-form-item-icon" />}
            type="text"
            placeholder="Phone number"
          />
        </Form.Item>

        <Form.Item name="isRegister" hidden noStyle></Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Sign up
          </Button>
          <Typography className="signin-form-trigger">
            Already have an account? <Link href={PATHS.SIGNIN}>Sign in</Link>
          </Typography>
        </Form.Item>
        <ProviderButtons />
      </Form>
    </Flex>
  );
}
