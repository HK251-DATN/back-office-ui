import { useState, useEffect, useCallback } from 'react';
import {
    Modal, Table, Input, InputNumber, Form, Button, message, Space, Tag,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getAvailableBatchDetails, addProductToEvent } from '../../../services/saleEventService';

function AddProductModal({ open, saleEventId, onClose, onSuccess }) {
    const [form] = Form.useForm();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchBatches = useCallback(async (page = 1, pageSize = 10, searchStr = search) => {
        setLoading(true);
        try {
            const response = await getAvailableBatchDetails(searchStr, page, pageSize);
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
    }, [search]);

    useEffect(() => {
        if (open) {
            fetchBatches(1, pagination.pageSize, '');
            setSearch('');
            setSelectedBatch(null);
            form.resetFields();
        }
    }, [open]);

    const handleSearch = () => {
        fetchBatches(1, pagination.pageSize, search);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleRowSelect = (record) => {
        setSelectedBatch(record);
        form.setFieldsValue({ disVal: undefined, maxQty: undefined, maxBuy: undefined });
    };

    const handleAdd = async () => {
        if (!selectedBatch) {
            message.warning('Vui lòng chọn sản phẩm từ danh sách');
            return;
        }
        try {
            const values = await form.validateFields();
            setAdding(true);

            const payload = {
                saleEventId: String(saleEventId),
                batchId: String(selectedBatch.batchId),
                disVal: String(values.disVal),
                maxQty: String(values.maxQty),
                maxBuy: values.maxBuy ? String(values.maxBuy) : undefined,
            };

            const response = await addProductToEvent(payload);
            const type = response.data?.type;
            if (type === 'GOOD') {
                message.success('Đã thêm sản phẩm vào sự kiện');
                onSuccess();
            } else {
                message.error(response.data?.message || 'Thêm sản phẩm thất bại');
            }
        } catch (err) {
            if (err?.errorFields) return;
            const errMsg = err?.response?.data?.message;
            message.error(errMsg || 'Thêm sản phẩm thất bại');
        } finally {
            setAdding(false);
        }
    };

    const columns = [
        {
            title: 'Batch ID',
            dataIndex: 'batchId',
            key: 'batchId',
            width: 90,
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
            title: 'Tồn kho',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 90,
            align: 'center',
            render: (qty) => <Tag color="blue">{qty}</Tag>,
        },
        {
            title: 'Giá gốc (₫)',
            dataIndex: 'originPrice',
            key: 'originPrice',
            width: 120,
            align: 'right',
            render: (price) =>
                price != null ? Number(price).toLocaleString('vi-VN') : '—',
        },
    ];

    const rowSelection = {
        type: 'radio',
        selectedRowKeys: selectedBatch ? [selectedBatch.batchId] : [],
        onSelect: handleRowSelect,
    };

    return (
        <Modal
            title="Thêm sản phẩm vào sự kiện"
            open={open}
            onCancel={onClose}
            footer={null}
            width={760}
            destroyOnClose
        >
            <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                <Input
                    placeholder="Tìm theo tên sản phẩm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={handleSearch}
                    prefix={<SearchOutlined />}
                    style={{ flex: 1 }}
                />
                <Button onClick={handleSearch}>Tìm</Button>
            </div>

            <Table
                columns={columns}
                dataSource={batches}
                rowKey="batchId"
                loading={loading}
                rowSelection={rowSelection}
                size="small"
                pagination={{ pageSize: pagination.pageSize, showSizeChanger: false }}
                locale={{ emptyText: 'Không có sản phẩm khả dụng' }}
                onRow={(record) => ({
                    onClick: () => handleRowSelect(record),
                    style: { cursor: 'pointer' },
                })}
            />

            {selectedBatch && (
                <div
                    style={{
                        marginTop: 16,
                        padding: '16px',
                        background: '#f5f5f5',
                        borderRadius: 8,
                        border: '1px solid #d9d9d9',
                    }}
                >
                    <p style={{ fontWeight: 600, marginBottom: 12 }}>
                        Cấu hình giảm giá: <span style={{ color: '#1677ff' }}>{selectedBatch.name}</span>
                        &nbsp;(tồn kho: <strong>{selectedBatch.quantity}</strong> — giá gốc:{' '}
                        <strong>{Number(selectedBatch.originPrice).toLocaleString('vi-VN')} ₫</strong>)
                    </p>
                    <Form form={form} layout="inline">
                        <Form.Item
                            name="disVal"
                            label="Giảm giá (%)"
                            rules={[
                                { required: true, message: 'Bắt buộc' },
                                { type: 'number', min: 0, max: 100, message: '0–100' },
                            ]}
                        >
                            <InputNumber min={0} max={100} style={{ width: 100 }} />
                        </Form.Item>
                        <Form.Item
                            name="maxQty"
                            label="Số lượng tối đa"
                            rules={[
                                { required: true, message: 'Bắt buộc' },
                                { type: 'number', min: 1, max: selectedBatch.quantity, message: `1–${selectedBatch.quantity}` },
                            ]}
                        >
                            <InputNumber min={1} max={selectedBatch.quantity} style={{ width: 110 }} />
                        </Form.Item>
                        <Form.Item name="maxBuy" label="Tối đa/người mua">
                            <InputNumber min={1} style={{ width: 110 }} placeholder="Không giới hạn" />
                        </Form.Item>
                    </Form>
                    <div style={{ marginTop: 12, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setSelectedBatch(null)}>Hủy chọn</Button>
                            <Button type="primary" loading={adding} onClick={handleAdd}>
                                Thêm sản phẩm
                            </Button>
                        </Space>
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default AddProductModal;
