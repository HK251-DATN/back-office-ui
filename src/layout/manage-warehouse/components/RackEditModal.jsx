// src/layout/manage-warehouse/components/RackEditModal.jsx
import { Modal, Form, InputNumber, Select, Button, message, DatePicker, Alert } from 'antd';
import { useState, useEffect } from 'react';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';
import dayjs from 'dayjs';

const BASE_URL = API_URLS.STORAGE;

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'INACTIVE', label: 'Không hoạt động' },
    { value: 'FULL', label: 'Đầy' },
    { value: 'IN_MAINTAINANCE', label: 'Bảo trì' },
];

function RackEditModal({ open, onClose, onSuccess, storageTool }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [rack, setRack] = useState(null);

    useEffect(() => {
        if (open && storageTool) {
            // Load storage tool info
            form.setFieldsValue({
                status: storageTool.status,
                usagePercentage: storageTool.usagePercentage,
                lastMaintainanceDate: storageTool.lastMaintainanceDate
                    ? dayjs(storageTool.lastMaintainanceDate)
                    : null,
            });

            // Load rack info
            fetchRackInfo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, storageTool]);

    const fetchRackInfo = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/rack`, {
                params: { pageNum: 1, pageSize: 100 },
            });

            if (response.data.type === 'GOOD') {
                const foundRack = response.data.detail.find(
                    r => r.storageToolId === storageTool.storageToolId
                );
                if (foundRack) {
                    setRack(foundRack);
                    form.setFieldValue('numOfLevel', foundRack.numOfLevel);
                }
            }
        } catch (error) {
            console.error('Failed to fetch rack info:', error);
        }
    };

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            // Update storage tool
            const toolPayload = {
                status: values.status,
                usagePercentage: values.usagePercentage,
                lastMaintainanceDate: values.lastMaintainanceDate
                    ? values.lastMaintainanceDate.format('YYYY-MM-DD')
                    : null,
            };

            const toolResponse = await axios.put(
                `${BASE_URL}/api/storage-tool/${storageTool.storageToolId}`,
                toolPayload
            );

            if (toolResponse.data.type !== 'GOOD') {
                message.error(toolResponse.data.message || 'Cập nhật storage tool thất bại!');
                return;
            }

            // Update rack if numOfLevel changed
            if (rack && values.numOfLevel !== rack.numOfLevel) {
                const rackPayload = {
                    numOfLevel: values.numOfLevel,
                };

                const rackResponse = await axios.put(
                    `${BASE_URL}/api/rack/${rack.rackId}`,
                    rackPayload
                );

                if (rackResponse.data.type !== 'GOOD') {
                    message.warning('Cập nhật storage tool thành công nhưng cập nhật số tầng thất bại!');
                } else {
                    message.success('Cập nhật kệ thành công!');
                }
            } else {
                message.success('Cập nhật kệ thành công!');
            }

            form.resetFields();
            onSuccess?.();
            onClose();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={`Chỉnh sửa kệ - Storage Tool #${storageTool?.storageToolId}`}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={600}
            destroyOnClose
        >
            <Alert
                message="Thông tin"
                description={`Kho: Warehouse #${storageTool?.warehouseId} | Rack ID: ${rack?.rackId || 'Đang tải...'}`}
                type="info"
                style={{ marginBottom: 16 }}
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                autoComplete="off"
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Select placeholder="Chọn trạng thái" options={STATUS_OPTIONS} />
                    </Form.Item>

                    <Form.Item
                        label="Tỷ lệ sử dụng (%)"
                        name="usagePercentage"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tỷ lệ!' },
                            { type: 'number', min: 0, max: 100, message: 'Phải từ 0-100!' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            max={100}
                            addonAfter="%"
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    label="Ngày bảo trì lần cuối"
                    name="lastMaintainanceDate"
                >
                    <DatePicker
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày"
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item
                    label="Số tầng"
                    name="numOfLevel"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số tầng!' },
                        { type: 'number', min: 1, max: 20, message: 'Phải từ 1-20 tầng!' },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Số tầng của kệ"
                        min={1}
                        max={20}
                    />
                </Form.Item>

                <Alert
                    message="Lưu ý"
                    description="Thay đổi số tầng có thể yêu cầu tạo hoặc xóa các rack level. Vui lòng kiểm tra sau khi cập nhật."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button onClick={handleCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Cập nhật
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default RackEditModal;
