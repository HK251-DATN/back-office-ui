// src/layout/manage-product/components/ProductGeneralEditModal.jsx
import { Modal, Form, Input, InputNumber, Select, Tag, Button, message, Upload } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { API_URLS } from '../../config/api';

const { TextArea } = Input;
const BASE_URL = API_URLS.MAIN;

const UNIT_OPTIONS = [
    { value: 'KILOGRAM', label: 'Kilogram (Kg)' },
    { value: 'GRAM', label: 'Gram (g)' },
    { value: 'LITER', label: 'Liter (L)' },
    { value: 'MILLILITER', label: 'Milliliter (mL)' },
];

function ProductGeneralEditModal({ open, onClose, onSuccess, record }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [subSubcategories, setSubSubcategories] = useState([]);

    // Tags state
    const [tags, setTags] = useState([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // Image upload state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (open && record) {
            fetchSubSubcategories();
            // Pre-fill form with existing record values
            form.setFieldsValue({
                prodName: record.prodName,
                description: record.description,
                subSubcategoryId: record.subSubcategoryId,
                unit: record.unit,
                unitQuantity: record.unitQuantity,
            });
            setTags(record.tags || []);
            setImageFile(null);
            setImagePreview(record.imgUrl || null);
        }
    }, [open, record, form]);

    const fetchSubSubcategories = async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/api/categories/sub-subcategories`);
            if (response.data.type === 'GOOD') {
                setSubSubcategories(response.data.detail);
            }
        } catch (error) {
            console.error('Failed to fetch sub-subcategories:', error);
            message.error('Không thể tải danh mục. Vui lòng thử lại.');
        }
    };

    // --- Tag handlers ---
    const handleTagClose = (removedTag) => {
        setTags(tags.filter((tag) => tag !== removedTag));
    };

    const handleInputConfirm = () => {
        if (inputValue && !tags.includes(inputValue)) {
            setTags([...tags, inputValue]);
        }
        setInputVisible(false);
        setInputValue('');
    };

    // --- Image upload handlers ---
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

    // --- Form submit ---
    const handleFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {
                prodName: values.prodName,
                description: values.description,
                subSubcategoryId: values.subSubcategoryId,
                unit: values.unit,
                unitQuantity: values.unitQuantity,
                tags: tags,
                preorderPolicyId: null,
                enterpriseStoreId: null,
            };

            // Step 1: Update product general fields
            const updateResponse = await axiosInstance.put(
                `${BASE_URL}/api/product-general/${record.prodGenId}`,
                payload
            );

            if (updateResponse.data.type !== 'GOOD') {
                message.error(updateResponse.data.message || 'Cập nhật thất bại!');
                return;
            }

            // Step 2: Upload new image if a new file was selected
            if (imageFile) {
                setUploading(true);
                try {
                    const formData = new FormData();
                    formData.append('file', imageFile);
                    await axiosInstance.post(
                        `${BASE_URL}/api/product-general/${record.prodGenId}/upload-img`,
                        formData,
                        { headers: { 'Content-Type': 'multipart/form-data' } }
                    );
                } catch (uploadErr) {
                    message.warning('Sản phẩm đã cập nhật nhưng upload ảnh thất bại.');
                } finally {
                    setUploading(false);
                }
            }

            message.success('Cập nhật sản phẩm thành công!');
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
        setTags([]);
        setImageFile(null);
        setImagePreview(null);
        onClose();
    };

    return (
        <Modal
            title={`Chỉnh sửa sản phẩm #${record?.prodGenId}`}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={680}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                autoComplete="off"
            >
                {/* Product Name */}
                <Form.Item
                    label="Tên sản phẩm"
                    name="prodName"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên sản phẩm!' },
                        { min: 3, message: 'Tên sản phẩm phải có ít nhất 3 ký tự!' },
                        { max: 200, message: 'Tên sản phẩm không được quá 200 ký tự!' },
                    ]}
                >
                    <Input placeholder="Ví dụ: Cà Chua Đà Lạt" />
                </Form.Item>

                {/* Sub-subcategory */}
                <Form.Item
                    label="Danh mục"
                    name="subSubcategoryId"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                >
                    <Select
                        placeholder="Chọn danh mục"
                        showSearch
                        optionFilterProp="label"
                        options={subSubcategories.map((cat) => ({
                            value: cat.subSubcategoryId,
                            label: `${cat.name} — ${cat.description}`,
                        }))}
                    />
                </Form.Item>

                {/* Description */}
                <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mô tả sản phẩm!' },
                        { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự!' },
                        { max: 1000, message: 'Mô tả không được quá 1000 ký tự!' },
                    ]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Mô tả chi tiết về sản phẩm..."
                        showCount
                        maxLength={1000}
                    />
                </Form.Item>

                {/* Unit and Unit Quantity */}
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
                            placeholder="Ví dụ: 500"
                            min={0}
                            step={0.01}
                        />
                    </Form.Item>
                </div>

                {/* Tags */}
                <Form.Item label="Tags">
                    <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {tags.map((tag, index) => (
                            <Tag
                                key={index}
                                closable
                                onClose={() => handleTagClose(tag)}
                                color="blue"
                            >
                                {tag}
                            </Tag>
                        ))}
                        {inputVisible ? (
                            <Input
                                type="text"
                                size="small"
                                style={{ width: 120 }}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onBlur={handleInputConfirm}
                                onPressEnter={handleInputConfirm}
                                autoFocus
                            />
                        ) : (
                            <Tag
                                onClick={() => setInputVisible(true)}
                                style={{ background: '#fff', borderStyle: 'dashed', cursor: 'pointer' }}
                            >
                                <PlusOutlined /> Thêm tag
                            </Tag>
                        )}
                    </div>
                    <small style={{ color: '#999' }}>Nhấn Enter hoặc click ra ngoài để thêm tag</small>
                </Form.Item>

                {/* Image Upload */}
                <Form.Item label="Hình ảnh sản phẩm">
                    {imagePreview ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                                src={imagePreview}
                                alt="preview"
                                style={{
                                    width: 80,
                                    height: 80,
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <Upload beforeUpload={beforeUpload} showUploadList={false} accept="image/*">
                                    <Button icon={<UploadOutlined />} size="small">Đổi ảnh</Button>
                                </Upload>
                                <Button danger size="small" onClick={handleRemoveImage}>
                                    Xóa ảnh
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Upload beforeUpload={beforeUpload} showUploadList={false} accept="image/*">
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                    )}
                    <div style={{ color: '#999', fontSize: 12, marginTop: 6 }}>
                        Hỗ trợ JPG, PNG, WEBP. Tối đa 5MB.
                    </div>
                </Form.Item>

                {/* Actions */}
                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button onClick={handleCancel}>Hủy</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading || uploading}
                        >
                            {uploading ? 'Đang upload ảnh...' : 'Lưu thay đổi'}
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ProductGeneralEditModal;