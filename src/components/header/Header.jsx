import IconButton from "@mui/material/IconButton";
import CurrentUserInfo from "../current-user-info/CurrentUserInfo";
import SearchBox from "../search-box/SearchBox";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Divider from "@mui/material/Divider"

const Header = () => {
    const curUser = {
        avtUrl: 'https://pub-954e99f131cf4cc896de1ad360338682.r2.dev/efe72f6c-d93f-487e-99d3-59cc890c8418_Koala.jpg',
        userName: 'Nguyễn Văn A',
        role: 'Quản trị viên'
    }

    return (<div className="header shrink-0 h-15 w-full flex flex-row justify-between items-center border border-gray-200 px-5">
        {/* Search bar */}
        <span className="h-3/4 w-3/5">
            <SearchBox></SearchBox>
        </span>
        {/* User info */}
        <span className="w-fit h-full flex flex-row gap-2 justify-center items-center">
            <IconButton className="h-10 w-10" aria-label="Notification">
                <NotificationsNoneIcon></NotificationsNoneIcon>
            </IconButton>
            <Divider variant="middle" orientation="vertical" flexItem />
            <CurrentUserInfo avtUrl={curUser.avtUrl} role={curUser.role} userName={curUser.userName} />
            <IconButton className="h-10 w-10" aria-label="User options">
                <ArrowDropDownIcon></ArrowDropDownIcon>
            </IconButton>
        </span>
    </div>)
}

export default Header;