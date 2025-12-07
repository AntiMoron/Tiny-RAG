import React, { PropsWithChildren, useCallback, useState } from "react";
import cx from "classnames";
import { AIProviderConfig } from "tinyrag-types/aiprovider";
import { useForm } from "antd/es/form/Form";
import { Button, Flex, Form, Input, Radio } from "antd";
import { useMount } from "ahooks";
import JSONInput from "../JSONInput";

export interface AIProviderInputProps {
  className?: string;
  style?: React.CSSProperties;
  value?: AIProviderConfig;
  onChange?: (config: AIProviderConfig) => void;
}

function RowItem(props: PropsWithChildren<{ label: string }>) {
  const { label, children } = props;
  return (
    <Flex gap="small" vertical style={{ marginBottom: 12 }}>
      <div>{label}</div>
      <div>{children}</div>
    </Flex>
  );
}

export default function AIProviderConfigComponent(props: AIProviderInputProps) {
  const { className, style, value, onChange } = props;
  const changeEventHandler = useCallback(
    (k: string, v: string) => {
      const newV = { ...value, [k]: v };
      console.log(newV);
      onChange?.(newV as AIProviderConfig);
    },
    [value]
  );
  // const [headers, setHeaders] = useState(
  //   value?.headers ? JSON.stringify(value.headers, null, 2) : ""
  // );
  // const [paramMapping, setParamMapping] = useState(
  //   value?.paramMapping ? JSON.stringify(value.paramMapping, null, 2) : ""
  // );
  // const [resultMapping, setResultMapping] = useState(
  //   value?.resultMapping ? JSON.stringify(value.resultMapping, null, 2) : ""
  // );
  return (
    <div className={cx(className)} style={style}>
      <RowItem label="Method">
        <Radio.Group
          value={value?.method}
          onChange={(e) => {
            const v = e.target.value;
            changeEventHandler("method", v);
          }}
        >
          <Radio value="GET">GET</Radio>
          <Radio value="POST">POST</Radio>
        </Radio.Group>
      </RowItem>
      <RowItem label="Model">
        <Input
          value={value?.model}
          onChange={(e) => {
            const v = e.target.value;
            changeEventHandler("model", v);
          }}
        />
      </RowItem>
      <RowItem label="API Key">
        <Input
          value={value?.apiKey}
          onChange={(e) => {
            const v = e.target.value;
            changeEventHandler("apiKey", v);
          }}
        />
      </RowItem>
      <RowItem label="Endpoint">
        <Input
          value={value?.endpoint}
          onChange={(e) => {
            const v = e.target.value;
            changeEventHandler("endpoint", v);
          }}
        />
      </RowItem>
      <RowItem label="Region">
        <Input
          value={value?.region}
          onChange={(e) => {
            const v = e.target.value;
            changeEventHandler("region", v);
          }}
        />
      </RowItem>
      <RowItem label="Headers (JSON)">
        <JSONInput
          value={
            typeof value?.headers === "string"
              ? value?.headers
              : JSON.stringify(value?.headers)
          }
          onChange={(v) => {
            // setHeaders(v);
            changeEventHandler("headers", v);
          }}
        />
      </RowItem>
      <RowItem label="Param Mapping (JSON)">
        <JSONInput
          value={
            typeof value?.paramMapping === "string"
              ? value?.paramMapping
              : JSON.stringify(value?.paramMapping)
          }
          onChange={(v) => {
            // setParamMapping(v);
            changeEventHandler("paramMapping", v);
          }}
        />
      </RowItem>
      <RowItem label="Result Mapping (JSON)">
        <JSONInput
          value={
            typeof value?.resultMapping === "string"
              ? value?.resultMapping
              : JSON.stringify(value?.resultMapping)
          }
          onChange={(v) => {
            // setResultMapping(v);
            changeEventHandler("resultMapping", v);
          }}
        />
      </RowItem>
    </div>
  );
}
