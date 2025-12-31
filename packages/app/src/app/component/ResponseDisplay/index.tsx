import React, { PropsWithChildren, useState } from "react";
import ReactMarkdown from "react-markdown";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import cx from "classnames";
import { Image, Modal } from "antd";
import "./index.css";

const customParser = unified()
  .use(remarkParse, {
    loose: true,
    gfm: true,
  })
  .use(remarkGfm);

export interface ResponseDisplayProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function ResponseDisplay(
  props: PropsWithChildren<ResponseDisplayProps>
) {
  const { className, style, children } = props;
  const [videoPreview, setVideoPreview] = useState<{ visible: boolean; src: string }>({
    visible: false,
    src: "",
  });
  if (typeof children === "string") {
    const components = {
      // use antd Image for markdown images so we get built-in preview
      img: ({ node, ...props }: any) => (
        <Image src={props.src} alt={props.alt} style={{ maxWidth: "100%" }} />
      ),
      // handle links that point to video files: show inline thumbnail and open Modal on click
      a: ({ node, href, children }: any) => {
        if (!href || typeof href !== "string") return <a>{children}</a>;
        const lower = href.toLowerCase();
        if (/(\.mp4|\.webm|\.ogg)(\?.*)?$/.test(lower)) {
          return (
            <div
              style={{ cursor: "pointer", maxWidth: "100%" }}
              onClick={() => setVideoPreview({ visible: true, src: href })}
            >
              <video src={href} style={{ maxWidth: "100%" }} muted preload="metadata" />
            </div>
          );
        }
        return (
          // open other links in new tab
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        );
      },
    };

    return (
      <div className={cx("reply-container", className)} style={style}>
        <ReactMarkdown
          parser={customParser}
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {children}
        </ReactMarkdown>

        <Modal
          open={videoPreview.visible}
          footer={null}
          onCancel={() => setVideoPreview({ visible: false, src: "" })}
          width={800}
          bodyStyle={{ padding: 0 }}
          centered
        >
          {videoPreview.src && (
            <video src={videoPreview.src} controls autoPlay style={{ width: "100%" }} />
          )}
        </Modal>
      </div>
    );
  }
  return children;
}
