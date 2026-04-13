// src/layout/manage-packaging/components/QualityCheckModal.jsx
import { Modal, Form, Checkbox, Input, Radio, Upload, Alert, Descriptions, Tag, message } from 'antd';
import { useState } from 'react';
import {
  SafetyOutlined,
  InboxOutlined,
  CameraOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { performQualityCheck } from '../../../services/packagingService';

const { TextArea } = Input;

const ORDER_TYPE_CONFIG = {
  FRESH: { emoji: '🥬', label: 'Tươi sống', color: 'green' },
  FROZEN: { emoji: '❄️', label: 'Đông lạnh', color: 'cyan' },
  DRY: { emoji: '📦', label: 'Khô', color: 'default' }
};

function QualityCheckModal({ task, open, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fileList, setFileList] = useState([]);

  const handleUploadChange = ({ fileList: newFileList }) => {
    // Limit to 3 photos
    setFileList(newFileList.slice(0, 3));
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ có thể tải lên file hình ảnh!');
      return Upload.LIST_IGNORE;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Hình ảnh phải nhỏ hơn 5MB!');
      return Upload.LIST_IGNORE;
    }

    return false; // Prevent auto upload, handle manually
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);

    try {
      // Prepare checklist
      const checklist = {
        itemsCorrect: values.itemsCorrect || false,
        packagingSecure: values.packagingSecure || false,
        labelsAttached: values.labelsAttached || false
      };

      // Add temperature check for fresh/frozen items
      if (task.orderType === 'FRESH' || task.orderType === 'FROZEN') {
        checklist.temperatureCheck = values.temperatureCheck || false;
      }

      // Prepare photos (in real app, would upload to server first)
      const photos = fileList.map((file) => ({
        uid: file.uid,
        name: file.name,
        url: file.url || URL.createObjectURL(file.originFileObj)
      }));

      const response = await performQualityCheck(task.taskId, {
        passed: values.result === 'pass',
        checklist,
        notes: values.notes || '',
        photos
      });

      if (response.data.type === 'GOOD') {
        message.success(
          values.result === 'pass'
            ? 'Kiểm tra chất lượng đạt - Đơn hàng sẵn sàng giao!'
            : 'Đơn hàng không đạt - Cần đóng gói lại'
        );
        form.resetFields();
        setFileList([]);
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        setError(response.data.message || 'Không thể hoàn tất kiểm tra chất lượng');
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
    setFileList([]);
    setError(null);
    onClose();
  };

  if (!task) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <SafetyOutlined style={{ fontSize: '1.25rem' }} />
          <span>Kiểm tra chất lượng - Đơn hàng {task.orderId}</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText="Hoàn tất kiểm tra"
      cancelText="Hủy"
      confirmLoading={submitting}
      width="90%"
      style={{ maxWidth: '50rem' }}
      destroyOnClose
    >
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
            {task.assignedEmployeeName && (
              <Descriptions.Item label="Nhân viên đóng gói" span={2}>
                {task.assignedEmployeeName}
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>

        {/* Quality Check Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            result: 'pass',
            itemsCorrect: false,
            packagingSecure: false,
            labelsAttached: false,
            temperatureCheck: false
          }}
        >
          <Form.Item
            label={
              <span style={{ fontWeight: 600 }}>
                <SafetyOutlined style={{ marginRight: '0.375rem' }} />
                Checklist kiểm tra
              </span>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Form.Item name="itemsCorrect" valuePropName="checked" noStyle>
                <Checkbox>✓ Sản phẩm đúng theo đơn hàng (số lượng, loại)</Checkbox>
              </Form.Item>

              <Form.Item name="packagingSecure" valuePropName="checked" noStyle>
                <Checkbox>✓ Đóng gói chắc chắn, không bị hở</Checkbox>
              </Form.Item>

              <Form.Item name="labelsAttached" valuePropName="checked" noStyle>
                <Checkbox>✓ Nhãn mác đã dán đầy đủ (tên, HSD, thông tin lưu trữ)</Checkbox>
              </Form.Item>

              {(task.orderType === 'FRESH' || task.orderType === 'FROZEN') && (
                <Form.Item name="temperatureCheck" valuePropName="checked" noStyle>
                  <Checkbox>
                    ✓ Nhiệt độ bao bì đạt yêu cầu
                    <span style={{ marginLeft: '0.5rem', color: '#666', fontSize: '0.75rem' }}>
                      ({task.orderType === 'FROZEN' ? '< 0°C' : '< 5°C'})
                    </span>
                  </Checkbox>
                </Form.Item>
              )}
            </div>
          </Form.Item>

          <Form.Item
            label={
              <span>
                <CameraOutlined style={{ marginRight: '0.375rem' }} />
                Hình ảnh kiểm tra (tùy chọn, tối đa 3 ảnh)
              </span>
            }
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              maxCount={3}
            >
              {fileList.length >= 3 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: '0.5rem' }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
              Chụp ảnh đơn hàng sau khi đóng gói để lưu trữ và xử lý khiếu nại
            </div>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea
              rows={3}
              placeholder="Nhập ghi chú về tình trạng đơn hàng, vấn đề phát hiện (nếu có)..."
            />
          </Form.Item>

          <Form.Item
            name="result"
            label={
              <span style={{ fontWeight: 600 }}>
                Kết quả kiểm tra
              </span>
            }
            rules={[{ required: true, message: 'Vui lòng chọn kết quả kiểm tra' }]}
          >
            <Radio.Group size="large">
              <Radio.Button value="pass" style={{ minWidth: '10rem', textAlign: 'center' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '0.5rem' }} />
                Đạt - Sẵn sàng giao hàng
              </Radio.Button>
              <Radio.Button value="fail" style={{ minWidth: '10rem', textAlign: 'center' }}>
                <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: '0.5rem' }} />
                Không đạt - Đóng gói lại
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

export default QualityCheckModal;
