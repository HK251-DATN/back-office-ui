import { Modal, Descriptions, Spin, Alert, Tag, Avatar, Table, Divider, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { getProductBatchById } from '../../../services/productBatchService';

const { Text } = Typography;

const UNIT_LABELS = {
    KILOGRAM: 'Kilogram (Kg)',
    GRAM: 'Gram (g)',
    LITER: 'Liter (L)',
    MILLILITER: 'Milliliter (mL)',
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

function ProviderCard({ provider }) {
    if (!provider) return <Text type="secondary">Không có</Text>;
    const fullName = `${provider.fName} ${provider.lName}`.trim();
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar
                size={36}
                src={provider.avtUrl || undefined}
                icon={!provider.avtUrl && <UserOutlined />}
            />
            <div style={{ lineHeight: 1.4 }}>
                <div style={{ fontWeight: 600 }}>{fullName || `Provider #${provider.providerId}`}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>ID: {provider.providerId}</Text>
            </div>
        </div>
    );
}

const SUB_BATCH_COLUMNS = [
    {
        title: 'ID',
        dataIndex: ['subBatch', 'subBatchId'],
        key: 'subBatchId',
        width: 60,
    },
    {
        title: 'Số lượng',
        key: 'quantity',
        width: 110,
        render: (_, record) =>
            `${record.subBatch.quantity} ${UNIT_LABELS[record.subBatch.unit] || record.subBatch.unit}`,
    },
    {
        title: 'Trạng thái',
        key: 'processStatus',
        width: 120,
        render: (_, record) => {
            const cfg = STATUS_CONFIG[record.subBatch.processStatus] || { color: 'default', label: record.subBatch.processStatus };
            return <Tag color={cfg.color}>{cfg.label}</Tag>;
        },
    },
    {
        title: 'Nhà cung cấp',
        key: 'provider',
        render: (_, record) => <ProviderCard provider={record.provider} />,
    },
    {
        title: 'Ngày nhận',
        key: 'receivedAt',
        width: 150,
        render: (_, record) =>
            record.subBatch.receivedAt ? dayjs(record.subBatch.receivedAt).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
        title: 'Hết hạn',
        key: 'expiredAt',
        width: 150,
        render: (_, record) =>
            record.subBatch.expiredAt ? dayjs(record.subBatch.expiredAt).format('DD/MM/YYYY HH:mm') : '—',
    },
];

function ProductBatchDetailModal({ batchId, open, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        if (!open || !batchId) return;

        const fetchBatchDetail = async () => {
            setLoading(true);
            setError(null);
            setDetail(null);
            try {
                const response = await getProductBatchById(batchId);
                if (response.data?.type === 'GOOD') {
                    setDetail(response.data.detail);
                } else {
                    setError(response.data?.message || 'Không thể tải thông tin batch');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchBatchDetail();
    }, [open, batchId]);

    const batch = detail?.batch;
    const provider = detail?.provider;
    const subBatches = detail?.subBatches;
    const isCertificate = batch?.verificationType === 'CERTIFICATE';

    return (
        <Modal
            title={`Chi tiết Lô hàng #${batchId}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={780}
            destroyOnClose
        >
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16, color: '#999' }}>Đang tải dữ liệu...</p>
                </div>
            )}

            {error && (
                <Alert message="Lỗi" description={error} type="error" showIcon />
            )}

            {!loading && !error && batch && (
                <>
                    {/* ── Batch info ── */}
                    <Descriptions
                        bordered
                        column={2}
                        size="small"
                        style={{ marginBottom: 20 }}
                    >
                        <Descriptions.Item label="ID lô hàng">
                            <strong>#{batch.batchId}</strong>
                        </Descriptions.Item>

                        <Descriptions.Item label="Danh mục">
                            #{batch.subSubcategoryId}
                        </Descriptions.Item>

                        <Descriptions.Item label="Số lượng">
                            <strong>{batch.quantity}</strong> {UNIT_LABELS[batch.unit] || batch.unit}
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng thái">
                            {(() => {
                                const cfg = STATUS_CONFIG[batch.processStatus] || { color: 'default', label: batch.processStatus || 'Chưa xác định' };
                                return <Tag color={cfg.color}>{cfg.label}</Tag>;
                            })()}
                        </Descriptions.Item>

                        <Descriptions.Item label="Loại xác minh">
                            {(() => {
                                const cfg = VERIFICATION_CONFIG[batch.verificationType];
                                return cfg
                                    ? <Tag color={cfg.color}>{cfg.label}</Tag>
                                    : <span>—</span>;
                            })()}
                        </Descriptions.Item>

                        <Descriptions.Item label="Yêu cầu thô">
                            #{batch.rawProductDemandId}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày nhận">
                            {batch.receivedAt ? dayjs(batch.receivedAt).format('DD/MM/YYYY HH:mm') : '—'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Hết hạn">
                            {batch.expiredAt ? dayjs(batch.expiredAt).format('DD/MM/YYYY HH:mm') : '—'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày tạo">
                            {batch.createdAt ? dayjs(batch.createdAt).format('DD/MM/YYYY HH:mm') : '—'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Cập nhật lần cuối">
                            {batch.updatedAt ? dayjs(batch.updatedAt).format('DD/MM/YYYY HH:mm') : '—'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ghi chú" span={2}>
                            {batch.note || <Text type="secondary">Không có ghi chú</Text>}
                        </Descriptions.Item>
                    </Descriptions>

                    {/* ── CERTIFICATE: single provider ── */}
                    {isCertificate && (
                        <>
                            <Divider orientation="left" style={{ fontSize: 13, color: '#555' }}>
                                Nhà cung cấp
                            </Divider>
                            <div style={{ paddingLeft: 8, marginBottom: 16 }}>
                                <ProviderCard provider={provider} />
                            </div>
                        </>
                    )}

                    {/* ── VIDEO: sub-batches table ── */}
                    {!isCertificate && (
                        <>
                            <Divider orientation="left" style={{ fontSize: 13, color: '#555' }}>
                                Lô hàng con ({subBatches?.length ?? 0})
                            </Divider>
                            <Table
                                columns={SUB_BATCH_COLUMNS}
                                dataSource={subBatches ?? []}
                                rowKey={(r) => r.subBatch.subBatchId}
                                size="small"
                                pagination={false}
                                scroll={{ x: 680 }}
                                locale={{ emptyText: 'Không có lô hàng con' }}
                            />
                        </>
                    )}
                </>
            )}
        </Modal>
    );
}

export default ProductBatchDetailModal;
