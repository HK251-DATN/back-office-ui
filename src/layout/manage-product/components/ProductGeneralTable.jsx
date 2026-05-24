// src/layout/manage-product/components/ProductGeneralTable.jsx
import { Table, Tag, Space, Button, message, Alert, Image, Popconfirm } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import ProductDetailModal from './ProductDetailModal';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';
import ProductGeneralCreateModal from './ProductGeneralCreateModal';
import ProductGeneralEditModal from '../ProductGeneralEditModal';

const UNIT_LABELS = {
    KILOGRAM: 'Kg',
    GRAM: 'g',
    LITER: 'L',
    MILLILITER: 'mL',
};

function ProductGeneralTable() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [subSubcategories, setSubSubcategories] = useState([]);

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
        fetchSubSubcategories();
    }, []);

    const fetchSubSubcategories = async () => {
        try {
            const response = await axios.get(`${API_URLS.MAIN}/api/categories/sub-subcategories`);
            if (response.data.type === 'GOOD') {
                setSubSubcategories(response.data.detail);
            }
        } catch (err) {
            console.error('Failed to fetch sub-subcategories:', err);
        }
    };

    const getSubSubcategoryName = (id) => {
        const category = subSubcategories.find(cat => cat.subSubcategoryId === id);
        return category ? category.name : '';
    };

    const fetchProductGenerals = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URLS.MAIN}/api/product-general?pageSize=200`);
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
            const response = await axios.delete(`${API_URLS.MAIN}/api/product-general/${record.prodGenId}`);
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
            title: 'Đơn vị',
            dataIndex: 'unit',
            key: 'unit',
            width: 80,
            render: (unit) => (
                <Tag color="blue">{UNIT_LABELS[unit] || unit}</Tag>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'unitQuantity',
            key: 'unitQuantity',
            width: 90,
            render: (quantity, record) => (
                <span>
                    {quantity} {UNIT_LABELS[record.unit] || record.unit}
                </span>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 220,
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
            width: 180,
            ellipsis: true,
            render: (id) => {
                const name = getSubSubcategoryName(id);
                return name ? `${id}-${name}` : `#${id}`;
            },
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