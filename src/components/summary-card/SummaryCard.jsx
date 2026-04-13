const variantStyles = {
    default: "text-gray-800",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
    info: "text-blue-600"
}

const SummaryCard = ({ title, content, subContent, variant = "default", onClick }) => {
    return (
        <div
            className={`flex flex-col justify-between bg-white rounded-xl border border-gray-200 p-4 w-full h-28 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                }`}
            onClick={onClick}
        >

            <p className="text-sm text-gray-500">
                {title}
            </p>

            <p className={`text-2xl font-semibold ${variantStyles[variant]}`}>
                {content}
            </p>

            <p className={`text-sm ${variantStyles[variant]}`}>
                {subContent}
            </p>

        </div>
    )
}

export default SummaryCard