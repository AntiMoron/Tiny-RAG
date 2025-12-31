import React, { useState } from "react";
import {
  Alert,
  Button,
  Form,
  Flex,
  Input,
  Modal,
  Radio,
  Row,
  Segmented,
  Col,
} from "antd";
import { AIProvider } from "tinyrag-types/aiprovider";
import AIProviderConfig from "../AIProviderConfig";
import { useForm } from "antd/es/form/Form";
import { useMount } from "ahooks";
import service from "../../../util/service";

export interface AIProviderConfigFormProps {
  loading?: boolean;
  onFinish?: (values: AIProvider) => void;
  data?: AIProvider;
}

function normalizeJSONStorage(str: string) {
  try {
    return JSON.parse(str);
  } catch {}
  return str;
}

export default function AIProviderConfigForm(props: AIProviderConfigFormProps) {
  const [templates, setTemplates] = useState<Record<string, string[]>>({});
  const { onFinish, loading, data } = props;
  const [type, setType] = useState<AIProvider["type"]>("completion");
  const [form] = useForm();
  useMount(() => {
    if (data) {
      const newD = { ...data, config: { ...data.config } };
      const { config } = newD;
      if (config) {
        config.headers = JSON.stringify(config.headers) as any;
        config.resultMapping = JSON.stringify(config.resultMapping) as any;
        config.paramMapping = JSON.stringify(config.paramMapping) as any;
      }
      form.setFieldsValue(data);
    }
    service.get(`/api/aiprovider/templates/${type}/list`).then((res) => {
      setTemplates((prev) => {
        return {
          ...prev,
          [type]: res.data,
        };
      });
    });
  });
  return (
    <Flex gap="middle">
      <Col flex="2">
        <Form
          form={form}
          onFieldsChange={(changeFields) => {
            const typeField = changeFields.find(
              (a) => a.name.indexOf("type") >= 0
            );
            if (!typeField) {
              return;
            }
            const type = typeField.value;
            setType(type);
            if (templates[type]) {
              return;
            }
            service
              .get(`/api/aiprovider/templates/${type}/list`)
              .then((res) => {
                setTemplates((prev) => {
                  return {
                    ...prev,
                    [type]: res.data,
                  };
                });
              });
          }}
          onFinish={(values) => {
            const { config } = values;
            if (config) {
              const { headers, resultMapping, paramMapping } = config;
              config.headers = normalizeJSONStorage(headers);
              config.paramMapping = normalizeJSONStorage(paramMapping);
              config.resultMapping = normalizeJSONStorage(resultMapping);
            }
            onFinish?.(values);
          }}
        >
          <Form.Item hidden name="id"></Form.Item>
          <Form.Item label="Type" name="type" rules={[{ required: true }]}>
            <Radio.Group defaultValue={"completion"}>
              <Radio value="completion">completion</Radio>
              <Radio value="embedding">embedding</Radio>
              <Radio value="vision">vision</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Config"
            name="config"
            rules={[
              {
                validator(rule, value, callback) {
                  const jsonKeys = ["headers", "paramMapping", "resultMapping"];
                  for (const key of jsonKeys) {
                    const v = value[key];
                    if (!v) {
                      continue;
                    }
                    try {
                      if (typeof v === "string") {
                        JSON.parse(v);
                        callback();
                        return;
                      }
                    } catch {
                      callback("key:" + key + ":JSON error");
                    }
                  }
                  callback();
                },
              },
            ]}
          >
            <AIProviderConfig />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={loading}
            >
              OK
            </Button>
          </Form.Item>
        </Form>
      </Col>
      <Flex gap="small" vertical flex="1">
        <Alert title="Load from templates"></Alert>
        <Row>
          {templates[type] &&
            templates[type].map((item) => {
              return (
                <Button
                  onClick={() => {
                    Modal.confirm({
                      content: `Are you sure to load the template "${item}"? This will overwrite your current config.`,
                      onOk: () => {
                        service
                          .get(
                            `/api/aiprovider/templates/${type}/default/${item}`
                          )
                          .then((res) => {
                            form.setFieldsValue({
                              ...res.data,
                            });
                          });
                      },
                    });
                  }}
                >
                  {item}
                </Button>
              );
            })}
        </Row>
      </Flex>
    </Flex>
  );
}
