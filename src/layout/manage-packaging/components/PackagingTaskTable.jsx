// src/layout/manage-packaging/components/PackagingTaskTable.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Tag, message, Space, Button, Avatar, Tooltip, Badge } from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { getPackagingTasks } from '../../../services/packagingService';
import ViewButton from '../../../components/ViewButton';

dayjs.extend(relativeTime);
dayjs.locale('vi');

// Priority configuration
const PRIORITY_CONFIG = {
  HIGH: { color: 'red', label: 'Cao', icon: <WarningOutlined /> },
  MEDIUM: { color: 'orange', label: 'Trung bình', icon: <ClockCircleOutlined /> },
  LOW: { color: 'blue', label: 'Thấp', icon: <CheckCircleOutlined /> }
};

// Status configuration
const STATUS_CONFIG = {
  WAITING: { color: 'gold', label: 'Chờ đóng gói' },
  PACKAGING: { color: 'processing', label: 'Đang đóng gói' },
  QUALITY_CHECK: { color: 'purple', label: 'Kiểm tra chất lượng' },
  READY_FOR_DELIVERY: { color: 'success', label: 'Sẵn sàng giao' }
};

// Order type configuration
const ORDER_TYPE_CONFIG = {
  FRESH: { emoji: '🥬', label: 'Tươi sống', color: 'green' },
  FROZEN: { emoji: '❄️', label: 'Đông lạnh', color: 'cyan' },
  DRY: { emoji: '📦', label: 'Khô', color: 'default' }
};

// Unit labels
const UNIT_LABELS = {
  KILOGRAM: 'kg',
  GRAM: 'g',
  LITER: 'L',
  MILLILITER: 'mL'
};

/**
 * Calculate time remaining until deadline
 * Returns { text, color, isOverdue }
 */
const getDeadlineInfo = (deadline) => {
  const now = dayjs();
  const deadlineTime = dayjs(deadline);
  const diffMinutes = deadlineTime.diff(now, 'minute');

  if (diffMinutes < 0) {
    // Overdue
    const absDiffMinutes = Math.abs(diffMinutes);
    const hours = Math.floor(absDiffMinutes / 60);
    const minutes = absDiffMinutes % 60;

    return {
      text: hours > 0 ? `Quá hạn ${hours}h ${minutes}m` : `Quá hạn ${minutes}m`,
      color: 'red',
      isOverdue: true
    };
  } else if (diffMinutes < 60) {
    // Less than 1 hour - urgent
    return {
      text: `${diffMinutes}m còn lại`,
      color: 'red',
      isOverdue: false
    };
  } else if (diffMinutes < 120) {
    // Less than 2 hours - warning
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return {
      text: `${hours}h ${minutes}m còn lại`,
      color: 'orange',
      isOverdue: false
    };
  } else {
    // More than 2 hours - normal
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return {
      text: `${hours}h ${minutes}m còn lại`,
      color: 'green',
      isOverdue: false
    };
  }
};

