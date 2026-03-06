import SearchIcon from "@mui/icons-material/Search"

const SearchBox = ({ value, onChange }) => {
    return (
        <div className="flex items-center w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <SearchIcon className="text-gray-500 mr-2" />

            <input
                type="text"
                placeholder="Tìm kiếm..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full outline-none bg-transparent"
            />
        </div>
    )
}

export default SearchBox