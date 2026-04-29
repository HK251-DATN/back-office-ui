import { useState } from 'react';
import { Card, Tag, Button, Space, Descriptions, Modal, Input, message } from 'antd';
import { FileOutlined, CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { reviewCertificate } from '../../../services/providerService';
import MediaViewer from './MediaViewer';

const { TextArea } = Input;

const statusColors = {
    PENDING: 'orange',
    APPROVED: 'green',
    REJECTED: 'red'
};

const statusLabels = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối'
};

const certTypeLabels = {
    VIETGAP: 'VietGAP',
    ORGANIC: 'Hữu cơ',
    FOOD_SAFETY: 'An toàn thực phẩm',
    HACCP: 'HACCP',
    ISO: 'ISO',
    OTHER: 'Khác'
};

const CertificateCard = ({ certificate, onReviewSuccess }) => {
    const [reviewing, setReviewing] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [reviewNote, setReviewNote] = useState('');
    const [viewerOpen, setViewerOpen] = useState(false);

    const handleApprove = async () => {
        setReviewing(true);
        try {
            const response = await reviewCertificate(certificate.certificateId, {
                status: 'APPROVED',
                reviewNote: ''
            });

            if (response.data?.type === 'GOOD') {
                message.success('Đã duyệt chứng chỉ');
                onReviewSuccess?.();
            } else {
                message.error('Không thể duyệt chứng chỉ');
            }
        } catch (error) {
            console.error('Error approving certificate:', error);
            message.error('Lỗi khi duyệt chứng chỉ');
        } finally {
            setReviewing(false);
        }
    };

    const handleReject = async () => {
        if (!reviewNote.trim()) {
            message.warning('Vui lòng nhập lý do từ chối');
            return;
        }

        setReviewing(true);
        try {
            const response = await reviewCertificate(certificate.certificateId, {
                status: 'REJECTED',
                reviewNote: reviewNote.trim()
            });

            if (response.data?.type === 'GOOD') {
                message.success('Đã từ chối chứng chỉ');
                setRejectModalOpen(false);
                setReviewNote('');
                onReviewSuccess?.();
            } else {
                message.error('Không thể từ chối chứng chỉ');
            }
        } catch (error) {
            console.error('Error rejecting certificate:', error);
            message.error('Lỗi khi từ chối chứng chỉ');
        } finally {
            setReviewing(false);
        }
    };

    const isPending = certificate.status === 'PENDING';

    return (
        <>
            <Card
                size="small"
                title={
                    <div className="flex items-center justify-between">
                        <Space>
                            <FileOutlined />
                            <span>Chứng chỉ #{certificate.certificateId}</span>
                            <Tag color={statusColors[certificate.status]}>
                                {statusLabels[certificate.status]}
                            </Tag>
                        </Space>
                    </div>
                }
                extra={
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => setViewerOpen(true)}
                    >
                        Xem tài liệu
                    </Button>
                }
            >
                <Descriptions column={2} size="small">
                    <Descriptions.Item label="Loại chứng chỉ">
                        <Tag color="blue">
                            {certTypeLabels[certificate.certificateType] || certificate.certificateType}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số chứng chỉ">
                        {certificate.certificateNumber}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cơ quan cấp" span={2}>
                        {certificate.issuingAuthority}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cấp">
                        {certificate.issuedDate}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày hết hạn">
                        {certificate.expiryDate}
                    </Descriptions.Item>
                    {certificate.reviewedBy && (
                        <>
                            <Descriptions.Item label="Người duyệt">
                                ID: {certificate.reviewedBy}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian duyệt">
                                {new Date(certificate.reviewedAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                        </>
                    )}
                    {certificate.reviewNote && (
                        <Descriptions.Item label="Ghi chú" span={2}>
                            <div className="text-red-600">{certificate.reviewNote}</div>
                        </Descriptions.Item>
                    )}
                </Descriptions>

                {isPending && (
                    <div className="mt-4 flex gap-2">
                        <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={handleApprove}
                            loading={reviewing}
                        >
                            Duyệt
                        </Button>
                        <Button
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => setRejectModalOpen(true)}
                        >
                            Từ chối
                        </Button>
                    </div>
                )}
            </Card>

            <Modal
                open={rejectModalOpen}
                title="Từ chối chứng chỉ"
                onCancel={() => {
                    setRejectModalOpen(false);
                    setReviewNote('');
                }}
                onOk={handleReject}
                okText="Xác nhận từ chối"
                cancelText="Hủy"
                okButtonProps={{ danger: true, loading: reviewing }}
            >
                <div className="py-4">
                    <p className="mb-2 text-gray-700">Vui lòng nhập lý do từ chối chứng chỉ này:</p>
                    <TextArea
                        rows={4}
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Ví dụ: Chứng chỉ đã hết hạn, hình ảnh không rõ ràng..."
                    />
                </div>
            </Modal>

            <MediaViewer
                open={viewerOpen}
                url={certificate.documentUrl}
                title={`Chứng chỉ ${certTypeLabels[certificate.certificateType]} - ${certificate.certificateNumber}`}
                onClose={() => setViewerOpen(false)}
            />
        </>
    );
};

export default CertificateCard;
