import React from "react";
import cx from "classnames";
import { Popover } from "antd";

export interface UUIDDisplayProps {
  className?: string;
  style?: React.CSSProperties;
  text?: string;
}

export default function UUIDDisplay(props: UUIDDisplayProps) {
  const { className, style, text } = props;
  return (
    <Popover content={text}>
      <div className={cx(className)} style={style}>
        {text?.slice(0, 8)}...{text?.slice(-8)}
      </div>
    </Popover>
  );
}
