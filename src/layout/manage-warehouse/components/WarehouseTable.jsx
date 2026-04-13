// src/layout/manage-warehouse/components/WarehouseTable.jsx
import { Table, Button, Space, message, Popconfirm, Progress, Tag } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';

const BASE_URL = API_URLS.STORAGE;

function WarehouseTable({ refreshTrigger, onViewDetails, onEdit }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    useEffect(() => {
        fetchWarehouses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, refreshTrigger]);

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/warehouse`, {
                params: {
                    pageNum: pagination.current,
                    pageSize: pagination.pageSize,
                },
            });

            if (response.data.type === 'GOOD') {
                setData(response.data.detail || []);
            } else if (response.data.type === 'SKIP_AS_GOOD') {
                setData([]);
            } else {
                message.error(response.data.message || 'Không thể tải danh sách kho');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách kho');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            const response = await axios.delete(`${BASE_URL}/api/warehouse/${record.warehouseId}`);
            if (response.data.type === 'GOOD') {
                message.success('Xóa kho thành công!');
                fetchWarehouses();
            } else {
                message.error(response.data.message || 'Xóa kho thất bại!');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa kho');
        }
    };

    const handleTableChange = (newPagination) => {
        setPagination({
            current: newPagination.current,
            pageSize: newPagination.pageSize,
            total: newPagination.total,
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'warehouseId',
            key: 'warehouseId',
            width: '8%',
            sorter: (a, b) => a.warehouseId - b.warehouseId,
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            width: '35%',
            ellipsis: true,
            render: (address) => (
                <span style={{ fontWeight: 500 }}>{address}</span>
            ),
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
            title: 'Số tủ lạnh',
            dataIndex: 'numOfFridge',
            key: 'numOfFridge',
            width: '10%',
            render: (num) => (
                <Tag color="blue">{num} tủ</Tag>
            ),
        },
        {
            title: 'Số kệ',
            dataIndex: 'numOfRack',
            key: 'numOfRack',
            width: '10%',
            render: (num) => (
                <Tag color="green">{num} kệ</Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: '22%',
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
                        onClick={() => onEdit?.(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa kho?"
                        description="Bạn có chắc muốn xóa kho này không?"
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
        <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey="warehouseId"
            scroll={{ x: 1000 }}
            pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} kho`,
                pageSizeOptions: ['10', '20', '50'],
            }}
            onChange={handleTableChange}
            bordered
        />
    );
}

export default WarehouseTable;
