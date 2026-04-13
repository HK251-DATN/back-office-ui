// src/layout/manage-category/ManageCategory.jsx
import { Tabs } from 'antd';
import CategoryTable from './components/CategoryTable';
import SubcategoryTable from './components/SubcategoryTable';
import SubSubcategoryTable from './components/SubSubcategoryTable';

const tabItems = [
    {
        key: 'categories',
        label: 'Danh mục chính',
        children: <CategoryTable />,
    },
    {
        key: 'subcategories',
        label: 'Danh mục con',
        children: <SubcategoryTable />,
    },
    {
        key: 'sub-subcategories',
        label: 'Danh mục chi tiết',
        children: <SubSubcategoryTable />,
    },
];

const ManageCategory = () => {
    return (
        <div className="flex flex-col h-fit w-full p-5 gap-3 bg-gray-50 overflow-scroll">
            <div className="header-part flex flex-col">
                <h1 className="text-2xl font-bold mb-2">Quản lý danh mục</h1>
                <p>Quản lý danh mục sản phẩm theo 3 cấp: danh mục chính, danh mục con, và danh mục chi tiết</p>
            </div>
            <div className="bg-white p-5 border border-gray-200 rounded-xl">
                <Tabs defaultActiveKey="categories" items={tabItems} destroyInactiveTabPane />
            </div>
        </div>
    );
};

export default ManageCategory;
