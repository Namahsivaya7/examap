import { PATHS } from "@/utils/constants";
import { isAdminEmail } from "@/utils/admin";
import {
  Button,
  Dropdown,
  Flex,
  Grid,
  Menu,
  Space,
  Typography,
  theme,
} from "antd";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuProps } from "antd";
import UserImage from "./UserImage";
import { CaretDownFilled } from "@ant-design/icons";

export default function UserMenu() {
  const {
    token: { colorBgContainer, padding },
  } = theme.useToken();

  const { data: session } = useSession();
  const pathname = usePathname();

  const items: MenuProps["items"] = [
    ...(pathname !== PATHS.HOME
      ? [
          {
            label: (
              <Link href={PATHS.HOME} type="button">
                Home
              </Link>
            ),
            key: "/",
          },
        ]
      : []),
    {
      label: (
        <Link href={PATHS.TRENDING} type="button">
          Trending
        </Link>
      ),
      key: PATHS.TRENDING,
    },
    {
      label: (
        <Link href={`${PATHS.USERS}${session?.user.id}`} type="button">
          My Space
        </Link>
      ),
      key: `${PATHS.USERS}${session?.user.id}`,
    },
    ...(isAdminEmail(session?.user?.email)
      ? [
          {
            label: (
              <Link href={PATHS.NEW_EXAM} type="button">
                Create Exam
              </Link>
            ),
            key: PATHS.NEW_EXAM,
          },
        ]
      : []),
    {
      label: (
        <Link href={PATHS.SETTINGS} rel="noopener noreferrer" type="button">
          Settings
        </Link>
      ),
      key: PATHS.SETTINGS,
    },
    {
      label: (
        <Link href="#" type="button" onClick={() => signOut()}>
          Sign out
        </Link>
      ),
      key: "signout",
    },
  ];

  const { lg } = Grid.useBreakpoint();

  return (
    <Flex align="center" gap={padding / 2} hidden={true}>
      {session ? (
        <>
          {lg && (
            <Menu
              selectedKeys={[pathname]}
              mode="horizontal"
              items={items.slice(0, -2)}
              disabledOverflow={lg}
            />
          )}

          <Typography.Title
            level={5}
            style={{ margin: 0 }}
            className="hide-mobile header-text"
          >
            {session?.user?.name}
          </Typography.Title>
          <UserImage name={session?.user?.name} avatar={session.user?.avatar} />

          <Dropdown
            menu={{
              items: !lg ? items : items.slice(-2),
            }}
          >
            <CaretDownFilled className="header-text" />
          </Dropdown>
        </>
      ) : (
        <>
          {lg && (
            <Menu
              selectedKeys={[pathname]}
              mode="horizontal"
              items={items.filter(
                (i) => i?.key === PATHS.TRENDING || i?.key === PATHS.HOME
              )}
              disabledOverflow={lg}
            />
          )}
          {pathname !== PATHS.SIGNIN && (
            <Link className="header-text" href={PATHS.SIGNIN}>
              Sign in
            </Link>
          )}
        </>
      )}
    </Flex>
  );
}
