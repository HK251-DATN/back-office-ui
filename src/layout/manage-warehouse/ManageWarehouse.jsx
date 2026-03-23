// src/pages/ManageWarehouse.jsx
import { useState } from 'react';
import { Divider, Button } from 'antd';

import { PlusOutlined } from '@ant-design/icons';
import ProductBatchTable from './components/ProductBatchTable';
import ProductDetailTable from './components/ProductDetailTable';
import ProductBatchCreateModal from './components/ProductBatchCreateModal';
import ProductDetailCreateModal from './components/ProductDetailCreateModal';
import SearchBox from '../../components/search-box/SearchBox';

const ManageWarehouse = () => {
    const [batchCreateModalOpen, setBatchCreateModalOpen] = useState(false);
    const [detailCreateModalOpen, setDetailCreateModalOpen] = useState(false);
    const [refreshBatchTrigger, setRefreshBatchTrigger] = useState(0);
    const [refreshDetailTrigger, setRefreshDetailTrigger] = useState(0);

    const handleBatchCreateSuccess = () => {
        setRefreshBatchTrigger(prev => prev + 1);
    };

    const handleDetailCreateSuccess = () => {
        setRefreshDetailTrigger(prev => prev + 1);
    };

    return (
        <div className="flex flex-col h-fit w-full p-5 gap-3 bg-gray-50 overflow-scroll">
            <div className="header-part flex flex-col">
                <h1 className='text-2xl font-bold mb-2'>Quản lý kho</h1>
                <p>Giám sát tồn kho và điều kiện bảo quản thực phẩm tươi</p>
            </div>

            <Divider style={{ margin: "0" }} />

            {/* Product Batch Section */}
            <div className="header-part flex flex-row justify-between items-center">
                <h2 className='text-xl font-bold mb-2'>Quản lý Product Batch</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setBatchCreateModalOpen(true)}
                >
                    Tạo Product Batch
                </Button>
            </div>

            <div className="search-filter flex flex-row justify-between items-center p-5 bg-white border-gray-200 border rounded-xl">
                <div className='search w-4/5'>
                    <SearchBox placeholder="Tìm kiếm product batch..." />
                </div>
                <div className='filter'>
                    <Button>Filter</Button>
                </div>
            </div>

            <div className="data-table">
                <ProductBatchTable refreshTrigger={refreshBatchTrigger} />
            </div>

            <Divider style={{ margin: "0" }} />

            {/* Product Detail Section */}
            <div className="header-part flex flex-row justify-between items-center">
                <h2 className='text-xl font-bold mb-2'>Quản lý Product Detail</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setDetailCreateModalOpen(true)}
                >
                    Xử lý Product Batch
                </Button>
            </div>

            <div className="search-filter flex flex-row justify-between items-center p-5 bg-white border-gray-200 border rounded-xl">
                <div className='search w-4/5'>
                    <SearchBox placeholder="Tìm kiếm product detail..." />
                </div>
                <div className='filter'>
                    <Button>Filter</Button>
                </div>
            </div>

            <div className="data-table">
                <ProductDetailTable refreshTrigger={refreshDetailTrigger} />
            </div>

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
        </div>
    );
};

export default ManageWarehouse;