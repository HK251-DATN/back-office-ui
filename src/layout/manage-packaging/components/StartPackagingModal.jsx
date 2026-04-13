// src/layout/manage-packaging/components/StartPackagingModal.jsx
import { Modal, Form, Select, Checkbox, Input, Spin, Alert, Descriptions, Tag, Divider, message } from 'antd';
import { useState, useEffect } from 'react';
import { UserOutlined, InboxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getPackagingEmployees, startPackagingTask } from '../../../services/packagingService';

const { TextArea } = Input;

const ORDER_TYPE_CONFIG = {
  FRESH: { emoji: '🥬', label: 'Tươi sống', color: 'green' },
  FROZEN: { emoji: '❄️', label: 'Đông lạnh', color: 'cyan' },
  DRY: { emoji: '📦', label: 'Khô', color: 'default' }
};

const UNIT_LABELS = {
  KILOGRAM: 'kg',
  GRAM: 'g',
  LITER: 'L',
  MILLILITER: 'mL'
};

const BOX_SIZE_LABELS = {
  SMALL: 'Nhỏ',
  MEDIUM: 'Vừa',
  LARGE: 'Lớn',
  EXTRA_LARGE: 'Rất lớn'
};

function StartPackagingModal({ task, open, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!open) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getPackagingEmployees('AVAILABLE');

        if (response.data.type === 'GOOD') {
          setEmployees(response.data.detail || []);
        } else {
          setError(response.data.message || 'Không thể tải danh sách nhân viên');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();

    // Reset form when modal opens
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await startPackagingTask(task.taskId, {
        employeeId: values.employeeId,
        notes: values.notes || '',
        checklist: {
          itemsVerified: values.itemsVerified || false,
          packagingMaterialsPrepared: values.packagingMaterialsPrepared || false,
          temperatureChecked: values.temperatureChecked || false,
          specialInstructionsReviewed: values.specialInstructionsReviewed || false
        }
      });

      if (response.data.type === 'GOOD') {
        message.success('Bắt đầu đóng gói thành công');
        form.resetFields();
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        setError(response.data.message || 'Không thể bắt đầu đóng gói');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra');
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  if (!task) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <InboxOutlined style={{ fontSize: '1.25rem' }} />
          <span>Bắt đầu đóng gói - Đơn hàng {task.orderId}</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText="Bắt đầu đóng gói"
      cancelText="Hủy"
      confirmLoading={submitting}
      width="90%"
      style={{ maxWidth: '50rem' }}
      destroyOnClose
    >
      {loading && (
        <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: '1rem', color: '#999' }}>Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '1rem' }}
        />
      )}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Order Summary */}
          <div>
            <h4 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>
              <InboxOutlined style={{ marginRight: '0.5rem' }} />
              Thông tin đơn hàng
            </h4>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã đơn">
                <strong>{task.orderId}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Loại đơn">
                <Tag color={ORDER_TYPE_CONFIG[task.orderType]?.color}>
                  {ORDER_TYPE_CONFIG[task.orderType]?.emoji} {ORDER_TYPE_CONFIG[task.orderType]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {task.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Số món">
                {task.itemCount} món
              </Descriptions.Item>
              <Descriptions.Item label="Tổng trọng lượng">
                {task.totalWeight} {UNIT_LABELS[task.weightUnit]}
              </Descriptions.Item>
              <Descriptions.Item label="Deadline">
                <strong style={{ color: '#ff4d4f' }}>
                  {new Date(task.deadline).toLocaleString('vi-VN')}
                </strong>
              </Descriptions.Item>
            </Descriptions>

            {task.specialInstructions && (
              <Alert
                message="Lưu ý đặc biệt"
                description={task.specialInstructions}
                type="warning"
                showIcon
                style={{ marginTop: '0.75rem' }}
              />
            )}
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Assignment Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              itemsVerified: false,
              packagingMaterialsPrepared: false,
              temperatureChecked: false,
              specialInstructionsReviewed: false
            }}
          >
            <Form.Item
              name="employeeId"
              label={
                <span>
                  <UserOutlined style={{ marginRight: '0.375rem' }} />
                  Phân công nhân viên
                </span>
              }
              rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
            >
              <Select
                placeholder="Chọn nhân viên đóng gói"
                size="large"
                disabled={employees.length === 0}
                notFoundContent={
                  employees.length === 0 ? 'Không có nhân viên sẵn sàng' : 'Không tìm thấy'
                }
              >
                {employees.map((emp) => (
                  <Select.Option key={emp.employeeId} value={emp.employeeId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        <UserOutlined style={{ marginRight: '0.5rem' }} />
                        {emp.name}
                      </span>
                      <Tag color="green" style={{ fontSize: '0.6875rem' }}>
                        {emp.stats?.ordersToday || 0} đơn hôm nay
                      </Tag>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={
                <span>
                  <CheckCircleOutlined style={{ marginRight: '0.375rem' }} />
                  Checklist chuẩn bị
                </span>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Form.Item name="itemsVerified" valuePropName="checked" noStyle>
                  <Checkbox>Đã kiểm tra danh sách sản phẩm</Checkbox>
                </Form.Item>

                <Form.Item name="packagingMaterialsPrepared" valuePropName="checked" noStyle>
                  <Checkbox>
                    Đã chuẩn bị vật liệu đóng gói
                    {task.packagingRequirements && (
                      <span style={{ marginLeft: '0.5rem', color: '#666', fontSize: '0.75rem' }}>
                        ({BOX_SIZE_LABELS[task.packagingRequirements.boxSize]}
                        {task.packagingRequirements.needsIcePack && `, ${task.packagingRequirements.icePackCount} ice pack`}
                        {task.packagingRequirements.needsInsulation && ', túi cách nhiệt'}
                        {task.packagingRequirements.fragile && ', hàng dễ vỡ'})
                      </span>
                    )}
                  </Checkbox>
                </Form.Item>

                {(task.orderType === 'FROZEN' || task.orderType === 'FRESH') && (
                  <Form.Item name="temperatureChecked" valuePropName="checked" noStyle>
                    <Checkbox>
                      Đã kiểm tra nhiệt độ khu vực làm việc
                      <span style={{ marginLeft: '0.5rem', color: '#666', fontSize: '0.75rem' }}>
                        ({task.orderType === 'FROZEN' ? '< 0°C' : '< 5°C'})
                      </span>
                    </Checkbox>
                  </Form.Item>
                )}

                {task.specialInstructions && (
                  <Form.Item name="specialInstructionsReviewed" valuePropName="checked" noStyle>
                    <Checkbox style={{ color: '#fa8c16' }}>
                      Đã đọc và hiểu lưu ý đặc biệt
                    </Checkbox>
                  </Form.Item>
                )}
              </div>
            </Form.Item>

            <Form.Item
              name="notes"
              label="Ghi chú (tuỳ chọn)"
            >
              <TextArea
                rows={3}
                placeholder="Nhập ghi chú về quá trình đóng gói..."
              />
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  );
}

export default StartPackagingModal;
