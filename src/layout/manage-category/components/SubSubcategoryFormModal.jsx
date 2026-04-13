// src/layout/manage-category/components/SubSubcategoryFormModal.jsx
import { Modal, Form, Input, Select, Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import {
    getCategoryById,
    getSubcategories,
    createSubSubcategory,
    updateSubSubcategory,
} from '../../../services/categoryService';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';

const BASE_URL = API_URLS.MAIN;

// record: null for create, sub-subcategory object for edit
// mainCategories: list of main categories for the parent cascade
function SubSubcategoryFormModal({ open, onClose, onSuccess, record, mainCategories = [] }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [subLoading, setSubLoading] = useState(false);
    const isEdit = !!record;

    useEffect(() => {
        if (!open) return;

        if (isEdit && record) {
            form.setFieldsValue({
                name: record.name,
                description: record.description,
                subcategoryId: record.subcategoryId,
            });
            setImageFile(null);
            setImagePreview(record.iconUrl || null);
            loadParentForEdit(record.subcategoryId);
        } else {
            form.resetFields();
            setImageFile(null);
            setImagePreview(null);
            setSelectedParent(null);
            setSubcategories([]);
        }
    }, [open, record, isEdit]);

    // On edit: look up the subcategory's parent category so we can populate both selects
    const loadParentForEdit = async (subcategoryId) => {
        setSubLoading(true);
        try {
            const res = await getCategoryById(subcategoryId);
            if (res.data.type === 'GOOD') {
                const parentId = res.data.detail.belongToCategory;
                if (parentId) {
                    const subsRes = await getSubcategories(parentId);
                    if (subsRes.data.type === 'GOOD') {
                        setSubcategories(subsRes.data.detail);
                        setSelectedParent(parentId);
                        form.setFieldValue('parentCategory', parentId);
                    }
                }
            }
        } catch {
            // Not critical — user can still change the subcategory manually
        } finally {
            setSubLoading(false);
        }
    };

    const handleParentChange = async (parentId) => {
        setSelectedParent(parentId);
        form.setFieldValue('subcategoryId', undefined);
        setSubcategories([]);
        if (!parentId) return;

        setSubLoading(true);
        try {
            const res = await getSubcategories(parentId);
            if (res.data.type === 'GOOD') {
                setSubcategories(res.data.detail);
            } else {
                message.error('Không thể tải danh mục con!');
            }
        } catch {
            message.error('Không thể tải danh mục con!');
        } finally {
            setSubLoading(false);
        }
    };

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
            const payload = { subcategoryId: values.subcategoryId, name: values.name };
            if (values.description) payload.description = values.description;

            let subSubcategoryId;

            if (isEdit) {
                const res = await updateSubSubcategory(record.subSubcategoryId, payload);
                if (res.data.type !== 'GOOD') {
                    message.error(res.data.message || 'Cập nhật thất bại!');
                    return;
                }
                subSubcategoryId = record.subSubcategoryId;
            } else {
                const res = await createSubSubcategory(payload);
                if (res.data.type !== 'GOOD') {
                    message.error(res.data.message || 'Thêm thất bại!');
                    return;
                }
                subSubcategoryId = res.data.detail.subSubcategoryId;
            }

            // Upload image if a new file was selected
            if (imageFile) {
                setUploading(true);
                try {
                    const formData = new FormData();
                    formData.append('file', imageFile);
                    await axios.post(
                        `${BASE_URL}/api/categories/sub-subcategories/${subSubcategoryId}/image`,
                        formData,
                        { headers: { 'Content-Type': 'multipart/form-data' } }
                    );
                } catch (uploadErr) {
                    message.warning('Danh mục đã lưu nhưng upload icon thất bại. Bạn có thể cập nhật icon sau.');
                } finally {
                    setUploading(false);
                }
            }

            message.success(isEdit ? 'Cập nhật thành công!' : 'Thêm thành công!');
            form.resetFields();
            setImageFile(null);
            setImagePreview(null);
            setSelectedParent(null);
            setSubcategories([]);
            onSuccess?.();
            onClose();
        } catch (err) {
            message.error(err.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={isEdit ? `Chỉnh sửa danh mục chi tiết #${record?.subSubcategoryId}` : 'Thêm danh mục chi tiết'}
            open={open}
            onCancel={onClose}
            footer={null}
            width={560}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} autoComplete="off">
                <Form.Item label="Danh mục cha" name="parentCategory">
                    <Select
                        placeholder="Chọn danh mục cha"
                        allowClear
                        onChange={handleParentChange}
                        options={mainCategories.map((c) => ({ value: c.categoryId, label: c.name }))}
                    />
                </Form.Item>

                <Form.Item
                    label="Danh mục con"
                    name="subcategoryId"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục con!' }]}
                >
                    <Select
                        placeholder={selectedParent ? 'Chọn danh mục con' : 'Chọn danh mục cha trước'}
                        loading={subLoading}
                        disabled={subcategories.length === 0 && !subLoading}
                        options={subcategories.map((s) => ({ value: s.categoryId, label: s.name }))}
                    />
                </Form.Item>

                <Form.Item
                    label="Tên danh mục chi tiết"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                >
                    <Input placeholder="Ví dụ: Xoài cát Hòa Lộc" />
                </Form.Item>

                <Form.Item label="Mô tả" name="description">
                    <Input.TextArea rows={3} placeholder="Mô tả ngắn..." />
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

export default SubSubcategoryFormModal;
