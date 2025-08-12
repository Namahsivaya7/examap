import React, { useEffect, useState } from "react";
import { Statistic, Button, Typography } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { minutesToMillis } from "@/utils/util";

const Timer: React.FC<{
  startTime: Date;
  duration: number;
  onFinish?: () => void;
}> = ({ startTime, duration, onFinish }) => {
  const deadline = +new Date(startTime) + minutesToMillis(duration);
  return (
    <Statistic.Countdown
      prefix={<ClockCircleOutlined />}
      value={deadline}
      onFinish={onFinish}
      valueStyle={{ fontSize: 16 }}
    />
  );
};

export default Timer;
