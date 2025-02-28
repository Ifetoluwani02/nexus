import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import "./styles/global.css";

export default function App() {
  return (
    <div className="app-container">
      <Header />
      <div className="main-container">
        <Sidebar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}