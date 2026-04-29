import { Button, Popconfirm, Space, Table, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const statusMap = {
  PENDING: { label: "Chờ xử lý", color: "orange" },
  PARTIALLY_FULFILLED: { label: "Hoàn thành một phần", color: "blue" },
  FULFILLED: { label: "Đã hoàn thành", color: "green" },
  CANCELLED: { label: "Đã hủy", color: "red" },
};

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

const RawProductDemandTable = ({
  demands,
  loading,
  pagination,
  onTableChange,
  onEdit,
  onDelete,
  subSubcategoryMap,
}) => {
  const columns = [
    {
      title: "ID",
      dataIndex: "demandId",
      key: "demandId",
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
      dataIndex: "unitQuantity",
      key: "unitQuantity",
      render: (val, record) => `${val} ${unitMap[record.unit] || record.unit}`,
    },
    {
      title: "Đơn giá (VND)",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (val) => val?.toLocaleString("vi-VN") || "-",
    },
    {
      title: "Tiến độ",
      dataIndex: "currentProgress",
      key: "currentProgress",
      render: (val, record) => `${val}/${record.unitQuantity} ${unitMap[record.unit] || record.unit}`,
    },
    {
      title: "Ngày cần",
      dataIndex: "dateNeed",
      key: "dateNeed",
      render: (val) => val || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = statusMap[status] || { label: status, color: "default" };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Xác nhận xóa?"
            description={`Xóa yêu cầu #${record.demandId}?`}
            onConfirm={() => onDelete(record.demandId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="demandId"
      columns={columns}
      dataSource={demands}
      loading={loading}
      pagination={pagination}
      onChange={onTableChange}
      scroll={{ x: 1000 }}
    />
  );
};

export default RawProductDemandTable;
