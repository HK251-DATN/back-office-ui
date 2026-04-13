// src/layout/manage-product/components/ProductDetailModal.jsx
import { Modal, Spin, Tag, Image, Descriptions, Alert } from 'antd';
import { useState, useEffect } from 'react';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';

const BASE_URL = API_URLS.MAIN;

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
            const response = await axios.get(`${BASE_URL}/api/product-general/${productId}`);
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
            width={700}
            destroyOnClose
        >
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16, color: '#999' }}>Đang tải thông tin sản phẩm...</p>
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
                    {product.imgUrl && (
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Image
                                src={product.imgUrl}
                                alt={product.prodName}
                                style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }}
                                fallback="https://via.placeholder.com/400x300?text=No+Image"
                            />
                        </div>
                    )}

                    {/* Product Info */}
                    <Descriptions
                        title={product.prodName}
                        bordered
                        column={2}
                        labelStyle={{ fontWeight: 600, width: '30%' }}
                    >
                        <Descriptions.Item label="Mã sản phẩm" span={2}>
                            #{product.prodGenId}
                        </Descriptions.Item>

                        <Descriptions.Item label="Danh mục con" span={2}>
                            <Tag color="blue">#{product.subSubcategoryId}</Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Mô tả" span={2}>
                            {product.description}
                        </Descriptions.Item>

                        <Descriptions.Item label="Tags" span={2}>
                            {product.tags && product.tags.length > 0 ? (
                                product.tags.map((tag, index) => (
                                    <Tag key={index} color="green">
                                        {tag}
                                    </Tag>
                                ))
                            ) : (
                                <span style={{ color: '#bbb' }}>Không có tags</span>
                            )}
                        </Descriptions.Item>

                        {product.preorderPolicyId && (
                            <Descriptions.Item label="Preorder Policy" span={2}>
                                #{product.preorderPolicyId}
                            </Descriptions.Item>
                        )}

                        {product.enterpriseStoreId && (
                            <Descriptions.Item label="Enterprise Store" span={2}>
                                #{product.enterpriseStoreId}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </div>
            )}
        </Modal>
    );
}

export default ProductDetailModal;