import SummaryCard from "../../components/summary-card/SummaryCard";
import SearchBox from '../../components/search-box/SearchBox';
import { Table } from 'antd';
import { CustomerInfo } from "./components/CustomerInfo";
import { CustomerContact } from "./components/CustomerContact";
import { CustomerStatus } from "./components/CustomerStatus";
import { buyers } from "../../mocks/buyers";
import ViewButton from "../../components/ViewButton";
import EditButton from "../../components/EditButton";
import DeleteButton from "../../components/DeleteButton";

const ManageCustomer = () => {

    const transformBuyer = (buyers) => {
        return buyers.map((buyer) => ({
            key: buyer.id,
            id: buyer.id,
            cusInfo: (<CustomerInfo avtUrl={buyer.avatar_url} cusName={buyer.first_name + ' ' + buyer.last_name} startAt={buyer.created_at} />),
            cusContact: (<CustomerContact email={buyer.email} phone_num={buyer.phone_number} />),
            cusNumOrder: buyer.total_orders,
            cusTotalSpending: `${buyer.total_spend_amount} đ`,
            status: (< CustomerStatus status={buyer.account_status} />),
            action: (
                <div className="flex gap-2">
                    <ViewButton />
                    <EditButton />
                    <DeleteButton />
                </div>
            )
        }))
    }

    const cusColumns = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Khách hàng',
            dataIndex: 'cusInfo',
            key: 'cusInfo',
        },
        {
            title: 'Liên hệ',
            dataIndex: 'cusContact',
            key: 'cusContact',
        },
        {
            title: 'Tổng đơn',
            dataIndex: 'cusNumOrder',
            key: 'cusNumOrder',
        },
        {
            title: 'Tổng chi tiêu',
            dataIndex: 'cusTotalSpending',
            key: 'cusTotalSpending',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action'
        },
    ];

    return (
        <div className="flex flex-col h-fit w-full p-5 gap-3 bg-gray-50 overflow-scroll">
            <div className="header-part flex flex-col">
                <h1 className='text-2xl font-bold mb-2'>Quản lý khách hàng</h1>
                <p>Quản lý tài khoản và lịch sử mua hàng của khách hàng</p>
            </div>

            <div className="summary-cards flex flex-row justify-between gap-5">
                <SummaryCard title="Tổng khách hàng" content={7} subContent={"+24 tuần này"}></SummaryCard>
                <SummaryCard title="Khách hàng VIP" variant='success' content={7} subContent={"Chi tiêu > 15tr"}></SummaryCard>
                <SummaryCard title="Khách hàng cần chú ý" variant='danger' content={7} subContent={"Có cảnh báo"}></SummaryCard>
                <SummaryCard title="Tỷ lệ quay lại" content={7} subContent={"+5% so với tháng trước"}></SummaryCard>
            </div>
            <div className="search-filter flex flex-row justify-between items-center p-5 bg-white border-gray-200 border rounded-xl">
                <div className='search w-4/5'>
                    <SearchBox></SearchBox>
                </div>
                <div className='filter'>Filter</div>
            </div>
            <div className="data-table">
                <Table columns={cusColumns} dataSource={transformBuyer(buyers)} className='border border-gray-200 rounded-2xl' />
            </div>
        </div>
    )
}

export default ManageCustomer;