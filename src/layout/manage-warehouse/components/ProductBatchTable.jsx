// src/components/warehouse/ProductBatchTable.jsx
import { useState, useEffect } from 'react';
import { Table, Tag, message, Space } from 'antd';
import ProductBatchDetailModal from './ProductBatchDetailModal';
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

function ProductBatchTable({ refreshTrigger }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedBatchId, setSelectedBatchId] = useState(null);

    useEffect(() => {
        fetchData();
    }, [pagination.current, pagination.pageSize, refreshTrigger]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:9200/api/product-batch', {
                params: {
                    page: pagination.current - 1,
                    size: pagination.pageSize,
                },
            });

            if (response.data.type === 'GOOD') {
                const batches = response.data.detail;
                setData(Array.isArray(batches) ? batches : []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.totalElements || batches.length,
                }));
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu product batch');
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (record) => {
        setSelectedBatchId(record.batchId);
        setDetailModalOpen(true);
    };

    const handleEdit = (record) => {
        message.info('Chức năng chỉnh sửa đang được phát triển');
    };

    const handleDelete = (record) => {
        message.info('Chức năng xóa đang được phát triển');
    };

    // 80
    // 120
    // 100
    // 120
    // 180
    // 180

    const columns = [
        {
            title: 'ID',
            dataIndex: 'batchId',
            key: 'batchId',
            width: '10%',
            sorter: (a, b) => a.batchId - b.batchId,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: '10%',
            render: (quantity, record) => (
                <span>
                    {quantity} {UNIT_LABELS[record.unit] || record.unit}
                </span>
            ),
        },
        {
            title: 'Đơn vị',
            dataIndex: 'unit',
            key: 'unit',
            width: '10%',
            render: (unit) => (
                <Tag color="blue">{UNIT_LABELS[unit] || unit}</Tag>
            ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            ellipsis: true,
            render: (note) => note || <span style={{ color: '#999' }}>Không có ghi chú</span>,
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'providerId',
            key: 'providerId',
            width: '10%',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '15%',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            width: '10%',
            render: (_, record) => (
                <Space size="small">
                    <ViewButton onClick={() => handleView(record)} />
                    <EditButton onClick={() => handleEdit(record)} />
                    <DeleteButton onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];

    const handleTableChange = (newPagination) => {
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
                rowKey="batchId"
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} batch`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 1200 }}
            />

            <ProductBatchDetailModal
                batchId={selectedBatchId}
                open={detailModalOpen}
                onClose={() => {
                    setDetailModalOpen(false);
                    setSelectedBatchId(null);
                }}
            />
        </>
    );
}

export default ProductBatchTable;