import { Outlet, Route, Routes } from "react-router-dom";
import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";
import Dashboard from "./dashboard/Dashboard";

const Base = () => {

    return (
        <div className="w-full h-full flex flex-row">
            <Sidebar></Sidebar>
            <div className="w-full h-full flex flex-col">
                <Header></Header>
                <Outlet></Outlet>
            </div>
        </div>
    )
}

export default Base;