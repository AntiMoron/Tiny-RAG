import React, { useState } from "react";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Layout,
  Table,
  Typography,
} from "antd";
import axios from "../../../../../../../util/service";
import { useParams } from "react-router";
import ResponseDisplay from "../../../../../../component/ResponseDisplay";

const { Header, Content, Footer } = Layout;
const Item = Form.Item;

export default function KnowledgeTestPage() {
  const [data, setData] = useState<
    | {
        replyPrompt: string;
        completion: string;
        validData: { score: number; content: string }[];
      }
    | undefined
  >();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const { id: datasetId } = params;
  return (
    <Layout>
      <Header>
        <div>KnowledgeTestPage</div>
      </Header>
      <Content>
        <Flex gap={12} vertical>
          <Col flex={1}>
            <Form
              layout="vertical"
              onFinish={(values) => {
                setLoading(true);
                axios
                  .post(
                    `/api/retrieve/dataset/${datasetId}/retrieve/test`,
                    {
                      question: values.question,
                    },
                    {
                      timeout: 120000,
                    }
                  )
                  .then((res) => {
                    setData(res.data);
                  })
                  .finally(() => {
                    setLoading(false);
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
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={loading}
                >
                  OK
                </Button>
              </Item>
            </Form>
          </Col>
          <Col flex={1}>
            <Typography.Paragraph title={data?.replyPrompt}>
              {data?.replyPrompt}
            </Typography.Paragraph>
            <Flex gap={12}>
              <Col flex={1}>
                <ResponseDisplay>{data?.completion}</ResponseDisplay>
              </Col>
              <Col>
                <Table
                  dataSource={data?.validData}
                  columns={[
                    { dataIndex: "score", title: "Score" },
                    {
                      dataIndex: "content",
                      title: "Content",
                      render: (text) => (
                        <div style={{ maxWidth: 300 }}>{text}</div>
                      ),
                    },
                  ]}
                ></Table>
              </Col>
            </Flex>
          </Col>
        </Flex>
      </Content>
      <Footer></Footer>
    </Layout>
  );
}
