"use client";

import { Space, Typography, message } from "antd";
import { useEffect } from "react";
import { CloseCircleOutlined } from "@ant-design/icons";

const MESSAGE_KEY = "visiblity-check";

const preventDefault = (event: Event) => {
  event.preventDefault();
};

interface VisibilityCheckProps {
  onEvent?: () => void;
}

let hidden = "hidden";
let visibilityChange = "visibilitychange";

export default function VisibilityCheck({ onEvent }: VisibilityCheckProps) {
  const [messageApi, contextHolder] = message.useMessage();

  if (typeof window?.document.hidden !== "undefined") {
    // Opera 12.10 and Firefox 18 and later support
    hidden = "hidden";
    visibilityChange = "visibilitychange";
    /*@ts-ignore */
  } else if (typeof window?.document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
    /*@ts-ignore */
  } else if (typeof window?.document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }

  const setVisibile = () => {
    handleVisibility(true);
  };

  const setInVisibile = () => {
    handleVisibility(false);
  };

  const handleVisibility = (visible: boolean) => {
    if (!visible) {
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
          // Report the event on close to avoid false event reporting
          onEvent?.();
        },
      });
    } else {
      //setTimeout(messageApi.destroy, 5000);
    }
  };

  const visibilityHandler = () => {
    /*@ts-ignore */
    handleVisibility(!!window?.document[hidden]);
  };

  useEffect(() => {
    window?.document.addEventListener(
      visibilityChange,
      visibilityHandler,
      false
    );

    window?.document.addEventListener("contextmenu", preventDefault);

    // extra event listeners for better behaviour
    window?.document.addEventListener("focus", setVisibile, false);
    window?.document.addEventListener("blur", setInVisibile, false);
    window?.addEventListener("focus", setVisibile, false);
    window?.addEventListener("blur", setInVisibile, false);
    return () => {
      window?.document.removeEventListener(
        visibilityChange,
        visibilityHandler,
        false
      );
      window?.document.removeEventListener("contextmenu", preventDefault);
      window?.document.removeEventListener("focus", setVisibile, false);
      window?.document.removeEventListener("blur", setInVisibile, false);
      window?.removeEventListener("focus", setVisibile, false);
      window?.removeEventListener("blur", setInVisibile, false);
    };
  }, []);

  return <>{contextHolder}</>;
}
