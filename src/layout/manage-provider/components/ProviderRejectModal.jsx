import { useState } from 'react';
import { Modal, Input } from 'antd';

const { TextArea } = Input;

const ProviderRejectModal = ({ open, onClose, onConfirm }) => {
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleOk = async () => {
        setSubmitting(true);
        try {
            await onConfirm?.(note);
            setNote('');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setNote('');
        onClose?.();
    };

    return (
        <Modal
            open={open}
            title="Từ chối nhà cung cấp"
            onCancel={handleCancel}
            onOk={handleOk}
            okText="Xác nhận từ chối"
            cancelText="Hủy"
            okButtonProps={{
                danger: true,
                loading: submitting
            }}
        >
            <div className="py-4">
                <p className="mb-3 text-gray-700">
                    Bạn có chắc chắn muốn từ chối nhà cung cấp này?
                </p>
                <p className="mb-2 text-gray-700 text-sm">
                    Lý do từ chối (tùy chọn):
                </p>
                <TextArea
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Chứng chỉ không hợp lệ, thông tin không đầy đủ..."
                />
                <p className="mt-2 text-xs text-gray-500">
                    Lưu ý: Nhà cung cấp sẽ nhận được thông báo về quyết định từ chối này.
                </p>
            </div>
        </Modal>
    );
};

export default ProviderRejectModal;
