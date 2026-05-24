import { useState } from 'react';
import { Button, Select, Input, Space } from 'antd';
import { PlusOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import CouponTable from './components/CouponTable';
import CouponFormModal from './components/CouponFormModal';

const { Option } = Select;

const ManageCoupon = () => {
    const [searchString, setSearchString] = useState('');
    const [discountTypeFilter, setDiscountTypeFilter] = useState(undefined);
    const [publicYnFilter, setPublicYnFilter] = useState(undefined);
    const [isActiveFilter, setIsActiveFilter] = useState(undefined);
    const [appliedFilters, setAppliedFilters] = useState({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [editCouponId, setEditCouponId] = useState(null);

    const handleApplyFilters = () => {
        const filters = {};
        if (searchString)             filters.couponCode   = searchString;
        if (discountTypeFilter)       filters.discountType = discountTypeFilter;
        if (publicYnFilter)           filters.publicYn     = publicYnFilter;
        if (isActiveFilter != null)   filters.isActive     = isActiveFilter;
        setAppliedFilters(filters);
    };

    const handleClearFilters = () => {
        setSearchString('');
        setDiscountTypeFilter(undefined);
        setPublicYnFilter(undefined);
        setIsActiveFilter(undefined);
        setAppliedFilters({});
    };

    const hasActiveFilters = searchString || discountTypeFilter || publicYnFilter || isActiveFilter != null;

    const handleCreate = () => {
        setEditCouponId(null);
        setFormOpen(true);
    };

    const handleEdit = (coupon) => {
        setEditCouponId(coupon.couponId);
        setFormOpen(true);
    };

    const handleFormSuccess = () => {
        setFormOpen(false);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="flex flex-col h-fit w-full p-5 gap-4 bg-gray-50 overflow-scroll">
            <div className="header-part flex flex-row justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Quản lý mã giảm giá</h1>
                    <p className="text-gray-500">Tạo và quản lý các mã giảm giá cho đơn hàng</p>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    + Tạo mã giảm giá
                </Button>
            </div>

            <div className="search-filter flex flex-col gap-3 p-5 bg-white border border-gray-200 rounded-xl">
                <div className="flex flex-row gap-3 items-center flex-wrap">
                    <Input
                        placeholder="Tìm theo mã giảm giá..."
                        value={searchString}
                        onChange={(e) => setSearchString(e.target.value)}
                        onPressEnter={handleApplyFilters}
                        prefix={<SearchOutlined />}
                        style={{ width: 240 }}
                    />

                    <Select
                        placeholder="Loại giảm giá"
                        allowClear
                        value={discountTypeFilter}
                        onChange={setDiscountTypeFilter}
                        style={{ width: 180 }}
                    >
                        <Option value="PERCENTAGE">Phần trăm</Option>
                        <Option value="FIXED_AMOUNT">Số tiền cố định</Option>
                    </Select>

                    <Select
                        placeholder="Hiển thị"
                        allowClear
                        value={publicYnFilter}
                        onChange={setPublicYnFilter}
                        style={{ width: 150 }}
                    >
                        <Option value="Y">Công khai</Option>
                        <Option value="N">Riêng tư</Option>
                    </Select>

                    <Select
                        placeholder="Trạng thái"
                        allowClear
                        value={isActiveFilter}
                        onChange={setIsActiveFilter}
                        style={{ width: 170 }}
                    >
                        <Option value={true}>Đang hoạt động</Option>
                        <Option value={false}>Hết hiệu lực</Option>
                    </Select>

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
                <CouponTable
                    filters={appliedFilters}
                    refreshTrigger={refreshTrigger}
                    onEdit={handleEdit}
                />
            </div>

            <CouponFormModal
                open={formOpen}
                couponId={editCouponId}
                onClose={() => setFormOpen(false)}
                onSuccess={handleFormSuccess}
            />
        </div>
    );
};

export default ManageCoupon;
