import { useState } from 'react';
import { Divider, Tabs, Input, Spin, Pagination, Empty } from 'antd';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SummaryCard from '../../components/summary-card/SummaryCard';
import { DeliveryCard } from './components/DeliveryCard';
import { DriverCard } from './components/DriverCard';
import { DeliveryDetailModal } from './components/DeliveryDetailModal';
import { AssignDriverModal } from './components/AssignDriverModal';
import { DriverDetailModal } from './components/DriverDetailModal';
import { useDeliveries } from './hooks/useDeliveries';
import { useDrivers } from './hooks/useDrivers';

const ManageShipping = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedTab, setSelectedTab] = useState('all');
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [driverDetailModalOpen, setDriverDetailModalOpen] = useState(false);
    const [driverStatusFilter, setDriverStatusFilter] = useState(null);

    // Use custom hooks
    const {
        deliveries,
        loading: deliveriesLoading,
        pagination: deliveryPagination,
        summary,
        updateFilters: updateDeliveryFilters,
        changePage: changeDeliveryPage,
        assignDriver,
        updateStatus
    } = useDeliveries();

    const {
        drivers,
        loading: driversLoading,
        summary: driverSummary
    } = useDrivers();

    // Handle search
    const handleSearch = (value) => {
        setSearchText(value);
        updateDeliveryFilters({ search: value });
    };

    // Handle tab change
    const handleTabChange = (key) => {
        setSelectedTab(key);
        if (key === 'all') {
            updateDeliveryFilters({ status: null });
        } else {
            updateDeliveryFilters({ status: key });
        }
    };

    // Handle view detail
    const handleViewDetail = (delivery) => {
        setSelectedDelivery(delivery);
        setDetailModalOpen(true);
    };

    // Handle assign driver
    const handleOpenAssignModal = (delivery) => {
        setSelectedDelivery(delivery);
        setAssignModalOpen(true);
    };

    // Handle driver click
    const handleDriverClick = (driver) => {
        setSelectedDriver(driver);
        setDriverDetailModalOpen(true);
    };

    // Filter drivers by status
    const filteredDrivers = driverStatusFilter
        ? drivers.filter(d => d.status === driverStatusFilter)
        : drivers;

    const tabItems = [
        { key: 'all', label: `Tất cả (${deliveryPagination.total})` },
        { key: 'PENDING', label: `Chờ lấy hàng (${summary.pending})` },
        { key: 'DELIVERING', label: `Đang giao (${summary.delivering})` },
        { key: 'DELIVERED', label: `Đã giao (${summary.delivered})` },
        { key: 'FAILED', label: `Thất bại (${summary.failed})` }
    ];

    const driverTabs = [
        { key: null, label: `Tất cả (${driverSummary.available + driverSummary.busy + driverSummary.offline})` },
        { key: 'AVAILABLE', label: `Rảnh (${driverSummary.available})` },
        { key: 'BUSY', label: `Bận (${driverSummary.busy})` },
        { key: 'OFFLINE', label: `Offline (${driverSummary.offline})` }
    ];

    return (
        <div className="flex flex-col h-fit w-full p-5 gap-3 bg-gray-50 overflow-scroll">
            {/* Header */}
            <div className="header-part flex flex-col">
                <h1 className='text-2xl font-bold mb-2'>Quản lý vận chuyển</h1>
                <p>Theo dõi và quản lý giao hàng</p>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards flex flex-row justify-between gap-5">
                <SummaryCard
                    title="Chờ lấy hàng"
                    content={summary.pending}
                    onClick={() => handleTabChange('PENDING')}
                />
                <SummaryCard
                    title="Đang giao"
                    variant='success'
                    content={summary.delivering}
                    onClick={() => handleTabChange('DELIVERING')}
                />
                <SummaryCard
                    title="Đã giao"
                    variant="info"
                    content={summary.delivered}
                    onClick={() => handleTabChange('DELIVERED')}
                />
                <SummaryCard
                    title="Giao thất bại"
                    content={summary.failed}
                    variant="danger"
                    onClick={() => handleTabChange('FAILED')}
                />
                <SummaryCard
                    title="Tỷ lệ đúng hạn"
                    content={`${summary.onTimeRate}%`}
                    variant="success"
                />
            </div>

            {/* Search Box */}
            <div className="search-filter flex flex-row justify-between items-center p-5 bg-white border-gray-200 border rounded-xl">
                <div className='search w-full'>
                    <Input
                        placeholder="Tìm kiếm theo mã đơn, tên khách hàng, SĐT, địa chỉ..."
                        prefix={<SearchOutlinedIcon sx={{ fontSize: 20, color: '#999' }} />}
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        size='large'
                        allowClear
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-row justify-between gap-3">
                {/* Delivery Orders List */}
                <div className="p-5 bg-white rounded-xl flex flex-col w-full gap-5">
                    <div className='flex justify-between items-center'>
                        <p className="text-xl font-bold">Danh sách đơn giao hàng</p>
                    </div>

                    <Tabs
                        activeKey={selectedTab}
                        onChange={handleTabChange}
                        items={tabItems}
                    />

                    <Divider style={{ margin: 0 }} />

                    {/* Delivery List */}
                    {deliveriesLoading ? (
                        <div className='flex justify-center py-10'>
                            <Spin size='large' />
                        </div>
                    ) : deliveries.length === 0 ? (
                        <Empty description="Không có đơn hàng nào" />
                    ) : (
                        <>
                            <div className='flex flex-col gap-4'>
                                {deliveries.map(delivery => (
                                    <DeliveryCard
                                        key={delivery.id}
                                        delivery={delivery}
                                        onViewDetail={handleViewDetail}
                                        onAssignDriver={handleOpenAssignModal}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {deliveryPagination.totalPages > 1 && (
                                <div className='flex justify-center mt-4'>
                                    <Pagination
                                        current={deliveryPagination.page}
                                        total={deliveryPagination.total}
                                        pageSize={deliveryPagination.limit}
                                        onChange={changeDeliveryPage}
                                        showSizeChanger={false}
                                        showTotal={(total) => `Tổng ${total} đơn hàng`}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Drivers Sidebar */}
                <div className="flex flex-col gap-5 w-2/5">
                    <div className="flex flex-col gap-5 w-full h-fit bg-white p-5 rounded-xl">
                        <p className="text-xl font-bold">Nhân viên giao hàng</p>

                        <Tabs
                            activeKey={driverStatusFilter}
                            onChange={setDriverStatusFilter}
                            items={driverTabs}
                            size='small'
                        />

                        <Divider style={{ margin: 0 }} />

                        {driversLoading ? (
                            <div className='flex justify-center py-10'>
                                <Spin />
                            </div>
                        ) : filteredDrivers.length === 0 ? (
                            <Empty description="Không có tài xế nào" />
                        ) : (
                            <div className='flex flex-col gap-3 max-h-[600px] overflow-y-auto'>
                                {filteredDrivers.map(driver => (
                                    <DriverCard
                                        key={driver.id}
                                        driver={driver}
                                        onClick={handleDriverClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <DeliveryDetailModal
                open={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                delivery={selectedDelivery}
                onUpdateStatus={updateStatus}
            />

            <AssignDriverModal
                open={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                delivery={selectedDelivery}
                onAssign={assignDriver}
            />

            <DriverDetailModal
                open={driverDetailModalOpen}
                onClose={() => setDriverDetailModalOpen(false)}
                driver={selectedDriver}
            />
        </div>
    );
};

export default ManageShipping;
