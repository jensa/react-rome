import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./utils/errorboundary";

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <App />
      </div>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);
