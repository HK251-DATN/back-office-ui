export const CustomerInfo = ({ avtUrl, cusName, startAt }) => {
    return (
        <div className="flex flex-row gap-3 items-center">
            <img src={avtUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
            <div className="flex flex-col">
                <p>{cusName}</p>
                <p className="text-sm">Từ ngày {startAt}</p>
            </div>
        </div>
    )
}