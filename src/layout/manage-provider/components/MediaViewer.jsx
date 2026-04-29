import { Modal, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const MediaViewer = ({ open, url, title, onClose }) => {
    if (!url) return null;

    const getFileType = (url) => {
        const extension = url.split('.').pop().toLowerCase().split('?')[0];

        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)) {
            return 'image';
        }
        if (extension === 'pdf') {
            return 'pdf';
        }
        if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) {
            return 'video';
        }
        return 'unknown';
    };

    const fileType = getFileType(url);

    const handleDownload = () => {
        window.open(url, '_blank');
    };

    const renderContent = () => {
        switch (fileType) {
            case 'image':
                return (
                    <div className="flex justify-center items-center bg-gray-100 p-4 rounded">
                        <img
                            src={url}
                            alt={title}
                            className="max-w-full max-h-[70vh] object-contain"
                        />
                    </div>
                );

            case 'pdf':
                return (
                    <div className="w-full h-[70vh] bg-gray-100 rounded">
                        <iframe
                            src={url}
                            className="w-full h-full border-0 rounded"
                            title={title}
                        />
                    </div>
                );

            case 'video':
                return (
                    <div className="flex justify-center items-center bg-black p-4 rounded">
                        <video
                            controls
                            className="max-w-full max-h-[70vh]"
                            src={url}
                        >
                            Trình duyệt không hỗ trợ video.
                        </video>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">
                            Không thể hiển thị định dạng file này trong trình duyệt
                        </p>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleDownload}
                        >
                            Tải xuống để xem
                        </Button>
                    </div>
                );
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={title}
            width={900}
            centered
            footer={[
                <Button
                    key="download"
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                >
                    Tải xuống
                </Button>,
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>
            ]}
        >
            {renderContent()}
        </Modal>
    );
};

export default MediaViewer;
