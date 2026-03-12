import { Divider } from "antd";
import SearchBox from "../../components/search-box/SearchBox";
import SummaryCard from "../../components/summary-card/SummaryCard";
import { DeliveringTask } from "./components/DeliveringTask";
import { DeliveringEmp } from "./components/DeliveringEmp";

const ManageShipping = () => {
    return (
        <div className="flex flex-col h-fit w-full p-5 gap-3 bg-gray-50 overflow-scroll">
            <div className="header-part flex flex-col">
                <h1 className='text-2xl font-bold mb-2'>Quản lý vận chuyển</h1>
                <p>Theo dõi và quản lý giao hàng</p>
            </div>

            <div className="summary-cards flex flex-row justify-between gap-5">
                <SummaryCard title="Chờ lấy hàng" content={2} ></SummaryCard>
                <SummaryCard title="Đang giao" variant='success' content={2} ></SummaryCard>
                <SummaryCard title="Đã giao" variant="info" content={1} ></SummaryCard>
                <SummaryCard title="Giao thất bại" content={1} variant="danger" ></SummaryCard>
                <SummaryCard title="Tỷ lệ đúng hạn" content={"88.5%"} variant="success" ></SummaryCard>
            </div>

            <div className="search-filter flex flex-row justify-between items-center p-5 bg-white border-gray-200 border rounded-xl">
                <div className='search w-4/5'>
                    <SearchBox></SearchBox>
                </div>
                <div className='filter'>Filter</div>
            </div>

            <div className="flex flex-row justify-between gap-3">
                <div className="p-5 bg-white rounded-xl flex flex-col w-full gap-5">
                    {/* Danh sách đơn giao hàng */}
                    <p className="text-xl font-bold">Danh sách đơn giao hàng</p>
                    {/* --------------------- */}
                    <Divider style={{ "margin": "0" }}></Divider>
                    {/* List of packaging task */}
                    <DeliveringTask status={"DELIVERING"} />

                    <DeliveringTask status={"DELIVERED"} />

                    <DeliveringTask />

                </div>
                <div className="flex flex-col gap-5 w-2/5">
                    {/* Nhân viên đóng gói */}
                    <div className="flex flex-col gap-5 w-full h-fit bg-white p-5  rounded-xl">
                        <p className="text-xl font-bold">Nhân viên giao hàng</p>
                        <Divider style={{ "margin": 0 }}></Divider>
                        < DeliveringEmp />
                        < DeliveringEmp />
                        < DeliveringEmp />
                        < DeliveringEmp />
                        < DeliveringEmp />
                    </div>

                    {/* Hướng dẫn đóng gói */}
                    {/* <div className="flex w-full h-fit bg-white p-5">
                        <p>Hướng dẫn đóng gói</p>
                    </div> */}

                </div>
            </div>

        </div>
    )
}

export default ManageShipping;