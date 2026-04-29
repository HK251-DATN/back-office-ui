import { useState, useEffect, useCallback } from "react";
import { Button, message, Space, Tabs, Modal } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import RawProductDemandTable from "./components/RawProductDemandTable";
import RawProductDemandModal from "./components/RawProductDemandModal";
import PendingDeliveriesTable from "./components/PendingDeliveriesTable";
import AcceptDeliveryModal from "./components/AcceptDeliveryModal";
import SubBatchDetailModal from "./components/SubBatchDetailModal";
import {
  getRawProductDemands,
  createRawProductDemand,
  updateRawProductDemand,
  deleteRawProductDemand,
} from "../../services/rawProductDemandService";
import {
  getBatchesByStatus,
  acceptBatchDelivery,
  rejectBatchDelivery,
  acceptSubBatchDelivery,
  rejectSubBatchDelivery,
} from "../../services/productBatchService";
import { getSubSubcategories } from "../../services/categoryService";
import { getProviders } from "../../services/providerService";

const ManageRawProductDemand = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(false);
  const [demands, setDemands] = useState([]);
  const [pendingBatches, setPendingBatches] = useState([]);
  const [subSubcategories, setSubSubcategories] = useState([]);
  const [subSubcategoryMap, setSubSubcategoryMap] = useState({});
  const [providers, setProviders] = useState([]);
  const [providerMap, setProviderMap] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Modals state
  const [demandModalOpen, setDemandModalOpen] = useState(false);
  const [editingDemand, setEditingDemand] = useState(null);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [subBatchModalOpen, setSubBatchModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch reference data on mount
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [subSubcatResponse, providerResponse] = await Promise.all([
          getSubSubcategories(),
          getProviders({ pageNum: 1, pageSize: 1000 }),
        ]);

        const subSubcatType = subSubcatResponse.data?.type;
        if (subSubcatType === "GOOD" || subSubcatType === "SKIP_AS_GOOD") {
          const data = subSubcatResponse.data.detail || [];
          setSubSubcategories(data);
          const map = {};
          data.forEach((item) => {
            map[item.subSubcategoryId] = item.name;
          });
          setSubSubcategoryMap(map);
        }

        const providerType = providerResponse.data?.type;
        if (providerType === "GOOD" || providerType === "SKIP_AS_GOOD") {
          const data = providerResponse.data.detail || [];
          setProviders(data);
          const map = {};
          data.forEach((item) => {
            map[item.providerId] = item.description || `Provider ${item.providerId}`;
          });
          setProviderMap(map);
        }
      } catch (error) {
        console.error("Error fetching reference data:", error);
        message.error("Không thể tải dữ liệu tham chiếu");
      }
    };
    fetchReferenceData();
  }, []);

  // Fetch demands
  const fetchDemands = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const response = await getRawProductDemands({ pageNum: page, pageSize });
      const responseType = response.data?.type;
      if (responseType === "GOOD" || responseType === "SKIP_AS_GOOD") {
        const data = response.data.detail || [];
        setDemands(data);
        setPagination((prev) => ({
          ...prev,
          current: page,
          total: data.length,
        }));
      } else {
        setDemands([]);
      }
    } catch (error) {
      console.error("Error fetching demands:", error);
      message.error("Lỗi khi tải danh sách yêu cầu sản phẩm");
      setDemands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch pending deliveries
  const fetchPendingBatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBatchesByStatus("WAIT_FOR_DELIVERY");
      const responseType = response.data?.type;
      if (responseType === "GOOD" || responseType === "SKIP_AS_GOOD") {
        setPendingBatches(response.data.detail || []);
      } else {
        setPendingBatches([]);
      }
    } catch (error) {
      console.error("Error fetching pending batches:", error);
      message.error("Lỗi khi tải danh sách giao hàng chờ xử lý");
      setPendingBatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "1") {
      fetchDemands(pagination.current, pagination.pageSize);
    } else if (activeTab === "2") {
      fetchPendingBatches();
    }
  }, [activeTab, refreshTrigger, fetchDemands, fetchPendingBatches]);

  const handleTableChange = (newPagination) => {
    fetchDemands(newPagination.current, newPagination.pageSize);
  };

  const handleCreate = () => {
    setEditingDemand(null);
    setDemandModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingDemand(record);
    setDemandModalOpen(true);
  };

  const handleDelete = async (demandId) => {
    try {
      const response = await deleteRawProductDemand(demandId);
      const responseType = response.data?.type;
      if (responseType === "GOOD" || responseType === "SKIP_AS_GOOD") {
        message.success("Xóa yêu cầu thành công");
        setRefreshTrigger((prev) => prev + 1);
      } else {
        message.error("Xóa yêu cầu thất bại");
      }
    } catch (error) {
      console.error("Error deleting demand:", error);
      message.error("Lỗi khi xóa yêu cầu");
    }
  };

  const handleDemandModalSubmit = async (payload, demandId) => {
    setConfirmLoading(true);
    try {
      let response;
      if (demandId) {
        response = await updateRawProductDemand(demandId, payload);
      } else {
        response = await createRawProductDemand(payload);
      }
      const responseType = response.data?.type;
      if (responseType === "GOOD" || responseType === "SKIP_AS_GOOD") {
        message.success(demandId ? "Cập nhật yêu cầu thành công" : "Tạo yêu cầu thành công");
        setDemandModalOpen(false);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        message.error(response.data?.message || "Thao tác thất bại");
      }
    } catch (error) {
      console.error("Error submitting demand:", error);
      message.error("Lỗi khi thực hiện thao tác");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleAcceptBatch = (batch) => {
    setSelectedBatch(batch);
    setAcceptModalOpen(true);
  };

  const handleRejectBatch = async (batch) => {
    Modal.confirm({
      title: `Từ chối giao hàng Batch #${batch.batchId}?`,
      content: "Bạn có chắc chắn muốn từ chối lô hàng này?",
      okText: "Từ chối",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await rejectBatchDelivery(batch.batchId, {
            note: "Từ chối giao hàng",
          });
          const responseType = response.data?.type;
          if (responseType === "GOOD" || responseType === "SKIP_AS_GOOD") {
            message.success("Đã từ chối giao hàng");
            setRefreshTrigger((prev) => prev + 1);
          } else {
            message.error("Từ chối giao hàng thất bại");
          }
        } catch (error) {
          console.error("Error rejecting batch:", error);
          message.error("Lỗi khi từ chối giao hàng");
        }
      },
    });
  };

  const handleAcceptModalSubmit = async (data) => {
    setConfirmLoading(true);
    try {
      const response = await acceptBatchDelivery(selectedBatch.batchId, data);
      const responseType = response.data?.type;
      if (responseType === "GOOD" || responseType === "SKIP_AS_GOOD") {
        message.success("Chấp nhận giao hàng thành công");
        setAcceptModalOpen(false);
        setSelectedBatch(null);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        message.error(response.data?.message || "Chấp nhận giao hàng thất bại");
      }
    } catch (error) {
      console.error("Error accepting batch:", error);
      message.error("Lỗi khi chấp nhận giao hàng");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleViewSubBatches = (batch) => {
    setSelectedBatch(batch);
    setSubBatchModalOpen(true);
  };

  const handleAcceptSubBatch = async (subBatch) => {
    Modal.confirm({
      title: `Chấp nhận sub-batch #${subBatch.subBatchId}?`,
      content: `Số lượng: ${subBatch.quantity}`,
      okText: "Chấp nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const response = await acceptSubBatchDelivery(subBatch.subBatchId, {
            actualQuantity: subBatch.quantity,
            note: "Chấp nhận giao hàng",
          });
          const responseType = response.data?.type;
          if (responseType === "GOOD" || responseType === "SKIP_AS_GOOD") {
            message.success("Chấp nhận sub-batch thành công");
            setRefreshTrigger((prev) => prev + 1);
          } else {
            message.error("Chấp nhận sub-batch thất bại");
          }
        } catch (error) {
          console.error("Error accepting sub-batch:", error);
          message.error("Lỗi khi chấp nhận sub-batch");
        }
      },
    });
  };

  const handleRejectSubBatch = async (subBatch) => {
    Modal.confirm({
      title: `Từ chối sub-batch #${subBatch.subBatchId}?`,
      content: "Bạn có chắc chắn muốn từ chối lô hàng này?",
      okText: "Từ chối",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await rejectSubBatchDelivery(subBatch.subBatchId, {
            note: "Từ chối giao hàng",
          });
          const responseType = response.data?.type;
          if (responseType === "GOOD" || responseType === "SKIP_AS_GOOD") {
            message.success("Đã từ chối sub-batch");
            setRefreshTrigger((prev) => prev + 1);
          } else {
            message.error("Từ chối sub-batch thất bại");
          }
        } catch (error) {
          console.error("Error rejecting sub-batch:", error);
          message.error("Lỗi khi từ chối sub-batch");
        }
      },
    });
  };

  const tabItems = [
    {
      key: "1",
      label: "Yêu cầu nguyên liệu",
      children: (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-end mb-4">
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => setRefreshTrigger((prev) => prev + 1)}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Tạo yêu cầu mới
              </Button>
            </Space>
          </div>
          <RawProductDemandTable
            demands={demands}
            loading={loading}
            pagination={pagination}
            onTableChange={handleTableChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            subSubcategoryMap={subSubcategoryMap}
          />
        </div>
      ),
    },
    {
      key: "2",
      label: "Giao hàng chờ xử lý",
      children: (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-end mb-4">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              loading={loading}
            >
              Làm mới
            </Button>
          </div>
          <PendingDeliveriesTable
            batches={pendingBatches}
            loading={loading}
            onAccept={handleAcceptBatch}
            onReject={handleRejectBatch}
            onViewSubBatches={handleViewSubBatches}
            subSubcategoryMap={subSubcategoryMap}
            providerMap={providerMap}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-fit w-full p-5 gap-4 bg-gray-50">
      <div className="header-part">
        <h1 className="text-2xl font-bold mb-1">Quản lý yêu cầu nguyên liệu</h1>
        <p className="text-gray-600">Tạo yêu cầu sản phẩm thô và quản lý giao hàng</p>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <RawProductDemandModal
        open={demandModalOpen}
        onCancel={() => setDemandModalOpen(false)}
        onSubmit={handleDemandModalSubmit}
        initialData={editingDemand}
        subSubcategories={subSubcategories}
        confirmLoading={confirmLoading}
      />

      <AcceptDeliveryModal
        open={acceptModalOpen}
        onCancel={() => {
          setAcceptModalOpen(false);
          setSelectedBatch(null);
        }}
        onSubmit={handleAcceptModalSubmit}
        batch={selectedBatch}
        confirmLoading={confirmLoading}
      />

      <SubBatchDetailModal
        open={subBatchModalOpen}
        onCancel={() => {
          setSubBatchModalOpen(false);
          setSelectedBatch(null);
        }}
        batch={selectedBatch}
        providerMap={providerMap}
        onAcceptSubBatch={handleAcceptSubBatch}
        onRejectSubBatch={handleRejectSubBatch}
      />
    </div>
  );
};

export default ManageRawProductDemand;
