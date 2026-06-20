"use client";

import { Space, Typography, message } from "antd";
import { useCallback, useEffect, useRef } from "react";
import { CloseCircleOutlined } from "@ant-design/icons";

const MESSAGE_KEY = "visiblity-check";

const preventDefault = (event: Event) => {
  event.preventDefault();
};

interface VisibilityCheckProps {
  onEvent?: () => void;
}

function getVisibilityApi() {
  if (typeof window?.document.hidden !== "undefined") {
    return { hidden: "hidden", visibilityChange: "visibilitychange" };
  }
  /*@ts-ignore */
  if (typeof window?.document.msHidden !== "undefined") {
    return { hidden: "msHidden", visibilityChange: "msvisibilitychange" };
  }
  /*@ts-ignore */
  if (typeof window?.document.webkitHidden !== "undefined") {
    return {
      hidden: "webkitHidden",
      visibilityChange: "webkitvisibilitychange",
    };
  }
  return { hidden: "hidden", visibilityChange: "visibilitychange" };
}

export default function VisibilityCheck({ onEvent }: VisibilityCheckProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const lastRecordedAt = useRef(0);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const recordTabSwitch = useCallback(() => {
    const now = Date.now();
    if (now - lastRecordedAt.current < 1000) return;
    lastRecordedAt.current = now;
    onEventRef.current?.();
  }, []);

  const handleHidden = useCallback(() => {
    recordTabSwitch();
    messageApi.open({
      key: MESSAGE_KEY,
      type: "warning",
      content: (
        <Space>
          <Typography>
            Please stay on the page until you submit the exam!{" "}
          </Typography>
          <CloseCircleOutlined />
        </Space>
      ),
      className: "msg-box-shadow",
      duration: 0,
      onClick: () => {
        messageApi.destroy(MESSAGE_KEY);
      },
    });
  }, [messageApi, recordTabSwitch]);

  const handleVisible = useCallback(() => {
    messageApi.destroy(MESSAGE_KEY);
  }, [messageApi]);

  useEffect(() => {
    const { hidden, visibilityChange } = getVisibilityApi();

    const visibilityHandler = () => {
      /*@ts-ignore */
      if (window?.document[hidden]) {
        handleHidden();
      } else {
        handleVisible();
      }
    };

    const onBlur = () => handleHidden();

    window?.document.addEventListener(
      visibilityChange,
      visibilityHandler,
      false
    );
    window?.document.addEventListener("contextmenu", preventDefault);
    window?.document.addEventListener("blur", onBlur, false);
    window?.addEventListener("blur", onBlur, false);

    return () => {
      window?.document.removeEventListener(
        visibilityChange,
        visibilityHandler,
        false
      );
      window?.document.removeEventListener("contextmenu", preventDefault);
      window?.document.removeEventListener("blur", onBlur, false);
      window?.removeEventListener("blur", onBlur, false);
    };
  }, [handleHidden, handleVisible]);

  return <>{contextHolder}</>;
}
