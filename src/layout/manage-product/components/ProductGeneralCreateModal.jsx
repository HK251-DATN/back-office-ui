// src/components/ProductGeneralCreateModal.jsx
import { Modal, Form, Input, Select, Radio, Tag, Upload, Button, message } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';

const { TextArea } = Input;

function ProductGeneralCreateModal({ open, onClose, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (open) {
            fetchCategories();
            form.resetFields();
            setTags([]);
        }
    }, [open, form]);

    const fetchCategories = async () => {
        try {
            // Replace with your actual category endpoint
            const response = await axios.get('http://localhost:9300/api/categories');
            if (response.data.type === 'GOOD') {
                setCategories(response.data.detail);
            } else {
                setCategories([
                    { id: 8, name: 'Rau Củ Quả' },
                    { id: 9, name: 'Thịt Tươi Sống' },
                    { id: 10, name: 'Hải Sản Tươi Sống' },
                    { id: 11, name: 'Trứng & Sữa' },
                    { id: 12, name: 'Trái Cây Nhập Khẩu' },
                    { id: 13, name: 'Gia Vị & Đồ Khô' }
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            // Mock categories if API fails
            setCategories([
                { id: 8, name: 'Rau Củ Quả' },
                { id: 9, name: 'Thịt Tươi Sống' },
                { id: 10, name: 'Hải Sản Tươi Sống' },
                { id: 11, name: 'Trứng & Sữa' },
                { id: 12, name: 'Trái Cây Nhập Khẩu' },
                { id: 13, name: 'Gia Vị & Đồ Khô' }
            ]);
        }
    };

    const handleFinish = async (values) => {
        setLoading(true);

        try {
            const payload = {
                ...values,
                tags: tags, // Use tags from state
            };

            const response = await axios.post('http://localhost:9300/api/product-generals', payload);

            if (response.data.type === 'GOOD') {
                message.success('Thêm sản phẩm thành công!');
                form.resetFields();
                setTags([]);
                onSuccess?.(); // Callback to refresh parent table
                onClose();
            } else {
                message.error(response.data.message || 'Thêm sản phẩm thất bại!');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    // Tag handling functions
    const handleTagClose = (removedTag) => {
        setTags(tags.filter(tag => tag !== removedTag));
    };

    const handleInputConfirm = () => {
        if (inputValue && !tags.includes(inputValue)) {
            setTags([...tags, inputValue]);
        }
        setInputVisible(false);
        setInputValue('');
    };

    const showInput = () => {
        setInputVisible(true);
    };

    return (
        <Modal
            title="Thêm sản phẩm mới"
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
                {/* Product Name */}
                <Form.Item
                    label="Tên sản phẩm"
                    name="name"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên sản phẩm!' },
                        { min: 3, message: 'Tên sản phẩm phải có ít nhất 3 ký tự!' },
                        { max: 200, message: 'Tên sản phẩm không được quá 200 ký tự!' },
                    ]}
                >
                    <Input placeholder="Ví dụ: Cà Chua Đà Lạt" />
                </Form.Item>

                {/* Category */}
                <Form.Item
                    label="Danh mục"
                    name="categoryId"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                >
                    <Select
                        placeholder="Chọn danh mục"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {categories.map(cat => (
                            <Select.Option key={cat.id} value={cat.id}>
                                {cat.name}
                            </Select.Option>
                        ))}
                    </Select>
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

                {/* Status */}
                <Form.Item
                    label="Trạng thái"
                    name="status"
                    initialValue="ACTIVE"
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                >
                    <Radio.Group>
                        <Radio value="ACTIVE">Hoạt động</Radio>
                        <Radio value="INACTIVE">Ngừng hoạt động</Radio>
                    </Radio.Group>
                </Form.Item>

                {/* Tags */}
                <Form.Item label="Tags">
                    <div style={{ marginBottom: 8 }}>
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
                                onClick={showInput}
                                style={{
                                    background: '#fff',
                                    borderStyle: 'dashed',
                                    cursor: 'pointer'
                                }}
                            >
                                <PlusOutlined /> Thêm tag
                            </Tag>
                        )}
                    </div>
                    <small style={{ color: '#999' }}>
                        Nhấn Enter hoặc click ra ngoài để thêm tag
                    </small>
                </Form.Item>

                {/* Image URL */}
                <Form.Item
                    label="URL hình ảnh"
                    name="img"
                    rules={[
                        { required: true, message: 'Vui lòng nhập URL hình ảnh!' },
                        { type: 'url', message: 'URL không hợp lệ!' },
                    ]}
                >
                    <Input
                        placeholder="https://example.com/image.jpg"
                        addonBefore="URL"
                    />
                </Form.Item>

                {/* Form Actions */}
                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button onClick={onClose}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Thêm sản phẩm
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ProductGeneralCreateModal;