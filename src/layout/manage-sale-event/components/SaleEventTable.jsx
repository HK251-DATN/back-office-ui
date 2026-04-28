import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Space, Button, Popconfirm, message, Tooltip } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    StopOutlined,
    FolderOpenOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    searchSaleEvents,
    deleteSaleEvent,
    enableSaleEvent,
    cancelSaleEvent,
} from '../../../services/saleEventService';

function SaleEventTable({ filters, refreshTrigger, onEdit, onOpen }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

    // Always use searchSaleEvents — it returns activeYn/enabledYn which the list endpoint omits.
    const fetchData = useCallback(async (page = pagination.current, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await searchSaleEvents({ ...filters, searchString: filters.searchString || '', page, size: pageSize });

            const type = response.data?.type;
            if (type === 'GOOD') {
                const detail = response.data.detail;
                setData(Array.isArray(detail) ? detail : []);
            } else if (type === 'SKIP_AS_GOOD') {
                setData([]);
            } else {
                message.error(response.data?.message || 'Không thể tải dữ liệu sự kiện');
                setData([]);
            }
        } catch {
            message.error('Không thể tải dữ liệu sự kiện');
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.current, pagination.pageSize]);

    useEffect(() => {
        fetchData(1, pagination.pageSize);
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [filters, refreshTrigger]);

    const handleTableChange = (newPagination) => {
        setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));
        fetchData(newPagination.current, newPagination.pageSize);
    };

    const handleDelete = async (record) => {
        try {
            await deleteSaleEvent(record.saleEventId);
            message.success('Đã xóa sự kiện');
            fetchData();
        } catch {
            message.error('Xóa sự kiện thất bại');
        }
    };

    const patchRow = (updated) => {
        setData(prev =>
            prev.map(item => item.saleEventId === updated.saleEventId ? { ...item, ...updated } : item)
        );
    };

    const handleEnable = async (record) => {
        try {
            const response = await enableSaleEvent(record.saleEventId);
            if (response.data?.type === 'GOOD') {
                message.success('Đã kích hoạt sự kiện');
                patchRow(response.data.detail);
            } else {
                message.error(response.data?.message || 'Kích hoạt thất bại');
            }
        } catch {
            message.error('Kích hoạt sự kiện thất bại');
        }
    };

    const handleCancel = async (record) => {
        try {
            const response = await cancelSaleEvent(record.saleEventId);
            if (response.data?.type === 'GOOD') {
                message.success('Đã hủy sự kiện');
                patchRow(response.data.detail);
            } else {
                message.error(response.data?.message || 'Hủy thất bại');
            }
        } catch {
            message.error('Hủy sự kiện thất bại');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'saleEventId',
            key: 'saleEventId',
            width: 70,
        },
        {
            title: 'Tên sự kiện',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{name}</div>
                    {record.img && (
                        <img
                            src={record.img}
                            alt="banner"
                            style={{ width: 60, height: 36, objectFit: 'cover', borderRadius: 4, marginTop: 4 }}
                        />
                    )}
                </div>
            ),
        },
        {
            title: 'Kích hoạt',
            dataIndex: 'activeYn',
            key: 'activeYn',
            width: 110,
            render: (val) =>
                val === 'Y' ? (
                    <Tag color="success">Đang hoạt động</Tag>
                ) : (
                    <Tag color="default">Không hoạt động</Tag>
                ),
        },
        {
            title: 'Hiển thị',
            dataIndex: 'enabledYn',
            key: 'enabledYn',
            width: 100,
            render: (val) =>
                val === 'Y' ? <Tag color="blue">Hiển thị</Tag> : <Tag color="default">Ẩn</Tag>,
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'beginDate',
            key: 'beginDate',
            width: 160,
            render: (val) => (val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—'),
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 160,
            render: (val) => (val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—'),
        },
        {
            title: 'Ưu tiên',
            dataIndex: 'displayPriority',
            key: 'displayPriority',
            width: 80,
            align: 'center',
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 220,
            render: (_, record) => (
                <Space size="small" wrap>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>

                    {record.activeYn !== 'Y' ? (
                        <Popconfirm
                            title="Kích hoạt sự kiện này?"
                            onConfirm={() => handleEnable(record)}
                            okText="Kích hoạt"
                            cancelText="Hủy"
                        >
                            <Tooltip title="Kích hoạt">
                                <Button size="small" icon={<CheckCircleOutlined />} type="primary" />
                            </Tooltip>
                        </Popconfirm>
                    ) : (
                        <Popconfirm
                            title="Hủy sự kiện này?"
                            onConfirm={() => handleCancel(record)}
                            okText="Hủy sự kiện"
                            cancelText="Không"
                        >
                            <Tooltip title="Hủy sự kiện">
                                <Button size="small" icon={<StopOutlined />} danger />
                            </Tooltip>
                        </Popconfirm>
                    )}

                    <Popconfirm
                        title="Xóa sự kiện này? Hành động không thể hoàn tác."
                        onConfirm={() => handleDelete(record)}
                        okText="Xóa"
                        cancelText="Không"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button size="small" icon={<DeleteOutlined />} danger />
                        </Tooltip>
                    </Popconfirm>

                    <Tooltip title="Quản lý sự kiện">
                        <Button
                            size="small"
                            icon={<FolderOpenOutlined />}
                            onClick={() => onOpen(record)}
                        >
                            Mở
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="saleEventId"
            loading={loading}
            pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `Tổng ${total} sự kiện` }}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
            locale={{ emptyText: 'Không có sự kiện nào' }}
        />
    );
}

export default SaleEventTable;
