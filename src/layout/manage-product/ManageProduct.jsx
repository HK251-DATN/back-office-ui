import { Button, Table } from "antd";
import SearchBox from "../../components/search-box/SearchBox";
import SummaryCard from "../../components/summary-card/SummaryCard";
import ViewButton from "../../components/ViewButton";
import EditButton from "../../components/EditButton";
import DeleteButton from "../../components/DeleteButton";
import ProductDetailModal from "./components/ProductDetailModal";
import ProductGeneralTable from "./components/ProductGeneralTable";

const ManageProduct = () => {
    // const [modalOpen, setModalOpen] = useState(false);
    // const [selectedProductId, setSelectedProductId] = useState(null);

    // const handleViewDetails = (productId) => {
    //     setSelectedProductId(productId);
    //     setModalOpen(true);
    // };

    // const handleCloseModal = () => {
    //     setModalOpen(false);
    //     setSelectedProductId(null);
    // };

    // const transformProductGenerals = (productGenerals) => {
    //     return productGenerals.map((productGeneral) => ({
    //         key: productGeneral.id,
    //         id: productGeneral.id,
    //         prod_gen_name: productGeneral.prod_gen_name,
    //         created_at: productGeneral.created_at,
    //         updated_at: productGeneral.updated_at,
    //         is_preorder: productGeneral.is_preorder ? "Có" : "Không",
    //         enterprise_store_id: productGeneral.enterprise_store_id,
    //         action: (
    //             <div className="flex gap-2">
    //                 <ViewButton onClick={() => handleViewDetails(productGeneral.id)} />
    //                 <EditButton />
    //                 <DeleteButton />
    //             </div>
    //         )
    //     }))
    // }

    // const productGeneralCols = [
    //     {
    //         title: 'Id',
    //         dataIndex: 'id',
    //         key: 'id',
    //     },
    //     {
    //         title: 'Tên sản phẩm',
    //         dataIndex: 'prod_gen_name',
    //         key: 'prod_gen_name',
    //     },
    //     {
    //         title: 'Ngày tạo',
    //         dataIndex: 'created_at',
    //         key: 'created_at',
    //     },
    //     {
    //         title: 'Ngày cập nhật',
    //         dataIndex: 'updated_at',
    //         key: 'updated_at',
    //     },
    //     {
    //         title: 'Cho phép Pre-order',
    //         dataIndex: 'is_preorder',
    //         key: 'is_preorder',
    //     },
    //     {
    //         title: 'Id của cửa hàng sở hữu',
    //         dataIndex: 'enterprise_store_id',
    //         key: 'enterprise_store_id',
    //     },
    //     {
    //         title: 'Action',
    //         dataIndex: 'action',
    //         key: 'action',
    //     }
    // ]

    return (
        <div className="flex flex-col h-fit w-full p-5 gap-3 bg-gray-50 overflow-scroll">
            <div className="header-part flex flex-col">
                <h1 className='text-2xl font-bold mb-2'>Quản lý sản phẩm</h1>
                <p>Quản lý danh mục sản phẩm thực phẩm tươi</p>
            </div>

            {/* <div className="summary-cards flex flex-row justify-between gap-5">
                <SummaryCard title="Tổng sản phẩm" content={7}></SummaryCard>
                <SummaryCard title="Số danh mục" content={7} ></SummaryCard>
                <SummaryCard title="Đang bán" variant='success' content={7} subContent={"Hiển thị trên web"}></SummaryCard>
                <SummaryCard title="Tạm ẩn" variant='danger' content={7} subContent={"Không hiển thị"}></SummaryCard>
            </div>
            <div className="search-filter flex flex-row justify-between items-center p-5 bg-white border-gray-200 border rounded-xl">
                <div className='search w-4/5'>
                    <SearchBox></SearchBox>
                </div>
                <div className='filter'>Filter</div>
            </div> */}
            <div className="data-table">
                {/* <Table columns={productGeneralCols} dataSource={transformProductGenerals(productGenerals)} className='border border-gray-200 rounded-2xl' /> */}
                < ProductGeneralTable />
            </div>
            {/* <div>
                < ProductDetailModal
                    productId={selectedProductId}
                    open={modalOpen}
                    onClose={handleCloseModal}
                />
            </div> */}
        </div>
    )
}

export default ManageProduct;