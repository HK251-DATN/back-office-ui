// src/components/warehouse/ProductBatchTable.jsx
import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, message, Space, Modal } from 'antd';
import ProductBatchDetailModal from './ProductBatchDetailModal';
import ProductBatchEditModal from './ProductBatchEditModal';
import dayjs from 'dayjs';
import ViewButton from '../../../components/ViewButton';
import EditButton from '../../../components/EditButton';
import DeleteButton from '../../../components/DeleteButton';
import { getProductBatches, deleteProductBatch } from '../../../services/productBatchService';
import { getSubSubcategories } from '../../../services/categoryService';

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
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [subSubcategories, setSubSubcategories] = useState([]);

    const fetchSubSubcategories = useCallback(async () => {
        try {
            const response = await getSubSubcategories();
            if (response.data.type === 'GOOD') {
                setSubSubcategories(response.data.detail);
            }
        } catch (error) {
            console.error('Failed to fetch sub-subcategories:', error);
        }
    }, []);

    const getSubSubcategoryName = (id) => {
        const category = subSubcategories.find(cat => cat.subSubcategoryId === id);
        return category ? category.name : '';
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getProductBatches({
                pageNum: pagination.current,
                pageSize: pagination.pageSize,
            });

            if (response.data.type === 'GOOD') {
                const batches = response.data.detail;
                setData(Array.isArray(batches) ? batches : []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.totalElements || (Array.isArray(batches) ? batches.length : 0),
                }));
            } else if (response.data.type === 'SKIP_AS_GOOD') {
                setData([]);
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu product batch');
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize]);

    useEffect(() => {
        fetchData();
        fetchSubSubcategories();
    }, [fetchData, fetchSubSubcategories, refreshTrigger]);

    const handleView = (record) => {
        setSelectedBatchId(record.batchId);
        setDetailModalOpen(true);
    };

    const handleEdit = (record) => {
        setSelectedBatch(record);
        setEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        fetchData();
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Bạn có chắc chắn muốn xóa lô hàng này?',
            content: `ID Lô hàng: ${record.batchId}`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const response = await deleteProductBatch(record.batchId);
                    if (response.data.type === 'GOOD') {
                        message.success('Xóa lô hàng thành công');
                        fetchData();
                    } else {
                        message.error(response.data.message || 'Xóa lô hàng thất bại');
                    }
                } catch (error) {
                    message.error('Lỗi khi xóa lô hàng');
                    console.error('Delete error:', error);
                }
            },
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'batchId',
            key: 'batchId',
            width: '5%',
            sorter: (a, b) => a.batchId - b.batchId,
        },
        {
            title: 'Danh mục',
            dataIndex: 'subSubcategoryId',
            key: 'subSubcategoryId',
            width: '15%',
            ellipsis: true,
            render: (id) => {
                const name = getSubSubcategoryName(id);
                return name ? `${id}-${name}` : `#${id}`;
            },
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
            width: '8%',
            render: (unit) => (
                <Tag color="blue">{UNIT_LABELS[unit] || unit}</Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'processStatus',
            key: 'processStatus',
            width: '10%',
            render: (processStatus) => {
                if (!processStatus) return <Tag>Chưa xác định</Tag>;
                const statusConfig = {
                    PENDING: { color: 'orange', label: 'Chờ xử lý' },
                    COMPLETED: { color: 'green', label: 'Hoàn thành' },
                    EXPIRED: { color: 'red', label: 'Hết hạn' },
                };
                const config = statusConfig[processStatus] || { color: 'default', label: processStatus };
                return <Tag color={config.color}>{config.label}</Tag>;
            },
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            width: '18%',
            ellipsis: true,
            render: (note) => note || <span style={{ color: '#999' }}>Không có ghi chú</span>,
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'providerId',
            key: 'providerId',
            width: '8%',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '12%',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: '14%',
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
            />

            <ProductBatchDetailModal
                batchId={selectedBatchId}
                open={detailModalOpen}
                onClose={() => {
                    setDetailModalOpen(false);
                    setSelectedBatchId(null);
                }}
            />

            <ProductBatchEditModal
                batch={selectedBatch}
                open={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedBatch(null);
                }}
                onSuccess={handleEditSuccess}
            />
        </>
    );
}

export default ProductBatchTable;