// src/pages/ManageWarehouse.jsx
import { useState } from 'react';
import { Divider, Button, Tabs, Select, Space } from 'antd';
import { PlusOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import ProductBatchTable from './components/ProductBatchTable';
import ProductDetailTable from './components/ProductDetailTable';
import ProductBatchCreateModal from './components/ProductBatchCreateModal';
import ProductDetailCreateModal from './components/ProductDetailCreateModal';
import WarehouseTable from './components/WarehouseTable';
import WarehouseFormModal from './components/WarehouseFormModal';
import StorageToolTable from './components/StorageToolTable';
import StorageToolCreateModal from './components/StorageToolCreateModal';
import RackDetailModal from './components/RackDetailModal';
import FridgeDetailModal from './components/FridgeDetailModal';

const { Option } = Select;

const ManageWarehouse = () => {
    const [activeTab, setActiveTab] = useState('products');

    // Product Batch & Detail states
    const [batchCreateModalOpen, setBatchCreateModalOpen] = useState(false);
    const [detailCreateModalOpen, setDetailCreateModalOpen] = useState(false);
    const [refreshBatchTrigger, setRefreshBatchTrigger] = useState(0);
    const [refreshDetailTrigger, setRefreshDetailTrigger] = useState(0);

    // Batch filter states
    const [processStatusInput, setProcessStatusInput] = useState(undefined);
    const [verificationTypeInput, setVerificationTypeInput] = useState(undefined);
    const [batchFilters, setBatchFilters] = useState({});

    const handleApplyBatchFilters = () => {
        const f = {};
        if (processStatusInput)    f.processStatus    = processStatusInput;
        if (verificationTypeInput) f.verificationType = verificationTypeInput;
        setBatchFilters(f);
    };

    const handleClearBatchFilters = () => {
        setProcessStatusInput(undefined);
        setVerificationTypeInput(undefined);
        setBatchFilters({});
    };

    const hasBatchFilters = processStatusInput || verificationTypeInput;

    // Warehouse states
    const [warehouseFormOpen, setWarehouseFormOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [refreshWarehouseTrigger, setRefreshWarehouseTrigger] = useState(0);

    // Storage Tool states
    const [storageToolCreateOpen, setStorageToolCreateOpen] = useState(false);
    const [refreshStorageToolTrigger, setRefreshStorageToolTrigger] = useState(0);
    const [selectedStorageTool, setSelectedStorageTool] = useState(null);
    const [rackDetailOpen, setRackDetailOpen] = useState(false);
    const [fridgeDetailOpen, setFridgeDetailOpen] = useState(false);

    const handleBatchCreateSuccess = () => {
        setRefreshBatchTrigger(prev => prev + 1);
    };

    const handleDetailCreateSuccess = () => {
        setRefreshDetailTrigger(prev => prev + 1);
        setRefreshBatchTrigger(prev => prev + 1);
    };

    const handleWarehouseSuccess = () => {
        setRefreshWarehouseTrigger(prev => prev + 1);
    };

    const handleStorageToolSuccess = () => {
        setRefreshStorageToolTrigger(prev => prev + 1);
    };

    const handleWarehouseEdit = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setWarehouseFormOpen(true);
    };

    const handleWarehouseCreate = () => {
        setSelectedWarehouse(null);
        setWarehouseFormOpen(true);
    };

    const handleStorageToolView = (storageTool) => {
        setSelectedStorageTool(storageTool);
        if (storageTool.toolType === 'RACK') {
            setRackDetailOpen(true);
        } else if (storageTool.toolType === 'FRIDGE') {
            setFridgeDetailOpen(true);
        }
    };

    const tabItems = [
        {
            key: 'products',
            label: 'Sản phẩm & Batch',
            children: (
                <div>
                    {/* Product Batch Section */}
                    <div className="header-part flex flex-row justify-between items-center mb-4">
                        <h2 className='text-xl font-bold'>Quản lý Product Batch</h2>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setBatchCreateModalOpen(true)}
                        >
                            Tạo Product Batch
                        </Button>
                    </div>

                    <div className="search-filter flex flex-row gap-3 items-center flex-wrap p-5 bg-white border-gray-200 border rounded-xl mb-4">
                        <Select
                            placeholder="Trạng thái"
                            allowClear
                            value={processStatusInput}
                            onChange={setProcessStatusInput}
                            style={{ width: 160 }}
                        >
                            <Option value="WAIT_FOR_DELIVERY">Chờ giao</Option>
                            <Option value="PENDING">Chờ xử lý</Option>
                            <Option value="PROCESSED">Đã xử lý</Option>
                            <Option value="EXPIRED">Hết hạn</Option>
                            <Option value="REJECTED">Từ chối</Option>
                        </Select>

                        <Select
                            placeholder="Loại xác minh"
                            allowClear
                            value={verificationTypeInput}
                            onChange={setVerificationTypeInput}
                            style={{ width: 160 }}
                        >
                            <Option value="CERTIFICATE">Chứng nhận</Option>
                            <Option value="VIDEO">Video</Option>
                        </Select>

                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} onClick={handleApplyBatchFilters}>
                                Tìm kiếm
                            </Button>
                            {hasBatchFilters && (
                                <Button icon={<ClearOutlined />} onClick={handleClearBatchFilters}>
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </Space>
                    </div>

                    <div className="data-table mb-6">
                        <ProductBatchTable filters={batchFilters} refreshTrigger={refreshBatchTrigger} />
                    </div>

                    <Divider />

                    {/* Product Detail Section */}
                    <div className="header-part flex flex-row justify-between items-center mb-4">
                        <h2 className='text-xl font-bold'>Quản lý Product Detail</h2>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setDetailCreateModalOpen(true)}
                        >
                            Xử lý Product Batch
                        </Button>
                    </div>

                    <div className="search-filter flex flex-row gap-3 items-center p-5 bg-white border-gray-200 border rounded-xl mb-4">
                        <span className="text-gray-400 text-sm">Bộ lọc product detail sẽ được cập nhật sau</span>
                    </div>

                    <div className="data-table">
                        <ProductDetailTable refreshTrigger={refreshDetailTrigger} />
                    </div>
                </div>
            ),
        },
        {
            key: 'warehouses',
            label: 'Kho',
            children: (
                <div>
                    <div className="header-part flex flex-row justify-between items-center mb-4">
                        <div>
                            <h2 className='text-xl font-bold'>Quản lý kho</h2>
                            <p className="text-sm text-gray-600">Danh sách các kho và thông tin tổng quan</p>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleWarehouseCreate}
                        >
                            Tạo kho mới
                        </Button>
                    </div>

                    <div className="data-table">
                        <WarehouseTable
                            refreshTrigger={refreshWarehouseTrigger}
                            onEdit={handleWarehouseEdit}
                            onViewDetails={() => {
                                // Switch to storage tools tab to view tools in warehouses
                                setActiveTab('storage-tools');
                            }}
                        />
                    </div>
                </div>
            ),
        },
        {
            key: 'storage-tools',
            label: 'Công cụ lưu trữ',
            children: (
                <div>
                    <div className="header-part flex flex-row justify-between items-center mb-4">
                        <div>
                            <h2 className='text-xl font-bold'>Quản lý công cụ lưu trữ</h2>
                            <p className="text-sm text-gray-600">Kệ và tủ lạnh trong các kho</p>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setStorageToolCreateOpen(true)}
                        >
                            Thêm công cụ lưu trữ
                        </Button>
                    </div>

                    <div className="data-table">
                        <StorageToolTable
                            refreshTrigger={refreshStorageToolTrigger}
                            onViewDetails={handleStorageToolView}
                        />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col h-fit w-full p-5 gap-3 bg-gray-50 overflow-scroll">
            <div className="header-part flex flex-col">
                <h1 className='text-2xl font-bold mb-2'>Quản lý kho</h1>
                <p>Giám sát tồn kho và điều kiện bảo quản thực phẩm tươi</p>
            </div>

            <Divider style={{ margin: "0" }} />

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                destroyInactiveTabPane
            />

            {/* Modals */}
            <ProductBatchCreateModal
                open={batchCreateModalOpen}
                onClose={() => setBatchCreateModalOpen(false)}
                onSuccess={handleBatchCreateSuccess}
            />

            <ProductDetailCreateModal
                open={detailCreateModalOpen}
                onClose={() => setDetailCreateModalOpen(false)}
                onSuccess={handleDetailCreateSuccess}
            />

            <WarehouseFormModal
                open={warehouseFormOpen}
                onClose={() => {
                    setWarehouseFormOpen(false);
                    setSelectedWarehouse(null);
                }}
                onSuccess={handleWarehouseSuccess}
                warehouse={selectedWarehouse}
            />

            <StorageToolCreateModal
                open={storageToolCreateOpen}
                onClose={() => setStorageToolCreateOpen(false)}
                onSuccess={handleStorageToolSuccess}
            />

            <RackDetailModal
                open={rackDetailOpen}
                onClose={() => {
                    setRackDetailOpen(false);
                    setSelectedStorageTool(null);
                }}
                storageToolId={selectedStorageTool?.storageToolId}
            />

            <FridgeDetailModal
                open={fridgeDetailOpen}
                onClose={() => {
                    setFridgeDetailOpen(false);
                    setSelectedStorageTool(null);
                }}
                storageToolId={selectedStorageTool?.storageToolId}
            />
        </div>
    );
};

export default ManageWarehouse;