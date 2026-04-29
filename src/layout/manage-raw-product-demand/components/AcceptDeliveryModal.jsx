import { useEffect } from "react";
import { Modal, Form, Input, InputNumber } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

const schema = z.object({
  actualQuantity: z.number().positive("Số lượng phải lớn hơn 0"),
  note: z.string().optional(),
});

const AcceptDeliveryModal = ({
  open,
  onCancel,
  onSubmit,
  batch,
  confirmLoading,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      actualQuantity: 0,
      note: "",
    },
  });

  useEffect(() => {
    if (open && batch) {
      reset({
        actualQuantity: batch.quantity || 0,
        note: "",
      });
    }
  }, [open, batch, reset]);

  const onFinish = (data) => {
    onSubmit({
      actualQuantity: Number(data.actualQuantity),
      note: data.note || "",
    });
  };

  if (!batch) return null;

  return (
    <Modal
      open={open}
      title={`Chấp nhận giao hàng - Batch #${batch.batchId}`}
      onCancel={onCancel}
      onOk={handleSubmit(onFinish)}
      confirmLoading={confirmLoading}
      okText="Chấp nhận"
      cancelText="Hủy"
      width={500}
    >
      <div style={{ marginBottom: 16 }}>
        <p><strong>Số lượng đã xác nhận:</strong> {batch.quantity} {unitMap[batch.unit] || batch.unit}</p>
        {batch.note && <p><strong>Ghi chú giao hàng:</strong> {batch.note}</p>}
      </div>

      <Form layout="vertical">
        <Form.Item
          label="Số lượng thực tế nhận được"
          required
          validateStatus={errors.actualQuantity ? "error" : ""}
          help={errors.actualQuantity?.message}
        >
          <Controller
            name="actualQuantity"
            control={control}
            render={({ field }) => (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <InputNumber
                  {...field}
                  min={0}
                  max={batch.quantity * 1.5}
                  style={{ flex: 1 }}
                  placeholder="Nhập số lượng thực tế"
                />
                <span style={{ minWidth: '40px' }}>{unitMap[batch.unit] || batch.unit}</span>
              </div>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Ghi chú kiểm tra"
          help={errors.note?.message}
        >
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                rows={3}
                placeholder="Ghi chú về tình trạng hàng nhận (không bắt buộc)"
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AcceptDeliveryModal;
