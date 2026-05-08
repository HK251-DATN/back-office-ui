import { useState, useEffect } from 'react';
import { Modal, Tabs, Spin, Button, message, Descriptions, Tag, Avatar, Space, Divider } from 'antd';
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import {
    getProviderById,
    getProviderCertificates,
    getProviderVideos,
    updateProvider
} from '../../../services/providerService';
import CertificateCard from './CertificateCard';
import VideoCard from './VideoCard';
import ProviderRejectModal from './ProviderRejectModal';

const statusColors = {
    PENDING: 'orange',
    APPROVED: 'green',
    REJECTED: 'red',
    SUSPENDED: 'volcano',
    UNVERIFIED: 'default'
};

const statusLabels = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    SUSPENDED: 'Tạm ngưng',
    UNVERIFIED: 'Chưa xác thực'
};

const genderLabels = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác'
};

const bankLabels = {
    VIETCOMBANK: 'Vietcombank',
    TECHCOMBANK: 'Techcombank',
    BIDV: 'BIDV',
    AGRIBANK: 'Agribank',
    VIETINBANK: 'VietinBank',
    MBBANK: 'MB Bank',
    TPBANK: 'TP Bank',
    SACOMBANK: 'Sacombank',
    ACB: 'ACB',
    VPBank: 'VPBank'
};

