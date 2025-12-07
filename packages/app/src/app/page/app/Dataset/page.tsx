import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, Layout, Modal } from "antd";
import axios from "axios";
import { useMount } from "ahooks";
import { Dataset } from "tinyrag-types/dataset";
import { PlusOutlined } from "@ant-design/icons";

const { Header, Content, Footer, Sider } = Layout;

export default function Page() {
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  useMount(() => {
    axios.get("/api/dataset/list").then((res) => {
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
            setVisible(true);
          }}
        >
          Add Dataset
        </Button>
      </Header>
      <Content>
        {data?.map((item: Dataset) => (
          <Card title={item.name} key={item.id} style={{ marginBottom: 16 }}>
            <p>{item.description}</p>
          </Card>
        ))}
      </Content>
      <Modal
        title="Add Dataset"
        open={visible}
        onCancel={() => {
          setVisible(false);
        }}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please input the dataset name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
