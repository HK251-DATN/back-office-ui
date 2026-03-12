import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { Button, Divider } from 'antd';

export const DeliveringTask = ({ status }) => {
    if (status === 'DELIVERED')
        return (
            <div className="flex flex-col gap-5 h-fit w-full border border-gray-200 rounded-xl p-5">
                {/* TOP ROW */}
                <div className='flex flex-row justify-between'>
                    {/* COL 1 */}
                    <div className="flex flex-row gap-5 ">
                        <div className="flex items-center justify-center p-4 h-fit w-fit rounded-xl bg-green-100">
                            < Inventory2OutlinedIcon color='success' />
                        </div>
                        <div className='flex flex-col'>
                            <p className='text-xl'>DH-8901</p>
                            <p className=''>Nguyen Thi Mai</p>
                            <p className='address text-gray-600'>Địa chỉ: 123 Hoàng Hoa Thám, Ba Đình, Hà Nội</p>
                            <p >Tài xế: Lê Hoàng Duy</p>
                        </div>
                    </div>
                    {/* COL 2 */}
                    <div className='flex flex-col gap-2'>
                        <div className='px-3 py-2 flex gap-2 bg-green-200 w-fit h-fit rounded-xl'>
                            < CheckCircleOutlineOutlinedIcon color='success' />
                            <p className='text-green-700'>Đã giao</p>
                        </div>
                        <p className='text-sm text-gray-700'>2026-03-01 14:30</p>
                    </div>
                </div>

                <Divider style={{ "margin": 0, "color": "rgba(0,0,0,0.5)" }}></Divider>

                {/* BOTTOM ROW */}
                <div className='flex flex-row justify-between'>
                    {/* COL 1 */}
                    <div className='flex flex-row gap-10'>
                        <div className='flex flex-row gap-5 justify-end h-fit'>
                            <div className='flex flex-col w-fit h-fit gap-2'>
                                <p>Phí ship:</p>
                                <p>35.000 đ</p>
                            </div>

                            <div className='flex flex-col w-fit h-fit gap-2'>
                                <p>Khoảng cách</p>
                                <p>4.2 km</p>
                            </div>
                        </div>
                    </div>

                    {/* COL 2 */}
                    <div className='flex items-end justify-end'>
                        <Button type='primary' size='large'>Chi tiết</Button>
                    </div>
                </div>
            </div>
        )
    else if (status === 'DELIVERING')
        return (
            <div className="flex flex-col gap-5 h-fit w-full border border-gray-200 rounded-xl p-5">
                {/* TOP ROW */}
                <div className='flex flex-row justify-between'>
                    {/* COL 1 */}
                    <div className="flex flex-row gap-5 ">
                        <div className="flex items-center justify-center p-4 h-fit w-fit rounded-xl bg-blue-100">
                            < Inventory2OutlinedIcon color='primary' />
                        </div>
                        <div className='flex flex-col'>
                            <p className='text-xl'>DH-8901</p>
                            <p className=''>Nguyen Thi Mai</p>
                            <p className='address text-gray-600'>Địa chỉ: 123 Hoàng Hoa Thám, Ba Đình, Hà Nội</p>
                            <p >Tài xế: Lê Hoàng Duy</p>
                        </div>
                    </div>
                    {/* COL 2 */}
                    <div className='px-3 py-2 flex gap-2 bg-blue-200 w-fit h-fit rounded-xl'>
                        < CheckCircleOutlineOutlinedIcon color='primary' />
                        <p className='text-blue-700'>Đang giao</p>
                    </div>
                </div>

                <Divider style={{ "margin": 0, "color": "rgba(0,0,0,0.5)" }}></Divider>

                {/* BOTTOM ROW */}
                <div className='flex flex-row justify-between'>
                    {/* COL 1 */}
                    <div className='flex flex-row gap-10'>
                        <div className='flex flex-row gap-5 justify-end h-fit'>
                            <div className='flex flex-col w-fit h-fit gap-2'>
                                <p>Phí ship:</p>
                                <p>35.000 đ</p>
                            </div>

                            <div className='flex flex-col w-fit h-fit gap-2'>
                                <p>Khoảng cách</p>
                                <p>4.2 km</p>
                            </div>
                        </div>
                    </div>

                    {/* COL 2 */}
                    <div className='flex items-end justify-end'>
                        <Button type='primary' size='large'>Chi tiết</Button>
                    </div>
                </div>
            </div>
        )
    else
        return (
            <div className="flex flex-col gap-5 h-fit w-full border border-gray-200 rounded-xl p-5">
                {/* TOP ROW */}
                <div className='flex flex-row justify-between'>
                    {/* COL 1 */}
                    <div className="flex flex-row gap-5 ">
                        <div className="flex items-center justify-center p-4 h-fit w-fit rounded-xl bg-yellow-100">
                            < Inventory2OutlinedIcon color='warning' />
                        </div>
                        <div className='flex flex-col'>
                            <p className='text-xl'>DH-8901</p>
                            <p className=''>Nguyen Thi Mai</p>
                            <p className='address text-gray-600'>Địa chỉ: 123 Hoàng Hoa Thám, Ba Đình, Hà Nội</p>
                            {/* <p >Tài xế: Lê Hoàng Duy</p> */}
                        </div>
                    </div>
                    {/* COL 2 */}
                    <div className='px-3 py-2 flex gap-2 bg-yellow-200 w-fit h-fit rounded-xl'>
                        < CheckCircleOutlineOutlinedIcon color='warning' />
                        <p className='text-yellow-700'>Chờ lấy hàng</p>
                    </div>
                </div>

                <Divider style={{ "margin": 0, "color": "rgba(0,0,0,0.5)" }}></Divider>

                {/* BOTTOM ROW */}
                <div className='flex flex-row justify-between'>
                    {/* COL 1 */}
                    <div className='flex flex-row gap-10'>
                        <div className='flex flex-row gap-5 justify-end h-fit'>
                            <div className='flex flex-col w-fit h-fit gap-2'>
                                <p>Phí ship:</p>
                                <p>35.000 đ</p>
                            </div>

                            <div className='flex flex-col w-fit h-fit gap-2'>
                                <p>Khoảng cách</p>
                                <p>4.2 km</p>
                            </div>
                        </div>
                    </div>

                    {/* COL 2 */}
                    <div className='flex items-end justify-end gap-5'>
                        <Button size='large'>Phân công tài xế</Button>
                        <Button type='primary' size='large'>Chi tiết</Button>
                    </div>
                </div>
            </div>
        )
}