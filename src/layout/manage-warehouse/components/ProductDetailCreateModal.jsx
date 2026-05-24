// src/components/warehouse/ProductDetailCreateModal.jsx
import { Modal, Form, InputNumber, Select, Button, message, Alert, Divider, Tag, Input, Upload, Typography } from 'antd';
import { SearchOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import axios from '../../../services/axiosInstance';
import { API_URLS } from '../../../config/api';
import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import axiosInstance from '../../../services/axiosInstance';
import { getProductBatches, getSubBatchesByBatchId, uploadProofImages } from '../../../services/productBatchService';

const { Text } = Typography;

const STATUS_OPTIONS = [
    { value: 'STORED', label: 'Đã lưu kho' },
    { value: 'EXPIRED', label: 'Hết hạn' },
    { value: 'PICKED', label: 'Đã chọn' },
    { value: 'IN_TRANSIT', label: 'Đang vận chuyển' },
    { value: 'DELIVERED', label: 'Đã giao' },
    { value: 'RETURNED', label: 'Đã trả lại' },
    { value: 'DISPOSED', label: 'Đã hủy' },
];

const UNIT_LABELS = {
    KILOGRAM: 'Kg',
    GRAM: 'g',
    LITER: 'L',
    MILLILITER: 'mL',
};

function ProductDetailCreateModal({ open, onClose, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [batches, setBatches] = useState([]);
    const [batchSearch, setBatchSearch] = useState('');
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [suitableProducts, setSuitableProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [subSubCategories, setSubSubCategories] = useState([]);
    const [storageTools, setStorageTools] = useState([]);
    const [calculationPreview, setCalculationPreview] = useState('');

    // New state for V2 improvements
    const [verificationType, setVerificationType] = useState(null);
    const [providerId, setProviderId] = useState(null);
    const [subBatches, setSubBatches] = useState([]);
    const [processingResult, setProcessingResult] = useState(null);
    const [loadingSubBatches, setLoadingSubBatches] = useState(false);

    // Proof images
    const [fileList, setFileList] = useState([]);
    const [uploadingProof, setUploadingProof] = useState(false);

    useEffect(() => {
        if (open) {
            fetchBatches();
            fetchStorageTools();
            fetchProductBatchCategory();
            form.resetFields();
            setSelectedBatch(null);
            setBatchSearch('');
            setSuitableProducts([]);
            setSelectedProduct(null);
            setCalculationPreview('');
            setVerificationType(null);
            setProviderId(null);
            setSubBatches([]);
            setProcessingResult(null);
            setFileList([]);
            setUploadingProof(false);
        }
    }, [open, form]);

    const fetchProductBatchCategory = async () => {
        try {
            const response = await axiosInstance.get(`${API_URLS.MAIN}/api/categories/sub-subcategories`)

            if (response.data.type === 'GOOD') {
                setSubSubCategories(response.data.detail || null);

                console.log(response.data.detail);
            }
        } catch (error) {
            console.error('Failed to fetch sub-subcategory', error);
        }
    }

    const getSubSubCategoryName = (id) => {
        const subsubcategory = subSubCategories.find(s => s.subSubcategoryId === id);
        return subsubcategory?.name || '';
    };

    const fetchBatches = async () => {
        try {
            const response = await getProductBatches({
                pageNum: 1,
                pageSize: 100,
                processStatus: 'PENDING',
                sortBy: 'createdAt',
            });
            const type = response.data?.type;
            if (type === 'GOOD' || type === 'SKIP_AS_GOOD') {
                const rows = response.data.detail?.data ?? [];
                setBatches(rows.map(item => item.batch));
            } else {
                setBatches([]);
            }
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        }
    };

    const filteredBatches = useMemo(() => {
        const q = batchSearch.trim().toLowerCase();
        if (!q) return batches;
        return batches.filter(b => {
            const catName = getSubSubCategoryName(b.subSubcategoryId).toLowerCase();
            return (
                String(b.batchId).includes(q) ||
                catName.includes(q)
            );
        });
    }, [batches, batchSearch, subSubCategories]);

    const fetchStorageTools = async () => {
        try {
            const response = await axios.get(`${API_URLS.STORAGE}/api/storage-tool?pageNum=1&pageSize=100`);
            if (response.data.type === 'GOOD') {
                setStorageTools(response.data.detail || []);
            }
        } catch (error) {
            console.error('Failed to fetch storage tools:', error);
            // Provide mock storage tools if API fails
            setStorageTools([
                { storageToolId: 1, toolType: 'RACK', usagePercentage: 30 },
                { storageToolId: 2, toolType: 'FRIDGE', usagePercentage: 45 },
            ]);
        }
    };

    const handleBatchChange = async (batchId) => {
        const batch = batches.find(b => b.batchId === batchId);
        setSelectedBatch(batch);
        setSuitableProducts([]);
        setSelectedProduct(null);
        setCalculationPreview('');
        setProcessingResult(null);
        form.setFieldValue('prodGenId', undefined);

        // Set verification type and provider info
        setVerificationType(batch?.verificationType || null);
        setProviderId(batch?.providerId || null);

        // Pre-populate proof images from existing URLs
        const existingFiles = (batch?.proofImageUrls ?? []).map((url, i) => ({
            uid: `existing-${i}`,
            name: `Ảnh ${i + 1}`,
            status: 'done',
            url,
        }));
        setFileList(existingFiles);

        // If VIDEO batch, fetch sub-batches
        if (batch?.verificationType === 'VIDEO') {
            setLoadingSubBatches(true);
            try {
                const subBatchResponse = await getSubBatchesByBatchId(batchId, 'PENDING');
                if (subBatchResponse.data.type === 'GOOD' || subBatchResponse.data.type === 'SKIP_AS_GOOD') {
                    const rows = subBatchResponse.data.detail || [];
                    setSubBatches(rows.map(item => ({ ...item.subBatch, provider: item.provider ?? null })));
                } else {
                    setSubBatches([]);
                }
            } catch (error) {
                console.error('Failed to fetch sub-batches:', error);
                setSubBatches([]);
            } finally {
                setLoadingSubBatches(false);
            }
        } else {
            setSubBatches([]);
        }

        if (!batchId) return;

        try {
            const response = await axios.get(`${API_URLS.STORAGE}/api/product-general/suitable-for-batch/${batchId}`);
            if (response.data.type === 'GOOD') {
                setSuitableProducts(response.data.detail);
            } else if (response.data.type === 'SKIP_AS_GOOD') {
                setSuitableProducts([]);
                message.warning('Không tìm thấy sản phẩm phù hợp với batch này');
            }
        } catch (error) {
            message.error('Không thể tải danh sách sản phẩm phù hợp');
        }
    };

    const handleProofImagesChange = ({ fileList: newList }) => {
        setFileList(newList);
    };

    const handleUploadProofImages = async () => {
        const newFiles = fileList
            .filter(f => f.originFileObj)
            .map(f => f.originFileObj);

        if (newFiles.length === 0) {
            message.warning('Chưa có ảnh mới để tải lên');
            return;
        }

        setUploadingProof(true);
        try {
            await uploadProofImages(selectedBatch.batchId, newFiles);
            message.success(`Đã tải lên ${newFiles.length} ảnh thành công`);
            setFileList(prev =>
                prev.map(f => f.originFileObj ? { ...f, status: 'done', originFileObj: undefined } : f)
            );
        } catch {
            message.error('Tải lên ảnh thất bại');
        } finally {
            setUploadingProof(false);
        }
    };

    const handleProductChange = (prodGenId) => {
        const product = suitableProducts.find(p => p.prodGenId === prodGenId);
        setSelectedProduct(product);

        if (selectedBatch && product) {
            calculatePreview(selectedBatch, product);
        } else {
            setCalculationPreview('');
        }
    };

    const calculatePreview = (batch, product) => {
        // Convert batch to base unit
        let batchInBaseUnit = batch.quantity;
        if (batch.unit === 'KILOGRAM' && product.unit === 'GRAM') {
            batchInBaseUnit = batch.quantity * 1000;
        } else if (batch.unit === 'LITER' && product.unit === 'MILLILITER') {
            batchInBaseUnit = batch.quantity * 1000;
        }

        // Convert product to base unit if needed
        let productInBaseUnit = product.unitQuantity;
        if (product.unit === 'KILOGRAM' && batch.unit === 'KILOGRAM') {
            productInBaseUnit = product.unitQuantity;
        } else if (product.unit === 'GRAM' && batch.unit === 'KILOGRAM') {
            productInBaseUnit = product.unitQuantity;
            batchInBaseUnit = batch.quantity * 1000;
        }

        const count = Math.floor(batchInBaseUnit / productInBaseUnit);
        setCalculationPreview(`Batch này sẽ tạo ra khoảng ${count} sản phẩm "${product.name}"`);
    };

    const handleFinish = async (values) => {
        setLoading(true);

        try {
            // Use V2 endpoint with simpler payload
            const payload = {
                batchId: values.batchId,
                productGeneralId: values.prodGenId,
                price: values.price,
                storageToolId: values.storageToolId,
                numOfStar: values.numOfStar || 0,
            };

            const response = await axios.post(`${API_URLS.STORAGE}/api/product-detail/process-batch-v2`, payload);

            if (response.data.type === 'GOOD' || response.data.type === 'SKIP_AS_GOOD') {
                const result = response.data.detail;
                setProcessingResult(result);

                // Show detailed success message
                if (result.verificationType === 'CERTIFICATE') {
                    message.success({
                        content: (
                            <div>
                                <div><strong>Xử lý batch thành công!</strong></div>
                                <div>Loại: Chứng nhận (Provider #{result.providerId})</div>
                                <div>Đã tạo: {result.totalProductDetailsCreated} sản phẩm</div>
                            </div>
                        ),
                        duration: 5,
                    });
                } else {
                    // VIDEO batch
                    const breakdown = result.subBatchBreakdowns
                        ?.map(sb => `Provider #${sb.providerId}: ${sb.productDetailsCreated} sản phẩm`)
                        .join(', ') || '';

                    message.success({
                        content: (
                            <div>
                                <div><strong>Xử lý batch thành công!</strong></div>
                                <div>Loại: Video (Gộp chung)</div>
                                <div>Tổng: {result.totalProductDetailsCreated} sản phẩm</div>
                                {breakdown && (
                                    <div style={{ fontSize: '12px', marginTop: 4 }}>
                                        Chi tiết: {breakdown}
                                    </div>
                                )}
                            </div>
                        ),
                        duration: 8,
                    });
                }

                // Don't close modal immediately - show result first
                onSuccess?.();

                // Reset after 2 seconds to show results
                setTimeout(() => {
                    form.resetFields();
                    setSelectedBatch(null);
                    setSuitableProducts([]);
                    setSelectedProduct(null);
                    setCalculationPreview('');
                    setVerificationType(null);
                    setProviderId(null);
                    setSubBatches([]);
                    setProcessingResult(null);
                    onClose();
                }, 2000);

            } else {
                message.error(response.data.message || 'Xử lý batch thất bại!');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Xử lý Product Batch"
            open={open}
            onCancel={onClose}
            footer={null}
            width={700}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                autoComplete="off"
            >
                <Form.Item label="Tìm kiếm batch">
                    <Input
                        placeholder="Lọc theo ID hoặc tên danh mục..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={batchSearch}
                        onChange={e => setBatchSearch(e.target.value)}
                        allowClear
                    />
                </Form.Item>

                <Form.Item
                    label={`Product Batch (${filteredBatches.length} kết quả)`}
                    name="batchId"
                    rules={[{ required: true, message: 'Vui lòng chọn batch!' }]}
                >
                    <Select
                        placeholder="Chọn batch cần xử lý"
                        onChange={handleBatchChange}
                        optionLabelProp="label"
                        showSearch={false}
                        virtual={false}
                    >
                        {filteredBatches.map(batch => {
                            const catName = getSubSubCategoryName(batch.subSubcategoryId);
                            const label = `#${batch.batchId} · ${batch.quantity} ${UNIT_LABELS[batch.unit] || batch.unit} · ${catName || `Cat #${batch.subSubcategoryId}`}`;
                            return (
                                <Select.Option key={batch.batchId} value={batch.batchId} label={label}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>
                                            <strong>#{batch.batchId}</strong>
                                            <span style={{ margin: '0 6px', color: '#999' }}>·</span>
                                            {catName || `Cat #${batch.subSubcategoryId}`}
                                        </span>
                                        <span style={{ color: '#666', fontSize: 12 }}>
                                            {batch.quantity} {UNIT_LABELS[batch.unit] || batch.unit}
                                            <Tag
                                                color={batch.verificationType === 'CERTIFICATE' ? 'purple' : 'cyan'}
                                                style={{ marginLeft: 8, fontSize: 11 }}
                                            >
                                                {batch.verificationType === 'CERTIFICATE' ? 'Chứng nhận' : 'Video'}
                                            </Tag>
                                        </span>
                                    </div>
                                </Select.Option>
                            );
                        })}
                    </Select>
                </Form.Item>

                {selectedBatch && (
                    <Alert
                        message="Thông tin Batch"
                        description={
                            <div>
                                <div><strong>Số lượng:</strong> {selectedBatch.quantity} {UNIT_LABELS[selectedBatch.unit]}</div>
                                <div><strong>Ngày nhận:</strong> {selectedBatch.receivedAt ? dayjs(selectedBatch.receivedAt).format('DD/MM/YYYY HH:mm') : '-'}</div>
                                <div><strong>Hết hạn:</strong> {selectedBatch.expiredAt ? dayjs(selectedBatch.expiredAt).format('DD/MM/YYYY HH:mm') : '-'}</div>
                            </div>
                        }
                        type="info"
                        style={{ marginBottom: 16 }}
                    />
                )}

                {/* Verification Type Badge */}
                {selectedBatch && verificationType && (
                    <Alert
                        message={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {verificationType === 'CERTIFICATE' ? (
                                    <>
                                        <Tag color="green">✓ Chứng nhận</Tag>
                                        <span>
                                            Batch này từ nhà cung cấp đã được chứng nhận
                                            {providerId && ` (Provider #${providerId})`}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Tag color="blue">📹 Video</Tag>
                                        <span>
                                            Batch gộp từ nhiều nhà cung cấp ({subBatches.length} sub-batches)
                                        </span>
                                    </>
                                )}
                            </div>
                        }
                        type={verificationType === 'CERTIFICATE' ? 'success' : 'info'}
                        style={{ marginBottom: 16 }}
                    />
                )}

                {/* Sub-batch breakdown for VIDEO batches */}
                {verificationType === 'VIDEO' && subBatches.length > 0 && (
                    <Alert
                        message="Chi tiết Sub-batches"
                        description={
                            loadingSubBatches ? (
                                <div>Đang tải...</div>
                            ) : (
                                <div style={{ marginTop: 8 }}>
                                    {subBatches.map((sb, idx) => {
                                        const providerName = sb.provider
                                            ? `${sb.provider.fName ?? ''} ${sb.provider.lName ?? ''}`.trim() || `Provider #${sb.provider.providerId}`
                                            : '—';
                                        return (
                                            <div key={sb.subBatchId} style={{ marginBottom: 4 }}>
                                                <Tag>#{idx + 1}</Tag>
                                                <strong>{providerName}</strong>: {sb.quantity}{' '}
                                                {UNIT_LABELS[sb.unit] || sb.unit}
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        }
                        type="info"
                        style={{ marginBottom: 16 }}
                    />
                )}

                {/* Proof images upload — only visible once a batch is selected */}
                {selectedBatch && (
                    <>
                        <Divider orientation="left" style={{ fontSize: 13, color: '#555', margin: '4px 0 12px' }}>
                            Ảnh chứng minh
                        </Divider>

                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            beforeUpload={() => false}
                            onChange={handleProofImagesChange}
                            accept="image/*"
                            multiple
                        >
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 6, fontSize: 12 }}>Thêm ảnh</div>
                            </div>
                        </Upload>

                        {fileList.some(f => f.originFileObj) && (
                            <div style={{ marginTop: 8, marginBottom: 16 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {fileList.filter(f => f.originFileObj).length} ảnh mới chưa được tải lên
                                </Text>
                                <Button
                                    icon={<UploadOutlined />}
                                    size="small"
                                    loading={uploadingProof}
                                    onClick={handleUploadProofImages}
                                    style={{ marginLeft: 12 }}
                                >
                                    Tải lên ngay
                                </Button>
                            </div>
                        )}

                        {fileList.length === 0 && (
                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
                                Chưa có ảnh chứng minh nào
                            </Text>
                        )}
                    </>
                )}

                <Form.Item
                    label="Product General (Sản phẩm)"
                    name="prodGenId"
                    rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
                >
                    <Select
                        placeholder={selectedBatch ? 'Chọn sản phẩm' : 'Chọn batch trước'}
                        showSearch
                        optionFilterProp="children"
                        onChange={handleProductChange}
                        disabled={!selectedBatch || suitableProducts.length === 0}
                    >
                        {suitableProducts.map(product => (
                            <Select.Option key={product.prodGenId} value={product.prodGenId}>
                                {product.name} - {product.unitQuantity} {UNIT_LABELS[product.unit] || product.unit}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {calculationPreview && (
                    <Alert
                        message="Dự tính"
                        description={calculationPreview}
                        type="success"
                        style={{ marginBottom: 16 }}
                    />
                )}

                {/* Processing Result Display */}
                {processingResult && (
                    <>
                        <Divider>Kết quả xử lý</Divider>

                        <Alert
                            message={
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                                        ✅ Đã tạo {processingResult.totalProductDetailsCreated} sản phẩm
                                    </div>
                                    {processingResult.verificationType === 'CERTIFICATE' ? (
                                        <div>
                                            <Tag color="green">Chứng nhận</Tag>
                                            Sản phẩm sẽ hiển thị với tên nhà cung cấp #
                                            {processingResult.providerId} trên website
                                        </div>
                                    ) : (
                                        <div>
                                            <Tag color="blue">Video (Gộp chung)</Tag>
                                            Sản phẩm sẽ hiển thị không có tên nhà cung cấp
                                        </div>
                                    )}
                                </div>
                            }
                            type="success"
                            style={{ marginTop: 16, marginBottom: 16 }}
                        />

                        {processingResult.subBatchBreakdowns?.length > 0 && (
                            <div style={{
                                background: '#f5f5f5',
                                padding: 12,
                                borderRadius: 4,
                                marginBottom: 16
                            }}>
                                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                                    Phân bổ theo nhà cung cấp:
                                </div>
                                {processingResult.subBatchBreakdowns.map((sb, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '4px 0',
                                        borderBottom: idx < processingResult.subBatchBreakdowns.length - 1
                                            ? '1px solid #d9d9d9'
                                            : 'none'
                                    }}>
                                        <span>
                                            <Tag>#{idx + 1}</Tag>
                                            Provider #{sb.providerId}
                                        </span>
                                        <span>
                                            <strong>{sb.productDetailsCreated}</strong> sản phẩm
                                            ({sb.quantityProcessed} {UNIT_LABELS[selectedBatch?.unit] || selectedBatch?.unit})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <Divider />

                <Form.Item
                    label="Giá mỗi sản phẩm (VNĐ)"
                    name="price"
                    rules={[
                        { required: true, message: 'Vui lòng nhập giá!' },
                        { type: 'number', min: 0, message: 'Giá phải lớn hơn hoặc bằng 0!' },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Nhập giá sản phẩm"
                        min={0}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                </Form.Item>

                <Form.Item
                    label="Vị trí lưu kho (Storage Tool)"
                    name="storageToolId"
                    rules={[{ required: false, message: 'Vui lòng chọn vị trí lưu kho!' }]}
                >
                    <Select placeholder="Chọn vị trí lưu kho">
                        {storageTools.map(tool => (
                            <Select.Option key={tool.storageToolId} value={tool.storageToolId}>
                                {tool.toolType} #{tool.storageToolId} - Đã dùng {tool.usagePercentage}%
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        initialValue="STORED"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Select placeholder="Chọn trạng thái" options={STATUS_OPTIONS} />
                    </Form.Item>

                    <Form.Item
                        label="Số sao đánh giá"
                        name="numOfStar"
                        initialValue={0}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="0-5"
                            min={0}
                            max={5}
                        />
                    </Form.Item>
                </div>

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Xử lý Batch
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ProductDetailCreateModal;
