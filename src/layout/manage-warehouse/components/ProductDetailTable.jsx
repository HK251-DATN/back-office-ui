// src/components/warehouse/ProductDetailTable.jsx
import { useState, useEffect } from 'react';
import { Table, Tag, message, Space } from 'antd';
import ProductDetailDetailModal from './ProductDetailDetailModal';
import dayjs from 'dayjs';
import ViewButton from '../../../components/ViewButton';
import EditButton from '../../../components/EditButton';
import DeleteButton from '../../../components/DeleteButton';
import axios from 'axios';

const UNIT_LABELS = {
    KILOGRAM: 'Kg',
    GRAM: 'g',
    LITER: 'L',
    MILLILITER: 'mL',
};

const STATUS_CONFIG = {
    STORED: { color: 'green', label: 'Đã lưu kho' },
    PROCESSING: { color: 'blue', label: 'Đang xử lý' },
    SOLD: { color: 'orange', label: 'Đã bán' },
    EXPIRED: { color: 'red', label: 'Hết hạn' },
};

function ProductDetailTable({ refreshTrigger }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedDetailId, setSelectedDetailId] = useState(null);

    useEffect(() => {
        fetchData();
    }, [pagination.current, pagination.pageSize, refreshTrigger]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:9200/api/product-detail?pageSize=9999', {
                params: {
                    page: pagination.current - 1,
                    size: pagination.pageSize,
                },
            });

            if (response.data.type === 'GOOD') {
                const details = response.data.detail;
                setData(Array.isArray(details) ? details : []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.totalElements || details.length,
                }));
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu product detail');
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (record) => {
        setSelectedDetailId(record.prodDetailId);
        setDetailModalOpen(true);
    };

    const handleEdit = (record) => {
        message.info('Chức năng chỉnh sửa đang được phát triển');
    };

    const handleDelete = (record) => {
        message.info('Chức năng xóa đang được phát triển');
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'prodDetailId',
            key: 'prodDetailId',
            width: 80,
            sorter: (a, b) => a.prodDetailId - b.prodDetailId,
        },
        {
            title: 'Batch ID',
            dataIndex: 'batchId',
            key: 'batchId',
            width: 100,
        },
        {
            title: 'Product Gen ID',
            dataIndex: 'prodGenId',
            key: 'prodGenId',
            width: 130,
        },
        {
            title: 'Số lượng',
            dataIndex: 'unitQuantity',
            key: 'unitQuantity',
            width: 120,
            render: (quantity, record) => (
                <span>
                    {quantity} {UNIT_LABELS[record.unit] || record.unit}
                </span>
            ),
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price) => (
                <span>{price?.toLocaleString('vi-VN')} ₫</span>
            ),
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Đánh giá',
            dataIndex: 'numOfStar',
            key: 'numOfStar',
            width: 100,
            render: (stars) => stars ? `${stars} ⭐` : '-',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const config = STATUS_CONFIG[status] || { color: 'default', label: status };
                return <Tag color={config.color}>{config.label}</Tag>;
            },
            filters: Object.keys(STATUS_CONFIG).map(key => ({
                text: STATUS_CONFIG[key].label,
                value: key,
            })),
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            width: 180,
            render: (_, record) => (
                <Space size="small">
                    <ViewButton onClick={() => handleView(record)} />
                    <EditButton onClick={() => handleEdit(record)} />
                    <DeleteButton onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];

    const handleTableChange = (newPagination, filters) => {
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        });
    };

    return (
        <>
            <Table
                className='border border-gray-200 rounded-2xl'
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} sản phẩm`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 1400 }}
            />

            <ProductDetailDetailModal
                detailId={selectedDetailId}
                open={detailModalOpen}
                onClose={() => {
                    setDetailModalOpen(false);
                    setSelectedDetailId(null);
                }}
            />
        </>
    );
}

export default ProductDetailTable;