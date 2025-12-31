import React from "react";
import cx from "classnames";
import { Input } from "antd";

export interface JSONInputProps {
  className?: string;
  style?: React.CSSProperties;
  value?: string;
  onChange?: (value: string) => void;
}

export default function JSONInput(props: JSONInputProps) {
  const { className, style, value, onChange } = props;
  return (
    <Input.TextArea
      rows={4}
      value={value}
      onChange={(e) => {
        onChange?.(e.target.value);
      }}
      placeholder="Enter JSON content here..."
      style={{
        ...style,
        borderRadius: '8px',
        borderColor: '#e0e0e0',
        transition: 'border-color 0.2s'
      }}
    />
  );
}
