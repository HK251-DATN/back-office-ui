import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Avatar, Typography, message } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAvailableProducts, getProductDetails } from '../../../services/productBatchService';

const { Text } = Typography;

const UNIT_LABELS = {
    KILOGRAM: 'kg', GRAM: 'g', LITER: 'lít', MILLILITER: 'ml',
    PIECE: 'cái', DOZEN: 'tá', PACK: 'gói', BOX: 'hộp', BOTTLE: 'chai',
};

const DETAIL_STATUS_CONFIG = {
    STORED:     { color: 'green',    label: 'Đã lưu kho' },
    PROCESSING: { color: 'blue',     label: 'Đang xử lý' },
    SOLD:       { color: 'orange',   label: 'Đã bán' },
    EXPIRED:    { color: 'red',      label: 'Hết hạn' },
    PICKED:     { color: 'cyan',     label: 'Đã chọn' },
    IN_TRANSIT: { color: 'geekblue', label: 'Đang vận chuyển' },
    DELIVERED:  { color: 'purple',   label: 'Đã giao' },
    RETURNED:   { color: 'volcano',  label: 'Đã trả lại' },
    DISPOSED:   { color: 'magenta',  label: 'Đã hủy' },
};

const VERIFY_TYPE_CONFIG = {
    CERTIFICATE: { color: 'green', label: 'Chứng chỉ' },
    VIDEO:       { color: 'blue',  label: 'Video' },
};

// ── Inner sub-table ──────────────────────────────────────────────────────────

const detailColumns = [
    {
        title: 'ID',
        dataIndex: 'prodDetailId',
        key: 'prodDetailId',
        width: 80,
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 130,
        render: (status) => {
            const cfg = DETAIL_STATUS_CONFIG[status] || { color: 'default', label: status };
            return <Tag color={cfg.color}>{cfg.label}</Tag>;
        },
    },
    {
        title: 'Giá',
        dataIndex: 'price',
        key: 'price',
        width: 120,
        render: (price) => price != null ? `${price.toLocaleString('vi-VN')} ₫` : '—',
    },
    {
        title: 'Storage Tool',
        dataIndex: 'storageToolId',
        key: 'storageToolId',
        width: 110,
        render: (id) => id ?? '—',
    },
    {
        title: 'Sub-batch ID',
        dataIndex: 'subBatchId',
        key: 'subBatchId',
        width: 110,
        render: (id) => id ?? '—',
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 150,
        render: (d) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—',
    },
];

function ProductDetailsSubTable({ batchId }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetch = useCallback(async (page = 1, size = 10) => {
        setLoading(true);
        try {
            const res = await getProductDetails({ batchId, pageNum: page, pageSize: size });
            const type = res.data?.type;
            if (type === 'GOOD' || type === 'SKIP_AS_GOOD') {
                const detail = res.data.detail || {};
                setData(detail.data || []);
                setPagination({ current: detail.page ?? page, pageSize: detail.size ?? size, total: detail.totalElements ?? 0 });
            } else {
                setData([]);
            }
        } catch {
            message.error('Không thể tải chi tiết sản phẩm');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [batchId]);

    useEffect(() => { fetch(1, 10); }, [fetch]);

    return (
        <Table
            rowKey="prodDetailId"
            columns={detailColumns}
            dataSource={data}
            loading={loading}
            size="small"
            pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: false,
                showTotal: (t) => `${t} chi tiết`,
                onChange: (page, size) => fetch(page, size),
            }}
            style={{ margin: '8px 40px' }}
        />
    );
}

// ── Outer batch table ────────────────────────────────────────────────────────

const batchColumns = [
    {
        title: 'Batch ID',
        dataIndex: 'batchId',
        key: 'batchId',
        width: 90,
        render: (id) => <strong>#{id}</strong>,
    },
    {
        title: 'Sản phẩm',
        key: 'product',
        width: 200,
        render: (_, record) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar
                    size={32}
                    src={record.img || undefined}
                    icon={!record.img && <ShoppingOutlined />}
                    shape="square"
                />
                <div style={{ lineHeight: 1.3 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{record.name}</div>
                    <Text type="secondary" style={{ fontSize: 11 }}>ID: {record.prodGenId}</Text>
                </div>
            </div>
        ),
    },
    {
        title: 'Loại xác minh',
        dataIndex: 'verificationType',
        key: 'verificationType',
        width: 130,
        render: (type) => {
            const cfg = VERIFY_TYPE_CONFIG[type] || { color: 'default', label: type };
            return <Tag color={cfg.color}>{cfg.label}</Tag>;
        },
    },
    {
        title: 'SL batch',
        key: 'batchQuantity',
        width: 110,
        render: (_, record) =>
            `${record.batchQuantity} ${UNIT_LABELS[record.batchUnit] || record.batchUnit}`,
    },
    {
        title: 'Đơn vị đóng gói',
        key: 'unitQuantity',
        width: 130,
        render: (_, record) =>
            `${record.unitQuantity} ${UNIT_LABELS[record.unit] || record.unit} / gói`,
    },
    {
        title: 'Ngày nhận',
        dataIndex: 'receivedAt',
        key: 'receivedAt',
        width: 120,
        render: (d) => d ? dayjs(d).format('DD/MM/YYYY') : '—',
    },
    {
        title: 'Hết hạn',
        dataIndex: 'expiredAt',
        key: 'expiredAt',
        width: 120,
        render: (d) => d ? dayjs(d).format('DD/MM/YYYY') : '—',
    },
];

function ProductDetailTable({ refreshTrigger }) {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchBatches = useCallback(async (page, size) => {
        setLoading(true);
        try {
            const res = await getAvailableProducts({ pageNum: page, pageSize: size });
            const type = res.data?.type;
            if (type === 'GOOD' || type === 'SKIP_AS_GOOD') {
                const detail = res.data.detail || {};
                setBatches(detail.data || []);
                setPagination({ current: detail.page ?? page, pageSize: detail.size ?? size, total: detail.totalElements ?? 0 });
            } else {
                setBatches([]);
            }
        } catch {
            message.error('Không thể tải danh sách sản phẩm');
            setBatches([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBatches(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchBatches, refreshTrigger]);

    return (
        <Table
            className="border border-gray-200 rounded-2xl"
            rowKey="batchId"
            columns={batchColumns}
            dataSource={batches}
            loading={loading}
            expandable={{
                expandedRowRender: (record) => (
                    <ProductDetailsSubTable batchId={record.batchId} />
                ),
            }}
            pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (t) => `Tổng ${t} batch`,
                onChange: (page, size) => fetchBatches(page, size),
                onShowSizeChange: (_, size) => fetchBatches(1, size),
            }}
            scroll={{ x: 900 }}
        />
    );
}

export default ProductDetailTable;
