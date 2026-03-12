export const DeliveringEmp = () => {
    return (
        <div className="flex flex-col border border-gray-200 p-5 gap-3 rounded-xl">
            <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-3 items-center">
                    {/* avt */}
                    <div>
                        <img src={"https://i.pravatar.cc/150?img=1"} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                    </div>

                    <div>
                        {/* Thong tin nhan vien */}
                        <p>Nguyễn Thị Cẩm</p>
                        {/* So don */}
                        <p className="text-sm">Xe máy</p>
                    </div>
                </div>

                {/* Status */}
                <div className="px-2 py-1 h-fit w-fit bg-blue-200 rounded-lg">
                    <p className="text-blue-600">Bận</p>
                </div>
            </div>

            <div className="h-fit w-full px-3 py-2 bg-gray-200 rounded-lg">
                <p>Đang giao hàng: DH-8902</p>
            </div>
        </div>
    )
}