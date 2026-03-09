import SummaryCard from "./summary-card.jsx/SummaryCard";
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import ProfitChart from "./profit-chart/ProfitChart";
import BestSellerChart from "./best-seller-chart/BestSellerChart";
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';

const Dashboard = () => {
    return (
        <div className="flex flex-col h-fit w-full p-5 gap-3 bg-gray-50">
            <div className="title">
                <h1 className='text-2xl font-bold mb-2'>Tổng quan</h1>
                <p>Giám sát hoạt động thời gian thực</p>
            </div>
            <div className="summary-cards flex flex-row justify-between gap-5">
                <SummaryCard title={"Đơn hàng hôm nay"} content={"234"} subContent={"+12% so với hôm qua"} variant="success" icon={<ShoppingCartOutlinedIcon />}></SummaryCard>
                <SummaryCard title={"Đang xử lý"} content={"155"} subContent={"45 chờ / 32 đóng gói / 78 giao"} variant="info" icon={<Inventory2OutlinedIcon />}></SummaryCard>
                <SummaryCard title={"Cảnh báo tồn kho"} content={"18"} subContent={"5 sắp hết hạn / 13 hết hàng"} variant="danger" icon={<ReportProblemOutlinedIcon />}></SummaryCard>
                <SummaryCard title={"Doanh thu tuần này"} content={"386tr"} subContent={"+8.5% so với tuần trước"} variant="success" icon={<ShowChartOutlinedIcon />}></SummaryCard>
            </div>
            <div className="main-dashboards w-full flex flex-row gap-4 justify-between">
                <div className="main-dashboard-1 w-full">
                    <ProfitChart />
                </div>
                <div className="main-dashboard-2 w-full">
                    <BestSellerChart />
                </div>
            </div>
            <div className="sub-dashboards flex flex-row gap-4 justify-between">
                <div className="sub-dashboard-1 h-72 p-5 bg-white rounded-xl border border-gray-200 w-full flex flex-col gap-3">
                    <p className="text-xl font-bold">Trạng thái đơn hàng</p>
                    <div className="flex flex-row justify-between">
                        <p>Chờ xử lý</p>
                        <p>45</p>
                    </div>
                    <div className="flex flex-row justify-between">
                        <p>Đóng gói</p>
                        <p>45</p>
                    </div>
                    <div className="flex flex-row justify-between">
                        <p>Đang vận chuyển</p>
                        <p>45</p>
                    </div>
                    <div className="flex flex-row justify-between">
                        <p>Đã hoàn thành</p>
                        <p>45</p>
                    </div>
                </div>
                <div className="sub-dashboard-2 h-72 p-5 bg-white rounded-xl border border-gray-200 w-full flex flex-col gap-3 overflow-scroll">
                    <p className="text-xl font-bold">Cảnh báo kho</p>
                    <div className="flex flex-row items-center p-3 gap-3 bg-red-200 rounded-lg">
                        <ThermostatOutlinedIcon />
                        <div className="flex flex-col">
                            <p>Nhiệt độ kho #2: 12°C</p>
                            <p className="text-sm">Vượt ngưỡng cho rau củ (2-8°C)</p>
                        </div>
                    </div>
                    <div className="flex flex-row items-center p-3 gap-3 bg-red-200 rounded-lg">
                        <ThermostatOutlinedIcon />
                        <div className="flex flex-col">
                            <p>Nhiệt độ kho #2: 12°C</p>
                            <p className="text-sm">Vượt ngưỡng cho rau củ (2-8°C)</p>
                        </div>
                    </div>
                    <div className="flex flex-row items-center p-3 gap-3 bg-red-200 rounded-lg">
                        <ThermostatOutlinedIcon />
                        <div className="flex flex-col">
                            <p>Nhiệt độ kho #2: 12°C</p>
                            <p className="text-sm">Vượt ngưỡng cho rau củ (2-8°C)</p>
                        </div>
                    </div>
                </div>
                <div className="sub-dashboard-3 h-72 p-5 bg-white rounded-xl border border-gray-200 w-full flex flex-col gap-3">
                    <p className="text-xl font-bold">Hành động nhanh</p>
                    <div className="add-emp-button">
                        <Button fullWidth variant='contained' color="success" startIcon={<AddIcon />}>Thêm nhân viên mới</Button>
                    </div>
                    <div className="add-emp-button">
                        <Button fullWidth variant='contained' color="warning" startIcon={<AddIcon />}>Thêm sản phẩm mới</Button>
                    </div>
                    <div className="add-emp-button">
                        <Button fullWidth variant='contained' color="info" startIcon={<AddIcon />}>Tạo sự kiện khuyến mãi</Button>
                    </div>
                    <div className="add-emp-button">
                        <Button fullWidth variant='contained' color="secondary" startIcon={<AddIcon />}>Xem báo cáo chi tiết</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;