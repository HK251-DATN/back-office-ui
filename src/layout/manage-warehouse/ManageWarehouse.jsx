import { Divider, Table } from "antd";
import SearchBox from "../../components/search-box/SearchBox";

const ManageWarehouse = () => {
    return (
        <div className="flex flex-col h-fit w-full p-5 gap-3 bg-gray-50 overflow-scroll">
            <div className="header-part flex flex-col">
                <h1 className='text-2xl font-bold mb-2'>Quản lý kho</h1>
                <p>Giám sát tồn kho và điều kiện bảo quản thực phẩm tươi</p>
            </div>

            <Divider style={{ "margin": "0" }}></Divider>

            <div className="header-part flex flex-col">
                <h2 className='text-xl font-bold mb-2'>Quản lý Product Batch</h2>
            </div>

            <div className="search-filter flex flex-row justify-between items-center p-5 bg-white border-gray-200 border rounded-xl">
                <div className='search w-4/5'>
                    <SearchBox></SearchBox>
                </div>
                <div className='filter'>Filter</div>
            </div>
            <div className="data-table">
                <Table className='border border-gray-200 rounded-2xl' />
            </div>

            <Divider style={{ "margin": "0" }}></Divider>

            <div className="header-part flex flex-col">
                <h2 className='text-xl font-bold mb-2'>Quản lý Product Detail</h2>
            </div>

            <div className="search-filter flex flex-row justify-between items-center p-5 bg-white border-gray-200 border rounded-xl">
                <div className='search w-4/5'>
                    <SearchBox></SearchBox>
                </div>
                <div className='filter'>Filter</div>
            </div>
            <div className="data-table">
                <Table className='border border-gray-200 rounded-2xl' />
            </div>
        </div>
    )
}

export default ManageWarehouse;