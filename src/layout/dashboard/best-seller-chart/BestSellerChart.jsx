import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts"

const productSales = [
    { product: "Salmon", sales: 320 },
    { product: "Tuna", sales: 280 },
    { product: "Beef", sales: 400 },
    { product: "Chicken", sales: 350 },
    { product: "Shrimp", sales: 220 }
]

const BestSellerChart = () => {
    return (
        <div className="w-full h-96 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm text-gray-500 mb-4">
                Best Selling Products
            </h3>

            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={productSales}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="product" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                        dataKey="sales"
                        fill="#3b82f6"
                        radius={[6, 6, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default BestSellerChart