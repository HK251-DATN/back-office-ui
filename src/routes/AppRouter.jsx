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
import Login from "../layout/login/Login";
import UnauthorizedPage from "../layout/pages/UnauthorizedPage";
import ProtectedRoute from "./ProtectedRoute";

const AppRouter = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={< Login />} />

            <Route path="/unauthorized" element={< UnauthorizedPage />} />

            {/* Protected Routes */}
            <Route
                path="/"
                element={<ProtectedRoute>
                    <Base />
                </ProtectedRoute>} >
                <Route index element={
                    <ProtectedRoute>
                        <Dashboard></Dashboard>
                    </ProtectedRoute>
                } />
                <Route path="dashboard" element={
                    <ProtectedRoute>
                        <Dashboard></Dashboard>
                    </ProtectedRoute>
                } />
                <Route path="dashboard" element={
                    <ProtectedRoute>
                        <Dashboard></Dashboard>
                    </ProtectedRoute>
                } />
                <Route path="manage-employee" element={
                    <ProtectedRoute>
                        <ManageEmployee></ManageEmployee>
                    </ProtectedRoute>
                } />
                <Route path="manage-customer" element={
                    <ProtectedRoute>
                        <ManageCustomer></ManageCustomer>
                    </ProtectedRoute>
                } />
                <Route path="manage-warehouse" element={
                    <ProtectedRoute>
                        <ManageWarehouse></ManageWarehouse>
                    </ProtectedRoute>
                } />
                <Route path="manage-packaging" element={
                    <ProtectedRoute>
                        <ManagePackaging></ManagePackaging>
                    </ProtectedRoute>
                } />
                <Route path="manage-shipping" element={
                    <ProtectedRoute>
                        <ManageShipping></ManageShipping>
                    </ProtectedRoute>
                } />
                <Route path="manage-product" element={
                    <ProtectedRoute>
                        <ManageProduct></ManageProduct>
                    </ProtectedRoute>
                } />
                <Route path="manage-content" element={
                    <ProtectedRoute>
                        <ManageContent></ManageContent>
                    </ProtectedRoute>
                } />
                <Route path="manage-sale-event" element={
                    <ProtectedRoute>
                        <ManageSaleEvent></ManageSaleEvent>
                    </ProtectedRoute>
                } />
                <Route path="system-setting" element={
                    <ProtectedRoute>
                        <SystemSetting></SystemSetting>
                    </ProtectedRoute>
                } />
            </Route>
        </Routes>
    )
}

export default AppRouter;