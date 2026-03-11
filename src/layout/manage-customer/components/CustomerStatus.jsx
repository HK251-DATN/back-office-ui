export const CustomerStatus = ({ status }) => {

    if (status === 'ACTIVE') {
        return (
            <div className="py-2 px-4 w-fit h-fit rounded-sm bg-green-300">Hoạt động</div>
        )
    }
    else if (status === 'INACTIVE') {
        return (
            <div className="py-2 px-4 w-fit h-fit rounded-sm bg-yellow-200">Không hoạt động</div>
        )
    }
    else if (status === 'SUSPENDED') {
        return (
            <div className="py-2 px-4 w-fit h-fit rounded-sm bg-red-200">Dừng hoạt động</div>
        )
    }
}