import { Button, Modal } from "antd"
import Divider from '@mui/material/Divider';
import TextField from "@mui/material/TextField";
import { useState } from "react";

const UpdateEmployeeModal = ({ openUpdateEmployeeModal, closeModal, employee }) => {
    const [loading, setLoading] = useState(false);

    const handleOk = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            closeModal();
        }, 3000);
    };

    return (
        <Modal
            open={openUpdateEmployeeModal}
            footer={[
                <Button key="back" onClick={closeModal}>
                    Return
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                    Update
                </Button>
            ]}
        >
            <div className="flex flex-col gap-3 p-5">
                {/* Header */}
                {/* Thông tin của nhân viên 123 - Nguyễn Thị A */}
                <h1 className="text-xl font-bold">Thông tin của nhân viên {employee.id} - {employee.name}</h1>
                <Divider></Divider>
                {/* Content */}
                <TextField
                    disabled
                    label="Id"
                    value={employee.id}
                ></TextField>

                <TextField
                    disabled
                    label="Email"
                    value={employee.email}
                ></TextField>

                <TextField
                    label="Họ và tên"
                    value={employee.name}
                ></TextField>

                <TextField
                    label="Ngày tháng năm sinh"
                    value={employee.dob}
                ></TextField>

                <TextField
                    label="Giới tính"
                    value={employee.sex}
                ></TextField>

                <TextField
                    label="Số điện thoại"
                    value={employee.phone_num}
                ></TextField>

                <TextField
                    label="Vai trò"
                    value={employee.role}
                ></TextField>
            </div>
        </Modal>
    )
}

export default UpdateEmployeeModal