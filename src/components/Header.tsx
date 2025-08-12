import { Affix, Flex, Grid, Layout, theme } from "antd";
import { blue } from "@ant-design/colors";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import UserMenu from "./auth/UserMenu";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { DO_COLOR, PATHS } from "@/utils/constants";
import ExamSearch from "./ExamSearch";

interface HeaderProps {
  title: React.ReactNode;
  icon: React.ReactElement;
}

export default function Header({ title, icon }: HeaderProps) {
  const { data: session, status } = useSession();
  const {
    token: { padding, colorBgContainer },
  } = theme.useToken();
  const pathname = usePathname();
  const isLandingPage = pathname === PATHS.HOME;

  const [affixed, setAffixed] = useState(false);

  const handleAffix = (affixed?: boolean) => {
    setAffixed(affixed || false);
  };

  const { md } = Grid.useBreakpoint();

  return (
    <Affix offsetTop={0} onChange={handleAffix}>
      <Layout.Header
        style={{
          display: "flex",
          padding: `0 ${padding}px`,
          justifyContent: "space-between",
          background: isLandingPage && !affixed ? DO_COLOR : blue.primary,
          alignItems: "center",
          gap: padding,
        }}
        className={isLandingPage ? "header landing" : "header"}
      >
        <Flex align="center" gap={padding / 2} style={{ height: 64 }}>
          <Link
            href="/"
            style={{ display: "flex", height: "64%" }}
            className="home-link-beta"
          >
            {md && (
              <Image
                src={`/logo-${
                  isLandingPage && !affixed ? "dark" : "light"
                }.png`}
                width={280}
                height={280}
                alt="Examap logo"
                style={{ height: "100%", width: "100%" }}
              />
            )}
            {!md && (
              <Image
                src={"/logo.png"}
                width={415}
                height={111}
                alt="Examap logo"
                style={{ height: "100%", width: "100%" }}
              />
            )}
          </Link>
        </Flex>
        <ExamSearch />
        <UserMenu />
      </Layout.Header>
    </Affix>
  );
}
