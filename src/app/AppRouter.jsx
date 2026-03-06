import { Route, Routes } from "react-router-dom";
import Base from "../layout/Base";
import Dashboard from "../layout/dashboard/Dashboard";
import ManageContent from "../layout/manage-content/ManageContent";
import SystemSetting from "../layout/system-setting/SystemSetting";
import ManageCustomer from "../layout/manage-customer/ManageCustomer";
import ManageEmployee from "../layout/manage-employee/ManageEmployee";
import ManageWarehouse from "../layout/manage-warehouse/ManageWarehouse";
import ManagePackaging from "../layout/manage-packaging/ManagePackaging";
import ManageShipping from "../layout/manage-shipping/ManageShipping";
import ManageProduct from "../layout/manage-product/ManageProduct";
import ManageSaleEvent from "../layout/manage-sale-event/ManageSaleEvent";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Base />} >
                <Route index element={<Dashboard></Dashboard>} />
                <Route path="dashboard" element={<Dashboard></Dashboard>} />
                <Route path="dashboard" element={<Dashboard></Dashboard>} />
                <Route path="manage-employee" element={<ManageEmployee></ManageEmployee>} />
                <Route path="manage-customer" element={<ManageCustomer></ManageCustomer>} />
                <Route path="manage-warehouse" element={<ManageWarehouse></ManageWarehouse>} />
                <Route path="manage-packaging" element={<ManagePackaging></ManagePackaging>} />
                <Route path="manage-shipping" element={<ManageShipping></ManageShipping>} />
                <Route path="manage-product" element={<ManageProduct></ManageProduct>} />
                <Route path="manage-content" element={<ManageContent></ManageContent>} />
                <Route path="manage-sale-event" element={<ManageSaleEvent></ManageSaleEvent>} />
                <Route path="system-setting" element={<SystemSetting></SystemSetting>} />
            </Route>
        </Routes>
    )
}

export default AppRouter;