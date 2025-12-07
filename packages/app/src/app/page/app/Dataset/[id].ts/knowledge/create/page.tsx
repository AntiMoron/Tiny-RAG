import React, { useMemo, useState } from "react";
import { Layout, StepsProps, Tabs, Tag } from "antd";
import { useParams } from "react-router";
import { useMount } from "ahooks";
import axios from "axios";
import { Dataset } from "tinyrag-types/dataset";
import { Flex, Steps } from "antd";
import ChooseTask from "./mod/ChooseTask";

const TabPane = Tabs.TabPane;

const { Header, Content } = Layout;

export default function KnowledgeCreatePage() {
  const params = useParams();
  const { id: datasetId } = params;
  const [currentStep, setCurrentStep] = useState(0);
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
        content: "Create Sync Task",
        // status: "error",
      },
      {
        title: "Step 3",
        content: "Create Indexing Task",
      },
    ],
  };
  return (
    <Layout>
      <Content>
        <Steps
          {...sharedProps}
          current={currentStep}
          onChange={(current) => setCurrentStep(current)}
        />
        <ChooseTask
          style={{ display: currentStep === 0 ? "block" : "none" }}
          datasetId={datasetId!}
          type={type!}
        />
      </Content>
    </Layout>
  );
}
