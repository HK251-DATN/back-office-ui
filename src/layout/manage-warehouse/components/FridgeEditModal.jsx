// src/layout/manage-warehouse/components/FridgeEditModal.jsx
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

function FridgeEditModal({ open, onClose, onSuccess, storageTool }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fridge, setFridge] = useState(null);

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

            // Load fridge info
            fetchFridgeInfo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, storageTool]);

    const fetchFridgeInfo = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/fridge`, {
                params: { pageNum: 1, pageSize: 100 },
            });

            if (response.data.type === 'GOOD') {
                const foundFridge = response.data.detail.find(
                    f => f.storageToolId === storageTool.storageToolId
                );
                if (foundFridge) {
                    setFridge(foundFridge);
                    form.setFieldsValue({
                        curTemp: foundFridge.curTemp,
                        minTemp: foundFridge.minTemp,
                        maxTemp: foundFridge.maxTemp,
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch fridge info:', error);
        }
    };

    const handleFinish = async (values) => {
        setLoading(true);

        // Validate temperatures
        if (values.minTemp >= values.maxTemp) {
            message.error('Nhiệt độ tối thiểu phải nhỏ hơn nhiệt độ tối đa!');
            setLoading(false);
            return;
        }

        if (values.curTemp < values.minTemp || values.curTemp > values.maxTemp) {
            message.error('Nhiệt độ hiện tại phải nằm trong khoảng tối thiểu và tối đa!');
            setLoading(false);
            return;
        }

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

            // Update fridge
            if (fridge) {
                const fridgePayload = {
                    curTemp: values.curTemp,
                    minTemp: values.minTemp,
                    maxTemp: values.maxTemp,
                };

                const fridgeResponse = await axios.put(
                    `${BASE_URL}/api/fridge/${fridge.fridgeId}`,
                    fridgePayload
                );

                if (fridgeResponse.data.type !== 'GOOD') {
                    message.warning('Cập nhật storage tool thành công nhưng cập nhật tủ lạnh thất bại!');
                } else {
                    message.success('Cập nhật tủ lạnh thành công!');
                }
            } else {
                message.success('Cập nhật storage tool thành công!');
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
            title={`Chỉnh sửa tủ lạnh - Storage Tool #${storageTool?.storageToolId}`}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={600}
            destroyOnClose
        >
            <Alert
                message="Thông tin"
                description={`Kho: Warehouse #${storageTool?.warehouseId} | Fridge ID: ${fridge?.fridgeId || 'Đang tải...'}`}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <Form.Item
                        label="Nhiệt độ tối thiểu (°C)"
                        name="minTemp"
                        rules={[{ required: true, message: 'Nhập nhiệt độ tối thiểu!' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="-10"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Nhiệt độ hiện tại (°C)"
                        name="curTemp"
                        rules={[{ required: true, message: 'Nhập nhiệt độ hiện tại!' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="-5"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Nhiệt độ tối đa (°C)"
                        name="maxTemp"
                        rules={[{ required: true, message: 'Nhập nhiệt độ tối đa!' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="0"
                        />
                    </Form.Item>
                </div>

                <Alert
                    message="Lưu ý"
                    description="Nhiệt độ hiện tại phải nằm trong khoảng min-max"
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

export default FridgeEditModal;
