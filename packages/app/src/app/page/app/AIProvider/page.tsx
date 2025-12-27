import React, { useState } from "react";
import { Button, Flex, Layout, message, Modal, Table } from "antd";
import { useMount } from "ahooks";
import axios from "../../../../util/service";
import { AIProvider } from "tinyrag-types/aiprovider";
import { CheckCircleFilled, PlusOutlined } from "@ant-design/icons";

import AIProviderActions from "../../../component/AIProviderActions";
import AIProviderConfigForm from "../../../component/AIProviderConfigForm";
import UUIDDisplay from "../../../component/UUIDDisplay";
import service from "../../../../util/service";

const { Header, Content, Footer, Sider } = Layout;

export default function AIProviderPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AIProvider[]>([]);
  const [show, setShow] = useState(false);
  useMount(() => {
    service.get("/api/aiprovider/list").then((res) => {
      console.log(res.data);
      setData(res.data);
    });
  });
  return (
    <Layout>
      <Header>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setShow(true);
          }}
        >
          Add AI Provider
        </Button>
      </Header>
      <Content>
        <Table
          columns={[
            {
              title: "ID",
              dataIndex: "id",
              key: "id",
              render: (value) => {
                return <UUIDDisplay text={value} />;
              },
            },
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              render: (value, record) => {
                return (
                  <Flex gap="small">
                    <div>{value}</div>
                    <div>
                      {record.lastTestStatus === "ok" ? (
                        <CheckCircleFilled style={{ color: "green" }} />
                      ) : null}
                    </div>
                  </Flex>
                );
              },
            },
            {
              title: "Model",
              dataIndex: ["config", "model"],
              key: "config.model",
            },
            {
              title: "Created At",
              dataIndex: "createdAt",
              key: "createdAt",
            },
            {
              title: "Updated At",
              dataIndex: "updatedAt",
              key: "updatedAt",
            },
            {
              title: "Action",
              key: "action",
              render: (_, record: AIProvider) => {
                return (
                  <AIProviderActions
                    record={record}
                    onPassTest={(id) => {
                      setData((prev) =>
                        prev.map((item) =>
                          item.id === id
                            ? { ...item, lastTestStatus: "ok" }
                            : item
                        )
                      );
                    }}
                    onUpdate={(id, values) => {
                      setData((prev) =>
                        prev.map((item) =>
                          item.id === id ? { ...item, ...values } : item
                        )
                      );
                    }}
                    onDelete={(id) => {
                      setData((prev) => prev.filter((item) => item.id !== id));
                    }}
                  />
                );
              },
            },
          ]}
          dataSource={data}
        ></Table>
      </Content>
      <Modal
        destroyOnHidden
        open={show}
        title="Add AI Provider"
        onCancel={() => setShow(false)}
        footer={null}
      >
        <AIProviderConfigForm
          loading={loading}
          onFinish={(values) => {
            setLoading(true);
            axios
              .post("/api/aiprovider/add", values)
              .then((res) => {
                setData([...data, res.data]);
                setShow(false);
              })
              .catch((err) => {
                message.error(err.response?.data?.message || err.message);
              })
              .finally(() => {
                setLoading(false);
              });
          }}
        />
      </Modal>
    </Layout>
  );
}
