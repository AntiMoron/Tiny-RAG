import React from "react";
import cx from "classnames";
import { useMount } from "ahooks";
import service from "src/util/service";
import { Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";

interface UserPageProps {}

export default function UserPage(props: UserPageProps) {
  const {} = props;
  const [form] = useForm();
  useMount(() => {
    service.get("/api/user/profile").then((res) => {
      form.setFieldsValue(res.data);
    });
  });
  return (
    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px' }}>
      <Form form={form}>
        <Form.Item label="User ID" name="id">
          <Input disabled></Input>
        </Form.Item>
        <Form.Item label="User Name" name="username">
          <Input disabled></Input>
        </Form.Item>
        <Form.Item label="Created At" name="createdAt">
          <Input disabled></Input>
        </Form.Item>
      </Form>
    </div>
  );
}
