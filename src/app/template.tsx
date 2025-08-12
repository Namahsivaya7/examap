"use client";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, redirect } from "next/navigation";
import { useEffect } from "react";
import { isAuthenticationPath, isPathPublicPage } from "@/utils/util";
import { DO_COLOR, PATHS, PUBLIC_PATHS } from "@/utils/constants";
import Wrapper from "@/components/Wrapper";
import { useUserStore } from "@/store/userStore";
import { App, ConfigProvider, Grid, theme } from "antd";
import Notify from "@/utils/notify";
import { setToken } from "./lib/axios";

export default function Template({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const fetchUser = useUserStore((_) => _.fetchUser);
  const isPublicPage = isPathPublicPage(pathname);
  const router = useRouter();

  const {
    token: { borderRadiusSM, colorBgContainer, padding },
  } = theme.useToken();

  useEffect(() => {
    if (isPublicPage) return;

    const isAuthPath = isAuthenticationPath(pathname);
    if (!session && !isAuthPath && status !== "loading") {
      localStorage.setItem("_redirect", location.href);
      redirect(PATHS.SIGNIN);
    }

    if (isAuthPath && session) {
      const redirecTo = localStorage.getItem("_redirect");
      if (redirecTo && redirecTo.length > 0) {
        localStorage.removeItem("_redirect");
        redirect(redirecTo);
      } else {
        redirect(`${PATHS.USERS}${session.user.id}`);
      }
    }
  }, [session, pathname, isPublicPage, status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      setToken(session.user.id);
    }
    if (status === "unauthenticated") {
      setToken(undefined);
    }
  }, [status]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchUser(session?.user.id);
  }, [session?.user.id, fetchUser]);

  const { md } = Grid.useBreakpoint();

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: borderRadiusSM,
          colorBgContainer:
            pathname === PATHS.HOME ? DO_COLOR : colorBgContainer,
          padding: md ? padding : padding / 2,
        },
      }}
    >
      <App>
        <Notify />
        <Wrapper>{children}</Wrapper>
      </App>
    </ConfigProvider>
  );
}
