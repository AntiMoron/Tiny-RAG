import { useMount } from "ahooks";
import { Modal, Table } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import UUIDDisplay from "../../../../../../../../component/UUIDDisplay";

export interface ChooseTaskProps {
  type: string;
  datasetId: string;
  open?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface FeishuTask {
  created_time: string;
  id: string;
  modified_time: string;
  name: string;
  owner_id: string;
  parent_token: string;
  token: string;
  type: "docx";
  url: string;
}

export default function ChooseFeishuTask(props: ChooseTaskProps) {
  const { type, open, datasetId, className, style } = props;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [data, setData] = useState<FeishuTask[]>([]);
  useEffect(() => {
    if (!datasetId) {
      return;
    }
    axios.get(`/api/feishu/dataset/${datasetId}/tasks`).then((res) => {
      setData(res.data);
    });
  }, [datasetId]);
  return (
    <div style={style} className={className}>
      <Table
        rowKey="id"
        dataSource={data}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange(selectedRowKeys, selectedRows, info) {
            setSelectedIds(selectedRowKeys as string[]);
          },
        }}
        columns={[
          {
            title: "Name",
            dataIndex: "name",
          },
          {
            title: "id",
            dataIndex: "id",
            render: (value) => <UUIDDisplay text={value} />,
          },
          {
            title: "Type",
            dataIndex: "type",
          },
          {
            title: "URL",
            dataIndex: "url",
            render: (value) => (
              <a href={value} target="_blank" rel="noreferrer">
                {value}
              </a>
            ),
          },
        ]}
      />
    </div>
  );
}
