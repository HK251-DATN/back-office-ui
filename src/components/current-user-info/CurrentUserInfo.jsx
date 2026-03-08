const CurrentUserInfo = ({
    avtUrl, userName, role
}) => {
    return (
        <div className="flex flex-row gap-3 h-full w-fit justify-center items-center px-4">
            <img src={avtUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
            <div className="flex flex-col justify-center">
                <p className="font-bold">{userName}</p>
                <p>{role}</p>
            </div>
        </div>
    )
}

export default CurrentUserInfo;