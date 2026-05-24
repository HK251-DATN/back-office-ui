import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, message, Space, Modal, Avatar, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
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

const STATUS_CONFIG = {
    WAIT_FOR_DELIVERY: { color: 'blue',    label: 'Chờ giao' },
    PENDING:           { color: 'orange',  label: 'Chờ xử lý' },
    PROCESSED:         { color: 'green',   label: 'Đã xử lý' },
    EXPIRED:           { color: 'red',     label: 'Hết hạn' },
    REJECTED:          { color: 'volcano', label: 'Từ chối' },
};

const VERIFICATION_CONFIG = {
    CERTIFICATE: { color: 'purple', label: 'Chứng nhận' },
    VIDEO:        { color: 'cyan',   label: 'Video' },
};

function ProductBatchTable({ filters = {}, refreshTrigger }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [sortBy, setSortBy] = useState(undefined);
    const [sortDir, setSortDir] = useState(undefined);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [subSubcategories, setSubSubcategories] = useState([]);

    const fetchSubSubcategories = useCallback(async () => {
        try {
            const response = await getSubSubcategories();
            if (response.data?.type === 'GOOD') {
                setSubSubcategories(response.data.detail);
            }
        } catch (error) {
            console.error('Failed to fetch sub-subcategories:', error);
        }
    }, []);

    useEffect(() => {
        fetchSubSubcategories();
    }, [fetchSubSubcategories]);

    const getSubSubcategoryName = (id) => {
        const cat = subSubcategories.find(c => c.subSubcategoryId === id);
        return cat ? cat.name : '';
    };

    const fetchData = useCallback(async (currentPage, currentPageSize, currentSortBy, currentSortDir) => {
        setLoading(true);
        try {
            const params = {
                pageNum: currentPage,
                pageSize: currentPageSize,
            };
            if (filters.processStatus)    params.processStatus    = filters.processStatus;
            if (filters.verificationType) params.verificationType = filters.verificationType;
            if (currentSortBy)            params.sortBy           = currentSortBy;
            if (currentSortDir)           params.sortDir          = currentSortDir;

            const response = await getProductBatches(params);
            const type = response.data?.type;

            if (type === 'GOOD' || type === 'SKIP_AS_GOOD') {
                const detail = response.data.detail;
                const normalized = (detail?.data ?? []).map(item => ({
                    ...item.batch,
                    provider: item.provider ?? null,
                }));
                setData(normalized);
                setTotal(detail?.totalElements ?? 0);
            } else {
                message.error(response.data?.message || 'Không thể tải dữ liệu product batch');
                setData([]);
                setTotal(0);
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu product batch');
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        setPage(1);
        setSortBy(undefined);
        setSortDir(undefined);
        fetchData(1, pageSize, undefined, undefined);
    }, [filters, refreshTrigger]);

    const handleTableChange = (newPagination, _tableFilters, sorter) => {
        const newPage     = newPagination.current;
        const newPageSize = newPagination.pageSize;
        const newSortBy   = sorter?.field && sorter?.order ? sorter.field : undefined;
        const newSortDir  = sorter?.order === 'ascend' ? 'asc' : sorter?.order === 'descend' ? 'desc' : undefined;
        setPage(newPage);
        setPageSize(newPageSize);
        setSortBy(newSortBy);
        setSortDir(newSortDir);
        fetchData(newPage, newPageSize, newSortBy, newSortDir);
    };

    const handleView = (record) => {
        setSelectedBatchId(record.batchId);
        setDetailModalOpen(true);
    };

    const handleEdit = (record) => {
        setSelectedBatch(record);
        setEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        fetchData(page, pageSize, sortBy, sortDir);
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
                    if (response.data?.type === 'GOOD') {
                        message.success('Xóa lô hàng thành công');
                        fetchData(page, pageSize, sortBy, sortDir);
                    } else {
                        message.error(response.data?.message || 'Xóa lô hàng thất bại');
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
            width: 70,
            sorter: true,
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Danh mục',
            dataIndex: 'subSubcategoryId',
            key: 'subSubcategoryId',
            width: 160,
            ellipsis: true,
            render: (id) => {
                const name = getSubSubcategoryName(id);
                return name ? `${id} - ${name}` : `#${id}`;
            },
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 120,
            sorter: true,
            sortDirections: ['ascend', 'descend'],
            render: (quantity, record) => `${quantity} ${UNIT_LABELS[record.unit] || record.unit}`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'processStatus',
            key: 'processStatus',
            width: 130,
            render: (val) => {
                const cfg = STATUS_CONFIG[val] || { color: 'default', label: val || 'Chưa xác định' };
                return <Tag color={cfg.color}>{cfg.label}</Tag>;
            },
        },
        {
            title: 'Xác minh',
            dataIndex: 'verificationType',
            key: 'verificationType',
            width: 120,
            render: (val) => {
                if (!val) return '—';
                const cfg = VERIFICATION_CONFIG[val] || { color: 'default', label: val };
                return <Tag color={cfg.color}>{cfg.label}</Tag>;
            },
        },
        {
            title: 'Nhà cung cấp',
            key: 'provider',
            width: 180,
            render: (_, record) => {
                const p = record.provider;
                if (!p) return <span className="text-gray-400">—</span>;
                const fullName = `${p.fName} ${p.lName}`.trim();
                return (
                    <Tooltip title={`ID: ${p.providerId}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar
                                size={28}
                                src={p.avtUrl || undefined}
                                icon={!p.avtUrl && <UserOutlined />}
                            />
                            <span style={{ fontSize: 13 }}>{fullName || `#${p.providerId}`}</span>
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            width: 160,
            ellipsis: true,
            render: (note) => note || <span style={{ color: '#999' }}>Không có</span>,
        },
        {
            title: 'Ngày nhận',
            dataIndex: 'receivedAt',
            key: 'receivedAt',
            width: 150,
            sorter: true,
            sortDirections: ['ascend', 'descend'],
            render: (val) => (val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—'),
        },
        {
            title: 'Hết hạn',
            dataIndex: 'expiredAt',
            key: 'expiredAt',
            width: 150,
            sorter: true,
            sortDirections: ['ascend', 'descend'],
            render: (val) => (val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—'),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            sorter: true,
            sortDirections: ['ascend', 'descend'],
            render: (val) => (val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <ViewButton onClick={() => handleView(record)} />
                    <EditButton onClick={() => handleEdit(record)} />
                    <DeleteButton onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];

    return (
        <>
            <Table
                className="border border-gray-200 rounded-2xl"
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="batchId"
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    showTotal: (t) => `Tổng ${t} lô hàng`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 1300 }}
                locale={{ emptyText: 'Không có lô hàng nào' }}
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
