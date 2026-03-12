import Logo from "../logo/Logo";
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import LoyaltyOutlinedIcon from '@mui/icons-material/LoyaltyOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SidebarItem from "./sidebar-item/SidebarItem";

const Sidebar = ({ className = "" }) => {
    return (
        <div className={`${className} sidebar w-1/6 h-full flex flex-col border border-gray-200 `} >
            <Logo />
            <div className="flex flex-col gap-2 justify-center">
                <SidebarItem
                    icon={<SpaceDashboardOutlinedIcon />}
                    name={"Tổng quan"}
                    link={"/dashboard"}
                />
                <SidebarItem
                    icon={<ManageAccountsOutlinedIcon />}
                    name={"Quản lý nhân viên"}
                    link={"/manage-employee"}
                />
                <SidebarItem
                    icon={<PeopleOutlineOutlinedIcon />}
                    name={"Quản lý khách hàng"}
                    link={"/manage-customer"}
                />
                <SidebarItem
                    icon={<ShoppingBasketOutlinedIcon />}
                    name={"Quản lý sản phẩm"}
                    link={"/manage-product"}
                />
                <SidebarItem
                    icon={<Inventory2OutlinedIcon />}
                    name={"Đóng gói"}
                    link={"/manage-packaging"}
                />
                <SidebarItem
                    icon={<LocalShippingOutlinedIcon />}
                    name={"Vận chuyển"}
                    link={"/manage-shipping"}
                />
                <SidebarItem
                    icon={<WarehouseOutlinedIcon />}
                    name={"Quản lý kho"}
                    link={"/manage-warehouse"}
                />
                <SidebarItem
                    icon={<ArticleOutlinedIcon />}
                    name={"Quản lý nội dung"}
                    link={"/manage-content"}
                />
                <SidebarItem
                    icon={<LoyaltyOutlinedIcon />}
                    name={"Sự kiện khuyến mãi"}
                    link={"/manage-sale-event"}
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