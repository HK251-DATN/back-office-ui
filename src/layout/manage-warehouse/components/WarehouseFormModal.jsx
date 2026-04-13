// src/layout/manage-warehouse/components/WarehouseFormModal.jsx
import { Modal, Form, Input, InputNumber, Button, message } from 'antd';
import { useState, useEffect } from 'react';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';

const { TextArea } = Input;
const BASE_URL = API_URLS.STORAGE;

function WarehouseFormModal({ open, onClose, onSuccess, warehouse }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const isEdit = !!warehouse;

    useEffect(() => {
        if (open && warehouse) {
            form.setFieldsValue({
                address: warehouse.address,
                usagePercentage: warehouse.usagePercentage,
                numOfFridge: warehouse.numOfFridge,
                numOfRack: warehouse.numOfRack,
            });
        } else if (open && !warehouse) {
            form.resetFields();
        }
    }, [open, warehouse, form]);

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {
                address: values.address,
                usagePercentage: values.usagePercentage || 0,
                numOfFridge: values.numOfFridge || 0,
                numOfRack: values.numOfRack || 0,
            };

            let response;
            if (isEdit) {
                response = await axios.put(
                    `${BASE_URL}/api/warehouse/${warehouse.warehouseId}`,
                    payload
                );
            } else {
                response = await axios.post(`${BASE_URL}/api/warehouse`, payload);
            }

            if (response.data.type === 'GOOD') {
                message.success(isEdit ? 'Cập nhật kho thành công!' : 'Tạo kho thành công!');
                form.resetFields();
                onSuccess?.();
                onClose();
            } else {
                message.error(response.data.message || 'Thao tác thất bại!');
            }
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
            title={isEdit ? `Chỉnh sửa kho #${warehouse?.warehouseId}` : 'Tạo kho mới'}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={600}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="Địa chỉ kho"
                    name="address"
                    rules={[
                        { required: true, message: 'Vui lòng nhập địa chỉ!' },
                        { min: 10, message: 'Địa chỉ phải có ít nhất 10 ký tự!' },
                        { max: 500, message: 'Địa chỉ không được quá 500 ký tự!' },
                    ]}
                >
                    <TextArea
                        rows={3}
                        placeholder="Ví dụ: 123 Đường ABC, Quận XYZ, TP. HCM"
                        showCount
                        maxLength={500}
                    />
                </Form.Item>

                <Form.Item
                    label="Tỷ lệ sử dụng (%)"
                    name="usagePercentage"
                    initialValue={0}
                    rules={[
                        { required: true, message: 'Vui lòng nhập tỷ lệ sử dụng!' },
                        { type: 'number', min: 0, max: 100, message: 'Tỷ lệ phải từ 0 đến 100!' },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="0"
                        min={0}
                        max={100}
                        addonAfter="%"
                    />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item
                        label="Số tủ lạnh"
                        name="numOfFridge"
                        initialValue={0}
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tủ lạnh!' },
                            { type: 'number', min: 0, message: 'Số tủ lạnh phải >= 0!' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="0"
                            min={0}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Số kệ"
                        name="numOfRack"
                        initialValue={0}
                        rules={[
                            { required: true, message: 'Vui lòng nhập số kệ!' },
                            { type: 'number', min: 0, message: 'Số kệ phải >= 0!' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="0"
                            min={0}
                        />
                    </Form.Item>
                </div>

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button onClick={handleCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {isEdit ? 'Cập nhật' : 'Tạo kho'}
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default WarehouseFormModal;
