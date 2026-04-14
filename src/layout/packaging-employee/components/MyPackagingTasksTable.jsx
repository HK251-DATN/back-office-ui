import { useState, useEffect } from 'react';
import { Table, Button, message, Tag, Progress, Space } from 'antd';
import { EyeOutlined, SyncOutlined } from '@ant-design/icons';
import { getMyPackagingTasks } from '../../../services/packagingEmployeeService';
import { formatDateTime } from '../../../utils/dateFormat';
import TaskExecutionModal from './TaskExecutionModal';

const MyPackagingTasksTable = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch packaging tasks
  const fetchTasks = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const response = await getMyPackagingTasks();
      const responseType = response.data?.type;

      // Handle GOOD and SKIP_AS_GOOD responses
      if (responseType === 'GOOD' || responseType === 'SKIP_AS_GOOD') {
        setTasks(response.data.detail || []);
        if (showSuccessMessage) {
          message.success('Đã làm mới danh sách nhiệm vụ');
        }
      } else {
        // Only show error for actual API failures
        setTasks([]);
        message.error('Không thể tải danh sách nhiệm vụ');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      message.error('Có lỗi xảy ra khi tải danh sách nhiệm vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle open task execution modal
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedTask(null);
    // Refresh tasks after modal closes
    fetchTasks();
  };

  // Get progress color
  const getProgressColor = (progress) => {
    if (progress >= 100) return '#52c41a'; // green
    if (progress >= 66) return '#1890ff'; // blue
    if (progress >= 33) return '#faad14'; // orange
    return '#ff4d4f'; // red
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'order_id',
      key: 'order_id',
      width: 120,
      render: (orderId) => (
        <span className="font-semibold text-blue-600">#{orderId}</span>
      ),
      fixed: 'left',
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.f_name} {record.l_name}
          </div>
          <div className="text-sm text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Tiến độ',
      dataIndex: 'packaging_progress',
      key: 'packaging_progress',
      width: 200,
      render: (progress) => {
        const percent = progress || 0;
        return (
          <div className="flex items-center gap-2">
            <Progress
              percent={percent}
              size="small"
              strokeColor={getProgressColor(percent)}
              className="flex-1"
            />
            <span className="text-sm font-semibold min-w-12 text-right">
              {percent}%
            </span>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusConfig = {
          PACKING: { color: 'processing', text: 'Đang đóng gói' },
          CONFIRMED: { color: 'blue', text: 'Đã xác nhận' },
          PACKED: { color: 'success', text: 'Đã đóng gói' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Cập nhật lúc',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 170,
      render: (date) => formatDateTime(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewTask(record)}
          size="large"
          className="min-h-12"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Stats Summary */}
      <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <Space size="large" className="flex-wrap">
          <div>
            <div className="text-sm text-gray-600">Nhiệm vụ của tôi</div>
            <div className="text-2xl font-bold text-green-600">{tasks.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Đang thực hiện</div>
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter(t => t.status === 'PACKING' && t.packaging_progress < 100).length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Gần hoàn thành</div>
            <div className="text-2xl font-bold text-orange-600">
              {tasks.filter(t => t.packaging_progress >= 66 && t.packaging_progress < 100).length}
            </div>
          </div>
          <div>
            <Button
              icon={<SyncOutlined />}
              onClick={() => fetchTasks(true)}
              loading={loading}
              size="large"
            >
              Làm mới
            </Button>
          </div>
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="order_id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} nhiệm vụ`,
        }}
        locale={{
          emptyText: 'Bạn chưa có nhiệm vụ nào',
        }}
        rowClassName={(record) => {
          if (record.packaging_progress >= 100) return 'bg-green-50';
          if (record.packaging_progress >= 66) return 'bg-blue-50';
          return '';
        }}
      />

      {/* Task Execution Modal */}
      {selectedTask && (
        <TaskExecutionModal
          visible={modalVisible}
          onClose={handleModalClose}
          task={selectedTask}
        />
      )}
    </div>
  );
};

export default MyPackagingTasksTable;
