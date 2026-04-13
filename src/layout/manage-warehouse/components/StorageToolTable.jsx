// src/layout/manage-warehouse/components/StorageToolTable.jsx
import { Table, Button, Space, message, Tag, Progress, Select, Popconfirm } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';
import RackEditModal from './RackEditModal';
import FridgeEditModal from './FridgeEditModal';

const BASE_URL = API_URLS.STORAGE;

const STATUS_CONFIG = {
    ACTIVE: { color: 'green', label: 'Hoạt động' },
    INACTIVE: { color: 'gray', label: 'Không hoạt động' },
    FULL: { color: 'red', label: 'Đầy' },
    IN_MAINTAINANCE: { color: 'orange', label: 'Bảo trì' },
};

const TYPE_CONFIG = {
    RACK: { color: 'blue', label: 'Kệ', icon: '🗄️' },
    FRIDGE: { color: 'cyan', label: 'Tủ lạnh', icon: '❄️' },
};

function StorageToolTable({ refreshTrigger, warehouseId, onViewDetails }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterWarehouseId, setFilterWarehouseId] = useState('');
    const [warehouses, setWarehouses] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [rackEditOpen, setRackEditOpen] = useState(false);
    const [fridgeEditOpen, setFridgeEditOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);

    useEffect(() => {
        fetchStorageTools();
        fetchWarehouses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, refreshTrigger, warehouseId, filterWarehouseId]);

    const fetchWarehouses = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/warehouse`, {
                params: { pageNum: 1, pageSize: 100 },
            });
            if (response.data.type === 'GOOD') {
                setWarehouses(response.data.detail || []);
            }
        } catch (error) {
            console.error('Failed to fetch warehouses:', error);
        }
    };

    const fetchStorageTools = async () => {
        setLoading(true);
        try {
            const params = {
                pageNum: pagination.current,
                pageSize: 100, // Fetch more to allow client-side filtering
            };

            // Add warehouse filter if selected
            if (filterWarehouseId) {
                params['warehouse-id'] = filterWarehouseId;
            } else if (warehouseId) {
                // Use prop warehouseId if provided
                params['warehouse-id'] = warehouseId;
            }

            const response = await axios.get(`${BASE_URL}/api/storage-tool`, { params });

            if (response.data.type === 'GOOD') {
                const tools = response.data.detail || [];
                setData(tools);
            } else if (response.data.type === 'SKIP_AS_GOOD') {
                setData([]);
            } else {
                message.error(response.data.message || 'Không thể tải danh sách công cụ lưu trữ');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record) => {
        setSelectedTool(record);
        if (record.toolType === 'RACK') {
            setRackEditOpen(true);
        } else if (record.toolType === 'FRIDGE') {
            setFridgeEditOpen(true);
        }
    };

    const handleEditSuccess = () => {
        fetchStorageTools();
    };

    const handleDelete = async (record) => {
        try {
            const response = await axios.delete(`${BASE_URL}/api/storage-tool/${record.storageToolId}`);
            if (response.data.type === 'GOOD') {
                message.success('Xóa công cụ lưu trữ thành công!');
                fetchStorageTools();
            } else {
                message.error(response.data.message || 'Xóa thất bại!');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
        }
    };

    const handleTableChange = (newPagination) => {
        setPagination({
            current: newPagination.current,
            pageSize: newPagination.pageSize,
            total: newPagination.total,
        });
    };

    // Apply filters
    const filteredData = data.filter(item => {
        if (filterType !== 'ALL' && item.toolType !== filterType) return false;
        if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
        return true;
    });

    const columns = [
        {
            title: 'ID',
            dataIndex: 'storageToolId',
            key: 'storageToolId',
            width: '8%',
            sorter: (a, b) => a.storageToolId - b.storageToolId,
        },
        {
            title: 'Loại',
            dataIndex: 'toolType',
            key: 'toolType',
            width: '12%',
            render: (type) => {
                const config = TYPE_CONFIG[type] || {};
                return (
                    <Tag color={config.color}>
                        {config.icon} {config.label}
                    </Tag>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '14%',
            render: (status) => {
                const config = STATUS_CONFIG[status] || {};
                return <Tag color={config.color}>{config.label}</Tag>;
            },
        },
        {
            title: 'Tỷ lệ sử dụng',
            dataIndex: 'usagePercentage',
            key: 'usagePercentage',
            width: '15%',
            render: (usage) => (
                <Progress
                    percent={usage}
                    size="small"
                    status={usage >= 90 ? 'exception' : usage >= 70 ? 'normal' : 'success'}
                />
            ),
            sorter: (a, b) => a.usagePercentage - b.usagePercentage,
        },
        {
            title: 'Kho',
            dataIndex: 'warehouseId',
            key: 'warehouseId',
            width: '10%',
            render: (id) => `Kho #${id}`,
        },
        {
            title: 'Bảo trì lần cuối',
            dataIndex: 'lastMaintainanceDate',
            key: 'lastMaintainanceDate',
            width: '15%',
            render: (date) => date || '—',
        },
        {
            title: 'Hành động',
            key: 'action',
            width: '26%',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => onViewDetails?.(record)}
                    >
                        Chi tiết
                    </Button>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa công cụ lưu trữ?"
                        description="Bạn có chắc muốn xóa không?"
                        onConfirm={() => handleDelete(record)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger size="small" icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
                <Select
                    value={filterWarehouseId}
                    onChange={setFilterWarehouseId}
                    style={{ width: 200 }}
                    placeholder="Tất cả kho"
                    allowClear
                    options={[
                        ...warehouses.map(wh => ({
                            value: wh.warehouseId,
                            label: `Kho #${wh.warehouseId} - ${wh.address.substring(0, 30)}...`,
                        })),
                    ]}
                />
                <Select
                    value={filterType}
                    onChange={setFilterType}
                    style={{ width: 150 }}
                    options={[
                        { value: 'ALL', label: 'Tất cả loại' },
                        { value: 'RACK', label: '🗄️ Kệ' },
                        { value: 'FRIDGE', label: '❄️ Tủ lạnh' },
                    ]}
                />
                <Select
                    value={filterStatus}
                    onChange={setFilterStatus}
                    style={{ width: 180 }}
                    options={[
                        { value: 'ALL', label: 'Tất cả trạng thái' },
                        { value: 'ACTIVE', label: 'Hoạt động' },
                        { value: 'INACTIVE', label: 'Không hoạt động' },
                        { value: 'FULL', label: 'Đầy' },
                        { value: 'IN_MAINTAINANCE', label: 'Bảo trì' },
                    ]}
                />
            </div>

            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                rowKey="storageToolId"
                scroll={{ x: 1100 }}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredData.length,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} công cụ`,
                    pageSizeOptions: ['10', '20', '50'],
                }}
                onChange={handleTableChange}
                bordered
            />

            <RackEditModal
                open={rackEditOpen}
                onClose={() => {
                    setRackEditOpen(false);
                    setSelectedTool(null);
                }}
                onSuccess={handleEditSuccess}
                storageTool={selectedTool}
            />

            <FridgeEditModal
                open={fridgeEditOpen}
                onClose={() => {
                    setFridgeEditOpen(false);
                    setSelectedTool(null);
                }}
                onSuccess={handleEditSuccess}
                storageTool={selectedTool}
            />
        </div>
    );
}

export default StorageToolTable;
