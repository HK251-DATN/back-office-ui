import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { createCoupon, updateCoupon, getCouponById } from '../../../services/couponService';

const { Option } = Select;

function CouponFormModal({ open, couponId, onClose, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [discountType, setDiscountType] = useState(null);
    const isEdit = !!couponId;

    useEffect(() => {
        if (!open) {
            form.resetFields();
            setDiscountType(null);
            return;
        }
        if (isEdit && couponId) {
            loadCoupon(couponId);
        }
    }, [open, couponId]);

    const loadCoupon = async (id) => {
        try {
            const response = await getCouponById(id);
            if (response.data?.type === 'GOOD') {
                const c = response.data.detail;
                setDiscountType(c.discountType);
                const MOCK_BUYER_GROUPS = { 8: ['NEW_CUSTOMER'], 9: ['LOYAL_CUSTOMER'] };
                form.setFieldsValue({
                    couponCode: c.couponCode,
                    discountType: c.discountType,
                    discountValue: c.discountValue,
                    maxDiscountAmount: c.maxDiscountAmount,
                    minOrderValue: c.minOrderValue,
                    totalQuantity: c.totalQuantity,
                    currentQuantity: c.currentQuantity,
                    expiredAt: c.expiredAt ? dayjs(c.expiredAt) : null,
                    publicYn: c.publicYn || 'Y',
                    buyerGroups: MOCK_BUYER_GROUPS[id] ?? [],
                });
            } else {
                message.error(response.data?.message || 'Không thể tải thông tin mã giảm giá');
            }
        } catch {
            message.error('Không thể tải thông tin mã giảm giá');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const payload = {
                couponCode: values.couponCode,
                discountType: values.discountType,
                discountValue: values.discountValue,
                maxDiscountAmount: values.maxDiscountAmount ?? null,
                minOrderValue: values.minOrderValue ?? null,
                totalQuantity: values.totalQuantity,
                currentQuantity: values.currentQuantity,
                expiredAt: values.expiredAt ? values.expiredAt.format('YYYY-MM-DDTHH:mm:ss') : null,
                publicYn: values.publicYn || 'Y',
            };

            let response;
            if (isEdit) {
                response = await updateCoupon(couponId, payload);
            } else {
                response = await createCoupon(payload);
            }

            if (response.data?.type !== 'GOOD') {
                message.error(response.data?.message || 'Lưu mã giảm giá thất bại');
                return;
            }

            message.success(isEdit ? 'Cập nhật mã giảm giá thành công' : 'Tạo mã giảm giá thành công');
            onSuccess();
        } catch (err) {
            if (err?.errorFields) return;
            message.error('Lưu mã giảm giá thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleDiscountTypeChange = (val) => {
        setDiscountType(val);
        if (val !== 'PERCENTAGE') {
            form.setFieldValue('maxDiscountAmount', undefined);
        }
    };

    return (
        <Modal
            title={isEdit ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText={isEdit ? 'Lưu thay đổi' : 'Tạo mã giảm giá'}
            cancelText="Hủy"
            width={580}
            destroyOnClose
        >
            <Form form={form} layout="vertical" preserve={false}>
                <Form.Item
                    name="couponCode"
                    label="Mã giảm giá"
                    rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá' }]}
                >
                    <Input placeholder="Nhập mã giảm giá (vd: SUMMER20)" />
                </Form.Item>

                <div className="flex gap-4">
                    <Form.Item
                        name="discountType"
                        label="Loại giảm giá"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
                    >
                        <Select placeholder="Chọn loại" onChange={handleDiscountTypeChange}>
                            <Option value="PERCENTAGE">Phần trăm (%)</Option>
                            <Option value="FIXED_AMOUNT">Số tiền cố định (₫)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="discountValue"
                        label={discountType === 'FIXED_AMOUNT' ? 'Giá trị giảm (₫)' : 'Giá trị giảm (%)'}
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm' }]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            placeholder={discountType === 'FIXED_AMOUNT' ? 'Số tiền (₫)' : 'Phần trăm (%)'}
                        />
                    </Form.Item>
                </div>

                {discountType === 'PERCENTAGE' && (
                    <Form.Item name="maxDiscountAmount" label="Giảm tối đa (₫)">
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="Không giới hạn nếu để trống"
                            formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                            parser={(value) => value?.replace(/,/g, '') ?? ''}
                        />
                    </Form.Item>
                )}

                <Form.Item name="minOrderValue" label="Đơn tối thiểu (₫)">
                    <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="Không yêu cầu nếu để trống"
                        formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                        parser={(value) => value?.replace(/,/g, '') ?? ''}
                    />
                </Form.Item>

                <div className="flex gap-4">
                    <Form.Item
                        name="totalQuantity"
                        label="Tổng số lượng"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Vui lòng nhập tổng số lượng' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="100" />
                    </Form.Item>

                    <Form.Item
                        name="currentQuantity"
                        label="Số lượng hiện tại"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng hiện tại' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} placeholder="100" />
                    </Form.Item>
                </div>

                <div className="flex gap-4">
                    <Form.Item name="expiredAt" label="Ngày hết hạn" style={{ flex: 1 }}>
                        <DatePicker
                            showTime
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY HH:mm"
                            placeholder="Không hết hạn nếu để trống"
                        />
                    </Form.Item>

                    <Form.Item name="publicYn" label="Hiển thị" style={{ flex: 1 }} initialValue="Y">
                        <Select>
                            <Option value="Y">Công khai</Option>
                            <Option value="N">Riêng tư</Option>
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item name="buyerGroups" label="Nhóm khách hàng áp dụng">
                    <Select
                        mode="multiple"
                        placeholder="Áp dụng cho tất cả nếu để trống"
                        allowClear
                    >
                        <Option value="NEW_CUSTOMER">Khách hàng mới</Option>
                        <Option value="LOYAL_CUSTOMER">Khách hàng thân thiết</Option>
                        <Option value="REGULAR_CUSTOMER">Khách hàng thông thường</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default CouponFormModal;
