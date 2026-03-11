import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import SearchBox from '../../components/search-box/SearchBox';
import SummaryCard from '../../components/summary-card/SummaryCard';
import { useEffect, useState } from 'react';
import { getEmployees } from '../../services/employeeService';
import { Table } from 'antd';
import UserInfo from '../../components/user-info/UserInfo';
import EmpStatus from './components/EmpStatus';
import DeleteButton from '../../components/DeleteButton';
import EditButton from '../../components/EditButton';
import ViewButton from '../../components/ViewButton';
import CreateEmployeeModal from './modals/create-employee/CreateEmployeeModal';
import ViewEmployeeModal from './modals/view-employee/ViewEmployeeModal';
import UpdateEmployeeModal from './modals/view-employee/UpdateEmployeeModal';

const ManageEmployee = () => {
    const [employees, setEmployees] = useState([])
    const [openCreateEmpModal, setOpenCreateEmpModal] = useState(false)
    const [openViewEmployeeModal, setOpenViewEmployeeModal] = useState(false)
    const [openUpdateEmployeeModal, setOpenUpdateEmployeeModal] = useState(false)
    const [curEmpInViewEmployeeModal, setCurEmpInViewEmployeeModal] = useState(null)
    const [curEmpInUpdateEmployeeModal, setCurEmpInUpdateEmployeeModal] = useState(null)

    useEffect(() => {
        getEmployees().then((data) => {
            setEmployees(data)
        })
    }, [])

    const transformEmployees = (employees) => {
        return employees.map((emp) => ({
            key: emp.id,
            id: emp.id,

            empInfo: (
                <UserInfo
                    userName={emp.name}
                    avtUrl={emp.avt_url}
                />
            ),

            email: emp.email,
            phone_num: emp.phone_num,
            role: emp.role,
            start_date: emp.start_date,

            status: (
                <EmpStatus status={emp.status} />
            ),

            action: (
                <div className="flex gap-2">
                    <ViewButton onClick={() => { setCurEmpInViewEmployeeModal(emp); setOpenViewEmployeeModal(true) }}></ViewButton>
                    <EditButton onClick={() => { setCurEmpInUpdateEmployeeModal(emp); setOpenUpdateEmployeeModal(true) }} />
                    <DeleteButton />
                </div>
            )
        }))
    }

    const empColumns = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'empInfo',
            key: 'empInfo',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone number',
            dataIndex: 'phone_num',
            key: 'phone_num',
        },
        {
            title: 'Start date',
            dataIndex: 'start_date',
            key: 'start_date',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action'
        },
    ];

    const handleOpenCreateEmpModal = () => {
        console.log("clicked")
        setOpenCreateEmpModal(true)
    }

    const handleCloseCreateEmpModal = () => {
        setOpenCreateEmpModal(false)
    }

    const handleCloseViewEmployeeModal = () => {
        setOpenViewEmployeeModal(false)
    }

    const handleCloseUpdateEmployeeModal = () => {
        setOpenUpdateEmployeeModal(false)
    }

    return (
        <div className="flex flex-col h-fit w-full p-5 gap-3 bg-gray-50">
            <div className="header-part flex flex-row justify-between items-center">
                <div className="title">
                    <h1 className='text-2xl font-bold mb-2'>Quản lý nhân viên</h1>
                    <p>Quản lý tài khoản và phân quyền nhân viên</p>
                </div>
                <div className="add-emp-button">
                    <Button variant='contained' color="success" startIcon={<AddIcon />}
                        onClick={handleOpenCreateEmpModal}
                    >Thêm nhân viên</Button>
                </div>
            </div>
            <div className="search-filter flex flex-row justify-between items-center p-5 bg-white border-gray-200 border rounded-xl">
                <div className='search w-4/5'>
                    <SearchBox></SearchBox>
                </div>
                <div className='filter'>Filter</div>
            </div>
            <div className="summary-cards flex flex-row justify-between gap-5">
                <SummaryCard title="Tổng nhân viên" content={7}></SummaryCard>
                <SummaryCard title="Đang hoạt động" variant='success' content={7}></SummaryCard>
                <SummaryCard title="Tạm ngưng" variant='danger' content={7}></SummaryCard>
                <SummaryCard title="Nhân viên mới (tháng này)" content={7}></SummaryCard>
            </div>
            <div className="data-table">
                <Table className='border border-gray-200 rounded-2xl' dataSource={transformEmployees(employees)} columns={empColumns} />
            </div>
            <div className="activity-log"></div>
            {/* ABSOLUTE POSITION */}
            <div>
                <CreateEmployeeModal openCreateEmpModal={openCreateEmpModal} closeModal={handleCloseCreateEmpModal} />
            </div>
            <div>
                {openViewEmployeeModal && <ViewEmployeeModal employee={curEmpInViewEmployeeModal} openViewEmployeeModal={openViewEmployeeModal} closeModal={handleCloseViewEmployeeModal} />}
            </div>
            <div>
                {openUpdateEmployeeModal && <UpdateEmployeeModal employee={curEmpInUpdateEmployeeModal} openUpdateEmployeeModal={openUpdateEmployeeModal} closeModal={handleCloseUpdateEmployeeModal} />}
            </div>

        </div>
    )
}

export default ManageEmployee;