// src/components/warehouse/ProductBatchCreateModal.jsx
import { Modal, Form, Input, InputNumber, Select, Button, message, DatePicker } from 'antd';
import { useState, useEffect } from 'react';
import { createProductBatch } from '../../../services/productBatchService';
import { getSubSubcategories } from '../../../services/categoryService';

const { TextArea } = Input;

const UNIT_OPTIONS = [
    { value: 'KILOGRAM', label: 'Kilogram (Kg)' },
    { value: 'GRAM', label: 'Gram (g)' },
    { value: 'LITER', label: 'Liter (L)' },
    { value: 'MILLILITER', label: 'Milliliter (mL)' },
];

const PROCESS_STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'EXPIRED', label: 'Hết hạn' },
];

function ProductBatchCreateModal({ open, onClose, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [providers, setProviders] = useState([]);
    const [subSubcategories, setSubSubcategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                // Mock providers for now - replace with actual endpoint when available
                setProviders([
                    { id: 1, name: 'Nhà cung cấp A' },
                    { id: 2, name: 'Nhà cung cấp B' },
                    { id: 3, name: 'Nhà cung cấp C' },
                ]);
            } catch (error) {
                console.error('Failed to fetch providers:', error);
            }
        };

        const fetchSubSubcategories = async () => {
            try {
                const response = await getSubSubcategories();
                if (response.data.type === 'GOOD') {
                    setSubSubcategories(response.data.detail);
                }
            } catch (error) {
                console.error('Failed to fetch sub-subcategories:', error);
                message.error('Không thể tải danh mục sản phẩm');
            }
        };

        if (open) {
            fetchProviders();
            fetchSubSubcategories();
            form.resetFields();
            setSelectedCategory(null);
        }
    }, [open, form]);

    const handleCategoryChange = (categoryId) => {
        const category = subSubcategories.find(cat => cat.subSubcategoryId === categoryId);
        setSelectedCategory(category);

        // Auto-calculate expiredAt based on avgShelfDays
        if (category?.avgShelfDays) {
            const receivedAt = form.getFieldValue('receivedAt');
            if (receivedAt) {
                const expiredAt = receivedAt.clone().add(category.avgShelfDays, 'days');
                form.setFieldValue('expiredAt', expiredAt);
            }
        }
    };

    const handleReceivedAtChange = (date) => {
        // Auto-calculate expiredAt when receivedAt changes
        if (date && selectedCategory?.avgShelfDays) {
            const expiredAt = date.clone().add(selectedCategory.avgShelfDays, 'days');
            form.setFieldValue('expiredAt', expiredAt);
        }
    };

    const handleFinish = async (values) => {
        setLoading(true);

        try {
            const payload = {
                quantity: values.quantity,
                unit: values.unit,
                note: values.note || '',
                receivedAt: values.receivedAt.format('YYYY-MM-DDTHH:mm:ss'),
                expiredAt: values.expiredAt.format('YYYY-MM-DDTHH:mm:ss'),
                providerId: values.providerId,
                subSubcategoryId: values.subSubcategoryId,
                processStatus: values.processStatus,
            };

            const response = await createProductBatch(payload);

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
                    label="Danh mục sản phẩm"
                    name="subSubcategoryId"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                    extra={selectedCategory?.avgShelfDays ? (
                        <span style={{ color: '#1890ff' }}>
                            ℹ️ Số ngày lưu kho trung bình: <strong>{selectedCategory.avgShelfDays} ngày</strong>
                        </span>
                    ) : null}
                >
                    <Select
                        placeholder="Chọn danh mục sản phẩm"
                        showSearch
                        optionFilterProp="label"
                        onChange={handleCategoryChange}
                        options={subSubcategories.map((cat) => ({
                            value: cat.subSubcategoryId,
                            label: cat.name,
                        }))}
                    />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                        label="Trạng thái xử lý"
                        name="processStatus"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                        initialValue="PENDING"
                    >
                        <Select placeholder="Chọn trạng thái" options={PROCESS_STATUS_OPTIONS} />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item
                        label="Ngày nhận hàng"
                        name="receivedAt"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày nhận!' }]}
                    >
                        <DatePicker
                            showTime
                            format="DD/MM/YYYY HH:mm"
                            placeholder="Chọn ngày nhận"
                            style={{ width: '100%' }}
                            onChange={handleReceivedAtChange}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Ngày hết hạn"
                        name="expiredAt"
                        rules={[
                            { required: true, message: 'Vui lòng chọn ngày hết hạn!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const receivedAt = getFieldValue('receivedAt');
                                    if (!value || !receivedAt || value.isAfter(receivedAt)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Ngày hết hạn phải sau ngày nhận hàng!'));
                                },
                            }),
                        ]}
                        extra={selectedCategory?.avgShelfDays ? (
                            <span style={{ color: '#52c41a' }}>
                                ✓ Tự động tính dựa trên {selectedCategory.avgShelfDays} ngày lưu kho
                            </span>
                        ) : null}
                    >
                        <DatePicker
                            showTime
                            format="DD/MM/YYYY HH:mm"
                            placeholder="Chọn ngày hết hạn"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </div>

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