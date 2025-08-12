import { toInitials } from "@/utils/util";
import { Avatar } from "antd";

export default function UserImage({
  name,
  avatar,
}: {
  name?: string;
  avatar?: string | null;
}) {
  return avatar ? (
    <Avatar src={avatar} />
  ) : (
    <Avatar>{toInitials(name ?? "")}</Avatar>
  );
}
