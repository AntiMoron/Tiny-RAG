import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import axios from "axios";
import sha256 from "sha256";

const FormItem = Form.Item;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  return (
    <div
      style={{
        maxWidth: 800,
        margin: "80px auto",
        padding: 40,
      }}
    >
      <h1>Login</h1>
      <Form
        layout="vertical"
        onFinish={(values) => {
          setLoading(true);
          axios
            .post("/api/user/login", {
              username: values.username,
              encrypedPwd: sha256(values.encrypedPwd),
            })
            .then((res) => {})
            .catch((err) => {
              message.error(err.response?.data?.message || "Login failed");
            })
            .finally(() => {
              setLoading(false);
            });
        }}
      >
        <FormItem
          name="username"
          label="User Name"
          rules={[{ required: true }]}
        >
          <Input />
        </FormItem>
        <FormItem
          name="encrypedPwd"
          label="Password"
          rules={[{ required: true }]}
        >
          <Input.Password type="password" />
        </FormItem>
        <FormItem>
          <Button
            loading={loading}
            disabled={loading}
            type="primary"
            htmlType="submit"
          >
            Login
          </Button>
        </FormItem>
      </Form>
    </div>
  );
}
