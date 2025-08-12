"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, Button, Checkbox, Flex, theme, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { signIn } from "next-auth/react";
import { PATHS } from "@/utils/constants";
import ProviderButtons from "@/components/auth/ProviderButtons";
import Link from "next/link";
import { Helmet } from "react-helmet";
import { appName } from "@/utils/config";
import Image from "next/image";
import { useToast } from "@/store/toastStore";
import { requestForgetPassword } from "../lib/api";
import { useSearchParams } from "next/navigation";

export default function Signin() {
  const {
    token: { padding },
  } = theme.useToken();

  const searchParams = useSearchParams();
  const isEmailVerified = searchParams.get("emailVerified") ?? 0;

  const [isForgetPassword, setIsForgetPassword] = useState(false);
  const success = useToast((t) => t.success);
  const error = useToast((t) => t.error);
  const [pending, setPending] = useState(false);

  const onFinish = async (values: any) => {
    const { error: err, status } = (await signIn("credentials", {
      redirect: false,
      ...values,
    })) ?? { error: true };
    if (err || status === 401) {
      error("Email or password incorrect.");
    }
  };

  const onForgetPassword = async (values: any) => {
    setPending(true);
    try {
      const msg = await requestForgetPassword(values.email);
      success(msg);
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    if (isEmailVerified) {
      success("Email verified successfully.");
    }
  }, [isEmailVerified]);

  return (
    <Flex justify="center" align="center" vertical style={{ padding }}>
      <Helmet title={`${appName} | Signin`} />

      <Image src="/logo.png" alt={appName ?? ""} width={280} height={280} />
      <Typography.Title>
        {isForgetPassword ? "Forget Password" : "Sign in"}
      </Typography.Title>

      {!isForgetPassword && (
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
        >
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
          <Flex justify="space-between" style={{ marginBottom: padding / 2 }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Typography.Link
              className="login-form-forgot"
              onClick={() => setIsForgetPassword(true)}
            >
              Forgot password
            </Typography.Link>
          </Flex>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              Log in
            </Button>
            <Typography className="signin-form-trigger">
              Or <Link href={PATHS.SIGNUP}>register now!</Link>
            </Typography>
          </Form.Item>
          <ProviderButtons />
        </Form>
      )}
      {isForgetPassword && (
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{
            remember: true,
          }}
          onFinish={onForgetPassword}
        >
          <Form.Item
            name="email"
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

          <Flex justify="space-between" style={{ marginBottom: padding / 2 }}>
            <Typography.Link
              className="login-form-forgot"
              href="#"
              onClick={() => setIsForgetPassword(false)}
            >
              Sign In
            </Typography.Link>
          </Flex>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              loading={pending}
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      )}
    </Flex>
  );
}
