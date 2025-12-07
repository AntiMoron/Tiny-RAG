import React, { useState } from "react";
import { Select } from "antd";
import cx from "classnames";
import { useMount } from "ahooks";
import axios from "axios";
import { AIProvider } from "tinyrag-types/aiprovider";

export interface ProviderSelectProps {
  className?: string;
  style?: React.CSSProperties;
  type?: AIProvider["type"];
  value?: string;
  onChange?: (value: string) => void;
}

export default function ProviderSelect(props: ProviderSelectProps) {
  const { className, style, type, value, onChange } = props;
  const [data, setData] = useState<AIProvider[]>([]);
  useMount(() => {
    if (type) {
      axios.get(`/api/aiprovider/list/${type}`).then((res) => {
        setData(res.data);
      });
    } else {
      axios.get("/api/aiprovider/list").then((res) => {
        setData(res.data);
      });
    }
  });
  return (
    <Select
      className={cx("w-full", className)}
      value={value}
      onChange={onChange}
      style={style}
      options={data.map((a) => {
        return { label: a.name, value: a.id, key: a.id };
      })}
    ></Select>
  );
}
