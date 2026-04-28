import { useState } from 'react';
import { Button, Select, DatePicker, Input, Space } from 'antd';
import { PlusOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import SaleEventTable from './components/SaleEventTable';
import SaleEventFormModal from './components/SaleEventFormModal';
import SaleEventDetailView from './components/SaleEventDetailView';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ManageSaleEvent = () => {
    // 'list' | 'detail'
    const [view, setView] = useState('list');
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [selectedEventMeta, setSelectedEventMeta] = useState(null);

    // List filters
    const [searchString, setSearchString] = useState('');
    const [activeYn, setActiveYn] = useState(undefined);
    const [enableYn, setEnableYn] = useState(undefined);
    const [dateRange, setDateRange] = useState(null);
    const [appliedFilters, setAppliedFilters] = useState({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Form modal state
    const [formOpen, setFormOpen] = useState(false);
    const [editEventId, setEditEventId] = useState(null);

    const handleApplyFilters = () => {
        const filters = {};
        if (searchString) filters.searchString = searchString;
        if (activeYn) filters.activeYn = activeYn;
        if (enableYn) filters.enableYn = enableYn;
        if (dateRange?.[0]) filters.beginDate = dateRange[0].format('YYYY-MM-DDTHH:mm:ss');
        if (dateRange?.[1]) filters.endDate = dateRange[1].format('YYYY-MM-DDTHH:mm:ss');
        setAppliedFilters(filters);
    };

    const handleClearFilters = () => {
        setSearchString('');
        setActiveYn(undefined);
        setEnableYn(undefined);
        setDateRange(null);
        setAppliedFilters({});
    };

    const hasActiveFilters = searchString || activeYn || enableYn || dateRange;

    const handleCreate = () => {
        setEditEventId(null);
        setFormOpen(true);
    };

    const handleEdit = (event) => {
        setEditEventId(event.saleEventId);
        setFormOpen(true);
    };

    const handleOpen = (event) => {
        setSelectedEventId(event.saleEventId);
        setSelectedEventMeta(event);
        setView('detail');
    };

    const handleFormSuccess = (savedEventId) => {
        setFormOpen(false);
        setRefreshTrigger(prev => prev + 1);
        if (savedEventId) {
            setSelectedEventId(savedEventId);
            setSelectedEventMeta(null); // detail view will fetch fresh data
            setView('detail');
        }
    };

    const handleBackToList = () => {
        setView('list');
        setSelectedEventId(null);
        setSelectedEventMeta(null);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEditFromDetail = (event) => {
        setEditEventId(event.saleEventId);
        setFormOpen(true);
    };

    const handleFormSuccessFromDetail = (savedEventId) => {
        setFormOpen(false);
        if (savedEventId) {
            setSelectedEventId(savedEventId);
        }
    };

    return (
        <div className="flex flex-col h-fit w-full p-5 gap-4 bg-gray-50 overflow-scroll">
            {view === 'list' && (
                <>
                    <div className="header-part flex flex-row justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Quản lý sự kiện khuyến mãi</h1>
                            <p className="text-gray-500">Tạo và quản lý các chương trình giảm giá, flash sale</p>
                        </div>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                            + Tạo sự kiện
                        </Button>
                    </div>

                    <div className="search-filter flex flex-col gap-3 p-5 bg-white border border-gray-200 rounded-xl">
                        <div className="flex flex-row gap-3 items-center flex-wrap">
                            <Input
                                placeholder="Tìm theo tên sự kiện..."
                                value={searchString}
                                onChange={(e) => setSearchString(e.target.value)}
                                onPressEnter={handleApplyFilters}
                                prefix={<SearchOutlined />}
                                style={{ width: 260 }}
                            />

                            <Select
                                placeholder="Trạng thái kích hoạt"
                                allowClear
                                value={activeYn}
                                onChange={setActiveYn}
                                style={{ width: 200 }}
                            >
                                <Option value="Y">Đang hoạt động</Option>
                                <Option value="N">Không hoạt động</Option>
                            </Select>

                            <Select
                                placeholder="Hiển thị cho khách"
                                allowClear
                                value={enableYn}
                                onChange={setEnableYn}
                                style={{ width: 200 }}
                            >
                                <Option value="Y">Đang hiển thị</Option>
                                <Option value="N">Đang ẩn</Option>
                            </Select>

                            <RangePicker
                                placeholder={['Từ ngày', 'Đến ngày']}
                                value={dateRange}
                                onChange={setDateRange}
                                format="DD/MM/YYYY"
                                style={{ width: 280 }}
                            />

                            <Space>
                                <Button type="primary" icon={<SearchOutlined />} onClick={handleApplyFilters}>
                                    Tìm kiếm
                                </Button>
                                {hasActiveFilters && (
                                    <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                                        Xóa bộ lọc
                                    </Button>
                                )}
                            </Space>
                        </div>
                    </div>

                    <div className="data-table bg-white p-5 rounded-xl border border-gray-200">
                        <SaleEventTable
                            filters={appliedFilters}
                            refreshTrigger={refreshTrigger}
                            onEdit={handleEdit}
                            onOpen={handleOpen}
                        />
                    </div>

                    <SaleEventFormModal
                        open={formOpen}
                        eventId={editEventId}
                        onClose={() => setFormOpen(false)}
                        onSuccess={handleFormSuccess}
                    />
                </>
            )}

            {view === 'detail' && selectedEventId && (
                <>
                    <div className="header-part">
                        <h1 className="text-2xl font-bold mb-1">Quản lý sự kiện khuyến mãi</h1>
                        <p className="text-gray-500">Chi tiết và quản lý sản phẩm trong sự kiện</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                        <SaleEventDetailView
                            eventId={selectedEventId}
                            eventMeta={selectedEventMeta}
                            onBack={handleBackToList}
                            onEditEvent={handleEditFromDetail}
                        />
                    </div>

                    <SaleEventFormModal
                        open={formOpen}
                        eventId={editEventId}
                        onClose={() => setFormOpen(false)}
                        onSuccess={handleFormSuccessFromDetail}
                    />
                </>
            )}
        </div>
    );
};

export default ManageSaleEvent;
