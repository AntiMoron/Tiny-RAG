import { useMount } from "ahooks";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Knowledge, KnowledgeIndex } from "tinyrag-types/Knowledge";
import { Button, Layout, Table } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Header, Content, Footer, Sider } = Layout;
export default function DatasetDetailPage() {
  const params = useParams();
  const { id } = params;
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<Knowledge[]>([]);
  useEffect(() => {
    axios.get(`/api/knowledge/list/${id}`).then((res) => {
      console.log(res.data);
      const { total, list } = res.data;
      setData(list);
      setTotal(total);
    });
  }, [id]);
  return (
    <Layout>
      <Header>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => {}}>
          Add Knowledge
        </Button>
      </Header>
      <Content>
        <Table dataSource={data} rowKey="id" />
      </Content>
    </Layout>
  );
}
