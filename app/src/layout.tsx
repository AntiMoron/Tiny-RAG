import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import Dataset from './page/Dataset/page'

export default function Layout() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<div>123</div>} path="/"></Route>
          <Route element={<Dataset />} path="/dataset"></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}
