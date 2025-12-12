import React, { PropsWithChildren } from "react";
import ReactMarkdown from "react-markdown";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import cx from "classnames";
import "./index.css";

const customParser = unified()
  .use(remarkParse, {
    loose: true,
    gfm: true,
  })
  .use(remarkGfm);

export interface KnowledgeDisplayProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function KnowledgeDisplay(
  props: PropsWithChildren<KnowledgeDisplayProps>
) {
  const { className, style, children } = props;
  if (typeof children === "string") {
    return (
      <div className={cx("knowledge-container", className)} style={style}>
        <ReactMarkdown parser={customParser} remarkPlugins={[remarkGfm]}>
          {children}
        </ReactMarkdown>
      </div>
    );
  }
  return children;
}
