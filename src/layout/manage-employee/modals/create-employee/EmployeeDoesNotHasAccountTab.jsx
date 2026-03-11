import TextField from "@mui/material/TextField";
import { Button } from "antd";

const EmployeeDoesNotHasAccountTab = () => {
    return (
        <div className="flex flex-col gap-2 py-5 ">
            <TextField
                required
                label="Email"
            ></TextField>

            <TextField
                required
                label="Họ"
            ></TextField>

            <TextField
                required
                label="Tên"
            ></TextField>

            <TextField
                required
                label="Ngày tháng năm sinh"
            ></TextField>

            <TextField
                required
                label="Giới tính"
            ></TextField>

            <TextField
                required
                label="Số điện thoại"
            ></TextField>
        </div>
    )

}

export default EmployeeDoesNotHasAccountTab;