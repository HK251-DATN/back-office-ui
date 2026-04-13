// src/layout/manage-category/components/CategoryFormModal.jsx
import { Modal, Form, Input, InputNumber, Select, Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { createCategory, updateCategory } from '../../../services/categoryService';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';

const { TextArea } = Input;
const BASE_URL = API_URLS.MAIN;

// categoryType: 'main' | 'sub'
// record: null for create, category object for edit
// mainCategories: list of main categories (required when categoryType='sub')
// defaultParent: pre-selected parent categoryId (for create in subcategory tab)
function CategoryFormModal({ open, onClose, onSuccess, categoryType, record, mainCategories = [], defaultParent = null }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const isEdit = !!record;

    useEffect(() => {
        if (open) {
            if (isEdit && record) {
                form.setFieldsValue({
                    name: record.name,
                    description: record.description,
                    displayOrder: record.displayOrder,
                    belongToCategory: record.belongToCategory,
                });
                setImageFile(null);
                setImagePreview(record.iconUrl || null);
            } else {
                form.resetFields();
                setImageFile(null);
                setImagePreview(null);
                if (defaultParent) {
                    form.setFieldValue('belongToCategory', defaultParent);
                }
            }
        }
    }, [open, record, isEdit, form, defaultParent]);

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Chỉ được upload file ảnh!');
            return false;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Ảnh phải nhỏ hơn 5MB!');
            return false;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        return false; // prevent auto-upload
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {};
            if (values.name) payload.name = values.name;
            if (values.description) payload.description = values.description;
            if (values.displayOrder != null) payload.displayOrder = values.displayOrder;

            let categoryId;

            if (isEdit) {
                const res = await updateCategory(record.categoryId, payload);
                if (res.data.type !== 'GOOD') {
                    message.error(res.data.message || 'Cập nhật thất bại!');
                    return;
                }
                categoryId = record.categoryId;
            } else {
                payload.isSubCategory = categoryType === 'sub' ? 'Y' : 'N';
                if (categoryType === 'sub') {
                    payload.belongToCategory = values.belongToCategory;
                }
                const res = await createCategory(payload);
                if (res.data.type !== 'GOOD') {
                    message.error(res.data.message || 'Thêm thất bại!');
                    return;
                }
                categoryId = res.data.detail.categoryId;
            }

            // Upload image if a new file was selected
            if (imageFile) {
                setUploading(true);
                try {
                    const formData = new FormData();
                    formData.append('file', imageFile);
                    await axios.post(
                        `${BASE_URL}/api/categories/${categoryId}/image`,
                        formData,
                        { headers: { 'Content-Type': 'multipart/form-data' } }
                    );
                } catch (uploadErr) {
                    message.warning('Danh mục đã lưu nhưng upload ảnh thất bại. Bạn có thể cập nhật ảnh sau.');
                } finally {
                    setUploading(false);
                }
            }

            message.success(isEdit ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!');
            form.resetFields();
            setImageFile(null);
            setImagePreview(null);
            onSuccess?.();
            onClose();
        } catch (err) {
            message.error(err.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    const titleMap = {
        main: isEdit ? `Chỉnh sửa danh mục chính #${record?.categoryId}` : 'Thêm danh mục chính',
        sub: isEdit ? `Chỉnh sửa danh mục con #${record?.categoryId}` : 'Thêm danh mục con',
    };

    return (
        <Modal
            title={titleMap[categoryType]}
            open={open}
            onCancel={onClose}
            footer={null}
            width={560}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} autoComplete="off">
                {categoryType === 'sub' && !isEdit && (
                    <Form.Item
                        label="Danh mục cha"
                        name="belongToCategory"
                        rules={[{ required: true, message: 'Vui lòng chọn danh mục cha!' }]}
                    >
                        <Select
                            placeholder="Chọn danh mục cha"
                            options={mainCategories.map((c) => ({ value: c.categoryId, label: c.name }))}
                        />
                    </Form.Item>
                )}

                <Form.Item
                    label="Tên danh mục"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                >
                    <Input placeholder="Ví dụ: Rau củ quả" />
                </Form.Item>

                <Form.Item label="Mô tả" name="description">
                    <TextArea rows={3} placeholder="Mô tả ngắn về danh mục..." />
                </Form.Item>

                <Form.Item label="Thứ tự hiển thị" name="displayOrder">
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="Ví dụ: 1" />
                </Form.Item>

                <Form.Item label="Icon danh mục">
                    {imagePreview ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                                src={imagePreview}
                                alt="icon preview"
                                style={{
                                    width: 60,
                                    height: 60,
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <Upload beforeUpload={beforeUpload} showUploadList={false} accept="image/*">
                                    <Button icon={<UploadOutlined />} size="small">Đổi icon</Button>
                                </Upload>
                                <Button danger size="small" onClick={handleRemoveImage}>
                                    Xóa icon
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Upload beforeUpload={beforeUpload} showUploadList={false} accept="image/*">
                            <Button icon={<UploadOutlined />}>Chọn icon</Button>
                        </Upload>
                    )}
                    <div style={{ color: '#999', fontSize: 12, marginTop: 6 }}>
                        Hỗ trợ JPG, PNG, WEBP. Tối đa 5MB.
                    </div>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={loading || uploading}>
                            {uploading ? 'Đang upload icon...' : (isEdit ? 'Lưu thay đổi' : 'Thêm danh mục')}
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default CategoryFormModal;
