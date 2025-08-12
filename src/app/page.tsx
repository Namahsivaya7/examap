import React from "react";
import { Flex, theme } from "antd";
import Landing from "@/components/Landing";

export default function Home() {
  return (
    <Flex vertical className="landing">
      <Landing />
    </Flex>
  );
}
