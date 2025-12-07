import React from "react";
import { HashRouter, Outlet, Route, Routes } from "react-router";
import App from "./app/page/app/page";
import DatasetPage from "./app/page/app/Dataset/page";
import AIProviderPage from "./app/page/app/AIProvider/page";
import DatasetDetailPage from "./app/page/app/Dataset/[id].ts/page";

export default function Layout() {
  return (
    <div>
      <HashRouter>
        <Routes>
          <Route index element={<div>123</div>} path="/"></Route>
          <Route element={<App />} path="/app/">
            <Route index element={<DatasetPage />} path="dataset"></Route>
            <Route index element={<DatasetDetailPage />} path="dataset/:id"></Route>
            <Route element={<AIProviderPage />} path="aiprovider"></Route>
          </Route>
        </Routes>
      </HashRouter>
    </div>
  );
}
