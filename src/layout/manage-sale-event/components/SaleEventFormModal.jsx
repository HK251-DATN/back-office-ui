import { useState, useEffect } from 'react';
import {
    Modal, Form, Input, InputNumber, Select, DatePicker, TimePicker,
    Upload, Button, Image, message, Divider,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    createSaleEvent,
    updateSaleEvent,
    uploadBanner,
    getSaleEventById,
} from '../../../services/saleEventService';

const { TextArea } = Input;
const { Option } = Select;

function SaleEventFormModal({ open, eventId, onClose, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [bannerFile, setBannerFile] = useState(null);
    const [currentImg, setCurrentImg] = useState(null);
    const isEdit = !!eventId;

    useEffect(() => {
        if (!open) {
            form.resetFields();
            setBannerFile(null);
            setCurrentImg(null);
            return;
        }
        if (isEdit && eventId) {
            loadEvent(eventId);
        }
    }, [open, eventId]);

    const loadEvent = async (id) => {
        try {
            const response = await getSaleEventById(id);
            if (response.data?.type === 'GOOD') {
                const ev = response.data.detail;
                setCurrentImg(ev.img);
                form.setFieldsValue({
                    name: ev.name,
                    description: ev.description,
                    displayPriority: ev.displayPriority,
                    activeYn: ev.activeYn || 'N',
                    enabledYn: ev.enabledYn || 'N',
                    beginDate: ev.beginDate ? dayjs(ev.beginDate) : null,
                    endDate: ev.endDate ? dayjs(ev.endDate) : null,
                    beginTime: ev.beginTime ? dayjs(ev.beginTime, 'HH:mm:ss') : null,
                    endTime: ev.endTime ? dayjs(ev.endTime, 'HH:mm:ss') : null,
                });
            }
        } catch {
            message.error('Không thể tải thông tin sự kiện');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const payload = {
                name: values.name,
                description: values.description || null,
                displayPriority: values.displayPriority || 1,
                activeYn: values.activeYn || 'N',
                enabledYn: values.enabledYn || 'N',
                beginDate: values.beginDate ? values.beginDate.format('YYYY-MM-DDTHH:mm:ss') : null,
                endDate: values.endDate ? values.endDate.format('YYYY-MM-DDTHH:mm:ss') : null,
                beginTime: values.beginTime ? values.beginTime.format('HH:mm:ss') : null,
                endTime: values.endTime ? values.endTime.format('HH:mm:ss') : null,
            };

            let savedEventId = eventId;
            let response;

            if (isEdit) {
                response = await updateSaleEvent(eventId, payload);
            } else {
                response = await createSaleEvent(payload);
            }

            const type = response.data?.type;
            if (type !== 'GOOD') {
                message.error(response.data?.message || 'Lưu sự kiện thất bại');
                return;
            }

            savedEventId = response.data.detail.saleEventId;

            if (bannerFile) {
                try {
                    await uploadBanner(savedEventId, bannerFile);
                } catch {
                    message.warning('Lưu sự kiện thành công nhưng tải ảnh banner thất bại');
                }
            }

            message.success(isEdit ? 'Cập nhật sự kiện thành công' : 'Tạo sự kiện thành công');
            onSuccess(savedEventId);
        } catch (err) {
            if (err?.errorFields) return;
            message.error('Lưu sự kiện thất bại');
        } finally {
            setLoading(false);
        }
    };

    const beforeUpload = (file) => {
        setBannerFile(file);
        return false;
    };

    return (
        <Modal
            title={isEdit ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText={isEdit ? 'Lưu thay đổi' : 'Tạo sự kiện'}
            cancelText="Hủy"
            width={640}
            destroyOnClose
        >
            <Form form={form} layout="vertical" preserve={false}>
                <Form.Item name="name" label="Tên sự kiện" rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện' }]}>
                    <Input placeholder="Nhập tên sự kiện" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={3} placeholder="Mô tả sự kiện" />
                </Form.Item>

                <div className="flex gap-4">
                    <Form.Item name="displayPriority" label="Độ ưu tiên hiển thị" style={{ flex: 1 }}>
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
                    </Form.Item>

                    <Form.Item name="activeYn" label="Trạng thái kích hoạt" style={{ flex: 1 }}>
                        <Select>
                            <Option value="Y">Kích hoạt (Y)</Option>
                            <Option value="N">Không kích hoạt (N)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="enabledYn" label="Hiển thị cho khách" style={{ flex: 1 }}>
                        <Select>
                            <Option value="Y">Hiển thị (Y)</Option>
                            <Option value="N">Ẩn (N)</Option>
                        </Select>
                    </Form.Item>
                </div>

                <div className="flex gap-4">
                    <Form.Item name="beginDate" label="Ngày bắt đầu" style={{ flex: 1 }}>
                        <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
                    </Form.Item>

                    <Form.Item name="endDate" label="Ngày kết thúc" style={{ flex: 1 }}>
                        <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
                    </Form.Item>
                </div>

                <div className="flex gap-4">
                    <Form.Item name="beginTime" label="Giờ bắt đầu hàng ngày" style={{ flex: 1 }}>
                        <TimePicker style={{ width: '100%' }} format="HH:mm" />
                    </Form.Item>

                    <Form.Item name="endTime" label="Giờ kết thúc hàng ngày" style={{ flex: 1 }}>
                        <TimePicker style={{ width: '100%' }} format="HH:mm" />
                    </Form.Item>
                </div>

                <Divider />

                <Form.Item label="Ảnh banner">
                    {currentImg && !bannerFile && (
                        <div style={{ marginBottom: 12 }}>
                            <p style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Banner hiện tại:</p>
                            <Image src={currentImg} height={120} style={{ objectFit: 'cover', borderRadius: 6 }} />
                        </div>
                    )}
                    {bannerFile && (
                        <div style={{ marginBottom: 12 }}>
                            <p style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                                Ảnh mới đã chọn: <strong>{bannerFile.name}</strong>
                            </p>
                        </div>
                    )}
                    <Upload beforeUpload={beforeUpload} maxCount={1} accept="image/*" showUploadList={false}>
                        <Button icon={<UploadOutlined />}>
                            {bannerFile ? 'Đổi ảnh banner' : 'Chọn ảnh banner'}
                        </Button>
                    </Upload>
                    <p style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
                        Ảnh sẽ được tải lên sau khi lưu sự kiện.
                    </p>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default SaleEventFormModal;
