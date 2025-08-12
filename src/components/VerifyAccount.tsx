import { Button, Tooltip, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { verifyUser } from "@/app/lib/api";
import { useUserStore } from "@/store/userStore";

interface VerifyAccountProps {
  children?: React.ReactNode;
}

export default function VerifyAccount({ children }: VerifyAccountProps) {
  const [pending, setPending] = useState(false);
  const { user } = useUserStore((_) => _);

  const verifyAccount = async () => {
    if (!user?.id) return;
    setPending(true);
    try {
      const msg = await verifyUser(user?.id);
      message.success(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <Tooltip title="Email not verified, click to verify.">
      <Button
        type="dashed"
        icon={<ExclamationCircleOutlined />}
        danger
        onClick={verifyAccount}
        loading={pending}
      >
        {children}
      </Button>
    </Tooltip>
  );
}
