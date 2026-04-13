// src/components/warehouse/ProductBatchDetailModal.jsx
import { Modal, Descriptions, Spin, Alert, Tag } from 'antd';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { getProductBatchById } from '../../../services/productBatchService';

const UNIT_LABELS = {
    KILOGRAM: 'Kilogram (Kg)',
    GRAM: 'Gram (g)',
    LITER: 'Liter (L)',
    MILLILITER: 'Milliliter (mL)',
};

const PROCESS_STATUS_LABELS = {
    PENDING: 'Chờ xử lý',
    COMPLETED: 'Hoàn thành',
    EXPIRED: 'Hết hạn',
};

const PROCESS_STATUS_COLORS = {
    PENDING: 'orange',
    PROCESSING: 'blue',
    COMPLETED: 'green',
    EXPIRED: 'red',
};

function ProductBatchDetailModal({ batchId, open, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchBatchDetail = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await getProductBatchById(batchId);

                if (response.data.type === 'GOOD') {
                    console.log(response.data.detail);

                    setData(response.data.detail);
                } else {
                    setError(response.data.message || 'Không thể tải thông tin batch');
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (open && batchId) {
            fetchBatchDetail();
        }
    }, [open, batchId]);

    return (
        <Modal
            title={`Chi tiết Product Batch #${batchId}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={700}
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
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID">
                        <strong>{data.batchId}</strong>
                    </Descriptions.Item>

                    <Descriptions.Item label="Số lượng">
                        <strong>{data.quantity} {UNIT_LABELS[data.unit] || data.unit}</strong>
                    </Descriptions.Item>

                    <Descriptions.Item label="Đơn vị">
                        <Tag color="blue">{UNIT_LABELS[data.unit] || data.unit}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Trạng thái xử lý">
                        {data.processStatus ? (
                            <Tag color={PROCESS_STATUS_COLORS[data.processStatus] || 'default'}>
                                {PROCESS_STATUS_LABELS[data.processStatus] || data.processStatus}
                            </Tag>
                        ) : (
                            <Tag>Chưa xác định</Tag>
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item label="Nhà cung cấp">
                        Provider #{data.providerId}
                    </Descriptions.Item>

                    <Descriptions.Item label="Ghi chú">
                        {data.note || <span style={{ color: '#999' }}>Không có ghi chú</span>}
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày tạo">
                        {data.createdAt ? dayjs(data.createdAt).format('DD/MM/YYYY HH:mm:ss') : '-'}
                    </Descriptions.Item>

                    {data.updatedAt && (
                        <Descriptions.Item label="Cập nhật lần cuối">
                            {dayjs(data.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                        </Descriptions.Item>
                    )}
                </Descriptions>
            )}
        </Modal>
    );
}

export default ProductBatchDetailModal;