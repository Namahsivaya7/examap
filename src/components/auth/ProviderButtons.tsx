import React from "react";
import { Button, Flex, theme, Tooltip } from "antd";
import {
  GithubOutlined,
  GoogleOutlined,
  FacebookOutlined,
} from "@ant-design/icons";

import { signIn } from "next-auth/react";

export default function ProviderButtons() {
  const {
    token: { padding },
  } = theme.useToken();

  return (
    <Flex gap={padding / 2} justify="space-evenly">
      <Tooltip title="Login with Github">
        <Button
          onClick={() => signIn("github")}
          type="primary"
          shape="circle"
          icon={<GithubOutlined />}
        />
      </Tooltip>
      {/* <Tooltip title="Login with Gmail">
        <Button
          onClick={() => signIn("gmail")}
          type="primary"
          shape="circle"
          icon={<GoogleOutlined />}
        />
      </Tooltip>
      <Tooltip title="Login with Facebook">
        <Button
          onClick={() => signIn("facebook")}
          type="primary"
          shape="circle"
          icon={<FacebookOutlined />}
        />
      </Tooltip> */}
    </Flex>
  );
}
