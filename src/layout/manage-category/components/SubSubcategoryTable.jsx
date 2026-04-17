// src/layout/manage-category/components/SubSubcategoryTable.jsx
import { Table, Button, Image, Space, Popconfirm, message, Alert, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { getCategories, getSubSubcategories, deleteSubSubcategory } from '../../../services/categoryService';
import SubSubcategoryFormModal from './SubSubcategoryFormModal';

function SubSubcategoryTable() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mainCategories, setMainCategories] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editRecord, setEditRecord] = useState(null);

    useEffect(() => {
        fetchData();
        fetchMainCategories();
    }, []);

    const fetchMainCategories = async () => {
        try {
            const res = await getCategories();
            if (res.data.type === 'GOOD') {
                setMainCategories(res.data.detail);
            }
        } catch {
            // Non-critical; cascading select just won't populate
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getSubSubcategories();
            if (res.data.type === 'GOOD') {
                setData(res.data.detail);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh mục chi tiết!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            const res = await deleteSubSubcategory(record.subSubcategoryId);
            if (res.data.type === 'GOOD') {
                message.success('Xóa thành công!');
                fetchData();
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
            dataIndex: 'subSubcategoryId',
            key: 'subSubcategoryId',
            width: '6%',
            sorter: (a, b) => a.subSubcategoryId - b.subSubcategoryId,
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
            title: 'Tên danh mục chi tiết',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: '25%',
            ellipsis: true,
            render: (text) => <span style={{ color: '#666' }}>{text}</span>,
        },
        {
            title: 'Số ngày lưu kho TB',
            dataIndex: 'avgShelfDays',
            key: 'avgShelfDays',
            width: '10%',
            sorter: (a, b) => (a.avgShelfDays || 0) - (b.avgShelfDays || 0),
            render: (days) => (
                <Tag color="cyan">{days ? `${days} ngày` : 'N/A'}</Tag>
            ),
        },
        {
            title: 'ID danh mục con',
            dataIndex: 'subcategoryId',
            key: 'subcategoryId',
            width: '10%',
            render: (id) => <Tag color="blue">#{id}</Tag>,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '10%',
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
                        title="Xóa danh mục chi tiết?"
                        description="Bạn có chắc muốn xóa?"
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
                    Thêm danh mục chi tiết
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="subSubcategoryId"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} danh mục chi tiết`,
                }}
                bordered
            />
            <SubSubcategoryFormModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditRecord(null); }}
                onSuccess={fetchData}
                record={editRecord}
                mainCategories={mainCategories}
            />
        </div>
    );
}

export default SubSubcategoryTable;
