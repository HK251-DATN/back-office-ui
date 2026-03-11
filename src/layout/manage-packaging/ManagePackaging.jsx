import { Table } from "antd";
import SearchBox from "../../components/search-box/SearchBox";
import SummaryCard from "../../components/summary-card/SummaryCard";

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
                <div className="p5 bg-white rounded-xl flex flex-col gap-2">
                    {/* Hàng đợi đóng gói */}
                    {/* --------------------- */}
                    {/* List of packaging task */}
                </div>
                <div className="flex flex-col gap-3">
                    {/* Nhân viên đóng gói */}

                    {/* Hướng dẫn đóng gói */}
                </div>
            </div>

        </div>
    )
}

export default ManagePackaging;