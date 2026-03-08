const textVariantStyles = {
    default: "text-gray-800",
    b: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
    info: "text-blue-600"
}

const bgVariantStyles = {
    default: "bg-gray-400",
    success: "bg-green-300",
    warning: "bg-yellow-300",
    danger: "bg-red-300",
    info: "bg-blue-300"
}

const SummaryCard = ({ title, content, subContent, icon, variant = "default" }) => {
    return (
        <div className="flex flex-row justify-between items-center bg-white rounded-xl border border-gray-200 p-4 w-full h-28 shadow-sm">
            <div className="flex flex-col justify-between">

                <p className="text-sm text-gray-500">
                    {title}
                </p>

                <p className={`text-2xl font-semibold ${textVariantStyles[variant]}`}>
                    {content}
                </p>

                <p className={`text-sm  ${textVariantStyles[variant]}`}>
                    {subContent}
                </p>
            </div>
            <div className={`p-3 rounded-lg ${bgVariantStyles[variant]}`}>
                {icon}
            </div>
        </div>
    )
}

export default SummaryCard