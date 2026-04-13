// src/components/customer/BuyerTable.jsx
import { useState, useEffect } from 'react';
import { Table, Tag, message, Space, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';
import ViewButton from '../../../components/ViewButton';
import EditButton from '../../../components/EditButton';
import DeleteButton from '../../../components/DeleteButton';

const STATUS_CONFIG = {
    ACTIVE: { color: 'green', label: 'Hoạt động' },
    INACTIVE: { color: 'red', label: 'Ngừng hoạt động' },
    SUSPENDED: { color: 'orange', label: 'Tạm khóa' },
    BANNED: { color: 'red', label: 'Bị cấm' },
};

const MEMBERSHIP_CONFIG = {
    MEM: { color: 'blue', label: 'Thành viên' },
    VIP: { color: 'gold', label: 'VIP' },
    PREMIUM: { color: 'purple', label: 'Premium' },
};

const GENDER_LABELS = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác',
};

function BuyerTable({ refreshTrigger }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    useEffect(() => {
        fetchData();
    }, [pagination.current, pagination.pageSize, refreshTrigger]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URLS.MAIN}/api/buyer/admin`);

            if (response.data.code === '200 OK') {
                const buyers = response.data.detail;
                setData(Array.isArray(buyers) ? buyers : []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.totalElements || buyers.length,
                }));
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu khách hàng');
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (record) => {
        message.info(`Xem chi tiết khách hàng #${record.buyerId}`);
        // TODO: Open detail modal
    };

    const handleEdit = (record) => {
        message.info('Chức năng chỉnh sửa đang được phát triển');
    };

    const handleDelete = (record) => {
        message.info('Chức năng xóa đang được phát triển');
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'buyerId',
            key: 'buyerId',
            width: '5%',
            sorter: (a, b) => a.buyerId - b.buyerId,
        },
        {
            title: 'Khách hàng',
            key: 'customerInfo',
            width: '10%',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar
                        src={record.avtUrl}
                        size={40}
                        icon={<UserOutlined />}
                    />
                    <div>
                        <div style={{ fontWeight: 500, marginBottom: 2 }}>
                            {record.fName} {record.lName}
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                            Tham gia: {dayjs(record.createdAt).format('DD/MM/YYYY')}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            width: '10%',
            render: (_, record) => (
                <div>
                    <div style={{ marginBottom: 4 }}>
                        📧 {record.email}
                    </div>
                    <div style={{ color: '#666' }}>
                        📱 {record.pNum}
                    </div>
                </div>
            ),
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            width: '5%',
            render: (gender) => GENDER_LABELS[gender] || gender,
        },
        {
            title: 'Hạng',
            dataIndex: 'membershipLevel',
            key: 'membershipLevel',
            width: '10%',
            render: (level) => {
                const config = MEMBERSHIP_CONFIG[level] || { color: 'default', label: level };
                return <Tag color={config.color}>{config.label}</Tag>;
            },
            filters: Object.keys(MEMBERSHIP_CONFIG).map(key => ({
                text: MEMBERSHIP_CONFIG[key].label,
                value: key,
            })),
            onFilter: (value, record) => record.membershipLevel === value,
        },
        {
            title: 'Tổng đơn',
            dataIndex: 'totalOrders',
            key: 'totalOrders',
            width: '5%',
            sorter: (a, b) => a.totalOrders - b.totalOrders,
            render: (total) => <strong>{total}</strong>,
        },
        {
            title: 'Tổng chi tiêu',
            dataIndex: 'totalSpentAmount',
            key: 'totalSpentAmount',
            width: '10%',
            sorter: (a, b) => a.totalSpentAmount - b.totalSpentAmount,
            render: (amount) => (
                <span style={{ color: '#1890ff', fontWeight: 500 }}>
                    {amount.toLocaleString('vi-VN')} ₫
                </span>
            ),
        },
        {
            title: 'Điểm thưởng',
            dataIndex: 'loyaltyPoint',
            key: 'loyaltyPoint',
            width: '5%',
            sorter: (a, b) => a.loyaltyPoint - b.loyaltyPoint,
            render: (points) => `${points} ⭐`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'accStatus',
            key: 'accStatus',
            width: '10%',
            render: (status) => {
                const config = STATUS_CONFIG[status] || { color: 'default', label: status };
                return <Tag color={config.color}>{config.label}</Tag>;
            },
            filters: Object.keys(STATUS_CONFIG).map(key => ({
                text: STATUS_CONFIG[key].label,
                value: key,
            })),
            onFilter: (value, record) => record.accStatus === value,
        },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            width: '10%',
            render: (_, record) => (
                <Space size="small">
                    <ViewButton onClick={() => handleView(record)} />
                    <EditButton onClick={() => handleEdit(record)} />
                    <DeleteButton onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];

    const handleTableChange = (newPagination, filters, sorter) => {
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        });
    };

    return (
        <Table
            className='border border-gray-200 rounded-2xl'
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey="buyerId"
            pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} khách hàng`,
                pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
        // scroll={{ x: 'max-content' }}
        />
    );
}

export default BuyerTable;