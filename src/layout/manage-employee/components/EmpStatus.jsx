const EmpStatus = ({ status }) => {
    const color =
        status === "ACTIVE"
            ? "text-green-600 bg-green-100"
            : "text-gray-600 bg-gray-100"

    return (
        <span className={`px-2 py-1 rounded text-sm ${color}`}>
            {status}
        </span>
    )
}

export default EmpStatus;