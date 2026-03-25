import IconButton from "@mui/material/IconButton";
import CurrentUserInfo from "../current-user-info/CurrentUserInfo";
import SearchBox from "../search-box/SearchBox";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import Divider from "@mui/material/Divider"
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";

const Header = () => {
    const navigate = useNavigate();
    const curUser = JSON.parse(localStorage.getItem('user')) || {};
    const role = localStorage.getItem('role');

    // --- Dropdown Logic ---
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.clear(); // Clear token, user, and role
        navigate('/login');   // Redirect to login
        handleClose();
    };

    const handleGoToProfile = () => {
        navigate(`/profile/${curUser.userId}`); // Or your specific route
        handleClose();
    };

    return (<div className="header shrink-0 h-15 w-full flex flex-row justify-between items-center border border-gray-200 px-5">
        {/* Search bar */}
        <span className="h-3/4 w-3/5">
            <SearchBox></SearchBox>
        </span>
        {/* User info & Dropdown */}

        <span className="w-fit h-full flex flex-row gap-2 justify-center items-center">

            <IconButton className="h-10 w-10" aria-label="Notification">

                <NotificationsNoneIcon />

            </IconButton>



            <Divider variant="middle" orientation="vertical" flexItem />



            <CurrentUserInfo

                avtUrl={curUser.avtUrl}

                role={role}

                userName={`${curUser.fName} ${curUser.lName}`}

            />


            {/* Dropdown Trigger */}

            <IconButton

                className="h-10 w-10"

                aria-label="User options"

                onClick={handleClick}

                aria-controls={open ? 'user-menu' : undefined}

                aria-haspopup="true"

                aria-expanded={open ? 'true' : undefined}

            >

                <ArrowDropDownIcon />

            </IconButton>


            {/* The Actual Dropdown Menu */}

            <Menu

                id="user-menu"

                anchorEl={anchorEl}

                open={open}

                onClose={handleClose}

                transformOrigin={{ horizontal: 'right', vertical: 'top' }}

                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}

                PaperProps={{

                    elevation: 3,

                    sx: { mt: 1.5, minWidth: 180, borderRadius: '8px' }

                }}

            >

                <MenuItem onClick={handleGoToProfile} sx={{ py: 1.5 }}>

                    <ListItemIcon>

                        <AccountCircleIcon fontSize="small" />

                    </ListItemIcon>

                    <Typography variant="inherit">Thông tin tài khoản</Typography>

                </MenuItem>


                <Divider sx={{ my: 0.5 }} />


                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>

                    <ListItemIcon>

                        <LogoutIcon fontSize="small" color="error" />

                    </ListItemIcon>

                    <Typography variant="inherit">Đăng xuất</Typography>

                </MenuItem>

            </Menu>

        </span>
    </div>)
}

export default Header;