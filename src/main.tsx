import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Notes from './pages/Notes';
import Layout from './layout/BaseLayout';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/notes",
    element: <Notes />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Layout>
      <RouterProvider router={router} />
    </Layout>
  </React.StrictMode>,
);
