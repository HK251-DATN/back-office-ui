import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts"

const profitData = [
    { day: "Mon", profit: 120 },
    { day: "Tue", profit: 200 },
    { day: "Wed", profit: 150 },
    { day: "Thu", profit: 280 },
    { day: "Fri", profit: 320 },
    { day: "Sat", profit: 260 },
    { day: "Sun", profit: 400 }
]

const ProfitChart = () => {
    return (
        <div className="w-full h-96 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm text-gray-500 mb-4">
                Profit (Last 7 Days)
            </h3>

            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="day" />

                    <YAxis />

                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#16a34a"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default ProfitChart;