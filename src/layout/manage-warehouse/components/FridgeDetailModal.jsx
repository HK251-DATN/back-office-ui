// src/layout/manage-warehouse/components/FridgeDetailModal.jsx
import { Modal, Alert, Spin, Tag, Progress, message, Card, Statistic } from 'antd';
import { useState, useEffect } from 'react';
import { ThunderboltOutlined } from '@ant-design/icons';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';

const BASE_URL = API_URLS.STORAGE;

const STATUS_CONFIG = {
    ACTIVE: { color: 'green', label: 'Hoạt động' },
    INACTIVE: { color: 'gray', label: 'Không hoạt động' },
    FULL: { color: 'red', label: 'Đầy' },
    IN_MAINTAINANCE: { color: 'orange', label: 'Bảo trì' },
};

function FridgeDetailModal({ open, onClose, storageToolId }) {
    const [loading, setLoading] = useState(false);
    const [storageTool, setStorageTool] = useState(null);
    const [fridge, setFridge] = useState(null);

    const fetchFridgeDetails = async () => {
        setLoading(true);
        try {
            // Fetch storage tool info
            const toolResponse = await axios.get(`${BASE_URL}/api/storage-tool/${storageToolId}`);
            if (toolResponse.data.type === 'GOOD') {
                setStorageTool(toolResponse.data.detail);
            }

            // Fetch all fridges and find the one linked to this storage tool
            const fridgesResponse = await axios.get(`${BASE_URL}/api/fridge`, {
                params: { pageNum: 1, pageSize: 100 },
            });

            if (fridgesResponse.data.type === 'GOOD') {
                const foundFridge = fridgesResponse.data.detail.find(
                    f => f.storageToolId === storageToolId
                );
                setFridge(foundFridge);
            }
        } catch (error) {
            message.error('Không thể tải thông tin tủ lạnh');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && storageToolId) {
            fetchFridgeDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, storageToolId]);

    const getTemperatureStatus = (fridge) => {
        if (!fridge) return null;

        const { curTemp, minTemp, maxTemp } = fridge;

        if (curTemp < minTemp) {
            return {
                status: 'CRITICAL',
                color: 'red',
                message: `Quá lạnh! ${curTemp}°C thấp hơn mức tối thiểu ${minTemp}°C`,
                icon: '❄️❄️❄️',
            };
        }

        if (curTemp > maxTemp) {
            return {
                status: 'CRITICAL',
                color: 'red',
                message: `Quá nóng! ${curTemp}°C cao hơn mức tối đa ${maxTemp}°C`,
                icon: '🔥',
            };
        }

        const range = maxTemp - minTemp;
        const position = curTemp - minTemp;
        const percent = (position / range) * 100;

        if (percent < 20 || percent > 80) {
            return {
                status: 'WARNING',
                color: 'orange',
                message: `Gần đạt giới hạn ở ${curTemp}°C`,
                icon: '⚠️',
            };
        }

        return {
            status: 'OK',
            color: 'green',
            message: `Hoạt động bình thường ở ${curTemp}°C`,
            icon: '✅',
        };
    };

    const tempStatus = fridge ? getTemperatureStatus(fridge) : null;

    return (
        <Modal
            title={`Chi tiết tủ lạnh - Storage Tool #${storageToolId}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={700}
            destroyOnClose
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin size="large" />
                </div>
            ) : (
                <div>
                    {storageTool && (
                        <Alert
                            message="Thông tin Storage Tool"
                            description={
                                <div>
                                    <div style={{ marginBottom: 8 }}>
                                        <strong>Trạng thái:</strong>{' '}
                                        <Tag color={STATUS_CONFIG[storageTool.status]?.color}>
                                            {STATUS_CONFIG[storageTool.status]?.label}
                                        </Tag>
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <strong>Tỷ lệ sử dụng:</strong>{' '}
                                        <Progress
                                            percent={storageTool.usagePercentage}
                                            size="small"
                                            style={{ width: 200, display: 'inline-block', marginLeft: 8 }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <strong>Kho:</strong> Warehouse #{storageTool.warehouseId}
                                    </div>
                                    <div>
                                        <strong>Bảo trì lần cuối:</strong>{' '}
                                        {storageTool.lastMaintainanceDate || 'Chưa có thông tin'}
                                    </div>
                                </div>
                            }
                            type="info"
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    {fridge && (
                        <div>
                            <h3 style={{ marginBottom: 16 }}>Giám sát nhiệt độ</h3>

                            <Card style={{ marginBottom: 16, backgroundColor: '#f8f9fa' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <Statistic
                                        title="Nhiệt độ hiện tại"
                                        value={fridge.curTemp}
                                        suffix="°C"
                                        prefix={<ThunderboltOutlined />}
                                        valueStyle={{
                                            fontSize: 48,
                                            color: tempStatus?.color === 'red' ? '#ff4d4f' :
                                                   tempStatus?.color === 'orange' ? '#faad14' : '#52c41a',
                                        }}
                                    />
                                </div>

                                <div style={{ marginTop: 24, textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
                                        <div>
                                            <div style={{ color: '#999', fontSize: 12 }}>Nhiệt độ tối thiểu</div>
                                            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                                                {fridge.minTemp}°C
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#999', fontSize: 12 }}>Nhiệt độ tối đa</div>
                                            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }}>
                                                {fridge.maxTemp}°C
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 16, padding: '0 40px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 8,
                                            fontSize: 12,
                                            color: '#666',
                                        }}>
                                            <span>{fridge.minTemp}°C</span>
                                            <div style={{
                                                flex: 1,
                                                height: 8,
                                                background: 'linear-gradient(to right, #1890ff, #52c41a, #ff4d4f)',
                                                borderRadius: 4,
                                                position: 'relative',
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    left: `${((fridge.curTemp - fridge.minTemp) / (fridge.maxTemp - fridge.minTemp)) * 100}%`,
                                                    top: -4,
                                                    width: 16,
                                                    height: 16,
                                                    background: '#000',
                                                    borderRadius: '50%',
                                                    border: '2px solid white',
                                                    transform: 'translateX(-50%)',
                                                }} />
                                            </div>
                                            <span>{fridge.maxTemp}°C</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {tempStatus && (
                                <Alert
                                    message={`Trạng thái: ${tempStatus.icon}`}
                                    description={tempStatus.message}
                                    type={
                                        tempStatus.status === 'OK' ? 'success' :
                                        tempStatus.status === 'WARNING' ? 'warning' : 'error'
                                    }
                                    showIcon
                                />
                            )}

                            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fafafa', borderRadius: 4 }}>
                                <strong>Fridge ID:</strong> {fridge.fridgeId}
                            </div>
                        </div>
                    )}

                    {!fridge && !loading && (
                        <Alert
                            message="Không tìm thấy dữ liệu tủ lạnh"
                            type="warning"
                        />
                    )}
                </div>
            )}
        </Modal>
    );
}

export default FridgeDetailModal;
