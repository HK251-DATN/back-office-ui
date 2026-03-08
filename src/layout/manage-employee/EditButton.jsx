import EditIcon from '@mui/icons-material/Edit';
import IconButton from "@mui/material/IconButton"

const EditButton = ({ onClick }) => {
    return (<IconButton onClick={onClick} color='info' aria-label="edit">
        <EditIcon
        />
    </IconButton>)
}

export default EditButton;