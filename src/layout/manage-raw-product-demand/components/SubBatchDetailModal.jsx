import { Modal, Table, Tag, Space, Button, Tooltip, message } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { getSubBatchesByBatchId } from "../../../services/productBatchService";

const unitMap = {
  KILOGRAM: "kg",
  GRAM: "g",
  PIECE: "cái",
  DOZEN: "tá",
  LITER: "lít",
  MILLILITER: "ml",
  PACK: "gói",
  BOX: "hộp",
  BOTTLE: "chai",
};

const statusMap = {
  WAIT_FOR_DELIVERY: { label: "Chờ giao hàng", color: "orange" },
  PENDING: { label: "Chờ xử lý", color: "blue" },
  PROCESSED: { label: "Đã xử lý", color: "green" },
  REJECTED: { label: "Đã từ chối", color: "red" },
  EXPIRED: { label: "Hết hạn", color: "gray" },
};

const SubBatchDetailModal = ({
  open,
  onCancel,
  batch,
  providerMap,
  onAcceptSubBatch,
  onRejectSubBatch,
}) => {
  const [loading, setLoading] = useState(false);
  const [subBatches, setSubBatches] = useState([]);

  useEffect(() => {
    if (open && batch?.batchId) {
      fetchSubBatches();
    }
  }, [open, batch]);

  const fetchSubBatches = async () => {
    setLoading(true);
    try {
      const response = await getSubBatchesByBatchId(batch.batchId);
      const responseType = response.data?.type;
      if (responseType === "GOOD" || responseType === "SKIP_AS_GOOD") {
        setSubBatches(response.data.detail || []);
      } else {
        message.error("Không thể tải danh sách batch con");
      }
    } catch (error) {
      console.error("Error fetching sub-batches:", error);
      message.error("Lỗi khi tải danh sách batch con");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "subBatchId",
      key: "subBatchId",
      width: 80,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "providerId",
      key: "providerId",
      render: (providerId) => providerMap[providerId] || `ID: ${providerId}`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (val, record) => `${val} ${unitMap[record.unit] || record.unit}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "processStatus",
      key: "processStatus",
      render: (status) => {
        const config = statusMap[status] || { label: status, color: "default" };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (_, record) => (
        record.processStatus === "WAIT_FOR_DELIVERY" ? (
          <Space>
            <Tooltip title="Chấp nhận">
              <Button
                type="text"
                icon={<CheckOutlined />}
                style={{ color: "green" }}
                onClick={() => onAcceptSubBatch(record)}
              />
            </Tooltip>
            <Tooltip title="Từ chối">
              <Button
                type="text"
                icon={<CloseOutlined />}
                danger
                onClick={() => onRejectSubBatch(record)}
              />
            </Tooltip>
          </Space>
        ) : <span>-</span>
      ),
    },
  ];

  if (!batch) return null;

  return (
    <Modal
      open={open}
      title={`Chi tiết Batch con - Batch #${batch.batchId}`}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>
      ]}
      width={900}
    >
      <div style={{ marginBottom: 16 }}>
        <p><strong>Tổng số lượng batch cha:</strong> {batch.quantity} {unitMap[batch.unit] || batch.unit}</p>
        <p><strong>Loại xác minh:</strong> VIDEO (nhiều nhà cung cấp)</p>
      </div>

      <Table
        rowKey="subBatchId"
        columns={columns}
        dataSource={subBatches}
        loading={loading}
        pagination={false}
        scroll={{ x: 800 }}
      />
    </Modal>
  );
};

export default SubBatchDetailModal;
