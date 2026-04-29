import { useState } from 'react';
import { Card, Tag, Button, Space, Descriptions, Modal, Input, message } from 'antd';
import { VideoCameraOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { reviewVideo } from '../../../services/providerService';

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

const videoTypeLabels = {
    GARDEN_FARM: 'Vườn/trang trại',
    PROCESSING: 'Quy trình chế biến',
    STORAGE: 'Kho bảo quản',
    FACILITY: 'Cơ sở vật chất',
    OTHER: 'Khác'
};

const VideoCard = ({ video, onReviewSuccess }) => {
    const [reviewing, setReviewing] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [reviewNote, setReviewNote] = useState('');

    const handleApprove = async () => {
        setReviewing(true);
        try {
            const response = await reviewVideo(video.videoId, {
                status: 'APPROVED',
                reviewNote: ''
            });

            if (response.data?.type === 'GOOD') {
                message.success('Đã duyệt video');
                onReviewSuccess?.();
            } else {
                message.error('Không thể duyệt video');
            }
        } catch (error) {
            console.error('Error approving video:', error);
            message.error('Lỗi khi duyệt video');
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
            const response = await reviewVideo(video.videoId, {
                status: 'REJECTED',
                reviewNote: reviewNote.trim()
            });

            if (response.data?.type === 'GOOD') {
                message.success('Đã từ chối video');
                setRejectModalOpen(false);
                setReviewNote('');
                onReviewSuccess?.();
            } else {
                message.error('Không thể từ chối video');
            }
        } catch (error) {
            console.error('Error rejecting video:', error);
            message.error('Lỗi khi từ chối video');
        } finally {
            setReviewing(false);
        }
    };

    const isPending = video.status === 'PENDING';

    return (
        <>
            <Card
                size="small"
                title={
                    <div className="flex items-center justify-between">
                        <Space>
                            <VideoCameraOutlined />
                            <span>Video #{video.videoId}</span>
                            <Tag color={statusColors[video.status]}>
                                {statusLabels[video.status]}
                            </Tag>
                        </Space>
                    </div>
                }
            >
                <div className="mb-4">
                    <video
                        controls
                        className="w-full max-h-[400px] rounded-lg bg-black"
                        src={video.videoUrl}
                        preload="metadata"
                    >
                        Trình duyệt không hỗ trợ video.
                    </video>
                </div>

                <Descriptions column={1} size="small">
                    <Descriptions.Item label="Loại video">
                        <Tag color="purple">
                            {videoTypeLabels[video.videoType] || video.videoType}
                        </Tag>
                    </Descriptions.Item>
                    {video.description && (
                        <Descriptions.Item label="Mô tả">
                            {video.description}
                        </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Ngày tải lên">
                        {new Date(video.createdAt).toLocaleString('vi-VN')}
                    </Descriptions.Item>
                    {video.reviewedBy && (
                        <>
                            <Descriptions.Item label="Người duyệt">
                                ID: {video.reviewedBy}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian duyệt">
                                {new Date(video.reviewedAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                        </>
                    )}
                    {video.reviewNote && (
                        <Descriptions.Item label="Ghi chú">
                            <div className="text-red-600">{video.reviewNote}</div>
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
                title="Từ chối video"
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
                    <p className="mb-2 text-gray-700">Vui lòng nhập lý do từ chối video này:</p>
                    <TextArea
                        rows={4}
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Ví dụ: Video quá tối, không rõ ràng, không đúng yêu cầu..."
                    />
                </div>
            </Modal>
        </>
    );
};

export default VideoCard;
