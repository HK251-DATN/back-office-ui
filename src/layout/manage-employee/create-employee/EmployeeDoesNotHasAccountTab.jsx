import TextField from "@mui/material/TextField";
import { Button } from "antd";

const EmployeeDoesNotHasAccountTab = () => {
    return (
        <div>
            <TextField
                required
                label="Email"
            ></TextField>

            <Button>Create employee account</Button>
        </div>
    )

}

export default EmployeeDoesNotHasAccountTab;