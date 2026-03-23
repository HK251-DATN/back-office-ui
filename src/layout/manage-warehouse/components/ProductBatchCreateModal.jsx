// src/components/warehouse/ProductBatchCreateModal.jsx
import { Modal, Form, Input, InputNumber, Select, Button, message } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';

const { TextArea } = Input;

const UNIT_OPTIONS = [
    { value: 'KILOGRAM', label: 'Kilogram (Kg)' },
    { value: 'GRAM', label: 'Gram (g)' },
    { value: 'LITER', label: 'Liter (L)' },
    { value: 'MILLILITER', label: 'Milliliter (mL)' },
];

function ProductBatchCreateModal({ open, onClose, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [providers, setProviders] = useState([]);

    useEffect(() => {
        if (open) {
            fetchProviders();
            form.resetFields();
        }
    }, [open, form]);

    const fetchProviders = async () => {
        try {
            // Replace with your actual provider endpoint
            const response = await axios.get('/api/providers');
            if (response.data.type === 'GOOD') {
                setProviders(response.data.detail);
            } else {
                setProviders([
                    { id: '1', name: 'Nhà cung cấp A' },
                    { id: '2', name: 'Nhà cung cấp B' },
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch providers:', error);
            // Mock providers if API fails
            setProviders([
                { id: '1', name: 'Nhà cung cấp A' },
                { id: '2', name: 'Nhà cung cấp B' },
            ]);
        }
    };

    const handleFinish = async (values) => {
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:9200/api/product-batch', values);

            if (response.data.type === 'GOOD') {
                message.success('Tạo product batch thành công!');
                form.resetFields();
                onSuccess?.();
                onClose();
            } else {
                message.error(response.data.message || 'Tạo product batch thất bại!');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Tạo Product Batch mới"
            open={open}
            onCancel={onClose}
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
                    label="Số lượng"
                    name="quantity"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số lượng!' },
                        { type: 'number', min: 0.01, message: 'Số lượng phải lớn hơn 0!' },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Nhập số lượng"
                        min={0}
                        step={0.01}
                    />
                </Form.Item>

                <Form.Item
                    label="Đơn vị"
                    name="unit"
                    rules={[{ required: true, message: 'Vui lòng chọn đơn vị!' }]}
                >
                    <Select placeholder="Chọn đơn vị" options={UNIT_OPTIONS} />
                </Form.Item>

                <Form.Item
                    label="Nhà cung cấp"
                    name="providerId"
                    rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp!' }]}
                >
                    <Select
                        placeholder="Chọn nhà cung cấp"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {providers.map(provider => (
                            <Select.Option key={provider.id} value={provider.id}>
                                {provider.name || `Provider ${provider.id}`}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Ghi chú"
                    name="note"
                    rules={[
                        { max: 500, message: 'Ghi chú không được quá 500 ký tự!' },
                    ]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Nhập ghi chú về batch này..."
                        showCount
                        maxLength={500}
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Tạo Product Batch
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ProductBatchCreateModal;