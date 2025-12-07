import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Knowledge, KnowledgeIndex } from "tinyrag-types/Knowledge";
import { Alert, Button, Layout, Table } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Dataset } from "tinyrag-types/dataset";

const { Header, Content, Footer, Sider } = Layout;
export default function DatasetDetailPage() {
  const params = useParams();
  const { id } = params;
  const nav = useNavigate();
  const [total, setTotal] = useState(0);
  const [dataset, setDataset] = useState<Dataset | undefined>();
  const [data, setData] = useState<Knowledge[]>([]);
  const [hasError, setHasError] = useState("");
  const [detailError, setDetailError] = useState("");
  useEffect(() => {
    axios.get(`/api/dataset/detail/${id}`).then((res) => {
      setDataset(res.data);
    });
    axios
      .get(`/api/knowledge/list/${id}`)
      .then((res) => {
        console.log(res.data);
        const { total, list } = res.data;
        setData(list);
        setTotal(total);
      })
      .catch((err) => {
        setHasError((err as any).message);
        setDetailError((err as any).response?.data?.message || "Unknown error");
      });
  }, [id]);
  if (hasError) {
    return (
      <Alert title={hasError} showIcon description={detailError} type="error" />
    );
  }
  return (
    <Layout>
      <Header>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            nav(`/app/dataset/${id}/knowledge/create`);
          }}
        >
          Add Knowledge
        </Button>
      </Header>
      <Content>
        <Table dataSource={data} rowKey="id" pagination={{ total }} />
      </Content>
    </Layout>
  );
}
