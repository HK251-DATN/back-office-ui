import { useState, useEffect } from 'react';
import { Table, Tag, Button, message, Tooltip } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { getProviders } from '../../../services/providerService';
import ProviderReviewModal from './ProviderReviewModal';

const statusColors = {
    PENDING: 'orange',
    APPROVED: 'green',
    REJECTED: 'red',
    SUSPENDED: 'volcano',
    UNVERIFIED: 'default'
};

const statusLabels = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    SUSPENDED: 'Tạm ngưng',
    UNVERIFIED: 'Chưa xác thực'
};

const bankLabels = {
    VIETCOMBANK: 'Vietcombank',
    TECHCOMBANK: 'Techcombank',
    BIDV: 'BIDV',
    AGRIBANK: 'Agribank',
    VIETINBANK: 'VietinBank',
    MBBANK: 'MB Bank',
    TPBANK: 'TP Bank',
    SACOMBANK: 'Sacombank',
    ACB: 'ACB',
    VPBank: 'VPBank'
};

const ProviderTable = ({ status, refreshTrigger, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);

    const fetchData = async (page = 1, pageSize = 20) => {
        setLoading(true);
        try {
            const params = {
                pageNum: page,
                pageSize
            };
            if (status) {
                params.status = status;
            }

            const response = await getProviders(params);
            const responseType = response.data?.type;

            if (responseType === 'GOOD' || responseType === 'SKIP_AS_GOOD') {
                const providers = response.data.detail || [];
                setData(providers);
                setPagination(prev => ({
                    ...prev,
                    current: page,
                    total: providers.length
                }));
            } else {
                setData([]);
                message.error('Không thể tải danh sách nhà cung cấp');
            }
        } catch (error) {
            console.error('Error fetching providers:', error);
            message.error('Lỗi khi tải danh sách nhà cung cấp');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(pagination.current, pagination.pageSize);
    }, [status, refreshTrigger]);

    const handleTableChange = (newPagination) => {
        fetchData(newPagination.current, newPagination.pageSize);
    };

    const handleView = (record) => {
        setSelectedProvider(record);
        setReviewModalOpen(true);
    };

    const handleReviewSuccess = () => {
        setReviewModalOpen(false);
        setSelectedProvider(null);
        onRefresh?.();
    };

    const columns = [
        {
            title: 'ID Nhà cung cấp',
            dataIndex: 'providerId',
            key: 'providerId',
            width: 150,
            sorter: (a, b) => a.providerId - b.providerId
        },
        {
            title: 'ID Người dùng',
            dataIndex: 'userId',
            key: 'userId',
            width: 130,
            sorter: (a, b) => a.userId - b.userId
        },
        {
            title: 'Ngân hàng',
            dataIndex: 'bankId',
            key: 'bankId',
            width: 150,
            render: (bankId) => bankLabels[bankId] || bankId
        },
        {
            title: 'Số tài khoản',
            dataIndex: 'bankNum',
            key: 'bankNum',
            width: 180,
            render: (bankNum) => (
                <span className="font-mono">{bankNum}</span>
            )
        },
        {
            title: 'Điểm uy tín',
            dataIndex: 'reputationPoint',
            key: 'reputationPoint',
            width: 130,
            align: 'center',
            sorter: (a, b) => a.reputationPoint - b.reputationPoint,
            render: (point) => (
                <Tag color={point >= 80 ? 'green' : point >= 50 ? 'blue' : 'red'}>
                    {point}
                </Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'verificationStatus',
            key: 'verificationStatus',
            width: 140,
            align: 'center',
            render: (status) => (
                <Tag color={statusColors[status]}>
                    {statusLabels[status] || status}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        Xem
                    </Button>
                </Tooltip>
            )
        }
    ];

    return (
        <>
            <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    Tổng số: <strong>{data.length}</strong> nhà cung cấp
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchData(pagination.current, pagination.pageSize)}
                    loading={loading}
                >
                    Làm mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="providerId"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                scroll={{ x: 1100 }}
            />

            {reviewModalOpen && (
                <ProviderReviewModal
                    open={reviewModalOpen}
                    provider={selectedProvider}
                    onClose={() => {
                        setReviewModalOpen(false);
                        setSelectedProvider(null);
                    }}
                    onSuccess={handleReviewSuccess}
                />
            )}
        </>
    );
};

export default ProviderTable;
