import { Divider, Table } from "antd";
import SearchBox from "../../components/search-box/SearchBox";
import SummaryCard from "../../components/summary-card/SummaryCard";
import { PackagingTask } from "./components/PackagingTask";
import { PackagingEmp } from "./components/PackagingEmp";

const ManagePackaging = () => {
    return (
        <div className="flex flex-col h-fit w-full p-5 gap-3 bg-gray-50 overflow-scroll">
            <div className="header-part flex flex-col">
                <h1 className='text-2xl font-bold mb-2'>Quản lý đóng gói</h1>
                <p>Theo dõi và xử lý hàng đợi đóng gói đơn hàng</p>
            </div>

            <div className="summary-cards flex flex-row justify-between gap-5">
                <SummaryCard title="Chờ đóng gói" content={3} ></SummaryCard>
                <SummaryCard title="Đang đóng gói" variant='success' content={2} ></SummaryCard>
                <SummaryCard title="Kiểm tra chất lượng" variant="info" content={1} ></SummaryCard>
                <SummaryCard title="Nhân viên làm việc" content={"3/5"} variant="success" ></SummaryCard>
            </div>

            <div className="search-filter flex flex-row justify-between items-center p-5 bg-white border-gray-200 border rounded-xl">
                <div className='search w-4/5'>
                    <SearchBox></SearchBox>
                </div>
                <div className='filter'>Filter</div>
            </div>

            <div className="flex flex-row justify-between gap-3">
                <div className="p-5 bg-white rounded-xl flex flex-col w-full gap-5">
                    {/* Hàng đợi đóng gói */}
                    <p className="text-xl font-bold">Hàng đợi đóng gói</p>
                    {/* --------------------- */}
                    <Divider style={{ "margin": 0 }}></Divider>
                    {/* List of packaging task */}
                    <PackagingTask />
                    <Divider style={{ "margin": 0 }}></Divider>
                    <PackagingTask />
                    <Divider style={{ "margin": 0 }}></Divider>
                    <PackagingTask />
                    <Divider style={{ "margin": 0 }}></Divider>
                    <PackagingTask />
                    <Divider style={{ "margin": 0 }}></Divider>
                    <PackagingTask />
                </div>
                <div className="flex flex-col gap-5 w-2/5">
                    {/* Nhân viên đóng gói */}
                    <div className="flex flex-col gap-5 w-full h-fit bg-white p-5  rounded-xl">
                        <p className="text-xl font-bold">Nhân viên đóng gói</p>
                        <Divider style={{ "margin": 0 }}></Divider>
                        < PackagingEmp />
                        < PackagingEmp />
                        < PackagingEmp />
                        < PackagingEmp />
                        < PackagingEmp />
                    </div>

                    {/* Hướng dẫn đóng gói */}
                    <div className="flex w-full h-fit bg-white p-5">
                        <p>Hướng dẫn đóng gói</p>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default ManagePackaging;