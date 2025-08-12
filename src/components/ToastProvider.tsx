import { useToast } from "@/store/toastStore";
import { message } from "antd";
import React, { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [api, contextHolder] = message.useMessage();

  const {
    showErrorModal,
    errorCount,
    lastErrorMessage,
    showSuccessModal,
    successCount,
    lastSuccessMessage,
    setShowErrorModal,
    setShowSuccessModal,
  } = useToast(useShallow((state) => state));

  useEffect(() => {
    if (lastErrorMessage && showErrorModal) {
      api.error({
        content: lastErrorMessage,
        onClose: () => setShowErrorModal(false),
      });
    }
  }, [showErrorModal, errorCount, lastErrorMessage]);

  useEffect(() => {
    if (lastSuccessMessage && showSuccessModal) {
      api.success({
        content: lastSuccessMessage,
        onClose: () => setShowSuccessModal(false),
      });
    }
  }, [showSuccessModal, successCount, lastSuccessMessage]);

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
}
