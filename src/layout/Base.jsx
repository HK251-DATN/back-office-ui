import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";

const Base = () => {

    return (
        <div className="w-full h-full flex flex-row">
            <Sidebar></Sidebar>
            <div className="w-full h-full flex flex-col">
                <Header></Header>
                {/* Main content */}
            </div>
        </div>
    )
}

export default Base;