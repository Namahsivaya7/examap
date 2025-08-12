import React, { useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { AutoComplete, Avatar, Form, Input, List, SelectProps } from "antd";
import { getExams } from "@/app/lib/api";
import { ExamType } from "../../types/prisma";
import Link from "next/link";
import { PATHS } from "@/utils/constants";
import { debounce } from "@/utils/util";

const renderItem = (d: ExamType) => ({
  value: d.id,
  label: <Link href={`${PATHS.EXAMS}${d.id}`}>{d.title}</Link>,
});

const ExamSearch: React.FC = () => {
  const [options, setOptions] = useState<SelectProps["options"]>([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");

  const getOptions = async (q: string) => {
    const subjects = await getExams([], q);
    const data = subjects?.map(renderItem);
    setOptions(data ?? []);
  };

  const handleSearch = async (query: string) => {
    setValue(query);
    if (query.trim().length === 0) return;
    setLoading(true);
    debounce(getOptions, 300)(query);
    setLoading(false);
  };

  return (
    <form
      action={PATHS.SEARCH}
      style={{ display: "flex", flex: 1, maxWidth: 720 }}
    >
      <AutoComplete
        popupClassName="certain-category-search-dropdown"
        popupMatchSelectWidth={true}
        style={{ width: "100%" }}
        options={options}
        onSearch={handleSearch}
        value={value}
        onSelect={() => setValue("")}
      >
        <Input.Search name="q" placeholder="search exams" />
      </AutoComplete>
    </form>
  );
};

export default ExamSearch;
