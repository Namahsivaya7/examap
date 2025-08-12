import { Flex, Layout, Typography, theme } from "antd";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PATHS } from "@/utils/constants";

export default function Footer() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const {
    token: { colorBgContainer, padding },
  } = theme.useToken();

  return (
    <Layout.Footer className="footer">
      <Flex justify="space-between">
        <Typography.Text>
          &copy; {new Date().getFullYear()} Trisandya Technology Solutions Pvt.
          Ltd.
        </Typography.Text>
        {pathname !== PATHS.PRIVACY && (
          <Typography.Text>
            <Link href="/privacy">Privacy Policy</Link>
          </Typography.Text>
        )}
      </Flex>
    </Layout.Footer>
  );
}
