import React from "react";
import { HashRouter, Outlet, Route, Routes } from "react-router";
import App from "./app/page/app/page";
import DatasetPage from "./app/page/app/Dataset/page";
import AIProviderPage from "./app/page/app/AIProvider/page";
import DatasetDetailPage from "./app/page/app/Dataset/[id].ts/page";
import APIKeyPage from "./app/page/app/APIKey/page";
import KnowledgeCreatePage from "./app/page/app/Dataset/[id].ts/knowledge/create/page";
import KnowledgeTestPage from "./app/page/app/Dataset/[id].ts/knowledge/test/page";

export default function Layout() {
  return (
    <div>
      <HashRouter>
        <Routes>
          <Route index element={<div>123</div>} path="/"></Route>
          <Route element={<App />} path="/app/">
            <Route index element={<DatasetPage />} path="dataset"></Route>
            <Route element={<DatasetDetailPage />} path="dataset/:id"></Route>
            <Route element={<AIProviderPage />} path="aiprovider"></Route>
            <Route element={<KnowledgeCreatePage />} path="dataset/:id/knowledge/create"></Route>
            <Route element={<KnowledgeTestPage />} path="dataset/:id/knowledge/test"></Route>
            <Route element={<APIKeyPage />} path="apikey"></Route>
            <Route element={<AIProviderPage />} path="user"></Route>
          </Route>
        </Routes>
      </HashRouter>
    </div>
  );
}
