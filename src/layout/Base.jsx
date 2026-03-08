import { Outlet, Route, Routes } from "react-router-dom";
import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";
import Dashboard from "./dashboard/Dashboard";

const Base = () => {

    return (
        <div className="w-full h-full flex flex-row overflow-hidden">
            <Sidebar className="sticky top-0 left-0"></Sidebar>
            <div className="w-full h-full flex flex-col">
                <Header></Header>
                <div className="w-full h-full overflow-scroll">
                    <Outlet></Outlet>
                </div>
            </div>
        </div>
    )
}

export default Base;