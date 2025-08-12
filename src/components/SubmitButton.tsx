import React from "react";
import type { FormInstance } from "antd";
import { Button, Form } from "antd";

export default function SubmitButton({
  form,
  children,
}: {
  form: FormInstance;
  children: React.ReactNode;
}) {
  const [submittable, setSubmittable] = React.useState(false);

  // Watch all values
  const values = Form.useWatch([], form);

  React.useEffect(() => {
    form.validateFields({ validateOnly: true }).then(
      () => {
        setSubmittable(true);
      },
      () => {
        setSubmittable(false);
      }
    );
  }, [values, form]);

  return (
    <Button
      className="login-form-button"
      style={{ width: "auto" }}
      type="primary"
      htmlType="submit"
      disabled={!submittable}
    >
      {children}
    </Button>
  );
}
