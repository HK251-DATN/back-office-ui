// src/layout/manage-product/components/ProductGeneralTable.jsx
import { Table, Tag, Space, Button, message, Alert, Image, Popconfirm } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import ProductDetailModal from './ProductDetailModal';
import axios from '../../../services/axiosInstance';
import ProductGeneralCreateModal from './ProductGeneralCreateModal';
import ProductGeneralEditModal from '../ProductGeneralEditModal';

function ProductGeneralTable() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editRecord, setEditRecord] = useState(null);

    const handleCreateSuccess = () => {
        fetchProductGenerals();
    };

    const handleEditSuccess = () => {
        fetchProductGenerals();
    };

    const handleEdit = (record) => {
        setEditRecord(record);
        setEditModalOpen(true);
    };

    useEffect(() => {
        fetchProductGenerals();
    }, []);

    const fetchProductGenerals = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:9100/api/product-general');
            if (response.data.type === 'GOOD') {
                setData(response.data.detail);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Không thể tải danh sách sản phẩm';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (prodGenId) => {
        setSelectedProductId(prodGenId);
        setModalOpen(true);
    };

    const handleDelete = async (record) => {
        try {
            const response = await axios.delete(`http://localhost:9100/api/product-general/${record.prodGenId}`);
            if (response.data.type === 'GOOD') {
                message.success('Xóa sản phẩm thành công!');
                fetchProductGenerals();
            } else {
                message.error(response.data.message || 'Xóa thất bại!');
            }
        } catch (err) {
            message.error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa!');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'prodGenId',
            key: 'prodGenId',
            width: 70,
            sorter: (a, b) => a.prodGenId - b.prodGenId,
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'imgUrl',
            key: 'imgUrl',
            width: 90,
            render: (imgUrl) =>
                imgUrl ? (
                    <Image
                        src={imgUrl}
                        alt="product"
                        width={50}
                        height={50}
                        style={{ objectFit: 'cover', borderRadius: 6 }}
                        fallback="https://via.placeholder.com/50x50?text=N/A"
                    />
                ) : (
                    <div
                        style={{
                            width: 50,
                            height: 50,
                            background: '#f5f5f5',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#bbb',
                            fontSize: 11,
                        }}
                    >
                        N/A
                    </div>
                ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'prodName',
            key: 'prodName',
            width: 200,
            ellipsis: true,
            sorter: (a, b) => a.prodName.localeCompare(b.prodName),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 280,
            ellipsis: true,
            render: (text) => (
                <span style={{ color: '#666' }}>
                    {text?.length > 80 ? `${text.substring(0, 80)}...` : text}
                </span>
            ),
        },
        {
            title: 'Danh mục con',
            dataIndex: 'subSubcategoryId',
            key: 'subSubcategoryId',
            width: 120,
            render: (id) => <Tag color="blue">#{id}</Tag>,
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            width: 220,
            render: (tags) =>
                tags && tags.length > 0 ? (
                    tags.map((tag, index) => (
                        <Tag key={index} color="green" style={{ marginBottom: 4 }}>
                            {tag}
                        </Tag>
                    ))
                ) : (
                    <span style={{ color: '#bbb' }}>—</span>
                ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 240,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record.prodGenId)}
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
                    <Popconfirm
                        title="Xóa sản phẩm?"
                        description="Bạn có chắc muốn xóa sản phẩm này không?"
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
                rowKey="prodGenId"
                scroll={{ x: 1200 }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} sản phẩm`,
                    pageSizeOptions: ['10', '20', '50'],
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

            <ProductGeneralEditModal
                open={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setEditRecord(null);
                }}
                onSuccess={handleEditSuccess}
                record={editRecord}
            />
        </div>
    );
}

export default ProductGeneralTable;