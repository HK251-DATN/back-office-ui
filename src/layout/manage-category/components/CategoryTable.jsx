// src/layout/manage-category/components/CategoryTable.jsx
import { Table, Button, Image, Space, Popconfirm, message, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { getCategories, deleteCategory } from '../../../services/categoryService';
import CategoryFormModal from './CategoryFormModal';

function CategoryTable() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editRecord, setEditRecord] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getCategories();
            if (res.data.type === 'GOOD') {
                setData(res.data.detail);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh mục chính!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            const res = await deleteCategory(record.categoryId);
            if (res.data.type === 'GOOD') {
                message.success('Xóa danh mục thành công!');
                fetchCategories();
            } else {
                message.error(res.data.message || 'Xóa thất bại!');
            }
        } catch (err) {
            message.error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa!');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'categoryId',
            key: 'categoryId',
            width: '6%',
            sorter: (a, b) => a.categoryId - b.categoryId,
        },
        {
            title: 'Icon',
            dataIndex: 'iconUrl',
            key: 'iconUrl',
            width: '7%',
            render: (url) =>
                url ? (
                    <Image
                        src={url}
                        width={40}
                        height={40}
                        style={{ objectFit: 'cover', borderRadius: 6 }}
                        fallback="https://via.placeholder.com/40x40?text=N/A"
                    />
                ) : (
                    <div style={{ width: 40, height: 40, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 10 }}>
                        N/A
                    </div>
                ),
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            width: '22%',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: '30%',
            ellipsis: true,
            render: (text) => <span style={{ color: '#666' }}>{text}</span>,
        },
        {
            title: 'Thứ tự',
            dataIndex: 'displayOrder',
            key: 'displayOrder',
            width: '8%',
            sorter: (a, b) => a.displayOrder - b.displayOrder,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '12%',
            render: (val) => (val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—'),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: '15%',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => { setEditRecord(record); setModalOpen(true); }}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa danh mục?"
                        description="Bạn có chắc muốn xóa danh mục này không?"
                        onConfirm={() => handleDelete(record)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger size="small" icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {error && (
                <Alert message="Lỗi" description={error} type="error" closable onClose={() => setError(null)} style={{ marginBottom: 16 }} />
            )}
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => { setEditRecord(null); setModalOpen(true); }}
                >
                    Thêm danh mục chính
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="categoryId"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} danh mục chính`,
                }}
                bordered
            />
            <CategoryFormModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditRecord(null); }}
                onSuccess={fetchCategories}
                categoryType="main"
                record={editRecord}
            />
        </div>
    );
}

export default CategoryTable;
