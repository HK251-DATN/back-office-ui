import { Divider, message, Select, DatePicker, Button } from "antd";
import { useState, useMemo, useEffect } from "react";
import { FilterOutlined, ClearOutlined } from "@ant-design/icons";
import SearchBox from "../../components/search-box/SearchBox";
import SummaryCard from "../../components/summary-card/SummaryCard";
import PackagingTaskTable from "./components/PackagingTaskTable";
import PackagingTaskDetailModal from "./components/PackagingTaskDetailModal";
import StartPackagingModal from "./components/StartPackagingModal";
import QualityCheckModal from "./components/QualityCheckModal";
import PackagingEmployeeList from "./components/PackagingEmployeeList";

const { Option } = Select;

const ManagePackaging = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(undefined);
    const [priorityFilter, setPriorityFilter] = useState(undefined);
    const [deadlineFilter, setDeadlineFilter] = useState(null);

    // Modal states
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [startModalOpen, setStartModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [qualityCheckModalOpen, setQualityCheckModalOpen] = useState(false);
    const [selectedQualityCheckTask, setSelectedQualityCheckTask] = useState(null);
    const [employeeDetailModalOpen, setEmployeeDetailModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Debounce search input (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Build filters object
    const filters = useMemo(() => {
        const filterObj = {};

        if (debouncedSearch) {
            filterObj.searchTerm = debouncedSearch;
        }
        if (statusFilter) {
            filterObj.status = statusFilter;
        }
        if (priorityFilter) {
            filterObj.priority = priorityFilter;
        }
        if (deadlineFilter) {
            filterObj.deadlineBefore = deadlineFilter.toISOString();
        }

        return filterObj;
    }, [debouncedSearch, statusFilter, priorityFilter, deadlineFilter]);

    const handleTaskDetail = (task) => {
        setSelectedTaskId(task.taskId);
        setDetailModalOpen(true);
    };

    const handleStartTask = (task) => {
        setSelectedTask(task);
        setStartModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedTaskId(null);
    };

    const handleCloseStartModal = () => {
        setStartModalOpen(false);
        setSelectedTask(null);
    };

    const handleStartSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleQualityCheck = (task) => {
        setSelectedQualityCheckTask(task);
        setQualityCheckModalOpen(true);
    };

    const handleCloseQualityCheckModal = () => {
        setQualityCheckModalOpen(false);
        setSelectedQualityCheckTask(null);
    };

    const handleQualityCheckSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        setEmployeeDetailModalOpen(true);
        // TODO: Open EmployeeDetailModal (Day 9)
        message.info(`Xem chi tiết nhân viên: ${employee.name}`);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setDebouncedSearch('');
        setStatusFilter(undefined);
        setPriorityFilter(undefined);
        setDeadlineFilter(null);
        message.success('Đã xóa bộ lọc');
    };

    const hasActiveFilters = searchTerm || statusFilter || priorityFilter || deadlineFilter;

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

            <div className="search-filter flex flex-col gap-4 p-5 bg-white border-gray-200 border rounded-xl">
                <div className="flex flex-row justify-between items-center gap-3">
                    <div className='search flex-1'>
                        <SearchBox
                            value={searchTerm}
                            onChange={setSearchTerm}
                        />
                    </div>

                    {hasActiveFilters && (
                        <Button
                            icon={<ClearOutlined />}
                            onClick={handleClearFilters}
                        >
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>

                <div className='filters flex flex-row gap-3 items-center'>
                    <FilterOutlined style={{ fontSize: 16, color: '#666' }} />

                    <Select
                        placeholder="Trạng thái"
                        style={{ width: 200 }}
                        allowClear
                        value={statusFilter}
                        onChange={setStatusFilter}
                    >
                        <Option value="WAITING">Chờ đóng gói</Option>
                        <Option value="PACKAGING">Đang đóng gói</Option>
                        <Option value="QUALITY_CHECK">Kiểm tra chất lượng</Option>
                        <Option value="READY_FOR_DELIVERY">Sẵn sàng giao</Option>
                    </Select>

                    <Select
                        placeholder="Độ ưu tiên"
                        style={{ width: 180 }}
                        allowClear
                        value={priorityFilter}
                        onChange={setPriorityFilter}
                    >
                        <Option value="HIGH">Cao</Option>
                        <Option value="MEDIUM">Trung bình</Option>
                        <Option value="LOW">Thấp</Option>
                    </Select>

                    <DatePicker
                        placeholder="Deadline trước ngày"
                        style={{ width: 220 }}
                        format="DD/MM/YYYY"
                        value={deadlineFilter}
                        onChange={setDeadlineFilter}
                    />
                </div>
            </div>

            <div className="flex flex-row justify-between w-full gap-3">
                <div className="p-5 bg-white rounded-xl flex flex-col w-full gap-5">
                    {/* Hàng đợi đóng gói */}
                    <p className="text-xl font-bold">Hàng đợi đóng gói</p>
                    {/* --------------------- */}
                    <Divider style={{ "margin": 0 }}></Divider>
                    {/* Dynamic task table */}
                    <PackagingTaskTable
                        refreshTrigger={refreshTrigger}
                        filters={filters}
                        onTaskDetail={handleTaskDetail}
                        onStartTask={handleStartTask}
                        onQualityCheck={handleQualityCheck}
                    />
                </div>

                <div className="flex flex-col gap-5 w-fit shrink-0">
                    {/* Nhân viên đóng gói */}
                    <div className="flex flex-col gap-5 w-full h-fit bg-white p-5 rounded-xl shrink-0" style={{ minWidth: '20rem' }}>
                        <p className="text-xl font-bold">Nhân viên đóng gói</p>
                        <Divider style={{ "margin": 0 }}></Divider>
                        <PackagingEmployeeList
                            onEmployeeClick={handleEmployeeClick}
                            refreshTrigger={refreshTrigger}
                        />
                    </div>

                    {/* Hướng dẫn đóng gói */}
                    <div className="flex w-full h-fit bg-white p-5">
                        <p>Hướng dẫn đóng gói</p>
                    </div>
                </div>
            </div>

            {/* Task Detail Modal */}
            <PackagingTaskDetailModal
                taskId={selectedTaskId}
                open={detailModalOpen}
                onClose={handleCloseDetailModal}
            />

            {/* Start Packaging Modal */}
            <StartPackagingModal
                task={selectedTask}
                open={startModalOpen}
                onClose={handleCloseStartModal}
                onSuccess={handleStartSuccess}
            />

            {/* Quality Check Modal */}
            <QualityCheckModal
                task={selectedQualityCheckTask}
                open={qualityCheckModalOpen}
                onClose={handleCloseQualityCheckModal}
                onSuccess={handleQualityCheckSuccess}
            />
        </div>
    )
}

export default ManagePackaging;