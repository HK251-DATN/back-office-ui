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

const Sidebar = () => {
    return (
        <div className="sidebar w-1/6 h-full flex flex-col border border-gray-200" >
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
                    link={"/dashboard"}
                />
                <SidebarItem
                    icon={<PeopleOutlineOutlinedIcon />}
                    name={"Quản lý khách hàng"}
                    link={"/dashboard"}
                />
                <SidebarItem
                    icon={<WarehouseOutlinedIcon />}
                    name={"Quản lý kho"}
                    link={"/dashboard"}
                />
                <SidebarItem
                    icon={<Inventory2OutlinedIcon />}
                    name={"Đóng gói"}
                    link={"/dashboard"}
                />
                <SidebarItem
                    icon={<LocalShippingOutlinedIcon />}
                    name={"Vận chuyển"}
                    link={"/dashboard"}
                />
                <SidebarItem
                    icon={<ShoppingBasketOutlinedIcon />}
                    name={"Quản lý sản phẩm"}
                    link={"/dashboard"}
                />
                <SidebarItem
                    icon={<ArticleOutlinedIcon />}
                    name={"Quản lý nội dung"}
                    link={"/dashboard"}
                />
                <SidebarItem
                    icon={<LoyaltyOutlinedIcon />}
                    name={"Sự kiện khuyến mãi"}
                    link={"/dashboard"}
                />
                <SidebarItem
                    icon={<SettingsOutlinedIcon />}
                    name={"Cài đặt hệ thống"}
                    link={"/dashboard"}
                />
            </div>
        </div>
    )
}

export default Sidebar;