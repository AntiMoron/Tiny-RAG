import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Layout,
  message,
  Modal,
  Col,
  Row,
  Radio,
  Flex,
} from "antd";
import * as _ from "lodash";
import { useMount } from "ahooks";
import { Dataset } from "tinyrag-types/dataset";
import { PlusOutlined } from "@ant-design/icons";
import ProviderSelect from "../../../component/ProviderSelect";
import DatasetBlock from "../../../component/Dataset";
import { useNavigate } from "react-router";
import service from "../../../../util/service";
import SchemaFields from "src/app/component/SchemaFields";
import { docConfigSchema } from "src/util/constants";
import TextArea from "antd/es/input/TextArea";

export default function Page() {
  const navigate = useNavigate();
  const [data, setData] = useState<Dataset[]>([]);
  const [visible, setVisible] = useState(false);
  const [formType, setFormType] = useState("create");
  useMount(() => {
    service.get("/api/dataset/list").then((res) => {
      setData(res.data);
    });
  });
  const [form] = Form.useForm();
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100%' }}>
      <div style={{ marginBottom: 24, textAlign: 'right', padding: '16px 0' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setVisible(true);
            setFormType("create");
            form.resetFields();
          }}
        >
          Add Dataset
        </Button>
      </div>
      
      <div style={{ padding: '0 16px' }}>
        {_.chunk(data, 3).map((row, rowIndex) => {
          return (
            <Row gutter={[16, 16]} key={rowIndex}>
              {row.map((item) => {
                return (
                  <Col xs={24} sm={12} md={8} key={item.id}>
                    <DatasetBlock
                      item={item}
                      onEdit={() => {
                        form.setFieldsValue({
                          ...item,
                        });
                        setFormType("edit");
                        setVisible(true);
                      }}
                      onDelete={(id) => {
                        Modal.confirm({
                          type: "warning",
                          title: "Are you sure to delete this dataset?",
                          content: "This action cannot be undone.",
                          onOk: () => {
                            service
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
      </div>
      <Modal
        title="Add Dataset"
        open={visible}
        onCancel={() => {
          setVisible(false);
        }}
        width="80vw"
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: "text",
          }}
          onFinish={(values) => {
            const newValue = {
              ...values,
            };
            service
              .post(
                formType === "edit"
                  ? `api/dataset/update/${values.id}`
                  : "api/dataset/add",
                { ...newValue }
              )
              .then((res) => {
                message.success("OK");
                setVisible(false);
                if (formType === "edit") {
                  setData((prev) => {
                    const index = prev.findIndex((d) => d.id === res.data.id);
                    if (index !== -1) {
                      prev[index] = res.data;
                    }
                    return [...prev];
                  });
                } else {
                  setData((prev) => [...prev, res.data] as Dataset[]);
                }
              })
              .catch((err) => {
                message.error(
                  err.response?.data?.message || err.message || "Error"
                );
              });
          }}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Flex gap="small">
            <Col flex="1">
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
              <Form.Item
                label="Completion Provider"
                name="completeByProviderId"
                rules={[
                  {
                    required: true,
                    message: "Please select an completion provider!",
                  },
                ]}
              >
                <ProviderSelect type="completion" />
              </Form.Item>
            </Col>
            <Col flex="1">
              <Form.Item label="Config" name="config">
                <SchemaFields schemas={docConfigSchema} />
                {/* <TextArea /> */}
              </Form.Item>
            </Col>
          </Flex>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              OK
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
