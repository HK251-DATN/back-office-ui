import { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, message, Descriptions } from 'antd';
import { getSaleProduct, updateSaleProduct } from '../../../services/saleEventService';

function EditProductModal({ open, saleEventId, product, onClose, onSuccess }) {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        if (!open || !product) return;
        loadSaleProduct();
    }, [open, product]);

    const loadSaleProduct = async () => {
        try {
            const response = await getSaleProduct(saleEventId, product.batchId);
            if (response.data?.type === 'GOOD') {
                const d = response.data.detail;
                setDetail(d);
                form.setFieldsValue({
                    disVal: d.disVal,
                    maxQty: d.maxQty,
                    maxBuy: d.maxBuy,
                });
            } else {
                message.error('Không thể tải thông tin sản phẩm');
            }
        } catch {
            message.error('Không thể tải thông tin sản phẩm');
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const response = await updateSaleProduct(saleEventId, product.batchId, {
                disVal: values.disVal,
                maxQty: values.maxQty,
                maxBuy: values.maxBuy || null,
            });
            if (response.data?.type === 'GOOD') {
                message.success('Cập nhật sản phẩm thành công');
                onSuccess();
            } else {
                message.error(response.data?.message || 'Cập nhật thất bại');
            }
        } catch (err) {
            if (err?.errorFields) return;
            const errMsg = err?.response?.data?.message;
            message.error(errMsg || 'Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setDetail(null);
        onClose();
    };

    return (
        <Modal
            title={`Chỉnh sửa sản phẩm: ${product?.name || ''}`}
            open={open}
            onCancel={handleCancel}
            onOk={handleSave}
            confirmLoading={saving}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            destroyOnClose
        >
            {detail && (
                <Descriptions size="small" column={2} style={{ marginBottom: 16 }}>
                    <Descriptions.Item label="Batch ID">{detail.batchId}</Descriptions.Item>
                    <Descriptions.Item label="Giá bán hiện tại">
                        {Number(detail.salePrice).toLocaleString('vi-VN')} ₫
                    </Descriptions.Item>
                    <Descriptions.Item label="Tồn kho còn lại">{detail.curQty}</Descriptions.Item>
                    <Descriptions.Item label="Tổng phân bổ">{detail.maxQty}</Descriptions.Item>
                </Descriptions>
            )}

            <Form form={form} layout="vertical" preserve={false}>
                <Form.Item
                    name="disVal"
                    label="Giảm giá (%)"
                    rules={[
                        { required: false },
                        { type: 'number', min: 0, max: 100, message: 'Phải từ 0 đến 100' },
                    ]}
                >
                    <InputNumber min={0} max={100} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    name="maxQty"
                    label="Số lượng tối đa"
                    rules={[
                        { type: 'number', min: 1, message: 'Phải ≥ 1' },
                    ]}
                >
                    <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="maxBuy" label="Tối đa mỗi người mua (để trống = không giới hạn)">
                    <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
            </Form>
            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                Thay đổi <strong>Số lượng tối đa</strong> sẽ tự động điều chỉnh tồn kho batch tương ứng.
            </p>
        </Modal>
    );
}

export default EditProductModal;
