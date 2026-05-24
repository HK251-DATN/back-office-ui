import { useEffect, useState } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Cell
} from "recharts"
import { DatePicker, Select, Spin } from "antd"
import dayjs from "dayjs"
import axios from "../../../services/axiosInstance"
import { API_URLS } from "../../../config/api"
import { getCategories } from "../../../services/categoryService"

const { RangePicker } = DatePicker

const COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#6366f1"
]

const BestSellerChart = () => {
    const [data, setData] = useState([])
    const [categories, setCategories] = useState([])
    const [categoryId, setCategoryId] = useState(null)
    const [dateRange, setDateRange] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getCategories()
            .then((res) => {
                const type = res.data?.type
                if (type === "GOOD" || type === "SKIP_AS_GOOD") {
                    const list = res.data.detail || []
                    setCategories(list.map((c) => ({ value: c.categoryId, label: c.name })))
                }
            })
            .catch(() => {})
    }, [])

    useEffect(() => {
        fetchBestSellers()
    }, [categoryId, dateRange])

    const fetchBestSellers = async () => {
        setLoading(true)
        try {
            const params = { limit: 10 }
            if (categoryId) params.categoryId = categoryId
            if (dateRange?.[0]) params.startDate = dateRange[0].toISOString()
            if (dateRange?.[1]) params.endDate = dateRange[1].toISOString()

            const res = await axios.get(
                `${API_URLS.ECOMMERCE}/api/orders/admin/analytics/best-selling`,
                { params }
            )
            const type = res.data?.type
            if (type === "GOOD" || type === "SKIP_AS_GOOD") {
                const list = res.data.detail || []
                setData(list.map((item) => ({
                    name: item.name,
                    sales: item.totalQuantity
                })))
            } else {
                setData([])
            }
        } catch {
            setData([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-medium text-gray-700">
                    Sản phẩm bán chạy nhất
                </h3>
                <div className="flex flex-wrap gap-2">
                    <Select
                        allowClear
                        placeholder="Tất cả danh mục"
                        options={categories}
                        value={categoryId}
                        onChange={(val) => setCategoryId(val ?? null)}
                        style={{ width: 180 }}
                        size="small"
                    />
                    <RangePicker
                        size="small"
                        value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
                        onChange={(dates) =>
                            setDateRange(dates ? [dates[0].toDate(), dates[1].toDate()] : null)
                        }
                        format="DD/MM/YYYY"
                    />
                </div>
            </div>

            <Spin spinning={loading}>
                <div style={{ height: 320 }}>
                    {data.length === 0 && !loading ? (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                            Không có dữ liệu
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11 }}
                                    angle={-35}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(value) => [value, "Số lượng"]} />
                                <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                                    {data.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </Spin>
        </div>
    )
}

export default BestSellerChart
