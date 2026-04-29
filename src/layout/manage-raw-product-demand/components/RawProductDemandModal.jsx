import { useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";

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

const RawProductDemandModal = ({
  open,
  onCancel,
  onSubmit,
  initialData,
  subSubcategories = [],
  confirmLoading,
}) => {
  const isEdit = !!initialData;
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
    }
  }, [open, initialData, reset]);

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
      width={600}
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
      </Form>
    </Modal>
  );
};

export default RawProductDemandModal;
