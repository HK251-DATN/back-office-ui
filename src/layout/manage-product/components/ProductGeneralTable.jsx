// src/components/ProductGeneralTable.jsx
import { Table, Tag, Space, Button, message, Alert } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import ProductDetailModal from './ProductDetailModal';
import axios from 'axios';
import ProductGeneralCreateModal from './ProductGeneralCreateModal';

function ProductGeneralTable() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const [createModalOpen, setCreateModalOpen] = useState(false);

    const handleCreateSuccess = () => {
        // Refresh the table
        fetchProductGenerals();
    };

    useEffect(() => {
        fetchProductGenerals();
    }, []);

    const fetchProductGenerals = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('http://localhost:9300/api/product-generals?page=1&size=9999');

            if (response.data.type === 'GOOD') {
                setData(response.data.detail);
                message.success('Tải dữ liệu thành công!');
            } else {
                setError(response.data.message);
                message.error(response.data.message);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Không thể tải danh sách sản phẩm';
            setError(errorMsg);
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (productId) => {
        setSelectedProductId(productId);
        setModalOpen(true);
    };

    const handleEdit = (record) => {
        message.info(`Chỉnh sửa sản phẩm: ${record.name}`);
        // TODO: Implement edit functionality
    };

    const handleDelete = (record) => {
        message.warning(`Xóa sản phẩm: ${record.name}`);
        // TODO: Implement delete functionality
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'productGeneralId',
            key: 'productGeneralId',
            width: 60,
            sorter: (a, b) => a.productGeneralId - b.productGeneralId,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            ellipsis: true,
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 300,
            ellipsis: true,
            render: (text) => (
                <span style={{ color: '#666' }}>
                    {text?.length > 80 ? `${text.substring(0, 80)}...` : text}
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            filters: [
                { text: 'Đang hoạt động', value: 'ACTIVE' },
                { text: 'Ngừng hoạt động', value: 'INACTIVE' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                    {status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                </Tag>
            ),
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            width: 250,
            render: (tags) => (
                <>
                    {tags && tags.length > 0 ? (
                        tags.map((tag, index) => (
                            <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                                {tag}
                            </Tag>
                        ))
                    ) : (
                        <span style={{ color: '#999' }}>Không có tags</span>
                    )}
                </>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record.productGeneralId)}
                    >
                        Xem
                    </Button>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {error && (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: 16 }}
                />
            )}

            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalOpen(true)}
                >
                    Thêm sản phẩm
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="productGeneralId"
                scroll={{ x: 1500 }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} sản phẩm`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                bordered
            />

            <ProductDetailModal
                productId={selectedProductId}
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedProductId(null);
                }}
            />

            <ProductGeneralCreateModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}

export default ProductGeneralTable;