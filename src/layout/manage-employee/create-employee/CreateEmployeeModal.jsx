import { Modal, Button, Tabs } from 'antd';
import { useState } from 'react';
import EmployeeAlreadyHasAccountTab from './EmployeeAlreadyHasAccountTab';
import EmployeeDoesNotHasAccountTab from './EmployeeDoesNotHasAccountTab';
import TextField from '@mui/material/TextField';

const CreateEmployeeModal = ({ openCreateEmpModal, closeModal }) => {
    const [loading, setLoading] = useState(false);
    const [empHasAccount, setEmpHasAccount] = useState(false);

    const handleOk = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            closeModal();
        }, 3000);
    };

    const handleTabChange = () => {
        setEmpHasAccount(empHasAccount => !empHasAccount)
    }

    const tabItems = [
        {
            key: '1',
            label: 'Nhân viên đã có tài khoản',
            children: < EmployeeAlreadyHasAccountTab />
        },
        {
            key: '2',
            label: 'Nhân viên chưa có tài khoản',
            children: < EmployeeDoesNotHasAccountTab />
        },
    ]

    return (
        <Modal
            open={openCreateEmpModal}
            onCancel={closeModal}
            title='Tạo tài khoản nhân viên'
            footer={[
                <Button key="back" onClick={closeModal}>
                    Return
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                    Submit
                </Button>
            ]}>
            <Tabs defaultActiveKey='1' items={tabItems} onChange={handleTabChange}></Tabs>
            <TextField
                required
                label="Role"
            ></TextField>
            <TextField
                required
                label="Join date"
            ></TextField>
        </Modal>
    )
}

export default CreateEmployeeModal;