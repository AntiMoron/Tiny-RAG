import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Layout,
  message,
  Modal,
  Col,
  Row,
  Radio,
  Grid,
} from "antd";
import * as _ from "lodash";
import axios from "axios";
import { useMount } from "ahooks";
import { Dataset } from "tinyrag-types/dataset";
import { PlusOutlined } from "@ant-design/icons";
import ProviderSelect from "../../../component/ProviderSelect";
import DatasetBlock from "../../../component/Dataset";
import { useNavigate } from "react-router";
import JSONInput from "../../../component/JSONInput";

const { Header, Content, Footer, Sider } = Layout;

export default function Page() {
  const navigate = useNavigate();
  const [data, setData] = useState<Dataset[]>([]);
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
        {_.chunk(data, 3).map((row, rowIndex) => {
          return (
            <Row gutter={16} key={rowIndex} style={{ marginBottom: 16 }}>
              {row.map((item) => {
                return (
                  <Col>
                    <DatasetBlock
                      item={item}
                      onDelete={(id) => {
                        Modal.confirm({
                          type: "warning",
                          title: "Are you sure to delete this dataset?",
                          content: "This action cannot be undone.",
                          onOk: () => {
                            axios
                              .delete(`/api/dataset/delete/${id}`)
                              .then(() => {
                                message.success("OK");
                                setData((prev) =>
                                  prev.filter((d) => d.id !== id)
                                );
                              })
                              .catch((err) => {
                                message.error("");
                              });
                          },
                        });
                      }}
                      onClick={() => {
                        navigate(`/app/dataset/${item.id}`);
                      }}
                    />
                  </Col>
                );
              })}
            </Row>
          );
        })}
      </Content>
      <Modal
        title="Add Dataset"
        open={visible}
        onCancel={() => {
          setVisible(false);
        }}
        footer={null}
      >
        <Form
          layout="vertical"
          initialValues={{
            type: "text",
          }}
          onFinish={(values) => {
            axios
              .post("api/dataset/add", { ...values })
              .then((res) => {
                message.success("OK");
                setVisible(false);
                setData((prev) => [...prev, res.data] as Dataset[]);
              })
              .catch((err) => {
                message.error(
                  err.response?.data?.message || err.message || "Error"
                );
              });
          }}
        >
          <Form.Item label="Type" name="type" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="text">Text</Radio>
              <Radio value="feishu">Feishu</Radio>
            </Radio.Group>
          </Form.Item>
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
          <Form.Item
            label="Embedding Provider"
            name="embededByProviderId"
            rules={[
              {
                required: true,
                message: "Please select an embedding provider!",
              },
            ]}
          >
            <ProviderSelect type="embedding" />
          </Form.Item>

          <Form.Item label="Config" name="config">
            <JSONInput />
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
