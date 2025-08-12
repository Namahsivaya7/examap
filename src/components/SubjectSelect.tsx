import React, { useState } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { getSubjectsWithKeyword } from "@/app/lib/api";
import CreateSubject from "./CreateSubject";
import { Subject } from "@prisma/client";

const SubjectSelect: React.FC<Partial<SelectProps>> = (props) => {
  const [data, setData] = useState<SelectProps["options"]>(props.options ?? []);
  const [value, setValue] = useState<string>(props.value);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    if (query.trim().length === 0) return;
    setLoading(true);
    const subjects = await getSubjectsWithKeyword(query);
    const data = subjects?.map((o) => ({
      value: o.id,
      label: o.name,
    }));
    setData(data ?? []);
    setLoading(false);
  };

  const handleChange = (newValue: string, opt: any) => {
    setValue(newValue);
    props.onChange?.(newValue, opt);
  };

  const handleCreate = (subject: Subject) => {
    const option = { value: subject.id, label: subject.name };
    setData([option]);
    setValue(subject.id);
    props.onChange?.(subject.id, option);
  };

  return (
    <Select
      showSearch
      value={value}
      defaultActiveFirstOption={false}
      suffixIcon={null}
      filterOption={false}
      onSearch={handleSearch}
      notFoundContent={<CreateSubject onCreate={handleCreate} />}
      {...props}
      onChange={handleChange}
      options={data}
      loading={loading}
    />
  );
};

export default SubjectSelect;
