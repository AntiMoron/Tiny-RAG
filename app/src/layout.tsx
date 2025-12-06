import React from "react";
import { HashRouter, Outlet, Route, Routes } from "react-router";
import App from "./app/page/app/page";
import Dataset from "./app/page/app/Dataset/page";



export default function Layout() {
  return (
    <div>
      <HashRouter>
        <Routes>
          <Route index element={<div>123</div>} path="/"></Route>
          <Route element={<App />} path="/app/">
            <Route index element={<Dataset />} path="dataset"></Route>
          </Route>
        </Routes>
      </HashRouter>
    </div>
  );
}