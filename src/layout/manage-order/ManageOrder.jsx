import SearchBox from "../../components/search-box/SearchBox";
import SummaryCard from "../../components/summary-card/SummaryCard";
import OrderTable from "./components/OrderTable";

const ManageOrder = () => {
    return (
        <div className="flex flex-col h-fit w-full p-5 gap-3 bg-gray-50 overflow-scroll">
            <div className="header-part flex flex-col">
                <h1 className='text-2xl font-bold mb-2'>Quản lý đơn hàng</h1>
                <p>Quản lý và xác nhận đơn hàng từ khách hàng</p>
            </div>

            <div className="summary-cards flex flex-row justify-between gap-5">
                <SummaryCard title="Tổng đơn hàng" content={0}></SummaryCard>
                <SummaryCard title="Chờ xác nhận" variant='warning' content={0}></SummaryCard>
                <SummaryCard title="Đang xử lý" variant='info' content={0}></SummaryCard>
                <SummaryCard title="Hoàn thành" variant='success' content={0}></SummaryCard>
            </div>

            <div className="search-filter flex flex-row justify-between items-center p-5 bg-white border-gray-200 border rounded-xl">
                <div className='search w-4/5'>
                    <SearchBox></SearchBox>
                </div>
                <div className='filter'>Filter</div>
            </div>

            <div className="data-table">
                <OrderTable />
            </div>
        </div>
    )
}

export default ManageOrder;
