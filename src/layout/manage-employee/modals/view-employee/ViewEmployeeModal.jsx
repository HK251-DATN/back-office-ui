import { Button, Modal } from "antd"
import Divider from '@mui/material/Divider';
import TextField from "@mui/material/TextField";

const ViewEmployeeModal = ({ openViewEmployeeModal, closeModal, employee }) => {
    return (
        <Modal
            open={openViewEmployeeModal}
            footer={[
                <Button key="back" onClick={closeModal}>
                    Return
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
                    disabled
                    label="Họ và tên"
                    value={employee.name}
                ></TextField>

                <TextField
                    disabled
                    label="Ngày tháng năm sinh"
                    value={employee.dob}
                ></TextField>

                <TextField
                    disabled
                    label="Giới tính"
                    value={employee.sex}
                ></TextField>

                <TextField
                    disabled
                    label="Số điện thoại"
                    value={employee.phone_num}
                ></TextField>

                <TextField
                    disabled
                    label="Vai trò"
                    value={employee.role}
                ></TextField>
            </div>
        </Modal>
    )
}

export default ViewEmployeeModal