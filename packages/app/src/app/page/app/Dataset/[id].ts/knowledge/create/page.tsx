import React, { useMemo, useState } from "react";
import { Button, Layout, StepsProps, Tabs, Tag } from "antd";
import { useNavigate, useParams } from "react-router";
import { useMount } from "ahooks";
import axios from "../../../../../../../util/service";
import { Dataset } from "tinyrag-types/dataset";
import { Flex, Steps } from "antd";
import ChooseTask from "./mod/ChooseTask";
import { KnowledgeTask } from "tinyrag-types/task";
import { Footer } from "antd/es/layout/layout";

const TabPane = Tabs.TabPane;

const { Header, Content } = Layout;

export default function KnowledgeCreatePage() {
  const params = useParams();
  const { id: datasetId } = params;
  const nav = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [detail, setDetail] = useState<undefined | Dataset>();
  const [config, setConfig] = useState<KnowledgeTask>({
    datasetId: "",
    knowledgeId: "",
    ChooseTask: {
      type: "",
      params: {
        docTokens: [],
      },
    },
    Chunking: {
      method: "trival",
    },
    Indexing: {},
  });
  useMount(() => {
    axios.get(`/api/dataset/detail/${datasetId}`).then((res) => {
      const detail = res.data;
      setDetail(detail);
      const { id } = detail;
      setConfig((prev) => {
        return {
          ...prev,
          datasetId: id,
          knowledgeId: "",
        };
      });
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
          onChange={(params) => {
            setConfig((prev) => {
              return {
                ...prev,
                ChooseTask: {
                  ...prev.ChooseTask,
                  ...params,
                },
              };
            });
          }}
        />
      </Content>
      <Footer>
        <Button
          type="primary"
          htmlType="submit"
          onClick={async () => {
            await axios
              .post("/api/task/add", {
                ...config,
              })
              .then(() => {
                nav(`/app/dataset/${datasetId}`);
              });
          }}
        >
          OK
        </Button>
      </Footer>
    </Layout>
  );
}
