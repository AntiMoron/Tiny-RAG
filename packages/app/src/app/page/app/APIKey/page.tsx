import { useMount } from "ahooks";
import {
  Button,
  Form,
  Input,
  Layout,
  message,
  Modal,
  Table,
  Typography,
} from "antd";
import axios from "../../../../util/service";
import React, { useCallback, useState } from "react";
import { ExportServiceApiKey } from "tinyrag-types/apikey";
import { PlusOutlined } from "@ant-design/icons";
import UUIDDisplay from "../../../component/UUIDDisplay";

const { Header, Content, Footer, Sider } = Layout;

export default function APIKeyPage() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ExportServiceApiKey[]>([]);
  const loadData = useCallback(() => {
    axios.get("/api/apiKey/list").then((res) => {
      setData(res.data);
    });
  }, [setData]);
  useMount(() => {
    loadData();
  });
  return (
    <Layout>
      <Header>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setOpen(true);
          }}
        >
          Add API Key
        </Button>
      </Header>
      <Content>
        <p>Manage your API keys here.</p>
        <Table
          dataSource={data}
          rowKey="id"
          columns={[
            {
              dataIndex: "id",
              title: "ID",
              render: (value) => <UUIDDisplay text={value} />,
            },
            {
              dataIndex: "name",
              title: "Name",
            },
            {
              dataIndex: "description",
              title: "Description",
            },
            {
              dataIndex: "_",
              title: "Key",
              render: (_, record) => (
                <Typography.Text
                  onClick={() => {
                    Modal.confirm({
                      onOk: () => {
                        navigator.clipboard.writeText(record.key);
                        message.success("Copied to clipboard");
                      },
                      okText: 'Copy to Clipboard',
                      title: "Here's your secret",
                      content: record.key,
                    });
                  }}
                >
                  *******
                </Typography.Text>
              ),
            },
          ]}
        />
      </Content>
      <Modal
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        title="Create API Key"
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
            axios
              .post("/api/apiKey/add", values)
              .then((res) => {
                message.success("OK");
                setOpen(false);
                loadData();
              })
              .catch((err) => {
                message.error(err.response?.data?.message || err.message);
              });
          }}
        >
          <Form.Item name="id" hidden></Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} maxLength={300} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              OK
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
