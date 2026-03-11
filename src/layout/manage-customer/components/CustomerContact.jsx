export const CustomerContact = ({ email, phone_num }) => {
    return (
        <div className="flex flex-col gap-1">
            <p className="font-semibold">{email}</p>
            <p>{phone_num}</p>
        </div>
    )
}