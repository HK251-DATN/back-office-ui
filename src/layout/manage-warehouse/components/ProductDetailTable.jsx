// src/components/warehouse/ProductDetailTable.jsx
import { useState, useEffect } from 'react';
import { Table, Tag, message, Space } from 'antd';
import ProductDetailDetailModal from './ProductDetailDetailModal';
import dayjs from 'dayjs';
import ViewButton from '../../../components/ViewButton';
import EditButton from '../../../components/EditButton';
import DeleteButton from '../../../components/DeleteButton';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';

const STATUS_CONFIG = {
    STORED: { color: 'green', label: 'Đã lưu kho' },
    PROCESSING: { color: 'blue', label: 'Đang xử lý' },
    SOLD: { color: 'orange', label: 'Đã bán' },
    EXPIRED: { color: 'red', label: 'Hết hạn' },
    PICKED: { color: 'cyan', label: 'Đã chọn' },
    IN_TRANSIT: { color: 'geekblue', label: 'Đang vận chuyển' },
    DELIVERED: { color: 'purple', label: 'Đã giao' },
    RETURNED: { color: 'volcano', label: 'Đã trả lại' },
    DISPOSED: { color: 'magenta', label: 'Đã hủy' },
};

function ProductDetailTable({ refreshTrigger }) {
    const [groupedData, setGroupedData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 9999,
        total: 0,
    });
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedDetailId, setSelectedDetailId] = useState(null);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, refreshTrigger]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URLS.STORAGE}/api/product-detail`, {
                params: {
                    pageNum: pagination.current,
                    pageSize: pagination.pageSize,
                },
            });

            if (response.data.type === 'GOOD') {
                const details = response.data.detail;
                const detailsArray = Array.isArray(details) ? details : [];

                // Group data by batchId and prodGenId
                const grouped = groupProductDetails(detailsArray);
                setGroupedData(grouped);

                setPagination(prev => ({
                    ...prev,
                    total: response.data.totalElements || grouped.length,
                }));
            } else if (response.data.type === 'SKIP_AS_GOOD') {
                setGroupedData([]);
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu product detail');
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupProductDetails = (details) => {
        const groups = {};

        details.forEach(item => {
            const key = `${item.batchId}-${item.prodGenId}`;
            if (!groups[key]) {
                groups[key] = {
                    key: key,
                    batchId: item.batchId,
                    prodGenId: item.prodGenId,
                    count: 0,
                    totalPrice: 0,
                    avgPrice: 0,
                    children: [],
                    isGroup: true,
                };
            }
            groups[key].count += 1;
            groups[key].totalPrice += item.price || 0;
            groups[key].children.push({
                ...item,
                key: `detail-${item.prodDetailId}`,
                isGroup: false,
            });
        });

        // Calculate average price for each group
        return Object.values(groups).map(group => ({
            ...group,
            avgPrice: group.count > 0 ? group.totalPrice / group.count : 0,
        }));
    };

    const handleView = (record) => {
        setSelectedDetailId(record.prodDetailId);
        setDetailModalOpen(true);
    };

    const handleEdit = () => {
        message.info('Chức năng chỉnh sửa đang được phát triển');
    };

    const handleDelete = () => {
        message.info('Chức năng xóa đang được phát triển');
    };

    const columns = [
        {
            title: 'Batch ID',
            dataIndex: 'batchId',
            key: 'batchId',
            width: '10%',
            render: (batchId, record) => {
                if (record.isGroup) {
                    return <strong>Batch #{batchId}</strong>;
                }
                return batchId;
            },
        },
        {
            title: 'Product Gen ID',
            dataIndex: 'prodGenId',
            key: 'prodGenId',
            width: '12%',
            render: (prodGenId, record) => {
                if (record.isGroup) {
                    return <strong>Product #{prodGenId}</strong>;
                }
                return prodGenId;
            },
        },
        {
            title: 'ID / Số lượng',
            key: 'idOrCount',
            width: '12%',
            render: (_, record) => {
                if (record.isGroup) {
                    return (
                        <Tag color="blue" style={{ fontSize: 14 }}>
                            {record.count} sản phẩm
                        </Tag>
                    );
                }
                return `ID: ${record.prodDetailId}`;
            },
        },
        {
            title: 'Giá',
            key: 'price',
            width: '15%',
            render: (_, record) => {
                if (record.isGroup) {
                    return (
                        <div>
                            <div>TB: {record.avgPrice?.toLocaleString('vi-VN')} ₫</div>
                            <div style={{ fontSize: 11, color: '#999' }}>
                                Tổng: {record.totalPrice?.toLocaleString('vi-VN')} ₫
                            </div>
                        </div>
                    );
                }
                return <span>{record.price?.toLocaleString('vi-VN')} ₫</span>;
            },
        },
        {
            title: 'Đánh giá',
            dataIndex: 'numOfStar',
            key: 'numOfStar',
            width: '10%',
            render: (stars, record) => {
                if (record.isGroup) return '-';
                return stars ? `${stars} ⭐` : '-';
            },
        },
        {
            title: 'Storage Tool',
            dataIndex: 'storageToolId',
            key: 'storageToolId',
            width: '11%',
            render: (id, record) => {
                if (record.isGroup) return '-';
                return id || '-';
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '12%',
            render: (status, record) => {
                if (record.isGroup) {
                    // Count statuses in children
                    const statusCounts = {};
                    record.children.forEach(child => {
                        statusCounts[child.status] = (statusCounts[child.status] || 0) + 1;
                    });
                    const mostCommon = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0];
                    if (!mostCommon) return '-';
                    const config = STATUS_CONFIG[mostCommon[0]] || { color: 'default', label: mostCommon[0] };
                    return <Tag color={config.color}>{config.label} ({mostCommon[1]})</Tag>;
                }
                const config = STATUS_CONFIG[status] || { color: 'default', label: status };
                return <Tag color={config.color}>{config.label}</Tag>;
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '13%',
            render: (date, record) => {
                if (record.isGroup) {
                    // Show earliest date from children
                    const dates = record.children.map(c => c.createdAt).filter(Boolean);
                    if (dates.length === 0) return '-';
                    const earliest = dates.sort()[0];
                    return dayjs(earliest).format('DD/MM/YYYY');
                }
                return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-';
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: '15%',
            render: (_, record) => {
                if (record.isGroup) return '-';
                return (
                    <Space size="small">
                        <ViewButton onClick={() => handleView(record)} />
                        <EditButton onClick={() => handleEdit(record)} />
                        <DeleteButton onClick={() => handleDelete(record)} />
                    </Space>
                );
            },
        },
    ];

    const handleTableChange = (newPagination) => {
        setPagination({
            current: newPagination.current,
            pageSize: newPagination.pageSize,
            total: newPagination.total,
        });
    };

    return (
        <>
            <Table
                className='border border-gray-200 rounded-2xl'
                columns={columns}
                dataSource={groupedData}
                loading={loading}
                rowKey="key"
                expandable={{
                    defaultExpandAllRows: false,
                    indentSize: 30,
                }}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} nhóm sản phẩm`,
                    pageSizeOptions: ['10', '20', '50'],
                }}
                onChange={handleTableChange}
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