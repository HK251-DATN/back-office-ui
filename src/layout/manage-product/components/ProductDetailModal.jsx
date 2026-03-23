// src/components/ProductDetailModal.jsx
import { Modal, Spin, Tag, Image, Descriptions, Alert } from 'antd';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';

function ProductDetailModal({ productId, open, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [product, setProduct] = useState(null);

    useEffect(() => {
        if (open && productId) {
            fetchProductDetails();
        }
    }, [open, productId]);

    const fetchProductDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`http://localhost:9300/api/product-generals/${productId}`);

            if (response.data.type === 'GOOD') {
                setProduct(response.data.detail);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải thông tin sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setProduct(null);
        setError(null);
        onClose();
    };

    return (
        <Modal
            title="Chi tiết sản phẩm"
            open={open}
            onCancel={handleClose}
            footer={null}
            width={800}
            destroyOnClose
        >
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16 }}>Đang tải thông tin sản phẩm...</p>
                </div>
            )}

            {error && (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    closable
                />
            )}

            {product && !loading && (
                <div>
                    {/* Product Image */}
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Image
                            src={product.img}
                            alt={product.name}
                            style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'cover' }}
                            fallback="https://via.placeholder.com/400x300?text=No+Image"
                        />
                    </div>

                    {/* Product Info */}
                    <Descriptions
                        title={product.name}
                        bordered
                        column={2}
                        labelStyle={{ fontWeight: 'bold', width: '30%' }}
                    >
                        <Descriptions.Item label="Mã sản phẩm" span={2}>
                            {product.productGeneralId}
                        </Descriptions.Item>

                        <Descriptions.Item label="Danh mục" span={2}>
                            Danh mục #{product.categoryId}
                        </Descriptions.Item>

                        {product.providerId && (
                            <Descriptions.Item label="Nhà cung cấp" span={2}>
                                Nhà cung cấp #{product.providerId}
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Trạng thái" span={2}>
                            <Tag color={product.status === 'ACTIVE' ? 'green' : 'red'}>
                                {product.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                            </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Mô tả" span={2}>
                            {product.description}
                        </Descriptions.Item>

                        <Descriptions.Item label="Tags" span={2}>
                            {product.tags && product.tags.length > 0 ? (
                                product.tags.map((tag, index) => (
                                    <Tag key={index} color="blue">
                                        {tag}
                                    </Tag>
                                ))
                            ) : (
                                <span style={{ color: '#999' }}>Không có tags</span>
                            )}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày tạo">
                            {dayjs(product.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>

                        <Descriptions.Item label="Cập nhật lần cuối">
                            {product.updatedAt
                                ? dayjs(product.updatedAt).format('DD/MM/YYYY HH:mm')
                                : 'Chưa cập nhật'
                            }
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            )}
        </Modal>
    );
}

export default ProductDetailModal;