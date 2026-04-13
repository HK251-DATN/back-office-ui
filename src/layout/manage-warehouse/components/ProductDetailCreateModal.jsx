// src/components/warehouse/ProductDetailCreateModal.jsx
import { Modal, Form, InputNumber, Select, Button, message, Alert, Divider } from 'antd';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import axiosInstance from '../../../services/axiosInstance';

const STATUS_OPTIONS = [
    { value: 'STORED', label: 'Đã lưu kho' },
    { value: 'EXPIRED', label: 'Hết hạn' },
    { value: 'PICKED', label: 'Đã chọn' },
    { value: 'IN_TRANSIT', label: 'Đang vận chuyển' },
    { value: 'DELIVERED', label: 'Đã giao' },
    { value: 'RETURNED', label: 'Đã trả lại' },
    { value: 'DISPOSED', label: 'Đã hủy' },
];

const UNIT_LABELS = {
    KILOGRAM: 'Kg',
    GRAM: 'g',
    LITER: 'L',
    MILLILITER: 'mL',
};

function ProductDetailCreateModal({ open, onClose, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [suitableProducts, setSuitableProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [subSubCategories, setSubSubCategories] = useState([]);
    const [storageTools, setStorageTools] = useState([]);
    const [calculationPreview, setCalculationPreview] = useState('');

    useEffect(() => {
        if (open) {
            fetchBatches();
            fetchStorageTools();
            fetchProductBatchCategory();
            form.resetFields();
            setSelectedBatch(null);
            setSuitableProducts([]);
            setSelectedProduct(null);
            setCalculationPreview('');
        }
    }, [open, form]);

    const fetchProductBatchCategory = async () => {
        try {
            const response = await axiosInstance.get(`${API_URLS.MAIN}/api/categories/sub-subcategories`)

            if (response.data.type === 'GOOD') {
                setSubSubCategories(response.data.detail || null);

                console.log(response.data.detail);
            }
        } catch (error) {
            console.error('Failed to fetch sub-subcategory', error);
        }
    }

    const getSubSubCategoryName = (id) => {
        const subsubcategory = subSubCategories.find(s => s.subSubcategoryId === id);

        return subsubcategory.name || "";
    }

    const fetchBatches = async () => {
        try {
            const response = await axios.get(`${API_URLS.STORAGE}/api/product-batch?pageNum=1&pageSize=100`);
            if (response.data.type === 'GOOD') {
                setBatches(response.data.detail || []);
            } else if (response.data.type === 'SKIP_AS_GOOD') {
                setBatches([]);
            }
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        }
    };

    const fetchStorageTools = async () => {
        try {
            const response = await axios.get(`${API_URLS.STORAGE}/api/storage-tool?pageNum=1&pageSize=100`);
            if (response.data.type === 'GOOD') {
                setStorageTools(response.data.detail || []);
            }
        } catch (error) {
            console.error('Failed to fetch storage tools:', error);
            // Provide mock storage tools if API fails
            setStorageTools([
                { storageToolId: 1, toolType: 'RACK', usagePercentage: 30 },
                { storageToolId: 2, toolType: 'FRIDGE', usagePercentage: 45 },
            ]);
        }
    };

    const handleBatchChange = async (batchId) => {
        const batch = batches.find(b => b.batchId === batchId);
        setSelectedBatch(batch);
        setSuitableProducts([]);
        setSelectedProduct(null);
        setCalculationPreview('');
        form.setFieldValue('prodGenId', undefined);

        if (!batchId) return;

        try {
            const response = await axios.get(`${API_URLS.STORAGE}/api/product-general/suitable-for-batch/${batchId}`);
            if (response.data.type === 'GOOD') {
                setSuitableProducts(response.data.detail);
            } else if (response.data.type === 'SKIP_AS_GOOD') {
                setSuitableProducts([]);
                message.warning('Không tìm thấy sản phẩm phù hợp với batch này');
            }
        } catch (error) {
            message.error('Không thể tải danh sách sản phẩm phù hợp');
        }
    };

    const handleProductChange = (prodGenId) => {
        const product = suitableProducts.find(p => p.prodGenId === prodGenId);
        setSelectedProduct(product);

        if (selectedBatch && product) {
            calculatePreview(selectedBatch, product);
        } else {
            setCalculationPreview('');
        }
    };

    const calculatePreview = (batch, product) => {
        // Convert batch to base unit
        let batchInBaseUnit = batch.quantity;
        if (batch.unit === 'KILOGRAM' && product.unit === 'GRAM') {
            batchInBaseUnit = batch.quantity * 1000;
        } else if (batch.unit === 'LITER' && product.unit === 'MILLILITER') {
            batchInBaseUnit = batch.quantity * 1000;
        }

        // Convert product to base unit if needed
        let productInBaseUnit = product.unitQuantity;
        if (product.unit === 'KILOGRAM' && batch.unit === 'KILOGRAM') {
            productInBaseUnit = product.unitQuantity;
        } else if (product.unit === 'GRAM' && batch.unit === 'KILOGRAM') {
            productInBaseUnit = product.unitQuantity;
            batchInBaseUnit = batch.quantity * 1000;
        }

        const count = Math.floor(batchInBaseUnit / productInBaseUnit);
        setCalculationPreview(`Batch này sẽ tạo ra khoảng ${count} sản phẩm "${product.name}"`);
    };

    const handleFinish = async (values) => {
        setLoading(true);

        try {
            const payload = {
                status: values.status,
                price: values.price,
                numOfStar: values.numOfStar || 0,
                storageToolId: values.storageToolId,
                batchId: values.batchId,
                prodGenId: values.prodGenId,
            };

            const response = await axios.post(`${API_URLS.STORAGE}/api/product-detail/process-batch`, payload);

            if (response.data.type === 'GOOD') {
                const createdCount = Array.isArray(response.data.detail) ? response.data.detail.length : 0;
                message.success(`Xử lý batch thành công! Đã tạo ${createdCount} sản phẩm.`);
                form.resetFields();
                setSelectedBatch(null);
                setSuitableProducts([]);
                setSelectedProduct(null);
                setCalculationPreview('');
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
                        onChange={handleBatchChange}
                    >
                        {batches.map(batch => (
                            <Select.Option key={batch.batchId} value={batch.batchId}>
                                Batch #{batch.batchId} - {batch.quantity} {UNIT_LABELS[batch.unit] || batch.unit} - {getSubSubCategoryName(batch.subSubcategoryId)}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {selectedBatch && (
                    <Alert
                        message="Thông tin Batch"
                        description={
                            <div>
                                <div><strong>Số lượng:</strong> {selectedBatch.quantity} {UNIT_LABELS[selectedBatch.unit]}</div>
                                <div><strong>Ngày nhận:</strong> {selectedBatch.receivedAt ? dayjs(selectedBatch.receivedAt).format('DD/MM/YYYY HH:mm') : '-'}</div>
                                <div><strong>Hết hạn:</strong> {selectedBatch.expiredAt ? dayjs(selectedBatch.expiredAt).format('DD/MM/YYYY HH:mm') : '-'}</div>
                            </div>
                        }
                        type="info"
                        style={{ marginBottom: 16 }}
                    />
                )}

                <Form.Item
                    label="Product General (Sản phẩm)"
                    name="prodGenId"
                    rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
                >
                    <Select
                        placeholder={selectedBatch ? 'Chọn sản phẩm' : 'Chọn batch trước'}
                        showSearch
                        optionFilterProp="children"
                        onChange={handleProductChange}
                        disabled={!selectedBatch || suitableProducts.length === 0}
                    >
                        {suitableProducts.map(product => (
                            <Select.Option key={product.prodGenId} value={product.prodGenId}>
                                {product.name} - {product.unitQuantity} {UNIT_LABELS[product.unit] || product.unit}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {calculationPreview && (
                    <Alert
                        message="Dự tính"
                        description={calculationPreview}
                        type="success"
                        style={{ marginBottom: 16 }}
                    />
                )}

                <Divider />

                <Form.Item
                    label="Giá mỗi sản phẩm (VNĐ)"
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
                    label="Vị trí lưu kho (Storage Tool)"
                    name="storageToolId"
                    rules={[{ required: false, message: 'Vui lòng chọn vị trí lưu kho!' }]}
                >
                    <Select placeholder="Chọn vị trí lưu kho">
                        {storageTools.map(tool => (
                            <Select.Option key={tool.storageToolId} value={tool.storageToolId}>
                                {tool.toolType} #{tool.storageToolId} - Đã dùng {tool.usagePercentage}%
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        initialValue="STORED"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Select placeholder="Chọn trạng thái" options={STATUS_OPTIONS} />
                    </Form.Item>

                    <Form.Item
                        label="Số sao đánh giá"
                        name="numOfStar"
                        initialValue={0}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="0-5"
                            min={0}
                            max={5}
                        />
                    </Form.Item>
                </div>

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