function PackagingTaskTable({ refreshTrigger, filters, onTaskDetail, onStartTask, onQualityCheck }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Stabilize filters object to prevent infinite re-renders
  const stableFilters = useMemo(() => filters || {}, [filters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPackagingTasks({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        ...stableFilters
      });

      if (response.data.type === 'GOOD') {
        const { tasks, totalElements, totalPages } = response.data.detail;
        setData(Array.isArray(tasks) ? tasks : []);
        setPagination(prev => ({
          ...prev,
          total: totalElements || 0
        }));
      } else if (response.data.type === 'SKIP_AS_GOOD') {
        setData([]);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu đơn hàng đóng gói');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, stableFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
  };

  const handleView = (record) => {
    if (onTaskDetail) {
      onTaskDetail(record);
    }
  };

  const handleStart = (record) => {
    if (onStartTask) {
      onStartTask(record);
    }
  };

  const handleQualityCheckClick = (record) => {
    if (onQualityCheck) {
      onQualityCheck(record);
    }
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      key: 'orderId',
      width: '8%',
      render: (orderId, record) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            {orderId}
          </div>
          <Tag
            color={ORDER_TYPE_CONFIG[record.orderType]?.color}
            style={{ fontSize: '0.6875rem' }}
          >
            {ORDER_TYPE_CONFIG[record.orderType]?.emoji} {ORDER_TYPE_CONFIG[record.orderType]?.label}
          </Tag>
        </div>
      )
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: '13%',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500, marginBottom: '0.125rem' }}>
              {record.customerName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>
              {record.customerPhone}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
      width: '14%',
      ellipsis: {
        showTitle: false
      },
      render: (address) => (
        <Tooltip placement="topLeft" title={address}>
          <span style={{ fontSize: '0.8125rem', color: '#666' }}>{address}</span>
        </Tooltip>
      )
    },
    {
      title: 'Sản phẩm',
      key: 'items',
      width: '9%',
      align: 'center',
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            {record.itemCount} món
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666' }}>
            {record.totalWeight} {UNIT_LABELS[record.weightUnit]}
          </div>
        </div>
      )
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      width: '12%',
      sorter: true,
      render: (deadline) => {
        const deadlineInfo = getDeadlineInfo(deadline);
        return (
          <div>
            <div style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
              {dayjs(deadline).format('HH:mm - DD/MM')}
            </div>
            <Badge
              status={deadlineInfo.isOverdue ? 'error' : 'processing'}
              text={
                <span style={{ color: deadlineInfo.color, fontWeight: 500, fontSize: '0.75rem' }}>
                  {deadlineInfo.text}
                </span>
              }
            />
          </div>
        );
      }
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: '8%',
      align: 'center',
      sorter: true,
      render: (priority) => {
        const config = PRIORITY_CONFIG[priority];
        return (
          <Tag
            color={config?.color}
            icon={config?.icon}
          >
            {config?.label}
          </Tag>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '11%',
      render: (status) => {
        const config = STATUS_CONFIG[status];
        return (
          <Tag color={config?.color}>
            {config?.label}
          </Tag>
        );
      }
    },
    {
      title: 'Nhân viên',
      key: 'employee',
      width: '10%',
      render: (_, record) => {
        if (record.assignedEmployeeName) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Avatar
                src={`https://i.pravatar.cc/150?img=${record.assignedEmployeeId}`}
                size="small"
              />
              <span style={{ fontSize: '0.8125rem' }}>
                {record.assignedEmployeeName}
              </span>
            </div>
          );
        }
        return <span style={{ color: '#999', fontStyle: 'italic' }}>Chưa phân công</span>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Space size="small">
          <ViewButton onClick={() => handleView(record)} />

          {record.status === 'WAITING' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleStart(record)}
            >
              Bắt đầu
            </Button>
          )}

          {record.status === 'PACKAGING' && (
            <Button
              type="default"
              size="small"
              disabled
              loading
            >
              Đang xử lý
            </Button>
          )}

          {record.status === 'QUALITY_CHECK' && (
            <Button
              type="default"
              size="small"
              onClick={() => handleQualityCheckClick(record)}
              style={{
                borderColor: '#722ed1',
                color: '#722ed1'
              }}
            >
              Kiểm tra
            </Button>
          )}

          {record.status === 'READY_FOR_DELIVERY' && (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Sẵn sàng
            </Tag>
          )}
        </Space>
      )
    }
  ];

  // Special instructions indicator column
  const columnsWithInstructions = columns.map(col => {
    if (col.key === 'orderId') {
      return {
        ...col,
        render: (orderId, record) => (
          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
              {orderId}
              {record.specialInstructions && (
                <Tooltip title={record.specialInstructions}>
                  <WarningOutlined
                    style={{
                      marginLeft: '0.375rem',
                      color: '#faad14',
                      fontSize: '0.875rem'
                    }}
                  />
                </Tooltip>
              )}
            </div>
            <Tag
              color={ORDER_TYPE_CONFIG[record.orderType]?.color}
              style={{ fontSize: '0.6875rem' }}
            >
              {ORDER_TYPE_CONFIG[record.orderType]?.emoji} {ORDER_TYPE_CONFIG[record.orderType]?.label}
            </Tag>
          </div>
        )
      };
    }
    return col;
  });

  return (
    <Table
      columns={columnsWithInstructions}
      dataSource={data}
      rowKey="taskId"
      loading={loading}
      pagination={pagination}
      onChange={handleTableChange}
      locale={{
        emptyText: (
          <div style={{ padding: '2.5rem 0', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <div style={{ fontSize: '1rem', color: '#999' }}>
              Tất cả đơn hàng đã được đóng gói!
            </div>
          </div>
        )
      }}
      onRow={(record) => {
        const deadlineInfo = getDeadlineInfo(record.deadline);
        if (deadlineInfo.isOverdue && record.status !== 'READY_FOR_DELIVERY') {
          return {
            style: {
              backgroundColor: '#fff2e8'
            }
          };
        }
        return {};
      }}
    />
  );
}

export default PackagingTaskTable;
