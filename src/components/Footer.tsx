import { Flex, Layout, Typography, theme } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PATHS } from "@/utils/constants";
import { appName } from "@/utils/config";

export default function Footer() {
  const pathname = usePathname();

  const {
    token: { colorBgContainer, padding },
  } = theme.useToken();

  return (
    <Layout.Footer className="footer">
      <Flex justify="space-between">
        <Typography.Text>
          &copy; {new Date().getFullYear()} {appName}
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
