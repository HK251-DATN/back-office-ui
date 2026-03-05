import { useNavigate } from "react-router-dom";

const SidebarItem = ({ icon, name, link }) => {

    const navigate = useNavigate()

    return (
        <button
            className="flex flex-row w-full h-fit px-5 py-3 gap-2 hover:bg-[#F0FDF4] hover:cursor-pointer"
            onClick={() => navigate(link)}
        >
            {icon}
            <p>{name}</p>
        </button>
    )
}

export default SidebarItem;