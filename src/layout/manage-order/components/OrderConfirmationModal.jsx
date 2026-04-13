import { Modal, Table, Button, Alert, Spin, message, Tag, Descriptions } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';

function OrderConfirmationModal({ order, open, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [orderDetail, setOrderDetail] = useState(null);
    const [itemsWithStock, setItemsWithStock] = useState([]);
    const [error, setError] = useState(null);

    const fetchOrderDetails = useCallback(async () => {
        if (!order) return;
        setLoading(true);
        setError(null);
        try {
            // Fetch order details from ecommerce service
            const orderResponse = await axios.get(
                `${API_URLS.ECOMMERCE}/api/orders/admin/${order.order_id}`
            );

            if (orderResponse.data.type === 'GOOD') {
                const detail = orderResponse.data.detail;
                setOrderDetail(detail);

                // Fetch stock quantities for each order item
                const itemsWithStockData = await Promise.all(
                    detail.orderItems.map(async (item) => {
                        try {
                            const stockResponse = await axios.get(
                                `${API_URLS.STORAGE}/api/product-detail/quantity/${item.batchDetailId}`
                            );

                            const availableQuantity = stockResponse.data.type === 'GOOD'
                                ? stockResponse.data.detail
                                : 0;

                            return {
                                ...item,
                                availableQuantity,
                                hasSufficientStock: availableQuantity >= item.quantity,
                            };
                        } catch (err) {
                            console.error(`Failed to fetch stock for batch ${item.batchDetailId}:`, err);
                            return {
                                ...item,
                                availableQuantity: 0,
                                hasSufficientStock: false,
                                stockError: true,
                            };
                        }
                    })
                );

                setItemsWithStock(itemsWithStockData);
            } else {
                setError('Không thể tải chi tiết đơn hàng');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Không thể tải chi tiết đơn hàng';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [order]);

    useEffect(() => {
        if (open && order) {
            fetchOrderDetails();
        } else {
            // Reset state when modal closes
            setOrderDetail(null);
            setItemsWithStock([]);
            setError(null);
        }
    }, [open, order, fetchOrderDetails]);

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            const response = await axios.put(
                `${API_URLS.ECOMMERCE}/api/orders/${order.order_id}/confirm`
            );

            if (response.data.type === 'GOOD') {
                message.success('Xác nhận đơn hàng thành công!');
                // Trigger success callback to refresh the order table
                if (onSuccess) {
                    onSuccess();
                }
                onClose();
            } else {
                message.error(response.data.message || 'Xác nhận đơn hàng thất bại');
            }
        } catch (err) {
            message.error(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận đơn hàng');
        } finally {
            setConfirming(false);
        }
    };

    const canConfirm = () => {
        // Can only confirm if order status is CREATED and all items have sufficient stock
        return (
            order?.status === 'CREATED' &&
            itemsWithStock.length > 0 &&
            itemsWithStock.every(item => item.hasSufficientStock)
        );
    };

    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const columns = [
        {
            title: 'Batch ID',
            dataIndex: 'batchDetailId',
            key: 'batchDetailId',
            width: 100,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            width: 250,
            render: (name) => name || <span className="text-gray-400">Đang tải...</span>,
        },
        {
            title: 'Số lượng đặt',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 120,
            align: 'center',
            render: (quantity) => (
                <span className="font-medium">{quantity}</span>
            ),
        },
        {
            title: 'Tồn kho',
            dataIndex: 'availableQuantity',
            key: 'availableQuantity',
            width: 120,
            align: 'center',
            render: (quantity, record) => {
                const insufficient = !record.hasSufficientStock;
                return (
                    <span
                        className={`font-medium ${insufficient ? 'text-red-600' : 'text-green-600'}`}
                        style={{ fontSize: '15px' }}
                    >
                        {record.stockError ? '—' : quantity}
                    </span>
                );
            },
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 150,
            align: 'center',
            render: (_, record) => {
                if (record.stockError) {
                    return <Tag color="red">Lỗi kiểm tra</Tag>;
                }
                return record.hasSufficientStock ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        Đủ hàng
                    </Tag>
                ) : (
                    <Tag icon={<ExclamationCircleOutlined />} color="error">
                        Thiếu hàng
                    </Tag>
                );
            },
        },
        {
            title: 'Đơn giá',
            dataIndex: 'unitPriceAtPurchase',
            key: 'unitPriceAtPurchase',
            width: 130,
            align: 'right',
            render: (price) => formatCurrency(price),
        },
        {
            title: 'Thành tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: 150,
            align: 'right',
            render: (price) => (
                <span className="font-medium">{formatCurrency(price)}</span>
            ),
        },
    ];

    const hasInsufficientStock = itemsWithStock.some(item => !item.hasSufficientStock);

    // Don't render modal content if order is null
    if (!order) {
        return null;
    }

    return (
        <Modal
            title={
                <div className="text-xl font-bold">
                    Chi tiết đơn hàng #{order.order_id}
                </div>
            }
            open={open}
            onCancel={onClose}
            width={1100}
            footer={
                order.status === 'CREATED' ? (
                    <div className="flex justify-end gap-2">
                        <Button onClick={onClose}>
                            Đóng
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleConfirm}
                            loading={confirming}
                            disabled={!canConfirm()}
                        >
                            Xác nhận đơn hàng
                        </Button>
                    </div>
                ) : (
                    <Button onClick={onClose}>
                        Đóng
                    </Button>
                )
            }
        >
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Spin size="large" />
                </div>
            ) : error ? (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                />
            ) : orderDetail ? (
                <div className="space-y-4">
                    {/* Order Information */}
                    <Descriptions bordered size="small" column={2}>
                        <Descriptions.Item label="Mã đơn hàng">
                            <strong>#{orderDetail.orderId}</strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">
                            #{orderDetail.buyerId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={order.status === 'CREATED' ? 'orange' : 'blue'}>
                                {order.status === 'CREATED' ? 'Chờ xác nhận' : order.status}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ giao hàng">
                            #{orderDetail.addressId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng giá trị" span={2}>
                            <strong className="text-lg text-blue-600">
                                {formatCurrency(orderDetail.totalPrice)}
                            </strong>
                        </Descriptions.Item>
                        {orderDetail.note && (
                            <Descriptions.Item label="Ghi chú" span={2}>
                                {orderDetail.note}
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    {/* Stock warning */}
                    {hasInsufficientStock && order.status === 'CREATED' && (
                        <Alert
                            message="Cảnh báo: Không đủ hàng trong kho"
                            description="Một số sản phẩm không có đủ số lượng trong kho. Vui lòng kiểm tra lại trước khi xác nhận đơn hàng."
                            type="warning"
                            showIcon
                        />
                    )}

                    {/* Order Items Table */}
                    <div>
                        <h3 className="font-semibold mb-2">Danh sách sản phẩm</h3>
                        <Table
                            columns={columns}
                            dataSource={itemsWithStock}
                            rowKey="orderItemId"
                            pagination={false}
                            bordered
                            size="small"
                            rowClassName={(record) =>
                                !record.hasSufficientStock ? 'bg-red-50' : ''
                            }
                        />
                    </div>

                    {/* Confirmation instructions */}
                    {order.status === 'CREATED' && (
                        <Alert
                            message={
                                canConfirm()
                                    ? 'Đơn hàng đủ điều kiện xác nhận'
                                    : 'Không thể xác nhận đơn hàng'
                            }
                            description={
                                canConfirm()
                                    ? 'Tất cả sản phẩm đều có đủ số lượng trong kho. Bạn có thể xác nhận đơn hàng này.'
                                    : 'Vui lòng đảm bảo tất cả sản phẩm đều có đủ số lượng trong kho trước khi xác nhận.'
                            }
                            type={canConfirm() ? 'success' : 'info'}
                            showIcon
                        />
                    )}
                </div>
            ) : null}
        </Modal>
    );
}

export default OrderConfirmationModal;
