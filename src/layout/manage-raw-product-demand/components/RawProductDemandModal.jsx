import { useEffect, useState, useRef } from "react";
import {
  Modal, Form, Input, Select, DatePicker, InputNumber,
  Divider, Tag, Spin, Avatar,
} from "antd";
import { UserOutlined, CloseOutlined, StarFilled } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import { getProviders, getProviderById } from "../../../services/providerService";

const unitOptions = [
  { value: "KILOGRAM", label: "Kilogram (kg)" },
  { value: "GRAM", label: "Gram (g)" },
  { value: "PIECE", label: "Cái" },
  { value: "DOZEN", label: "Tá" },
  { value: "LITER", label: "Lít" },
  { value: "MILLILITER", label: "Millilít (ml)" },
  { value: "PACK", label: "Gói" },
  { value: "BOX", label: "Hộp" },
  { value: "BOTTLE", label: "Chai" },
];

const schema = z.object({
  subSubcategoryId: z.number({ required_error: "Chọn danh mục" }),
  unit: z.string().min(1, "Chọn đơn vị"),
  unitQuantity: z.number().positive("Số lượng phải lớn hơn 0"),
  unitPrice: z.number().positive("Đơn giá phải lớn hơn 0"),
  dateNeed: z.any().refine((val) => val && dayjs.isDayjs(val), {
    message: "Chọn ngày cần",
  }),
  note: z.string().optional(),
});

const verificationMethodOptions = [
  { value: "", label: "Tất cả phương thức" },
  { value: "CERTIFICATE", label: "Chứng chỉ" },
  { value: "VIDEO", label: "Video" },
];

const statusColors = {
  APPROVED: "green",
  PENDING: "orange",
  REJECTED: "red",
  SUSPENDED: "volcano",
  UNVERIFIED: "default",
};

const statusLabels = {
  APPROVED: "Đã duyệt",
  PENDING: "Chờ duyệt",
  REJECTED: "Từ chối",
  SUSPENDED: "Tạm ngưng",
  UNVERIFIED: "Chưa xác thực",
};

const methodLabels = {
  CERTIFICATE: "Chứng chỉ",
  VIDEO: "Video",
};

const bankLabels = {
  VIETCOMBANK: "Vietcombank",
  TECHCOMBANK: "Techcombank",
  BIDV: "BIDV",
  AGRIBANK: "Agribank",
  VIETINBANK: "VietinBank",
  MBBANK: "MB Bank",
  TPBANK: "TP Bank",
  SACOMBANK: "Sacombank",
  ACB: "ACB",
  VPBank: "VPBank",
};

