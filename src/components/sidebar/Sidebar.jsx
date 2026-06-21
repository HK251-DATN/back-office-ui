import Logo from "../logo/Logo";
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LoyaltyOutlinedIcon from '@mui/icons-material/LoyaltyOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import SidebarItem from "./sidebar-item/SidebarItem";

const Sidebar = ({ className = "" }) => {
    return (
        <div className={`${className} sidebar w-1/8 shrink-0 h-full flex flex-col border border-gray-200 `} >
            <Logo />
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 py-2">
                <SidebarItem
                    icon={<SpaceDashboardOutlinedIcon />}
                    name={"Tổng quan"}
                    link={"/dashboard"}
                />
                {/* <SidebarItem
                    icon={<ManageAccountsOutlinedIcon />}
                    name={"Quản lý nhân viên"}
                    link={"/manage-employee"}
                /> */}
                {/* <SidebarItem
                    icon={<PeopleOutlineOutlinedIcon />}
                    name={"Quản lý khách hàng"}
                    link={"/manage-customer"}
                /> */}
                <SidebarItem
                    icon={<StorefrontOutlinedIcon />}
                    name={"Quản lý nhà cung cấp"}
                    link={"/manage-provider"}
                />
                <SidebarItem
                    icon={<ShoppingBasketOutlinedIcon />}
                    name={"Quản lý sản phẩm"}
                    link={"/manage-product"}
                />
                <SidebarItem
                    icon={<CategoryOutlinedIcon />}
                    name={"Quản lý danh mục"}
                    link={"/manage-category"}
                />
                <SidebarItem
                    icon={<ShoppingCartOutlinedIcon />}
                    name={"Quản lý đơn hàng"}
                    link={"/manage-order"}
                />
                {/* <SidebarItem
                    icon={<Inventory2OutlinedIcon />}
                    name={"Đóng gói"}
                    link={"/manage-packaging"}
                /> */}
                <SidebarItem
                    icon={<AssignmentIndOutlinedIcon />}
                    name={"Nhiệm vụ đóng gói"}
                    link={"/packaging/employee"}
                />
                <SidebarItem
                    icon={<DeliveryDiningOutlinedIcon />}
                    name={"Nhiệm vụ giao hàng"}
                    link={"/delivery/employee"}
                />
                {/* <SidebarItem
                    icon={<LocalShippingOutlinedIcon />}
                    name={"Vận chuyển"}
                    link={"/manage-shipping"}
                /> */}
                <SidebarItem
                    icon={<WarehouseOutlinedIcon />}
                    name={"Quản lý kho"}
                    link={"/manage-warehouse"}
                />
                <SidebarItem
                    icon={<RequestQuoteOutlinedIcon />}
                    name={"Yêu cầu nguyên liệu"}
                    link={"/manage-raw-product-demand"}
                />
                {/* <SidebarItem
                    icon={<ArticleOutlinedIcon />}
                    name={"Quản lý nội dung"}
                    link={"/manage-content"}
                /> */}
                <SidebarItem
                    icon={<LoyaltyOutlinedIcon />}
                    name={"Sự kiện khuyến mãi"}
                    link={"/manage-sale-event"}
                />
                <SidebarItem
                    icon={<LocalOfferOutlinedIcon />}
                    name={"Mã giảm giá"}
                    link={"/manage-coupon"}
                />
                <SidebarItem
                    icon={<SettingsOutlinedIcon />}
                    name={"Cài đặt hệ thống"}
                    link={"/system-setting"}
                />
            </div>
        </div>
    )
}

export default Sidebar;