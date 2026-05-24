import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Space, Button, Popconfirm, message, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAdminCoupons, deleteCoupon } from '../../../services/couponService';

function CouponTable({ filters, refreshTrigger, onEdit }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [sortBy, setSortBy] = useState(undefined);
    const [sortDir, setSortDir] = useState(undefined);

    const fetchData = useCallback(async (page = 1, pageSize = 20, currentSortBy, currentSortDir) => {
        setLoading(true);
        try {
            const response = await getAdminCoupons({
                ...filters,
                page,
                size: pageSize,
                sortBy: currentSortBy,
                sortDir: currentSortDir,
            });
            const type = response.data?.type;
            if (type === 'GOOD') {
                const detail = response.data.detail;
                const list = Array.isArray(detail) ? detail : (detail?.content ?? []);
                const total = detail?.totalElements ?? list.length;
                setData(list);
                setPagination(prev => ({ ...prev, current: page, pageSize, total }));
            } else if (type === 'SKIP_AS_GOOD') {
                setData([]);
                setPagination(prev => ({ ...prev, current: 1, total: 0 }));
            } else {
                message.error(response.data?.message || 'Không thể tải dữ liệu mã giảm giá');
                setData([]);
            }
        } catch {
            message.error('Không thể tải dữ liệu mã giảm giá');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        setSortBy(undefined);
        setSortDir(undefined);
        fetchData(1, pagination.pageSize, undefined, undefined);
    }, [filters, refreshTrigger]);

    const handleTableChange = (newPagination, _tableFilters, sorter) => {
        const newSortBy = sorter?.field && sorter?.order ? sorter.field : undefined;
        const newSortDir = sorter?.order === 'ascend' ? 'ASC' : sorter?.order === 'descend' ? 'DESC' : undefined;
        setSortBy(newSortBy);
        setSortDir(newSortDir);
        fetchData(newPagination.current, newPagination.pageSize, newSortBy, newSortDir);
    };

    const handleDelete = async (record) => {
        try {
            await deleteCoupon(record.couponId);
            message.success('Đã xóa mã giảm giá');
            fetchData(pagination.current, pagination.pageSize, sortBy, sortDir);
        } catch {
            message.error('Xóa mã giảm giá thất bại');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'couponId',
            key: 'couponId',
            width: 70,
        },
        {
            title: 'Mã giảm giá',
            dataIndex: 'couponCode',
            key: 'couponCode',
            render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
        },
        {
            title: 'Loại giảm giá',
            dataIndex: 'discountType',
            key: 'discountType',
            width: 160,
            render: (val) =>
                val === 'PERCENTAGE' ? (
                    <Tag color="blue">Phần trăm</Tag>
                ) : (
                    <Tag color="green">Số tiền cố định</Tag>
                ),
        },
        {
            title: 'Giá trị giảm',
            dataIndex: 'discountValue',
            key: 'discountValue',
            width: 130,
            sorter: true,
            sortDirections: ['ascend', 'descend'],
            render: (val, record) =>
                record.discountType === 'PERCENTAGE'
                    ? `${val}%`
                    : `${val?.toLocaleString('vi-VN')} ₫`,
        },
        {
            title: 'Giảm tối đa',
            dataIndex: 'maxDiscountAmount',
            key: 'maxDiscountAmount',
            width: 140,
            render: (val) => (val != null ? `${val.toLocaleString('vi-VN')} ₫` : '—'),
        },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'minOrderValue',
            key: 'minOrderValue',
            width: 140,
            render: (val) => (val != null ? `${val.toLocaleString('vi-VN')} ₫` : '—'),
        },
        {
            title: 'Số lượng còn',
            key: 'quantity',
            width: 130,
            render: (_, record) => `${record.currentQuantity} / ${record.totalQuantity}`,
        },
        {
            title: 'Hiển thị',
            dataIndex: 'publicYn',
            key: 'publicYn',
            width: 110,
            render: (val) =>
                val === 'Y' ? <Tag color="blue">Công khai</Tag> : <Tag color="default">Riêng tư</Tag>,
        },
        {
            title: 'Trạng thái',
            key: 'isActive',
            width: 120,
            render: (_, record) => {
                const expired = record.expiredAt && dayjs(record.expiredAt).isBefore(dayjs());
                const exhausted = record.currentQuantity <= 0;
                return expired || exhausted
                    ? <Tag color="red">Hết hiệu lực</Tag>
                    : <Tag color="green">Đang hoạt động</Tag>;
            },
        },
        {
            title: 'Hết hạn',
            dataIndex: 'expiredAt',
            key: 'expiredAt',
            width: 160,
            sorter: true,
            sortDirections: ['ascend', 'descend'],
            render: (val) => (val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—'),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 160,
            sorter: true,
            sortDirections: ['ascend', 'descend'],
            render: (val) => (val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa mã giảm giá này? Hành động không thể hoàn tác."
                        onConfirm={() => handleDelete(record)}
                        okText="Xóa"
                        cancelText="Không"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button size="small" icon={<DeleteOutlined />} danger />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="couponId"
            loading={loading}
            pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} mã giảm giá`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1300 }}
            locale={{ emptyText: 'Không có mã giảm giá nào' }}
        />
    );
}

export default CouponTable;
