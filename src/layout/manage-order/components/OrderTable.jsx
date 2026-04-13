import { Table, Tag, Space, Button, Alert } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';
import OrderConfirmationModal from './OrderConfirmationModal';

const STATUS_COLORS = {
    CREATED: 'orange',
    CONFIRMED: 'blue',
    PACKING: 'cyan',
    READY_FOR_PICKUP: 'purple',
    SHIPPING: 'geekblue',
    DELIVERY: 'green',
    COMPLETED: 'success',
    CANCELLED: 'red',
};

const STATUS_LABELS = {
    CREATED: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    PACKING: 'Đang đóng gói',
    READY_FOR_PICKUP: 'Sẵn sàng giao',
    SHIPPING: 'Đang vận chuyển',
    DELIVERY: 'Đang giao hàng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
};

function OrderTable() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch basic order info from back-office service
            const ordersResponse = await axios.get(`${API_URLS.MAIN}/api/order/admin`);

            // Fetch order summaries from ecommerce service
            const summariesResponse = await axios.get(`${API_URLS.ECOMMERCE}/api/orders/admin/order-summary`);

            if (ordersResponse.data.type === 'GOOD' && summariesResponse.data.type === 'GOOD') {
                const orders = ordersResponse.data.detail;
                const summaries = summariesResponse.data.detail;

                // Create a map of order summaries by order_id
                const summaryMap = {};
                summaries.forEach(summary => {
                    summaryMap[summary.order_id] = summary;
                });

                // Merge the data
                const mergedData = orders.map(order => {
                    const summary = summaryMap[parseInt(order.order_id)] || {};
                    return {
                        ...order,
                        total_quantity: summary.total_quantity || 0,
                        num_of_item: summary.num_of_item || 0,
                    };
                });

                setData(mergedData);
            } else {
                setError('Không thể tải danh sách đơn hàng');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Không thể tải danh sách đơn hàng';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setModalOpen(true);
    };

    const handleConfirmSuccess = () => {
        // Refresh orders immediately after successful confirmation
        fetchOrders();
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedOrder(null);
    };

    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'order_id',
            key: 'order_id',
            width: 120,
            sorter: (a, b) => parseInt(a.order_id) - parseInt(b.order_id),
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            width: 250,
            render: (_, record) => (
                <div>
                    <div className="font-medium">
                        #{record.owned_by} — {record.f_name} {record.l_name}
                    </div>
                    <div className="text-gray-500 text-sm">{record.email}</div>
                </div>
            ),
        },
        {
            title: 'Tổng giá trị',
            dataIndex: 'total_price',
            key: 'total_price',
            width: 150,
            render: (value) => (
                <span className="font-medium">{formatCurrency(value)}</span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status) => (
                <Tag color={STATUS_COLORS[status] || 'default'}>
                    {STATUS_LABELS[status] || status}
                </Tag>
            ),
            filters: [
                { text: 'Chờ xác nhận', value: 'CREATED' },
                { text: 'Đã xác nhận', value: 'CONFIRMED' },
                { text: 'Đang đóng gói', value: 'PACKING' },
                { text: 'Sẵn sàng giao', value: 'READY_FOR_PICKUP' },
                { text: 'Đang vận chuyển', value: 'SHIPPING' },
                { text: 'Đang giao hàng', value: 'DELIVERY' },
                { text: 'Hoàn thành', value: 'COMPLETED' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Số SKU',
            dataIndex: 'num_of_item',
            key: 'num_of_item',
            width: 100,
            align: 'center',
        },
        {
            title: 'Tổng SL',
            dataIndex: 'total_quantity',
            key: 'total_quantity',
            width: 100,
            align: 'center',
        },
        {
            title: 'Cập nhật lúc',
            dataIndex: 'updated_at',
            key: 'updated_at',
            width: 180,
            render: formatDate,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                    >
                        Xem chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {error && (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: 16 }}
                />
            )}

            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="order_id"
                scroll={{ x: 1400 }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} đơn hàng`,
                    pageSizeOptions: ['10', '20', '50'],
                }}
                bordered
            />

            <OrderConfirmationModal
                order={selectedOrder}
                open={modalOpen}
                onClose={handleModalClose}
                onSuccess={handleConfirmSuccess}
            />
        </div>
    );
}

export default OrderTable;
