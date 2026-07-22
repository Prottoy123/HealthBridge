import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store.js";
import { Toaster } from "react-hot-toast"; // ১. গ্লোবাল টোস্ট ইম্পোর্ট করা হলো

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
        <Toaster position="top-right" reverseOrder={false} />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);
