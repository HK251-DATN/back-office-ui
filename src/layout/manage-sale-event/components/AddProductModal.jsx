import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Modal, Table, Input, InputNumber, Form, Button, message, Space, Tag,
    Select, Divider, Avatar, Badge, Segmented,
} from 'antd';
import { SearchOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { getAvailableBatchDetails, addProductToEvent } from '../../../services/saleEventService';
import { getCategories } from '../../../services/categoryService';
import { getProviderById } from '../../../services/providerService';

function AddProductModal({ open, saleEventId, onClose, onSuccess }) {
    const [form] = Form.useForm();

    // Data
    const [batches, setBatches] = useState([]);
    const [filteredBatches, setFilteredBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedProviderId, setSelectedProviderId] = useState(null);
    const [providerOptions, setProviderOptions] = useState([]);
    const [providerNames, setProviderNames] = useState({});
    const fetchingIds = useRef(new Set());

    // Selection & staging
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [staged, setStaged] = useState([]);

    useEffect(() => {
        if (!open) return;
        getCategories()
            .then(res => { if (res.data?.type === 'GOOD') setCategories(res.data.detail); })
            .catch(() => {});
    }, [open]);

    const fetchBatches = useCallback(async (searchStr = '') => {
        setLoading(true);
        try {
            const response = await getAvailableBatchDetails(searchStr, 1, 200);
            const type = response.data?.type;
            if (type === 'GOOD') {
                setBatches(Array.isArray(response.data.detail) ? response.data.detail : []);
            } else if (type === 'SKIP_AS_GOOD') {
                setBatches([]);
            }
        } catch {
            message.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            fetchBatches('');
            setSearch('');
            setSelectedCategoryId(null);
            setSelectedProviderId(null);
            setSelectedBatch(null);
            setStaged([]);
            setProviderNames({});
            fetchingIds.current.clear();
            form.resetFields();
        }
    }, [open]);

    // Derive unique provider IDs from batches and fetch their names
    useEffect(() => {
        const uniqueIds = [...new Set(batches.map(b => b.providerId).filter(Boolean))];
        setProviderOptions(uniqueIds);
        uniqueIds.forEach(id => {
            if (providerNames[id] || fetchingIds.current.has(id)) return;
            fetchingIds.current.add(id);
            getProviderById(id)
                .then(res => {
                    if (res.data?.type === 'GOOD') {
                        const d = res.data.detail;
                        setProviderNames(prev => ({
                            ...prev,
                            [id]: `${d.fName} ${d.lName}`.trim() || `#${id}`,
                        }));
                    }
                })
                .catch(() => {})
                .finally(() => fetchingIds.current.delete(id));
        });
    }, [batches]);

    // Apply category + provider filters client-side
    useEffect(() => {
        let result = batches;
        if (selectedCategoryId) {
            result = result.filter(b => b.categoryId === selectedCategoryId);
        }
        if (selectedProviderId) {
            result = result.filter(b => String(b.providerId) === String(selectedProviderId));
        }
        setFilteredBatches(result);
    }, [batches, selectedCategoryId, selectedProviderId]);

    const handleSearch = () => fetchBatches(search);

    const handleRowSelect = (record) => {
        if (staged.some(s => s.batch.batchId === record.batchId)) {
            message.warning('Sản phẩm này đã có trong danh sách');
            return;
        }
        setSelectedBatch(record);
        form.resetFields();
    };

    const handleStage = async () => {
        try {
            const values = await form.validateFields();
            const mode = values.discountMode ?? 'PERCENTAGE';
            let disVal;
            let displayDiscount;
            if (mode === 'FIXED') {
                const pct = Math.min(100, Math.round((values.fixedAmount / selectedBatch.originPrice) * 100));
                disVal = pct;
                displayDiscount = { mode: 'FIXED', amount: values.fixedAmount, pct };
            } else {
                disVal = values.disVal;
                displayDiscount = { mode: 'PERCENTAGE', pct: values.disVal };
            }
            setStaged(prev => [...prev, {
                batch: selectedBatch,
                disVal,
                displayDiscount,
                maxQty: values.maxQty,
                maxBuy: values.maxBuy,
            }]);
            message.success(`Đã thêm "${selectedBatch.name}" vào danh sách`);
            setSelectedBatch(null);
            form.resetFields();
        } catch {
            // validation error — stay open
        }
    };

    const handleRemoveStaged = (batchId) => {
        setStaged(prev => prev.filter(s => s.batch.batchId !== batchId));
    };

    const handleConfirmAll = async () => {
        if (staged.length === 0) return;
        setSubmitting(true);
        try {
            const results = await Promise.allSettled(
                staged.map(item =>
                    addProductToEvent({
                        saleEventId: String(saleEventId),
                        batchId: String(item.batch.batchId),
                        disVal: String(item.disVal),
                        maxQty: String(item.maxQty),
                        maxBuy: item.maxBuy ? String(item.maxBuy) : undefined,
                    })
                )
            );
            const successCount = results.filter(
                r => r.status === 'fulfilled' && r.value?.data?.type === 'GOOD'
            ).length;
            if (successCount === staged.length) {
                message.success(`Đã thêm ${successCount} sản phẩm vào sự kiện`);
            } else {
                message.warning(`${successCount}/${staged.length} sản phẩm được thêm thành công`);
            }
            onSuccess();
        } finally {
            setSubmitting(false);
        }
    };

    const stagedIds = new Set(staged.map(s => s.batch.batchId));

    const productColumns = [
        {
            title: 'Ảnh',
            dataIndex: 'img',
            key: 'img',
            width: 56,
            render: (img, record) => (
                <Avatar shape="square" size={40} src={img} alt={record.name} />
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{record.description}</div>
                </div>
            ),
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'providerId',
            key: 'providerId',
            width: 140,
            render: (id) => id ? (providerNames[id] || `#${id}`) : '—',
        },
        {
            title: 'Tồn kho',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 80,
            align: 'center',
            render: (qty) => <Tag color="blue">{qty}</Tag>,
        },
        {
            title: 'Giá gốc (₫)',
            dataIndex: 'originPrice',
            key: 'originPrice',
            width: 120,
            align: 'right',
            render: (price) => price != null ? Number(price).toLocaleString('vi-VN') : '—',
        },
    ];

    const stagedColumns = [
        {
            title: 'Sản phẩm',
            key: 'name',
            render: (_, item) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{item.batch.name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>Batch #{item.batch.batchId}</div>
                </div>
            ),
        },
        {
            title: 'Giảm giá',
            key: 'disVal',
            width: 130,
            align: 'center',
            render: (_, item) => {
                const d = item.displayDiscount;
                if (d?.mode === 'FIXED') {
                    return (
                        <Space size={4}>
                            <Tag color="volcano">-{Number(d.amount).toLocaleString('vi-VN')}₫</Tag>
                            <span style={{ fontSize: 11, color: '#888' }}>({d.pct}%)</span>
                        </Space>
                    );
                }
                return <Tag color="volcano">{item.disVal}%</Tag>;
            },
        },
        {
            title: 'SL tối đa',
            dataIndex: 'maxQty',
            key: 'maxQty',
            width: 90,
            align: 'center',
        },
        {
            title: 'Tối đa/người',
            dataIndex: 'maxBuy',
            key: 'maxBuy',
            width: 110,
            align: 'center',
            render: (v) => v ?? '—',
        },
        {
            title: '',
            key: 'remove',
            width: 48,
            align: 'center',
            render: (_, item) => (
                <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveStaged(item.batch.batchId)}
                />
            ),
        },
    ];

    const rowSelection = {
        type: 'radio',
        selectedRowKeys: selectedBatch ? [selectedBatch.batchId] : [],
        onSelect: handleRowSelect,
        getCheckboxProps: (record) => ({ disabled: stagedIds.has(record.batchId) }),
    };

    return (
        <Modal
            title="Thêm sản phẩm vào sự kiện"
            open={open}
            onCancel={onClose}
            width={920}
            destroyOnClose
            footer={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#8c8c8c', fontSize: 13 }}>
                        {staged.length > 0
                            ? `${staged.length} sản phẩm đã chọn`
                            : 'Chưa chọn sản phẩm nào'}
                    </span>
                    <Space>
                        <Button onClick={onClose}>Đóng</Button>
                        <Button
                            type="primary"
                            loading={submitting}
                            disabled={staged.length === 0}
                            icon={<ShoppingCartOutlined />}
                            onClick={handleConfirmAll}
                        >
                            Xác nhận thêm ({staged.length})
                        </Button>
                    </Space>
                </div>
            }
        >
            {/* Filter bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <Input
                    placeholder="Tìm theo tên sản phẩm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={handleSearch}
                    prefix={<SearchOutlined />}
                    style={{ flex: 1, minWidth: 160 }}
                />
                <Select
                    placeholder="Danh mục"
                    allowClear
                    style={{ width: 160 }}
                    value={selectedCategoryId}
                    onChange={setSelectedCategoryId}
                    options={categories.map(c => ({ value: c.categoryId, label: c.name }))}
                />
                <Select
                    placeholder="Nhà cung cấp"
                    allowClear
                    style={{ width: 185 }}
                    value={selectedProviderId}
                    onChange={setSelectedProviderId}
                    options={providerOptions.map(id => ({
                        value: id,
                        label: providerNames[id] || `Nhà cung cấp #${id}`,
                    }))}
                    notFoundContent="Không có nhà cung cấp"
                />
                <Button onClick={handleSearch}>Tìm</Button>
            </div>

            {/* Product table */}
            <Table
                columns={productColumns}
                dataSource={filteredBatches}
                rowKey="batchId"
                loading={loading}
                rowSelection={rowSelection}
                size="small"
                pagination={{ pageSize: 8, showSizeChanger: false, showTotal: (t) => `${t} sản phẩm` }}
                locale={{ emptyText: 'Không có sản phẩm khả dụng' }}
                onRow={(record) => ({
                    onClick: () => { if (!stagedIds.has(record.batchId)) handleRowSelect(record); },
                    style: {
                        cursor: stagedIds.has(record.batchId) ? 'not-allowed' : 'pointer',
                        opacity: stagedIds.has(record.batchId) ? 0.45 : 1,
                    },
                })}
            />

            {/* Discount config panel */}
            {selectedBatch && (
                <div
                    style={{
                        marginTop: 12,
                        padding: '14px 16px',
                        background: '#f0f7ff',
                        borderRadius: 8,
                        border: '1px solid #91caff',
                    }}
                >
                    <div style={{ fontWeight: 600, marginBottom: 10 }}>
                        Cấu hình giảm giá:{' '}
                        <span style={{ color: '#1677ff' }}>{selectedBatch.name}</span>
                        &nbsp;— tồn kho: <strong>{selectedBatch.quantity}</strong>
                        &nbsp;— giá gốc:{' '}
                        <strong>{Number(selectedBatch.originPrice).toLocaleString('vi-VN')} ₫</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                        <Form form={form} layout="inline" style={{ flex: 1 }}>
                            <Form.Item name="discountMode" initialValue="PERCENTAGE">
                                <Segmented
                                    options={[
                                        { label: 'Theo %', value: 'PERCENTAGE' },
                                        { label: 'Theo ₫', value: 'FIXED' },
                                    ]}
                                    onChange={() => {
                                        form.setFieldsValue({ disVal: undefined, fixedAmount: undefined });
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                noStyle
                                shouldUpdate={(prev, cur) => prev.discountMode !== cur.discountMode}
                            >
                                {({ getFieldValue }) =>
                                    getFieldValue('discountMode') === 'FIXED' ? (
                                        <Form.Item
                                            name="fixedAmount"
                                            label="Giảm (₫)"
                                            rules={[
                                                { required: true, message: 'Bắt buộc' },
                                                {
                                                    type: 'number', min: 1,
                                                    max: selectedBatch.originPrice - 1,
                                                    message: `1–${(selectedBatch.originPrice - 1).toLocaleString('vi-VN')}`,
                                                },
                                            ]}
                                        >
                                            <InputNumber
                                                min={1}
                                                max={selectedBatch.originPrice - 1}
                                                style={{ width: 130 }}
                                                formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                                parser={v => v?.replace(/,/g, '') ?? ''}
                                            />
                                        </Form.Item>
                                    ) : (
                                        <Form.Item
                                            name="disVal"
                                            label="Giảm giá (%)"
                                            rules={[
                                                { required: true, message: 'Bắt buộc' },
                                                { type: 'number', min: 0, max: 100, message: '0–100' },
                                            ]}
                                        >
                                            <InputNumber min={0} max={100} style={{ width: 90 }} />
                                        </Form.Item>
                                    )
                                }
                            </Form.Item>
                            <Form.Item
                                name="maxQty"
                                label="SL tối đa"
                                rules={[
                                    { required: true, message: 'Bắt buộc' },
                                    {
                                        type: 'number',
                                        min: 1,
                                        max: selectedBatch.quantity,
                                        message: `1–${selectedBatch.quantity}`,
                                    },
                                ]}
                            >
                                <InputNumber min={1} max={selectedBatch.quantity} style={{ width: 100 }} />
                            </Form.Item>
                            <Form.Item name="maxBuy" label="Tối đa/người">
                                <InputNumber min={1} style={{ width: 110 }} placeholder="Không giới hạn" />
                            </Form.Item>
                        </Form>
                        <Space style={{ paddingTop: 4 }}>
                            <Button
                                size="small"
                                onClick={() => { setSelectedBatch(null); form.resetFields(); }}
                            >
                                Hủy
                            </Button>
                            <Button type="primary" size="small" onClick={handleStage}>
                                + Thêm vào danh sách
                            </Button>
                        </Space>
                    </div>
                </div>
            )}

            {/* Staged list */}
            {staged.length > 0 && (
                <>
                    <Divider orientation="left" style={{ marginTop: 16, marginBottom: 8, fontSize: 13 }}>
                        Danh sách đã chọn&nbsp;
                        <Tag color="blue" style={{ marginLeft: 2 }}>{staged.length}</Tag>
                    </Divider>
                    <Table
                        columns={stagedColumns}
                        dataSource={staged}
                        rowKey={item => item.batch.batchId}
                        size="small"
                        pagination={false}
                    />
                </>
            )}
        </Modal>
    );
}

export default AddProductModal;
