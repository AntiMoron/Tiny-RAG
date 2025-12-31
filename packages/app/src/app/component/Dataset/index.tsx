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
  onEdit?: () => void;
  onDelete?: (id: string) => void;
  item: Dataset;
}

const useStyles = createStyles(({ token }) => ({
  root: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    border: `1px solid ${token.colorBorderSecondary}`,
    transition: "all 0.3s ease",
    '&:hover': {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    }
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
    borderRadius: 12,
    overflow: "hidden",
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: "#2c3e50",
    padding: "16px 16px 0",
  },
  body: {
    padding: "16px",
  }
};

export default function DatasetBlock(props: DatasetProps) {
  const { item, onDelete, onEdit } = props;
  const { styles: classNames } = useStyles();
  const actions = [
    <EditOutlined
      key="edit"
      style={{ color: "#45b7d1" }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit?.();
      }}
    />,
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
      title={item?.name || "Dataset"}
      styles={stylesCard}
      extra={<Button type="link">More</Button>}
      variant="outlined"
      bordered={false}
    >
      <div
        style={{ cursor: "pointer" }}
        onClick={() => {
          props.onClick?.();
        }}
      >
        <Meta
          {...sharedCardMetaProps}
          title={
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#2c3e50',
              marginBottom: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {item?.name}
            </div>
          }
          description={
            <div style={{
              color: '#7f8c8d',
              fontSize: '14px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {item?.description || 'No description available'}
            </div>
          }
        />
        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#95a5a6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Created: {new Date(item?.createdAt || Date.now()).toLocaleDateString()}</span>
          <HeartOutlined style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#e74c3c'}
            onMouseOut={(e) => e.currentTarget.style.color = '#95a5a6'}
          />
        </div>
      </div>
    </Card>
  );
}