const ProviderReviewModal = ({ open, provider, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [providerDetail, setProviderDetail] = useState(null);
    const [certificates, setCertificates] = useState([]);
    const [videos, setVideos] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [approving, setApproving] = useState(false);

    useEffect(() => {
        if (open && provider?.providerId) {
            fetchProviderData();
        }
    }, [open, provider]);

    const fetchProviderData = async () => {
        setLoading(true);
        try {
            const [detailRes, certsRes, videosRes] = await Promise.all([
                getProviderById(provider.providerId),
                getProviderCertificates(provider.providerId),
                getProviderVideos(provider.providerId)
            ]);

            if (detailRes.data?.type === 'GOOD') {
                setProviderDetail(detailRes.data.detail);
            }

            if (certsRes.data?.type === 'GOOD' || certsRes.data?.type === 'SKIP_AS_GOOD') {
                setCertificates(certsRes.data.detail || []);
            }

            if (videosRes.data?.type === 'GOOD' || videosRes.data?.type === 'SKIP_AS_GOOD') {
                setVideos(videosRes.data.detail || []);
            }
        } catch (error) {
            console.error('Error fetching provider data:', error);
            message.error('Không thể tải thông tin nhà cung cấp');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setApproving(true);
        try {
            const response = await updateProvider(provider.providerId, {
                verificationStatus: 'APPROVED'
            });

            if (response.data?.type === 'GOOD') {
                message.success('Đã duyệt nhà cung cấp thành công');
                onSuccess?.();
            } else {
                message.error('Không thể duyệt nhà cung cấp');
            }
        } catch (error) {
            console.error('Error approving provider:', error);
            message.error('Lỗi khi duyệt nhà cung cấp');
        } finally {
            setApproving(false);
        }
    };

    const handleReject = async (note) => {
        try {
            const response = await updateProvider(provider.providerId, {
                verificationStatus: 'REJECTED'
            });

            if (response.data?.type === 'GOOD') {
                message.success('Đã từ chối nhà cung cấp');
                setRejectModalOpen(false);
                onSuccess?.();
            } else {
                message.error('Không thể từ chối nhà cung cấp');
            }
        } catch (error) {
            console.error('Error rejecting provider:', error);
            message.error('Lỗi khi từ chối nhà cung cấp');
        }
    };

    const handleEvidenceReview = () => {
        fetchProviderData();
    };

    if (!providerDetail) {
        return (
            <Modal
                open={open}
                onCancel={onClose}
                footer={null}
                width={1000}
                centered
            >
                <div className="flex justify-center items-center py-12">
                    <Spin size="large" />
                </div>
            </Modal>
        );
    }

    const tabs = [
        {
            key: 'profile',
            label: 'Thông tin nhà cung cấp',
            children: (
                <div className="py-4">
                    <div className="flex items-center gap-4 mb-6">
                        <Avatar
                            size={80}
                            src={providerDetail.avtUrl}
                            icon={<UserOutlined />}
                        />
                        <div>
                            <h2 className="text-xl font-semibold mb-1">
                                {providerDetail.fName} {providerDetail.lName}
                            </h2>
                            <p className="text-gray-600">{providerDetail.email}</p>
                            <Tag color={statusColors[providerDetail.verificationStatus]} className="mt-2">
                                {statusLabels[providerDetail.verificationStatus]}
                            </Tag>
                        </div>
                    </div>

                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="ID Nhà cung cấp">
                            {providerDetail.providerId}
                        </Descriptions.Item>
                        <Descriptions.Item label="ID Người dùng">
                            {providerDetail.userId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {providerDetail.pNum}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                            {genderLabels[providerDetail.gender] || providerDetail.gender}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh">
                            {providerDetail.dob}
                        </Descriptions.Item>
                        <Descriptions.Item label="Điểm uy tín">
                            <Tag color={providerDetail.reputationPoint >= 80 ? 'green' : providerDetail.reputationPoint >= 50 ? 'blue' : 'red'}>
                                {providerDetail.reputationPoint}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngân hàng" span={2}>
                            {bankLabels[providerDetail.bankId] || providerDetail.bankId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số tài khoản" span={2}>
                            <span className="font-mono">{providerDetail.bankNum}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái tài khoản">
                            <Tag color={providerDetail.accStatus === 'ACTIVE' ? 'green' : 'red'}>
                                {providerDetail.accStatus === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            )
        },
        {
            key: 'certificates',
            label: (
                <span>
                    Chứng chỉ ({certificates.length})
                </span>
            ),
            children: (
                <div className="py-4">
                    {certificates.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            Nhà cung cấp chưa nộp chứng chỉ nào
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {certificates.map(cert => (
                                <CertificateCard
                                    key={cert.certificateId}
                                    certificate={cert}
                                    onReviewSuccess={handleEvidenceReview}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'videos',
            label: (
                <span>
                    Video ({videos.length})
                </span>
            ),
            children: (
                <div className="py-4">
                    {videos.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            Nhà cung cấp chưa nộp video nào
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {videos.map(video => (
                                <VideoCard
                                    key={video.videoId}
                                    video={video}
                                    onReviewSuccess={handleEvidenceReview}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )
        }
    ];

    const canApprove = providerDetail.verificationStatus === 'PENDING';

    return (
        <>
            <Modal
                open={open}
                onCancel={onClose}
                footer={null}
                width={1200}
                centered
                title={
                    <div className="flex items-center justify-between pr-8">
                        <span>Chi tiết nhà cung cấp #{provider.providerId}</span>
                        <Tag color={statusColors[providerDetail.verificationStatus]}>
                            {statusLabels[providerDetail.verificationStatus]}
                        </Tag>
                    </div>
                }
            >
                <Spin spinning={loading}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={tabs}
                    />

                    {/* {canApprove && (
                        <>
                            <Divider />
                            <div className="flex justify-center gap-4 pb-4">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<CheckCircleOutlined />}
                                    onClick={handleApprove}
                                    loading={approving}
                                    className="min-w-[150px]"
                                >
                                    Duyệt nhà cung cấp
                                </Button>
                                <Button
                                    danger
                                    size="large"
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => setRejectModalOpen(true)}
                                    className="min-w-[150px]"
                                >
                                    Từ chối
                                </Button>
                            </div>
                        </>
                    )} */}
                </Spin>
            </Modal>

            <ProviderRejectModal
                open={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onConfirm={handleReject}
            />
        </>
    );
};

export default ProviderReviewModal;
