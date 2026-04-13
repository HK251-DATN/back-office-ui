// src/layout/manage-warehouse/components/RackDetailModal.jsx
import { Modal, Table, Tag, Progress, Alert, Spin, message } from 'antd';
import { useState, useEffect } from 'react';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';

const BASE_URL = API_URLS.STORAGE;

const STATUS_CONFIG = {
    ACTIVE: { color: 'green', label: 'Hoạt động' },
    INACTIVE: { color: 'gray', label: 'Không hoạt động' },
    FULL: { color: 'red', label: 'Đầy' },
    IN_MAINTAINANCE: { color: 'orange', label: 'Bảo trì' },
};

function RackDetailModal({ open, onClose, storageToolId }) {
    const [loading, setLoading] = useState(false);
    const [storageTool, setStorageTool] = useState(null);
    const [rack, setRack] = useState(null);
    const [levels, setLevels] = useState([]);

    const fetchRackDetails = async () => {
        setLoading(true);
        try {
            // Fetch storage tool info
            const toolResponse = await axios.get(`${BASE_URL}/api/storage-tool/${storageToolId}`);
            if (toolResponse.data.type === 'GOOD') {
                setStorageTool(toolResponse.data.detail);
            }

            // Fetch all racks and find the one linked to this storage tool
            const racksResponse = await axios.get(`${BASE_URL}/api/rack`, {
                params: { pageNum: 1, pageSize: 100 },
            });

            if (racksResponse.data.type === 'GOOD') {
                const foundRack = racksResponse.data.detail.find(
                    r => r.storageToolId === storageToolId
                );
                setRack(foundRack);

                if (foundRack) {
                    // Fetch rack levels for this rack
                    const levelsResponse = await axios.get(`${BASE_URL}/api/rack-level`, {
                        params: { pageNum: 1, pageSize: 100 },
                    });

                    if (levelsResponse.data.type === 'GOOD') {
                        const rackLevels = levelsResponse.data.detail.filter(
                            level => level.rackId === foundRack.rackId
                        );
                        setLevels(rackLevels);
                    }
                }
            }
        } catch (error) {
            message.error('Không thể tải thông tin kệ');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && storageToolId) {
            fetchRackDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, storageToolId]);

    const levelColumns = [
        {
            title: 'ID Tầng',
            dataIndex: 'rackLevelId',
            key: 'rackLevelId',
            width: '25%',
            render: (id) => <strong>Level #{id}</strong>,
        },
        {
            title: 'Tỷ lệ sử dụng',
            dataIndex: 'usagePercentage',
            key: 'usagePercentage',
            width: '50%',
            render: (usage) => (
                <Progress
                    percent={usage}
                    status={usage >= 90 ? 'exception' : usage >= 70 ? 'normal' : 'success'}
                />
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: '25%',
            render: (_, record) => {
                const usage = record.usagePercentage;
                if (usage >= 100) return <Tag color="red">Đầy</Tag>;
                if (usage >= 80) return <Tag color="orange">Gần đầy</Tag>;
                return <Tag color="green">Còn trống</Tag>;
            },
        },
    ];

    return (
        <Modal
            title={`Chi tiết kệ - Storage Tool #${storageToolId}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={800}
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
                                        <strong>Tỷ lệ sử dụng tổng thể:</strong>{' '}
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

                    {rack && (
                        <div style={{ marginBottom: 16 }}>
                            <h3>Thông tin kệ</h3>
                            <p>
                                <strong>Rack ID:</strong> {rack.rackId} |{' '}
                                <strong>Số tầng:</strong> {rack.numOfLevel}
                            </p>
                        </div>
                    )}

                    <h3 style={{ marginBottom: 12 }}>Danh sách tầng kệ</h3>
                    {levels.length > 0 ? (
                        <Table
                            columns={levelColumns}
                            dataSource={levels}
                            rowKey="rackLevelId"
                            pagination={false}
                            bordered
                        />
                    ) : (
                        <Alert
                            message="Không có dữ liệu tầng kệ"
                            type="warning"
                        />
                    )}
                </div>
            )}
        </Modal>
    );
}

export default RackDetailModal;
