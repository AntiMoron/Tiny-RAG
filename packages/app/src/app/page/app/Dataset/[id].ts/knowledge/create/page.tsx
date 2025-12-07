import React, { useMemo, useState } from "react";
import { Layout, StepsProps, Tabs, Tag } from "antd";
import { useParams } from "react-router";
import { useMount } from "ahooks";
import axios from "axios";
import { Dataset } from "tinyrag-types/dataset";
import { Flex, Steps } from "antd";

const TabPane = Tabs.TabPane;

const { Header, Content } = Layout;

export default function KnowledgeCreatePage() {
  const params = useParams();
  const { id: datasetId } = params;

  const [detail, setDetail] = useState<undefined | Dataset>();
  useMount(() => {
    axios.get(`/api/dataset/detail/${datasetId}`).then((res) => {
      setDetail(res.data);
    });
  });

  const type = useMemo(() => {
    return detail?.type;
  }, [detail]);

  if (!detail) {
    return null;
  }

  const sharedProps: StepsProps = {
    type: "panel",
    // current,
    // onChange,
    items: [
      {
        title: "Step 1",
        subTitle: <Tag color="yellow">{type}</Tag>,
        content: "Choose doc to sync",
      },
      {
        title: "Step 2",
        content: "This is a content.",
        status: "error",
      },
      {
        title: "Step 3",
        content: "This is a content.",
      },
    ],
  };
  return (
    <Layout>
      <Content>
        <Steps {...sharedProps} />
        <Tabs>
          <TabPane key="123" tab="123" tabKey="123">
            <div>123</div>
          </TabPane>
          <TabPane tabKey="345" tab="1423">
            <div>123</div>
          </TabPane>
          <TabPane tabKey="156723" tab="1263">
            <div>123</div>
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
}
