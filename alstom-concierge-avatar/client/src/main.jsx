import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import MicPage from "./MicPage.jsx";
import SharePointPage from "./SharePointPage.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/mic" element={<MicPage />} />
        <Route path="/sharepoint" element={<SharePointPage />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
