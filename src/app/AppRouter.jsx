import { Route, Routes } from "react-router-dom";
import Base from "../layout/Base";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Base />} />
        </Routes>
    )
}

export default AppRouter;