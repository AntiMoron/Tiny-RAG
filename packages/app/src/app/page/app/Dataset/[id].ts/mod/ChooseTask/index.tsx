import { useMount } from "ahooks";
import { Modal } from "antd";
import axios from "axios";
import React, { useEffect } from "react";

export interface ChooseTaskProps {
  type: string;
  datasetId: string;
}

export default function ChooseTask(props: ChooseTaskProps) {
  const { type, datasetId } = props;
  useEffect(() => {
    if (!datasetId) {
      return;
    }
    axios.get(`/api/feishu/dataset/${datasetId}/tasks`).then((res) => {
      console.log(res.data);
    });
  }, [datasetId]);
  return <Modal></Modal>;
}
