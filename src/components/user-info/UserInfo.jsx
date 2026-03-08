const UserInfo = ({ avtUrl, userName }) => {
    return (
        <div className="flex flex-row gap-3 items-center">
            <img src={avtUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
            <p>{userName}</p>
        </div>
    )
}

export default UserInfo;