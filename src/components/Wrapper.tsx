"use client";

import { Layout, theme } from "antd";
import { QuestionCircleTwoTone } from "@ant-design/icons";

import Header from "@/components/Header";
import Footer from "./Footer";
import ToastProvider from "./ToastProvider";
import { PUBLIC_PATHS } from "@/utils/constants";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import VerifyAccount from "@/components/VerifyAccount";
import { notification } from "@/utils/notify";

interface WrapperProps {
  title?: string;
  icon?: React.ReactElement;
  children: React.ReactNode;
}

export default function Wrapper({ title, icon, children }: WrapperProps) {
  const user = useUserStore((t) => t.user);
  const pathname = usePathname();
  const [limited, setLimited] = useState(false);

  useEffect(() => {
    const isPublicPage = PUBLIC_PATHS.includes(pathname);
    if (!isPublicPage && user && !user?.emailVerified) {
      notification.warning({
        key: "email-verification",
        message: "Email not verified",
        description: "Access will be limited until the account is verified",
        btn: <VerifyAccount>Verify Now</VerifyAccount>,
        duration: 0,
      });
      setLimited(true);
    } else {
      setLimited(false);
    }
  }, [pathname, user]);

  const {
    token: { colorBgContainer, padding },
  } = theme.useToken();

  return (
    <ToastProvider>
      <Layout className="layout">
        <Header title={title} icon={icon ?? <QuestionCircleTwoTone />} />
        <Layout.Content
          style={{
            background: colorBgContainer,
            opacity: limited ? 0.3 : 1,
            pointerEvents: limited ? "none" : "auto",
          }}
          className="main-content"
        >
          {children}
        </Layout.Content>
        <Footer />
      </Layout>
    </ToastProvider>
  );
}
