// src/layout/manage-category/components/SubcategoryTable.jsx
import { Table, Button, Image, Space, Popconfirm, message, Alert, Select, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { getCategories, getSubcategories, deleteCategory } from '../../../services/categoryService';
import CategoryFormModal from './CategoryFormModal';

function SubcategoryTable() {
    const [mainCategories, setMainCategories] = useState([]);
    const [mainLoading, setMainLoading] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editRecord, setEditRecord] = useState(null);

    useEffect(() => {
        fetchMainCategories();
    }, []);

    const fetchMainCategories = async () => {
        setMainLoading(true);
        try {
            const res = await getCategories();
            if (res.data.type === 'GOOD') {
                setMainCategories(res.data.detail);
            }
        } catch {
            message.error('Không thể tải danh mục chính!');
        } finally {
            setMainLoading(false);
        }
    };

    const fetchSubcategories = async (parentId) => {
        setLoading(true);
        setError(null);
        setData([]);
        try {
            const res = await getSubcategories(parentId);
            if (res.data.type === 'GOOD') {
                setData(res.data.detail);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh mục con!');
        } finally {
            setLoading(false);
        }
    };

    const handleParentChange = (parentId) => {
        setSelectedParent(parentId ?? null);
        if (parentId) {
            fetchSubcategories(parentId);
        } else {
            setData([]);
        }
    };

    const handleDelete = async (record) => {
        try {
            const res = await deleteCategory(record.categoryId);
            if (res.data.type === 'GOOD') {
                message.success('Xóa danh mục con thành công!');
                fetchSubcategories(selectedParent);
            } else {
                message.error(res.data.message || 'Xóa thất bại!');
            }
        } catch (err) {
            message.error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa!');
        }
    };

    const parentName = mainCategories.find((c) => c.categoryId === selectedParent)?.name;

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
            title: 'Tên danh mục con',
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
                <Space size="small" align='center'>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => { setEditRecord(record); setModalOpen(true); }}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa danh mục con?"
                        description="Bạn có chắc muốn xóa danh mục con này không?"
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
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Select
                    placeholder="Chọn danh mục cha để xem danh mục con"
                    style={{ width: 340 }}
                    loading={mainLoading}
                    allowClear
                    onChange={handleParentChange}
                    options={mainCategories.map((c) => ({ value: c.categoryId, label: c.name }))}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    disabled={!selectedParent}
                    onClick={() => { setEditRecord(null); setModalOpen(true); }}
                >
                    Thêm danh mục con
                </Button>
            </div>

            {!selectedParent ? (
                <Empty description="Vui lòng chọn danh mục cha để xem danh mục con" />
            ) : (
                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    rowKey="categoryId"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} danh mục con của "${parentName}"`,
                    }}
                    bordered
                />
            )}

            <CategoryFormModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditRecord(null); }}
                onSuccess={() => fetchSubcategories(selectedParent)}
                categoryType="sub"
                record={editRecord}
                mainCategories={mainCategories}
                defaultParent={selectedParent}
            />
        </div>
    );
}

export default SubcategoryTable;
