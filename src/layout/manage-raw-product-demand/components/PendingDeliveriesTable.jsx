import { Button, Space, Table, Tag, Tooltip } from "antd";
import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { useState } from "react";

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

const verificationTypeMap = {
  CERTIFICATE: { label: "Chứng chỉ", color: "blue" },
  VIDEO: { label: "Video", color: "green" },
};

const PendingDeliveriesTable = ({
  batches,
  loading,
  onAccept,
  onReject,
  onViewSubBatches,
  subSubcategoryMap,
  providerMap,
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const columns = [
    {
      title: "ID",
      dataIndex: "batchId",
      key: "batchId",
      width: 80,
    },
    {
      title: "Danh mục",
      dataIndex: "subSubcategoryId",
      key: "subSubcategoryId",
      render: (id) => subSubcategoryMap[id] || `ID: ${id}`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (val, record) => `${val} ${unitMap[record.unit] || record.unit}`,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "providerId",
      key: "providerId",
      render: (providerId, record) => {
        if (record.verificationType === "VIDEO" && !providerId) {
          return <Tag color="purple">Nhiều NCC</Tag>;
        }
        return providerMap[providerId] || `ID: ${providerId}`;
      },
    },
    {
      title: "Loại xác minh",
      dataIndex: "verificationType",
      key: "verificationType",
      render: (type) => {
        const config = verificationTypeMap[type] || { label: type, color: "default" };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Ngày nhận",
      dataIndex: "receivedAt",
      key: "receivedAt",
      render: (val) => val ? new Date(val).toLocaleString("vi-VN") : "-",
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expiredAt",
      key: "expiredAt",
      render: (val) => val ? new Date(val).toLocaleString("vi-VN") : "-",
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
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          {record.verificationType === "VIDEO" && !record.providerId && (
            <Tooltip title="Xem chi tiết batch con">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => onViewSubBatches(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="Chấp nhận giao hàng">
            <Button
              type="text"
              icon={<CheckOutlined />}
              style={{ color: "green" }}
              onClick={() => onAccept(record)}
            />
          </Tooltip>
          <Tooltip title="Từ chối giao hàng">
            <Button
              type="text"
              icon={<CloseOutlined />}
              danger
              onClick={() => onReject(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="batchId"
      columns={columns}
      dataSource={batches}
      loading={loading}
      pagination={{ pageSize: 10 }}
      scroll={{ x: 1200 }}
    />
  );
};

export default PendingDeliveriesTable;
