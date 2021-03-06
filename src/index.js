import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { AuthProvider } from "./context/AuthProvider";
import { QueuesProvider } from "./context/QueuesProvider";
import { AgentProvider } from "./context/AgentProvider";
import { SkuProvider } from "./context/SkuProvider";

ReactDOM.render(
  <AuthProvider>
    <QueuesProvider>
      <AgentProvider>
        <SkuProvider>
          <App />
        </SkuProvider>
      </AgentProvider>
    </QueuesProvider>
  </AuthProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
