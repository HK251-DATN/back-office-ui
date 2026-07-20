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
import ManageCategory from "../layout/manage-category/ManageCategory";
import ManageOrder from "../layout/manage-order/ManageOrder";
import ManageProvider from "../layout/manage-provider/ManageProvider";
import ManageRawProductDemand from "../layout/manage-raw-product-demand/ManageRawProductDemand";
import ManageCoupon from "../layout/manage-coupon/ManageCoupon";
import PackagingEmployee from "../layout/packaging-employee/PackagingEmployee";
import DeliveryEmployee from "../layout/delivery-employee/DeliveryEmployee";
import Login from "../layout/login/Login";
import UnauthorizedPage from "../layout/pages/UnauthorizedPage";
import ProtectedRoute from "./ProtectedRoute";
import NotFoundPage from "../layout/pages/NotFoundPage";

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
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <Dashboard></Dashboard>
                    </ProtectedRoute>
                } />
                <Route path="dashboard" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <Dashboard></Dashboard>
                    </ProtectedRoute>
                } />
                <Route path="dashboard" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <Dashboard></Dashboard>
                    </ProtectedRoute>
                } />
                <Route path="manage-employee" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <ManageEmployee></ManageEmployee>
                    </ProtectedRoute>
                } />
                <Route path="manage-customer" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <ManageCustomer></ManageCustomer>
                    </ProtectedRoute>
                } />
                <Route path="manage-warehouse" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <ManageWarehouse></ManageWarehouse>
                    </ProtectedRoute>
                } />
                <Route path="manage-packaging" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <ManagePackaging></ManagePackaging>
                    </ProtectedRoute>
                } />
                <Route path="manage-shipping" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <ManageShipping></ManageShipping>
                    </ProtectedRoute>
                } />
                <Route path="manage-product" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <ManageProduct></ManageProduct>
                    </ProtectedRoute>
                } />
                <Route path="manage-category" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <ManageCategory></ManageCategory>
                    </ProtectedRoute>
                } />
                <Route path="manage-order" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <ManageOrder></ManageOrder>
                    </ProtectedRoute>
                } />
                <Route path="manage-content" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <ManageContent></ManageContent>
                    </ProtectedRoute>
                } />
                <Route path="manage-sale-event" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <ManageSaleEvent></ManageSaleEvent>
                    </ProtectedRoute>
                } />
                <Route path="manage-coupon" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <ManageCoupon></ManageCoupon>
                    </ProtectedRoute>
                } />
                <Route path="manage-provider" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <ManageProvider></ManageProvider>
                    </ProtectedRoute>
                } />
                <Route path="manage-raw-product-demand" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <ManageRawProductDemand></ManageRawProductDemand>
                    </ProtectedRoute>
                } />
                <Route path="system-setting" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <SystemSetting></SystemSetting>
                    </ProtectedRoute>
                } />
                <Route path="packaging/employee" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <PackagingEmployee></PackagingEmployee>
                    </ProtectedRoute>
                } />
                <Route path="delivery/employee" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "EMPLOYEE"]}>
                        <DeliveryEmployee></DeliveryEmployee>
                    </ProtectedRoute>
                } />
            </Route>

            {/* 404 - Catch all */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

export default AppRouter;