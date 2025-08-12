"use client";

import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Flex, theme, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Helmet } from "react-helmet";
import { appName } from "@/utils/config";
import Image from "next/image";
import { useToast } from "@/store/toastStore";
import { updatePassword } from "@/app/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { PATHS } from "@/utils/constants";

export default function ResetPassword() {
  const {
    token: { padding },
  } = theme.useToken();
  const router = useRouter();

  const searchParams = useSearchParams();

  const success = useToast((t) => t.success);
  const [pending, setPending] = useState(false);

  const onUpdatePassword = async (values: any) => {
    if (!searchParams.get("token")) return;
    setPending(true);
    try {
      const msg = await updatePassword(
        searchParams.get("token") ?? "",
        values.password
      );
      success(`${msg} Redirecting to login...`);
      setTimeout(() => {
        router.replace(PATHS.SIGNIN);
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <Flex justify="center" align="center" vertical style={{ padding }}>
      <Helmet title={`${appName} | Reset Password`} />

      <Image src="/logo.png" alt={appName ?? ""} width={280} height={280} />
      <Typography.Title>Reset Password</Typography.Title>

      <Form
        name="normal_login"
        className="login-form"
        initialValues={{
          remember: true,
        }}
        onFinish={onUpdatePassword}
      >
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Please enter new Password!",
            },
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="New Password"
          />
        </Form.Item>

        <Form.Item
          name="password2"
          dependencies={["password"]}
          rules={[
            {
              required: true,
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The new password that you entered do not match!")
                );
              },
            }),
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Confirm Password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            loading={pending}
          >
            Update Password
          </Button>
        </Form.Item>
      </Form>
    </Flex>
  );
}
