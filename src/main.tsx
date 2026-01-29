import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./i18n";

import { CartProvider } from "./context/CartContext";
import { ContentProvider } from "./context/ContentContext";
import { ToastProvider } from "./context/ToastContext";
import { NotificationsProvider } from "./context/NotificationsContext";

import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ContentProvider>
          <CartProvider>
            <ToastProvider>
              <NotificationsProvider>
                <App />
              </NotificationsProvider>
            </ToastProvider>
          </CartProvider>
        </ContentProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
