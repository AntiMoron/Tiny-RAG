import React, { useState } from "react";
import { Button, Col, Flex, Form, Input, Layout } from "antd";
import axios from "axios";
import { useParams } from "react-router";

const { Header, Content, Footer } = Layout;
const Item = Form.Item;

export default function KnowledgeTestPage() {
  const [data, setData] = useState("");
  const params = useParams();
  const { id: datasetId } = params;
  return (
    <Layout>
      <Header>
        <div>KnowledgeTestPage</div>
      </Header>
      <Content>
        <Flex>
          <Col>
            <Form
              layout="vertical"
              onFinish={(values) => {
                axios
                  .post(`/api/retrieve/dataset/${datasetId}/retrieve/test`, {
                    question: values.question,
                  })
                  .then((res) => {
                    setData(JSON.stringify(res.data, null, 2));
                  });
              }}
            >
              <Item name="question" label="Question">
                <Input.TextArea
                  rows={4}
                  placeholder="Enter your question here"
                />
              </Item>
              <Item>
                <Button type="primary" htmlType="submit">
                  OK
                </Button>
              </Item>
            </Form>
          </Col>
          <Col>
            <div>{data}</div>
          </Col>
        </Flex>
      </Content>
      <Footer></Footer>
    </Layout>
  );
}
