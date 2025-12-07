import React, { useEffect, useState } from "react";
import { Card } from "antd";
import axios from "axios";
import { useMount } from "ahooks";

export default function Page() {
  const [data, setData] = useState([]);
  useMount(() => {
    axios.get("/api/dataset/list").then((res) => {
      setData(res.data);
    });
  });
  return (
    <div>
      {data?.map((item: Dataset) => (
        <Card title={}></Card>
      ))}
    </div>
  );
}
