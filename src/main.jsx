import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "./index.css";

import {ThemeProvider} from "@material-tailwind/react";
import {AuthProvider} from '@/features/auth';

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";  

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <AuthProvider>
            <ThemeProvider>
                <App/>
            </ThemeProvider>
        </AuthProvider>
    </React.StrictMode>
);