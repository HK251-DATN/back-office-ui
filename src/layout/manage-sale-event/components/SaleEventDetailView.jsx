import { useState, useEffect, useCallback } from 'react';
import {
    Button, Table, Tag, Popconfirm, message, Image, Descriptions, Space, Tooltip, Badge,
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getSaleEventById, removeSaleProduct } from '../../../services/saleEventService';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';

function SaleEventDetailView({ eventId, eventMeta, onBack, onEditEvent }) {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [editOpen, setEditOpen] = useState(false);

    const fetchEvent = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getSaleEventById(eventId);
            if (response.data?.type === 'GOOD') {
                // GET/:id omits activeYn/enabledYn. Spread eventMeta first so API fields always win,
                // but meta values back-fill any gaps (e.g. activeYn, enabledYn).
                setEvent({ ...(eventMeta || {}), ...response.data.detail });
            } else {
                message.error('Không thể tải thông tin sự kiện');
            }
        } catch {
            message.error('Không thể tải thông tin sự kiện');
        } finally {
            setLoading(false);
        }
    }, [eventId, eventMeta]);

    useEffect(() => {
        if (eventId) fetchEvent();
    }, [fetchEvent]);

    const handleRemoveProduct = async (product) => {
        try {
            await removeSaleProduct(eventId, product.batchId);
            message.success('Đã xóa sản phẩm khỏi sự kiện');
            fetchEvent();
        } catch (err) {
            const errMsg = err?.response?.data?.message;
            message.error(errMsg || 'Xóa sản phẩm thất bại');
        }
    };

    const handleEditProduct = (product) => {
        setEditProduct(product);
        setEditOpen(true);
    };

    const handleAddSuccess = () => {
        setAddOpen(false);
        fetchEvent();
    };

    const handleEditSuccess = () => {
        setEditOpen(false);
        setEditProduct(null);
        fetchEvent();
    };

    const productColumns = [
        {
            title: 'Ảnh',
            dataIndex: 'img',
            key: 'img',
            width: 70,
            render: (img) =>
                img ? (
                    <Image src={img} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
                ) : (
                    <div
                        style={{
                            width: 50,
                            height: 50,
                            background: '#f0f0f0',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                        }}
                    >
                        🛒
                    </div>
                ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>Batch: {record.batchId}</div>
                </div>
            ),
        },
        {
            title: 'Giá gốc (₫)',
            dataIndex: 'originPrice',
            key: 'originPrice',
            width: 130,
            align: 'right',
            render: (val) => Number(val).toLocaleString('vi-VN'),
        },
        {
            title: 'Giảm (%)',
            dataIndex: 'disVal',
            key: 'disVal',
            width: 90,
            align: 'center',
            render: (val) => <Tag color="orange">-{val}%</Tag>,
        },
        {
            title: 'Giá khuyến mãi (₫)',
            dataIndex: 'salePrice',
            key: 'salePrice',
            width: 150,
            align: 'right',
            render: (val) => (
                <span style={{ color: '#cf1322', fontWeight: 600 }}>
                    {Number(val).toLocaleString('vi-VN')}
                </span>
            ),
        },
        {
            title: 'Phân bổ',
            key: 'qty',
            width: 150,
            align: 'center',
            render: (_, record) => {
                const ratio = record.maxQty > 0 ? record.curQty / record.maxQty : 1;
                const isLow = ratio < 0.2;
                return (
                    <div>
                        <span>
                            {record.curQty}/{record.maxQty}
                        </span>
                        {isLow && (
                            <Tooltip title="Tồn kho dưới 20%">
                                <WarningOutlined style={{ color: '#faad14', marginLeft: 6 }} />
                            </Tooltip>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Tối đa/người',
            dataIndex: 'maxBuy',
            key: 'maxBuy',
            width: 110,
            align: 'center',
            render: (val) => (val != null ? val : <span style={{ color: '#999' }}>—</span>),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 110,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditProduct(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa sản phẩm này khỏi sự kiện?"
                        onConfirm={() => handleRemoveProduct(record)}
                        okText="Xóa"
                        cancelText="Không"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button size="small" icon={<DeleteOutlined />} danger />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (!event && loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
                Đang tải...
            </div>
        );
    }

    if (!event) return null;

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
                        Quay lại
                    </Button>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{event.name}</h2>
                    {event.activeYn === 'Y' ? (
                        <Tag color="success">Đang hoạt động</Tag>
                    ) : (
                        <Tag color="default">Không hoạt động</Tag>
                    )}
                    {event.enabledYn === 'Y' ? (
                        <Tag color="blue">Hiển thị</Tag>
                    ) : (
                        <Tag color="default">Ẩn</Tag>
                    )}
                </div>
                <Button icon={<EditOutlined />} onClick={() => onEditEvent(event)}>
                    Chỉnh sửa sự kiện
                </Button>
            </div>

            {/* Event info */}
            <div className="bg-white p-5 rounded-xl border border-gray-200">
                <div className="flex gap-6">
                    {event.img && (
                        <Image
                            src={event.img}
                            width={200}
                            height={120}
                            style={{ objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                        />
                    )}
                    <div style={{ flex: 1 }}>
                        <Descriptions column={2} size="small">
                            <Descriptions.Item label="Mô tả" span={2}>
                                {event.description || <span style={{ color: '#999' }}>Không có mô tả</span>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày bắt đầu">
                                {event.beginDate ? dayjs(event.beginDate).format('DD/MM/YYYY HH:mm') : '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày kết thúc">
                                {event.endDate ? dayjs(event.endDate).format('DD/MM/YYYY HH:mm') : '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giờ hoạt động hàng ngày">
                                {event.beginTime && event.endTime
                                    ? `${event.beginTime} – ${event.endTime}`
                                    : '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Độ ưu tiên">
                                {event.displayPriority}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                </div>
            </div>

            {/* Products section */}
            <div className="bg-white p-5 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                        Sản phẩm trong sự kiện ({(event.products || []).length})
                    </h3>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setAddOpen(true)}
                    >
                        + Thêm sản phẩm
                    </Button>
                </div>

                <Table
                    columns={productColumns}
                    dataSource={event.products || []}
                    rowKey="batchId"
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 900 }}
                    locale={{ emptyText: 'Chưa có sản phẩm nào trong sự kiện' }}
                />
            </div>

            <AddProductModal
                open={addOpen}
                saleEventId={eventId}
                onClose={() => setAddOpen(false)}
                onSuccess={handleAddSuccess}
            />

            <EditProductModal
                open={editOpen}
                saleEventId={eventId}
                product={editProduct}
                onClose={() => {
                    setEditOpen(false);
                    setEditProduct(null);
                }}
                onSuccess={handleEditSuccess}
            />
        </div>
    );
}

export default SaleEventDetailView;
