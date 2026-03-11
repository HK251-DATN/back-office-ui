import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import IconButton from "@mui/material/IconButton"

const ViewButton = ({ onClick }) => {
    return (<IconButton onClick={onClick} color='info' aria-label="edit">
        <RemoveRedEyeIcon
        />
    </IconButton>)
}

export default ViewButton;