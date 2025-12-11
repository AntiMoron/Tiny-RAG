import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Knowledge, KnowledgeIndex } from "tinyrag-types/Knowledge";
import { Alert, Button, Flex, Layout, Modal, Table } from "antd";
import { DeleteOutlined, FundOutlined, PlusOutlined } from "@ant-design/icons";
import { Dataset } from "tinyrag-types/dataset";
import UUIDDisplay from "../../../../component/UUIDDisplay";

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
        <Table
          dataSource={data}
          rowKey="id"
          pagination={{ total }}
          columns={[
            {
              title: "ID",
              dataIndex: "id",
              render: (text) => <UUIDDisplay text={text} />,
            },
            { title: "Content", dataIndex: "content", ellipsis: true },
            { title: "Index Status", dataIndex: "indexStatus" },
            { title: "Created At", dataIndex: "createdAt" },
            { title: "Updated At", dataIndex: "updatedAt" },
            {
              title: "Actions",
              render: (_, record) => {
                return (
                  <Flex>
                    <Button type="link" icon={<FundOutlined />}></Button>
                    <Button
                      type="link"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => {
                        Modal.confirm({
                          title: "Confirm Deletion",
                          content: "Are you sure you want to delete this item?",
                          onOk: async () => {
                            await axios.delete(
                              `/api/knowledge/delete/${record.id}`
                            );
                            setData((prev) =>
                              prev.filter((item) => item.id !== record.id)
                            );
                          },
                        });
                      }}
                    ></Button>
                  </Flex>
                );
              },
            },
          ]}
        />
      </Content>
    </Layout>
  );
}
