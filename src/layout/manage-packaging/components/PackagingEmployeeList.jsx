// src/layout/manage-packaging/components/PackagingEmployeeList.jsx
import { useState, useEffect, useCallback } from 'react';
import { Avatar, Badge, Progress, Skeleton, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getPackagingEmployees } from '../../../services/packagingService';

const STATUS_CONFIG = {
  AVAILABLE: {
    color: 'green',
    label: 'Sẵn sàng',
    badgeStatus: 'success'
  },
  BUSY: {
    color: 'blue',
    label: 'Đang làm việc',
    badgeStatus: 'processing'
  },
  BREAK: {
    color: 'orange',
    label: 'Nghỉ giải lao',
    badgeStatus: 'warning'
  },
  OFFLINE: {
    color: 'gray',
    label: 'Offline',
    badgeStatus: 'default'
  }
};

function EmployeeCard({ employee, onClick }) {
  const statusConfig = STATUS_CONFIG[employee.status] || STATUS_CONFIG.OFFLINE;

  return (
    <div
      onClick={() => onClick && onClick(employee)}
      style={{
        padding: '1rem',
        border: '1px solid #e8e8e8',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: '#fff'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#1890ff';
        e.currentTarget.style.boxShadow = '0 0.125rem 0.5rem rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e8e8e8';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header: Avatar + Name + Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <Badge
          status={statusConfig.badgeStatus}
          dot
          offset={[-0.125, '2.5rem']}
        >
          <Avatar
            size="large"
            src={employee.avatarUrl}
            icon={<UserOutlined />}
          />
        </Badge>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.125rem' }}>
            {employee.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#999' }}>
            {employee.role}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div
        style={{
          display: 'inline-block',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: `${statusConfig.color}15`,
          color: statusConfig.color === 'gray' ? '#666' : statusConfig.color,
          marginBottom: '0.75rem'
        }}
      >
        {statusConfig.label}
      </div>

      {/* Current Task (if busy) */}
      {employee.status === 'BUSY' && employee.currentTaskOrderId && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
            Đơn hàng: <strong>{employee.currentTaskOrderId}</strong>
          </div>
          <Progress
            percent={employee.currentTaskProgress || 0}
            size="small"
            strokeColor="#1890ff"
            showInfo={true}
          />
        </div>
      )}

      {/* Today's Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '0.5rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #f0f0f0'
        }}
      >
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1890ff' }}>
            {employee.stats?.ordersToday || 0}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#999' }}>Đơn hôm nay</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#52c41a' }}>
            {employee.stats?.averageTimePerOrder ? `${employee.stats.averageTimePerOrder}m` : '-'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#999' }}>Thời gian TB</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#722ed1' }}>
            {employee.stats?.onTimeRate ? `${Math.round(employee.stats.onTimeRate * 100)}%` : '-'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#999' }}>Đúng giờ</div>
        </div>
      </div>
    </div>
  );
}

function PackagingEmployeeList({ onEmployeeClick, refreshTrigger }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPackagingEmployees(null, true);

      if (response.data.type === 'GOOD') {
        setEmployees(response.data.detail || []);
      } else if (response.data.type === 'SKIP_AS_GOOD') {
        setEmployees([]);
      } else {
        setError(response.data.message || 'Không thể tải danh sách nhân viên');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees, refreshTrigger]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEmployees();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchEmployees]);

  const handleEmployeeClick = (employee) => {
    if (onEmployeeClick) {
      onEmployeeClick(employee);
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Skeleton active avatar paragraph={{ rows: 3 }} />
        <Skeleton active avatar paragraph={{ rows: 3 }} />
        <Skeleton active avatar paragraph={{ rows: 3 }} />
      </div>
    );
  }

  if (error && employees.length === 0) {
    return (
      <Empty
        description={
          <div>
            <div style={{ color: '#ff4d4f', marginBottom: '0.5rem' }}>
              {error}
            </div>
            <div
              style={{
                color: '#1890ff',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
              onClick={fetchEmployees}
            >
              Thử lại
            </div>
          </div>
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  if (employees.length === 0) {
    return (
      <Empty
        description="Không có nhân viên"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.employeeId}
          employee={employee}
          onClick={handleEmployeeClick}
        />
      ))}
    </div>
  );
}

export default PackagingEmployeeList;
