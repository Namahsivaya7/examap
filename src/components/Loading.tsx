import { Skeleton } from "antd";

export default function Loading() {
  return (
    <>
      <Skeleton.Input block></Skeleton.Input>
      <Skeleton active></Skeleton>
    </>
  );
}