const RawProductDemandModal = ({
  open,
  onCancel,
  onSubmit,
  initialData,
  subSubcategories = [],
  confirmLoading,
}) => {
  const isEdit = !!initialData;

  const [allProviders, setAllProviders] = useState([]);
  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [verificationMethodFilter, setVerificationMethodFilter] = useState("");
  const [selectedProviderIds, setSelectedProviderIds] = useState([]);
  const [providerDetails, setProviderDetails] = useState({});
  const fetchingIds = useRef(new Set());

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      subSubcategoryId: undefined,
      unit: "KILOGRAM",
      unitQuantity: 1,
      unitPrice: 0,
      dateNeed: null,
      note: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          subSubcategoryId: initialData.subSubcategoryId,
          unit: initialData.unit,
          unitQuantity: initialData.unitQuantity,
          unitPrice: initialData.unitPrice,
          dateNeed: dayjs(initialData.dateNeed),
          note: initialData.note || "",
        });
      } else {
        reset({
          subSubcategoryId: undefined,
          unit: "KILOGRAM",
          unitQuantity: 1,
          unitPrice: 0,
          dateNeed: null,
          note: "",
        });
      }
      setSelectedProviderIds([]);
      setProviderDetails({});
      setVerificationMethodFilter("");
      fetchingIds.current.clear();
    }
  }, [open, initialData, reset]);

  // Fetch approved providers once on open (verificationMethod filtered client-side)
  useEffect(() => {
    if (!open) return;
    const fetchProviders = async () => {
      setProvidersLoading(true);
      try {
        const params = { pageNum: 1, pageSize: 100, status: "APPROVED" };
        const response = await getProviders(params);
        const type = response.data?.type;
        if (type === "GOOD" || type === "SKIP_AS_GOOD") {
          setAllProviders(response.data.detail || []);
        } else {
          setAllProviders([]);
        }
      } catch {
        setAllProviders([]);
      } finally {
        setProvidersLoading(false);
      }
    };
    fetchProviders();
  }, [open]);

  // Client-side verificationMethod filter
  useEffect(() => {
    if (!verificationMethodFilter) {
      setProviders(allProviders);
    } else {
      setProviders(allProviders.filter((p) => p.verificationMethod === verificationMethodFilter));
    }
  }, [allProviders, verificationMethodFilter]);

  // Prefetch details for all providers in the list so names appear in the dropdown
  useEffect(() => {
    allProviders.forEach((p) => {
      const id = p.providerId;
      if (providerDetails[id] || fetchingIds.current.has(id)) return;
      fetchingIds.current.add(id);
      getProviderById(id)
        .then((res) => {
          if (res.data?.type === "GOOD") {
            setProviderDetails((prev) => ({ ...prev, [id]: res.data.detail }));
          }
        })
        .catch(() => {})
        .finally(() => fetchingIds.current.delete(id));
    });
  }, [allProviders]);

  // Fetch detail for newly selected providers (in case they weren't prefetched yet)
  useEffect(() => {
    selectedProviderIds.forEach((id) => {
      if (providerDetails[id] || fetchingIds.current.has(id)) return;
      fetchingIds.current.add(id);
      getProviderById(id)
        .then((res) => {
          if (res.data?.type === "GOOD") {
            setProviderDetails((prev) => ({ ...prev, [id]: res.data.detail }));
          }
        })
        .catch(() => {})
        .finally(() => fetchingIds.current.delete(id));
    });
  }, [selectedProviderIds]);

  const handleRemoveProvider = (id) => {
    setSelectedProviderIds((prev) => prev.filter((p) => p !== id));
  };

  const onFinish = (data) => {
    const payload = {
      ...data,
      dateNeed: dayjs(data.dateNeed).format("YYYY-MM-DD"),
      unitQuantity: Number(data.unitQuantity),
      unitPrice: Number(data.unitPrice),
    };
    onSubmit(payload, isEdit ? initialData.demandId : null);
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Chỉnh sửa yêu cầu sản phẩm" : "Tạo yêu cầu sản phẩm mới"}
      onCancel={onCancel}
      onOk={handleSubmit(onFinish)}
      confirmLoading={confirmLoading}
      okText={isEdit ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy"
      width={680}
    >
      <Form layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="Danh mục sản phẩm"
          required
          validateStatus={errors.subSubcategoryId ? "error" : ""}
          help={errors.subSubcategoryId?.message}
        >
          <Controller
            name="subSubcategoryId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Chọn danh mục"
                options={subSubcategories.map((item) => ({
                  value: item.subSubcategoryId,
                  label: item.name,
                }))}
                showSearch
                optionFilterProp="label"
              />
            )}
          />
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Form.Item
            label="Số lượng"
            required
            validateStatus={errors.unitQuantity ? "error" : ""}
            help={errors.unitQuantity?.message}
          >
            <Controller
              name="unitQuantity"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="Nhập số lượng"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Đơn vị"
            required
            validateStatus={errors.unit ? "error" : ""}
            help={errors.unit?.message}
          >
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <Select {...field} options={unitOptions} />
              )}
            />
          </Form.Item>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Form.Item
            label="Đơn giá (VND/đơn vị)"
            required
            validateStatus={errors.unitPrice ? "error" : ""}
            help={errors.unitPrice?.message}
          >
            <Controller
              name="unitPrice"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  step={1000}
                  style={{ width: "100%" }}
                  placeholder="Nhập đơn giá"
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Ngày cần"
            required
            validateStatus={errors.dateNeed ? "error" : ""}
            help={errors.dateNeed?.message}
          >
            <Controller
              name="dateNeed"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  placeholder="Chọn ngày"
                  disabledDate={(current) => current && current < dayjs().startOf("day")}
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item label="Ghi chú" help={errors.note?.message}>
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                rows={3}
                placeholder="Nhập ghi chú (không bắt buộc)"
              />
            )}
          />
        </Form.Item>

        <Divider orientation="left" orientationMargin={0} style={{ fontSize: 14 }}>
          Chọn nhà cung cấp{" "}
          <span style={{ fontWeight: 400, color: "#8c8c8c" }}>(tùy chọn)</span>
        </Divider>

        <Form.Item label="Phương thức xác minh">
          <Select
            value={verificationMethodFilter}
            onChange={setVerificationMethodFilter}
            options={verificationMethodOptions}
            style={{ width: 200 }}
          />
        </Form.Item>

        {/* Provider multi-select */}
        <Form.Item label="Nhà cung cấp">
          <Select
            mode="multiple"
            value={selectedProviderIds}
            onChange={setSelectedProviderIds}
            placeholder="Chọn một hoặc nhiều nhà cung cấp"
            loading={providersLoading}
            notFoundContent={
              providersLoading ? <Spin size="small" /> : "Không có nhà cung cấp"
            }
            optionFilterProp="label"
            showSearch
            options={providers.map((p) => {
              const detail = providerDetails[p.providerId];
              const name = detail ? `${detail.fName} ${detail.lName}`.trim() : null;
              return {
                value: p.providerId,
                label: name
                  ? `#${p.providerId} — ${name}`
                  : `Nhà cung cấp #${p.providerId}`,
                status: p.verificationStatus,
                verificationMethod: p.verificationMethod,
              };
            })}
            optionRender={(option) => (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {option.label}
                </span>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {option.data.verificationMethod && (
                    <Tag color="blue" style={{ margin: 0 }}>
                      {methodLabels[option.data.verificationMethod] ?? option.data.verificationMethod}
                    </Tag>
                  )}
                  <Tag color={statusColors[option.data.status]} style={{ margin: 0 }}>
                    {statusLabels[option.data.status] ?? option.data.status}
                  </Tag>
                </div>
              </div>
            )}
          />
        </Form.Item>

        {/* Selected provider detail cards */}
        {selectedProviderIds.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {selectedProviderIds.map((id) => {
              const detail = providerDetails[id];
              return (
                <ProviderCard
                  key={id}
                  providerId={id}
                  detail={detail}
                  onRemove={handleRemoveProvider}
                />
              );
            })}
          </div>
        )}
      </Form>
    </Modal>
  );
};

