import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { Button } from 'antd';

export const PackagingTask = () => {
    return (
        <div className="grid grid-cols-2 h-32 w-full">
            <div className="flex flex-row gap-5 ">
                <div className="flex items-center justify-center p-4 h-fit w-fit rounded-xl bg-blue-100">
                    < Inventory2OutlinedIcon color='primary' />
                </div>
                <div className='flex flex-col'>
                    <p className='text-xl'>DH-8901</p>
                    <p className=''>Nguyen Thi Mai</p>
                    <div className='flex flex-row w-fit gap-3'>
                        <p>3 món</p>
                        <p>•</p>
                        <p>1.2kg</p>
                        <p>•</p>
                        <p>Giao trước 10:00</p>
                    </div>
                </div>
            </div>
            <div className='flex justify-end h-fit'>
                <p className='py-2 px-4 bg-yellow-100 rounded-xl'>Chờ đóng gói</p>
            </div>
            <div className='flex items-end'>Nhân viên đang thực hiện: Nguyễn Thị Cẩm</div>
            <div className='flex items-end justify-end'>
                <Button type='primary' size='large'>Bắt đầu đóng gói</Button>
            </div>
        </div>
    )
}