// src/components/warehouse/ProductDetailDetailModal.jsx
import { Modal, Descriptions, Spin, Alert, Tag } from 'antd';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';

const UNIT_LABELS = {
    KILOGRAM: 'Kilogram (Kg)',
    GRAM: 'Gram (g)',
    LITER: 'Liter (L)',
    MILLILITER: 'Milliliter (mL)',
};

const STATUS_CONFIG = {
    STORED: { color: 'green', label: 'Đã lưu kho' },
    SOLD: { color: 'orange', label: 'Đã bán' },
    EXPIRED: { color: 'red', label: 'Hết hạn' },
};

function ProductDetailDetailModal({ detailId, open, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (open && detailId) {
            fetchDetailInfo();
        }
    }, [open, detailId]);

    const fetchDetailInfo = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API_URLS.STORAGE}/api/product-detail/${detailId}`);

            if (response.data.type === 'GOOD') {
                setData(response.data.detail);
            } else {
                setError(response.data.message || 'Không thể tải thông tin product detail');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Chi tiết Product Detail #${detailId}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={800}
            destroyOnClose
        >
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16, color: '#999' }}>Đang tải dữ liệu...</p>
                </div>
            )}

            {error && (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                />
            )}

            {!loading && !error && data && (
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="ID" span={2}>
                        <strong>{data.prodDetailId}</strong>
                    </Descriptions.Item>

                    <Descriptions.Item label="Batch ID">
                        Batch #{data.batchId}
                    </Descriptions.Item>

                    <Descriptions.Item label="Product General ID">
                        Product #{data.prodGenId}
                    </Descriptions.Item>

                    <Descriptions.Item label="Số lượng">
                        <strong>{data.unitQuantity} {UNIT_LABELS[data.unit] || data.unit}</strong>
                    </Descriptions.Item>

                    <Descriptions.Item label="Giá">
                        <strong style={{ color: '#1890ff', fontSize: 16 }}>
                            {data.price?.toLocaleString('vi-VN')} ₫
                        </strong>
                    </Descriptions.Item>

                    <Descriptions.Item label="Đánh giá">
                        {data.numOfStar ? `${data.numOfStar} ⭐` : <span style={{ color: '#999' }}>Chưa có đánh giá</span>}
                    </Descriptions.Item>

                    <Descriptions.Item label="Trạng thái">
                        <Tag color={STATUS_CONFIG[data.status]?.color || 'default'}>
                            {STATUS_CONFIG[data.status]?.label || data.status}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Storage Tool ID" span={2}>
                        {data.storageToolId || <span style={{ color: '#999' }}>Không có</span>}
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày tạo" span={2}>
                        {data.createdAt ? dayjs(data.createdAt).format('DD/MM/YYYY HH:mm:ss') : '-'}
                    </Descriptions.Item>

                    {data.updatedAt && (
                        <Descriptions.Item label="Cập nhật lần cuối" span={2}>
                            {dayjs(data.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                        </Descriptions.Item>
                    )}
                </Descriptions>
            )}
        </Modal>
    );
}

export default ProductDetailDetailModal;