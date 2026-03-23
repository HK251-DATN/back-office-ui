// src/components/warehouse/ProductDetailCreateModal.jsx
import { Modal, Form, Input, InputNumber, Select, Button, message } from 'antd';
import axios from 'axios';
import { useState, useEffect } from 'react';

const UNIT_OPTIONS = [
    { value: 'KILOGRAM', label: 'Kilogram (Kg)' },
    { value: 'GRAM', label: 'Gram (g)' },
    { value: 'LITER', label: 'Liter (L)' },
    { value: 'MILLILITER', label: 'Milliliter (mL)' },
];

function ProductDetailCreateModal({ open, onClose, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [batches, setBatches] = useState([]);
    const [productGenerals, setProductGenerals] = useState([]);

    useEffect(() => {
        if (open) {
            fetchBatches();
            fetchProductGenerals();
            form.resetFields();
        }
    }, [open, form]);

    const fetchBatches = async () => {
        try {
            const response = await axios.get('http://localhost:9200/api/product-batch');
            if (response.data.type === 'GOOD') {
                setBatches(response.data.detail || []);
            }
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        }
    };

    const fetchProductGenerals = async () => {
        try {
            const response = await axios.get('http://localhost:9200/api/product-general?pageSize=9999');
            if (response.data.type === 'GOOD') {
                setProductGenerals(response.data.detail || []);
            }
        } catch (error) {
            console.error('Failed to fetch product generals:', error);
        }
    };

    const handleFinish = async (values) => {
        setLoading(true);

        try {
            // Clean up null values
            const payload = {
                batchId: values.batchId,
                prodGenId: values.prodGenId,
                unit: values.unit,
                unitQuantity: values.unitQuantity.toString(),
                storageToolId: values.storageToolId || null,
                numOfStar: values.numOfStar || null,
                price: values.price,
                status: 'STORED',
            };

            const response = await axios.post('http://localhost:9200/api/product-detail/process-batch', payload);

            if (response.data.type === 'GOOD') {
                message.success('Xử lý batch thành công!');
                form.resetFields();
                onSuccess?.();
                onClose();
            } else {
                message.error(response.data.message || 'Xử lý batch thất bại!');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Xử lý Product Batch"
            open={open}
            onCancel={onClose}
            footer={null}
            width={700}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="Product Batch"
                    name="batchId"
                    rules={[{ required: true, message: 'Vui lòng chọn batch!' }]}
                >
                    <Select
                        placeholder="Chọn batch cần xử lý"
                        showSearch
                        optionFilterProp="children"
                    >
                        {batches.map(batch => (
                            <Select.Option key={batch.batchId} value={batch.batchId.toString()}>
                                Batch #{batch.batchId} - {batch.quantity} {batch.unit} - {batch.note}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Product General"
                    name="prodGenId"
                    rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
                >
                    <Select
                        placeholder="Chọn sản phẩm"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {productGenerals.map(product => (
                            <Select.Option key={product.prodGenId} value={product.prodGenId.toString()}>
                                {product.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item
                        label="Đơn vị"
                        name="unit"
                        rules={[{ required: true, message: 'Vui lòng chọn đơn vị!' }]}
                    >
                        <Select placeholder="Chọn đơn vị" options={UNIT_OPTIONS} />
                    </Form.Item>

                    <Form.Item
                        label="Số lượng đơn vị"
                        name="unitQuantity"
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
                </div>

                <Form.Item
                    label="Giá (VNĐ)"
                    name="price"
                    rules={[
                        { required: true, message: 'Vui lòng nhập giá!' },
                        { type: 'number', min: 0, message: 'Giá phải lớn hơn hoặc bằng 0!' },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Nhập giá sản phẩm"
                        min={0}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                </Form.Item>

                <Form.Item
                    label="Storage Tool ID (Optional)"
                    name="storageToolId"
                >
                    <Input placeholder="Nhập storage tool ID (nếu có)" />
                </Form.Item>

                <Form.Item
                    label="Số sao đánh giá (Optional)"
                    name="numOfStar"
                    rules={[
                        { type: 'number', min: 1, max: 5, message: 'Số sao từ 1 đến 5!' },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Nhập số sao (1-5)"
                        min={1}
                        max={5}
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Xử lý Batch
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ProductDetailCreateModal;