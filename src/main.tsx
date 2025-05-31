import { Analytics } from "@vercel/analytics/next";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App";
import Layout from "./layout/BaseLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Layout>
      <Analytics />
      <RouterProvider router={router} />
    </Layout>
  </React.StrictMode>,
);
