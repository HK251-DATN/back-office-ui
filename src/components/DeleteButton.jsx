import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from "@mui/material/IconButton"

const DeleteButton = ({ onClick }) => {
    return (<IconButton onClick={onClick} color="error" aria-label="delete">
        <DeleteIcon
        />
    </IconButton>)
}

export default DeleteButton;