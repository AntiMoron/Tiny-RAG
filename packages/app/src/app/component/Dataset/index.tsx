import { Button, Card, CardMetaProps, CardProps } from "antd";
import React from "react";
import { Dataset } from "tinyrag-types/dataset";
import { createStyles } from "antd-style";
import {
  DatabaseTwoTone,
  DeleteOutlined,
  EditOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import Meta from "antd/es/card/Meta";

export interface DatasetProps {
  onClick?: () => void;
  onDelete?: (id: string) => void;
  item: Dataset;
}

const useStyles = createStyles(({ token }) => ({
  root: {
    width: 300,
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: `1px solid ${token.colorBorderSecondary}`,
  },
  header: {
    borderBottom: "none",
    paddingBottom: 8,
  },
  body: {
    paddingTop: 0,
  },
}));

const stylesCard: CardProps["styles"] = {
  root: {
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
  },
};

export default function DatasetBlock(props: DatasetProps) {
  const { item, onDelete } = props;
  const { styles: classNames } = useStyles();
  const actions = [
    <EditOutlined key="edit" style={{ color: "#45b7d1" }} />,
    <HeartOutlined key="heart" style={{ color: "#ff6b6b" }} />,
    <DeleteOutlined
      key="delete"
      style={{ color: "#ff6b6b" }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete?.(item.id);
      }}
    />,
  ];

  const sharedCardMetaProps: CardMetaProps = {
    avatar: <DatabaseTwoTone />,
    description: item?.description,
  };
  const sharedCardProps: CardProps = {
    classNames,
    actions,
  };

  return (
    <Card
      {...sharedCardProps}
      title="Dataset"
      styles={stylesCard}
      extra={<Button type="link">More</Button>}
      variant="borderless"
    >
      <div
        style={{ cursor: "pointer" }}
        onClick={() => {
          props.onClick?.();
        }}
      >
        <Meta
          {...sharedCardMetaProps}
          title={item?.name}
          description={item?.description}
        />
      </div>
    </Card>
  );
}