const ProviderCard = ({ providerId, detail, onRemove }) => {
  const reputationColor =
    detail?.reputationPoint >= 80
      ? "#52c41a"
      : detail?.reputationPoint >= 50
      ? "#1677ff"
      : "#ff4d4f";

  return (
    <div
      style={{
        border: "1px solid #e8e8e8",
        borderRadius: 8,
        padding: "10px 12px",
        background: "#fafafa",
        position: "relative",
      }}
    >
      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(providerId)}
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          width: 20,
          height: 20,
          border: "none",
          borderRadius: "50%",
          background: "#d9d9d9",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          lineHeight: 1,
          color: "#595959",
        }}
      >
        <CloseOutlined style={{ fontSize: 10 }} />
      </button>

      {!detail ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 56 }}>
          <Spin size="small" />
          <span style={{ color: "#8c8c8c", fontSize: 13 }}>
            Đang tải nhà cung cấp #{providerId}...
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, paddingRight: 16 }}>
          <Avatar
            size={44}
            src={detail.avtUrl}
            icon={<UserOutlined />}
            style={{ flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
                {detail.fName} {detail.lName}
              </span>
              <Tag
                color={statusColors[detail.verificationStatus]}
                style={{ margin: 0, fontSize: 11, lineHeight: "18px", padding: "0 5px" }}
              >
                {statusLabels[detail.verificationStatus] ?? detail.verificationStatus}
              </Tag>
            </div>

            <div style={{ fontSize: 12, color: "#595959", marginBottom: 1 }}>
              {detail.email}
            </div>
            {detail.pNum && (
              <div style={{ fontSize: 12, color: "#595959", marginBottom: 4 }}>
                {detail.pNum}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                ID: <strong style={{ color: "#262626" }}>#{detail.providerId}</strong>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12 }}>
                <StarFilled style={{ color: reputationColor, fontSize: 11 }} />
                <span style={{ color: reputationColor, fontWeight: 600 }}>
                  {detail.reputationPoint}
                </span>
              </span>
              {detail.verificationMethod && (
                <Tag
                  color="blue"
                  style={{ margin: 0, fontSize: 11, lineHeight: "18px", padding: "0 5px" }}
                >
                  {methodLabels[detail.verificationMethod] ?? detail.verificationMethod}
                </Tag>
              )}
              {detail.bankId && (
                <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                  {bankLabels[detail.bankId] ?? detail.bankId}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawProductDemandModal;
