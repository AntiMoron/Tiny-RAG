import React, { useEffect, useRef } from "react";
import service from "src/util/service";

// Extend window interface for ECharts
declare global {
  interface Window {
    echarts: any;
  }
}

const AnalysisPage = () => {
  // Chart container refs
  const completionTrendRef = useRef<HTMLDivElement>(null);
  const tokenUsageRef = useRef<HTMLDivElement>(null);
  const responseTimeRef = useRef<HTMLDivElement>(null);
  const modelUsageRef = useRef<HTMLDivElement>(null);

  // Chart instances
  const completionChartRef = useRef<any>(null);
  const tokenChartRef = useRef<any>(null);
  const responseChartRef = useRef<any>(null);
  const modelChartRef = useRef<any>(null);

  // Initialize charts when component mounts
  useEffect(() => {
    if (window.echarts && completionTrendRef.current) {
      completionChartRef.current = window.echarts.init(
        completionTrendRef.current
      );
      tokenChartRef.current = window.echarts.init(tokenUsageRef.current);
      responseChartRef.current = window.echarts.init(responseTimeRef.current);
      modelChartRef.current = window.echarts.init(modelUsageRef.current);

      // Fetch and render data
      loadAllCharts();
    }

    // Cleanup on unmount
    return () => {
      completionChartRef.current?.dispose();
      tokenChartRef.current?.dispose();
      responseChartRef.current?.dispose();
      modelChartRef.current?.dispose();
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      completionChartRef.current?.resize();
      tokenChartRef.current?.resize();
      responseChartRef.current?.resize();
      modelChartRef.current?.resize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // API service functions
  const fetchCompletionTrend = async () => {
    const response = service.get("/api/analysis/completion-trend");
    return await response.then((a) => a.data);
  };

  const fetchTokenUsage = async () => {
    const response = service.get("/api/analysis/token-usage");
    return await response.then((a) => a.data);
  };

  const fetchResponseTime = async () => {
    const response = service.get("/api/analysis/response-time");
    return await response.then((a) => a.data);
  };

  const fetchModelUsage = async () => {
    const response = service.get("/api/analysis/model-usage");
    return await response.then((a) => a.data);
  };

  // Load all chart data
  const loadAllCharts = async () => {
    try {
      const [completionData, tokenData, responseData, modelData] =
        await Promise.all([
          fetchCompletionTrend(),
          fetchTokenUsage(),
          fetchResponseTime(),
          fetchModelUsage(),
        ]);

      renderCompletionTrend(completionData);
      renderTokenUsage(tokenData);
      renderResponseTime(responseData);
      renderModelUsage(modelData);
    } catch (error) {
      console.error("Error loading chart data:", error);
    }
  };

  // Render completion trend chart
  const renderCompletionTrend = (data: any[]) => {
    const option = {
      title: {
        text: "Completion Trend",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        formatter: "{b}: {c} completions",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map((item) => item.hour),
        axisLabel: {
          rotate: 45,
          interval: 0,
        },
      },
      yAxis: {
        type: "value",
        name: "Completions",
      },
      series: [
        {
          data: data.map((item) => item.count),
          type: "line",
          smooth: true,
          itemStyle: {
            color: "#5470C6",
          },
          lineStyle: {
            width: 3,
          },
        },
      ],
    };

    completionChartRef.current.setOption(option);
  };

  // Render token usage chart
  const renderTokenUsage = (data: any[]) => {
    const option = {
      title: {
        text: "Token Usage Trend",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        formatter: "{b}: {c} tokens",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map((item) => item.hour),
        axisLabel: {
          rotate: 45,
          interval: 0,
        },
      },
      yAxis: {
        type: "value",
        name: "Total Tokens",
      },
      series: [
        {
          data: data.map((item) => item.totalTokens),
          type: "bar",
          itemStyle: {
            color: "#91CC75",
          },
        },
      ],
    };

    tokenChartRef.current.setOption(option);
  };

  // Render response time chart
  const renderResponseTime = (data: any[]) => {
    const option = {
      title: {
        text: "Response Time Trend",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        formatter: "{b}: {c} ms",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map((item) => item.hour),
        axisLabel: {
          rotate: 45,
          interval: 0,
        },
      },
      yAxis: {
        type: "value",
        name: "Avg Response Time (ms)",
      },
      series: [
        {
          data: data.map((item) => item.avgResponseTime),
          type: "line",
          itemStyle: {
            color: "#EE6666",
          },
          lineStyle: {
            width: 3,
          },
        },
      ],
    };

    responseChartRef.current.setOption(option);
  };

  // Render model usage chart
  const renderModelUsage = (data: any[]) => {
    // Group data by provider
    const models = Array.from(new Set(data.map((item) => item.model)));

    // Prepare series data
    const series = models.map((model) => ({
      name: model,
      type: "line",
      data: data
        .filter((item) => item.model === model)
        .map((item) => ({
          name: item.hour,
          value: item.count,
        })),
    }));

    const option = {
      title: {
        text: "Model Usage Trend",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: models,
        bottom: 0,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: Array.from(new Set(data.map((item) => item.hour))),
        axisLabel: {
          rotate: 45,
          interval: 0,
        },
      },
      yAxis: {
        type: "value",
        name: "Completions",
      },
      series,
    };

    modelChartRef.current.setOption(option);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        System Analysis Dashboard
      </h1>

      {/* Chart containers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          ref={completionTrendRef}
          style={{
            width: "100%",
            height: "300px",
            border: "1px solid #eee",
            borderRadius: "4px",
          }}
        ></div>
        <div
          ref={tokenUsageRef}
          style={{
            width: "100%",
            height: "300px",
            border: "1px solid #eee",
            borderRadius: "4px",
          }}
        ></div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <div
          ref={responseTimeRef}
          style={{
            width: "100%",
            height: "300px",
            border: "1px solid #eee",
            borderRadius: "4px",
          }}
        ></div>
        <div
          ref={modelUsageRef}
          style={{
            width: "100%",
            height: "300px",
            border: "1px solid #eee",
            borderRadius: "4px",
          }}
        ></div>
      </div>
    </div>
  );
};

export default AnalysisPage;
