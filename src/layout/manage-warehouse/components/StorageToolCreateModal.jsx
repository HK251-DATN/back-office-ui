// src/layout/manage-warehouse/components/StorageToolCreateModal.jsx
import { Modal, Form, Input, InputNumber, Select, Button, message, Radio, DatePicker, Divider } from 'antd';
import { useState, useEffect } from 'react';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';
import dayjs from 'dayjs';

const BASE_URL = API_URLS.STORAGE;

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'INACTIVE', label: 'Không hoạt động' },
    { value: 'FULL', label: 'Đầy' },
    { value: 'IN_MAINTAINANCE', label: 'Bảo trì' },
];

function StorageToolCreateModal({ open, onClose, onSuccess, warehouseId }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [toolType, setToolType] = useState('RACK');
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        if (open) {
            fetchWarehouses();
            form.resetFields();
            setToolType('RACK');
        }
    }, [open, form]);

    useEffect(() => {
        if (warehouseId && open) {
            form.setFieldValue('warehouseId', warehouseId);
        }
    }, [warehouseId, open, form]);

    const fetchWarehouses = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/warehouse`, {
                params: { pageNum: 1, pageSize: 100 },
            });
            if (response.data.type === 'GOOD') {
                setWarehouses(response.data.detail || []);
            }
        } catch (error) {
            console.error('Failed to fetch warehouses:', error);
        }
    };

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            // Step 1: Create StorageTool
            const toolPayload = {
                lastMaintainanceDate: values.lastMaintainanceDate
                    ? values.lastMaintainanceDate.format('YYYY-MM-DD')
                    : dayjs().format('YYYY-MM-DD'),
                status: values.status,
                usagePercentage: values.usagePercentage || 0,
                warehouseId: values.warehouseId,
                toolType: toolType,
            };

            const toolResponse = await axios.post(`${BASE_URL}/api/storage-tool`, toolPayload);

            if (toolResponse.data.type !== 'GOOD') {
                message.error(toolResponse.data.message || 'Tạo công cụ lưu trữ thất bại!');
                return;
            }

            const storageToolId = toolResponse.data.detail.storageToolId;

            // Step 2: Create Rack or Fridge based on type
            if (toolType === 'RACK') {
                await createRack(storageToolId, values.numOfLevel || 5);
            } else if (toolType === 'FRIDGE') {
                await createFridge(storageToolId, values);
            }

            message.success('Tạo công cụ lưu trữ thành công!');
            form.resetFields();
            onSuccess?.();
            onClose();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    const createRack = async (storageToolId, numOfLevel) => {
        // Create Rack entity
        const rackPayload = {
            numOfLevel: numOfLevel,
            storageToolId: storageToolId,
        };

        const rackResponse = await axios.post(`${BASE_URL}/api/rack`, rackPayload);

        if (rackResponse.data.type !== 'GOOD') {
            throw new Error(rackResponse.data.message || 'Tạo kệ thất bại!');
        }

        const rackId = rackResponse.data.detail.rackId;

        // Create RackLevel entities for each level
        for (let i = 0; i < numOfLevel; i++) {
            const levelPayload = {
                usagePercentage: 0,
                rackId: rackId,
            };

            await axios.post(`${BASE_URL}/api/rack-level`, levelPayload);
        }
    };

    const createFridge = async (storageToolId, values) => {
        // Validate temperatures
        if (values.minTemp >= values.maxTemp) {
            throw new Error('Nhiệt độ tối thiểu phải nhỏ hơn nhiệt độ tối đa!');
        }

        if (values.curTemp < values.minTemp || values.curTemp > values.maxTemp) {
            throw new Error('Nhiệt độ hiện tại phải nằm trong khoảng tối thiểu và tối đa!');
        }

        const fridgePayload = {
            curTemp: values.curTemp,
            minTemp: values.minTemp,
            maxTemp: values.maxTemp,
            storageToolId: storageToolId,
        };

        const fridgeResponse = await axios.post(`${BASE_URL}/api/fridge`, fridgePayload);

        if (fridgeResponse.data.type !== 'GOOD') {
            throw new Error(fridgeResponse.data.message || 'Tạo tủ lạnh thất bại!');
        }
    };

    return (
        <Modal
            title="Thêm công cụ lưu trữ mới"
            open={open}
            onCancel={onClose}
            footer={null}
            width={650}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="Loại công cụ"
                    name="toolType"
                    initialValue="RACK"
                >
                    <Radio.Group onChange={(e) => setToolType(e.target.value)} value={toolType}>
                        <Radio value="RACK">🗄️ Kệ (Rack)</Radio>
                        <Radio value="FRIDGE">❄️ Tủ lạnh (Fridge)</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    label="Kho"
                    name="warehouseId"
                    rules={[{ required: true, message: 'Vui lòng chọn kho!' }]}
                >
                    <Select
                        placeholder="Chọn kho"
                        options={warehouses.map(wh => ({
                            value: wh.warehouseId,
                            label: `Kho #${wh.warehouseId} - ${wh.address}`,
                        }))}
                        disabled={!!warehouseId}
                    />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        initialValue="ACTIVE"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Select placeholder="Chọn trạng thái" options={STATUS_OPTIONS} />
                    </Form.Item>

                    <Form.Item
                        label="Tỷ lệ sử dụng (%)"
                        name="usagePercentage"
                        initialValue={0}
                        rules={[
                            { required: true, message: 'Vui lòng nhập tỷ lệ!' },
                            { type: 'number', min: 0, max: 100, message: 'Phải từ 0-100!' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            max={100}
                            addonAfter="%"
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    label="Ngày bảo trì lần cuối"
                    name="lastMaintainanceDate"
                    initialValue={dayjs()}
                >
                    <DatePicker
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày"
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                {toolType === 'RACK' && (
                    <>
                        <Divider>Thông tin kệ</Divider>
                        <Form.Item
                            label="Số tầng"
                            name="numOfLevel"
                            initialValue={5}
                            rules={[
                                { required: true, message: 'Vui lòng nhập số tầng!' },
                                { type: 'number', min: 1, max: 20, message: 'Phải từ 1-20 tầng!' },
                            ]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Số tầng của kệ"
                                min={1}
                                max={20}
                            />
                        </Form.Item>
                    </>
                )}

                {toolType === 'FRIDGE' && (
                    <>
                        <Divider>Thông tin tủ lạnh</Divider>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                            <Form.Item
                                label="Nhiệt độ tối thiểu (°C)"
                                name="minTemp"
                                initialValue={-10}
                                rules={[{ required: true, message: 'Nhập nhiệt độ tối thiểu!' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="-10"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Nhiệt độ hiện tại (°C)"
                                name="curTemp"
                                initialValue={-5}
                                rules={[{ required: true, message: 'Nhập nhiệt độ hiện tại!' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="-5"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Nhiệt độ tối đa (°C)"
                                name="maxTemp"
                                initialValue={0}
                                rules={[{ required: true, message: 'Nhập nhiệt độ tối đa!' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="0"
                                />
                            </Form.Item>
                        </div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: -8 }}>
                            Lưu ý: Nhiệt độ hiện tại phải nằm trong khoảng min-max
                        </div>
                    </>
                )}

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Tạo công cụ lưu trữ
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default StorageToolCreateModal;
